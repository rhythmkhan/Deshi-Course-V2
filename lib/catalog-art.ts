export type CatalogArtTheme =
  | 'video'
  | 'ai'
  | 'money'
  | 'security'
  | 'business'
  | 'youtube'
  | 'app'
  | 'code'
  | 'verify'
  | 'design'
  | 'wordpress'
  | 'bundle'
  | 'tool'
  | 'anime';

export function buildCatalogArt(title: string, theme: CatalogArtTheme, badge: string) {
  const params = new URLSearchParams({
    title,
    theme,
    badge,
  });

  return `/api/catalog-art?${params.toString()}`;
}
