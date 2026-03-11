import { redirect } from 'next/navigation';

interface ProductRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductRedirectPage({ params }: ProductRedirectPageProps) {
  const { slug } = await params;
  redirect(`/templates/${slug}`);
}
