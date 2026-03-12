'use client';

import { useEffect, useRef, useState } from 'react';

const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const easeOutExpo = (progress: number) => {
  if (progress >= 1) {
    return 1;
  }

  return 1 - 2 ** (-10 * progress);
};

const toBengaliNumber = (num: string | number) => {
  return num
    .toString()
    .split('')
    .map((digit) => (digit >= '0' && digit <= '9' ? bengaliDigits[parseInt(digit)] : digit))
    .join('');
};

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export default function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 2,
  decimals = 0,
  className = ''
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCounter = () => {
      if (hasAnimatedRef.current) {
        return;
      }

      hasAnimatedRef.current = true;

      if (prefersReducedMotion) {
        setCount(value);
        return;
      }

      const start = performance.now();

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / (duration * 1000), 1);
        const easedProgress = easeOutExpo(progress);

        setCount(value * easedProgress);

        if (progress < 1) {
          frameIdRef.current = window.requestAnimationFrame(step);
          return;
        }

        setCount(value);
      };

      frameIdRef.current = window.requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver === 'undefined') {
      return animateCounter();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();
        animateCounter();
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();

      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [duration, value]);

  const displayValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(count);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {toBengaliNumber(displayValue)}
      {suffix}
    </span>
  );
}
