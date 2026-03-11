'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';

export default function MetaPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef('');

  useEffect(() => {
    const resolvedUrl = window.location.href;

    if (!resolvedUrl || lastTrackedUrlRef.current === resolvedUrl) {
      return;
    }

    lastTrackedUrlRef.current = resolvedUrl;

    trackMetaEvent({
      eventName: 'PageView',
      eventId: generateMetaEventId('pageview'),
      eventSourceUrl: resolvedUrl,
    });
  }, [pathname, searchParams]);

  return null;
}
