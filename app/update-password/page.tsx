import UpdatePasswordPageClient from '@/components/UpdatePasswordPageClient';

type UpdatePasswordPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function getInitialErrorMessage(searchParams: Record<string, string | string[] | undefined>) {
  const error = readParam(searchParams.error);
  const errorCode = readParam(searchParams.error_code);
  const errorDescription = readParam(searchParams.error_description);

  if (error === 'access_denied' && errorCode === 'otp_expired') {
    return 'Reset link-এর সময় শেষ হয়ে গেছে। নতুন করে forgot password করুন।';
  }

  return errorDescription || '';
}

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <UpdatePasswordPageClient
      initialErrorMessage={getInitialErrorMessage(resolvedSearchParams)}
    />
  );
}
