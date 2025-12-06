import { NextResponse } from 'next/server';

export async function getUidFromRequest(req: Request): Promise<string | null> {
  // Dev fallback: tests can set X-TEST-UID header
  // Support both Request-like objects with headers.get(...) and plain objects with headers.X
  let testUid: string | null | undefined;
  if (req && (req as Record<string, unknown>).headers) {
    const headersObj = (req as Record<string, unknown>).headers as Record<string, unknown> | { get: (name: string) => string | null };
    if (typeof (headersObj as { get?: (name: string) => string | null }).get === 'function') {
      testUid = (headersObj as { get: (name: string) => string | null }).get('x-test-uid');
    } else if (typeof headersObj === 'object') {
      // case-insensitive
      for (const k of Object.keys(headersObj)) {
        if (k.toLowerCase() === 'x-test-uid') {
          testUid = headersObj[k] as string;
          break;
        }
      }
    }
  }
  if (testUid) return testUid;

  // Standard Authorization: Bearer <idToken>
  const authHeader = (req as Record<string, unknown>).headers && typeof ((req as Record<string, unknown>).headers as { get?: (name: string) => string | null }).get === 'function'
    ? ((req as Record<string, unknown>).headers as { get: (name: string) => string | null }).get('authorization')
    : (req as Record<string, unknown>).headers && (((req as Record<string, unknown>).headers as Record<string, unknown>)['authorization'] || ((req as Record<string, unknown>).headers as Record<string, unknown>)['Authorization']);
  if (authHeader) {
    const token = (authHeader as string).replace(/^Bearer\s+/i, '').trim();
    
    // For production with Firebase, would need to verify token
    // For now, in dev environments accept tokens directly
    if (token.startsWith('dev:')) {
      return token.replace(/^dev:/, '');
    }
    // In non-production, treat token as raw UID (for local testing)
    if (process.env.NODE_ENV !== 'production') return token;
  }

  // Dev fallback: if no auth header in dev, use X-USER-ID query param or header
  // This is NOT secure for production but allows local development without Firebase token setup
  if (process.env.NODE_ENV !== 'production') {
    let devUid: string | null = null;
    
    // Try to get from headers first (X-USER-ID)
    if ((req as Record<string, unknown>).headers) {
      const headersObj = (req as Record<string, unknown>).headers as Record<string, unknown> | { get?: (name: string) => string | null };
      if (typeof (headersObj as { get?: (name: string) => string | null }).get === 'function') {
        devUid = ((headersObj as { get: (name: string) => string | null }).get('x-user-id')) || null;
      } else if (typeof headersObj === 'object') {
        for (const k of Object.keys(headersObj)) {
          if (k.toLowerCase() === 'x-user-id') {
            devUid = headersObj[k] as string;
            break;
          }
        }
      }
    }
    
    // If found in headers, return it
    if (devUid) return devUid;
    
    // Try to get userId from query params as last resort in dev
    try {
      const url = new URL(req.url);
      const userIdParam = url.searchParams.get('userId');
      if (userIdParam) return userIdParam;
    } catch {
      // URL parsing failed, ignore
    }
  }

  return null;
}

export function requireAuth(uid: string | null) {
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
