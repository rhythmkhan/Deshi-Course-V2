'use client';

import { useState } from 'react';
import { LoaderCircle, Send } from 'lucide-react';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialState: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function updateField<K extends keyof ContactFormState>(key: K, value: ContactFormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Message send করা যায়নি।');
      }

      setSuccessMessage(data.message || 'আপনার message পাঠানো হয়েছে।');
      setForm(initialState);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Message send করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-bold text-gray-700">আপনার নাম</label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="নাম লিখুন"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-sm font-bold text-gray-700">ইমেইল ঠিকানা</label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
            placeholder="ইমেইল লিখুন"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-subject" className="text-sm font-bold text-gray-700">বিষয়</label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={(event) => updateField('subject', event.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          placeholder="বিষয় লিখুন"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-bold text-gray-700">বার্তা</label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          placeholder="আপনার বার্তা লিখুন"
          required
        />
      </div>

      {successMessage && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 font-bold text-white shadow-lg transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        <span>{isSubmitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}</span>
      </button>
    </form>
  );
}
