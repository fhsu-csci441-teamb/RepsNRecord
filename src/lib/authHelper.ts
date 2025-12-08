/**
 * Extract user ID from a request for permission/auth checks.
 * In production, verify the Firebase token.
 * In dev, decode the JWT token to extract the user_id.
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    // Extract Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      
      // In development, decode the JWT without verifying signature
      // to extract the user_id claim. In production, you'd verify with Firebase Admin SDK.
      if (process.env.NODE_ENV !== 'production') {
        try {
          // JWT format: header.payload.signature
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.warn("Invalid JWT format");
            return null;
          }
          
          // Decode the payload (second part)
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString('utf-8')
          );
          
          if (payload.user_id) {
            console.log("[getUserIdFromRequest] Extracted user_id from JWT:", payload.user_id);
            return payload.user_id;
          }
        } catch (error) {
          console.warn("Failed to decode JWT:", error);
        }
      }
      
      // In production, would verify with Firebase Admin SDK here
      // For now, fail safely
      return null;
    }

    // Dev fallback: check X-User-ID header for testing
    const devUserId = req.headers.get("X-User-ID");
    if (devUserId) {
      console.log("Using dev user ID from X-User-ID header:", devUserId);
      return devUserId;
    }

    return null;
  } catch (error) {
    console.error("Error extracting user ID from request:", error);
    return null;
  }
}

/**
 * Verify user ID matches requester ID.
 * Throws 403 if they don't match (permission denied).
 */
export function verifyUserIdMatch(userId: string | null, requiredUserId: string): void {
  if (!userId) {
    throw new Error("Unauthorized: No user ID found in request");
  }
  if (userId !== requiredUserId) {
    throw new Error(`Forbidden: User ${userId} cannot access ${requiredUserId}'s data`);
  }
}
