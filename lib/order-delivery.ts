import 'server-only';
import {
  createTelegramInviteLinkForCourse,
  createTelegramSupportInviteLinkForCourse,
  createTelegramSupportInviteLinkForOrderAndCourse,
  createTelegramTemplateInviteLinkForCourse,
  type TelegramCourseTrack,
} from '@/lib/telegram';

export type DeliveryTrack = TelegramCourseTrack | 'direct';
export type DeliveryResource = 'course' | 'support' | 'template';

export interface DeliveryItem {
  itemType: 'course' | 'bundle' | 'shop';
  slug: string;
  title: string;
}

export interface DeliveryLink {
  track: DeliveryTrack;
  resource: DeliveryResource;
  label: string;
  url: string;
}

type StoredTrackLinks = Partial<Record<DeliveryResource, string>> & {
  courseCreatedAt?: number;
  supportCreatedAt?: number;
  templateCreatedAt?: number;
};

type StoredDeliveryLinks = Partial<Record<TelegramCourseTrack, StoredTrackLinks>>;
type StoredCustomDeliveryLink = Pick<DeliveryLink, 'resource' | 'label' | 'url'>;

const STATIC_DELIVERY_RULES: Array<{
  itemType: DeliveryItem['itemType'];
  slug: string;
  links: StoredCustomDeliveryLink[];
}> = [
  {
    itemType: 'course',
    slug: 'phone-ai-video-editing',
    links: [
      {
        resource: 'course',
        label: 'Phone AI Video Editing Telegram channel',
        url: 'https://t.me/+b9zQj02sqmU5YzY1',
      },
    ],
  },
];

const DELIVERY_RULES: Array<{
  track: TelegramCourseTrack;
  itemType: DeliveryItem['itemType'];
  slug: string;
  resources: DeliveryResource[];
}> = [
  {
    track: 'n8n',
    itemType: 'course',
    slug: 'n8n-automation-mastery',
    resources: ['course', 'support'],
  },
  {
    track: 'n8n',
    itemType: 'bundle',
    slug: 'n8n-course-plus-templates',
    resources: ['course', 'support', 'template'],
  },
  {
    track: 'n8n',
    itemType: 'bundle',
    slug: 'ai-career-duo-bundle',
    resources: ['course', 'support'],
  },
  {
    track: 'n8n',
    itemType: 'bundle',
    slug: 'creator-launch-bundle',
    resources: ['course', 'support', 'template'],
  },
  {
    track: 'n8n',
    itemType: 'shop',
    slug: 'n8n-20k-templates',
    resources: ['template'],
  },
  {
    track: 'vibe',
    itemType: 'course',
    slug: 'vibe-coding-mastery',
    resources: ['course', 'support'],
  },
  {
    track: 'vibe',
    itemType: 'bundle',
    slug: 'vibe-coding-prompt-library',
    resources: ['course', 'support', 'template'],
  },
  {
    track: 'vibe',
    itemType: 'bundle',
    slug: 'ai-career-duo-bundle',
    resources: ['course', 'support'],
  },
  {
    track: 'vibe',
    itemType: 'bundle',
    slug: 'creator-launch-bundle',
    resources: ['course', 'support', 'template'],
  },
  {
    track: 'vibe',
    itemType: 'shop',
    slug: 'prompt-ui-library',
    resources: ['template'],
  },
];

function getCreatedAtKey(resource: DeliveryResource) {
  if (resource === 'course') {
    return 'courseCreatedAt';
  }

  if (resource === 'support') {
    return 'supportCreatedAt';
  }

  return 'templateCreatedAt';
}

function cloneStoredTrackLinks(input?: StoredTrackLinks): StoredTrackLinks {
  return {
    ...(input?.course ? { course: input.course } : {}),
    ...(input?.support ? { support: input.support } : {}),
    ...(input?.template ? { template: input.template } : {}),
    ...(typeof input?.courseCreatedAt === 'number'
      ? { courseCreatedAt: input.courseCreatedAt }
      : {}),
    ...(typeof input?.supportCreatedAt === 'number'
      ? { supportCreatedAt: input.supportCreatedAt }
      : {}),
    ...(typeof input?.templateCreatedAt === 'number'
      ? { templateCreatedAt: input.templateCreatedAt }
      : {}),
  };
}

function buildDeliveryLinkKey(link: DeliveryLink) {
  return `${link.track}:${link.resource}:${link.url}`;
}

