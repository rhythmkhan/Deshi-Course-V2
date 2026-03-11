import Link from 'next/link';
import { MessageCircle, Phone, Mail, HelpCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '@/lib/faq-data';

export default function Support() {
  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'সরাসরি কল করুন',
      description: 'যেকোনো প্রয়োজনে আমাদের কল করুন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত।',
      contact: '+৮৮০ ১৮১৩ ৮৯৬৪০০',
      action: 'কল করুন',
      href: 'tel:+8801813896400',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'লাইভ চ্যাট',
      description: 'আমাদের বিশেষজ্ঞ দলের সাথে সরাসরি কথা বলুন তাৎক্ষণিক সমাধানের জন্য।',
      contact: 'Messenger support',
      action: 'চ্যাট শুরু করুন',
      href: 'https://www.messenger.com/t/956128257564286',
      color: 'bg-green-50 text-green-600',
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

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" id="support">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="mb-10 text-center sm:mb-12 lg:mb-16">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">আপনার কি কোনো <span className="text-brand">সাহায্য প্রয়োজন?</span></h2>
          <p className="mx-auto max-w-2xl text-sm text-gray-500 sm:text-base">আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে। যেকোনো প্রশ্ন বা সমস্যার জন্য আমাদের সাথে যোগাযোগ করুন।</p>
        </div>

        <div className="mb-12 grid gap-5 md:grid-cols-3 md:gap-8 lg:mb-16">
          {contactMethods.map((method, index) => (
            <div 
              key={index}
              className="rounded-3xl border border-gray-100 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
            >
              <div className={`w-12 h-12 ${method.color} rounded-2xl flex items-center justify-center mb-6`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{method.title}</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed">{method.description}</p>
              <p className="font-bold text-gray-900 mb-6">{method.contact}</p>
              <Link
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
                className="flex items-center text-brand font-bold hover:underline group"
              >
                {method.action}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 rounded-[2rem] bg-gray-50 p-6 sm:rounded-[2.5rem] sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:rounded-[3rem] lg:p-16">
          <div className="max-w-xl text-center lg:text-left">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)</h3>
            <p className="mb-6 text-sm text-gray-500 sm:mb-8 sm:text-base">কোর্স কেনা, পেমেন্ট বা সার্টিফিকেট সংক্রান্ত সাধারণ প্রশ্নের উত্তরগুলো আমাদের FAQ সেকশনে খুঁজে পেতে পারেন।</p>
            <Link
              href="/signin"
              className="inline-block w-full rounded-2xl bg-brand px-8 py-4 text-center font-bold text-white shadow-lg transition hover:bg-brand-dark sm:w-auto"
            >
              সব প্রশ্ন দেখুন
            </Link>
          </div>
          <div className="grid w-full gap-3 lg:w-1/2 lg:gap-4">
            {FAQ_ITEMS.slice(0, 4).map((item) => (
              <details key={item.question} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:border-brand">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-left sm:p-5">
                  <span className="pr-4 text-sm font-medium text-gray-700 sm:text-base">{item.question}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition group-open:rotate-180 group-open:text-brand" />
                </summary>
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
