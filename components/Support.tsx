import Link from 'next/link';
import { MessageCircle, Mail, ArrowRight } from 'lucide-react';
import FaqAccordion from '@/components/FaqAccordion';
import { FAQ_ITEMS } from '@/lib/faq-data';

interface SupportSectionData {
  title?: string | null;
  subtitle?: string | null;
  body?: Record<string, unknown>;
}

export default function Support({
  sectionData,
  faqItems = FAQ_ITEMS,
}: {
  sectionData?: SupportSectionData | null;
  faqItems?: Array<{ question: string; answer: string }>;
}) {
  const body = sectionData?.body ?? {};
  const contactMethods = Array.isArray(body.contactMethods)
    ? (body.contactMethods as Array<Record<string, unknown>>).map((method) => ({
        icon:
          method.theme === 'email'
            ? <Mail className="w-6 h-6" />
            : <MessageCircle className="w-6 h-6" />,
        title:
          typeof method.title === 'string' ? method.title : 'Support',
        description:
          typeof method.description === 'string' ? method.description : '',
        contact:
          typeof method.contact === 'string' ? method.contact : '',
        action:
          typeof method.action === 'string' ? method.action : 'Open',
        href:
          typeof method.href === 'string' ? method.href : '/contact',
        color:
          method.theme === 'whatsapp'
            ? 'bg-[#25D366]/10 text-[#25D366]'
            : method.theme === 'messenger'
              ? 'bg-[#0084FF]/10 text-[#0084FF]'
              : 'bg-purple-50 text-purple-600',
      }))
    : [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'সরাসরি WhatsApp-এ মেসেজ করুন',
      description: 'যেকোনো প্রয়োজনে আমাদের WhatsApp-এ মেসেজ করুন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত।',
      contact: '+৮৮০ ১৮১৩ ৮৯৬৪০০',
      action: 'মেসেজ করুন',
      href: 'https://wa.me/8801813896400',
      color: 'bg-[#25D366]/10 text-[#25D366]',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'লাইভ চ্যাট',
      description: 'আমাদের বিশেষজ্ঞ দলের সাথে সরাসরি কথা বলুন তাৎক্ষণিক সমাধানের জন্য।',
      contact: 'Messenger support',
      action: 'চ্যাট শুরু করুন',
      href: 'https://www.messenger.com/t/956128257564286',
      color: 'bg-[#0084FF]/10 text-[#0084FF]',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'ইমেইল সাপোর্ট',
      description: 'আপনার বিস্তারিত সমস্যা লিখে আমাদের ইমেইল করুন।',
      contact: 'info@deshicourse.xyz',
      action: 'ইমেইল পাঠান',
      href: 'mailto:info@deshicourse.xyz',
      color: 'bg-purple-50 text-purple-600',
    },
    ];
  const title = sectionData?.title || 'আপনার কি কোনো সাহায্য প্রয়োজন?';
  const subtitle =
    sectionData?.subtitle ||
    'আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে। যেকোনো প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন।';

  return (
    <section className="deferred-section bg-white py-16 sm:py-20 lg:py-24" id="support">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-600 sm:text-base">{subtitle}</p>
        </div>

        <div className="mb-12 grid gap-5 md:grid-cols-3 md:gap-8 lg:mb-16">
          {contactMethods.map((method, index) => (
            <div 
              key={index}
              className="flex h-full flex-col rounded-3xl border border-gray-100 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
            >
              <div className={`w-12 h-12 ${method.color} rounded-2xl flex items-center justify-center mb-6`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{method.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">{method.description}</p>
              <p className="font-bold text-gray-900 mb-6">{method.contact}</p>
              <div className="mt-auto flex justify-end pt-4">
                <Link
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="inline-flex items-center whitespace-nowrap text-brand font-bold hover:underline group"
                >
                  {method.action}
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 rounded-[2rem] bg-gray-50 p-6 sm:rounded-[2.5rem] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:rounded-[3rem] lg:p-16">
          <div className="max-w-xl text-center lg:text-left">
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3>
            <p className="mb-6 text-sm text-gray-700 sm:mb-8 sm:text-base">কোর্স কেনা, পেমেন্ট বা সার্টিফিকেট সংক্রান্ত সাধারণ প্রশ্নের উত্তরগুলো আমাদের FAQ সেকশনে খুঁজে পেতে পারেন।</p>
          </div>
          <div className="w-full lg:w-1/2">
            <FaqAccordion
              items={faqItems.slice(0, 3)}
              containerClassName="grid gap-3 lg:gap-4"
              itemClassName="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-brand"
              buttonClassName="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
              answerClassName="border-t border-gray-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-gray-700 sm:px-5 sm:pb-5 sm:text-base"
            />
            <Link
              href="/signin"
              className="mt-6 inline-block w-full rounded-2xl bg-brand px-8 py-4 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark"
            >
              সব প্রশ্ন দেখুন
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
