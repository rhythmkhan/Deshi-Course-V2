import { expect, test, type Page } from '@playwright/test';

type CommercialKind = 'course' | 'product' | 'bundle';

interface ArchiveConfig {
  kind: CommercialKind;
  path: string;
  linkPrefix: string;
  ctaPattern: RegExp;
}

interface CommercialItem {
  kind: CommercialKind;
  archivePath: string;
  path: string;
  title: string;
  priceText: string;
  ctaPattern: RegExp;
}

const ARCHIVES: ArchiveConfig[] = [
  {
    kind: 'course',
    path: '/courses',
    linkPrefix: '/courses/',
    ctaPattern: /Pay করার আগে sign in করুন|Enroll করার আগে sign in করুন/,
  },
  {
    kind: 'product',
    path: '/products',
    linkPrefix: '/products/',
    ctaPattern: /Pay করার আগে sign in করুন/,
  },
  {
    kind: 'bundle',
    path: '/bundles',
    linkPrefix: '/bundles/',
    ctaPattern: /Pay করার আগে sign in করুন/,
  },
];

function normalizeDigits(value: string) {
  return value.replace(/[০-৯]/g, (digit) => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
}

function expectedPriceToken(priceText: string) {
  const normalized = normalizeDigits(priceText).toUpperCase();

  if (normalized.includes('FREE')) {
    return 'FREE';
  }

  const match = normalized.match(/\d+(?:\.\d+)?/);
  return match ? match[0].split('.')[0] : '';
}

function startDiagnostics(page: Page) {
  const issues: string[] = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();

    if (
      /favicon|Download the React DevTools|net::ERR_ABORTED/i.test(text)
    ) {
      return;
    }

    issues.push(`console error: ${text.slice(0, 300)}`);
  });

  page.on('pageerror', (error) => {
    issues.push(`page error: ${error.message.slice(0, 300)}`);
  });

  page.on('response', (response) => {
    const status = response.status();

    if (status < 500 || !isLocalUrl(response.url())) {
      return;
    }

    issues.push(`HTTP ${status}: ${toSafePath(response.url())}`);
  });

  page.on('requestfailed', (request) => {
    if (!isLocalUrl(request.url())) {
      return;
    }

    const resourceType = request.resourceType();

    if (!['document', 'script', 'stylesheet', 'image', 'fetch', 'xhr'].includes(resourceType)) {
      return;
    }

    issues.push(
      `request failed (${resourceType}): ${toSafePath(request.url())} - ${
        request.failure()?.errorText ?? 'unknown'
      }`,
    );
  });

  return issues;
}

function isLocalUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  } catch {
    return false;
  }
}

function toSafePath(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

async function collectArchiveItems(page: Page, archive: ArchiveConfig): Promise<CommercialItem[]> {
  const response = await page.goto(archive.path, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), `${archive.path} should load`).toBeLessThan(400);
  await expect(page.locator('body')).toContainText(archive.kind === 'course' ? 'কোর্স' : archive.kind === 'bundle' ? 'বান্ডেল' : 'প্রোডাক্ট');
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);

  const scraped = await page.locator('article').evaluateAll((articles, linkPrefix) => {
    return articles
      .map((article) => {
        const links = Array.from(article.querySelectorAll<HTMLAnchorElement>('a[href]'));
        const link = links.find((anchor) => {
          const path = new URL(anchor.href).pathname;
          return path.startsWith(linkPrefix as string) && path.split('/').filter(Boolean).length === 2;
        });

        if (!link) {
          return null;
        }

        const path = new URL(link.href).pathname;
        const title =
          article.querySelector('h3')?.textContent?.trim() ||
          link.textContent?.trim() ||
          path.split('/').pop() ||
          '';
        const text = article.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        const priceText = text.match(/FREE|৳\s*[\d০-৯,.]+|৳[\d۰-۹,.]+/)?.[0] ?? '';

        return { path, title, priceText };
      })
      .filter(Boolean);
  }, archive.linkPrefix);

  const seen = new Set<string>();
  const items = (scraped as Array<{ path: string; title: string; priceText: string }>)
    .filter((item) => {
      if (!item.path || !item.title || seen.has(item.path)) {
        return false;
      }

      seen.add(item.path);
      return true;
    })
    .map((item) => ({
      ...item,
      kind: archive.kind,
      archivePath: archive.path,
      ctaPattern: archive.ctaPattern,
    }));

  expect(items.length, `${archive.path} should expose commercial item links`).toBeGreaterThan(0);
  return items;
}

