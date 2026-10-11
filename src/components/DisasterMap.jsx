import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Package, Compass, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './DisasterMap.css'

function getDisasterIconSvg(jenis, color) {
  let innerIcon = ''
  if (/banjir/i.test(jenis)) {
    innerIcon = `<path d="M2 13c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5-2 5 0M2 18c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5-2 5 0" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>`
  } else if (/longsor/i.test(jenis)) {
    innerIcon = `<path d="M3 19l8-14 8 14H3zM7 19l4-7 4 7H7z" fill="white"/>`
  } else if (/kebakaran/i.test(jenis)) {
    innerIcon = `<path d="M12 2c0 4-4 6-4 10a6 6 0 0 0 12 0c0-4-4-6-4-10z" fill="white"/>`
  } else if (/gempa/i.test(jenis)) {
    innerIcon = `<path d="M3 12h4l3-7 4 14 3-7h4" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
  } else {
    innerIcon = `<circle cx="12" cy="12" r="5" fill="white"/>`
  }

  return `
    <div class="custom-marker-wrapper">
      <div class="custom-marker-pulse" style="background-color: ${color}"></div>
      <div class="custom-marker-pin" style="background-color: ${color}">
        <svg viewBox="0 0 24 24" width="18" height="18">
          ${innerIcon}
        </svg>
      </div>
    </div>
  `
}

function getPoskoIconSvg(kategori) {
  let bgColor = '#15803d' 
  let iconSvg = ''

  if (kategori === 'posko') {
    bgColor = '#16a34a'
    iconSvg = `<path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zM10 13v4H8v-4H5v-2h3V7h2v4h3v2h-3z" fill="white"/>`
  } else if (kategori === 'faskes') {
    bgColor = '#dc2626'
    iconSvg = `<path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" fill="white"/>`
  } else {
    bgColor = '#0284c7'
    iconSvg = `<path d="M20 7l-8-4-8 4 8 4 8-4zm-8 6l-8-4v6l8 4 8-4v-6l-8 4z" fill="white"/>`
  }

  return `
    <div class="custom-marker-wrapper">
      <div class="custom-marker-pin shelter-pin" style="background-color: ${bgColor}">
        <svg viewBox="0 0 24 24" width="16" height="16">
          ${iconSvg}
        </svg>
      </div>
    </div>
  `
}

