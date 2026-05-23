export const GST_RATES = {
  EXEMPT: 0,
  FIVE_PERCENT: 5,
  TWELVE_PERCENT: 12,
  EIGHTEEN_PERCENT: 18,
  TWENTY_EIGHT_PERCENT: 28,
} as const;

export type GSTRate = typeof GST_RATES[keyof typeof GST_RATES];
export default GST_RATES;
