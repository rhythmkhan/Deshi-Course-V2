import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function HeroActions({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-nowrap sm:items-center lg:justify-start lg:gap-4 ${className}`.trim()}>
      <Link href="/signin" className="w-full rounded-xl bg-gradient-brand px-5 py-3 text-center text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto sm:px-10 sm:py-4 sm:text-lg">
        <span>
          এখনই শুরু করুন
        </span>
      </Link>
      <Link href="/courses" className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm font-semibold text-brand shadow-sm transition hover:translate-x-0.5 hover:bg-brand/5 sm:w-auto sm:border-0 sm:bg-transparent sm:px-4 sm:py-2 sm:text-lg sm:shadow-none">
        <span className="flex items-center justify-center gap-2">
          কোর্স দেখুন
          <ArrowRight className="w-5 h-5" />
        </span>
      </Link>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-6 sm:pb-20 sm:pt-10 lg:pb-32 lg:pt-24">
      <div className="absolute top-0 right-0 z-[-1] h-full w-full lg:w-1/2 bg-[radial-gradient(circle_at_70%_30%,rgba(109,40,217,0.1)_0%,rgba(255,255,255,0)_70%)]" />
      
      <div className="mx-auto grid max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-20">
        <div className="space-y-4 text-center lg:space-y-8 lg:text-left">
          <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-7xl">
            <span className="text-brand">দক্ষতা অর্জন করুন।</span><br />
            সার্টিফাইড হন।
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-600 sm:text-lg lg:mx-0 lg:text-xl">
            আমাদের ব্যাপক সার্টিফিকেশন প্রোগ্রামের সাথে ইন-ডিমান্ড স্কিল শিখুন। ৫০,০০০+ পেশাদারদের সাথে যোগ দিন যারা আমাদের মাধ্যমে তাদের ক্যারিয়ার উন্নত করেছেন।
          </p>
          <HeroActions className="hidden lg:flex" />
        </div>

        <div className="relative mt-2 flex justify-center sm:-mt-8 lg:mt-0 lg:justify-end">
          <div className="relative z-10 aspect-square w-full max-w-[34rem] sm:max-w-[42rem] lg:max-w-[48rem]">
            <Image 
              src="/hero.webp"
              alt="Students Learning"
              fill
              className="object-contain"
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="mt-1 lg:hidden">
          <HeroActions />
        </div>
      </div>
    </section>
  );
}
