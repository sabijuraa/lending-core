interface Props { width?: string | number; height?: string | number; borderRadius?: string | number }
export function Skeleton({ width = '100%', height = 16, borderRadius = 6 }: Props) {
  return <div className="skeleton" style={{ width, height, borderRadius }} role="status" aria-busy="true" />
}
