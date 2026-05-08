export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null) return '0'
  const absAmount = Math.abs(amount)
  
  // Show full amount if it has decimals
  if (amount % 1 !== 0) {
    return amount.toLocaleString('vi-VN', { maximumFractionDigits: 2 })
  }

  // Use tr/k suffixes only for large round numbers
  if (absAmount >= 1_000_000 && absAmount % 10000 === 0) {
    return (amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + 'tr'
  } else if (absAmount >= 1_000 && absAmount % 100 === 0) {
    return (amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'k'
  }
  
  return amount.toLocaleString('vi-VN')
}
