import { useState } from 'react'
import {
  AlertTriangle,
  Users,
  Boxes,
  ShieldCheck,
  Send,
  Compass,
  PhoneCall,
  Activity,
  Flame,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalPriorityRankings.css'

// Fungsi kalkulasi skor urgensi dinamis berbasis status, kapasitas, dan eskalasi
export const hitungSkorUrgensi = (w) => {
  let score = 0

  // 1. Status Operasional (0 - 35 poin)
  if (w.status === 'Tanggap Darurat' || w.statusOperasional === 'Tanggap Darurat') score += 35
  else if (w.status === 'Siaga Bencana' || w.statusOperasional === 'Siaga Bencana') score += 20
  else if (w.status === 'Waspada' || w.statusOperasional === 'Waspada') score += 10

  // 2. Kebutuhan Eskalasi & Keparahan (0 - 25 poin)
  if (w.butuhEskalasi) score += 15
  if (w.keparahan === 'kritis') score += 10
  else if (w.keparahan === 'tinggi') score += 5

  // 3. Stok Logistik Kritis (0 - 20 poin)
  if (w.kapasitas) {
    if (w.kapasitas.stokLogistikPersen <= 25) score += 20
    else if (w.kapasitas.stokLogistikPersen <= 40) score += 12
    else if (w.kapasitas.stokLogistikPersen <= 60) score += 5
  }

  // 4. Okupansi Posko (0 - 10 poin)
  if (w.kapasitas && w.kapasitas.poskoKapasitas > 0) {
    const occ = (w.kapasitas.poskoTerisi / w.kapasitas.poskoKapasitas) * 100
    if (occ >= 90) score += 10
    else if (occ >= 75) score += 5
  }

  // 5. Skala Warga Terdampak (0 - 10 poin)
  if (w.wargaTerdampak > 3000 || w.korbanJiwa > 0) score += 10
  else if (w.wargaTerdampak > 1000) score += 5

  return Math.min(100, Math.max(15, score))
}

export default function NationalPriorityRankings({ onFocusRegionOnMap }) {
  const {
    wilayahNasionalList = [],
    setNationalActiveTab,
    setSelectedWilayahNasional,
    setujuiPermintaanDukungan,
    permintaanDukunganList = [],
    setSupportQueueFilterRegion,
    showNotif,
  } = useApp()

  const [filterProvinsi, setFilterProvinsi] = useState('Semua')

  // Hitung ulang peringkat urgensi secara dinamis saat status atau kapasitas berubah
  const sortedRegions = [...wilayahNasionalList]
    .map((w) => {
      const dynamicScore = hitungSkorUrgensi(w)
      return {
        ...w,
        skorUrgensiDinamis: dynamicScore,
      }
    })
    .sort((a, b) => b.skorUrgensiDinamis - a.skorUrgensiDinamis)
    .map((w, idx) => ({
      ...w,
      rankDinamis: idx + 1,
    }))

  const provinsiList = ['Semua', ...new Set(wilayahNasionalList.map((w) => w.provinsi))]

  const filtered = filterProvinsi === 'Semua'
    ? sortedRegions
    : sortedRegions.filter((w) => w.provinsi === filterProvinsi)

  const handleActionSupport = (w) => {
    setSelectedWilayahNasional(w)
    if (setSupportQueueFilterRegion) {
      setSupportQueueFilterRegion(w.nama)
    }
    setNationalActiveTab('permintaan')
  }

  const handleActionMap = (w) => {
    setSelectedWilayahNasional(w)
    if (onFocusRegionOnMap) {
      onFocusRegionOnMap(w)
    }
  }

  return (
    <section className="national-priority-section" aria-label="Peringkat daerah prioritas nasional">
      {/* SECTION TITLEBAR */}
      <div className="priority-section-titlebar">
        <div className="titlebar-left">
          <div className="priority-title-beacon">
            <Flame size={20} />
          </div>
          <div>
            <h3 className="priority-main-title">Peringkat Daerah Prioritas Nasional</h3>
            <span className="priority-main-sub">
              Daftar wilayah krisis yang diurutkan secara dinamis berdasarkan indeks keparahan dampak, rasio pengungsi, dan batas kemampuan BPBD daerah
            </span>
          </div>
        </div>

        {/* PROVINCE FILTER */}
        <div className="priority-province-filter" role="group">
          {provinsiList.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn-prov-filter ${filterProvinsi === p ? 'active' : ''}`}
              onClick={() => setFilterProvinsi(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* RANKINGS GRID FEED */}
      <div className="priority-cards-grid">
        {filtered.map((w) => {
          const isCritical = w.keparahan === 'kritis' || w.skorUrgensiDinamis >= 80
          const pendingReq = permintaanDukunganList.find(
            (r) =>
              (r.wilayahId === w.id || (r.wilayahNama && r.wilayahNama.toLowerCase().includes(w.nama.toLowerCase()))) &&
              r.status === 'Menunggu Persetujuan'
          )

          return (
            <article key={w.id} className={`priority-region-card ${isCritical ? 'critical' : ''}`}>
              {/* TOP HEADER */}
              <div className="card-top-header">
                <div className="card-rank-badge">
                  <span className="rank-num">#{w.rankDinamis}</span>
                  <span className="rank-label">Urgensi {w.skorUrgensiDinamis}/100</span>
                </div>

                <div className="card-badges-group">
                  <span className={`status-pill status-${w.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {w.status}
                  </span>
                  {w.butuhEskalasi && (
                    <span className="badge-need-escalation">
                      🚨 Eskalasi Pusat
                    </span>
                  )}
                </div>
              </div>

              {/* REGION TITLE & EVENT */}
              <div className="card-identity-box">
                <h4 className="region-title">{w.nama}</h4>
                <span className="region-province">{w.provinsi}</span>
                <div className="disaster-tag-row">
                  <span className="disaster-chip">
                    <Activity size={13} /> {w.jenisBencana}
                  </span>
                  <span className="incident-counter-chip">
                    {w.kejadianAktif} Titik Bencana
                  </span>
                </div>
              </div>

              {/* ALASAN PRIORITAS */}
              <div className="priority-reason-box">
                <span className="reason-label">Alasan Prioritas Nasional:</span>
                <p className="reason-text">{w.alasanPrioritas}</p>
              </div>

              {/* DEMOGRAPHICS STATS */}
              <div className="priority-metrics-row">
                <div className="rank-metric-box">
                  <strong className="metric-val">{w.wargaTerdampak.toLocaleString('id-ID')}</strong>
                  <span className="metric-lbl">Jiwa Terdampak</span>
                </div>
                <div className="rank-metric-box text-orange">
                  <strong className="metric-val">{w.wargaMengungsi.toLocaleString('id-ID')}</strong>
                  <span className="metric-lbl">Warga Mengungsi</span>
                </div>
                <div className="rank-metric-box text-red">
                  <strong className="metric-val">{w.korbanLuka || 0}</strong>
                  <span className="metric-lbl">Korban Luka</span>
                </div>
              </div>

              {/* KEBUTUHAN UTAMA */}
              <div className="priority-needs-dossier">
                <div className="needs-title">
                  <Boxes size={14} /> Kebutuhan Primer yang Belum Terpenuhi:
                </div>
                <p className="needs-content">{w.kebutuhanUtama}</p>
              </div>

              {/* STATUS RESPONS BPBD */}
              <div className="bpbd-response-status-bar">
                <ShieldCheck size={14} className="shield-icon" />
                <div className="response-info">
                  <span className="response-title">Status Respons BPBD:</span>
                  <span className="response-val">{w.responsBPBD}</span>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="priority-card-actions">
                <button
                  type="button"
                  className="btn-action-view-map"
                  onClick={() => handleActionMap(w)}
                  title="Tinjau posisi wilayah ini di peta nasional"
                >
                  <Compass size={14} />
                  <span>Lihat di Peta</span>
                </button>

                <button
                  type="button"
                  className={pendingReq || w.butuhEskalasi ? "btn-action-escalate-now" : "btn-action-monitor-only"}
                  onClick={() => handleActionSupport(w)}
                  title={pendingReq ? "Tinjau permohonan dukungan yang menunggu persetujuan pusat" : "Buat formulir permohonan bantuan darurat resmi untuk wilayah ini"}
                >
                  <Send size={14} />
                  <span>{pendingReq ? 'Tinjau Permohonan (1)' : 'Buat Permohonan Bantuan'}</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
