import { NextResponse } from 'next/server';
import {
  buildTelegramCouponLink,
  createCoupon,
  type CouponItemType,
  type TelegramCouponCatalogType,
  type TelegramCouponTarget,
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

type CatalogConfig = {
  label: string;
  listPath: string;
  detailPrefix: string;
  itemType: CouponItemType;
};

type TelegramCatalogItem = {
  title: string;
  path: string;
};

const TYPE_OPTIONS: Array<{ label: string; value: TelegramCouponCatalogType }> = [
  { label: 'course', value: 'course' },
  { label: 'bundle', value: 'bundle' },
  { label: 'product', value: 'product' },
];

const CATALOG_CONFIG: Record<TelegramCouponCatalogType, CatalogConfig> = {
  course: {
    label: 'course',
    listPath: '/courses',
    detailPrefix: '/courses/',
    itemType: 'course',
  },
  bundle: {
    label: 'bundle',
    listPath: '/bundles',
    detailPrefix: '/bundles/',
    itemType: 'bundle',
  },
  product: {
    label: 'product',
    listPath: '/products',
    detailPrefix: '/products/',
    itemType: 'shop',
  },
};

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

function getBaseUrl(request: Request) {
  return new URL(request.url).origin;
}

function extractJsonLdBlocks(html: string) {
  const matches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  return Array.from(matches, (match) => match[1]).filter(Boolean);
}

function parseJsonLd(html: string) {
  return extractJsonLdBlocks(html).flatMap((block) => {
    try {
      const parsed = JSON.parse(block);
      return [parsed];
    } catch {
      return [];
    }
  });
}

function flattenObjects(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) {
    return input.flatMap((entry) => flattenObjects(entry));
  }

  if (!input || typeof input !== 'object') {
    return [];
  }

  const record = input as Record<string, unknown>;

  return [
    record,
    ...Object.values(record).flatMap((value) => flattenObjects(value)),
  ];
}

function hasType(record: Record<string, unknown>, target: string) {
  const value = record['@type'];

  if (typeof value === 'string') {
    return value === target;
  }

  return Array.isArray(value) && value.includes(target);
}

function normalizePath(urlOrPath: string, baseUrl: string) {
  const url = new URL(urlOrPath, baseUrl);
  return `${url.pathname}${url.search}`;
}

async function fetchPublicPage(baseUrl: string, path: string) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url.toString(), {
    cache: 'no-store',
    headers: {
      'User-Agent': 'DeshiCourseTelegramBot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Public page fetch failed (${response.status})`);
  }

  return response.text();
}

async function fetchCatalogItems(baseUrl: string, catalogType: TelegramCouponCatalogType) {
  const config = CATALOG_CONFIG[catalogType];
  const html = await fetchPublicPage(baseUrl, config.listPath);
  const objects = parseJsonLd(html).flatMap((entry) => flattenObjects(entry));
  const itemList = objects.find((entry) => hasType(entry, 'ItemList'));
  const itemListElement = itemList?.itemListElement;

  if (!Array.isArray(itemListElement)) {
    throw new Error('Listing page structured data পাওয়া যায়নি।');
  }

  const items = itemListElement
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const name = typeof record.name === 'string' ? record.name.trim() : '';
      const url = typeof record.url === 'string' ? record.url.trim() : '';

      if (!name || !url) {
        return null;
      }

      const path = normalizePath(url, baseUrl);

      if (!path.startsWith(config.detailPrefix)) {
        return null;
      }

      return {
        title: name,
        path,
      } satisfies TelegramCatalogItem;
    })
    .filter((item): item is TelegramCatalogItem => Boolean(item));

  if (!items.length) {
    throw new Error('এই category-তে কোনো live item পাওয়া যায়নি।');
  }

  return items;
}

