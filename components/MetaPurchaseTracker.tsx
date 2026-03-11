'use client';

import { useEffect, useRef } from 'react';
import { trackMetaEvent } from '@/lib/meta-client';
import type { MetaCustomData } from '@/lib/meta';

interface MetaPurchaseTrackerProps {
  eventId: string;
  path: string;
  customData: MetaCustomData;
}

export default function MetaPurchaseTracker({
  eventId,
  path,
  customData,
}: MetaPurchaseTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    trackMetaEvent({
      eventName: 'Purchase',
      eventId,
      eventSourceUrl: new URL(path, window.location.origin).toString(),
      customData,
    });
  }, [customData, eventId, path]);

  return null;
}
