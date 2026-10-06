import { WHATSAPP_NUMBER } from '../config';

export function getWhatsAppUrl(productName: string, number = WHATSAPP_NUMBER): string | null {
  const digits = number.replace(/[\s()+-]/g, '');
  if (!/^[1-9]\d{6,14}$/.test(digits)) return null;
  const message = `Hola, me interesa el ${productName} que tienes en venta.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
