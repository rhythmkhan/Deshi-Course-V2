import 'server-only';
import { JWT } from 'google-auth-library';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

function getDriveServiceAccountConfig() {
  return {
    clientEmail: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_CLIENT_EMAIL?.trim() ?? '',
    privateKey:
      process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
  };
}

function getDriveJwtClient() {
  const config = getDriveServiceAccountConfig();

  if (!config.clientEmail || !config.privateKey) {
    throw new Error(
      'Google Drive service account env missing. GOOGLE_DRIVE_SERVICE_ACCOUNT_CLIENT_EMAIL and GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY লাগবে।',
    );
  }

  return new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: [DRIVE_SCOPE],
  });
}

async function getDriveAccessToken() {
  const client = getDriveJwtClient();
  const tokens = await client.authorize();

  if (!tokens.access_token) {
    throw new Error('Google Drive access token পাওয়া যায়নি।');
  }

  return tokens.access_token;
}

async function parseDriveResponse(response: Response) {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};

  if (response.ok) {
    return payload;
  }

  const errorMessage =
    typeof payload.error === 'object' &&
    payload.error !== null &&
    'message' in payload.error &&
    typeof (payload.error as { message?: unknown }).message === 'string'
      ? (payload.error as { message: string }).message
      : typeof payload.message === 'string'
        ? payload.message
        : `Google Drive request failed with status ${response.status}`;

  throw new Error(errorMessage);
}

export async function shareDriveTargetWithUser(input: {
  targetId: string;
  targetType: 'file' | 'folder';
  email: string;
  role?: 'reader' | 'commenter' | 'writer';
  sendNotificationEmail?: boolean;
}) {
  const accessToken = await getDriveAccessToken();
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${input.targetId}/permissions`);
  url.searchParams.set(
    'sendNotificationEmail',
    String(input.sendNotificationEmail ?? false),
  );

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'user',
      role: input.role ?? 'reader',
      emailAddress: input.email,
    }),
    cache: 'no-store',
  });

  const payload = await parseDriveResponse(response);

  return {
    permissionId:
      typeof payload.id === 'string'
        ? payload.id
        : typeof payload.permissionId === 'string'
          ? payload.permissionId
          : '',
    payload,
  };
}

export async function revokeDriveTargetAccess(input: {
  targetId: string;
  permissionId: string;
}) {
  const accessToken = await getDriveAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${input.targetId}/permissions/${input.permissionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok && response.status !== 404) {
    await parseDriveResponse(response);
  }

  return { ok: true };
}
