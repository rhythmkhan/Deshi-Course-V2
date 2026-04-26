import AnimatedCounter from './AnimatedCounter';

export default function Stats() {
  const stats = [
    { value: 25000, suffix: '+', label: 'সন্তুষ্ট শিক্ষার্থী' },
    { value: 75, suffix: '%+', label: 'কোর্স কমপ্লিশন রেট' },
    { value: 350, suffix: '+', label: 'কোর্স' },
    { value: 4.5, suffix: '/5', decimals: 1, label: 'শিক্ষার্থীদের রেটিং' },
    { value: 24, suffix: '/7', label: 'সাপোর্ট' },
  ];

  return (
    <section className="deferred-section bg-gray-50 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 sm:gap-6 md:grid-cols-5 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:bg-transparent md:p-0 md:shadow-none ${
                index === stats.length - 1 ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <p className="text-3xl font-bold text-brand sm:text-4xl">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-600 sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
