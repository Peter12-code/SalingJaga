import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Compass,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  Layers,
  MapPin,
  Flame,
  Radio,
  Eye,
  Send,
  RefreshCw,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalMap.css'

// Pilihan layer peta gratis dan stabil (Esri World Street Map, World Imagery, OpenStreetMap)
const MAP_TILE_CONFIGS = {
  standar: {
    id: 'standar',
    label: 'Standar GIS',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, OpenStreetMap contributors',
    maxZoom: 18,
  },
  satelit: {
    id: 'satelit',
    label: 'Satelit',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
  osm: {
    id: 'osm',
    label: 'Topografi / OSM',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
}

function getNationalMarkerSvg(keparahan, butuhEskalasi) {
  let color = '#16a34a' // normal hijau SalingJaga
  if (keparahan === 'kritis') color = '#ef4444'
  else if (keparahan === 'tinggi') color = '#f97316'
  else if (keparahan === 'sedang') color = '#f59e0b'

  const pulseClass = butuhEskalasi ? 'marker-pulse-critical' : 'marker-pulse-normal'

  return `
    <div class="national-marker-container">
      <div class="${pulseClass}" style="background-color: ${color}"></div>
      <div class="national-marker-pin" style="background-color: ${color}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
          <circle cx="12" cy="12" r="5"/>
        </svg>
      </div>
      ${butuhEskalasi ? `<span class="national-marker-escalate-pill">ESKALASI</span>` : ''}
    </div>
  `
}

export default function NationalMap() {
  const {
    wilayahNasionalList = [],
    selectedWilayahNasional,
    setSelectedWilayahNasional,
    setNationalActiveTab,
  } = useApp()

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const currentTileLayerRef = useRef(null)
  const markersLayerRef = useRef(null)

  const [activeLayer, setActiveLayer] = useState('standar')
  const [filterKeparahan, setFilterKeparahan] = useState('semua')
  const [mapReady, setMapReady] = useState(false)

  // Inisialisasi Peta Leaflet Indonesia
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    // Titik pusat koordinat Indonesia Nusantara [-2.5, 118.0]
    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 14,
    })

    const initialConfig = MAP_TILE_CONFIGS[activeLayer] || MAP_TILE_CONFIGS.standar
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      maxZoom: initialConfig.maxZoom,
    }).addTo(map)
    currentTileLayerRef.current = tileLayer

    const markersGroup = L.featureGroup().addTo(map)
    markersLayerRef.current = markersGroup
    mapInstanceRef.current = map
    setMapReady(true)

    // Jaminan Leaflet invalidateSize agar tidak ada blank/abu-abu saat mount
    const t1 = setTimeout(() => {
      map.invalidateSize()
    }, 150)

    const t2 = setTimeout(() => {
      map.invalidateSize()
    }, 450)

    const t3 = setTimeout(() => {
      map.invalidateSize()
    }, 900)

    const handleWindowResize = () => {
      map.invalidateSize()
    }
    window.addEventListener('resize', handleWindowResize)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', handleWindowResize)
      map.remove()
      mapInstanceRef.current = null
      currentTileLayerRef.current = null
      markersLayerRef.current = null
      setMapReady(false)
    }
  }, [])

  // Ganti Layer Tile jika pengguna beralih (Standar / Satelit / OSM)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current)
    }

    const config = MAP_TILE_CONFIGS[activeLayer] || MAP_TILE_CONFIGS.standar
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(mapInstanceRef.current)
    newLayer.bringToBack()
    currentTileLayerRef.current = newLayer

    mapInstanceRef.current.invalidateSize()
  }, [activeLayer, mapReady])

  // Pasang Marker Titik Kejadian Tiap Provinsi/Wilayah
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapReady) return
    markersLayerRef.current.clearLayers()

    const filtered = wilayahNasionalList.filter((w) => {
      if (filterKeparahan === 'semua') return true
      if (filterKeparahan === 'eskalasi') return w.butuhEskalasi
      return w.keparahan === filterKeparahan
    })

    filtered.forEach((w) => {
      const iconHtml = getNationalMarkerSvg(w.keparahan, w.butuhEskalasi)
      const customIcon = L.divIcon({
        className: 'custom-national-div-icon',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([w.lat, w.lng], { icon: customIcon })

      const popupHtml = `
        <div class="national-map-popup">
          <div class="popup-top">
            <span class="popup-province">${w.provinsi}</span>
            <span class="popup-status status-${w.status.toLowerCase().replace(/\\s+/g, '-')}">${w.status}</span>
          </div>
          <h4 class="popup-title">${w.nama}</h4>
          <p class="popup-disaster">${w.jenisBencana}</p>
          <div class="popup-kpi-grid">
            <div>
              <strong>${w.kejadianAktif}</strong>
              <span>Kejadian</span>
            </div>
            <div>
              <strong>${w.wargaTerdampak.toLocaleString('id-ID')}</strong>
              <span>Terdampak</span>
            </div>
            <div>
              <strong>${w.wargaMengungsi.toLocaleString('id-ID')}</strong>
              <span>Pengungsi</span>
            </div>
          </div>
          ${w.butuhEskalasi ? `<div class="popup-escalate-alert">🚨 Membutuhkan Dukungan Pusat BNPB</div>` : ''}
          <div class="popup-action-hint">Klik untuk memfokuskan wilayah ini</div>
        </div>
      `

      marker.bindPopup(popupHtml, { maxWidth: 280, className: 'national-leaflet-popup' })

      marker.on('click', () => {
        setSelectedWilayahNasional(w)
      })

      markersLayerRef.current.addLayer(marker)
    })
  }, [wilayahNasionalList, filterKeparahan, setSelectedWilayahNasional, mapReady])

  // Fly to selected region
  const handleFlyTo = (w) => {
    setSelectedWilayahNasional(w)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([w.lat, w.lng], 8, { duration: 1.2 })
    }
  }

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([-2.5, 118.0], 5, { duration: 1.2 })
      mapInstanceRef.current.invalidateSize()
    }
  }

  return (
    <div className="national-map-card">
      {/* MAP HEADER STRIP */}
      <div className="national-map-header">
        <div className="map-header-left">
          <div className="map-header-beacon">
            <Compass size={18} />
          </div>
          <div>
            <h3 className="map-title">Peta Situasi Bencana Nasional</h3>
            <span className="map-sub">
              Pusat Pantauan Sebaran Wilayah Bencana, Tingkat Keparahan, & Wilayah Membutuhkan Dukungan Pusat
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="map-header-controls">
          <div className="filter-keparahan-group" role="group">
            <button
              type="button"
              className={`btn-keparahan ${filterKeparahan === 'semua' ? 'active' : ''}`}
              onClick={() => setFilterKeparahan('semua')}
            >
              Semua ({wilayahNasionalList.length})
            </button>
            <button
              type="button"
              className={`btn-keparahan text-red ${filterKeparahan === 'eskalasi' ? 'active' : ''}`}
              onClick={() => setFilterKeparahan('eskalasi')}
            >
              🚨 Butuh Eskalasi ({wilayahNasionalList.filter((w) => w.butuhEskalasi).length})
            </button>
            <button
              type="button"
              className={`btn-keparahan ${filterKeparahan === 'kritis' ? 'active' : ''}`}
              onClick={() => setFilterKeparahan('kritis')}
            >
              Kritis
            </button>
          </div>

          <div className="map-layer-switcher">
            <button
              type="button"
              className={`btn-layer-choice ${activeLayer === 'standar' ? 'active' : ''}`}
              onClick={() => setActiveLayer('standar')}
            >
              Standar GIS
            </button>
            <button
              type="button"
              className={`btn-layer-choice ${activeLayer === 'satelit' ? 'active' : ''}`}
              onClick={() => setActiveLayer('satelit')}
            >
              Satelit
            </button>
            <button
              type="button"
              className={`btn-layer-choice ${activeLayer === 'osm' ? 'active' : ''}`}
              onClick={() => setActiveLayer('osm')}
            >
              Topografi
            </button>
          </div>

          <button
            type="button"
            className="btn-map-reset-zoom"
            onClick={handleResetView}
            title="Reset Peta ke Seluruh Indonesia"
          >
            <Maximize2 size={14} />
            <span>Nusantara</span>
          </button>
        </div>
      </div>

      {/* MAP VIEW CONTAINER */}
      <div className="national-map-viewport-wrapper">
        <div ref={mapContainerRef} className="national-leaflet-map-canvas" />

        {/* QUICK REGION JUMP BAR (BOTTOM FLOATING) */}
        <div className="map-floating-quick-bar">
          <span className="quick-bar-label">Fokus Cepat:</span>
          {wilayahNasionalList.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`btn-quick-region ${selectedWilayahNasional?.id === w.id ? 'active' : ''} ${w.butuhEskalasi ? 'needs-escalation' : ''}`}
              onClick={() => handleFlyTo(w)}
            >
              <span className={`quick-dot status-${w.keparahan}`} />
              <span className="quick-name">{w.nama}</span>
              {w.butuhEskalasi && <span className="quick-badge-escalate">!</span>}
            </button>
          ))}
        </div>
      </div>

      {/* SELECTED REGION MINI DOSSIER DRAWER (IF SELECTED) */}
      {selectedWilayahNasional && (
        <div className="national-selected-dossier-bar">
          <div className="dossier-left-info">
            <div className="dossier-rank-badge">
              <span>PRIORITAS #{selectedWilayahNasional.rank}</span>
            </div>
            <div>
              <h4 className="dossier-region-name">
                {selectedWilayahNasional.nama} ({selectedWilayahNasional.provinsi})
              </h4>
              <p className="dossier-disaster-info">
                <strong>{selectedWilayahNasional.jenisBencana}</strong> — {selectedWilayahNasional.kejadianAktif} titik kejadian aktif
              </p>
            </div>
          </div>

          <div className="dossier-stats-pill-row">
            <div className="dossier-stat-pill">
              <span className="stat-num">{selectedWilayahNasional.wargaTerdampak.toLocaleString('id-ID')}</span>
              <span className="stat-label">Warga Terdampak</span>
            </div>
            <div className="dossier-stat-pill">
              <span className="stat-num">{selectedWilayahNasional.wargaMengungsi.toLocaleString('id-ID')}</span>
              <span className="stat-label">Pengungsi</span>
            </div>
            <div className="dossier-stat-pill">
              <span className="stat-num text-amber">{selectedWilayahNasional.kapasitas.stokLogistikPersen}%</span>
              <span className="stat-label">Stok Logistik</span>
            </div>
          </div>

          <div className="dossier-actions-group">
            {selectedWilayahNasional.butuhEskalasi && (
              <button
                type="button"
                className="btn-dossier-escalate"
                onClick={() => setNationalActiveTab('permintaan')}
              >
                <Send size={14} />
                <span>Buka Permintaan Bantuan</span>
              </button>
            )}
            <button
              type="button"
              className="btn-dossier-capacity"
              onClick={() => setNationalActiveTab('kapasitas')}
            >
              <span>Bandingkan Kapasitas</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
