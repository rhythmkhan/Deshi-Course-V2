import Link from 'next/link';

export default function CTA() {
  return (
    <section className="deferred-section py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-6 shadow-2xl sm:rounded-[2.5rem] sm:p-10 lg:rounded-[3rem] lg:p-16">
          <h2 className="relative z-10 mb-6 text-3xl font-bold leading-tight text-white sm:mb-8 sm:text-4xl lg:text-5xl">
            সেরা কোর্স খুঁজে নিন এবং একসাথে <br />নিজের স্ব-বৃদ্ধি উৎসাহিত করুন
          </h2>
          <Link href="/signin" prefetch={false} className="inline-block w-full rounded-xl bg-white px-6 py-4 text-base font-bold text-brand shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto sm:px-10 sm:text-lg">
            <span>
              আরও এক্সপ্লোর করুন
            </span>
          </Link>
          
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full" />
        </div>
      </div>
    </section>
  );
}
