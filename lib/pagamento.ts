// =========================================================
// Configurações de pagamento — DJ Simon
// =========================================================

export const PIX_KEY  = 'simontelini@outlook.com';
export const PIX_NAME = 'SIMON TELINI';
export const PIX_CITY = 'Poços de Caldas';

export const PLANOS = {
  pack:  { label: 'Pack Pro',        preco: 97  },
  curso: { label: 'Curso Completo',  preco: 197 },
  ambos: { label: 'Combo Completo',  preco: 247 },
} as const;

export type PlanoKey = keyof typeof PLANOS;

export const CUPONS: Record<string, { pct: number; label: string }> = {
  DJPAODURO10: { pct: 10, label: '10% de desconto' },
  TALIBAN10:   { pct: 10, label: '10% de desconto' },
};

// Substitua pelo seu link real do Mercado Pago quando tiver
export const MP_LINKS: Record<PlanoKey, string> = {
  pack:  'https://link.mercadopago.com.br/djsimon',
  curso: 'https://link.mercadopago.com.br/djsimon',
  ambos: 'https://link.mercadopago.com.br/djsimon',
};

// =========================================================
// Gerador de payload PIX (BR Code)
// =========================================================
function _f(id: string, val: string) {
  return id + String(val.length).padStart(2, '0') + val;
}

function _crc(str: string) {
  let c = 0xffff;
  for (let i = 0; i < str.length; i++) {
    c ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++)
      c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}

function _san(str: string, max: number) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '').replace(/[|"'<>&]/g, '')
    .trim().toUpperCase().substring(0, max);
}

function _sanKey(str: string, max: number) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '').replace(/[|"'<>&\s]/g, '')
    .substring(0, max);
}

export function buildPixPayload(amount: number): string {
  const valor = Number(amount || 0).toFixed(2);
  const name  = _san(PIX_NAME, 25);
  const city  = _san(PIX_CITY, 15);
  const key   = _sanKey(PIX_KEY, 77);
  const mai   = _f('26', _f('00', 'br.gov.bcb.pix') + _f('01', key));
  const adf   = _f('62', _f('05', '***'));
  const body  =
    _f('00', '01') + _f('01', '12') + mai +
    _f('52', '0000') + _f('53', '986') + _f('54', valor) +
    _f('58', 'BR') + _f('59', name) + _f('60', city) + adf + '6304';
  return body + _crc(body);
}

export function aplicarCupom(codigo: string, subtotal: number): {
  valido: boolean;
  desconto: number;
  label: string;
} {
  const cupom = CUPONS[codigo.trim().toUpperCase()];
  if (!cupom) return { valido: false, desconto: 0, label: '' };
  const desconto = subtotal * (cupom.pct / 100);
  return { valido: true, desconto, label: cupom.label };
}
