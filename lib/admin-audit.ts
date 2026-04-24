import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { isMissingRelationError } from '@/lib/supabase/errors';

export interface AdminAuditInput {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  summary: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function logAdminAction(input: AdminAuditInput) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('admin_audit_logs').insert({
    admin_email: input.adminEmail,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId ?? null,
    summary: input.summary,
    details: input.details ?? {},
    ip_address: input.ipAddress ?? null,
  });

  if (error && !isMissingRelationError(error, 'admin_audit_logs')) {
    throw new Error(error.message);
  }
}
