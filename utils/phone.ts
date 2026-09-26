// Kullanıcının girdiği ham metinden sadece rakamları alır, en fazla 10 haneyle sınırlar
export function extractPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10);
}

// Var olan (eski formatlı) bir telefon numarasından 10 haneli yerel kısmı çıkarır
// "+90 555 123 45 67", "0555 123 45 67", "5551234567" gibi farklı formatları destekler
export function digitsFromExistingPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('90') && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits.slice(-10);
}

// 10 haneli rakamı "5XX XXX XX XX" şeklinde gruplu gösterir
export function formatPhoneDisplay(digits: string): string {
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 10));
  return parts.join(' ');
}

// Backend'e gönderilecek tam formatı üretir
export function toE164(digits: string): string {
  return `+90${digits}`;
}