async function fetchItemDetail(
  baseUrl: string,
  catalogType: TelegramCouponCatalogType,
  itemPath: string,
) {
  const html = await fetchPublicPage(baseUrl, itemPath);
  const objects = parseJsonLd(html).flatMap((entry) => flattenObjects(entry));
  const productSchema = objects.find((entry) => hasType(entry, 'Product'));

  if (!productSchema) {
    throw new Error('Detail page structured data পাওয়া যায়নি।');
  }

  const title =
    typeof productSchema.name === 'string' ? productSchema.name.trim() : '';
  const schemaUrl =
    typeof productSchema.url === 'string' ? productSchema.url.trim() : itemPath;
  const priceRaw =
    productSchema.offers &&
    typeof productSchema.offers === 'object' &&
    !Array.isArray(productSchema.offers)
      ? (productSchema.offers as Record<string, unknown>).price
      : null;
  const price = Number(priceRaw);
  const path = normalizePath(schemaUrl, baseUrl);
  const slug = path.split('/').filter(Boolean).pop() ?? '';

  if (!title || !slug || !Number.isFinite(price) || price <= 0) {
    throw new Error('Detail page থেকে title/price পাওয়া যায়নি।');
  }

  return {
    catalogType,
    itemType: CATALOG_CONFIG[catalogType].itemType,
    slug,
    title,
    path,
    price,
  } satisfies TelegramCouponTarget;
}

function buildItemKeyboard(
  items: TelegramCatalogItem[],
  catalogType: TelegramCouponCatalogType,
  amount: number,
) {
  return items.map((item, index) => [
    {
      text: item.title.length > 54 ? `${item.title.slice(0, 51)}...` : item.title,
      callback_data: `pick:${catalogType}:${index}:${amount}`,
    },
  ]);
}

function parsePositiveInteger(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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

    const amount = parsePositiveInteger(text);

    if (!amount) {
      await sendTelegramMessage(config.botToken, chatId, 'শুধু valid সংখ্যা দিন (উদাহরণ: 50)।');
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      config.botToken,
      chatId,
      `ডিসকাউন্ট: ৳${amount}. কোন category-এর জন্য coupon বানাবেন?`,
      {
        inlineKeyboard: [
          TYPE_OPTIONS.map((option) => ({
            text: option.label,
            callback_data: `type:${option.value}:${amount}`,
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
    const baseUrl = getBaseUrl(request);

    if (action === 'type') {
      const catalogType = optionA as TelegramCouponCatalogType;
      const amount = parsePositiveInteger(optionB);

      if (!CATALOG_CONFIG[catalogType] || !amount) {
        await answerCallbackQuery(config.botToken, callback.id, 'Invalid request.');
        return NextResponse.json({ ok: true });
      }

      try {
        const items = await fetchCatalogItems(baseUrl, catalogType);
        await answerCallbackQuery(config.botToken, callback.id, 'Category selected.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          `${CATALOG_CONFIG[catalogType].label} list থেকে item select করুন।`,
          {
            inlineKeyboard: buildItemKeyboard(items, catalogType, amount),
          },
        );
      } catch (error) {
        await answerCallbackQuery(config.botToken, callback.id, 'Fetch failed.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          error instanceof Error
            ? error.message
            : 'Live item list fetch করা যায়নি।',
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'pick') {
      const catalogType = optionA as TelegramCouponCatalogType;
      const selectedIndex = Number(optionB);
      const amount = parsePositiveInteger(optionC);

      if (
        !CATALOG_CONFIG[catalogType] ||
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        !amount
      ) {
        await answerCallbackQuery(config.botToken, callback.id, 'Invalid selection.');
        return NextResponse.json({ ok: true });
      }

      try {
        const items = await fetchCatalogItems(baseUrl, catalogType);
        const selectedItem = items[selectedIndex];

        if (!selectedItem) {
          throw new Error('Selected item আর পাওয়া যাচ্ছে না।');
        }

        const target = await fetchItemDetail(baseUrl, catalogType, selectedItem.path);

        if (amount >= target.price) {
          throw new Error('এই discount amount item price-এর চেয়ে কম হতে হবে।');
        }

        const issuedBy = user?.username ? `@${user.username}` : String(user?.id ?? '');
        const result = await createCoupon({
          discountAmount: amount,
          target,
          issuedBy,
        });
        const link = buildTelegramCouponLink(result.code, target.path).replace(/&/g, '&amp;');

        await answerCallbackQuery(config.botToken, callback.id, 'Coupon created.');
        await sendTelegramMessage(
          config.botToken,
          callbackChatId,
          `✅ কুপন তৈরি হয়েছে\nType: ${catalogType}\nItem: ${target.title}\nকুপন: <code>${result.code}</code>\nডিসকাউন্ট: ৳${amount}\nফাইনাল প্রাইস: ৳${result.finalAmount}\nলিংক: ${link}`,
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

