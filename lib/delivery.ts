import 'server-only';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { revokeDriveTargetAccess, shareDriveTargetWithUser } from '@/lib/google-drive';
import {
  createTelegramInviteLinkForCourse,
  createTelegramSupportInviteLinkForCourse,
  createTelegramSupportInviteLinkForOrderAndCourse,
  createTelegramTemplateInviteLinkForCourse,
  type TelegramCourseTrack,
} from '@/lib/telegram';
import { resolveDeliveryRequirements } from '@/lib/order-delivery';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingRelationError } from '@/lib/supabase/errors';

type ItemType = 'course' | 'bundle' | 'shop';
type DeliveryChannel = 'telegram_invite' | 'google_drive_share' | 'email_template';
type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'retrying'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface DeliveryRuleRow {
  id: string;
  item_type: ItemType;
  item_slug: string;
  channel: DeliveryChannel;
  position: number;
  is_active: boolean;
  config: Record<string, unknown> | null;
}

interface DeliveryJobRow {
  id: string;
  entitlement_id: string;
  order_id: string | null;
  user_id: string;
  rule_id: string | null;
  item_type: ItemType;
  item_slug: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  attempt_count: number;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
}

interface EntitlementRow {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_slug: string;
  item_title: string;
  order_id: string | null;
}

interface ProfileRow {
  full_name: string | null;
  email: string | null;
}

function hashObject(value: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(value ?? {})).digest('hex').slice(0, 12);
}

function asObject(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function renderTemplate(template: string, variables: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return variables[key] ?? '';
  });
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.APP_URL?.trim() || 'http://localhost:3000';
}

function buildLegacyTelegramRulePayload(input: {
  track: TelegramCourseTrack;
  resource: 'course' | 'support' | 'template';
}) {
  return {
    track: input.track,
    resource: input.resource,
  };
}

function buildLegacyRules(itemType: ItemType, itemSlug: string) {
  const requirements = resolveDeliveryRequirements([
    {
      itemType,
      slug: itemSlug,
      title: itemSlug,
    },
  ]);

  const rules: DeliveryRuleRow[] = [];

  for (const [track, resources] of requirements.entries()) {
    Array.from(resources).forEach((resource, index) => {
      rules.push({
        id: `legacy-${itemType}-${itemSlug}-${track}-${resource}`,
        item_type: itemType,
        item_slug: itemSlug,
        channel: 'telegram_invite',
        position: index,
        is_active: true,
        config: buildLegacyTelegramRulePayload({
          track,
          resource,
        }),
      });
    });
  }

  return rules;
}

async function listRulesForItem(itemType: ItemType, itemSlug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('delivery_rules')
    .select('id, item_type, item_slug, channel, position, is_active, config')
    .eq('item_type', itemType)
    .eq('item_slug', itemSlug)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error && !isMissingRelationError(error, 'delivery_rules')) {
    throw new Error(error.message);
  }

  const rules = (data as DeliveryRuleRow[] | null) ?? [];
  return rules.length > 0 ? rules : buildLegacyRules(itemType, itemSlug);
}

async function refreshEntitlementDeliveryState(entitlementId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('delivery_jobs')
    .select('status')
    .eq('entitlement_id', entitlementId);

  if (error && !isMissingRelationError(error, 'delivery_jobs')) {
    throw new Error(error.message);
  }

  const rows = (data as Array<{ status: DeliveryStatus }> | null) ?? [];

  if (rows.length === 0) {
    await supabase
      .from('user_entitlements')
      .update({ delivery_state: 'not_required' })
      .eq('id', entitlementId);
    return;
  }

  const statuses = rows.map((row) => row.status);
  let deliveryState = 'pending';

  if (statuses.every((status) => status === 'completed')) {
    deliveryState = 'complete';
  } else if (statuses.some((status) => status === 'processing' || status === 'retrying')) {
    deliveryState = 'processing';
  } else if (statuses.some((status) => status === 'failed') && statuses.some((status) => status === 'completed')) {
    deliveryState = 'partial';
  } else if (statuses.every((status) => status === 'failed' || status === 'cancelled')) {
    deliveryState = 'failed';
  }

  await supabase
    .from('user_entitlements')
    .update({ delivery_state: deliveryState })
    .eq('id', entitlementId);
}

