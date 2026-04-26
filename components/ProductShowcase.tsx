'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Filter, Search, X } from 'lucide-react';
import { SHOP_CATALOG, type ShopItem } from '@/lib/shop-catalog';

interface ProductShowcaseProps {
  items?: ShopItem[];
  limit?: number;
  mobileLimit?: number;
  desktopLimit?: number;
  showFilters?: boolean;
}

export default function ProductShowcase({
  items = SHOP_CATALOG,
  limit,
  mobileLimit,
  desktopLimit,
  showFilters = true,
}: ProductShowcaseProps) {
  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'digital' | 'whatsapp'>('all');
  const maxLimit = Math.max(limit ?? 0, mobileLimit ?? 0, desktopLimit ?? 0);
  const deferredQuery = useDeferredValue(query);
  const visibleItems = useMemo(() => {
    const initial = maxLimit > 0 ? items.slice(0, maxLimit) : items;
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return initial.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.type.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery);

      const matchesFormat =
        formatFilter === 'all' ||
        (formatFilter === 'whatsapp'
          ? item.format.toLowerCase().includes('whatsapp')
          : item.format.toLowerCase().includes('digital'));

      return matchesQuery && matchesFormat;
    });
  }, [deferredQuery, formatFilter, items, maxLimit]);

  return (
    <section className="deferred-section py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-20">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              জনপ্রিয় <span className="text-brand">প্রোডাক্টসমূহ</span>
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              Ready-made resource, template, pack আর digital product collection এখানেই দেখুন।
            </p>
          </div>
          <Link
            href="/products"
            className="hidden rounded-xl bg-brand/10 px-6 py-3 text-center font-bold text-brand transition hover:bg-brand hover:text-white md:mt-0 md:inline-flex md:w-auto md:rounded-lg md:py-2"
          >
            সব দেখুন
          </Link>
        </div>

        {showFilters ? (
          <div className="mb-6 grid gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-[1.2fr_0.8fr_auto] sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Product search করুন"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Clear product search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as typeof formatFilter)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand"
              >
                <option value="all">সব format</option>
                <option value="digital">Digital</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setQuery('');
                setFormatFilter('all');
              }}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Reset
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {visibleItems.map((item, index) => {
            const hideOnDesktop =
              typeof mobileLimit === 'number' &&
              typeof desktopLimit === 'number' &&
              mobileLimit > desktopLimit &&
              index >= desktopLimit &&
              index < mobileLimit;

            return (
            <article
              key={item.slug}
              className={`flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${hideOnDesktop ? 'lg:hidden' : ''}`}
            >
              <div className="relative h-28 overflow-hidden sm:h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized={item.image.startsWith('/api/catalog-art')}
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 360px"
                />
                {item.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                      {item.tag}
                    </span>
                )}
              </div>

              <div className="flex grow flex-col p-3 sm:p-6">
                <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 sm:mb-3 sm:text-xl">{item.title}</h3>
                <ul className="mb-4 space-y-1.5 text-[11px] leading-4 text-gray-700 sm:mb-6 sm:space-y-2 sm:text-sm sm:leading-5">
                  {item.featureMetrics.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="line-clamp-2">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] text-gray-600 sm:text-xs">{item.format}</p>
                    <p className="text-lg font-bold text-gray-900 sm:text-2xl">৳{item.price}</p>
                  </div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="w-full rounded-lg bg-brand px-3 py-2 text-center text-xs font-bold text-white sm:w-auto sm:rounded-lg sm:px-4 sm:py-2 sm:text-sm"
                  >
                    বিস্তারিত দেখুন
                  </Link>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        <Link
          href="/products"
          className="mt-5 flex w-full rounded-xl bg-brand/10 px-6 py-3 text-center font-bold text-brand transition hover:bg-brand hover:text-white md:hidden"
        >
          <span className="w-full">সব দেখুন</span>
        </Link>
      </div>
    </section>
  );
}

