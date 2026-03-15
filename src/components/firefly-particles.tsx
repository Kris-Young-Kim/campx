"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

const COUNT = 260

function Particles() {
  const ref = useRef<THREE.Points>(null)

  const { base, speeds, offsets, sizes } = useMemo(() => {
    const base    = new Float32Array(COUNT * 3)
    const speeds  = new Float32Array(COUNT)
    const offsets = new Float32Array(COUNT)
    const sizes   = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      base[i * 3]     = (Math.random() - 0.5) * 24   // x
      base[i * 3 + 1] = (Math.random() - 0.5) * 12   // y
      base[i * 3 + 2] = (Math.random() - 0.5) * 6    // z (depth)
      speeds[i]  = 0.25 + Math.random() * 0.55
      offsets[i] = Math.random() * Math.PI * 2
      sizes[i]   = 0.03 + Math.random() * 0.07
    }
    return { base, speeds, offsets, sizes }
  }, [])

  // working copy for per-frame mutation
  const pos = useMemo(() => base.slice(), [base])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const arr = ref.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = base[i * 3]     + Math.cos(t * speeds[i] * 0.6  + offsets[i]) * 0.5
      arr[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * speeds[i]         + offsets[i]) * 0.9
      arr[i * 3 + 2] = base[i * 3 + 2]
    }
    ref.current.geometry.attributes.position.needsUpdate = true

    // pulse opacity via material
    const mat = ref.current.material as THREE.PointsMaterial
    mat.opacity = 0.45 + Math.sin(t * 0.4) * 0.15
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[pos, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#a8ff78"
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export function FireflyParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 55 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      gl={{ alpha: true, antialias: false }}
    >
      <Particles />
    </Canvas>
  )
}
