import { useState } from 'react'
import {
  Truck,
  Plane,
  Clock,
  CheckCircle2,
  MapPin,
  FileText,
  User,
  ShieldCheck,
  ChevronRight,
  PackageCheck,
  X,
  Building2,
  Check
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalResourceDistribution.css'

export default function NationalResourceDistribution() {
  const { distribusiNasionalList = [], tandaiBantuanTiba, showNotif } = useApp()

  // Arrival Confirmation Modal State
  const [selectedItemForArrival, setSelectedItemForArrival] = useState(null)
  const [poskoPenerimaInput, setPoskoPenerimaInput] = useState('')
  const [petugasPenerimaInput, setPetugasPenerimaInput] = useState('Koordinator Logistik BPBD Lapangan')
  const [catatanPenerimaanInput, setCatatanPenerimaanInput] = useState('Diterima lengkap, segel utuh, dan siap didistribusikan ke pengungsi.')
  const [operatorInput, setOperatorInput] = useState('Pusdalops BNPB Pusat - Satgas Logistik')

  const getModaIcon = (moda) => {
    if (/pesawat|hercules|udara/i.test(moda)) return <Plane size={16} />
    return <Truck size={16} />
  }

  const openArrivalModal = (item) => {
    setSelectedItemForArrival(item)
    setPoskoPenerimaInput(item.tujuan || 'Posko Induk BPBD Terkait')
    setPetugasPenerimaInput('Koordinator Logistik BPBD Lapangan')
    setCatatanPenerimaanInput('Diterima lengkap, segel utuh, dan siap didistribusikan ke pengungsi.')
    setOperatorInput('Pusdalops BNPB Pusat - Satgas Logistik')
  }

  const handleConfirmArrival = () => {
    if (!selectedItemForArrival) return

    tandaiBantuanTiba(selectedItemForArrival.id, {
      poskoPenerima: poskoPenerimaInput,
      catatanPenerimaan: `${catatanPenerimaanInput} (Diterima oleh: ${petugasPenerimaInput})`,
      operator: operatorInput,
    })

    if (showNotif) {
      showNotif(`📦 Konfirmasi penerimaan #${selectedItemForArrival.id} berhasil dicatat resmi.`, 'success')
    }

    setSelectedItemForArrival(null)
  }

  return (
    <section className="national-distribution-section" aria-label="Distribusi sumber daya nasional">
      {/* SECTION HEADER */}
      <div className="distribution-header">
        <div className="dist-header-left">
          <div className="dist-icon-badge">
            <Truck size={22} />
          </div>
          <div>
            <div className="dist-eyebrow">PEMANTAUAN LOGISTIK & LOGISTICS PIPELINE</div>
            <h3 className="dist-title">Distribusi Sumber Daya & Armada Nasional</h3>
            <span className="dist-sub">
              Lacak pergerakan bantuan logistik darurat, alat berat, dan tim medis dari Gudang Pusat BNPB ke posko daerah terdampak
            </span>
          </div>
        </div>

        <div className="dist-counter-badge">
          <span className="dist-beacon-dot" />
          <span>{distribusiNasionalList.filter((d) => d.status !== 'Tiba di Posko').length} Pengiriman Aktif Bergerak</span>
        </div>
      </div>

      {/* DISTRIBUTION CARDS */}
      <div className="distribution-cards-grid">
        {distribusiNasionalList.map((item) => {
          const isArrived = item.status === 'Tiba di Posko'

          return (
            <div key={item.id} className={`distribution-tracking-card ${isArrived ? 'arrived' : ''}`}>
              {/* TOP HEADER */}
              <div className="dist-card-top">
                <div className="dist-manifest-group">
                  <span className="manifest-id">{item.id}</span>
                  <span className="manifest-code">{item.noManifest}</span>
                </div>
                <span className={`dist-status-pill ${isArrived ? 'status-arrived' : 'status-in-transit'}`}>
                  {item.status}
                </span>
              </div>

              {/* CARGO & TRANSPORT MODE */}
              <div className="dist-cargo-info">
                <h4 className="cargo-title">{item.namaBantuan}</h4>
                <div className="transport-mode-row">
                  <span className="mode-chip">
                    {getModaIcon(item.moda)}
                    <span>{item.moda}</span>
                  </span>
                  <span className="eta-chip">
                    <Clock size={13} /> ETA: <strong>{item.eta}</strong>
                  </span>
                </div>
              </div>

              {/* ROUTE ORIGIN -> DESTINATION */}
              <div className="dist-route-stepper">
                <div className="route-point">
                  <div className="point-dot origin" />
                  <div className="point-details">
                    <span className="point-type">Asal Pengiriman:</span>
                    <strong className="point-name">{item.asal}</strong>
                  </div>
                </div>

                <div className="route-arrow-connector">
                  <ChevronRight size={18} />
                </div>

                <div className="route-point">
                  <div className="point-dot dest" />
                  <div className="point-details">
                    <span className="point-type">Tujuan Posko Daerah:</span>
                    <strong className="point-name">{item.tujuan}</strong>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="dist-progress-box">
                <div className="progress-labels-row">
                  <span>Progres Pengiriman</span>
                  <strong>{item.progresPersen}%</strong>
                </div>
                <div className="dist-progress-bar">
                  <div
                    className={`progress-fill ${isArrived ? 'fill-green' : 'fill-blue'}`}
                    style={{ width: `${item.progresPersen}%` }}
                  />
                </div>
              </div>

              {/* ARRIVAL NOTES IF ARRIVED */}
              {isArrived && item.catatanPenerima && (
                <div className="dist-arrived-notes-box">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span>{item.catatanPenerima}</span>
                </div>
              )}

              {/* PIC & MANIFEST */}
              <div className="dist-meta-footer">
                <div className="dist-pic-info">
                  <User size={13} />
                  <span>PIC: {item.picPusat}</span>
                </div>

                {!isArrived ? (
                  <button
                    type="button"
                    className="btn-mark-arrived"
                    onClick={() => openArrivalModal(item)}
                    title="Buka dialog konfirmasi penerimaan dan serah terima ke posko BPBD"
                  >
                    <PackageCheck size={14} />
                    <span>Konfirmasi Tiba</span>
                  </button>
                ) : (
                  <span className="arrived-check-badge">
                    <CheckCircle2 size={13} />
                    <span>Telah Diterima & Diserahterimakan</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ARRIVAL CONFIRMATION MODAL */}
      {selectedItemForArrival && (
        <div className="arrival-modal-backdrop" onClick={() => setSelectedItemForArrival(null)}>
          <div className="arrival-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="arrival-modal-header">
              <div className="arrival-header-left">
                <div className="arrival-icon-badge">
                  <PackageCheck size={22} />
                </div>
                <div>
                  <div className="arrival-eyebrow">VERIFIKASI SERAH TERIMA LOGISTIK BENCANA</div>
                  <h3 className="arrival-modal-title">Konfirmasi Kedatangan Bantuan di Posko</h3>
                  <span className="arrival-modal-subtitle">
                    Manifest #{selectedItemForArrival.noManifest} · {selectedItemForArrival.namaBantuan}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="arrival-btn-close"
                onClick={() => setSelectedItemForArrival(null)}
                aria-label="Tutup Dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="arrival-modal-body">
              {/* SUMMARY INFO */}
              <div className="arrival-summary-box">
                <div className="sum-item">
                  <span className="sum-label">Bantuan / Armada:</span>
                  <strong>{selectedItemForArrival.namaBantuan} ({selectedItemForArrival.moda})</strong>
                </div>
                <div className="sum-item">
                  <span className="sum-label">Rute Pengiriman:</span>
                  <span>{selectedItemForArrival.asal} ➔ {selectedItemForArrival.tujuan}</span>
                </div>
              </div>

              {/* FORM FIELDS */}
              <div className="arrival-form-group">
                <label className="arrival-label" htmlFor="poskoPenerima">
                  Posko Penerima Akhir:
                </label>
                <input
                  id="poskoPenerima"
                  type="text"
                  className="arrival-input"
                  value={poskoPenerimaInput}
                  onChange={(e) => setPoskoPenerimaInput(e.target.value)}
                />
              </div>

              <div className="arrival-form-group">
                <label className="arrival-label" htmlFor="petugasPenerima">
                  Nama / Jabatan Petugas Penerima di Posko BPBD:
                </label>
                <input
                  id="petugasPenerima"
                  type="text"
                  className="arrival-input"
                  value={petugasPenerimaInput}
                  onChange={(e) => setPetugasPenerimaInput(e.target.value)}
                  placeholder="Contoh: Budi Santoso (Koordinator Logistik Posko Induk)"
                />
              </div>

              <div className="arrival-form-group">
                <label className="arrival-label" htmlFor="catatanKondisi">
                  Catatan Kondisi Fisik Muatan & Pemeriksaan Segel:
                </label>
                <textarea
                  id="catatanKondisi"
                  rows={2}
                  className="arrival-textarea"
                  value={catatanPenerimaanInput}
                  onChange={(e) => setCatatanPenerimaanInput(e.target.value)}
                />
              </div>

              <div className="arrival-form-group">
                <label className="arrival-label" htmlFor="operatorVerifikator">
                  Akun Petugas Verifikasi BNPB:
                </label>
                <input
                  id="operatorVerifikator"
                  type="text"
                  className="arrival-input"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                />
              </div>
            </div>

            <div className="arrival-modal-footer">
              <button
                type="button"
                className="btn-arrival-cancel"
                onClick={() => setSelectedItemForArrival(null)}
              >
                Batalkan
              </button>

              <button
                type="button"
                className="btn-arrival-confirm"
                onClick={handleConfirmArrival}
              >
                <Check size={16} />
                <span>Konfirmasi Serah Terima Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
