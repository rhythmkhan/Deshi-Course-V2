import { NextResponse } from 'next/server';
import type { CatalogArtTheme } from '@/lib/catalog-art';

const themePalette: Record<CatalogArtTheme, { bgA: string; bgB: string; accent: string; accentSoft: string }> = {
  video: { bgA: '#0f172a', bgB: '#1d4ed8', accent: '#f97316', accentSoft: '#fed7aa' },
  ai: { bgA: '#111827', bgB: '#6d28d9', accent: '#38bdf8', accentSoft: '#bae6fd' },
  money: { bgA: '#052e16', bgB: '#166534', accent: '#facc15', accentSoft: '#fef08a' },
  security: { bgA: '#0f172a', bgB: '#1e293b', accent: '#22c55e', accentSoft: '#bbf7d0' },
  business: { bgA: '#172554', bgB: '#312e81', accent: '#f97316', accentSoft: '#fed7aa' },
  youtube: { bgA: '#450a0a', bgB: '#991b1b', accent: '#f87171', accentSoft: '#fecaca' },
  app: { bgA: '#0f172a', bgB: '#0369a1', accent: '#22d3ee', accentSoft: '#cffafe' },
  code: { bgA: '#111827', bgB: '#1f2937', accent: '#a855f7', accentSoft: '#e9d5ff' },
  verify: { bgA: '#0f172a', bgB: '#14532d', accent: '#4ade80', accentSoft: '#bbf7d0' },
  design: { bgA: '#581c87', bgB: '#7c3aed', accent: '#f472b6', accentSoft: '#fbcfe8' },
  wordpress: { bgA: '#082f49', bgB: '#0c4a6e', accent: '#38bdf8', accentSoft: '#bae6fd' },
  bundle: { bgA: '#312e81', bgB: '#5b21b6', accent: '#f59e0b', accentSoft: '#fde68a' },
  tool: { bgA: '#111827', bgB: '#334155', accent: '#f59e0b', accentSoft: '#fde68a' },
  anime: { bgA: '#3b0764', bgB: '#1d4ed8', accent: '#fb7185', accentSoft: '#fecdd3' },
};

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > 22 && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, 3);
}

