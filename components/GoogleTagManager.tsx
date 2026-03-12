import Script from 'next/script';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-N2SRSVDK';

export default function GoogleTagManager() {
  if (!GTM_ID) {
    return null;
  }

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (() => {
            const gtmId = '${GTM_ID}';
            let loaded = false;

            const loadGtm = () => {
              if (loaded) {
                return;
              }

              loaded = true;
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

              const firstScript = document.getElementsByTagName('script')[0];
              const script = document.createElement('script');
              const dl = 'dataLayer' !== 'dataLayer' ? '&l=dataLayer' : '';
              script.async = true;
              script.src = 'https://www.googletagmanager.com/gtm.js?id=' + gtmId + dl;
              firstScript?.parentNode?.insertBefore(script, firstScript);

              window.removeEventListener('pointerdown', loadGtm);
              window.removeEventListener('keydown', loadGtm);
              window.removeEventListener('scroll', loadGtm);
            };

            window.addEventListener('pointerdown', loadGtm, { once: true, passive: true });
            window.addEventListener('keydown', loadGtm, { once: true });
          })();
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
