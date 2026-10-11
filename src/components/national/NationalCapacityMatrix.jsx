import { useState, useEffect } from 'react'
import {
  BarChart3,
  PhoneCall,
  Activity,
  ShieldCheck,
  Check,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  HeartPulse,
  Boxes,
  Users,
  X,
  Send
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { STATUS_WILAYAH_NASIONAL } from '../../data/nationalData'
import './NationalCapacityMatrix.css'

export default function NationalCapacityMatrix() {
  const {
    wilayahNasionalList = [],
    updateStatusWilayahNasional,
    setSelectedWilayahNasional,
    setSupportQueueFilterRegion,
    setNationalActiveTab,
    permintaanDukunganList = [],
    showNotif,
  } = useApp()

  const [sortField, setSortField] = useState('rank')
  const [sortAsc, setSortAsc] = useState(true)

  // Status Change Confirmation Modal
  const [statusModalTarget, setStatusModalTarget] = useState(null)
  const [targetNewStatus, setTargetNewStatus] = useState('')
  const [reasonInput, setReasonInput] = useState('')
  const [operatorInput, setOperatorInput] = useState('Kepala Pusat Pengendalian Operasi (Kapusdalops) BNPB')

  // Keyboard accessibility: tombol Esc menutup dialog status
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && statusModalTarget) {
        setStatusModalTarget(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [statusModalTarget])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const sortedList = [...wilayahNasionalList].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]

    if (sortField === 'stok') {
      valA = a.kapasitas.stokLogistikPersen
      valB = b.kapasitas.stokLogistikPersen
    } else if (sortField === 'posko') {
      valA = a.kapasitas.poskoTerisi / a.kapasitas.poskoKapasitas
      valB = b.kapasitas.poskoTerisi / b.kapasitas.poskoKapasitas
    }

    if (valA < valB) return sortAsc ? -1 : 1
    if (valA > valB) return sortAsc ? 1 : -1
    return 0
  })

  const getLogistikClass = (persen) => {
    if (persen < 40) return 'stock-critical'
    if (persen < 70) return 'stock-warning'
    return 'stock-safe'
  }

  const getPoskoOccupancy = (terisi, kapasitas) => {
    return Math.round((terisi / kapasitas) * 100)
  }

  const handleSelectStatusChange = (region, newStatus) => {
    if (region.status === newStatus) return
    setStatusModalTarget(region)
    setTargetNewStatus(newStatus)
    setReasonInput(`Penyesuaian status darurat wilayah berdasarkan telemetry BMKG/PVMBG dan laporan lapangan BPBD ${region.nama}.`)
    setOperatorInput('Kapusdalops BNPB Pusat - Satgas Siaga Bencana')
  }

  const handleConfirmStatusChange = () => {
    if (!statusModalTarget || !targetNewStatus) return

    updateStatusWilayahNasional(statusModalTarget.id, targetNewStatus, {
      alasan: reasonInput,
      operator: operatorInput,
    })

    setStatusModalTarget(null)
    setTargetNewStatus('')
  }

  const handleOpenSupportForRegion = (w) => {
    setSelectedWilayahNasional(w)
    if (setSupportQueueFilterRegion) {
      setSupportQueueFilterRegion(w.nama)
    }
    setNationalActiveTab('permintaan')
  }

  return (
    <section className="national-capacity-matrix-section" aria-label="Perbandingan kapasitas daerah dan pantauan koordinasi BPBD">
      {/* HEADER */}
      <div className="capacity-matrix-header">
        <div className="matrix-header-left">
          <div className="matrix-icon-badge">
            <BarChart3 size={22} />
          </div>
          <div>
            <div className="matrix-eyebrow">MATRIKS ANALISIS REGIONAL & DAYA DUKUNG</div>
            <h3 className="matrix-title">Perbandingan Kapasitas Daerah & Pantauan Koordinasi BPBD</h3>
            <span className="matrix-sub">
              Komparasi tim tersedia, cadangan logistik, okupansi posko, fasilitas kesehatan, serta status kesiapsiagaan seluruh BPBD
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP COMPARISON TABLE */}
      <div className="matrix-table-card desktop-table-view">
        <div className="table-responsive-wrapper">
          <table className="capacity-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('nama')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSort('nama')
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortField === 'nama' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  className="sortable-th"
                >
                  <div className="th-content">
                    <span>Wilayah & BPBD</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>Status Koordinasi</th>
                <th>
                  <div className="th-content">
                    <Users size={13} />
                    <span>Tim Lapangan</span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stok')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSort('stok')
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortField === 'stok' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  className="sortable-th"
                >
                  <div className="th-content">
                    <Boxes size={13} />
                    <span>Stok Logistik</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('posko')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSort('posko')
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-sort={sortField === 'posko' ? (sortAsc ? 'ascending' : 'descending') : 'none'}
                  className="sortable-th"
                >
                  <div className="th-content">
                    <Building2 size={13} />
                    <span>Okupansi Posko</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <HeartPulse size={13} />
                    <span>Layanan Faskes</span>
                  </div>
                </th>
                <th>Hotline Pusdalops</th>
                <th>Tindakan BNPB</th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((w) => {
                const occupancy = getPoskoOccupancy(w.kapasitas.poskoTerisi, w.kapasitas.poskoKapasitas)
                const isCriticalStock = w.kapasitas.stokLogistikPersen < 40

                return (
                  <tr key={w.id} className={w.butuhEskalasi ? 'row-needs-escalation' : ''}>
                    {/* WILAYAH */}
                    <td className="cell-region-name">
                      <strong>{w.nama}</strong>
                      <span className="region-sub-prov">{w.provinsi}</span>
                      {w.butuhEskalasi && (
                        <span className="table-escalation-pill">🚨 Butuh Dukungan Pusat</span>
                      )}
                    </td>

                    {/* STATUS KOORDINASI */}
                    <td>
                      <select
                        className={`status-coord-select status-${w.status.toLowerCase().replace(/\s+/g, '-')}`}
                        value={w.status}
                        onChange={(e) => handleSelectStatusChange(w, e.target.value)}
                        title="Klik untuk memilih dan mengonfirmasi perubahan status wilayah"
                      >
                        {Object.values(STATUS_WILAYAH_NASIONAL).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* TIM LAPANGAN */}
                    <td>
                      <div className="team-cell-box">
                        <strong className="text-emerald">{w.kapasitas.timTersedia} Tim Tersedia</strong>
                        <span className="team-deployed-sub">{w.kapasitas.timDikerahkan} Dikerahkan</span>
                      </div>
                    </td>

                    {/* STOK LOGISTIK */}
                    <td>
                      <div className="stock-cell-box">
                        <div className="stock-bar-header">
                          <strong className={isCriticalStock ? 'text-red' : ''}>
                            {w.kapasitas.stokLogistikPersen}%
                          </strong>
                          <span className="stock-label">
                            {isCriticalStock ? 'Defisit Kritis' : 'Cukup'}
                          </span>
                        </div>
                        <div className="stock-progress-track">
                          <div
                            className={`stock-fill ${getLogistikClass(w.kapasitas.stokLogistikPersen)}`}
                            style={{ width: `${w.kapasitas.stokLogistikPersen}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* OKUPANSI POSKO */}
                    <td>
                      <div className="posko-cell-box">
                        <div className="posko-header">
                          <strong>{w.kapasitas.poskoTerisi.toLocaleString('id-ID')}</strong>
                          <span>/ {w.kapasitas.poskoKapasitas.toLocaleString('id-ID')} jiwa</span>
                        </div>
                        <span className={`occupancy-tag ${occupancy >= 85 ? 'tag-full' : ''}`}>
                          {occupancy}% Terisi
                        </span>
                      </div>
                    </td>

                    {/* FASKES */}
                    <td className="cell-faskes">
                      <span className="faskes-text">{w.kapasitas.faskesStatus}</span>
                    </td>

                    {/* HOTLINE */}
                    <td className="cell-hotline">
                      <a href={`tel:${w.hotlineBPBD.split(' ')[0]}`} className="hotline-link" title="Hubungi Pusdalops">
                        <PhoneCall size={12} />
                        <span>{w.hotlineBPBD}</span>
                      </a>
                    </td>

                    {/* AKSI */}
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn-subsidi-silang"
                        onClick={() => handleOpenSupportForRegion(w)}
                        title="Buka antrean permohonan dukungan pusat khusus untuk wilayah ini"
                      >
                        {permintaanDukunganList.some(
                          (r) =>
                            (r.wilayahId === w.id || (r.wilayahNama && r.wilayahNama.toLowerCase().includes(w.nama.toLowerCase()))) &&
                            r.status === 'Menunggu Persetujuan'
                        )
                          ? 'Tinjau Permohonan'
                          : 'Buat Permohonan Bantuan'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS FEED (VISIBLE ON <= 820px) */}
      <div className="capacity-mobile-cards-feed">
        {sortedList.map((w) => {
          const occupancy = getPoskoOccupancy(w.kapasitas.poskoTerisi, w.kapasitas.poskoKapasitas)
          const isCriticalStock = w.kapasitas.stokLogistikPersen < 40

          return (
            <div key={w.id} className={`capacity-mobile-card ${w.butuhEskalasi ? 'needs-escalation' : ''}`}>
              <div className="card-mobile-top">
                <div>
                  <h4 className="mobile-card-title">{w.nama}</h4>
                  <span className="mobile-card-sub">{w.provinsi}</span>
                </div>
                <select
                  className={`status-coord-select status-${w.status.toLowerCase().replace(/\s+/g, '-')}`}
                  value={w.status}
                  onChange={(e) => handleSelectStatusChange(w, e.target.value)}
                >
                  {Object.values(STATUS_WILAYAH_NASIONAL).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {w.butuhEskalasi && (
                <div className="mobile-escalation-pill">
                  🚨 Membutuhkan Bantuan Eskalasi Pusat
                </div>
              )}

              <div className="mobile-stats-grid">
                <div className="mobile-stat-item">
                  <span className="stat-kicker"><Users size={12} /> Tim Siap</span>
                  <strong>{w.kapasitas.timTersedia} Tim ({w.kapasitas.timDikerahkan} bertugas)</strong>
                </div>
                <div className="mobile-stat-item">
                  <span className="stat-kicker"><Boxes size={12} /> Logistik</span>
                  <strong className={isCriticalStock ? 'text-red' : ''}>{w.kapasitas.stokLogistikPersen}% Cadangan</strong>
                </div>
                <div className="mobile-stat-item">
                  <span className="stat-kicker"><Building2 size={12} /> Okupansi</span>
                  <strong>{occupancy}% ({w.kapasitas.poskoTerisi.toLocaleString('id-ID')} jiwa)</strong>
                </div>
                <div className="mobile-stat-item">
                  <span className="stat-kicker"><HeartPulse size={12} /> Faskes</span>
                  <span>{w.kapasitas.faskesStatus}</span>
                </div>
              </div>

              <div className="mobile-card-actions">
                <a href={`tel:${w.hotlineBPBD.split(' ')[0]}`} className="btn-mobile-hotline">
                  <PhoneCall size={13} />
                  <span>{w.hotlineBPBD}</span>
                </a>
                <button
                  type="button"
                  className="btn-mobile-support"
                  onClick={() => handleOpenSupportForRegion(w)}
                >
                  <Send size={13} />
                  <span>
                    {permintaanDukunganList.some(
                      (r) =>
                        (r.wilayahId === w.id || (r.wilayahNama && r.wilayahNama.toLowerCase().includes(w.nama.toLowerCase()))) &&
                        r.status === 'Menunggu Persetujuan'
                    )
                      ? 'Tinjau Permohonan'
                      : 'Buat Permohonan Bantuan'}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* CONFIRMATION MODAL BEFORE STATUS CHANGE */}
      {statusModalTarget && (
        <div className="status-modal-backdrop" onClick={() => setStatusModalTarget(null)}>
          <div
            className="status-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
          >
            <div className="status-modal-header">
              <div className="status-modal-header-left">
                <div className="status-modal-badge">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="status-modal-eyebrow">PENETAPAN STATUS OPERASIONAL BNPB</div>
                  <h3 id="status-modal-title" className="status-modal-title">
                    Konfirmasi Perubahan Status Wilayah
                  </h3>
                  <span className="status-modal-subtitle">
                    {statusModalTarget.nama} ({statusModalTarget.provinsi})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="status-btn-close"
                onClick={() => setStatusModalTarget(null)}
                aria-label="Tutup Dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="status-modal-body">
              {/* TRANSITION PREVIEW */}
              <div className="status-transition-box">
                <div className="transition-step from">
                  <span className="trans-lbl">Status Saat Ini:</span>
                  <strong className={`status-pill status-${statusModalTarget.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {statusModalTarget.status}
                  </strong>
                </div>

                <div className="trans-arrow">➔</div>

                <div className="transition-step to">
                  <span className="trans-lbl">Akan Diubah Menjadi:</span>
                  <strong className={`status-pill status-${targetNewStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {targetNewStatus}
                  </strong>
                </div>
              </div>

              <div className="status-form-group">
                <label className="status-form-label" htmlFor="statusReason">
                  Alasan & Dasar Pertimbangan Perubahan Status:
                </label>
                <textarea
                  id="statusReason"
                  rows={2}
                  className="status-textarea"
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Misal: Kenaikan status Gunung Marapi, luapan banjir melebihi ambang batas, atau pemulihan situasi..."
                />
              </div>

              <div className="status-form-group">
                <label className="status-form-label" htmlFor="statusOperator">
                  Akun Pejabat / Operator Pengesah (BNPB Pusat):
                </label>
                <input
                  id="statusOperator"
                  type="text"
                  className="status-input"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                />
              </div>
            </div>

            <div className="status-modal-footer">
              <button
                type="button"
                className="btn-status-cancel"
                onClick={() => setStatusModalTarget(null)}
              >
                Batalkan
              </button>

              <button
                type="button"
                className="btn-status-confirm"
                onClick={handleConfirmStatusChange}
              >
                <Check size={16} />
                <span>Konfirmasi Perubahan Status</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
