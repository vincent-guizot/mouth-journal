const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Client-side document ID, same shape as Firestore auto IDs (20 chars). Generated on
 * the client so an offline create can be retried idempotently with the same ID.
 */
export const generateId = (length = 20): string => {
  const cryptoObj = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  const bytes = new Uint8Array(length);
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
};

/** IDs that are safe as Firestore document IDs and route params. */
export const SAFE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,128}$/;
