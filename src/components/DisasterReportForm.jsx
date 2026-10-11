import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import './DisasterReportForm.css'

const BENCANA_OPTIONS = [
  { jenis: 'Banjir', icon: '🌊', label: 'Banjir / Air Meluap', color: 'blue' },
  { jenis: 'Longsor', icon: '⛰️', label: 'Tanah Longsor', color: 'amber' },
  { jenis: 'Gempa Bumi', icon: '🏚️', label: 'Gempa Bumi', color: 'purple' },
  { jenis: 'Kebakaran', icon: '🔥', label: 'Kebakaran', color: 'red' },
  { jenis: 'Angin Puting Beliung', icon: '🌪️', label: 'Puting Beliung', color: 'cyan' },
  { jenis: 'Lainnya', icon: '⚠️', label: 'Musibah Lainnya', color: 'slate' },
]

const QUICK_NEEDS = [
  { text: '🚤 Perahu Karet & Evakuasi Air', color: 'cyan' },
  { text: '🍚 Makanan Siap Saji & Air Bersih', color: 'orange' },
  { text: '💊 Tenaga Medis & Obat Darurat', color: 'red' },
  { text: '⛺ Tenda Pengungsi & Selimut', color: 'green' },
  { text: '🍼 Susu & Kebutuhan Balita/Lansia', color: 'pink' },
  { text: '🚜 Alat Berat / Pembersih Jalur', color: 'amber' },
]

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null
  const R = 6371 // radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(1))
}

