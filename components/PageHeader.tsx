interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-purple-50 py-14 sm:py-16 lg:py-20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-20">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-gray-700 sm:text-base lg:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    </section>
  );
}
