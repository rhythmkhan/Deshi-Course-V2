import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface AnswerBlockProps {
  eyebrow?: string;
  title: string;
  answer: string;
  points?: string[];
  ctaHref?: string;
  ctaLabel?: string;
}

export default function AnswerBlock({
  eyebrow = 'Quick answer',
  title,
  answer,
  points = [],
  ctaHref,
  ctaLabel,
}: AnswerBlockProps) {
  return (
    <section className="border-y border-brand/10 bg-brand/5 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {title}
            </h2>
          </div>
          <div>
            <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
              {answer}
            </p>
            {points.length > 0 ? (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {points.map((point) => (
                  <li key={point} className="flex text-sm leading-relaxed text-gray-700">
                    <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            {ctaHref && ctaLabel ? (
              <Link
                href={ctaHref}
                className="mt-6 inline-flex items-center font-bold text-brand transition hover:underline"
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