async function collectCommercialInventory(page: Page) {
  const inventory: CommercialItem[] = [];

  for (const archive of ARCHIVES) {
    inventory.push(...(await collectArchiveItems(page, archive)));
  }

  return inventory;
}

async function expectNoBrokenImages(page: Page) {
  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images
      .map((image) => image as HTMLImageElement)
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('alt') || image.getAttribute('src') || 'unknown image'),
  );

  expect(brokenImages).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const size = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(size.scrollWidth).toBeLessThanOrEqual(size.clientWidth + 1);
}

async function expectPriceVisible(page: Page, item: CommercialItem) {
  const token = expectedPriceToken(item.priceText);

  if (!token) {
    await expect(page.locator('body')).toContainText(/৳|FREE/);
    return;
  }

  const bodyText = normalizeDigits(await page.locator('body').innerText());
  expect(bodyText, `${item.path} should show archive price token ${token}`).toContain(token);
}

test('commercial archive pages expose working links, prices, and images', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1366, height: 900 });
  const diagnostics = startDiagnostics(page);
  const inventory = await collectCommercialInventory(page);

  expect(inventory.filter((item) => item.kind === 'course').length).toBeGreaterThan(0);
  expect(inventory.filter((item) => item.kind === 'product').length).toBeGreaterThan(0);
  expect(inventory.filter((item) => item.kind === 'bundle').length).toBeGreaterThan(0);
  await expectNoBrokenImages(page);
  expect(diagnostics).toEqual([]);
});

test('all commercial detail pages load and main payment CTA reaches safe sign-in boundary', async ({ page }) => {
  test.setTimeout(360_000);
  await page.setViewportSize({ width: 1366, height: 900 });
  const diagnostics = startDiagnostics(page);
  const inventory = await collectCommercialInventory(page);
  const failures: string[] = [];

  for (const item of inventory) {
    diagnostics.length = 0;

    try {
      const response = await page.goto(item.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status(), `${item.path} should load`).toBe(200);
      await expect(page.getByRole('heading', { name: item.title, exact: true }).first()).toBeVisible();
      await expectPriceVisible(page, item);
      await expectNoBrokenImages(page);

      const paymentButton = page.getByRole('button', { name: item.ctaPattern }).first();
      await paymentButton.scrollIntoViewIfNeeded();
      await expect(paymentButton, `${item.path} payment CTA should be visible`).toBeVisible();
      await expect(paymentButton, `${item.path} payment CTA should be enabled`).toBeEnabled();
      await paymentButton.click();
      await page.waitForURL((url) => {
        return url.pathname === '/signin' && url.searchParams.get('redirect') === item.path;
      });

      expect(diagnostics, `${item.path} should not log critical browser/network errors`).toEqual([]);
    } catch (error) {
      failures.push(`${item.kind} ${item.path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  expect(failures).toEqual([]);
});

test('representative commercial payment CTAs remain usable on mobile', async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 390, height: 844 });
  const diagnostics = startDiagnostics(page);
  const inventory = await collectCommercialInventory(page);
  const samples = [
    inventory.find((item) => item.kind === 'course'),
    inventory.find((item) => item.kind === 'product'),
    inventory.find((item) => item.kind === 'bundle'),
  ].filter((item): item is CommercialItem => Boolean(item));

  for (const item of samples) {
    diagnostics.length = 0;
    const response = await page.goto(item.path, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), `${item.path} should load on mobile`).toBe(200);

    const paymentButton = page.getByRole('button', { name: item.ctaPattern }).first();
    await paymentButton.scrollIntoViewIfNeeded();
    await expect(paymentButton).toBeVisible();
    await expect(paymentButton).toBeEnabled();
    await expectNoBrokenImages(page);
    await expectNoHorizontalOverflow(page);
    expect(diagnostics, `${item.path} mobile diagnostics should be clean`).toEqual([]);
  }
});

test('legacy template and removed category routes resolve to product archive safely', async ({ page }) => {
  await page.goto('/templates');
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.getByRole('heading', { name: 'প্রোডাক্টসমূহ' })).toBeVisible();

  await page.goto('/templates/lovable');
  await expect(page).toHaveURL(/\/products\/lovable$/);
  await expect(page.getByRole('heading', { name: 'Lovable Pro 1000 Credit বাংলাদেশ' })).toBeVisible();

  await page.goto('/categories');
  await expect(page).toHaveURL(/\/products$/);
});
