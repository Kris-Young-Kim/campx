"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Phone, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

// 자연스런 캠핑장 좌표 (충청북도 제천시 백운면 구학산로 1096-1)
const CAMPSITE = {
  lat: 37.042,
  lng: 128.185,
  name: "자연스런 캠핑장",
  address: "충청북도 제천시 백운면 구학산로 1096-1",
  phone: "010-6463-9641",
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: object) => NaverMap
        LatLng: new (lat: number, lng: number) => NaverLatLng
        Marker: new (options: object) => NaverMarker
        InfoWindow: new (options: object) => NaverInfoWindow
        MapTypeId: { TERRAIN: string; NORMAL: string; SATELLITE: string }
        Event: { addListener: (target: object, event: string, handler: () => void) => void }
      }
    }
  }
  interface NaverMap { setMapTypeId: (type: string) => void }
  interface NaverLatLng {}
  interface NaverMarker { setMap: (map: NaverMap | null) => void }
  interface NaverInfoWindow { open: (map: NaverMap, marker: NaverMarker) => void }
}

export function CampsiteMapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapType, setMapType] = useState<"normal" | "terrain" | "satellite">("terrain")
  const mapInstanceRef = useRef<NaverMap | null>(null)

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  useEffect(() => {
    if (!clientId) return

    // 이미 로드된 경우
    if (window.naver?.maps) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`
    script.async = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [clientId])

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver?.maps) return

    const { Map, LatLng, Marker, InfoWindow, MapTypeId } = window.naver.maps

    const position = new LatLng(CAMPSITE.lat, CAMPSITE.lng)

    const map = new Map(mapRef.current, {
      center: position,
      zoom: 15,
      mapTypeId: MapTypeId.TERRAIN,
    })
    mapInstanceRef.current = map

    const marker = new Marker({
      position,
      map,
      title: CAMPSITE.name,
    })

    const infoWindow = new InfoWindow({
      content: `
        <div style="padding:12px 16px;min-width:180px;font-family:sans-serif;">
          <p style="font-weight:700;font-size:14px;margin:0 0 4px">${CAMPSITE.name}</p>
          <p style="font-size:12px;color:#666;margin:0">${CAMPSITE.address}</p>
        </div>
      `,
    })

    infoWindow.open(map, marker)
  }, [isLoaded])

  // 지도 타입 변경
  useEffect(() => {
    if (!mapInstanceRef.current || !window.naver?.maps) return
    const { MapTypeId } = window.naver.maps
    const typeMap = { normal: MapTypeId.NORMAL, terrain: MapTypeId.TERRAIN, satellite: MapTypeId.SATELLITE }
    mapInstanceRef.current.setMapTypeId(typeMap[mapType])
  }, [mapType])

  const naverNavUrl = `nmap://place?lat=${CAMPSITE.lat}&lng=${CAMPSITE.lng}&name=${encodeURIComponent(CAMPSITE.name)}&appname=campx`
  const naverNavWebUrl = `https://map.naver.com/v5/directions/-/-/-//-/${CAMPSITE.lng},${CAMPSITE.lat},${encodeURIComponent(CAMPSITE.name)}`

  return (
    <div className="relative h-screen w-full flex flex-col bg-background">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{CAMPSITE.name}</p>
          <p className="text-xs text-muted-foreground truncate">{CAMPSITE.address}</p>
        </div>
        <div className="flex gap-1.5">
          {(["normal", "terrain", "satellite"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMapType(type)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                mapType === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {type === "normal" ? "일반" : type === "terrain" ? "지형" : "위성"}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!clientId ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <MapPin className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="font-semibold text-foreground mb-1">네이버 지도 API 키 필요</p>
              <p className="text-sm text-muted-foreground">
                <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_NAVER_MAP_CLIENT_ID</code>
                를 <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">.env.local</code>에 추가해주세요.
              </p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}
      </div>

      {/* Bottom Info Card */}
      <div className="px-4 py-4 border-t border-border bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground truncate">{CAMPSITE.address}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
              <a href={`tel:${CAMPSITE.phone.replace(/-/g, "")}`} className="text-xs font-medium text-foreground hover:text-primary transition-colors">
                {CAMPSITE.phone}
              </a>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a
              href={`tel:${CAMPSITE.phone.replace(/-/g, "")}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              전화
            </a>
            <a
              href={naverNavUrl}
              onClick={(e) => {
                // 앱 없으면 웹으로 fallback
                setTimeout(() => { window.location.href = naverNavWebUrl }, 1500)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              길찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
