import { NextResponse } from 'next/server';
import {
  buildTelegramCouponLink,
  createCoupon,
  getTelegramCouponOffer,
  type TelegramCouponProduct,
  type TelegramCouponTrack,
} from '@/lib/coupons';

type TelegramUser = {
  id: number;
  username?: string;
};

type TelegramUpdate = {
  chat_member?: {
    chat?: { id?: number | string };
    new_chat_member?: { status?: string; user?: TelegramUser };
  };
  chat_join_request?: {
    chat?: { id?: number | string };
    user?: TelegramUser;
  };
  message?: {
    chat?: { id?: number | string; type?: string };
    text?: string;
    from?: TelegramUser;
    new_chat_members?: TelegramUser[];
  };
  callback_query?: {
    id?: string;
    data?: string;
    from?: TelegramUser;
    message?: { chat?: { id?: number | string; type?: string } };
  };
};

const TRACK_OPTIONS: Array<{ label: string; value: TelegramCouponTrack }> = [
  { label: 'n8n', value: 'n8n' },
  { label: 'vibe', value: 'vibe' },
];

const PRODUCT_OPTIONS: Array<{ label: string; value: TelegramCouponProduct }> = [
  { label: 'course', value: 'course' },
  { label: 'bundle', value: 'bundle' },
  { label: 'template', value: 'template' },
];

function getEnvValue(name: string) {
  return process.env[name]?.trim() || '';
}

function parseCsv(value?: string) {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getConfig() {
  return {
    botToken: getEnvValue('TELEGRAM_BOT_TOKEN'),
    supportGroupIds: [
      getEnvValue('TELEGRAM_SUPPORT_GROUP_ID'),
      getEnvValue('TELEGRAM_VIBE_SUPPORT_GROUP_ID'),
    ].filter(Boolean),
    adminIds: parseCsv(process.env.TELEGRAM_ADMIN_IDS),
    adminUsernames: parseCsv(process.env.TELEGRAM_ADMIN_USERNAMES).map((entry) =>
      entry.replace(/^@/, '').toLowerCase(),
    ),
    webhookSecret: getEnvValue('TELEGRAM_WEBHOOK_SECRET'),
    debugEnabled: getEnvValue('TELEGRAM_WEBHOOK_DEBUG') === 'true',
  };
}

function isAdmin(user: TelegramUser | undefined, config: ReturnType<typeof getConfig>) {
  if (!user) {
    return false;
  }

  const username = user.username?.toLowerCase();

  return (
    config.adminIds.includes(String(user.id)) ||
    (username ? config.adminUsernames.includes(username) : false)
  );
}

async function sendTelegramMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  options?: {
    inlineKeyboard?: Array<Array<{ text: string; callback_data: string }>>;
    parseMode?: 'HTML';
  },
) {
  if (!botToken) {
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(options?.parseMode ? { parse_mode: options.parseMode } : {}),
        ...(options?.inlineKeyboard
          ? { reply_markup: { inline_keyboard: options.inlineKeyboard } }
          : {}),
      }),
    });
  } catch (error) {
    console.error('Telegram sendMessage failed', error);
  }
}

async function answerCallbackQuery(botToken: string, callbackId?: string, text?: string) {
  if (!botToken || !callbackId) {
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackId,
        text,
      }),
    });
  } catch (error) {
    console.error('Telegram answerCallbackQuery failed', error);
  }
}

async function approveJoinRequest(botToken: string, chatId: string | number, userId: number) {
  if (!botToken) {
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/approveChatJoinRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    });
  } catch (error) {
    console.error('Telegram join approval failed', error);
  }
}

function readChatId(update: TelegramUpdate) {
  return (
    update.chat_member?.chat?.id ??
    update.chat_join_request?.chat?.id ??
    update.message?.chat?.id ??
    null
  );
}

function readUser(update: TelegramUpdate) {
  return (
    update.chat_member?.new_chat_member?.user ??
    update.chat_join_request?.user ??
    update.message?.new_chat_members?.[0] ??
    null
  );
}

function isJoinStatus(status?: string) {
  return status === 'member' || status === 'administrator' || status === 'creator';
}

