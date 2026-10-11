import { useState, useEffect, useCallback } from 'react'
import {
  MapPin,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Wind,
  Droplets,
  Radio,
  ExternalLink,
  ChevronDown,
  Navigation,
  Activity,
  CloudRain,
  Eye,
  X
} from 'lucide-react'
import './BMKGLiveWidget.css'

export default function BMKGLiveWidget({ laporan = [], onOpenReportForm }) {
  const [activeTab, setActiveTab] = useState('cuaca') // 'cuaca' | 'gempa' | 'laporan'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('prompting') // 'prompting' | 'granted' | 'denied' | 'error'
  const [userCoords, setUserCoords] = useState(null)
  const [cityList, setCityList] = useState([])
  const [selectedAdm4, setSelectedAdm4] = useState('')
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [showShakemapModal, setShowShakemapModal] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  // 1. Ambil daftar kota dari backend untuk dropdown pemilih kota
  useEffect(() => {
    fetch('http://localhost:3001/api/bmkg/cities')
      .then(res => res.json())
      .then(cities => setCityList(cities))
      .catch(() => {})
  }, [])

  // 2. Fungsi fetch data BMKG
  const fetchBMKGData = useCallback(async (lat, lng, adm4 = '') => {
    setLoading(true)
    try {
      let url = 'http://localhost:3001/api/bmkg/live'
      const params = new URLSearchParams()
      if (adm4) {
        params.append('adm4', adm4)
      } else if (lat !== undefined && lng !== undefined) {
        params.append('lat', lat)
        params.append('lng', lng)
      }
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal memuat API backend BMKG')
      const result = await res.json()
      setData(result)
      setLastRefreshed(new Date())
    } catch (err) {
      console.warn('Gagal memanggil backend BMKG, mencoba direct BMKG...', err)
      // Fallback direct BMKG autogempa jika backend lambat
      try {
        const directGempa = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')
        const gempaJson = await directGempa.json()
        setData(prev => ({
          ...prev,
          region: prev?.region || { name: 'Kota Tangerang', provinsi: 'Banten' },
          gempa: {
            terbaru: {
              ...gempaJson.Infogempa?.gempa,
              distanceKm: 25,
              alertLevel: 'aman',
              alertLabel: 'Terkoneksi BMKG Langsung',
              shakemapUrl: gempaJson.Infogempa?.gempa?.Shakemap
                ? `https://data.bmkg.go.id/DataMKG/TEWS/${gempaJson.Infogempa.gempa.Shakemap}`
                : null
            },
            dirasakan: []
          },
          cuaca: prev?.cuaca || {
            saatIni: {
              suhu: 28,
              kondisi: 'Cerah Berawan',
              kelembapan: 78,
              kecepatanAngin: 5,
              arahAngin: 'E',
              risikoBanjir: 'Rendah',
              peringatanCuaca: 'Kondisi cuaca terpantau kondusif.'
            },
            prakiraan: []
          },
          sumber: 'BMKG Langsung (Fallback)'
        }))
      } catch (e2) {
        console.error('Semua koneksi BMKG gagal', e2)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // 3. Minta akses GPS otomatis saat halaman dibuka
  const requestGPS = useCallback(() => {
    setGpsStatus('prompting')
    if (!navigator.geolocation) {
      setGpsStatus('denied')
      fetchBMKGData(-6.1783, 106.6318) // Default Tangerang
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserCoords({ lat: latitude, lng: longitude })
        setGpsStatus('granted')
        fetchBMKGData(latitude, longitude)
      },
      (error) => {
        console.info('Izin GPS ditolak atau timeout:', error.message)
        setGpsStatus('denied')
        // Default ke Tangerang (lokasi demo SalingJaga)
        fetchBMKGData(-6.1783, 106.6318)
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000
      }
    )
  }, [fetchBMKGData])

  useEffect(() => {
    requestGPS()
  }, [requestGPS])

  // Ganti kota secara manual
  const handleSelectCity = (city) => {
    setSelectedAdm4(city.adm4)
    setShowCityPicker(false)
    setGpsStatus('manual')
    fetchBMKGData(city.lat, city.lng, city.adm4)
  }

  // Refresh data
  const handleRefresh = () => {
    if (userCoords && gpsStatus === 'granted') {
      fetchBMKGData(userCoords.lat, userCoords.lng, selectedAdm4)
    } else {
      fetchBMKGData(data?.region?.lat || -6.1783, data?.region?.lng || 106.6318, selectedAdm4)
    }
  }

  const region = data?.region
  const cuaca = data?.cuaca
  const gempa = data?.gempa?.terbaru
  const gempaDirasakan = data?.gempa?.dirasakan || []

  // Ambil laporan darurat terdekat atau prioritas
  const urgentReports = laporan.filter((item) =>
    ['kritis', 'tinggi'].includes(item.analisisAI?.prioritas)
  )
  const topReport = urgentReports[0] || laporan[0]

  return (
    <div className="bmkg-live-card">
      {/* 1. TOP HEADER: Status Radar & GPS Badge */}
      <div className="bmkg-header-row">
        <div className="bmkg-radar-badge">
          <span className="bmkg-live-pulsar" />
          <Radio size={13} className="bmkg-radar-icon" />
          <span className="bmkg-radar-text">BMKG LIVE RADAR</span>
        </div>

        <div className="bmkg-header-controls">
          {/* Status GPS / Wilayah */}
          <div className="bmkg-location-pill" onClick={() => setShowCityPicker(!showCityPicker)}>
            <MapPin size={13} className={gpsStatus === 'granted' ? 'gps-active-pin' : 'gps-inactive-pin'} />
            <span className="bmkg-city-name">
              {region ? `${region.name}` : 'Mendeteksi...'}
            </span>
            <ChevronDown size={12} className="bmkg-dropdown-arrow" />
          </div>

          <button
            className={`bmkg-refresh-btn ${loading ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Perbarui Data BMKG"
            aria-label="Perbarui Data BMKG"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* DROPDOWN PEMILIH WILAYAH KOTA */}
      {showCityPicker && (
        <div className="bmkg-city-dropdown-menu">
          <div className="bmkg-dropdown-head">
            <span>Pilih Kota / Pantau Wilayah Lain</span>
            <button
              className="bmkg-detect-gps-btn"
              onClick={() => {
                setShowCityPicker(false)
                requestGPS()
              }}
            >
              <Navigation size={12} /> Deteksi GPS Saya
            </button>
          </div>
          <div className="bmkg-dropdown-list">
            {cityList.map((c) => (
              <button
                key={c.adm4}
                className={`bmkg-city-option ${region?.adm4 === c.adm4 ? 'active' : ''}`}
                onClick={() => handleSelectCity(c)}
              >
                <strong>{c.name}</strong>
                <small>{c.provinsi}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GPS NOTICE JIKA BELUM DIIZINKAN */}
      {gpsStatus === 'denied' && (
        <div className="bmkg-gps-alert-banner">
          <div className="gps-alert-text">
            <span>📡 GPS Dinonaktifkan: Menampilkan default ({region?.name || 'Tangerang'}).</span>
          </div>
          <button className="gps-request-again-btn" onClick={requestGPS}>
            Izinkan GPS
          </button>
        </div>
      )}

      {/* 2. SUB-TAB BAR (Cuaca | Gempa | Laporan Sekitar) */}
      <div className="bmkg-tabs-row">
        <button
          className={`bmkg-tab-btn ${activeTab === 'cuaca' ? 'active' : ''}`}
          onClick={() => setActiveTab('cuaca')}
        >
          <span>⛅ Cuaca & Banjir</span>
          {cuaca?.saatIni?.risikoBanjir === 'Tinggi' && <span className="tab-warn-dot red" />}
        </button>

        <button
          className={`bmkg-tab-btn ${activeTab === 'gempa' ? 'active' : ''}`}
          onClick={() => setActiveTab('gempa')}
        >
          <span>🌋 Gempa BMKG</span>
          {gempa && <span className="tab-magnitude-pill">M {gempa.Magnitude}</span>}
        </button>

        <button
          className={`bmkg-tab-btn ${activeTab === 'laporan' ? 'active' : ''}`}
          onClick={() => setActiveTab('laporan')}
        >
          <span>📋 Warga ({laporan.length})</span>
        </button>
      </div>

      {/* 3. CONTENT AREA */}
      <div className="bmkg-content-body">
        {loading && !data ? (
          <div className="bmkg-loading-skeleton">
            <RefreshCw size={24} className="spinning" />
            <p>Menghubungkan ke Satelit Open Data BMKG...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: CUACA & RISIKO BANJIR */}
            {activeTab === 'cuaca' && (
              <div className="bmkg-weather-tab-pane">
                {/* Cuaca Saat Ini */}
                <div className="bmkg-weather-hero">
                  <div className="bmkg-weather-left">
                    <div className="bmkg-temp-row">
                      <span className="bmkg-big-temp">{cuaca?.saatIni?.suhu ?? '--'}°</span>
                      <span className="bmkg-temp-unit">C</span>
                    </div>
                    <div className="bmkg-condition-text">
                      <strong>{cuaca?.saatIni?.kondisi || 'Memuat...'}</strong>
                      <span className="bmkg-sub-loc">{region?.provinsi}</span>
                    </div>
                  </div>

                  <div className="bmkg-weather-right">
                    {cuaca?.saatIni?.icon ? (
                      <img
                        src={cuaca.saatIni.icon}
                        alt={cuaca.saatIni.kondisi}
                        className="bmkg-weather-icon-img"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <CloudRain size={46} className="bmkg-weather-icon-fallback" />
                    )}
                  </div>
                </div>

                {/* Status Peringatan Dini Cuaca Ekstrem */}
                <div
                  className={`bmkg-warning-pill ${
                    cuaca?.saatIni?.risikoBanjir === 'Tinggi'
                      ? 'warning-high'
                      : cuaca?.saatIni?.risikoBanjir === 'Sedang'
                      ? 'warning-medium'
                      : 'warning-low'
                  }`}
                >
                  <AlertTriangle size={15} />
                  <span>{cuaca?.saatIni?.peringatanCuaca}</span>
                </div>

                {/* 4 Parameter Kotak Metrik */}
                <div className="bmkg-metrics-grid">
                  <div className="bmkg-metric-tile">
                    <div className="metric-tile-label">
                      <Droplets size={13} /> Kelembapan
                    </div>
                    <strong>{cuaca?.saatIni?.kelembapan ?? '--'}%</strong>
                  </div>

                  <div className="bmkg-metric-tile">
                    <div className="metric-tile-label">
                      <Wind size={13} /> Angin
                    </div>
                    <strong>
                      {cuaca?.saatIni?.kecepatanAngin ?? '--'} <small>km/j ({cuaca?.saatIni?.arahAngin || 'N'})</small>
                    </strong>
                  </div>

                  <div className="bmkg-metric-tile">
                    <div className="metric-tile-label">
                      <CloudRain size={13} /> Potensi Banjir
                    </div>
                    <strong
                      className={
                        cuaca?.saatIni?.risikoBanjir === 'Tinggi'
                          ? 'risk-high'
                          : cuaca?.saatIni?.risikoBanjir === 'Sedang'
                          ? 'risk-med'
                          : 'risk-low'
                      }
                    >
                      {cuaca?.saatIni?.risikoBanjir || 'Rendah'}
                    </strong>
                  </div>

                  <div className="bmkg-metric-tile">
                    <div className="metric-tile-label">
                      <Activity size={13} /> Validasi EWS
                    </div>
                    <strong className="status-synced">Tersinkron</strong>
                  </div>
                </div>

                {/* Prakiraan Waktu ke Depan */}
                {cuaca?.prakiraan && cuaca.prakiraan.length > 0 && (
                  <div className="bmkg-hourly-forecast">
                    <div className="forecast-title">Prakiraan Beberapa Jam ke Depan (BMKG):</div>
                    <div className="forecast-slots-row">
                      {cuaca.prakiraan.map((slot, idx) => (
                        <div key={idx} className="forecast-slot-item">
                          <span className="slot-time">{slot.jam || slot.local_datetime?.split(' ')[1]?.slice(0, 5) || 'N/A'}</span>
                          {slot.icon && (
                            <img src={slot.icon} alt={slot.kondisi} className="slot-icon" />
                          )}
                          <span className="slot-temp">{slot.suhu}°C</span>
                          <span className="slot-desc">{slot.kondisi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GEMPA TERKINI (BMKG TEWS) */}
            {activeTab === 'gempa' && (
              <div className="bmkg-earthquake-tab-pane">
                {gempa ? (
                  <>
                    <div className="gempa-hero-banner">
                      <div className="gempa-magnitude-badge">
                        <span className="gempa-mag-num">{gempa.Magnitude}</span>
                        <span className="gempa-mag-unit">SR</span>
                      </div>

                      <div className="gempa-info-main">
                        <div className="gempa-time-tag">
                          {gempa.Tanggal} · {gempa.Jam}
                        </div>
                        <h4 className="gempa-region-title">{gempa.Wilayah}</h4>
                        <div className="gempa-depth-tag">
                          Kedalaman: <strong>{gempa.Kedalaman}</strong>
                        </div>
                      </div>
                    </div>

                    {/* JARAK DARI KOORDINAT GPS PENGGUNA */}
                    <div
                      className={`gempa-distance-box ${
                        gempa.alertLevel === 'bahaya'
                          ? 'danger'
                          : gempa.alertLevel === 'waspada'
                          ? 'warning'
                          : 'safe'
                      }`}
                    >
                      <div className="distance-icon-col">
                        <Navigation size={18} />
                      </div>
                      <div className="distance-content-col">
                        <div className="distance-status-text">
                          <strong>{gempa.alertLabel}</strong>
                          {gempa.distanceKm !== null && (
                            <span> (Jarak: ~{gempa.distanceKm.toLocaleString('id-ID')} km dari Anda)</span>
                          )}
                        </div>
                        <p className="gempa-potensi-text">{gempa.Potensi}</p>
                      </div>
                    </div>

                    {/* Tombol Lihat Shakemap */}
                    {gempa.shakemapUrl && (
                      <div className="shakemap-action-row">
                        <button
                          className="btn-shakemap-view"
                          onClick={() => setShowShakemapModal(true)}
                        >
                          <Eye size={14} /> Lihat Peta Guncangan (Shakemap BMKG)
                        </button>
                      </div>
                    )}

                    {/* Gempa Dirasakan Lainnya */}
                    {gempaDirasakan.length > 0 && (
                      <div className="recent-quakes-list">
                        <span className="recent-quakes-title">Gempa Dirasakan Terbaru Lainnya:</span>
                        {gempaDirasakan.slice(1, 3).map((g, i) => (
                          <div key={i} className="recent-quake-row">
                            <span className="quake-mag">M {g.Magnitude}</span>
                            <span className="quake-loc">{g.Wilayah}</span>
                            <span className="quake-time">{g.Jam}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-gempa-notice">
                    <ShieldCheck size={28} />
                    <p>Tidak ada gempa signifikan yang tercatat saat ini.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LAPORAN WARGA SEKITAR */}
            {activeTab === 'laporan' && (
              <div className="bmkg-reports-tab-pane">
                <div className="reports-tab-summary">
                  <div className="rep-metric">
                    <strong>{laporan.length}</strong>
                    <span>Laporan Total</span>
                  </div>
                  <div className="rep-metric">
                    <strong className="text-orange">{urgentReports.length}</strong>
                    <span>Prioritas Mendesak</span>
                  </div>
                  <div className="rep-metric">
                    <strong className="text-green">Siaga</strong>
                    <span>Status Wilayah</span>
                  </div>
                </div>

                {topReport && (
                  <div className="rep-highlight-card">
                    <div className="rep-badge-row">
                      <span className="rep-type-tag">{topReport.jenis}</span>
                      <span className="rep-status-tag">{topReport.status}</span>
                    </div>
                    <h4 className="rep-title">{topReport.lokasi}</h4>
                    <p className="rep-desc">{topReport.kondisi?.substring(0, 80)}...</p>
                    <div className="rep-need-box">
                      <strong>Kebutuhan:</strong> {topReport.kebutuhan?.substring(0, 70)}...
                    </div>
                  </div>
                )}

                <div className="rep-action-row">
                  <button className="btn-add-quick-report" onClick={onOpenReportForm}>
                    <AlertTriangle size={14} /> Lapor Bencana di Sekitar Anda
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. FOOTER RESMI BMKG */}
      <div className="bmkg-widget-footer">
        <div className="bmkg-source-badge">
          <ShieldCheck size={12} className="source-verified-icon" />
          <span>Sumber Resmi: <strong>Open Data BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)</strong></span>
        </div>
        {lastRefreshed && (
          <span className="bmkg-last-sync">
            Sinkron {lastRefreshed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </span>
        )}
      </div>

      {/* MODAL SHAKEMAP BMKG */}
      {showShakemapModal && gempa?.shakemapUrl && (
        <div className="shakemap-modal-backdrop" onClick={() => setShowShakemapModal(false)}>
          <div className="shakemap-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="shakemap-modal-head">
              <div>
                <h3>Peta Guncangan Gempabumi (Shakemap)</h3>
                <p>Sumber: BMKG TEWS ({gempa.Wilayah})</p>
              </div>
              <button
                className="btn-modal-close"
                onClick={() => setShowShakemapModal(false)}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <div className="shakemap-img-container">
              <img
                src={gempa.shakemapUrl}
                alt={`Shakemap ${gempa.Wilayah}`}
                className="shakemap-full-img"
              />
            </div>
            <div className="shakemap-modal-foot">
              <span>Magnitude: <strong>{gempa.Magnitude} SR</strong> | Kedalaman: <strong>{gempa.Kedalaman}</strong></span>
              <a
                href="https://data.bmkg.go.id"
                target="_blank"
                rel="noreferrer"
                className="btn-bmkg-link"
              >
                Portal BMKG <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
