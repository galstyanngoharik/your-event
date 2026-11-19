export const currencies = [
  { code: 'AMD', name: 'Armenian dram' },
  { code: 'USD', name: 'US dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'RUB', name: 'Russian ruble' },
] as const;

export type CurrencyCode = typeof currencies[number]['code'];

export function currencyCode(value: unknown): CurrencyCode {
  return currencies.find(currency => currency.code === value)?.code ?? 'AMD';
}

export function formatMoney(value: number, currency: unknown = 'AMD') {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currencyCode(currency)}`;
}
