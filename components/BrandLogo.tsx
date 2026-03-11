import Image from 'next/image';
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
    text: 'text-lg sm:text-xl',
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
        <Image src="/logo.webp" alt="" fill className="object-contain" priority={priority} sizes="48px" />
      </div>
      <span className={`shrink-0 font-bold leading-none tracking-tight text-gray-900 ${sizing.text} ${textClassName}`}>
        দেশি <span className="text-brand">কোর্স</span>
      </span>
    </Link>
  );
}
