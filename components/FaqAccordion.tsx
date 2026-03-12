'use client';

import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { FaqItem } from '@/lib/faq-data';

type FaqAccordionProps = {
  items: FaqItem[];
  icon?: 'arrow' | 'chevron';
  numbered?: boolean;
  containerClassName?: string;
  itemClassName?: string;
  buttonClassName?: string;
  answerClassName?: string;
};

export default function FaqAccordion({
  items,
  icon = 'chevron',
  numbered = false,
  containerClassName = 'space-y-4',
  itemClassName = 'rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm transition sm:p-6',
  buttonClassName = 'flex w-full items-center justify-between gap-4 text-left',
  answerClassName = 'pt-4 text-sm leading-relaxed text-gray-600 sm:text-base',
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={containerClassName}>
      {items.map((item, index) => {
        const isOpen = index === openIndex;
        const Icon = icon === 'arrow' ? ArrowRight : ChevronDown;

        return (
          <div
            key={item.question}
            className={`${itemClassName} ${isOpen ? 'border-brand/20 shadow-md' : ''}`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className={buttonClassName}
            >
              <span className="text-base font-bold text-gray-900 sm:text-lg">
                {numbered ? `${index + 1}. ` : ''}
                {item.question}
              </span>
              <Icon
                className={`h-4 w-4 shrink-0 text-gray-400 transition ${
                  isOpen
                    ? icon === 'arrow'
                      ? 'rotate-90 text-brand'
                      : 'rotate-180 text-brand'
                    : ''
                }`}
              />
            </button>
            {isOpen ? <p className={answerClassName}>{item.answer}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
