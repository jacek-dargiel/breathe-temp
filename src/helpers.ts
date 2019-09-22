export function sum(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

export function toFixed(value: number, digits: number): number {
  return parseFloat(value.toFixed(digits));
}
