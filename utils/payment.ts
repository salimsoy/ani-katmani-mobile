// Ödeme formu için pure yardımcı fonksiyonlar

export function detectCardBrand(digits: string): string | null {
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^9792/.test(digits) || /^65/.test(digits)) return 'Troy';
  return null;
}

export function luhnCheck(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function validateExpiry(exp: string): string | null {
  if (exp.length !== 5) return 'Son kullanma tarihini AA/YY formatında girin.';
  const [mm, yy] = exp.split('/').map(Number);
  if (mm < 1 || mm > 12) return 'Geçersiz ay: 01–12 arasında olmalıdır.';
  const now = new Date();
  const currentYY = now.getFullYear() % 100;
  const currentMM = now.getMonth() + 1;
  if (yy < currentYY || (yy === currentYY && mm < currentMM))
    return 'Kartın son kullanma tarihi geçmiş.';
  if (yy > currentYY + 15) return 'Son kullanma yılı geçersiz görünüyor.';
  return null;
}

export function formatCardNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
}

export function formatExpiryDate(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return cleaned;
}