async function appendTelegramDeliveryLinkToOrder(params: {
  orderId: string;
  track: TelegramCourseTrack;
  resource: 'course' | 'support' | 'template';
  url: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('orders')
    .select('metadata')
    .eq('id', params.orderId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const metadata = asObject(data?.metadata);
  const deliveryLinks = asObject(metadata.deliveryLinks);
  const trackLinks = asObject(deliveryLinks[params.track]);

  const updatedTrackLinks = {
    ...trackLinks,
    [params.resource]: params.url,
    [`${params.resource}CreatedAt`]: Date.now(),
  };

  const nextDeliveryLinks = {
    ...deliveryLinks,
    [params.track]: updatedTrackLinks,
  };

  const flattened = {
    telegramInviteLink:
      typeof updatedTrackLinks.course === 'string'
        ? updatedTrackLinks.course
        : metadata.telegramInviteLink,
    supportTelegramInviteLink:
      typeof updatedTrackLinks.support === 'string'
        ? updatedTrackLinks.support
        : metadata.supportTelegramInviteLink,
    templateTelegramInviteLink:
      typeof updatedTrackLinks.template === 'string'
        ? updatedTrackLinks.template
        : metadata.templateTelegramInviteLink,
  };

  await supabase
    .from('orders')
    .update({
      metadata: {
        ...metadata,
        deliveryLinks: nextDeliveryLinks,
        ...flattened,
      },
    })
    .eq('id', params.orderId);
}

async function createTelegramInvite(params: {
  orderId: string | null;
  track: TelegramCourseTrack;
  resource: 'course' | 'support' | 'template';
}) {
  if (params.resource === 'course') {
    return createTelegramInviteLinkForCourse(params.track);
  }

  if (params.resource === 'template') {
    return createTelegramTemplateInviteLinkForCourse(params.track);
  }

  if (params.orderId) {
    const invite = await createTelegramSupportInviteLinkForOrderAndCourse(
      params.orderId,
      params.track,
    );

    if (invite.success && invite.inviteLink) {
      return invite;
    }
  }

  return createTelegramSupportInviteLinkForCourse(params.track);
}

async function processTelegramJob(job: DeliveryJobRow, profile: ProfileRow, ruleConfig: Record<string, unknown>) {
  const track =
    ruleConfig.track === 'vibe' ? 'vibe' : 'n8n';
  const resource =
    ruleConfig.resource === 'support' || ruleConfig.resource === 'template'
      ? ruleConfig.resource
      : 'course';

  const invite = await createTelegramInvite({
    orderId: job.order_id,
    track,
    resource,
  });

  if (!invite.success || !invite.inviteLink) {
    throw new Error(invite.error || 'Telegram invite link তৈরি করা যায়নি।');
  }

  if (job.order_id) {
    await appendTelegramDeliveryLinkToOrder({
      orderId: job.order_id,
      track,
      resource,
      url: invite.inviteLink,
    });
  }

  return {
    url: invite.inviteLink,
    track,
    resource,
    customerEmail: profile.email ?? '',
  };
}

async function processDriveJob(job: DeliveryJobRow, profile: ProfileRow, ruleConfig: Record<string, unknown>) {
  if (!profile.email) {
    throw new Error('Google Drive access দিতে customer email দরকার।');
  }

  const targetId = typeof ruleConfig.targetId === 'string' ? ruleConfig.targetId : '';
  const targetType =
    ruleConfig.targetType === 'folder' ? 'folder' : 'file';

  if (!targetId) {
    throw new Error('Drive target ID missing.');
  }

  const result = await shareDriveTargetWithUser({
    targetId,
    targetType,
    email: profile.email,
    role:
      ruleConfig.role === 'commenter' || ruleConfig.role === 'writer'
        ? ruleConfig.role
        : 'reader',
    sendNotificationEmail:
      typeof ruleConfig.sendNotificationEmail === 'boolean'
        ? ruleConfig.sendNotificationEmail
        : false,
  });

  const supabase = createAdminClient();
  await supabase.from('drive_access_records').upsert(
    {
      job_id: job.id,
      entitlement_id: job.entitlement_id,
      user_id: job.user_id,
      item_type: job.item_type,
      item_slug: job.item_slug,
      drive_target_type: targetType,
      drive_target_id: targetId,
      role:
        ruleConfig.role === 'commenter' || ruleConfig.role === 'writer'
          ? ruleConfig.role
          : 'reader',
      permission_id: result.permissionId || null,
      access_email: profile.email,
      status: 'active',
      last_error: null,
    },
    { onConflict: 'entitlement_id,drive_target_id,access_email' },
  );

  return {
    targetId,
    targetType,
    permissionId: result.permissionId,
  };
}

async function processEmailJob(
  job: DeliveryJobRow,
  entitlement: EntitlementRow,
  profile: ProfileRow,
  ruleConfig: Record<string, unknown>,
) {
  if (!profile.email) {
    throw new Error('Email delivery দিতে customer email দরকার।');
  }

  const variables = {
    user_name: profile.full_name || 'শিক্ষার্থী',
    user_email: profile.email,
    item_title: entitlement.item_title,
    item_slug: entitlement.item_slug,
    order_id: entitlement.order_id ?? '',
    dashboard_url: `${getAppUrl()}/dashboard`,
  };
  const subjectTemplate =
    typeof ruleConfig.subject === 'string' && ruleConfig.subject
      ? ruleConfig.subject
      : '{{item_title}} access instructions';
  const htmlTemplate =
    typeof ruleConfig.html === 'string' && ruleConfig.html
      ? ruleConfig.html
      : `<p>Hi {{user_name}},</p><p>{{item_title}} access: {{dashboard_url}}</p>`;
  const textTemplate =
    typeof ruleConfig.text === 'string' && ruleConfig.text
      ? ruleConfig.text
      : 'Hi {{user_name}}, {{item_title}} access: {{dashboard_url}}';

  const subject = renderTemplate(subjectTemplate, variables);
  const html = renderTemplate(htmlTemplate, variables);
  const text = renderTemplate(textTemplate, variables);

  await sendEmail({
    to: profile.email,
    subject,
    html,
    text,
  });

  return {
    sentTo: profile.email,
    subject,
  };
}

async function recordAttempt(jobId: string, input: {
  status: string;
  providerReference?: string | null;
  requestPayload?: Record<string, unknown>;
  responsePayload?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const supabase = createAdminClient();
  await supabase.from('delivery_attempts').insert({
    job_id: jobId,
    status: input.status,
    provider_reference: input.providerReference ?? null,
    request_payload: input.requestPayload ?? {},
    response_payload: input.responsePayload ?? {},
    error_message: input.errorMessage ?? null,
  });
}

export async function enqueueDeliveryJobsForEntitlement(entitlementId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('id, user_id, item_type, item_slug, item_title, order_id')
    .eq('id', entitlementId)
    .single();

  if (error) {
    if (isMissingRelationError(error, 'user_entitlements')) {
      return [];
    }

    throw new Error(error.message);
  }

  const entitlement = data as EntitlementRow;
  const rules = await listRulesForItem(entitlement.item_type, entitlement.item_slug);

  if (rules.length === 0) {
    await refreshEntitlementDeliveryState(entitlement.id);
    return [];
  }

  const jobs: DeliveryJobRow[] = [];

  for (const rule of rules) {
    const payload = {
      config: rule.config ?? {},
      rulePosition: rule.position,
    };
    const idempotencyKey = `${entitlement.id}:${rule.channel}:${hashObject(payload)}`;

    const { data: jobData, error: jobError } = await supabase
      .from('delivery_jobs')
      .upsert(
        {
          entitlement_id: entitlement.id,
          order_id: entitlement.order_id,
          user_id: entitlement.user_id,
          rule_id: rule.id.startsWith('legacy-') ? null : rule.id,
          item_type: entitlement.item_type,
          item_slug: entitlement.item_slug,
          channel: rule.channel,
          status: 'pending',
          idempotency_key: idempotencyKey,
          payload,
          available_at: new Date().toISOString(),
        },
        { onConflict: 'idempotency_key' },
      )
      .select(
        'id, entitlement_id, order_id, user_id, rule_id, item_type, item_slug, channel, status, attempt_count, payload, result',
      )
      .single();

    if (jobError) {
      if (isMissingRelationError(jobError, 'delivery_jobs')) {
        return [];
      }

      throw new Error(jobError.message);
    }

    jobs.push(jobData as DeliveryJobRow);
  }

  await refreshEntitlementDeliveryState(entitlement.id);
  return jobs;
}

export async function processDeliveryJob(jobId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('delivery_jobs')
    .select(
      'id, entitlement_id, order_id, user_id, rule_id, item_type, item_slug, channel, status, attempt_count, payload, result',
    )
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const job = data as DeliveryJobRow;

  if (job.status === 'completed' || job.status === 'cancelled') {
    return job;
  }

  const { data: entitlementData, error: entitlementError } = await supabase
    .from('user_entitlements')
    .select('id, user_id, item_type, item_slug, item_title, order_id')
    .eq('id', job.entitlement_id)
    .single();

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', job.user_id)
    .single();

  const entitlement = entitlementData as EntitlementRow;
  const profile = (profileData as ProfileRow | null) ?? {
    full_name: null,
    email: null,
  };
  const payload = asObject(job.payload);
  const ruleConfig = asObject(payload.config);

  await supabase
    .from('delivery_jobs')
    .update({
      status: 'processing',
      attempt_count: job.attempt_count + 1,
      last_attempt_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  try {
    let result: Record<string, unknown>;

    if (job.channel === 'telegram_invite') {
      result = await processTelegramJob(job, profile, ruleConfig);
    } else if (job.channel === 'google_drive_share') {
      result = await processDriveJob(job, profile, ruleConfig);
    } else {
      result = await processEmailJob(job, entitlement, profile, ruleConfig);
    }

    await recordAttempt(job.id, {
      status: 'completed',
      requestPayload: payload,
      responsePayload: result,
      providerReference:
        typeof result.permissionId === 'string'
          ? result.permissionId
          : typeof result.url === 'string'
            ? result.url
            : null,
    });

    await supabase
      .from('delivery_jobs')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', job.id);

    await refreshEntitlementDeliveryState(job.entitlement_id);

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Delivery failed';
    const nextStatus: DeliveryStatus =
      job.attempt_count + 1 >= 3 ? 'failed' : 'retrying';

    await recordAttempt(job.id, {
      status: nextStatus,
      requestPayload: payload,
      errorMessage: message,
    });

    await supabase
      .from('delivery_jobs')
      .update({
        status: nextStatus,
        last_error: message,
        available_at:
          nextStatus === 'retrying'
            ? new Date(Date.now() + Math.min(60, job.attempt_count + 1) * 60_000).toISOString()
            : new Date().toISOString(),
      })
      .eq('id', job.id);

    const driveTargetId =
      typeof ruleConfig.targetId === 'string' ? ruleConfig.targetId : '';

    if (job.channel === 'google_drive_share' && driveTargetId) {
      await supabase.from('drive_access_records').upsert(
        {
          job_id: job.id,
          entitlement_id: job.entitlement_id,
          user_id: job.user_id,
          item_type: job.item_type,
          item_slug: job.item_slug,
          drive_target_type: ruleConfig.targetType === 'folder' ? 'folder' : 'file',
          drive_target_id: driveTargetId,
          role:
            ruleConfig.role === 'commenter' || ruleConfig.role === 'writer'
              ? ruleConfig.role
              : 'reader',
          permission_id: null,
          access_email: profile.email ?? '',
          status: 'failed',
          last_error: message,
        },
        { onConflict: 'entitlement_id,drive_target_id,access_email' },
      );
    }

    await refreshEntitlementDeliveryState(job.entitlement_id);
    throw error;
  }
}

export async function processPendingDeliveryJobs(limit = 10) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('delivery_jobs')
    .select(
      'id, entitlement_id, order_id, user_id, rule_id, item_type, item_slug, channel, status, attempt_count, payload, result',
    )
    .in('status', ['pending', 'retrying'])
    .lte('available_at', new Date().toISOString())
    .order('available_at', { ascending: true })
    .limit(limit);

  if (error) {
    if (isMissingRelationError(error, 'delivery_jobs')) {
      return [];
    }

    throw new Error(error.message);
  }

  const jobs = (data as DeliveryJobRow[] | null) ?? [];
  const results: Array<{ jobId: string; ok: boolean; error?: string }> = [];

  for (const job of jobs) {
    try {
      await processDeliveryJob(job.id);
      results.push({ jobId: job.id, ok: true });
    } catch (error) {
      results.push({
        jobId: job.id,
        ok: false,
        error: error instanceof Error ? error.message : 'Delivery failed',
      });
    }
  }

  return results;
}

export async function retryDeliveryJob(jobId: string) {
  const supabase = createAdminClient();
  await supabase
    .from('delivery_jobs')
    .update({
      status: 'pending',
      available_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('id', jobId);

  return processDeliveryJob(jobId);
}

export async function revokeProvisionedAccess(entitlementId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('drive_access_records')
    .select('id, drive_target_id, permission_id')
    .eq('entitlement_id', entitlementId)
    .eq('status', 'active');

  if (error && !isMissingRelationError(error, 'drive_access_records')) {
    throw new Error(error.message);
  }

  const activeRecords =
    (data as Array<{ id: string; drive_target_id: string; permission_id: string | null }> | null) ?? [];

  for (const record of activeRecords) {
    if (!record.permission_id) {
      continue;
    }

    await revokeDriveTargetAccess({
      targetId: record.drive_target_id,
      permissionId: record.permission_id,
    });

    await supabase
      .from('drive_access_records')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', record.id);
  }
}
