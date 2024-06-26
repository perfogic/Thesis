import { validateNumber } from "@oraichain/oraidex-common";

export const formatDisplayUsdt = (amount: number | string, dp = 2): string => {
  const validatedAmount = validateNumber(amount);
  if (validatedAmount < 1)
    return `$${toFixedIfNecessary(amount.toString(), 4).toString()}`;

  return `$${numberWithCommas(
    toFixedIfNecessary(amount.toString(), dp),
    undefined,
    { maximumFractionDigits: 6 }
  )}`;
  // return `$${numberWithCommas(toFixedIfNecessary(amount.toString(), dp))}`;
};

// add `,` when split thounsand value.
export const numberWithCommas = (
  x: number,
  locales: Intl.LocalesArgument = undefined,
  options: Intl.NumberFormatOptions = {}
) => {
  if (isNegative(x)) return "0";
  return x.toLocaleString(locales, options);
};

export const toFixedIfNecessary = (value: string, dp: number): number => {
  return +parseFloat(value).toFixed(dp);
};
export const isNegative = (number) => number <= 0;

export const AMOUNT_BALANCE_ENTRIES: [number, string, string][] = [
    [0.25, '25%', 'one-quarter'],
    [0.5, '50%', 'half'],
    [0.75, '75%', 'three-quarters'],
    [1, '100%', 'max']
  ];