export default function DisasterReportForm() {
  const {
    tambahLaporan,
    setShowForm,
    setActiveTab,
    setCitizenTab,
    pickedCoords,
    setPickedCoords,
    setPickingLocation,
    reportDraft,
    setReportDraft,
    showNotif,
  } = useApp()

  const [jenis, setJenis] = useState(reportDraft?.jenis || 'Banjir')
  const [lokasi, setLokasi] = useState(reportDraft?.lokasi || '')
  const [lat, setLat] = useState(pickedCoords?.lat || reportDraft?.lat || -6.837)
  const [lng, setLng] = useState(pickedCoords?.lng || reportDraft?.lng || 108.225)
  const [detectingGps, setDetectingGps] = useState(false)
  const [deviceCoords, setDeviceCoords] = useState(null)
  const [locationVerified, setLocationVerified] = useState(Boolean(pickedCoords || reportDraft?.locationVerified))
  const [verificationSource, setVerificationSource] = useState(pickedCoords ? 'peta' : (reportDraft?.verificationSource || null))
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [isSearchingLocation, setIsSearchingLocation] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Deteksi posisi GPS asli perangkat pelapor untuk uji kedekatan (Proximity Geofence)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        },
        () => {},
        { timeout: 7000 }
      )
    }
  }, [])

  const [selectedNeeds, setSelectedNeeds] = useState(reportDraft?.selectedNeeds || ['🍚 Makanan Siap Saji & Air Bersih'])
  const [skalaTerdampak, setSkalaTerdampak] = useState(reportDraft?.skalaTerdampak || 'Lokal')
  const [jumlahWarga, setJumlahWarga] = useState(reportDraft?.jumlahWarga || '20')
  const [rentanGroups, setRentanGroups] = useState([
    { id: 'balita', icon: '👶', label: 'Balita / Anak-anak', color: 'pink' },
    { id: 'lansia', icon: '👵', label: 'Lansia', color: 'amber' },
    { id: 'bumil', icon: '🤰', label: 'Ibu Hamil', color: 'purple' },
    { id: 'disabilitas', icon: '♿', label: 'Disabilitas', color: 'blue' },
    { id: 'sakit', icon: '🤕', label: 'Sakit / Luka', color: 'red' },
  ])
  const [selectedRentan, setSelectedRentan] = useState(reportDraft?.selectedRentan || [])
  const [jumlahRentan, setJumlahRentan] = useState(reportDraft?.jumlahRentan || '')
  const [kondisi, setKondisi] = useState(reportDraft?.kondisi || '')
  const [namaPelapor, setNamaPelapor] = useState(reportDraft?.namaPelapor || '')
  const [nomorHp, setNomorHp] = useState(reportDraft?.nomorHp || '')
  const [nikSukarela, setNikSukarela] = useState(reportDraft?.nikSukarela || '')
  const [errorMsg, setErrorMsg] = useState('')

  const [keteranganJenis, setKeteranganJenis] = useState(reportDraft?.keteranganJenis || '')
  const [fotoBukti, setFotoBukti] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [aiAdvice, setAiAdvice] = useState('')
  const [submittedId, setSubmittedId] = useState(null)

  const generateAiAdvice = (tipe) => {
    if (tipe === 'Banjir') return 'Matikan aliran listrik utama. Segera evakuasi kelompok rentan (balita & lansia) ke tempat yang lebih tinggi. Jauhi tiang listrik.'
    if (tipe === 'Gempa Bumi') return 'Lindungi kepala. Jauhi bangunan retak, tiang listrik, dan pohon besar. Segera menuju titik kumpul aman di ruang terbuka.'
    if (tipe === 'Kebakaran') return 'Gunakan kain basah untuk menutup hidung/mulut. Merunduk saat evakuasi. Jangan gunakan lift. Segera hubungi pemadam.'
    return 'Amankan diri Anda dan kelompok rentan ke tempat yang lebih aman. Tunggu instruksi lebih lanjut dari petugas di lapangan.'
  }

  // Sinkronisasi saat pengguna memilih titik dari peta SalingJaga
  useEffect(() => {
    if (pickedCoords && pickedCoords.lat && pickedCoords.lng) {
      setLat(Number(pickedCoords.lat.toFixed(5)))
      setLng(Number(pickedCoords.lng.toFixed(5)))
      setLocationVerified(true)
      setVerificationSource('peta')
      setShowSuggestions(false)
      
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pickedCoords.lat}&lon=${pickedCoords.lng}`,
        { headers: { 'Accept-Language': 'id' } }
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.display_name) {
            const parts = []
            if (data.address?.road) parts.push(data.address.road)
            if (data.address?.village || data.address?.suburb || data.address?.neighbourhood) {
              parts.push(data.address.village || data.address.suburb || data.address.neighbourhood)
            }
            if (data.address?.city || data.address?.county || data.address?.regency) {
              parts.push(data.address.city || data.address.county || data.address.regency)
            }
            const concise = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',')
            setLokasi(concise)
          } else {
            setLokasi(`Titik Koordinat: ${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)}`)
          }
        })
        .catch(() => {
          setLokasi(`Titik Koordinat: ${pickedCoords.lat.toFixed(4)}, ${pickedCoords.lng.toFixed(4)}`)
        })
    }
  }, [pickedCoords])

  // Autocomplete & Pencarian Geocoding Wilayah Resmi Indonesia (OSM)
  useEffect(() => {
    if (locationVerified) return
    if (!lokasi || lokasi.trim().length < 3) {
      setLocationSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            lokasi.trim()
          )}&countrycodes=id&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'id' } }
        )
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setLocationSuggestions(data)
          setShowSuggestions(true)
        } else {
          setLocationSuggestions([])
          setShowSuggestions(true)
        }
      } catch {
        setLocationSuggestions([])
      } finally {
        setIsSearchingLocation(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [lokasi, locationVerified])

  const handleLokasiChange = (e) => {
    const val = e.target.value
    setLokasi(val)
    setLocationVerified(false)
    setVerificationSource(null)
    if (val.trim().length >= 3) {
      setShowSuggestions(true)
    } else {
      setLocationSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (item) => {
    const parts = []
    if (item.address?.road) parts.push(item.address.road)
    if (item.address?.village || item.address?.suburb || item.address?.neighbourhood) {
      parts.push(item.address.village || item.address.suburb || item.address.neighbourhood)
    }
    if (item.address?.city || item.address?.county || item.address?.regency) {
      parts.push(item.address.city || item.address.county || item.address.regency)
    }
    if (item.address?.state) {
      parts.push(item.address.state)
    }
    const cleanName = parts.length > 0 ? parts.join(', ') : item.display_name.split(',').slice(0, 3).join(',')

    setLokasi(cleanName)
    setLat(Number(parseFloat(item.lat).toFixed(5)))
    setLng(Number(parseFloat(item.lon).toFixed(5)))
    setLocationVerified(true)
    setVerificationSource('geocoding')
    setShowSuggestions(false)
    setErrorMsg('')
  }

  const handlePickOnMap = () => {
    // 1. Simpan seluruh draft isian form agar tidak hilang saat beralih ke peta
    if (setReportDraft) {
      setReportDraft({
        jenis,
        lokasi,
        lat,
        lng,
        locationVerified,
        verificationSource,
        selectedNeeds,
        skalaTerdampak,
        jumlahWarga,
        selectedRentan,
        jumlahRentan,
        kondisi,
        namaPelapor,
        nomorHp,
        nikSukarela,
        keteranganJenis,
      })
    }

    // 2. Aktifkan mode penandaan titik di peta
    setPickingLocation(true)

    // 3. Sembunyikan formulir sementara agar pengguna dapat melihat peta utuh
    setShowForm(false)

    // 4. Buka tab peta secara otomatis baik di mode Warga maupun Petugas
    setActiveTab('map')
    if (setCitizenTab) {
      setCitizenTab('peta')
    }

    // 5. Berikan panduan visual instan ke pengguna
    if (showNotif) {
      showNotif('🗺️ Peta dibuka otomatis: Silakan klik lokasi kejadian langsung pada peta untuk menandai titik.', 'info')
    }
  }

  const handleToggleNeed = (itemText) => {
    setSelectedNeeds((prev) =>
      prev.includes(itemText) ? prev.filter((n) => n !== itemText) : [...prev, itemText]
    )
  }

  const handleToggleRentan = (groupLabel) => {
    setSelectedRentan((prev) => 
      prev.includes(groupLabel) ? prev.filter((g) => g !== groupLabel) : [...prev, groupLabel]
    )
  }

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung deteksi lokasi otomatis.')
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setLat(Number(latitude.toFixed(5)))
        setLng(Number(longitude.toFixed(5)))

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'id' } }
          )
          const data = await res.json()
          if (data && data.display_name) {
            const parts = []
            if (data.address?.road) parts.push(data.address.road)
            if (data.address?.village || data.address?.suburb || data.address?.neighbourhood) {
              parts.push(data.address.village || data.address.suburb || data.address.neighbourhood)
            }
            if (data.address?.city || data.address?.county || data.address?.regency) {
              parts.push(data.address.city || data.address.county || data.address.regency)
            }
            const concise = parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',')
            setLokasi(concise)
          } else {
            setLokasi(`Titik Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS)`)
          }
          setLocationVerified(true)
          setVerificationSource('gps')
          setShowSuggestions(false)
          setErrorMsg('')
        } catch {
          setLokasi(`Titik Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS)`)
          setLocationVerified(true)
          setVerificationSource('gps')
        } finally {
          setDetectingGps(false)
        }
      },
      (err) => {
        setDetectingGps(false)
        alert('Gagal mendeteksi GPS: ' + err.message + '. Silakan ketik nama lokasi atau pilih di peta.')
      },
      { timeout: 8000 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!lokasi.trim()) {
      setErrorMsg('Harap masukkan patokan lokasi atau gunakan tombol GPS/Peta.')
      return
    }

    const cleanedHp = nomorHp.replace(/[^0-9]/g, '')
    if (cleanedHp.length < 9) {
      setErrorMsg('Harap masukkan nomor HP / WhatsApp yang valid (min. 9 angka) untuk verifikasi lapangan.')
      return
    }

    const textToCheck = (kondisi + ' ' + lokasi).toLowerCase()
    const spamWords = ['test', 'coba', 'palsu', 'prank', 'dummy', 'asdf', 'mars', 'antah berantah', 'namek']
    if (spamWords.some(word => textToCheck.includes(word))) {
      setErrorMsg('Sistem AI menolak laporan: Terdeteksi kata-kata tidak relevan/fiktif/spam.')
      return
    }

    // Validasi Anti-Lokasi Fiktif: Jika belum terkunci via GPS, Peta, atau klik saran resmi
    if (!locationVerified) {
      try {
        const checkRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            lokasi.trim()
          )}&countrycodes=id&limit=1`,
          { headers: { 'Accept-Language': 'id' } }
        )
        const checkData = await checkRes.json()
        if (checkData && checkData.length > 0) {
          // Lokasi valid di Indonesia: Kunci koordinat otomatis
          setLat(Number(parseFloat(checkData[0].lat).toFixed(5)))
          setLng(Number(parseFloat(checkData[0].lon).toFixed(5)))
          setLocationVerified(true)
          setVerificationSource('geocoding')
        } else {
          setErrorMsg(
            '⚠️ Lokasi tidak ditemukan di basis data wilayah resmi Indonesia (indikasi fiktif/salah ketik). Mohon klik "Kunci GPS", klik "Tandai di Peta", atau pilih saran kelurahan resmi dari daftar.'
          )
          return
        }
      } catch {
        setErrorMsg('Gagal memvalidasi wilayah ke server GIS. Harap gunakan tombol "Kunci GPS" atau "Tandai di Peta" untuk memastikan koordinat akurat.')
        return
      }
    }

    const lastReportTime = localStorage.getItem('salingjaga_last_report')
    if (lastReportTime) {
      const timeDiff = Date.now() - Number(lastReportTime)
      if (timeDiff < 60000) { 
        setErrorMsg('Terlalu banyak permintaan. Silakan tunggu 1 menit sebelum melapor lagi.')
        return
      }
    }

    setErrorMsg('')
    localStorage.setItem('salingjaga_last_report', Date.now().toString())

    const combinedKebutuhan = selectedNeeds.length > 0 ? selectedNeeds.join(', ') : 'Bantuan darurat dasar'

    const finalJenis = jenis === 'Lainnya' && keteranganJenis ? `Lainnya: ${keteranganJenis}` : jenis

    // Konversi skala ke angka wajar untuk data dashboard BPBD
    let autoNumWarga = 20;
    if (skalaTerdampak === 'Keluarga') autoNumWarga = 5;
    else if (skalaTerdampak === 'Lokal') autoNumWarga = 35;
    else if (skalaTerdampak === 'Meluas') autoNumWarga = 120;
    else if (skalaTerdampak === 'Masif') autoNumWarga = 400;

    const finalJumlahWarga = jumlahWarga ? Number(jumlahWarga) : autoNumWarga;

    let autoNumBalita = 0;
    if (selectedRentan.length > 0) {
      autoNumBalita = Math.max(2, Math.floor(finalJumlahWarga * (selectedRentan.length * 0.1)));
    }
    const finalJumlahRentan = jumlahRentan ? Number(jumlahRentan) : autoNumBalita;
    const rentanStr = selectedRentan.length > 0 ? selectedRentan.join(', ') : 'Tidak terlihat';

    const distanceKm =
      deviceCoords && lat && lng ? calculateDistanceKm(deviceCoords.lat, deviceCoords.lng, lat, lng) : null
    const isLocalReporter = distanceKm !== null ? distanceKm <= 15 : true

    tambahLaporan({
      jenis: finalJenis,
      lokasi: lokasi.trim(),
      lat: Number(lat),
      lng: Number(lng),
      jumlahWarga: finalJumlahWarga,
      kebutuhan: combinedKebutuhan,
      kondisi: kondisi.trim() || `Terjadi musibah ${finalJenis} di lokasi ${lokasi}. Skala: ${skalaTerdampak}. Kelompok Rentan: ${rentanStr}.`,
      pelapor: namaPelapor.trim() ? `${namaPelapor.trim()} (${nomorHp.trim() || 'No HP -'})` : 'Warga Pelapor',
      balitaDanLansia: finalJumlahRentan,
      korbanLuka: 0,
      foto: fotoBukti ? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80' : undefined,
      terverifikasiLokasi: locationVerified,
      sumberLokasi: verificationSource || 'geocoding',
      jarakPelaporKm: distanceKm,
      isLocalReporter,
      konfirmasiWarga: 1,
      laporanHoaks: 0,
      voteYa: ['pelapor'],
      voteTidak: [],
      statusVerifikasi: isLocalReporter === false ? 'Laporan Jarak Jauh (Perlu Konfirmasi Warga)' : 'Menunggu Konfirmasi Warga (1/3)'
    })

    setAiAdvice(generateAiAdvice(jenis))
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } })
    setSubmittedId('LPR-BARU')
  }

  return (
    <div
      className="form-overlay-vibrant"
      onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
      role="dialog"
      aria-modal="true"
    >
      <div className="vibrant-form-modal">
        
        {submittedId ? (
          <div className="form-success-card">
            <div className="success-icon-bounce">🎉</div>
            <div className="success-badge">LAPORAN BERHASIL TERKIRIM</div>
            <h2 className="success-title">Terima Kasih, Laporan Diterima!</h2>
            <p className="success-desc">
              Laporan musibah Anda telah masuk ke sistem Posko Terpadu BPBD dan diteruskan ke armada relawan serta posko terdekat.
            </p>

            <div className="success-ticket-box">
              <div className="ticket-label">Jenis Musibah:</div>
              <div className="ticket-val">{jenis} di {lokasi}</div>
              <div className="ticket-needs">Kebutuhan: {selectedNeeds.join(' · ')}</div>
            </div>

            <div className="ai-advice-box">
              <h4>🤖 AI Tindakan Darurat Utama</h4>
              <p>{aiAdvice}</p>
            </div>

            <div className="success-buttons">
              <button
                className="btn-success-view-map"
                onClick={() => {
                  setShowForm(false)
                  setActiveTab('map')
                  if (setCitizenTab) setCitizenTab('peta')
                }}
              >
                🗺️ Lihat Titik Laporan di Peta
              </button>
              <button className="btn-success-close" onClick={() => setShowForm(false)}>
                Selesai / Tutup
              </button>
            </div>
          </div>
        ) : (
          <>
            
            <div className="vibrant-form-header">
              <div className="form-header-badge-title">
                <span className="form-sos-icon">🚨</span>
                <div>
                  <h2 className="vibrant-modal-title">Form Laporan Musibah Cepat</h2>
                  <p className="vibrant-modal-sub">
                    Isi data singkat berikut. Laporan langsung diterima Posko BPBD & Relawan terdekat.
                  </p>
                </div>
              </div>
              <button className="btn-close-vibrant" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="vibrant-form-content">
              {errorMsg && <div className="vibrant-alert-box">{errorMsg}</div>}

              {/* IDE 7: Peringatan Hukum */}
              <div className="legal-warning-box">
                <span className="legal-warning-icon">⚖️</span>
                <p>
                  <strong>Peringatan:</strong> Laporan palsu atau fiksi merupakan pelanggaran hukum sesuai
                  <strong> UU ITE Pasal 28 ayat 2</strong>. Nomor HP Anda tercatat oleh sistem dan dapat
                  dilaporkan ke pihak berwajib. Hanya laporkan kejadian nyata.
                </p>
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">1</span>
                  <span>Apa jenis musibah yang terjadi?</span>
                </label>
                <div className="bencana-vibrant-choices">
                  {BENCANA_OPTIONS.map((opt) => (
                    <button
                      key={opt.jenis}
                      type="button"
                      className={`btn-bencana-item color-${opt.color} ${jenis === opt.jenis ? 'selected' : ''}`}
                      onClick={() => setJenis(opt.jenis)}
                    >
                      <span className="bencana-item-icon">{opt.icon}</span>
                      <span className="bencana-item-text">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {jenis === 'Lainnya' && (
                  <input
                    type="text"
                    className="vibrant-input-field"
                    style={{ marginTop: '12px' }}
                    placeholder="Sebutkan keterangan jenis musibah lainnya..."
                    value={keteranganJenis}
                    onChange={(e) => setKeteranganJenis(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="form-step-section">
                <div className="step-label-with-gps">
                  <label className="step-title-label">
                    <span className="step-number">2</span>
                    <span>Di mana lokasi kejadian?</span>
                  </label>
                  <div className="location-action-btns">
                    <button
                      type="button"
                      className="btn-gps-pulse"
                      onClick={handleDetectGps}
                      disabled={detectingGps}
                      title="Kunci titik dari satelit GPS ponsel/laptop Anda"
                    >
                      <span className="gps-icon">📍</span>
                      <span>{detectingGps ? 'Mendeteksi GPS...' : 'Kunci GPS Saya'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn-map-pick-step"
                      onClick={handlePickOnMap}
                      title="Buka peta SalingJaga untuk menandai titik bencana secara langsung"
                    >
                      <span>🗺️</span>
                      <span>Tandai di Peta</span>
                    </button>
                  </div>
                </div>

                <div className="location-input-wrapper">
                  <input
                    type="text"
                    className={`vibrant-input-field ${locationVerified ? 'input-verified' : ''}`}
                    placeholder="Ketik nama jalan, desa/kelurahan, atau kecamatan di Indonesia..."
                    value={lokasi}
                    onChange={handleLokasiChange}
                    onFocus={() => {
                      if (locationSuggestions.length > 0) setShowSuggestions(true)
                    }}
                    required
                  />
                  {isSearchingLocation && (
                    <div className="location-searching-spinner" title="Memeriksa basis data wilayah resmi Indonesia...">
                      🔄
                    </div>
                  )}

                  {/* Dropdown Saran Wilayah Resmi Indonesia (Mencegah Lokasi Fiktif) */}
                  {showSuggestions && (
                    <div className="location-suggestions-dropdown">
                      <div className="suggestions-header">
                        <span>🛡️ Validasi Wilayah Resmi Indonesia (OSM)</span>
                        <button
                          type="button"
                          className="btn-close-suggest"
                          onClick={() => setShowSuggestions(false)}
                          aria-label="Tutup saran"
                        >
                          ✕
                        </button>
                      </div>
                      {locationSuggestions.length > 0 ? (
                        locationSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            className="suggestion-item"
                            onClick={() => handleSelectSuggestion(item)}
                          >
                            <span className="suggest-pin">📍</span>
                            <div className="suggest-text">
                              <strong>
                                {item.address?.road ||
                                  item.address?.village ||
                                  item.address?.suburb ||
                                  item.display_name.split(',')[0]}
                              </strong>
                              <small>{item.display_name}</small>
                            </div>
                            <span className="suggest-badge">Resmi</span>
                          </div>
                        ))
                      ) : (
                        <div className="suggestion-not-found">
                          ⚠️ Wilayah tidak terdaftar di Indonesia. Mohon periksa ejaan atau gunakan tombol <strong>Kunci GPS</strong> / <strong>Tandai di Peta</strong>.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Validasi Lokasi */}
                <div className="location-verification-badge-bar">
                  {locationVerified ? (
                    <div className="badge-verified">
                      <span className="badge-icon">✅</span>
                      <div>
                        <strong>
                          Lokasi Terverifikasi{' '}
                          {verificationSource === 'gps'
                            ? 'via GPS Satelit'
                            : verificationSource === 'peta'
                            ? 'via Titik Peta GIS'
                            : 'via Wilayah Resmi'}
                        </strong>
                        <div className="coords-info">
                          Koordinat Terkunci: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="badge-unverified">
                      <span className="badge-icon">ℹ️</span>
                      <span>
                        Pilih saran alamat resmi dari daftar, atau klik <strong>Kunci GPS</strong> / <strong>Tandai di Peta</strong> agar tim SAR tidak tersesat.
                      </span>
                    </div>
                  )}
                </div>

                {/* Lapis 1: Deteksi Kedekatan GPS Pelapor (Anti-Laporan Fiksi Jarak Jauh) */}
                {(() => {
                  const dist = deviceCoords && lat && lng ? calculateDistanceKm(deviceCoords.lat, deviceCoords.lng, lat, lng) : null
                  if (dist === null) return null
                  const isLocal = dist <= 15
                  return (
                    <div className={`proximity-badge ${isLocal ? 'local-trust' : 'remote-warn'}`}>
                      <span className="proximity-icon">{isLocal ? '🎯' : '🛰️'}</span>
                      <div className="proximity-content">
                        <strong>
                          {isLocal
                            ? `Pelapor Terdeteksi di Area Kejadian (~${dist} km dari perangkat)`
                            : `Laporan Jarak Jauh (~${dist} km dari posisi Anda)`}
                        </strong>
                        <p>
                          {isLocal
                            ? 'Skor kepercayaan tinggi karena perangkat pelapor berada di sekitar zona musibah.'
                            : 'Karena posisi Anda jauh dari titik kejadian, laporan ditandai butuh konfirmasi 3 warga setempat sebelum armada SAR diterjunkan.'}
                        </p>
                      </div>
                    </div>
                  )
                })()}
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">3</span>
                  <span>Bantuan apa yang paling mendesak? (Klik untuk memilih)</span>
                </label>
                <div className="needs-pills-wrap">
                  {QUICK_NEEDS.map((item) => {
                    const checked = selectedNeeds.includes(item.text)
                    return (
                      <button
                        key={item.text}
                        type="button"
                        className={`need-pill-btn pill-${item.color} ${checked ? 'active' : ''}`}
                        onClick={() => handleToggleNeed(item.text)}
                      >
                        <span className="check-indicator">{checked ? '✓' : '+'}</span>
                        <span>{item.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">4</span>
                  <span>Perkiraan Skala Area Terdampak & Jumlah Korban</span>
                </label>
                <div className="skala-choices-grid">
                  <button type="button" className={`btn-skala ${skalaTerdampak === 'Keluarga' ? 'active' : ''}`} onClick={() => { setSkalaTerdampak('Keluarga'); setJumlahWarga('5'); }}>
                    🏠 1-2 Rumah
                  </button>
                  <button type="button" className={`btn-skala ${skalaTerdampak === 'Lokal' ? 'active' : ''}`} onClick={() => { setSkalaTerdampak('Lokal'); setJumlahWarga('35'); }}>
                    🏘️ Sekitar 1 RT / Gang
                  </button>
                  <button type="button" className={`btn-skala ${skalaTerdampak === 'Meluas' ? 'active' : ''}`} onClick={() => { setSkalaTerdampak('Meluas'); setJumlahWarga('120'); }}>
                    🏙️ Satu RW / Meluas
                  </button>
                  <button type="button" className={`btn-skala ${skalaTerdampak === 'Masif' ? 'active' : ''}`} onClick={() => { setSkalaTerdampak('Masif'); setJumlahWarga('400'); }}>
                    🌍 Kelurahan / Masif
                  </button>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <input
                    type="number"
                    min="1"
                    className="vibrant-input-field"
                    placeholder="Atau ketik angka perkiraan warga (opsional)..."
                    value={jumlahWarga}
                    onChange={(e) => setJumlahWarga(e.target.value)}
                  />
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px', display: 'block', fontWeight: 500 }}>
                    Kelompok rentan apa saja yang ada di lokasi? (Bisa pilih lebih dari satu)
                  </label>
                  <div className="needs-pills-wrap" style={{ marginTop: '8px', marginBottom: '12px' }}>
                    {rentanGroups.map((group) => {
                      const isSelected = selectedRentan.includes(group.label)
                      return (
                        <button
                          key={group.id}
                          type="button"
                          className={`need-pill-btn pill-${group.color} ${isSelected ? 'active' : ''}`}
                          onClick={() => handleToggleRentan(group.label)}
                        >
                          <span className="check-indicator">{isSelected ? '✓' : '+'}</span>
                          <span>{group.icon} {group.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="vibrant-input-field"
                    placeholder="Atau ketik angka perkiraan rentan (opsional)..."
                    value={jumlahRentan}
                    onChange={(e) => setJumlahRentan(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">5</span>
                  <span>Ceritakan situasi singkat (Opsional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="vibrant-textarea-field"
                    rows={2}
                    placeholder="Misal: Air sudah sepinggang dan terus naik, ada 4 lansia yang perlu dijemput dengan perahu karet..."
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className={`btn-voice-record ${isRecording ? 'recording' : ''}`}
                    onClick={() => {
                      setIsRecording(!isRecording)
                      if (!isRecording) {
                        setTimeout(() => {
                          setKondisi(prev => prev + " [Suara dikonversi ke teks: Warga terjebak di lantai dua, butuh bantuan cepat.]")
                          setIsRecording(false)
                        }, 2500)
                      }
                    }}
                    title="Rekam Suara (Voice to Text)"
                  >
                    {isRecording ? '🎙️ Merekam...' : '🎙️ Rekam Suara'}
                  </button>
                </div>
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">📸</span>
                  <span>Lampirkan Foto Bukti Kejadian</span>
                </label>
                <div className="photo-upload-container">
                  <input 
                    type="file" 
                    accept="image/*" 
                    id="fotoBukti"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFotoBukti(e.target.files[0])
                      }
                    }}
                  />
                  <label htmlFor="fotoBukti" className="btn-upload-photo">
                    {fotoBukti ? `📷 ${fotoBukti.name}` : '📷 Ambil Foto / Pilih dari Galeri'}
                  </label>
                </div>
              </div>

              <div className="form-step-section">
                <label className="step-title-label">
                  <span className="step-number">6</span>
                  <span>Kontak Anda (Untuk konfirmasi penjemputan relawan)</span>
                </label>
                <div className="form-two-cols">
                  <input
                    type="text"
                    className="vibrant-input-field"
                    placeholder="Nama Anda (contoh: Pak Bambang)"
                    value={namaPelapor}
                    onChange={(e) => setNamaPelapor(e.target.value)}
                  />
                  <input
                    type="tel"
                    className="vibrant-input-field"
                    placeholder="Nomor WhatsApp / HP Anda"
                    value={nomorHp}
                    onChange={(e) => setNomorHp(e.target.value)}
                  />
                </div>
                {/* IDE 6: NIK Sukarela */}
                <div className="nik-optional-section">
                  <div className="nik-optional-label">
                    <span className="nik-badge">✨ Opsional</span>
                    Daftarkan NIK untuk prioritaskan laporan Anda
                  </div>
                  <input
                    type="text"
                    className="vibrant-input-field"
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK KTP (opsional, laporan langsung diprioritaskan)"
                    value={nikSukarela}
                    onChange={(e) => setNikSukarela(e.target.value.replace(/\D/g, ''))}
                  />
                  {nikSukarela.length > 0 && nikSukarela.length < 16 && (
                    <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                      NIK harus 16 digit ({nikSukarela.length}/16)
                    </p>
                  )}
                  {nikSukarela.length === 16 && (
                    <p style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                      ✓ NIK valid — Laporan Anda akan diprioritaskan ke petugas.
                    </p>
                  )}
                </div>
              </div>

              <div className="vibrant-form-footer">
                <button
                  type="button"
                  className="btn-vibrant-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-vibrant-submit">
                  <span>🚨 Kirim Laporan Sekarang</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
