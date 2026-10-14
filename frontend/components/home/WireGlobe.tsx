// Static wireframe globe drawn as SVG, used as a faint backdrop on the dark band.
const R = 200
const C = 230

function project(lat: number, lon: number) {
  // orthographic projection with a slight tilt so the grid reads as a sphere
  const tilt = 0.35
  const x = Math.cos(lat) * Math.sin(lon)
  const y0 = Math.sin(lat)
  const z0 = Math.cos(lat) * Math.cos(lon)
  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt)
  const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt)
  return { x: C + x * R, y: C - y * R, z }
}

const nodes: { x: number; y: number; z: number }[] = []
for (let i = -3; i <= 3; i++) {
  for (let j = 0; j < 14; j++) {
    nodes.push(project((i * Math.PI) / 8, (j * 2 * Math.PI) / 14 + i * 0.22))
  }
}

const edges: [number, number][] = []
nodes.forEach((a, i) => {
  nodes.forEach((b, j) => {
    if (j <= i || a.z < -0.1 || b.z < -0.1) return
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    if (d < 95) edges.push([i, j])
  })
})

export function WireGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 460 460" aria-hidden="true">
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(221,232,217,0.35)" strokeWidth="1" />
      {edges.map(([i, j]) => (
        <line
          key={`${i}-${j}`}
          x1={nodes[i].x}
          y1={nodes[i].y}
          x2={nodes[j].x}
          y2={nodes[j].y}
          stroke="rgba(221,232,217,0.28)"
          strokeWidth="0.8"
        />
      ))}
      {nodes.filter(n => n.z >= -0.1).map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={1.8} fill="rgba(221,232,217,0.6)" />
      ))}
    </svg>
  )
}
