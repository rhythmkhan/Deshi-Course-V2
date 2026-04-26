import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowRight } from 'lucide-react';

interface HeroSectionData {
  title?: string | null;
  subtitle?: string | null;
  body?: Record<string, unknown>;
}

function HeroActions({
  className = '',
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  className?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return (
    <div className={`flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-nowrap sm:items-center lg:justify-start lg:gap-4 ${className}`.trim()}>
      <Link href={primaryHref} prefetch={false} className="w-full rounded-xl bg-gradient-brand px-5 py-3 text-center text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto sm:px-10 sm:py-4 sm:text-lg">
        <span>
          {primaryLabel}
        </span>
      </Link>
      <Link href={secondaryHref} className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:translate-x-0.5 hover:bg-brand/5 sm:w-auto sm:border-0 sm:bg-transparent sm:px-4 sm:py-2 sm:text-lg sm:shadow-none">
        <span className="flex items-center justify-center gap-2">
          {secondaryLabel}
          <ArrowRight className="w-5 h-5" />
        </span>
      </Link>
    </div>
  );
}

export default function Hero({ sectionData }: { sectionData?: HeroSectionData | null }) {
  const body = sectionData?.body ?? {};
  const title = sectionData?.title || 'দক্ষতা অর্জন করুন। কাগজ নয়!';
  const subtitle =
    sectionData?.subtitle ||
    'ইন-ডিমান্ড স্কিল শিখে গড়ে তুলুন আগামীর ক্যারিয়ার। ২,০০০+ শিক্ষার্থীর ভরসার প্ল্যাটফর্ম।';
  const primaryLabel =
    typeof body.primaryCtaLabel === 'string' ? body.primaryCtaLabel : 'এখনই শুরু করুন';
  const primaryHref =
    typeof body.primaryCtaHref === 'string' ? body.primaryCtaHref : '/signin';
  const secondaryLabel =
    typeof body.secondaryCtaLabel === 'string' ? body.secondaryCtaLabel : 'কোর্স দেখুন';
  const secondaryHref =
    typeof body.secondaryCtaHref === 'string' ? body.secondaryCtaHref : '/courses';
  const imageSrc = typeof body.image === 'string' ? body.image : '/hero.webp';
  preload(imageSrc, { as: 'image', fetchPriority: 'high' });

  return (
    <section className="relative overflow-hidden pb-8 pt-2 sm:pb-12 sm:pt-4 lg:pb-16 lg:pt-8">
      <div className="absolute top-0 right-0 z-[-1] h-full w-full lg:w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(109,40,217,0.1)_0%,rgba(255,255,255,0)_70%)]" />
      
      <div className="mx-auto grid max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-20">
        <div className="space-y-4 text-center lg:space-y-8 lg:text-left">
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-7xl">
            {title.split('. ').length > 1 ? (
              <>
                <span className="text-brand">{title.split('. ')[0]}.</span><br />
                {title.split('. ').slice(1).join('. ')}
              </>
            ) : (
              <span className="text-brand">{title}</span>
            )}
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-700 sm:text-lg lg:mx-0 lg:text-xl">
            {subtitle}
          </p>
          <HeroActions
            className="hidden lg:flex"
            primaryLabel={primaryLabel}
            primaryHref={primaryHref}
            secondaryLabel={secondaryLabel}
            secondaryHref={secondaryHref}
          />
        </div>

        <div className="relative mt-2 flex justify-center sm:-mt-8 lg:mt-0 lg:justify-end">
          <div className="relative z-10 aspect-square w-full max-w-[34rem] sm:max-w-[42rem] lg:max-w-[48rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Students Learning"
              width="960"
              height="768"
              className="absolute inset-0 h-full w-full object-contain"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>

        <div className="mt-1 lg:hidden">
          <HeroActions
            primaryLabel={primaryLabel}
            primaryHref={primaryHref}
            secondaryLabel={secondaryLabel}
            secondaryHref={secondaryHref}
          />
        </div>
      </div>
    </section>
  );
}
