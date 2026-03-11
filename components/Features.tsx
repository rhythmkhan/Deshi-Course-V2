import { BookOpen, CheckCircle, Briefcase } from 'lucide-react';

export default function Features() {
  const features = [
    {
      id: '০১',
      title: 'শিখুন',
      description: 'হাতে-কলমে প্রজেক্ট, রিয়েল-ওয়ার্ল্ড কেস স্টাডি এবং ইন্ডাস্ট্রি ইনসাইট সহ বিশেষজ্ঞ-চালিত কোর্সগুলিতে যোগ দিন।',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-purple-100',
    },
    {
      id: '০২',
      title: 'সার্টিফাইড হন',
      description: 'আপনার দক্ষতা যাচাই করে এমন যাচাইযোগ্য, শিল্প-স্বীকৃত সার্টিফিকেট অর্জন করতে পরীক্ষায় উত্তীর্ণ হন।',
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'bg-purple-100',
    },
    {
      id: '০৩',
      title: 'কাজ শুরু করুন',
      description: 'নিয়োগকারীদের কাছে আপনার দক্ষতা প্রদর্শন করুন এবং উচ্চ বেতন বা আপনার স্বপ্নের ক্যারিয়ার শুরু করুন।',
      icon: <Briefcase className="w-8 h-8" />,
      color: 'bg-purple-100',
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto mb-10 px-4 text-center sm:mb-12 sm:px-6 lg:mb-16 lg:px-20">
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">আমাদের কোর্স থেকে <span className="text-brand">কেন শিখবেন?</span></h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-500 sm:text-base">আমরা মানসম্পন্ন শিক্ষা এবং ব্যবহারিক দক্ষতার ওপর গুরুত্ব দিই যা আপনাকে বর্তমান কর্মক্ষেত্রে সফল হতে সাহায্য করবে।</p>
      </div>
      
      <div className="max-w-7xl mx-auto grid gap-5 px-4 sm:px-6 md:grid-cols-3 md:gap-8 lg:gap-10 lg:px-20">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group rounded-3xl border border-gray-100 p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl sm:p-8"
          >
            <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-white transition`}>
              {feature.icon}
            </div>
            <h3 className="mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">{feature.id}. {feature.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
