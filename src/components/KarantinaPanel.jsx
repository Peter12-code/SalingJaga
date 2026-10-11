import { useState, useEffect } from 'react'
import { ShieldAlert, ShieldCheck, ShieldX, ThumbsUp, ThumbsDown, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react'
import './KarantinaPanel.css'

const STATUS_COLOR = {
  'Karantina': 'karantina',
  'Tervalidasi BMKG': 'bmkg',
  'Tervalidasi Komunitas': 'komunitas',
  'Diprioritaskan': 'prioritas',
  'Disahkan Petugas': 'disahkan',
  'Ditolak Komunitas': 'tolak',
  'Ditolak Petugas': 'tolak',
}

const STATUS_ICON = {
  'Karantina': <Clock size={14} />,
  'Tervalidasi BMKG': <ShieldCheck size={14} />,
  'Tervalidasi Komunitas': <ShieldCheck size={14} />,
  'Diprioritaskan': <ShieldCheck size={14} />,
  'Disahkan Petugas': <CheckCircle size={14} />,
  'Ditolak Komunitas': <ShieldX size={14} />,
  'Ditolak Petugas': <XCircle size={14} />,
}

const BACKEND_URL = 'http://localhost:3001'

export default function KarantinaPanel() {
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [konfirmasiLoading, setKonfirmasiLoading] = useState(null)

  const fetchKarantina = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/karantina`)
      const data = await res.json()
      setLaporan(data.reverse()) // Terbaru di atas
    } catch {
      // Backend offline: tampilkan data demo
      setLaporan(demoData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKarantina() }, [])

  const handleKonfirmasi = async (reportId, action) => {
    setKonfirmasiLoading(reportId + action)
    try {
      await fetch(`${BACKEND_URL}/api/admin/karantina/konfirmasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action })
      })
      await fetchKarantina()
      if (selected?.id === reportId) setSelected(null)
    } catch {
      alert('Backend tidak dapat dijangkau.')
    } finally {
      setKonfirmasiLoading(null)
    }
  }

  const aktif = laporan.filter(l => !['Disahkan Petugas', 'Ditolak Petugas', 'Ditolak Komunitas'].includes(l.statusValidasi))
  const selesai = laporan.filter(l => ['Disahkan Petugas', 'Ditolak Petugas', 'Ditolak Komunitas'].includes(l.statusValidasi))

  return (
    <div className="karantina-wrapper">
      <div className="karantina-header">
        <div>
          <h2 className="karantina-title">
            <ShieldAlert size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Pusat Validasi Laporan Masuk
          </h2>
          <p className="karantina-sub">
            Laporan warga divalidasi otomatis oleh AI (BMKG + Komunitas) sebelum disahkan ke dashboard utama.
          </p>
        </div>
        <button className="btn-refresh" onClick={fetchKarantina} disabled={loading}>
          <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {/* Legenda Status */}
      <div className="karantina-legenda">
        <span className="legenda-item karantina">⏳ Karantina</span>
        <span className="legenda-item bmkg">🛡️ Tervalidasi BMKG</span>
        <span className="legenda-item komunitas">👥 Tervalidasi Komunitas</span>
        <span className="legenda-item prioritas">⭐ Diprioritaskan (NIK)</span>
        <span className="legenda-item disahkan">✅ Disahkan</span>
        <span className="legenda-item tolak">❌ Ditolak</span>
      </div>

      {/* Antrian Aktif */}
      <div className="karantina-section-title">
        Antrian Aktif ({aktif.length})
      </div>

      {aktif.length === 0 && !loading && (
        <div className="karantina-empty">
          <ShieldCheck size={36} />
          <p>Tidak ada laporan yang menunggu validasi saat ini.</p>
        </div>
      )}

      <div className="karantina-list">
        {aktif.map(lap => (
          <div
            key={lap.id}
            className={`karantina-card ${selected?.id === lap.id ? 'selected' : ''}`}
            onClick={() => setSelected(selected?.id === lap.id ? null : lap)}
          >
            <div className="karantina-card-top">
              <div className="karantina-card-left">
                <span className="karantina-jenis">{lap.jenis}</span>
                <span className={`karantina-status-badge ${STATUS_COLOR[lap.statusValidasi] || 'karantina'}`}>
                  {STATUS_ICON[lap.statusValidasi]} {lap.statusValidasi}
                </span>
              </div>
              <span className="karantina-time">
                {new Date(lap.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="karantina-card-meta">
              <span>📍 {lap.lokasi || `${lap.lat?.toFixed(4)}, ${lap.lng?.toFixed(4)}`}</span>
              {lap.noHp && <span>📞 {lap.noHp}</span>}
              {lap.nikSukarela && <span>🪪 NIK: {lap.nikSukarela.slice(0, 4)}••••••••{lap.nikSukarela.slice(-4)}</span>}
            </div>

            {/* Detail jika dipilih */}
            {selected?.id === lap.id && (
              <div className="karantina-detail">
                {/* BMKG Info */}
                <div className="karantina-bmkg-box">
                  <div className="karantina-bmkg-title">🛡️ Hasil Validasi BMKG</div>
                  <p>{lap.bmkgKeterangan}</p>
                  {lap.bmkgData && (
                    <div className="karantina-bmkg-data">
                      <span>Magnitude: <strong>{lap.bmkgData.Magnitude} SR</strong></span>
                      <span>Wilayah: <strong>{lap.bmkgData.Wilayah}</strong></span>
                      <span>Kedalaman: <strong>{lap.bmkgData.Kedalaman}</strong></span>
                    </div>
                  )}
                </div>

                {/* Vote Komunitas */}
                <div className="karantina-vote-box">
                  <div className="karantina-vote-title">👥 Validasi Komunitas (Ide 8)</div>
                  <div className="karantina-vote-bars">
                    <div className="vote-bar-item">
                      <ThumbsUp size={14} color="#16a34a" />
                      <div className="vote-bar-track">
                        <div className="vote-bar-fill ya" style={{ width: `${Math.min(100, ((lap.voteYa?.length || 0) / 5) * 100)}%` }} />
                      </div>
                      <span className="vote-count ya">{lap.voteYa?.length || 0} Ya</span>
                    </div>
                    <div className="vote-bar-item">
                      <ThumbsDown size={14} color="#dc2626" />
                      <div className="vote-bar-track">
                        <div className="vote-bar-fill tidak" style={{ width: `${Math.min(100, ((lap.voteTidak?.length || 0) / 5) * 100)}%` }} />
                      </div>
                      <span className="vote-count tidak">{lap.voteTidak?.length || 0} Tidak</span>
                    </div>
                  </div>
                  <p className="vote-info">≥3 suara "Ya" → otomatis dipromosikan. ≥5 suara "Tidak" → otomatis ditolak.</p>
                </div>

                {/* Aksi Petugas */}
                {!['Disahkan Petugas', 'Ditolak Petugas', 'Ditolak Komunitas'].includes(lap.statusValidasi) && (
                  <div className="karantina-actions">
                    <button
                      className="btn-sahkan"
                      onClick={(e) => { e.stopPropagation(); handleKonfirmasi(lap.id, 'sahkan') }}
                      disabled={konfirmasiLoading !== null}
                    >
                      <CheckCircle size={15} style={{ marginRight: '6px' }} />
                      Sahkan ke Dashboard Utama
                    </button>
                    <button
                      className="btn-tolak-laporan"
                      onClick={(e) => { e.stopPropagation(); handleKonfirmasi(lap.id, 'tolak') }}
                      disabled={konfirmasiLoading !== null}
                    >
                      <XCircle size={15} style={{ marginRight: '6px' }} />
                      Tolak Laporan
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Riwayat */}
      {selesai.length > 0 && (
        <>
          <div className="karantina-section-title" style={{ marginTop: '24px' }}>
            Riwayat Diproses ({selesai.length})
          </div>
          <div className="karantina-list">
            {selesai.map(lap => (
              <div key={lap.id} className="karantina-card selesai">
                <div className="karantina-card-top">
                  <div className="karantina-card-left">
                    <span className="karantina-jenis">{lap.jenis}</span>
                    <span className={`karantina-status-badge ${STATUS_COLOR[lap.statusValidasi] || 'karantina'}`}>
                      {STATUS_ICON[lap.statusValidasi]} {lap.statusValidasi}
                    </span>
                  </div>
                  <span className="karantina-time">
                    {new Date(lap.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="karantina-card-meta">
                  <span>📍 {lap.lokasi || `${lap.lat?.toFixed(4)}, ${lap.lng?.toFixed(4)}`}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Demo data jika backend offline
const demoData = [
  {
    id: 'demo-1',
    jenis: 'Banjir',
    lokasi: 'Jl. Mawar RT 03, Ciledug',
    lat: -6.233,
    lng: 106.70,
    noHp: '081234****90',
    nikSukarela: null,
    statusValidasi: 'Tervalidasi BMKG',
    bmkgKeterangan: 'BMKG: Curah hujan 180mm/hari di wilayah Tangerang — Laporan KONSISTEN.',
    bmkgData: null,
    voteYa: ['a', 'b'],
    voteTidak: [],
    waktu: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 'demo-2',
    jenis: 'Kebakaran',
    lokasi: 'Pasar Anyar, Tangerang',
    lat: -6.180,
    lng: 106.633,
    noHp: '089765****12',
    nikSukarela: null,
    statusValidasi: 'Karantina',
    bmkgKeterangan: 'BMKG: Status NETRAL, perlu verifikasi komunitas.',
    bmkgData: null,
    voteYa: ['c'],
    voteTidak: ['d'],
    waktu: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    id: 'demo-3',
    jenis: 'Gempa Bumi',
    lokasi: 'Kecamatan Neglasari, Tangerang',
    lat: -6.17,
    lng: 106.65,
    noHp: '082211****33',
    nikSukarela: '3271012501980003',
    statusValidasi: 'Diprioritaskan',
    bmkgKeterangan: 'NIK Terverifikasi — Laporan langsung diprioritaskan ke petugas.',
    bmkgData: null,
    voteYa: [],
    voteTidak: [],
    waktu: new Date(Date.now() - 2 * 60000).toISOString()
  }
]
