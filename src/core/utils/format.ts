export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

/** 2350 -> "2.35 L", 800 -> "800 ml" */
export function formatWater(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `${formatNumber(ml)} ml`;
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