function renderIcon(theme: CatalogArtTheme) {
  switch (theme) {
    case 'video':
      return `
        <rect x="775" y="218" width="230" height="156" rx="26" fill="#0F172A" fill-opacity="0.78" stroke="white" stroke-opacity="0.14" />
        <path d="M870 258L952 296L870 334V258Z" fill="white" />
        <rect x="748" y="420" width="284" height="84" rx="28" fill="#0F172A" fill-opacity="0.64" />
        <rect x="784" y="452" width="172" height="18" rx="9" fill="white" fill-opacity="0.26" />
      `;
    case 'ai':
      return `
        <circle cx="884" cy="298" r="110" fill="#0F172A" fill-opacity="0.72" />
        <circle cx="884" cy="298" r="54" fill="none" stroke="white" stroke-opacity="0.8" stroke-width="16" />
        <circle cx="884" cy="298" r="10" fill="white" />
        <path d="M884 204V158M884 438V392M978 298H1024M744 298H790M952 230L986 196M782 366L748 400M952 366L986 400M782 230L748 196" stroke="white" stroke-width="12" stroke-linecap="round" />
      `;
    case 'money':
      return `
        <circle cx="842" cy="274" r="84" fill="#0F172A" fill-opacity="0.72" />
        <circle cx="944" cy="362" r="98" fill="#0F172A" fill-opacity="0.62" />
        <text x="808" y="292" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="700">$</text>
        <text x="906" y="384" fill="white" font-family="Arial, sans-serif" font-size="72" font-weight="700">$</text>
      `;
    case 'security':
      return `
        <path d="M884 176L1016 232V330C1016 410 960 482 884 516C808 482 752 410 752 330V232L884 176Z" fill="#0F172A" fill-opacity="0.72" />
        <path d="M884 274C851 274 824 301 824 334V376H944V334C944 301 917 274 884 274Z" fill="white" fill-opacity="0.18" />
        <rect x="812" y="330" width="144" height="116" rx="26" fill="white" fill-opacity="0.85" />
        <path d="M884 360V406" stroke="#0F172A" stroke-width="14" stroke-linecap="round" />
      `;
    case 'business':
      return `
        <rect x="756" y="432" width="80" height="122" rx="18" fill="#0F172A" fill-opacity="0.7" />
        <rect x="858" y="366" width="80" height="188" rx="18" fill="#0F172A" fill-opacity="0.7" />
        <rect x="960" y="288" width="80" height="266" rx="18" fill="#0F172A" fill-opacity="0.7" />
        <path d="M748 272L826 232L902 274L1012 196" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
      `;
    case 'youtube':
      return `
        <rect x="756" y="214" width="286" height="196" rx="38" fill="#0F172A" fill-opacity="0.72" />
        <path d="M866 262L954 312L866 362V262Z" fill="white" />
        <path d="M764 486H1028" stroke="white" stroke-opacity="0.28" stroke-width="18" stroke-linecap="round" />
        <path d="M764 548H954" stroke="white" stroke-opacity="0.18" stroke-width="18" stroke-linecap="round" />
      `;
    case 'app':
      return `
        <rect x="780" y="182" width="208" height="404" rx="38" fill="#0F172A" fill-opacity="0.72" />
        <rect x="812" y="238" width="144" height="244" rx="22" fill="white" fill-opacity="0.12" />
        <circle cx="884" cy="526" r="14" fill="white" fill-opacity="0.72" />
        <path d="M722 292L758 258L722 224M1046 224L1082 258L1046 292" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
      `;
    case 'code':
      return `
        <rect x="746" y="196" width="296" height="340" rx="34" fill="#0F172A" fill-opacity="0.72" />
        <path d="M824 282L770 336L824 390M964 282L1018 336L964 390" stroke="white" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M902 252L870 420" stroke="white" stroke-width="14" stroke-linecap="round" />
      `;
    case 'verify':
      return `
        <circle cx="884" cy="308" r="132" fill="#0F172A" fill-opacity="0.72" />
        <path d="M820 308L866 354L954 262" stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
        <rect x="784" y="470" width="200" height="58" rx="29" fill="white" fill-opacity="0.16" />
      `;
    case 'design':
      return `
        <path d="M812 224H956C995 224 1026 255 1026 294V438C1026 477 995 508 956 508H812C773 508 742 477 742 438V294C742 255 773 224 812 224Z" fill="#0F172A" fill-opacity="0.72" />
        <circle cx="808" cy="292" r="24" fill="white" fill-opacity="0.2" />
        <circle cx="884" cy="292" r="24" fill="white" fill-opacity="0.42" />
        <circle cx="960" cy="292" r="24" fill="white" fill-opacity="0.68" />
        <path d="M784 422C822 382 854 360 890 360C932 360 964 392 996 440" stroke="white" stroke-width="16" stroke-linecap="round" />
      `;
    case 'wordpress':
      return `
        <rect x="744" y="198" width="300" height="332" rx="32" fill="#0F172A" fill-opacity="0.72" />
        <rect x="778" y="240" width="232" height="40" rx="20" fill="white" fill-opacity="0.12" />
        <rect x="778" y="312" width="108" height="176" rx="22" fill="white" fill-opacity="0.08" />
        <rect x="902" y="312" width="108" height="80" rx="22" fill="white" fill-opacity="0.18" />
        <rect x="902" y="408" width="108" height="80" rx="22" fill="white" fill-opacity="0.18" />
      `;
    case 'bundle':
      return `
        <rect x="778" y="210" width="212" height="132" rx="28" fill="#0F172A" fill-opacity="0.48" />
        <rect x="748" y="276" width="272" height="164" rx="32" fill="#0F172A" fill-opacity="0.62" />
        <rect x="718" y="360" width="332" height="188" rx="36" fill="#0F172A" fill-opacity="0.76" />
        <path d="M810 454H958" stroke="white" stroke-width="18" stroke-linecap="round" />
      `;
    case 'tool':
      return `
        <rect x="742" y="210" width="300" height="336" rx="34" fill="#0F172A" fill-opacity="0.72" />
        <path d="M818 256L966 404" stroke="white" stroke-width="18" stroke-linecap="round" />
        <path d="M966 256L818 404" stroke="white" stroke-width="18" stroke-linecap="round" />
        <rect x="796" y="450" width="192" height="52" rx="26" fill="white" fill-opacity="0.14" />
      `;
    case 'anime':
      return `
        <circle cx="828" cy="268" r="68" fill="#0F172A" fill-opacity="0.64" />
        <circle cx="948" cy="332" r="96" fill="#0F172A" fill-opacity="0.72" />
        <path d="M798 268H858M918 332H978" stroke="white" stroke-width="18" stroke-linecap="round" />
        <path d="M888 226L946 284M888 438L946 380" stroke="white" stroke-width="18" stroke-linecap="round" />
      `;
    default:
      return '';
  }
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = escapeXml(searchParams.get('title') || 'Catalog Item');
  const badge = escapeXml(searchParams.get('badge') || 'Deshi Course');
  const theme = (searchParams.get('theme') as CatalogArtTheme) || 'ai';
  const palette = themePalette[theme] || themePalette.ai;
  const titleLines = splitTitle(title);

  const svg = `
    <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="800" rx="48" fill="${palette.bgA}" />
      <rect x="36" y="36" width="1128" height="728" rx="36" fill="url(#bg)" />
      <circle cx="1012" cy="172" r="120" fill="${palette.accent}" fill-opacity="0.16" />
      <circle cx="236" cy="632" r="168" fill="${palette.accentSoft}" fill-opacity="0.18" />
      <rect x="118" y="110" width="278" height="54" rx="27" fill="white" fill-opacity="0.14" />
      <text x="154" y="145" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="700">${badge}</text>
      <text x="118" y="264" fill="white" font-family="Arial, sans-serif" font-size="64" font-weight="700">${titleLines[0] || ''}</text>
      <text x="118" y="334" fill="${palette.accentSoft}" font-family="Arial, sans-serif" font-size="60" font-weight="700">${titleLines[1] || ''}</text>
      <text x="118" y="396" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="28">${titleLines[2] || ''}</text>
      ${renderIcon(theme)}
      <defs>
        <linearGradient id="bg" x1="76" y1="64" x2="1116" y2="736" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.bgA}" />
          <stop offset="1" stop-color="${palette.bgB}" />
        </linearGradient>
      </defs>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
