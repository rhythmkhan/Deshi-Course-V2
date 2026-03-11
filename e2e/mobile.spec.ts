import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

async function expectStacked(first: Locator, second: Locator) {
  const firstBox = await first.boundingBox();
  const secondBox = await second.boundingBox();

  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  expect(secondBox!.y).toBeGreaterThan(firstBox!.y + 4);
}

test('home page is mobile friendly', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /open navigation menu/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'এখনই শুরু করুন' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'কোর্স দেখুন' })).toBeVisible();

  const primaryAction = page.getByRole('link', { name: 'এখনই শুরু করুন' });
  const secondaryAction = page.getByRole('link', { name: 'কোর্স দেখুন' });
  await expectStacked(primaryAction, secondaryAction);

  await page.getByRole('button', { name: /open navigation menu/i }).click();
  await expect(page.locator('nav').getByRole('link', { name: 'সাইন ইন' }).last()).toBeVisible();

  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'দ্রুত লিঙ্ক' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'পরিষেবা' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'আইনি' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test('course detail page stacks purchase actions on mobile', async ({ page }) => {
  await page.goto('/courses/n8n-automation-mastery');

  await expect(page.getByRole('heading', { name: 'n8n Automation Mastery' })).toBeVisible();
  await expect(page.getByRole('button', { name: /pay/i })).toBeVisible();

  const addToCartButton = page.getByRole('button', { name: 'সাইন ইন' });
  const referCenterLink = page.getByRole('link', { name: 'Refer সেন্টার' });
  await expect(addToCartButton).toBeVisible();
  await expect(referCenterLink).toBeVisible();
  await expectStacked(addToCartButton, referCenterLink);

  await expectNoHorizontalOverflow(page);
});

test('blog detail page keeps the subscription form mobile friendly', async ({ page }) => {
  await page.goto('/blog/bedrock-agentcore-and-production-agents');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const emailInput = page.getByPlaceholder('আপনার ইমেইল এড্রেস');
  const submitButton = page.getByRole('button', { name: 'সাবস্ক্রাইব' });

  await emailInput.scrollIntoViewIfNeeded();
  await expect(emailInput).toBeVisible();
  await expect(submitButton).toBeVisible();
  await expectStacked(emailInput, submitButton);

  await expectNoHorizontalOverflow(page);
});

test('signin page is usable on mobile', async ({ page }) => {
  await page.goto('/signin');

  await expect(page.getByRole('heading', { name: 'স্বাগতম!' })).toBeVisible();
  await expect(page.getByPlaceholder('আপনার ইমেইল লিখুন')).toBeVisible();
  await expect(page.getByPlaceholder('আপনার পাসওয়ার্ড লিখুন')).toBeVisible();

  await expectNoHorizontalOverflow(page);
});
