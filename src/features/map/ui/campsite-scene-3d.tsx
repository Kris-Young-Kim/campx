"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Html, Sky } from "@react-three/drei"
import * as THREE from "three"

// 예약한 사이트 ID (추후 실제 예약 데이터로 교체)
const MY_BOOKED_SITE_ID = "C3"

function debugLog(payload: {
  location: string
  message: string
  data?: Record<string, unknown>
  hypothesisId: "A" | "B" | "C" | "D"
  runId: "baseline" | "post-fix"
}) {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "669ff5",
    },
    body: JSON.stringify({
      sessionId: "669ff5",
      timestamp: Date.now(),
      location: payload.location,
      message: payload.message,
      data: payload.data ?? {},
      hypothesisId: payload.hypothesisId,
      runId: payload.runId,
    }),
  }).catch(() => {})
  // #endregion
}

/* ─── Types ──────────────────────────────────────────────── */
interface Site {
  id: string
  label: string
  x: number
  z: number
  status: "available" | "occupied" | "reserved"
  size: "소형" | "중형" | "대형"
  price: number
}

interface Facility {
  id: string
  label: string
  type: "wc" | "store" | "activity" | "entrance"
  x: number
  z: number
}

/* ─── Data ────────────────────────────────────────────────── */
const SITES: Site[] = [
  // A row (강변 쪽, z = -8)
  { id: "A1", label: "A1", x: -9, z: -8, status: "available", size: "중형", price: 35000 },
  { id: "A2", label: "A2", x: -5, z: -8, status: "occupied",  size: "대형", price: 45000 },
  { id: "A3", label: "A3", x:  1, z: -8, status: "available", size: "중형", price: 35000 },
  { id: "A4", label: "A4", x:  6, z: -8, status: "reserved",  size: "소형", price: 25000 },
  // B row (소나무 쪽, z = -3)
  { id: "B1", label: "B1", x: -9, z: -2, status: "available", size: "소형", price: 25000 },
  { id: "B2", label: "B2", x: -5, z: -2, status: "available", size: "대형", price: 45000 },
  { id: "B3", label: "B3", x:  1, z: -2, status: "occupied",  size: "중형", price: 35000 },
  { id: "B4", label: "B4", x:  6, z: -2, status: "available", size: "중형", price: 35000 },
  // C row (중앙, z = 3)
  { id: "C1", label: "C1", x: -9, z:  4, status: "reserved",  size: "중형", price: 35000 },
  { id: "C2", label: "C2", x: -5, z:  4, status: "available", size: "소형", price: 25000 },
  { id: "C3", label: "C3", x:  1, z:  4, status: "available", size: "대형", price: 45000 },
  { id: "C4", label: "C4", x:  6, z:  4, status: "occupied",  size: "중형", price: 35000 },
  // D row (입구 쪽, z = 8)
  { id: "D1", label: "D1", x: -9, z:  9, status: "available", size: "소형", price: 25000 },
  { id: "D2", label: "D2", x: -5, z:  9, status: "available", size: "중형", price: 35000 },
  { id: "D3", label: "D3", x:  1, z:  9, status: "available", size: "대형", price: 45000 },
  { id: "D4", label: "D4", x:  6, z:  9, status: "occupied",  size: "소형", price: 25000 },
]

const FACILITIES: Facility[] = [
  { id: "wc1",   label: "화장실",   type: "wc",       x: -13, z: -5 },
  { id: "wc2",   label: "화장실",   type: "wc",       x: -13, z:  5 },
  { id: "store", label: "매점",     type: "store",    x:  11, z:  0 },
  { id: "act1",  label: "큐어피쉬", type: "activity", x:   3, z: -11 },
  { id: "ent",   label: "입구",     type: "entrance", x:   0, z:  13 },
]

const STATUS_COLOR: Record<Site["status"], string> = {
  available: "#22c55e",
  occupied:  "#ef4444",
  reserved:  "#f59e0b",
}

const FACILITY_COLOR: Record<Facility["type"], string> = {
  wc:       "#3b82f6",
  store:    "#a855f7",
  activity: "#06b6d4",
  entrance: "#94a3b8",
}

