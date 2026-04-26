import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  priority?: boolean;
};

const sizeClasses = {
  sm: {
    wrapper: 'h-9 w-9',
    text: 'text-xl sm:text-2xl',
  },
  md: {
    wrapper: 'h-11 w-11',
    text: 'text-2xl sm:text-3xl',
  },
  lg: {
    wrapper: 'h-12 w-12',
    text: 'text-2xl sm:text-3xl',
  },
};

export default function BrandLogo({
  href = '/',
  size = 'sm',
  className = '',
  textClassName = '',
  priority = false,
}: BrandLogoProps) {
  const sizing = sizeClasses[size];

  return (
    <Link href={href} className={`inline-flex items-center gap-3 whitespace-nowrap ${className}`}>
      <div className={`relative shrink-0 ${sizing.wrapper}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt=""
          width="48"
          height="48"
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
        />
      </div>
      <span className={`shrink-0 font-bold leading-none tracking-tight text-gray-900 ${sizing.text} ${textClassName}`}>
        দেশি <span className="text-brand">কোর্স</span>
      </span>
    </Link>
  );
}