function dedupeDeliveryLinks(links: DeliveryLink[]) {
  const seen = new Set<string>();
  const output: DeliveryLink[] = [];

  for (const link of links) {
    const key = buildDeliveryLinkKey(link);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(link);
  }

  return output;
}

function normalizeStoredDeliveryLinks(input: unknown): StoredDeliveryLinks {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const raw = input as Record<string, unknown>;
  const output: StoredDeliveryLinks = {};

  for (const track of ['n8n', 'vibe'] as const) {
    const value = raw[track];

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      continue;
    }

    const trackValue = value as Record<string, unknown>;
    output[track] = {
      ...(typeof trackValue.course === 'string' ? { course: trackValue.course } : {}),
      ...(typeof trackValue.support === 'string'
        ? { support: trackValue.support }
        : {}),
      ...(typeof trackValue.template === 'string'
        ? { template: trackValue.template }
        : {}),
      ...(typeof trackValue.courseCreatedAt === 'number'
        ? { courseCreatedAt: trackValue.courseCreatedAt }
        : {}),
      ...(typeof trackValue.supportCreatedAt === 'number'
        ? { supportCreatedAt: trackValue.supportCreatedAt }
        : {}),
      ...(typeof trackValue.templateCreatedAt === 'number'
        ? { templateCreatedAt: trackValue.templateCreatedAt }
        : {}),
    };
  }

  return output;
}

function normalizeCustomDeliveryLinks(input: unknown) {
  if (!Array.isArray(input)) {
    return [] as DeliveryLink[];
  }

  const output: DeliveryLink[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }

    const rawEntry = entry as Record<string, unknown>;
    const resource = rawEntry.resource;
    const label = rawEntry.label;
    const url = rawEntry.url;

    if (
      (resource !== 'course' && resource !== 'support' && resource !== 'template') ||
      typeof label !== 'string' ||
      !label ||
      typeof url !== 'string' ||
      !url
    ) {
      continue;
    }

    output.push({
      track: 'direct',
      resource,
      label,
      url,
    });
  }

  return dedupeDeliveryLinks(output);
}

function resolveStaticDeliveryLinks(items: DeliveryItem[]) {
  return dedupeDeliveryLinks(
    items.flatMap((item) =>
      STATIC_DELIVERY_RULES.filter(
        (entry) => entry.itemType === item.itemType && entry.slug === item.slug,
      ).flatMap((entry) =>
        entry.links.map((link) => ({
          track: 'direct' as const,
          ...link,
        })),
      ),
    ),
  );
}

function getResourceLabel(track: DeliveryTrack, resource: DeliveryResource) {
  if (track === 'direct') {
    return resource === 'support'
      ? 'Direct support access'
      : resource === 'template'
        ? 'Direct resource access'
        : 'Direct course access';
  }

  const prefix = track === 'vibe' ? 'Vibe Coding' : 'n8n Automation';

  if (resource === 'course') {
    return `${prefix} Telegram channel`;
  }

  if (resource === 'support') {
    return `${prefix} support group`;
  }

  return `${prefix} resource library`;
}

function flattenStoredDeliveryLinks(storedLinks: StoredDeliveryLinks): DeliveryLink[] {
  const output: DeliveryLink[] = [];

  for (const track of ['n8n', 'vibe'] as const) {
    const trackLinks = storedLinks[track];

    if (!trackLinks) {
      continue;
    }

    for (const resource of ['course', 'support', 'template'] as const) {
      const url = trackLinks[resource];

      if (!url) {
        continue;
      }

      output.push({
        track,
        resource,
        label: getResourceLabel(track, resource),
        url,
      });
    }
  }

  return output;
}

function buildJoinedLinks(
  links: DeliveryLink[],
  resource: DeliveryResource,
) {
  return links
    .filter((link) => link.resource === resource)
    .map((link) => `${link.label}: ${link.url}`)
    .join('\n');
}

export function resolveDeliveryRequirements(items: DeliveryItem[]) {
  const requirements = new Map<TelegramCourseTrack, Set<DeliveryResource>>();

  for (const item of items) {
    const matchingRules = DELIVERY_RULES.filter(
      (entry) => entry.itemType === item.itemType && entry.slug === item.slug,
    );

    if (matchingRules.length === 0) {
      continue;
    }

    for (const rule of matchingRules) {
      const trackResources =
        requirements.get(rule.track) ?? new Set<DeliveryResource>();

      for (const resource of rule.resources) {
        trackResources.add(resource);
      }

      requirements.set(rule.track, trackResources);
    }
  }

  return requirements;
}