/* ─── Booking Arrow ──────────────────────────────────────── */
function BookingArrow({ x, z }: { x: number; z: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const t = useRef(0)
  const didLog = useRef(false)
  const didProjectLog = useRef(false)
  const { camera, size } = useThree()
  const BASE_Y = 1.8
  const BOB_AMPLITUDE = 0.22

  useEffect(() => {
    if (didLog.current) return
    didLog.current = true
    debugLog({
      location: "src/features/map/ui/campsite-scene-3d.tsx:BookingArrow",
      message: "BookingArrow mounted (world anchor)",
      data: { siteId: MY_BOOKED_SITE_ID, x, z, yBase: BASE_Y, bob: BOB_AMPLITUDE },
      hypothesisId: "A",
      runId: "baseline",
    })
  }, [x, z])

  useFrame((_, delta) => {
    t.current += delta * 2
    if (groupRef.current) {
      groupRef.current.position.y = BASE_Y + Math.sin(t.current) * BOB_AMPLITUDE
    }

    if (!didProjectLog.current) {
      didProjectLog.current = true

      // C3 사이트 메시 중심(y=0.15)과 화살표 앵커(y=3.2)의 화면상(픽셀) 차이를 측정
      const siteWorld = new THREE.Vector3(x, 0.15, z)
      const arrowWorld = new THREE.Vector3(x, BASE_Y, z)
      const siteNdc = siteWorld.clone().project(camera)
      const arrowNdc = arrowWorld.clone().project(camera)

      const toPx = (ndc: THREE.Vector3) => ({
        x: (ndc.x * 0.5 + 0.5) * size.width,
        y: (1 - (ndc.y * 0.5 + 0.5)) * size.height,
      })

      const sitePx = toPx(siteNdc)
      const arrowPx = toPx(arrowNdc)

      debugLog({
        location: "src/features/map/ui/campsite-scene-3d.tsx:BookingArrow",
        message: "Projection delta (site center vs arrow anchor)",
        data: {
          siteId: MY_BOOKED_SITE_ID,
          size: { w: size.width, h: size.height },
          siteWorld: { x: siteWorld.x, y: siteWorld.y, z: siteWorld.z },
          arrowWorld: { x: arrowWorld.x, y: arrowWorld.y, z: arrowWorld.z },
          sitePx,
          arrowPx,
          deltaPx: { dx: arrowPx.x - sitePx.x, dy: arrowPx.y - sitePx.y },
          cameraPos: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          },
        },
        hypothesisId: "C",
        runId: "post-fix",
      })
    }
  })

  return (
    <group ref={groupRef} position={[x, BASE_Y, z]}>
      {/* 화살표 줄기 */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 1.0, 8]} />
        <meshLambertMaterial color="#fbbf24" />
      </mesh>
      {/* 화살표 헤드 (아래를 향한 원뿔) */}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.32, 0.7, 8]} />
        <meshLambertMaterial color="#f59e0b" />
      </mesh>
      {/* 발광 링 */}
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.06, 8, 24]} />
        <meshLambertMaterial color="#fde68a" />
      </mesh>
      {/* "내 자리" 라벨 */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.38}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.06}
        outlineColor="#000000"
      >
        내 자리
      </Text>
    </group>
  )
}

/* ─── Tree ──────────────────────────────────────────────── */
function Tree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
        <meshLambertMaterial color="#7c5c2e" />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <coneGeometry args={[0.8, 2.4, 7]} />
        <meshLambertMaterial color="#166534" />
      </mesh>
      <mesh position={[0, 3.0, 0]} castShadow>
        <coneGeometry args={[0.55, 1.8, 7]} />
        <meshLambertMaterial color="#15803d" />
      </mesh>
    </group>
  )
}

/* ─── Stream ─────────────────────────────────────────────── */
function Stream() {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-16, -10)
    s.bezierCurveTo(-12, -10, -10, -9, -8, -10)
    s.bezierCurveTo(-6, -11, -4, -10, -2, -9)
    s.lineTo(-2, -7.5)
    s.bezierCurveTo(-4, -8.5, -6, -9.5, -8, -8.5)
    s.bezierCurveTo(-10, -7.5, -12, -8.5, -16, -8.5)
    s.closePath()
    return s
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshLambertMaterial color="#60a5fa" transparent opacity={0.75} />
    </mesh>
  )
}

/* ─── Campsite Site ──────────────────────────────────────── */
function SiteMesh({ site, onClick }: { site: Site; onClick: (s: Site) => void }) {
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)
  const didLog = useRef(false)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y,
      hovered ? 1.6 : 1,
      0.12,
    )
  })

  const color = hovered ? "#facc15" : STATUS_COLOR[site.status]
  const w = site.size === "대형" ? 3.2 : site.size === "중형" ? 2.6 : 2.0

  useEffect(() => {
    if (site.id !== MY_BOOKED_SITE_ID) return
    if (didLog.current) return
    didLog.current = true
    const centerWorld = meshRef.current
      ? meshRef.current.getWorldPosition(new THREE.Vector3())
      : null
    debugLog({
      location: "src/features/map/ui/campsite-scene-3d.tsx:SiteMesh",
      message: "Booked site mesh mounted (world center + dims)",
      data: {
        siteId: site.id,
        groupPos: { x: site.x, z: site.z },
        boxDims: { w, d: w * 0.85, h: 0.28 },
        meshWorld: centerWorld
          ? { x: centerWorld.x, y: centerWorld.y, z: centerWorld.z }
          : null,
      },
      hypothesisId: "A",
      runId: "baseline",
    })
  }, [site.id, site.x, site.z, w])

  return (
    <group position={[site.x, 0, site.z]}>
      <mesh
        ref={meshRef}
        position={[0, 0.15, 0]}
        castShadow
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(site) }}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer" }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "" }}
      >
        <boxGeometry args={[w, 0.28, w * 0.85]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Platform base */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[w + 0.3, 0.08, w * 0.85 + 0.3]} />
        <meshLambertMaterial color="#d4b896" />
      </mesh>
      <Text
        position={[0, 0.55, 0]}
        fontSize={0.42}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        {site.label}
      </Text>
    </group>
  )
}

