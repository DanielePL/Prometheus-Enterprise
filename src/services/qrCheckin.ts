/**
 * QR Code Check-in Service
 *
 * Generates time-limited tokens for QR-based check-in.
 * Token is a Base64-encoded JSON string with member info and timestamp.
 */

export interface QrCheckinToken {
  memberId: string;
  gymId: string;
  timestamp: number;
  type: 'checkin';
}

const TOKEN_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export function generateMemberToken(memberId: string, gymId: string): string {
  const payload: QrCheckinToken = {
    memberId,
    gymId,
    timestamp: Date.now(),
    type: 'checkin',
  };
  return btoa(JSON.stringify(payload));
}

export function validateToken(
  token: string,
  expectedGymId?: string
): { valid: boolean; data?: QrCheckinToken; error?: string } {
  try {
    const json = atob(token);
    const data: QrCheckinToken = JSON.parse(json);

    if (data.type !== 'checkin') {
      return { valid: false, error: 'Invalid token type' };
    }

    if (!data.memberId || !data.gymId || !data.timestamp) {
      return { valid: false, error: 'Incomplete token data' };
    }

    const age = Date.now() - data.timestamp;
    if (age > TOKEN_VALIDITY_MS) {
      return { valid: false, error: 'Token expired' };
    }

    if (age < 0) {
      return { valid: false, error: 'Invalid timestamp' };
    }

    if (expectedGymId && data.gymId !== expectedGymId) {
      return { valid: false, error: 'Token is for a different gym' };
    }

    return { valid: true, data };
  } catch {
    return { valid: false, error: 'Invalid token format' };
  }
}
