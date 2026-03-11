const toBanglaNumber = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

export default function Stats() {
  const stats = [
    { value: 15, suffix: 'কে+', label: 'শিক্ষার্থী' },
    { value: 75, suffix: '%', label: 'সাফল্যের হার' },
    { value: 35, suffix: '', label: 'প্রধান প্রশ্নসমূহ' },
    { value: 26, suffix: '', label: 'বিশেষজ্ঞ শিক্ষক' },
    { value: 16, suffix: '', label: 'অভিজ্ঞতার বছর' },
  ];

  return (
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3 sm:gap-6 md:grid-cols-5 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:bg-transparent md:p-0 md:shadow-none ${
                index === stats.length - 1 ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <h3 className="text-3xl font-bold text-brand sm:text-4xl">
                {toBanglaNumber(stat.value)}
                {stat.suffix}
              </h3>
              <p className="mt-2 text-sm font-medium text-gray-500 sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
