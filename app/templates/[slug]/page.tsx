import { redirect } from 'next/navigation';

interface TemplateRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TemplateRedirectPage({
  params,
}: TemplateRedirectPageProps) {
  const { slug } = await params;
  redirect(`/products/${slug}`);
}
