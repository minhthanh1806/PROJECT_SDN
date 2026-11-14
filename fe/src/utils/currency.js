export const USD_TO_VND = 25500;
export const EUR_TO_VND = 27500;

export function formatVND(usdAmount) {
  const num = Number(usdAmount);
  if (!num || isNaN(num) || num <= 0) return '0₫';
  const rawVnd = num * USD_TO_VND;
  const rounded = rawVnd >= 1000 ? Math.round(rawVnd / 1000) * 1000 : Math.round(rawVnd / 100) * 100;
  return `${rounded.toLocaleString('vi-VN')}₫`;
}

export function formatEurToVND(eurAmount) {
  const num = Number(eurAmount);
  if (!num || isNaN(num) || num <= 0) return '0₫';
  const rawVnd = num * EUR_TO_VND;
  const rounded = rawVnd >= 1000 ? Math.round(rawVnd / 1000) * 1000 : Math.round(rawVnd / 100) * 100;
  return `${rounded.toLocaleString('vi-VN')}₫`;
}