// 3 PILIHAN MODEL PETA: STANDAR, SATELIT, MEDAN
const FREE_MAP_LAYERS = {
  standar: {
    id: 'standar',
    label: 'Standar',
    icon: '🗺️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, OpenStreetMap contributors',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  satelit: {
    id: 'satelit',
    label: 'Satelit',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 18,
  },
  medan: {
    id: 'medan',
    label: 'Medan',
    icon: '⛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, USGS',
    maxZoom: 19,
  },
}

export default function DisasterMap() {
  const {
    laporan,
    poskoList,
    selectedId,
    setSelectedId,
    pickingLocation,
    setPickingLocation,
    pickedCoords,
    setPickedCoords,
    setShowForm,
    validasiKomunitas,
    setActiveTab,
  } = useApp()

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersLayerRef = useRef(null)
  const circlesLayerRef = useRef(null)
  const pickMarkerRef = useRef(null)
  const currentTileLayerRef = useRef(null)

  const [activeTileLayer, setActiveTileLayer] = useState('standar')
  const [filterType, setFilterType] = useState('semua')
  const [showShelters, setShowShelters] = useState(true)
  const [showZones, setShowZones] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [searchNotice, setSearchNotice] = useState(null)
  const [isNeedsCollapsed, setIsNeedsCollapsed] = useState(false)

  // Filter posko paling membutuhkan logistik / kapasitas kritis
  const poskoMembutuhkan = (poskoList || [])
    .filter((p) => {
      if (p.kategori === 'faskes') return false
      const ratio = p.kapasitas ? Number(p.terisi || 0) / Number(p.kapasitas) : 0
      return ratio >= 0.75 || (p.statusPasokan && /penuh|perlu|kurang|defisit|butuh/i.test(p.statusPasokan))
    })
    .sort((a, b) => {
      const ratioA = a.kapasitas ? Number(a.terisi || 0) / Number(a.kapasitas) : 0
      const ratioB = b.kapasitas ? Number(b.terisi || 0) / Number(b.kapasitas) : 0
      return ratioB - ratioA
    })
    .slice(0, 3)

  const handleFocusPosko = (p) => {
    if (mapInstanceRef.current && p.lat && p.lng) {
      mapInstanceRef.current.flyTo([p.lat, p.lng], 16, { duration: 1.2 })
    }
  }
  const [pickedAddressName, setPickedAddressName] = useState('')

  // Menghubungkan tombol voting konfirmasi warga pada popup HTML Leaflet
  useEffect(() => {
    window.salingjagaVote = (reportId, type) => {
      if (validasiKomunitas) {
        validasiKomunitas(reportId, type)
      }
    }
    return () => {
      delete window.salingjagaVote
    }
  }, [validasiKomunitas])

  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-0.7893, 113.9213],
      zoom: 5,
      zoomControl: false,
    })

    const initialConfig = FREE_MAP_LAYERS[activeTileLayer] || FREE_MAP_LAYERS.standar
    const tileLayer = L.tileLayer(initialConfig.url, {
      attribution: initialConfig.attribution,
      subdomains: initialConfig.subdomains || 'abc',
      maxZoom: initialConfig.maxZoom,
    }).addTo(map)
    currentTileLayerRef.current = tileLayer

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const markersGroup = L.featureGroup().addTo(map)
    const circlesGroup = L.featureGroup().addTo(map)

    markersLayerRef.current = markersGroup
    circlesLayerRef.current = circlesGroup
    mapInstanceRef.current = map

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      const coords = { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) }
      setPickedCoords(coords)

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`,
          { headers: { 'Accept-Language': 'id' } }
        )
        const data = await res.json()
        if (data && data.display_name) {
          const parts = []
          if (data.address?.road) parts.push(data.address.road)
          if (data.address?.village || data.address?.suburb) parts.push(data.address.village || data.address.suburb)
          if (data.address?.city || data.address?.county) parts.push(data.address.city || data.address.county)
          const name = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 2).join(',')
          setPickedAddressName(name)
        }
      } catch {
        setPickedAddressName('')
      }
    })

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current === map) map.invalidateSize()
    }, 250)

    return () => {
      clearTimeout(resizeTimer)
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current)
    }
    const config = FREE_MAP_LAYERS[activeTileLayer] || FREE_MAP_LAYERS.standar
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || 'abc',
      maxZoom: config.maxZoom,
    }).addTo(mapInstanceRef.current)
    newLayer.bringToBack()
    currentTileLayerRef.current = newLayer
  }, [activeTileLayer])

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    const q = searchQuery.toLowerCase().trim()

    const localMatch =
      laporan.find((l) => l.lokasi.toLowerCase().includes(q) || l.jenis.toLowerCase().includes(q)) ||
      poskoList.find((p) => p.nama.toLowerCase().includes(q))

    if (localMatch && localMatch.lat && localMatch.lng) {
      mapInstanceRef.current?.flyTo([localMatch.lat, localMatch.lng], 15, { duration: 1.2 })
      if (localMatch.id) setSelectedId(localMatch.id)
      setSearchNotice(`Menemukan titik: ${localMatch.nama || localMatch.jenis + ' - ' + localMatch.lokasi}`)
      setTimeout(() => setSearchNotice(null), 4000)
      return
    }

    setSearchingAddress(true)
    setSearchNotice('Mencari koordinat wilayah di OpenStreetMap (Gratis)...')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=id&limit=1`,
        { headers: { 'Accept-Language': 'id' } }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const targetLat = parseFloat(lat)
        const targetLng = parseFloat(lon)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([targetLat, targetLng], 14, { duration: 1.5 })
          L.popup()
            .setLatLng([targetLat, targetLng])
            .setContent(
              `<div style="font-family: inherit; font-size: 0.85rem; padding: 4px;">
                <b style="color: #0f4a2b;">📍 Wilayah Ditemukan</b><br/>
                <span style="color: #334155;">${display_name}</span>
              </div>`
            )
            .openOn(mapInstanceRef.current)
          setSearchNotice(`Menuju: ${display_name.split(',').slice(0, 2).join(',')}`)
          setTimeout(() => setSearchNotice(null), 5000)
        }
      } else {
        setSearchNotice('Lokasi tidak ditemukan di wilayah Indonesia.')
        setTimeout(() => setSearchNotice(null), 4000)
      }
    } catch {
      setSearchNotice('Gagal menghubungkan ke server pencarian OpenStreetMap.')
      setTimeout(() => setSearchNotice(null), 4000)
    } finally {
      setSearchingAddress(false)
    }
  }

  useEffect(() => {
    if (!pickingLocation) return
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize()
      const t = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 300)
      return () => clearTimeout(t)
    }
  }, [pickingLocation])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    if (pickedCoords) {
      const popupHtml = `<b>📍 Titik Bencana Ditandai</b><br>Lat: ${pickedCoords.lat}<br>Lng: ${pickedCoords.lng}${pickedAddressName ? `<br><small style="color: #065f46; font-weight: 600;">${pickedAddressName}</small>` : ''}`

      if (pickMarkerRef.current) {
        pickMarkerRef.current.setLatLng([pickedCoords.lat, pickedCoords.lng])
        pickMarkerRef.current.setPopupContent(popupHtml).openPopup()
      } else {
        const pinIcon = L.divIcon({
          className: 'pick-pin-icon',
          html: `<div class="picked-pin-pulse"></div><div class="picked-pin-center">📍</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        const marker = L.marker([pickedCoords.lat, pickedCoords.lng], { icon: pinIcon }).addTo(map)
        marker.bindPopup(popupHtml).openPopup()
        pickMarkerRef.current = marker
      }
    } else if (pickMarkerRef.current) {
      pickMarkerRef.current.remove()
      pickMarkerRef.current = null
    }
  }, [pickedCoords, pickedAddressName])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !circlesLayerRef.current) return

    const markersGroup = markersLayerRef.current
    const circlesGroup = circlesLayerRef.current

    markersGroup.clearLayers()
    circlesGroup.clearLayers()

    let filteredLaporan = laporan
    if (filterType === 'kritis') {
      filteredLaporan = laporan.filter((l) => l.analisisAI?.prioritas === 'kritis')
    } else if (filterType !== 'semua' && filterType !== 'posko') {
      filteredLaporan = laporan.filter((l) => l.jenis.toLowerCase().includes(filterType.toLowerCase()))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filteredLaporan = filteredLaporan.filter(
        (l) => l.lokasi.toLowerCase().includes(q) || l.jenis.toLowerCase().includes(q)
      )
    }

    if (filterType !== 'posko') {
      filteredLaporan.forEach((item) => {
        if (!item.lat || !item.lng) return

        const prio = item.analisisAI?.prioritas || 'sedang'
        let color = '#ca8a04' 
        if (prio === 'kritis') color = '#dc2626'
        else if (prio === 'tinggi') color = '#ea580c'
        else if (prio === 'rendah') color = '#16a34a'

        const customIcon = L.divIcon({
          className: 'disaster-map-icon',
          html: getDisasterIconSvg(item.jenis, color),
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })

        const marker = L.marker([item.lat, item.lng], { icon: customIcon })

        const yaCount = item.konfirmasiWarga || (item.voteYa && item.voteYa.length) || 1
        const tidakCount = item.laporanHoaks || (item.voteTidak && item.voteTidak.length) || 0
        const isVerifiedCommunity = yaCount >= 3 || (item.statusVerifikasi && item.statusVerifikasi.includes('Terverifikasi'))
        const isRemoteReport = item.isLocalReporter === false || (item.jarakPelaporKm && item.jarakPelaporKm > 15)

        const popupContent = `
          <div class="map-popup-card">
            <div class="map-popup-badge-row">
              <span class="popup-badge ${prio}">Prioritas ${prio.toUpperCase()}</span>
              <span class="popup-status">${item.status}</span>
            </div>

            <!-- Validasi Komunitas (Anti-Laporan Fiktif) -->
            <div class="map-popup-trust-row">
              <span class="popup-trust-tag ${isVerifiedCommunity ? 'tag-verified' : isRemoteReport ? 'tag-remote' : 'tag-pending'}">
                ${isVerifiedCommunity ? '🛡️ Terverifikasi Warga (' + yaCount + ' Valid)' : isRemoteReport ? '🛰️ Laporan Jarak Jauh (~' + (item.jarakPelaporKm || 20) + ' km)' : '🟡 Butuh Konfirmasi (' + yaCount + '/3 Warga)'}
              </span>
            </div>

            <h4 class="map-popup-title">${item.jenis}</h4>
            <div class="map-popup-loc">📍 ${item.lokasi}</div>
            
            <div class="map-popup-stats">
              <div class="popup-stat-item">
                <strong>${item.jumlahWarga}</strong>
                <span>Warga Terdampak</span>
              </div>
              <div class="popup-stat-item">
                <strong>${item.balitaDanLansia || 0}</strong>
                <span>Balita/Lansia</span>
              </div>
              <div class="popup-stat-item">
                <strong>${item.korbanLuka || 0}</strong>
                <span>Luka/Medis</span>
              </div>
            </div>

            <p class="map-popup-desc">${item.kondisi.substring(0, 110)}...</p>

            <!-- Tombol Konfirmasi Warga Langsung di Peta -->
            <div class="map-popup-vote-actions">
              <button type="button" class="btn-popup-vote-btn vote-yes" onclick="window.salingjagaVote && window.salingjagaVote('${item.id}', 'ya')" title="Konfirmasi musibah ini benar ada di lokasi">
                👍 Benar Ada (${yaCount})
              </button>
              <button type="button" class="btn-popup-vote-btn vote-no" onclick="window.salingjagaVote && window.salingjagaVote('${item.id}', 'tidak')" title="Tandai laporan fiktif atau hoaks">
                👎 Hoaks (${tidakCount})
              </button>
            </div>

          </div>
        `

        marker.bindPopup(popupContent, { maxWidth: 320, className: 'salingjaga-map-popup' })

        marker.on('popupopen', () => {
          setSelectedId(item.id)
        })

        markersGroup.addLayer(marker)

        if (showZones && item.radius) {
          const circleColor = prio === 'kritis' ? '#ef4444' : prio === 'tinggi' ? '#f97316' : '#eab308'
          const circle = L.circle([item.lat, item.lng], {
            radius: item.radius,
            color: circleColor,
            weight: 2,
            opacity: 0.8,
            fillColor: circleColor,
            fillOpacity: 0.12,
            dashArray: '4, 8',
          })
          circlesGroup.addLayer(circle)
        }
      })
    }

    if (showShelters && (filterType === 'semua' || filterType === 'posko')) {
      poskoList.forEach((posko) => {
        const shelterIcon = L.divIcon({
          className: 'shelter-map-icon',
          html: getPoskoIconSvg(posko.kategori),
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const shelterMarker = L.marker([posko.lat, posko.lng], { icon: shelterIcon })
        const badgeLabel =
          posko.kategori === 'posko' ? 'Posko Evakuasi' : posko.kategori === 'faskes' ? 'Fasilitas Medis' : 'Depo Logistik'

        const shelterPopup = `
          <div class="map-popup-card">
            <div class="map-popup-badge-row">
              <span class="popup-badge shelter-badge">${badgeLabel}</span>
              <span class="popup-status">${posko.statusPasokan}</span>
            </div>
            <h4 class="map-popup-title">${posko.nama}</h4>
            <div class="map-popup-stats">
              <div class="popup-stat-item">
                <strong>${posko.terisi} / ${posko.kapasitas}</strong>
                <span>Kapasitas Jiwa</span>
              </div>
              <div class="popup-stat-item">
                <strong>${posko.fasilitas.length}</strong>
                <span>Fasilitas Terpasang</span>
              </div>
            </div>
            <ul class="shelter-facility-list">
              ${posko.fasilitas.map((f) => `<li>✓ ${f}</li>`).join('')}
            </ul>
            <div class="shelter-contact">📞 Koordinator: ${posko.kontak}</div>
          </div>
        `
        shelterMarker.bindPopup(shelterPopup, { maxWidth: 320, className: 'salingjaga-map-popup' })
        markersGroup.addLayer(shelterMarker)
      })
    }
  }, [
    laporan,
    poskoList,
    filterType,
    showShelters,
    showZones,
    searchQuery,
    setSelectedId,
  ])

  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return
    const item =
      laporan.find((l) => l.id === selectedId) ||
      poskoList.find((p) => p.id === selectedId)
    if (item && item.lat && item.lng) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 14, { duration: 1 })
    }
  }, [selectedId, laporan, poskoList])

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung pada browser ini.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 15)
          const myPosMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            color: '#10b981',
            fillColor: '#34d399',
            fillOpacity: 0.9,
          }).addTo(mapInstanceRef.current)
          myPosMarker.bindPopup('<b>Posisi Anda Saat Ini</b>').openPopup()
        }
      },
      (err) => {
        alert('Tidak dapat mendeteksi lokasi: ' + err.message)
      }
    )
  }

  return (
    <div className="disaster-map-wrapper">
      {/* TOOLBAR ASLI DENGAN PILIHAN MODEL PETA LEBIH LENGKAP */}
      <div className="map-toolbar-clean">
        <form className="map-search-box-clean" onSubmit={handleSearchSubmit}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Cari desa, kota, bencana, atau alamat di Indonesia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
          <button type="submit" className="btn-search-go" disabled={searchingAddress} title="Cari lokasi di peta">
            {searchingAddress ? '⏳...' : 'Cari'}
          </button>
        </form>

        {/* 3 PILIHAN MODEL PETA: STANDAR, SATELIT, MEDAN */}
        <div className="map-layer-pills-clean" role="group" aria-label="Pilihan Model Peta">
          {Object.values(FREE_MAP_LAYERS).map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`clean-pill layer-pill ${activeTileLayer === layer.id ? 'active' : ''}`}
              onClick={() => setActiveTileLayer(layer.id)}
              title={`Ganti peta ke model ${layer.label}`}
            >
              <span className="layer-pill-icon">{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          ))}
        </div>

        <div className="map-filter-pills-clean">
          <button
            className={`clean-pill ${filterType === 'semua' ? 'active' : ''}`}
            onClick={() => { setFilterType('semua'); setShowShelters(true); }}
          >
            Semua
          </button>
          <button
            className={`clean-pill pill-danger ${filterType === 'kritis' ? 'active' : ''}`}
            onClick={() => { setFilterType('kritis'); setShowShelters(false); }}
          >
            Kritis
          </button>
          <button
            className={`clean-pill pill-safe ${filterType === 'posko' ? 'active' : ''}`}
            onClick={() => { setFilterType('posko'); setShowShelters(true); }}
          >
            Posko
          </button>
        </div>

        <button className="btn-locate-clean" onClick={handleLocateMe} title="Temukan Posisi Saya">
          Posisi Saya
        </button>
      </div>

      {searchNotice && (
        <div className="map-search-notice-banner">
          <span>{searchingAddress ? '🔄' : '📌'}</span>
          <span>{searchNotice}</span>
        </div>
      )}

      {pickingLocation && (
        <div className="picking-banner" role="status" aria-live="polite">
          <div className="picking-info">
            <span className="pulse-dot-ping" />
            <div>
              <div className="picking-mode-title">
                <strong>📍 Mode Tandai Titik Bencana:</strong> Klik langsung lokasi pada peta.
              </div>
              {pickedCoords ? (
                <div className="picked-addr-badge">
                  🎯 Titik Ditandai: <strong>{pickedAddressName || `Koordinat (${pickedCoords.lat}, ${pickedCoords.lng})`}</strong>
                </div>
              ) : (
                <div className="picked-hint-text">
                  👆 Belum ada titik dipilih — silakan klik lokasi manapun pada peta.
                </div>
              )}
            </div>
          </div>
          <div className="picking-actions">
            <button
              type="button"
              className="btn-use-coords"
              disabled={!pickedCoords}
              onClick={() => {
                setShowForm(true)
                setPickingLocation(false)
              }}
              title={pickedCoords ? 'Gunakan koordinat ini dan kembali ke formulir' : 'Klik lokasi pada peta terlebih dahulu'}
            >
              ✅ Gunakan Titik Ini
            </button>
            <button
              type="button"
              className="btn-cancel-pick"
              onClick={() => {
                setPickingLocation(false)
                setShowForm(true)
              }}
              title="Batal menandai dan kembali ke formulir"
            >
              Kembali ke Form
            </button>
          </div>
        </div>
      )}

      <div className="map-bottom-bar-clean">
        <div className="map-legend-clean">
          <span className="leg-item"><span className="leg-dot dot-red" /> Bencana</span>
          <span className="leg-item"><span className="leg-dot dot-green" /> Posko & Evakuasi</span>
          <span className="leg-item"><span className="leg-dot dot-blue" /> Faskes Medis</span>
        </div>
      </div>

      <div
        id="disaster-leaflet-map"
        ref={mapContainerRef}
        className={`map-canvas ${pickingLocation ? 'is-picking-location' : ''}`}
      />

      {/* PANEL KECIL DI PETA: POSKO PALING MEMBUTUHKAN LOGISTIK */}
      {poskoMembutuhkan.length > 0 && (
        <aside
          className={`map-needs-panel ${isNeedsCollapsed ? 'collapsed' : ''}`}
          aria-label="Panel posko paling membutuhkan bantuan logistik"
        >
          <div
            className="needs-panel-header"
            onClick={() => setIsNeedsCollapsed(!isNeedsCollapsed)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setIsNeedsCollapsed(!isNeedsCollapsed)
            }}
          >
            <div className="needs-panel-title">
              <Package size={15} className="needs-title-icon" />
              <span>Posko Paling Membutuhkan</span>
              <span className="needs-count-pill">{poskoMembutuhkan.length}</span>
            </div>
            <button
              type="button"
              className="btn-toggle-needs-panel"
              onClick={(e) => {
                e.stopPropagation()
                setIsNeedsCollapsed(!isNeedsCollapsed)
              }}
              title={isNeedsCollapsed ? 'Buka panel posko membutuhkan' : 'Ciutkan panel'}
              aria-label={isNeedsCollapsed ? 'Buka panel' : 'Ciutkan panel'}
            >
              {isNeedsCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {!isNeedsCollapsed && (
            <div className="needs-panel-content">
              {poskoMembutuhkan.map((p) => {
                const ratio = p.kapasitas ? Math.round((Number(p.terisi || 0) / Number(p.kapasitas)) * 100) : 0
                const remaining = Math.max(0, Number(p.kapasitas || 0) - Number(p.terisi || 0))
                const isCritical = ratio >= 90
                return (
                  <div key={p.id || p.nama} className="needs-item-row">
                    <div className="needs-row-top">
                      <strong className="needs-item-name">{p.nama}</strong>
                      <span className={`needs-capacity-pill ${isCritical ? 'critical' : 'warning'}`}>
                        {remaining} jiwa tersisa
                      </span>
                    </div>
                    <p className="needs-item-status">
                      <strong>Kebutuhan Terdesak:</strong> {p.kebutuhanTerdesak || p.statusPasokan || 'Makanan bayi, Matras, Air mineral'}
                    </p>
                    <div className="needs-item-actions">
                      <button
                        type="button"
                        className="btn-needs-action-map"
                        onClick={() => handleFocusPosko(p)}
                        title="Arahkan peta ke posko ini"
                      >
                        <Compass size={11} /> Titik Peta
                      </button>
                      <button
                        type="button"
                        className="btn-needs-action-logistics"
                        onClick={() => setActiveTab && setActiveTab('logistics')}
                        title="Buka inventaris logistik di tab Gudang Logistik"
                      >
                        <ArrowRight size={11} /> Pasok Logistik
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