export function getDeliveryLinksFromMetadata(metadata: Record<string, unknown>) {
  const storedLinks = normalizeStoredDeliveryLinks(metadata.deliveryLinks);
  const customLinks = normalizeCustomDeliveryLinks(metadata.customDeliveryLinks);
  return dedupeDeliveryLinks([
    ...flattenStoredDeliveryLinks(storedLinks),
    ...customLinks,
  ]);
}

export function getDeliverySheetValues(links: DeliveryLink[]) {
  return {
    courseLinks: buildJoinedLinks(links, 'course'),
    supportLinks: buildJoinedLinks(links, 'support'),
    templateLinks: buildJoinedLinks(links, 'template'),
  };
}

export async function ensureTelegramDeliveryLinks({
  orderId,
  items,
  metadata,
}: {
  orderId: string;
  items: DeliveryItem[];
  metadata: Record<string, unknown>;
}) {
  const requirements = resolveDeliveryRequirements(items);
  const storedLinks = normalizeStoredDeliveryLinks(metadata.deliveryLinks);
  const storedCustomLinks = normalizeCustomDeliveryLinks(metadata.customDeliveryLinks);
  const staticLinks = resolveStaticDeliveryLinks(items);
  const nextStoredLinks: StoredDeliveryLinks = {
    ...(storedLinks.n8n ? { n8n: cloneStoredTrackLinks(storedLinks.n8n) } : {}),
    ...(storedLinks.vibe ? { vibe: cloneStoredTrackLinks(storedLinks.vibe) } : {}),
  };
  const nextCustomLinks = dedupeDeliveryLinks([
    ...storedCustomLinks,
    ...staticLinks,
  ]);
  const errors: string[] = [];
  const storedCustomKeys = new Set(storedCustomLinks.map(buildDeliveryLinkKey));
  let changed = nextCustomLinks.some(
    (link) => !storedCustomKeys.has(buildDeliveryLinkKey(link)),
  );

  for (const [track, resources] of requirements.entries()) {
    const trackLinks = cloneStoredTrackLinks(nextStoredLinks[track]);

    for (const resource of resources) {
      if (trackLinks[resource]) {
        continue;
      }

      const inviteResult =
        resource === 'course'
          ? await createTelegramInviteLinkForCourse(track)
          : resource === 'template'
            ? await createTelegramTemplateInviteLinkForCourse(track)
            : await createTelegramSupportInviteLinkForOrderAndCourse(orderId, track);

      if (
        resource === 'support' &&
        (!inviteResult.success || !inviteResult.inviteLink)
      ) {
        const fallbackInvite = await createTelegramSupportInviteLinkForCourse(track);

        if (fallbackInvite.success && fallbackInvite.inviteLink) {
          trackLinks.support = fallbackInvite.inviteLink;
          trackLinks.supportCreatedAt = Date.now();
          changed = true;
          continue;
        }

        if (fallbackInvite.error) {
          errors.push(fallbackInvite.error);
        }

        if (inviteResult.error) {
          errors.push(inviteResult.error);
        }

        continue;
      }

      if (inviteResult.success && inviteResult.inviteLink) {
        trackLinks[resource] = inviteResult.inviteLink;
        trackLinks[getCreatedAtKey(resource)] = Date.now();
        changed = true;
      } else if (inviteResult.error) {
        errors.push(inviteResult.error);
      }
    }

    if (Object.keys(trackLinks).length > 0) {
      nextStoredLinks[track] = trackLinks;
    }
  }

  const links = dedupeDeliveryLinks([
    ...flattenStoredDeliveryLinks(nextStoredLinks),
    ...nextCustomLinks,
  ]);
  const nextMetadata: Record<string, unknown> =
    changed || metadata.deliveryLinks || metadata.customDeliveryLinks
      ? {
          ...metadata,
          ...(Object.keys(nextStoredLinks).length > 0 || metadata.deliveryLinks
            ? { deliveryLinks: nextStoredLinks }
            : {}),
          ...(nextCustomLinks.length > 0 || metadata.customDeliveryLinks
            ? {
                customDeliveryLinks: nextCustomLinks.map((link) => ({
                  resource: link.resource,
                  label: link.label,
                  url: link.url,
                })),
              }
            : {}),
          telegramInviteLink:
            buildJoinedLinks(links, 'course') ||
            buildJoinedLinks(links, 'template'),
          supportTelegramInviteLink: buildJoinedLinks(links, 'support'),
          templateTelegramInviteLink: buildJoinedLinks(links, 'template'),
        }
      : metadata;

  return {
    links,
    metadata: nextMetadata,
    changed,
    errors,
  };
}
