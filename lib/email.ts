import nodemailer from 'nodemailer';
import { SITE_NAME } from '@/lib/seo';
import { SITE_URL } from '@/lib/site-url';

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface OrderEmailItem {
  title: string;
  type: 'course' | 'bundle' | 'shop';
  price: number;
}

export interface OrderDeliveryEmailLink {
  label: string;
  url: string;
}

interface OrderEmailInput {
  to: string;
  fullName?: string;
  orderId: string;
  invoiceId: string;
  items: OrderEmailItem[];
  total: number;
  courseUrl?: string;
  deliveryLinks?: OrderDeliveryEmailLink[];
}

interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

let cachedTransporter: nodemailer.Transporter | null = null;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(value: number) {
  return `৳ ${value.toFixed(2)}`;
}

function getMailConfig() {
  return {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 0),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  };
}

export function isSmtpConfigured() {
  const config = getMailConfig();

  return Boolean(config.host && config.port && config.user && config.pass && config.from);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP configuration is missing');
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = getMailConfig();

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return cachedTransporter;
}

function renderEmailShell({
  preheader,
  title,
  intro,
  body,
  ctaLabel,
  ctaUrl,
  footerNote,
}: {
  preheader: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <div style="margin:0;padding:24px;background:#f6f3ff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ede9fe;">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);color:#ffffff;">
          <div style="font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.82;">${escapeHtml(SITE_NAME)}</div>
          <h1 style="margin:12px 0 0;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.88);">${escapeHtml(intro)}</p>
        </div>
        <div style="padding:32px;">
          ${body}
          ${ctaLabel && ctaUrl ? `
            <div style="margin-top:28px;">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;border-radius:14px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;">
                ${escapeHtml(ctaLabel)}
              </a>
            </div>
          ` : ''}
          <div style="margin-top:32px;padding-top:20px;border-top:1px solid #ede9fe;font-size:13px;line-height:1.7;color:#6b7280;">
            ${footerNote ? escapeHtml(footerNote) : `কোনো সমস্যা হলে ${escapeHtml(getMailConfig().from)} অথবা WhatsApp support-এ যোগাযোগ করুন।`}
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput) {
  const config = getMailConfig();

  if (!config.from) {
    throw new Error('SMTP_FROM is missing');
  }

  const transporter = getTransporter();

  return transporter.sendMail({
    from: `${SITE_NAME} <${config.from}>`,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}

export async function verifySmtpConnection() {
  const transporter = getTransporter();
  return transporter.verify();
}

export async function sendOrderConfirmationEmails({
  to,
  fullName,
  orderId,
  invoiceId,
  items,
  total,
  courseUrl,
  deliveryLinks = [],
}: OrderEmailInput) {
  const customerName = fullName?.trim() || 'শিক্ষার্থী';
  const safeDeliveryLinks = deliveryLinks.filter(
    (link) => typeof link.label === 'string' && typeof link.url === 'string' && link.url,
  );
  const primaryActionUrl = safeDeliveryLinks[0]?.url || courseUrl || `${SITE_URL}/dashboard`;
  const primaryActionLabel =
    safeDeliveryLinks[0]?.label || (courseUrl ? 'কোর্সে যান' : 'ড্যাশবোর্ডে যান');
  const orderLinesHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">${escapeHtml(item.title)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-transform:capitalize;color:#6b7280;">${escapeHtml(item.type)}</td>
          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:700;">${escapeHtml(formatPrice(item.price))}</td>
        </tr>
      `,
    )
    .join('');
  const orderLinesText = items
    .map((item) => `- ${item.title} (${item.type}) — ${formatPrice(item.price)}`)
    .join('\n');
  const deliveryLinksHtml = safeDeliveryLinks.length
    ? `
      <div style="margin-top:24px;padding:18px 20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:18px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827;">Delivery links</p>
        <div style="display:grid;gap:10px;">
          ${safeDeliveryLinks
            .map(
              (link) => `
                <a href="${link.url}" style="display:block;padding:12px 14px;border-radius:14px;background:#ffffff;border:1px solid #e5e7eb;color:#111827;text-decoration:none;">
                  <strong>${escapeHtml(link.label)}:</strong> ${escapeHtml(link.url)}
                </a>
              `,
            )
            .join('')}
        </div>
      </div>
    `
    : '';
  const deliveryLinksText = safeDeliveryLinks.length
    ? ['', 'Delivery links:', ...safeDeliveryLinks.map((link) => `- ${link.label}: ${link.url}`)]
    : [];

  const customerHtml = renderEmailShell({
    preheader: `${SITE_NAME}-এ আপনার পেমেন্ট সফল হয়েছে`,
    title: 'পেমেন্ট সফল হয়েছে',
    intro: `${customerName}, আপনার order confirm হয়েছে। access এখন active হওয়ার কথা।`,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;">
        ধন্যবাদ। আপনার payment আমরা successful হিসেবে record করেছি। নিচে order summary দেওয়া হলো।
      </p>
      <div style="padding:18px 20px;background:#faf5ff;border:1px solid #ede9fe;border-radius:18px;">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:14px;line-height:1.7;">
          <div><strong>Order ID:</strong> ${escapeHtml(orderId)}</div>
          <div><strong>Invoice ID:</strong> ${escapeHtml(invoiceId)}</div>
          <div><strong>Total:</strong> ${escapeHtml(formatPrice(total))}</div>
        </div>
      </div>
      <table style="width:100%;margin-top:24px;border-collapse:collapse;font-size:14px;line-height:1.6;color:#111827;">
        <thead>
          <tr>
            <th style="padding-bottom:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Item</th>
            <th style="padding-bottom:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Type</th>
            <th style="padding-bottom:10px;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Price</th>
          </tr>
        </thead>
        <tbody>${orderLinesHtml}</tbody>
      </table>
      ${deliveryLinksHtml}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#6b7280;">
        Dashboard-এ ঢুকে আপনার course access, referral panel, এবং purchase history দেখতে পারবেন।
      </p>
    `,
    ctaLabel: primaryActionLabel,
    ctaUrl: primaryActionUrl,
  });
  const customerText = [
    `${SITE_NAME} - payment successful`,
    '',
    `${customerName}, আপনার order confirm হয়েছে।`,
    `Order ID: ${orderId}`,
    `Invoice ID: ${invoiceId}`,
    `Total: ${formatPrice(total)}`,
    '',
    'Items:',
    orderLinesText,
    ...deliveryLinksText,
    '',
    `Access link: ${primaryActionUrl}`,
  ].join('\n');

  const adminHtml = renderEmailShell({
    preheader: `New paid order received: ${orderId}`,
    title: 'নতুন paid order এসেছে',
    intro: `Customer email: ${to}`,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;">
        নতুন একটি payment successful হয়েছে।
      </p>
      <div style="padding:18px 20px;background:#faf5ff;border:1px solid #ede9fe;border-radius:18px;">
        <div style="font-size:14px;line-height:1.8;">
          <div><strong>Customer:</strong> ${escapeHtml(customerName)}</div>
          <div><strong>Email:</strong> ${escapeHtml(to)}</div>
          <div><strong>Order ID:</strong> ${escapeHtml(orderId)}</div>
          <div><strong>Invoice ID:</strong> ${escapeHtml(invoiceId)}</div>
          <div><strong>Total:</strong> ${escapeHtml(formatPrice(total))}</div>
        </div>
      </div>
      <table style="width:100%;margin-top:24px;border-collapse:collapse;font-size:14px;line-height:1.6;color:#111827;">
        <thead>
          <tr>
            <th style="padding-bottom:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Item</th>
            <th style="padding-bottom:10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Type</th>
            <th style="padding-bottom:10px;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Price</th>
          </tr>
        </thead>
        <tbody>${orderLinesHtml}</tbody>
      </table>
      ${deliveryLinksHtml}
    `,
    ctaLabel: 'ড্যাশবোর্ড খুলুন',
    ctaUrl: `${SITE_URL}/dashboard`,
  });
  const adminText = [
    'New paid order received',
    '',
    `Customer: ${customerName}`,
    `Email: ${to}`,
    `Order ID: ${orderId}`,
    `Invoice ID: ${invoiceId}`,
    `Total: ${formatPrice(total)}`,
    '',
    'Items:',
    orderLinesText,
    ...deliveryLinksText,
  ].join('\n');

  await Promise.all([
    sendEmail({
      to,
      subject: `${SITE_NAME}: আপনার payment সফল হয়েছে`,
      html: customerHtml,
      text: customerText,
    }),
    sendEmail({
      to: getMailConfig().from,
      subject: `${SITE_NAME}: New paid order ${orderId}`,
      html: adminHtml,
      text: adminText,
      replyTo: to,
    }),
  ]);
}

export async function sendContactEmails({
  name,
  email,
  subject,
  message,
}: ContactEmailInput) {
  const safeName = name.trim();
  const safeEmail = email.trim();
  const safeSubject = subject.trim();
  const safeMessage = message.trim();

  const adminHtml = renderEmailShell({
    preheader: `New contact message from ${safeName}`,
    title: 'নতুন contact message এসেছে',
    intro: `${safeName} (${safeEmail}) contact form submit করেছে।`,
    body: `
      <div style="padding:18px 20px;background:#faf5ff;border:1px solid #ede9fe;border-radius:18px;">
        <div style="font-size:14px;line-height:1.8;">
          <div><strong>Name:</strong> ${escapeHtml(safeName)}</div>
          <div><strong>Email:</strong> ${escapeHtml(safeEmail)}</div>
          <div><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        </div>
      </div>
      <div style="margin-top:20px;padding:18px 20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;font-size:15px;line-height:1.9;color:#374151;white-space:pre-wrap;">
        ${escapeHtml(safeMessage)}
      </div>
    `,
    ctaLabel: 'Reply করুন',
    ctaUrl: `mailto:${encodeURIComponent(safeEmail)}?subject=${encodeURIComponent(`Re: ${safeSubject}`)}`,
  });
  const adminText = [
    'New contact form message',
    '',
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Subject: ${safeSubject}`,
    '',
    safeMessage,
  ].join('\n');

  const customerHtml = renderEmailShell({
    preheader: `${SITE_NAME} support request received`,
    title: 'আপনার message আমরা পেয়েছি',
    intro: `${safeName}, আপনার message support team-এর কাছে পৌঁছেছে।`,
    body: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#374151;">
        আমরা সাধারণত যত দ্রুত সম্ভব reply দেওয়ার চেষ্টা করি। আপনার submitted বিষয় ও বার্তা নিচে দেওয়া হলো।
      </p>
      <div style="padding:18px 20px;background:#faf5ff;border:1px solid #ede9fe;border-radius:18px;">
        <div style="font-size:14px;line-height:1.8;">
          <div><strong>Subject:</strong> ${escapeHtml(safeSubject)}</div>
        </div>
      </div>
      <div style="margin-top:20px;padding:18px 20px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;font-size:15px;line-height:1.9;color:#374151;white-space:pre-wrap;">
        ${escapeHtml(safeMessage)}
      </div>
    `,
    ctaLabel: 'WhatsApp Support',
    ctaUrl: 'https://wa.me/8801813896400',
  });
  const customerText = [
    `${SITE_NAME} support request received`,
    '',
    `${safeName}, আপনার message আমরা পেয়েছি।`,
    `Subject: ${safeSubject}`,
    '',
    safeMessage,
    '',
    'WhatsApp support: https://wa.me/8801813896400',
  ].join('\n');

  await Promise.all([
    sendEmail({
      to: getMailConfig().from,
      subject: `${SITE_NAME} Contact: ${safeSubject}`,
      html: adminHtml,
      text: adminText,
      replyTo: safeEmail,
    }),
    sendEmail({
      to: safeEmail,
      subject: `${SITE_NAME}: আপনার message আমরা পেয়েছি`,
      html: customerHtml,
      text: customerText,
    }),
  ]);
}
