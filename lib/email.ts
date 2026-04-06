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
  invoiceId?: string;
  items: OrderEmailItem[];
  total: number;
  courseUrl?: string;
  deliveryLinks?: OrderDeliveryEmailLink[];
  status?: 'paid' | 'free-enrollment';
}

interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface AdminOrderLifecycleEmailInput {
  status: 'created' | 'cancelled';
  orderId: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  invoiceId?: string;
  total: number;
  items: OrderEmailItem[];
  paymentUrl?: string;
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

function renderMetaRows(
  rows: Array<{
    label: string;
    value: string;
  }>,
) {
  return `
    <div style="margin-top:20px;padding:16px 18px;background:#faf5ff;border:1px solid #ede9fe;border-radius:18px;">
      ${rows
        .map(
          (row, index) => `
            <div style="padding:${index === 0 ? '0 0 10px' : '10px 0'};${index < rows.length - 1 ? 'border-bottom:1px solid #e9ddff;' : ''}">
              <div style="font-size:12px;line-height:1.5;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#7c3aed;">${escapeHtml(row.label)}</div>
              <div style="margin-top:4px;font-size:15px;line-height:1.7;color:#111827;font-weight:600;word-break:break-word;">${escapeHtml(row.value)}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderOrderItems(items: OrderEmailItem[]) {
  return `
    <div style="margin-top:22px;">
      ${items
        .map(
          (item) => `
            <div style="margin-top:12px;padding:16px 18px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;">
              <div style="font-size:16px;line-height:1.6;font-weight:700;color:#111827;word-break:break-word;">${escapeHtml(item.title)}</div>
              <div style="margin-top:10px;font-size:13px;line-height:1.6;color:#6b7280;text-transform:capitalize;">${escapeHtml(item.type)}</div>
              <div style="margin-top:8px;font-size:16px;line-height:1.6;font-weight:800;color:#111827;">${escapeHtml(formatPrice(item.price))}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
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
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <div style="margin:0;padding:0;background:#f6f3ff;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#f6f3ff;">
        <tr>
          <td style="padding:16px 12px;">
            <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ede9fe;">
              <div style="padding:24px 20px;background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);color:#ffffff;">
          <div style="font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;opacity:0.82;">${escapeHtml(SITE_NAME)}</div>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(title)}</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.88);">${escapeHtml(intro)}</p>
              </div>
              <div style="padding:24px 20px;">
          ${body}
          ${ctaLabel && ctaUrl ? `
            <div style="margin-top:24px;">
              <a href="${ctaUrl}" style="display:block;width:100%;max-width:280px;box-sizing:border-box;padding:15px 20px;border-radius:14px;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;text-align:center;">
                ${escapeHtml(ctaLabel)}
              </a>
            </div>
          ` : ''}
          <div style="margin-top:28px;padding-top:18px;border-top:1px solid #ede9fe;font-size:13px;line-height:1.8;color:#6b7280;">
            ${footerNote ? escapeHtml(footerNote) : `কোনো সমস্যা হলে ${escapeHtml(getMailConfig().from)} অথবা WhatsApp support-এ যোগাযোগ করুন।`}
          </div>
              </div>
            </div>
          </td>
        </tr>
      </table>
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
  status = 'paid',
}: OrderEmailInput) {
  const isFreeEnrollment = status === 'free-enrollment';
  const customerName = fullName?.trim() || 'শিক্ষার্থী';
  const safeDeliveryLinks = deliveryLinks.filter(
    (link) => typeof link.label === 'string' && typeof link.url === 'string' && link.url,
  );
  const primaryActionUrl = safeDeliveryLinks[0]?.url || courseUrl || `${SITE_URL}/dashboard`;
  const primaryActionLabel =
    safeDeliveryLinks[0]?.label || (courseUrl ? 'কোর্সে যান' : 'ড্যাশবোর্ডে যান');
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
  const customerMetaRows = [
    { label: 'Order ID', value: orderId },
    ...(invoiceId ? [{ label: 'Invoice ID', value: invoiceId }] : []),
    { label: isFreeEnrollment ? 'Total paid' : 'Total', value: formatPrice(total) },
  ];
  const adminMetaRows = [
    { label: 'Customer', value: customerName },
    { label: 'Email', value: to },
    { label: 'Order ID', value: orderId },
    ...(invoiceId ? [{ label: 'Invoice ID', value: invoiceId }] : []),
    { label: isFreeEnrollment ? 'Total paid' : 'Total', value: formatPrice(total) },
  ];

  const customerHtml = renderEmailShell({
    preheader: isFreeEnrollment
      ? `${SITE_NAME}-এ আপনার free enrollment active হয়েছে`
      : `${SITE_NAME}-এ আপনার পেমেন্ট সফল হয়েছে`,
    title: isFreeEnrollment ? 'Enrollment সফল হয়েছে' : 'পেমেন্ট সফল হয়েছে',
    intro: isFreeEnrollment
      ? `${customerName}, আপনার free course enrollment confirm হয়েছে। access এখন active হওয়ার কথা।`
      : `${customerName}, আপনার order confirm হয়েছে। access এখন active হওয়ার কথা।`,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;">
        ${isFreeEnrollment
          ? 'আপনার free course enrollment আমরা successful হিসেবে record করেছি। নিচে access summary দেওয়া হলো।'
          : 'ধন্যবাদ। আপনার payment আমরা successful হিসেবে record করেছি। নিচে order summary দেওয়া হলো।'}
      </p>
      ${renderMetaRows(customerMetaRows)}
      ${renderOrderItems(items)}
      ${deliveryLinksHtml}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:#6b7280;">
        ${isFreeEnrollment
          ? 'Dashboard-এ ঢুকে আপনার course access এবং unlocked links দেখতে পারবেন।'
          : 'Dashboard-এ ঢুকে আপনার course access, referral panel, এবং purchase history দেখতে পারবেন।'}
      </p>
    `,
    ctaLabel: primaryActionLabel,
    ctaUrl: primaryActionUrl,
  });
  const customerText = [
    isFreeEnrollment
      ? `${SITE_NAME} - free enrollment successful`
      : `${SITE_NAME} - payment successful`,
    '',
    isFreeEnrollment
      ? `${customerName}, আপনার free course enrollment confirm হয়েছে।`
      : `${customerName}, আপনার order confirm হয়েছে।`,
    `Order ID: ${orderId}`,
    ...(invoiceId ? [`Invoice ID: ${invoiceId}`] : []),
    `${isFreeEnrollment ? 'Total paid' : 'Total'}: ${formatPrice(total)}`,
    '',
    'Items:',
    orderLinesText,
    ...deliveryLinksText,
    '',
    `Access link: ${primaryActionUrl}`,
  ].join('\n');

  const adminHtml = renderEmailShell({
    preheader: isFreeEnrollment
      ? `New free enrollment received: ${orderId}`
      : `New paid order received: ${orderId}`,
    title: isFreeEnrollment ? 'নতুন free enrollment এসেছে' : 'নতুন paid order এসেছে',
    intro: `Customer email: ${to}`,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;">
        ${isFreeEnrollment
          ? 'নতুন একটি free enrollment complete হয়েছে।'
          : 'নতুন একটি payment successful হয়েছে।'}
      </p>
      ${renderMetaRows(adminMetaRows)}
      ${renderOrderItems(items)}
      ${deliveryLinksHtml}
    `,
    ctaLabel: 'ড্যাশবোর্ড খুলুন',
    ctaUrl: `${SITE_URL}/dashboard`,
  });
  const adminText = [
    isFreeEnrollment ? 'New free enrollment received' : 'New paid order received',
    '',
    `Customer: ${customerName}`,
    `Email: ${to}`,
    `Order ID: ${orderId}`,
    ...(invoiceId ? [`Invoice ID: ${invoiceId}`] : []),
    `${isFreeEnrollment ? 'Total paid' : 'Total'}: ${formatPrice(total)}`,
    '',
    'Items:',
    orderLinesText,
    ...deliveryLinksText,
  ].join('\n');

  await Promise.all([
    sendEmail({
      to,
      subject: isFreeEnrollment
        ? `${SITE_NAME}: আপনার enrollment active হয়েছে`
        : `${SITE_NAME}: আপনার payment সফল হয়েছে`,
      html: customerHtml,
      text: customerText,
    }),
    sendEmail({
      to: getMailConfig().from,
      subject: isFreeEnrollment
        ? `${SITE_NAME}: New free enrollment ${orderId}`
        : `${SITE_NAME}: New paid order ${orderId}`,
      html: adminHtml,
      text: adminText,
      replyTo: to,
    }),
  ]);
}

