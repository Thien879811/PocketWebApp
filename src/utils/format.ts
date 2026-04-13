export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null) return '0'
  const absAmount = Math.abs(amount)
  
  if (absAmount >= 1_000_000) {
    return (amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + 'tr'
  } else if (absAmount >= 1_000) {
    return (amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k'
  }
  return amount.toLocaleString('vi-VN')
}