/* ─── Facility Marker ────────────────────────────────────── */
function FacilityMarker({ facility }: { facility: Facility }) {
  const color = FACILITY_COLOR[facility.type]
  return (
    <group position={[facility.x, 0, facility.z]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.4, 1.0, 1.4]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.38}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {facility.label}
      </Text>
    </group>
  )
}

/* ─── Ground ─────────────────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshLambertMaterial color="#4ade80" />
    </mesh>
  )
}

/* ─── Path ──────────────────────────────────────────────── */
function Paths() {
  return (
    <>
      {/* 세로 메인 통로 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.01, 0.5]}>
        <planeGeometry args={[1.2, 24]} />
        <meshLambertMaterial color="#d4b896" />
      </mesh>
      {/* 가로 A-D 통로 */}
      {[-8, -2, 4, 9].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[22, 1.0]} />
          <meshLambertMaterial color="#d4b896" />
        </mesh>
      ))}
    </>
  )
}

/* ─── Scene ──────────────────────────────────────────────── */
function Scene({ onSelect }: { onSelect: (site: Site | null) => void }) {
  const treePositions = useMemo(() => {
    const positions: { x: number; z: number }[] = []
    const forbidden = (x: number, z: number) =>
      Math.abs(x) < 14 && Math.abs(z) < 14 // 캠핑 구역 내에는 나무 없음
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 46
      const z = (Math.random() - 0.5) * 46
      if (!forbidden(x, z)) positions.push({ x, z })
    }
    return positions
  }, [])

  useEffect(() => {
    const booked = SITES.find((s) => s.id === MY_BOOKED_SITE_ID) ?? null
    debugLog({
      location: "src/features/map/ui/campsite-scene-3d.tsx:Scene",
      message: "Scene mounted (booked site data)",
      data: {
        booked,
        sitesCount: SITES.length,
        facilitiesCount: FACILITIES.length,
      },
      hypothesisId: "B",
      runId: "baseline",
    })
  }, [])

  return (
    <>
      <Sky sunPosition={[100, 80, 100]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      <Ground />
      <Paths />
      <Stream />

      {treePositions.map((p, i) => (
        <Tree key={i} x={p.x} z={p.z} />
      ))}

      {SITES.map((site) => (
        <SiteMesh key={site.id} site={site} onClick={onSelect} />
      ))}

      {/* 내가 예약한 사이트 위 입체 화살표 */}
      {SITES.filter((s) => s.id === MY_BOOKED_SITE_ID).map((s) => (
        <BookingArrow key={`arrow-${s.id}`} x={s.x} z={s.z} />
      ))}

      {FACILITIES.map((f) => (
        <FacilityMarker key={f.id} facility={f} />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={8}
        maxDistance={40}
        target={[0, 0, 0]}
      />
    </>
  )
}

/* ─── Main Export ────────────────────────────────────────── */
export function CampsiteScene3D() {
  const [selected, setSelected] = useState<Site | null>(null)

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 20, 25], fov: 45 }}
        shadows
        gl={{ antialias: true }}
        className="w-full h-full"
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === "CANVAS") setSelected(null)
        }}
      >
        <Scene onSelect={setSelected} />
        {selected && (
          <Html
            position={[selected.x, 2.5, selected.z]}
            center
            distanceFactor={10}
            zIndexRange={[100, 0]}
          >
            <div
              className="bg-card border border-border rounded-xl p-3 shadow-xl min-w-[140px] text-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold text-foreground text-sm mb-1">자리 {selected.label}</p>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-white mb-2"
                style={{ backgroundColor: STATUS_COLOR[selected.status] }}
              >
                {selected.status === "available" ? "사용 가능" : selected.status === "occupied" ? "사용 중" : "예약됨"}
              </span>
              <p className="text-xs text-muted-foreground">{selected.size} 사이트</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {selected.price.toLocaleString()}원
              </p>
              <button
                className="mt-2 text-[10px] text-muted-foreground hover:text-foreground"
                onClick={() => setSelected(null)}
              >
                닫기
              </button>
            </div>
          </Html>
        )}
      </Canvas>

      {/* 조작 안내 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 text-[11px] text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border pointer-events-none">
        <span>🖱 드래그: 회전</span>
        <span>·</span>
        <span>스크롤: 줌</span>
        <span>·</span>
        <span>자리 클릭: 상세보기</span>
      </div>
    </div>
  )
}
