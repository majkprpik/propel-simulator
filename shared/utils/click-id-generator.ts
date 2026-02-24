import type { Platform } from '../types/database';

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateFbclid(): string {
  return `IwAR_${toBase64Url(randomBytes(24))}`;
}

export function generateGclid(): string {
  return `Cj0KCQ${toBase64Url(randomBytes(30))}`;
}

export function generateTtclid(): string {
  return `${Date.now()}${toHex(randomBytes(8))}`;
}

export function generateScclid(): string {
  return `SC_${toHex(randomBytes(12))}`;
}

export function generateNbclid(): string {
  return `NB_${toHex(randomBytes(8))}`;
}

export function generateEfTransactionId(): string {
  return `ef_${toHex(randomBytes(8))}`;
}

export function generateClickId(platform: Platform): string {
  switch (platform) {
    case 'facebook':
      return generateFbclid();
    case 'google':
      return generateGclid();
    case 'tiktok':
      return generateTtclid();
    case 'snapchat':
      return generateScclid();
    case 'newsbreak':
      return generateNbclid();
    case 'everflow':
      return generateEfTransactionId();
    default:
      return `mock_${toHex(randomBytes(16))}`;
  }
}
