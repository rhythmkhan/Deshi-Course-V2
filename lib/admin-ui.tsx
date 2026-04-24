import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

export function money(value: number | string | null | undefined) {
  return `৳${Number(value ?? 0).toFixed(0)}`;
}

export function shortDate(value: string | null | undefined) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function deliveryJson(metadata: Record<string, unknown> | null) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return '';
  }

  return metadata.deliveryLinks
    ? JSON.stringify(metadata.deliveryLinks, null, 2)
    : '';
}

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-[0_22px_70px_-42px_rgba(15,23,42,0.24)]">
      <div className="border-b border-gray-100 bg-[linear-gradient(180deg,rgba(109,40,217,0.06),rgba(255,255,255,0.98))] px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Section</p>
            <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{subtitle}</p>
          </div>
          <span className="inline-flex w-fit rounded-full border border-brand/10 bg-white px-3 py-1 text-xs font-bold text-brand">
            Simple view
          </span>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 ${className}`}
    />
  );
}

export function TextArea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[110px] rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 ${className}`}
    />
  );
}

export function Select({
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 ${className}`}
    />
  );
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  children: ReactNode;
}) {
  const className =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'bg-red-50 text-red-700'
          : tone === 'brand'
            ? 'bg-brand/10 text-brand'
            : 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

export function ActionButton({
  tone = 'primary',
  children,
}: {
  tone?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}) {
  const className =
    tone === 'secondary'
      ? 'border border-brand/15 bg-white text-brand hover:bg-brand/5'
      : tone === 'danger'
        ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
        : 'bg-gradient-brand text-white shadow-lg';

  return (
    <button
      className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${className}`}
    >
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand">{label}</p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900">{value}</p>
          <p className="mt-2 text-sm text-gray-500">{note}</p>
        </div>
        <span className="mt-1 h-3 w-3 rounded-full bg-brand/70 shadow-[0_0_0_8px_rgba(109,40,217,0.08)]" />
      </div>
    </div>
  );
}
