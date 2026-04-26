import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

const floatingTags = [
  { label: 'কোর্স', className: 'left-[8%] top-[20%] animate-brand-float' },
  { label: 'বান্ডেল', className: 'right-[10%] top-[18%] animate-brand-float-delayed' },
  { label: 'প্রোডাক্ট', className: 'left-[12%] bottom-[20%] animate-brand-float-delayed' },
  { label: 'ব্লগ', className: 'right-[14%] bottom-[18%] animate-brand-float' },
];

const stars = [
  'left-[12%] top-[14%]',
  'left-[24%] top-[28%]',
  'left-[82%] top-[16%]',
  'left-[88%] top-[34%]',
  'left-[16%] top-[72%]',
  'left-[32%] top-[82%]',
  'left-[74%] top-[76%]',
  'left-[86%] top-[68%]',
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#8b5cf6_0%,#6d28d9_38%,#4c1d95_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
      <div className="absolute inset-0">
        {stars.map((position, index) => (
          <span
            key={position}
            className={`animate-brand-twinkle absolute h-2 w-2 rounded-full bg-white/85 shadow-[0_0_18px_rgba(255,255,255,0.75)] ${position}`}
            style={{ animationDelay: `${index * 0.35}s` }}
          />
        ))}
        <div className="animate-brand-drift absolute left-[-8rem] top-[14%] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="animate-brand-drift absolute right-[-6rem] top-[58%] h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="animate-brand-drift absolute bottom-[-7rem] left-[42%] h-72 w-72 rounded-full bg-violet-200/15 blur-3xl" />
      </div>

      {floatingTags.map((tag) => (
        <div
          key={tag.label}
          className={`absolute hidden rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide text-white/90 shadow-[0_16px_38px_-24px_rgba(255,255,255,0.6)] backdrop-blur-md md:block ${tag.className}`}
        >
          {tag.label}
        </div>
      ))}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between">
          <BrandLogo className="text-white" textClassName="text-white" />
          <Link
            href="/"
            className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/15"
          >
            হোমে ফিরুন
          </Link>
        </header>

        <section className="relative flex flex-1 items-center justify-center py-12 sm:py-16">
          <div className="w-full max-w-6xl rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] backdrop-blur-xl sm:p-8 lg:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-center lg:text-left">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-white/75">
                  পেজ পাওয়া যায়নি
                </p>
                <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                  উফ! আপনি যে পেজটা খুঁজছেন,
                  <span className="block text-fuchsia-200">সেটা এখন এখানে নেই।</span>
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mx-0">
                  হয়তো link বদলে গেছে, page move হয়েছে, অথবা URL-এ ছোট typo আছে।
                  চাইলে homepage, course archive অথবা product collection থেকে আবার শুরু করতে পারেন।
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/courses"
                    className="rounded-2xl bg-white px-6 py-3 text-base font-bold text-brand shadow-[0_18px_40px_-24px_rgba(255,255,255,0.8)] hover:-translate-y-0.5"
                  >
                    কোর্সসমূহ দেখুন
                  </Link>
                  <Link
                    href="/products"
                    className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-base font-bold text-white backdrop-blur-md hover:bg-white/15"
                  >
                    প্রোডাক্ট দেখুন
                  </Link>
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-[32rem]">
                <div className="animate-brand-float relative rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-[0_30px_60px_-34px_rgba(15,23,42,0.8)] backdrop-blur-md">
                  <div className="absolute left-1/2 top-[-2.2rem] h-18 w-18 -translate-x-1/2 rounded-full border border-white/15 bg-white/10 blur-sm" />
                  <div className="relative flex items-center justify-center">
                    <div className="absolute h-[17rem] w-[17rem] rounded-full border border-dashed border-white/25 sm:h-[19rem] sm:w-[19rem]" />
                    <div className="absolute h-[13rem] w-[13rem] rounded-full border border-white/10" />
                    <div className="animate-brand-orbit absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-200 shadow-[0_0_22px_rgba(244,114,182,0.9)]" />
                    <div className="relative text-center">
                      <div className="text-[7rem] font-black leading-none tracking-[-0.08em] text-white drop-shadow-[0_20px_38px_rgba(76,29,149,0.55)] sm:text-[9rem]">
                        404
                      </div>
                      <div className="mt-2 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/85">
                        Lost in Deshi Course Space
                      </div>
                    </div>
                  </div>
                </div>

                <div className="animate-brand-float-delayed absolute -left-3 top-10 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-26px_rgba(15,23,42,0.8)] backdrop-blur-md sm:-left-8">
                  URL mismatch
                </div>
                <div className="animate-brand-float absolute -right-2 bottom-12 rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-26px_rgba(15,23,42,0.8)] backdrop-blur-md sm:-right-7">
                  Route moved
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