export async function POST(request: Request) {
  const config = getConfig();

  if (config.webhookSecret) {
    const headerSecret = request.headers.get('x-telegram-bot-api-secret-token');

    if (headerSecret !== config.webhookSecret) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  let payload: TelegramUpdate;

  try {
    payload = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (config.debugEnabled) {
    console.log('Telegram webhook update', JSON.stringify(payload));
  }

  const privateMessage = payload.message;

  if (privateMessage?.chat?.type === 'private' && privateMessage.chat.id) {
    const chatId = privateMessage.chat.id;
    const user = privateMessage.from;

    if (!isAdmin(user, config)) {
      await sendTelegramMessage(config.botToken, chatId, 'Unauthorized.');
      return NextResponse.json({ ok: true });
    }

    const text = privateMessage.text?.trim() ?? '';

    if (!text || text === '/start' || text === '/help') {
      await sendTelegramMessage(
        config.botToken,
        chatId,
        'ডিসকাউন্ট টাকার পরিমাণ লিখুন (উদাহরণ: 50)।',
      );
      return NextResponse.json({ ok: true });
    }

    if (!/^\d+$/.test(text)) {
      await sendTelegramMessage(config.botToken, chatId, 'শুধু সংখ্যা দিন (উদাহরণ: 50)।');
      return NextResponse.json({ ok: true });
    }

    const amount = Number(text);

    if (!Number.isFinite(amount) || amount <= 0) {
      await sendTelegramMessage(config.botToken, chatId, 'ডিসকাউন্ট ১ টাকার বেশি হতে হবে।');
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      config.botToken,
      chatId,
      `ডিসকাউন্ট: ৳${amount}. কোন track-এর জন্য coupon বানাবেন?`,
      {
        inlineKeyboard: [
          TRACK_OPTIONS.map((option) => ({
            text: option.label,
            callback_data: `track:${option.value}:${amount}`,
          })),
        ],
      },
    );

    return NextResponse.json({ ok: true });
  }

  const callback = payload.callback_query;
  const callbackChatId = callback?.message?.chat?.id;

  if (callback?.message?.chat?.type === 'private' && callbackChatId) {
    const user = callback.from;

    if (!isAdmin(user, config)) {
      await answerCallbackQuery(config.botToken, callback.id, 'Unauthorized.');
      return NextResponse.json({ ok: true });
    }

    const [action, optionA, optionB, optionC] = (callback.data ?? '').split(':');

    if (action === 'track') {
      const track = optionA as TelegramCouponTrack;
      const amount = Number(optionB);

      if (!TRACK_OPTIONS.some((entry) => entry.value === track) || !Number.isFinite(amount)) {
        await answerCallbackQuery(config.botToken, callback.id, 'Invalid track.');
        return NextResponse.json({ ok: true });
      }

      await answerCallbackQuery(config.botToken, callback.id, 'Track selected.');
      await sendTelegramMessage(
        config.botToken,
        callbackChatId,
        'কোন product-এ coupon দিবেন?',
        {
          inlineKeyboard: [
            PRODUCT_OPTIONS.map((option) => ({
              text: option.label,
              callback_data: `coupon:${track}:${option.value}:${amount}`,
            })),
          ],
        },
      );
      return NextResponse.json({ ok: true });
    }

    if (action === 'coupon') {
      const track = optionA as TelegramCouponTrack;
      const product = optionB as TelegramCouponProduct;
      const amount = Number(optionC);
      const offer = getTelegramCouponOffer(track, product);

      if (!offer) {
        await answerCallbackQuery(config.botToken, callback.id, 'Invalid target.');
        await sendTelegramMessage(config.botToken, callbackChatId, 'Coupon target invalid.');
        return NextResponse.json({ ok: true });
      }

      if (!Number.isFinite(amount) || amount <= 0 || amount >= offer.offerAmount) {
        await answerCallbackQuery(config.botToken, callback.id, 'Discount too high.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          'এই discount amount এই অফারের জন্য valid না।',
        );
        return NextResponse.json({ ok: true });
      }

      try {
        const issuedBy = user?.username ? `@${user.username}` : String(user?.id ?? '');
        const result = await createCoupon({
          discountAmount: amount,
          track,
          product,
          issuedBy,
        });
        const link = buildTelegramCouponLink(result.code, track, product).replace(/&/g, '&amp;');

        await answerCallbackQuery(config.botToken, callback.id, 'Coupon created.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          `✅ কুপন তৈরি হয়েছে\nTrack: ${track}\nProduct: ${offer.title}\nকুপন: <code>${result.code}</code>\nডিসকাউন্ট: ৳${amount}\nফাইনাল প্রাইস: ৳${result.finalAmount}\nলিংক: ${link}`,
          { parseMode: 'HTML' },
        );
      } catch (error) {
        await answerCallbackQuery(config.botToken, callback.id, 'Failed.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          error instanceof Error ? error.message : 'কুপন তৈরি করা যায়নি।',
        );
      }

      return NextResponse.json({ ok: true });
    }
  }

  const chatId = readChatId(payload);
  const user = readUser(payload);
  const status = payload.chat_member?.new_chat_member?.status;

  if (chatId && user && config.supportGroupIds.includes(String(chatId)) && (!status || isJoinStatus(status))) {
    if (payload.chat_join_request) {
      await approveJoinRequest(config.botToken, chatId, user.id);
    }
  }

  return NextResponse.json({ ok: true });
}
