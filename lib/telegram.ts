import 'server-only';

export type TelegramCourseTrack = 'n8n' | 'vibe';

export type TelegramInviteResult = {
  success: boolean;
  inviteLink?: string;
  error?: string;
};

type TelegramInviteResponse = {
  ok?: boolean;
  result?: { invite_link?: string };
  description?: string;
};

function getEnvValue(name: string) {
  return process.env[name]?.trim() || '';
}

function getTelegramConfig() {
  return {
    botToken: getEnvValue('TELEGRAM_BOT_TOKEN'),
    channelId: getEnvValue('TELEGRAM_CHANNEL_ID'),
    supportGroupId: getEnvValue('TELEGRAM_SUPPORT_GROUP_ID'),
    templateChannelId: getEnvValue('TELEGRAM_TEMPLATE_CHANNEL_ID'),
    vibeChannelId: getEnvValue('TELEGRAM_VIBE_CHANNEL_ID'),
    vibeTemplateChannelId: getEnvValue('TELEGRAM_VIBE_TEMPLATE_CHANNEL_ID'),
    vibeSupportGroupId: getEnvValue('TELEGRAM_VIBE_SUPPORT_GROUP_ID'),
  };
}

const createInviteLink = async (
  chatId: string | undefined,
  missingError: string,
  options?: { name?: string; createsJoinRequest?: boolean },
): Promise<TelegramInviteResult> => {
  const { botToken } = getTelegramConfig();

  if (!botToken || !chatId) {
    return { success: false, error: missingError };
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        member_limit: 1,
        ...(options?.name ? { name: options.name } : {}),
        ...(options?.createsJoinRequest ? { creates_join_request: true } : {}),
      }),
      cache: 'no-store',
    });

    const json = (await response.json()) as TelegramInviteResponse;

    if (!response.ok || !json?.ok) {
      return {
        success: false,
        error: json?.description ?? `Telegram API responded with status ${response.status}`,
      };
    }

    const inviteLink = json?.result?.invite_link;

    if (!inviteLink || typeof inviteLink !== 'string') {
      return { success: false, error: 'Telegram invite link missing.' };
    }

    return { success: true, inviteLink };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Telegram API request failed.',
    };
  }
};

function resolveCourseChatIds(track?: TelegramCourseTrack) {
  const config = getTelegramConfig();

  if (track === 'vibe') {
    return {
      channelId: config.vibeChannelId,
      supportGroupId: config.vibeSupportGroupId,
      templateChannelId: config.vibeTemplateChannelId,
    };
  }

  return {
    channelId: config.channelId,
    supportGroupId: config.supportGroupId,
    templateChannelId: config.templateChannelId,
  };
}

export const createTelegramInviteLinkForCourse = async (
  track?: TelegramCourseTrack,
): Promise<TelegramInviteResult> => {
  const { channelId } = resolveCourseChatIds(track);

  return createInviteLink(
    channelId,
    'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID.',
  );
};

export const createTelegramSupportInviteLinkForCourse = async (
  track?: TelegramCourseTrack,
): Promise<TelegramInviteResult> => {
  const { supportGroupId } = resolveCourseChatIds(track);

  return createInviteLink(
    supportGroupId,
    'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_SUPPORT_GROUP_ID.',
  );
};

export const createTelegramSupportInviteLinkForOrderAndCourse = async (
  orderId: string,
  track?: TelegramCourseTrack,
): Promise<TelegramInviteResult> => {
  const { supportGroupId } = resolveCourseChatIds(track);

  return createInviteLink(
    supportGroupId,
    'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_SUPPORT_GROUP_ID.',
    { name: orderId },
  );
};

export const createTelegramTemplateInviteLinkForCourse = async (
  track?: TelegramCourseTrack,
): Promise<TelegramInviteResult> => {
  const { templateChannelId } = resolveCourseChatIds(track);

  return createInviteLink(
    templateChannelId,
    'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_TEMPLATE_CHANNEL_ID.',
  );
};
