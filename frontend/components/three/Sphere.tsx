'use client'
import { useEffect, useRef } from 'react'

interface Props {
  mouseX?: number
  mouseY?: number
  simplified?: boolean
}

export function WireframeSphere({ mouseX = 0, mouseY = 0, simplified = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number | undefined>(undefined)
  const rotX = useRef(0)
  const rotY = useRef(0)
  const targetRotX = useRef(0)
  const targetRotY = useRef(0)
  const time = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Generate sphere points using fibonacci sphere
    const numPoints = simplified ? 80 : 180
    const numLines = simplified ? 40 : 120
    const radius = 1

    type Point3D = [number, number, number]

    const points: Point3D[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      points.push([Math.cos(theta) * r, y, Math.sin(theta) * r])
    }

    // Generate edges between nearby points
    const edges: [number, number][] = []
    for (let i = 0; i < Math.min(numPoints, numLines * 2); i++) {
      for (let j = i + 1; j < numPoints; j++) {
        const dx = points[i][0] - points[j][0]
        const dy = points[i][1] - points[j][1]
        const dz = points[i][2] - points[j][2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 0.45 && edges.length < numLines) {
          edges.push([i, j])
        }
      }
    }

    // Node pulse phases
    const pulsePhase = points.map(() => Math.random() * Math.PI * 2)
    const pulseSpeed = points.map(() => 0.3 + Math.random() * 0.7)

    const rotate3D = (p: Point3D, rx: number, ry: number): Point3D => {
      // rotate around Y
      const cosY = Math.cos(ry), sinY = Math.sin(ry)
      const x1 = p[0] * cosY + p[2] * sinY
      const z1 = -p[0] * sinY + p[2] * cosY
      // rotate around X
      const cosX = Math.cos(rx), sinX = Math.sin(rx)
      const y2 = p[1] * cosX - z1 * sinX
      const z2 = p[1] * sinX + z1 * cosX
      return [x1, y2, z2]
    }

    const project = (p: Point3D, size: number): [number, number, number] => {
      const fov = 2.8
      const z = p[2] + fov
      const scale = (size * 0.5) / z
      return [p[0] * scale + size / 2, p[1] * scale + size / 2, p[2]]
    }

    const render = () => {
      const dpr = window.devicePixelRatio || 1
      const size = canvas.width / dpr

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse tracking
      rotX.current += (targetRotX.current - rotX.current) * 0.05
      rotY.current += (targetRotY.current - rotY.current) * 0.05

      time.current += 0.008

      const baseRotY = time.current * 0.3
      const rx = rotX.current + baseRotY * 0.2
      const ry = baseRotY + rotY.current

      // Project all points
      const projected = points.map((p) => {
        const rp = rotate3D(p, rx, ry)
        return project(rp, size)
      })

      // Draw edges
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 0.5
      for (const [a, b] of edges) {
        const pa = projected[a]
        const pb = projected[b]
        // depth fade
        const depth = (pa[2] + pb[2]) / 2 + 1
        ctx.globalAlpha = Math.max(0, Math.min(1, depth * 0.15))
        ctx.beginPath()
        ctx.moveTo(pa[0], pa[1])
        ctx.lineTo(pb[0], pb[1])
        ctx.stroke()
      }

      // Draw nodes
      for (let i = 0; i < points.length; i++) {
        const pp = projected[i]
        const depth = pp[2] + 1.5
        const pulse = (Math.sin(time.current * pulseSpeed[i] * 2 + pulsePhase[i]) + 1) / 2
        const alpha = Math.max(0, Math.min(1, depth * 0.25)) * (0.3 + pulse * 0.7)
        const nodeSize = (1 + pulse * 1.5) * (depth * 0.4)

        // Teal glow node
        ctx.globalAlpha = alpha * 0.8
        const grad = ctx.createRadialGradient(pp[0], pp[1], 0, pp[0], pp[1], nodeSize * 3)
        grad.addColorStop(0, 'rgba(0, 229, 204, 0.9)')
        grad.addColorStop(0.4, 'rgba(0, 229, 204, 0.3)')
        grad.addColorStop(1, 'rgba(0, 229, 204, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(pp[0], pp[1], nodeSize * 3, 0, Math.PI * 2)
        ctx.fill()

        // Solid core
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#00E5CC'
        ctx.beginPath()
        ctx.arc(pp[0], pp[1], Math.max(0.5, nodeSize * 0.6), 0, Math.PI * 2)
        ctx.fill()

        // Occasional purple node
        if (i % 15 === 0) {
          ctx.globalAlpha = alpha * 0.6 * pulse
          const pg = ctx.createRadialGradient(pp[0], pp[1], 0, pp[0], pp[1], nodeSize * 4)
          pg.addColorStop(0, 'rgba(124, 58, 237, 0.8)')
          pg.addColorStop(1, 'rgba(124, 58, 237, 0)')
          ctx.fillStyle = pg
          ctx.beginPath()
          ctx.arc(pp[0], pp[1], nodeSize * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(render)
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const size = Math.min(canvas.parentElement?.clientWidth || 600, canvas.parentElement?.clientHeight || 600)
      canvas.width = size * dpr
      canvas.height = size * dpr
      canvas.style.width = size + 'px'
      canvas.style.height = size + 'px'
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)
    animRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [simplified])

  useEffect(() => {
    targetRotX.current = mouseY * 0.14
    targetRotY.current = mouseX * 0.14
  }, [mouseX, mouseY])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        background: 'transparent',
      }}
    />
  )
}
