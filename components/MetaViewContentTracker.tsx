'use client';

import { useEffect, useRef } from 'react';
import { generateMetaEventId, trackMetaEvent } from '@/lib/meta-client';
import type { MetaCustomData } from '@/lib/meta';

interface MetaViewContentTrackerProps {
  customData: MetaCustomData;
  path: string;
}

export default function MetaViewContentTracker({
  customData,
  path,
}: MetaViewContentTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    trackMetaEvent({
      eventName: 'ViewContent',
      eventId: generateMetaEventId('viewcontent'),
      eventSourceUrl: new URL(path, window.location.origin).toString(),
      customData,
    });
  }, [customData, path]);

  return null;
}