export async function sendAdminOrderLifecycleEmail({
  status,
  orderId,
  buyerName,
  buyerEmail,
  buyerPhone,
  invoiceId,
  total,
  items,
  paymentUrl,
}: AdminOrderLifecycleEmailInput) {
  const isCreated = status === 'created';
  const statusLabel = isCreated ? 'pending order create হয়েছে' : 'payment cancel হয়েছে';
  const title = isCreated ? 'নতুন pending order এসেছে' : 'একটি payment cancel হয়েছে';
  const subject = isCreated
    ? `${SITE_NAME}: New pending order ${orderId}`
    : `${SITE_NAME}: Payment cancelled ${orderId}`;
  const intro = buyerEmail
    ? `Customer email: ${buyerEmail}`
    : `Order reference: ${orderId}`;
  const metaRows = [
    { label: 'Order ID', value: orderId },
    { label: 'Status', value: statusLabel },
    { label: 'Total', value: formatPrice(total) },
  ];

  if (buyerName) {
    metaRows.splice(0, 0, { label: 'Customer', value: buyerName });
  }

  if (buyerEmail) {
    metaRows.splice(buyerName ? 1 : 0, 0, { label: 'Email', value: buyerEmail });
  }

  if (buyerPhone) {
    metaRows.push({ label: 'Phone', value: buyerPhone });
  }

  if (invoiceId) {
    metaRows.push({ label: 'Invoice ID', value: invoiceId });
  }

  if (paymentUrl) {
    metaRows.push({ label: 'Payment URL', value: paymentUrl });
  }

  const html = renderEmailShell({
    preheader: `${title} - ${orderId}`,
    title,
    intro,
    body: `
      <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;">
        ${isCreated ? 'Customer payment শুরু করেছে।' : 'Customer payment flow থেকে cancel page-এ গেছে।'}
      </p>
      ${renderMetaRows(metaRows)}
      ${renderOrderItems(items)}
    `,
    ctaLabel: isCreated ? 'ড্যাশবোর্ড খুলুন' : undefined,
    ctaUrl: isCreated ? `${SITE_URL}/dashboard` : undefined,
  });

  const text = [
    title,
    '',
    `Order ID: ${orderId}`,
    `Status: ${statusLabel}`,
    buyerName ? `Customer: ${buyerName}` : null,
    buyerEmail ? `Email: ${buyerEmail}` : null,
    buyerPhone ? `Phone: ${buyerPhone}` : null,
    invoiceId ? `Invoice ID: ${invoiceId}` : null,
    `Total: ${formatPrice(total)}`,
    paymentUrl ? `Payment URL: ${paymentUrl}` : null,
    '',
    'Items:',
    ...items.map((item) => `- ${item.title} (${item.type}) — ${formatPrice(item.price)}`),
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');

  await sendEmail({
    to: getMailConfig().from,
    subject,
    html,
    text,
    replyTo: buyerEmail,
  });
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
