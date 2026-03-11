import Script from 'next/script';
import { Suspense } from 'react';
import MetaPageTracker from '@/components/MetaPageTracker';

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID || '';

export default function MetaPixel() {
  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          (() => {
            if (window.fbq) {
              return;
            }

            const fbq = function() {
              fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
            };

            fbq.queue = [];
            fbq.push = fbq;
            fbq.loaded = true;
            fbq.version = '2.0';
            window.fbq = fbq;
            window._fbq = fbq;

            const flushPendingEvents = () => {
              const pendingEvents = window.__pendingMetaEvents || [];

              if (!pendingEvents.length) {
                return;
              }

              for (const eventArgs of pendingEvents) {
                window.fbq.apply(null, eventArgs);
              }

              window.__pendingMetaEvents = [];
            };

            const loadPixelLibrary = () => {
              if (document.getElementById('meta-pixel-sdk')) {
                flushPendingEvents();
                return;
              }

              const script = document.createElement('script');
              script.id = 'meta-pixel-sdk';
              script.async = true;
              script.src = 'https://connect.facebook.net/en_US/fbevents.js';
              script.addEventListener('load', flushPendingEvents, { once: true });
              const firstScript = document.getElementsByTagName('script')[0];
              firstScript.parentNode.insertBefore(script, firstScript);
            };

            let pixelLoaded = false;
            const schedulePixelLoad = () => {
              if (pixelLoaded) {
                return;
              }

              pixelLoaded = true;
              window.removeEventListener('pointerdown', schedulePixelLoad);
              window.removeEventListener('keydown', schedulePixelLoad);
              window.removeEventListener('touchstart', schedulePixelLoad);
              window.removeEventListener('scroll', schedulePixelLoad);
              loadPixelLibrary();
            };

            fbq('init', '${pixelId}');
            flushPendingEvents();
            window.addEventListener('pointerdown', schedulePixelLoad, { once: true, passive: true });
            window.addEventListener('keydown', schedulePixelLoad, { once: true });
            window.addEventListener('touchstart', schedulePixelLoad, { once: true, passive: true });
            window.addEventListener('scroll', schedulePixelLoad, { once: true, passive: true });
            window.setTimeout(schedulePixelLoad, 15000);
          })();
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <MetaPageTracker />
      </Suspense>
    </>
  );
}
