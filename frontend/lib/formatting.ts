export function formatUSD(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatTimeAgo(timestamp: number): string {
  const s = Math.floor((Date.now() - timestamp) / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

export function calculateBorrowAPY(u: number, base: number, kinkRate: number, maxRate: number, kink: number): number {
  if (u <= kink) return base + (u / kink) * (kinkRate - base)
  return kinkRate + ((u - kink) / (1 - kink)) * (maxRate - kinkRate)
}

export function calculateSupplyAPY(u: number, borrowAPY: number): number {
  return borrowAPY * u
}

export function getOracleStatus(lastUpdate: number, maxStaleness: number): 'fresh' | 'warning' | 'stale' {
  const ratio = (Date.now() - lastUpdate) / maxStaleness
  if (ratio < 0.5) return 'fresh'
  if (ratio < 0.8) return 'warning'
  return 'stale'
}

export function getHealthStatus(h: number): 'safe' | 'warning' | 'danger' {
  if (h > 2.0) return 'safe'
  if (h > 1.15) return 'warning'
  return 'danger'
}
