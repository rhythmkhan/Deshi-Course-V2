import React from 'react';
import Link from 'next/link';
import { Facebook, Mail, MessageCircle, Send } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const socialLinks = [
    { href: 'https://www.facebook.com/DeshiCourse', label: 'Facebook', icon: Facebook },
    { href: 'https://wa.me/8801813896400', label: 'WhatsApp', icon: MessageCircle },
    { href: 'https://www.messenger.com/t/956128257564286', label: 'Messenger', icon: Send },
    { href: 'mailto:info@deshicourse.xyz', label: 'Email', icon: Mail },
  ];

  const footerSections = [
    {
      title: 'দ্রুত লিঙ্ক',
      links: [
        { href: '/', label: 'হোম' },
        { href: '/about', label: 'সম্পর্কে' },
        { href: '/courses', label: 'কোর্সসমূহ' },
        { href: '/bundles', label: 'বান্ডেল' },
        { href: '/templates', label: 'প্রোডাক্ট' },
        { href: '/blog', label: 'ব্লগ' },
        { href: '/faq', label: 'FAQ' },
        { href: '/contact', label: 'যোগাযোগ' },
        { href: '/signin', label: 'সাইন ইন' },
        { href: '/signup', label: 'সাইন আপ' },
      ],
    },
    {
      title: 'পরিষেবা',
      links: [
        { href: '/services/certification', label: 'সার্টিফিকেশন কোর্স' },
        { href: '/services/mentors', label: 'ইন্ডাস্ট্রি মেন্টরস' },
        { href: '/services/support', label: 'ক্যারিয়ার সাপোর্ট' },
      ],
    },
    {
      title: 'আইনি',
      links: [
        { href: '/privacy', label: 'গোপনীয়তা নীতি' },
        { href: '/terms', label: 'শর্তাবলী' },
        { href: '/legal', label: 'আইনি পদক্ষেপ' },
      ],
    },
  ];

  const renderSection = (
    section: (typeof footerSections)[number],
    className = '',
    listClassName = '',
  ) => (
    <div
      key={section.title}
      className={`rounded-3xl bg-white/80 px-5 py-5 text-left shadow-[0_14px_32px_-28px_rgba(109,40,217,0.28)] ${className}`.trim()}
    >
      <h3 className="mb-4 text-base font-bold text-gray-900">{section.title}</h3>
      <ul className={`space-y-2.5 text-sm text-gray-700 ${listClassName}`.trim()}>
        {section.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl py-1 pr-2 transition hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand/35" />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="deferred-section bg-purple-50 pt-14 pb-8 sm:pt-20 lg:pt-24 lg:pb-12">
      <div className="mx-auto mb-10 max-w-7xl px-4 sm:mb-12 sm:px-6 lg:px-20 lg:mb-16">
        <div className="space-y-6 rounded-[28px] border border-white/80 bg-white/85 p-6 text-center shadow-[0_20px_55px_-34px_rgba(109,40,217,0.45)] md:hidden">
          <BrandLogo className="justify-center" />
          <p className="leading-relaxed text-gray-700">
            আমরা শিখতে আগ্রহী ব্যক্তিদের জন্য সেরা প্ল্যাটফর্ম প্রদান করি যেখানে গুণমান এবং দক্ষতা প্রথম অগ্রাধিকার।
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                aria-label={label}
                className="flex h-11 w-full items-center justify-center rounded-2xl border border-purple-100 bg-white text-brand shadow-sm transition hover:bg-brand hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
          <div className="border-t border-purple-100 pt-6">
            <div className="space-y-4">
              {renderSection(
                footerSections[0],
                'bg-purple-50/60 px-5 py-5 shadow-none',
                'grid grid-cols-2 gap-x-4 gap-y-3 space-y-0',
              )}
              {renderSection(
                footerSections[1],
                'bg-purple-50/60 px-5 py-5 shadow-none',
              )}
              {renderSection(
                footerSections[2],
                'bg-purple-50/60 px-5 py-5 shadow-none',
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-[32px] border border-white/80 bg-white/88 p-8 shadow-[0_24px_65px_-38px_rgba(109,40,217,0.42)] lg:p-10">
            <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] xl:gap-12">
              <div className="max-w-md space-y-6">
                <BrandLogo className="justify-start" />
                <p className="max-w-sm text-base leading-relaxed text-gray-700">
                  আমরা শিখতে আগ্রহী ব্যক্তিদের জন্য সেরা প্ল্যাটফর্ম প্রদান করি যেখানে গুণমান এবং দক্ষতা প্রথম অগ্রাধিকার।
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-100 bg-white text-brand shadow-sm transition hover:bg-brand hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
                {renderSection(
                  footerSections[0],
                  'h-full bg-purple-50/55 px-6 py-6 shadow-none',
                  'grid grid-cols-2 gap-x-6 gap-y-3 space-y-0 text-[15px]',
                )}
                {renderSection(
                  footerSections[1],
                  'h-full bg-purple-50/55 px-6 py-6 shadow-none',
                  'space-y-3.5 text-[15px]',
                )}
                {renderSection(
                  footerSections[2],
                  'h-full bg-purple-50/55 px-6 py-6 shadow-none',
                  'space-y-3.5 text-[15px]',
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl border-t border-purple-200 px-4 pt-6 text-center text-sm text-gray-600 sm:px-6 sm:pt-8 lg:px-20">
        <p>কপিরাইট © ২০২৬ দেশি কোর্স।</p>
      </div>
    </footer>
  );
}
