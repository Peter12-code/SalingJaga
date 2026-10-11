import { useState, useEffect } from 'react'
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plane,
  Truck,
  Users,
  Boxes,
  ShieldCheck,
  Check,
  ArrowRight,
  Filter,
  MapPin,
  X,
  FileCheck,
  Building2,
  Plus,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './NationalSupportQueue.css'

export default function NationalSupportQueue() {
  const {
    wilayahNasionalList = [],
    permintaanDukunganList = [],
    setujuiPermintaanDukungan,
    ajukanPermintaanDukunganBaru,
    setNationalActiveTab,
    supportQueueFilterRegion,
    setSupportQueueFilterRegion,
  } = useApp()

  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterKategori, setFilterKategori] = useState('Semua')

  // Approval Modal State
  const [selectedReqForApproval, setSelectedReqForApproval] = useState(null)
  const [depoAsalInput, setDepoAsalInput] = useState('Pusat Logistik Nasional BNPB Sentul / Halim')
  const [armadaModaInput, setArmadaModaInput] = useState('Truk Logistik Amfibi & Konvoi Satgas Darat')
  const [catatanDisposisiInput, setCatatanDisposisiInput] = useState('')
  const [operatorInput, setOperatorInput] = useState('Pusdalops BNPB Pusat - Deputi 1')

  // Create Request Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newReqWilayahNama, setNewReqWilayahNama] = useState('')
  const [newReqProvinsi, setNewReqProvinsi] = useState('')
  const [newReqKategori, setNewReqKategori] = useState('Logistik Pengungsi Nasional')
  const [newReqUrgensi, setNewReqUrgensi] = useState('tinggi')
  const [newReqRincian, setNewReqRincian] = useState('')
  const [newReqAlasan, setNewReqAlasan] = useState('')
  const [newReqPengaju, setNewReqPengaju] = useState('Pusdalops BPBD Setempat')

  useEffect(() => {
    if (!selectedReqForApproval && !isCreateModalOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedReqForApproval) setSelectedReqForApproval(null)
        if (isCreateModalOpen) setIsCreateModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedReqForApproval, isCreateModalOpen])

  const statusOptions = ['Semua', 'Menunggu Persetujuan', 'Disetujui (Dalam Pengiriman)', 'Tiba di Posko']
  const kategoriOptions = [
    'Semua',
    'Evakuasi Udara / Helikopter',
    'Alat Berat & Pompa Air',
    'Logistik Pengungsi Nasional',
    'Personel Medis Darurat',
  ]

  const filtered = permintaanDukunganList.filter((r) => {
    const matchStatus = filterStatus === 'Semua' || r.status === filterStatus
    const matchKategori = filterKategori === 'Semua' || r.kategori === filterKategori
    let matchRegion = true
    if (supportQueueFilterRegion) {
      const q = supportQueueFilterRegion.toLowerCase()
      matchRegion =
        (r.wilayahNama && r.wilayahNama.toLowerCase().includes(q)) ||
        (r.provinsi && r.provinsi.toLowerCase().includes(q)) ||
        (r.wilayahId && r.wilayahId.toLowerCase().includes(q))
    }
    return matchStatus && matchKategori && matchRegion
  })

  const pendingCount = permintaanDukunganList.filter((r) => r.status === 'Menunggu Persetujuan').length

  const getCategoryIcon = (kat) => {
    if (/udara|helikopter/i.test(kat)) return <Plane size={15} />
    if (/alat berat|pompa/i.test(kat)) return <Truck size={15} />
    if (/medis|personel/i.test(kat)) return <Users size={15} />
    return <Boxes size={15} />
  }

  const handleOpenCreateModal = (targetRegion = null) => {
    const defaultRegion =
      targetRegion ||
      supportQueueFilterRegion ||
      (wilayahNasionalList[0]?.nama || 'Kab. Pesisir Selatan')
    const match = wilayahNasionalList.find(
      (w) => w.nama?.toLowerCase() === defaultRegion?.toLowerCase()
    )

    setNewReqWilayahNama(defaultRegion)
    setNewReqProvinsi(match?.provinsi || 'Indonesia')
    setNewReqKategori('Logistik Pengungsi Nasional')
    setNewReqUrgensi('tinggi')
    setNewReqRincian(
      'Paket sembako darurat 1.000 paket, selimut 500 pcs, tenda pleton pengungsi 10 unit, dan air bersih 5 tangki'
    )
    setNewReqAlasan(
      `Posko tanggap darurat di ${defaultRegion} mengalami lonjakan warga terdampak dan keterbatasan stok logistik lokal.`
    )
    setNewReqPengaju(`Pusdalops BPBD ${defaultRegion}`)
    setIsCreateModalOpen(true)
  }

  const handleRegionSelectChange = (val) => {
    setNewReqWilayahNama(val)
    const match = wilayahNasionalList.find((w) => w.nama === val)
    if (match) {
      setNewReqProvinsi(match.provinsi)
      setNewReqPengaju(`Pusdalops BPBD ${match.nama}`)
    }
  }

  const handleSubmitNewRequest = (e) => {
    e.preventDefault()
    if (!newReqWilayahNama.trim() || !newReqRincian.trim()) return

    const match = wilayahNasionalList.find((w) => w.nama === newReqWilayahNama)
    ajukanPermintaanDukunganBaru({
      wilayahId: match?.id || 'wil-custom',
      wilayahNama: newReqWilayahNama,
      provinsi: newReqProvinsi || match?.provinsi || 'Indonesia',
      kategori: newReqKategori,
      urgensi: newReqUrgensi,
      rincian: newReqRincian,
      alasanKhusus: newReqAlasan,
      diajukanOleh: newReqPengaju,
    })

    setIsCreateModalOpen(false)
  }

  const openApproveModal = (req) => {
    setSelectedReqForApproval(req)
    let defaultDepo = 'Pusat Logistik Nasional BNPB Sentul, Jawa Barat'
    let defaultModa = 'Konvoi Truk Kontainer Logistik BNPB'
    let defaultCatatan = `Persetujuan darurat bantuan untuk ${req.wilayahNama}. Prioritaskan distribusi ke posko utama.`

    if (/helikopter|udara/i.test(req.kategori)) {
      defaultDepo = 'Lanud Halim Perdanakusuma / Lanud Padang (TNI AU)'
      defaultModa = 'Helikopter Bell 412 & Super Puma TNI AU'
      defaultCatatan = 'Disposisi Satgas Udara BNPB — Siap lepas landas dalam 45 menit untuk evakuasi warga terisolir.'
    } else if (/pompa|alat berat/i.test(req.kategori)) {
      defaultDepo = 'Balai Wilayah Sungai Kementerian PUPR'
      defaultModa = 'Armada Pengangkut Low-bed & Excavator Long-Arm'
      defaultCatatan = 'Disposisi pengerahan alat berat untuk pembersihan material longsor dan normalisasi tanggul.'
    } else if (/medis/i.test(req.kategori)) {
      defaultDepo = 'Gudang Krisis Kesehatan Kemenkes RI'
      defaultModa = 'Ambulans 4x4 Satgas Lapangan BNPB & Tim Medis EMT'
      defaultCatatan = 'Kerahkan 4 dokter spesialis bedah darurat dan tim EMT BNPB ke RS darurat.'
    }

    setDepoAsalInput(defaultDepo)
    setArmadaModaInput(defaultModa)
    setCatatanDisposisiInput(defaultCatatan)
    setOperatorInput('Pusdalops BNPB Pusat - Satgas Reaksi Cepat')
  }

  const handleConfirmApproval = () => {
    if (!selectedReqForApproval) return

    setujuiPermintaanDukungan(selectedReqForApproval.id, {
      catatanDisposisi: catatanDisposisiInput,
      armadaModa: armadaModaInput,
      depoAsal: depoAsalInput,
      operator: operatorInput,
    })

    setSelectedReqForApproval(null)
  }

  return (
    <section className="national-support-queue-section" aria-label="Antrean permintaan dukungan BPBD">
      {/* SECTION HEADER */}
      <div className="support-queue-header">
        <div className="queue-header-left">
          <div className="queue-icon-badge">
            <Inbox size={22} />
          </div>
          <div>
            <div className="queue-eyebrow">ESKALASI OPERASIONAL PUSAT</div>
            <h3 className="queue-title">Antrean Permintaan Dukungan dari BPBD Daerah</h3>
            <span className="queue-sub">
              Daftar permohonan bantuan darurat personel SAR, logistik massal, armada alat berat, evakuasi udara, dan perbantuan lintas wilayah
            </span>
          </div>
        </div>

        <div className="queue-header-actions">
          {pendingCount > 0 && (
            <div className="queue-pending-beacon-pill">
              <span className="pending-beacon-dot" />
              <span>{pendingCount} Permohonan Membutuhkan Persetujuan BNPB</span>
            </div>
          )}
          <button
            type="button"
            className="btn-create-request-header"
            onClick={() => handleOpenCreateModal()}
          >
            <Plus size={15} />
            <span>Ajukan Permohonan Bantuan Baru</span>
          </button>
        </div>
      </div>

      {/* REGION FILTER BANNER (IF FILTER APPLIED FROM RANKINGS/MAP) */}
      {supportQueueFilterRegion && (
        <div className="queue-region-active-filter-banner">
          <div className="filter-banner-text">
            <MapPin size={15} />
            <span>
              Menyaring permohonan untuk wilayah: <strong>{supportQueueFilterRegion}</strong>
            </span>
          </div>
          <button
            type="button"
            className="btn-clear-region-filter"
            onClick={() => setSupportQueueFilterRegion(null)}
          >
            <X size={13} />
            <span>Tampilkan Semua Wilayah</span>
          </button>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="queue-filter-bar">
        <div className="filter-group">
          <span className="filter-label"><Filter size={13} /> Status:</span>
          {statusOptions.map((st) => (
            <button
              key={st}
              type="button"
              className={`btn-filter-pill ${filterStatus === st ? 'active' : ''}`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Kategori:</span>
          {kategoriOptions.map((kat) => (
            <button
              key={kat}
              type="button"
              className={`btn-filter-pill ${filterKategori === kat ? 'active' : ''}`}
              onClick={() => setFilterKategori(kat)}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* REQUESTS LIST */}
      <div className="queue-cards-feed">
        {filtered.length === 0 ? (
          <div className="queue-empty-box">
            <CheckCircle2 size={36} className="text-emerald" />
            <h4>Tidak Ada Permohonan pada Kategori / Wilayah Ini</h4>
            <p>
              {supportQueueFilterRegion
                ? `Belum ada antrean permohonan dukungan untuk wilayah "${supportQueueFilterRegion}". Anda dapat mengajukan permohonan dukungan baru atau melihat wilayah lain.`
                : 'Seluruh permohonan dukungan BPBD daerah pada kategori ini telah diproses atau belum diajukan.'}
            </p>
            <div className="queue-empty-actions">
              {supportQueueFilterRegion && (
                <button
                  type="button"
                  className="btn-create-request-empty"
                  onClick={() => handleOpenCreateModal(supportQueueFilterRegion)}
                >
                  <Plus size={14} />
                  <span>Buat Permohonan Dukungan untuk {supportQueueFilterRegion}</span>
                </button>
              )}
              {supportQueueFilterRegion && (
                <button
                  type="button"
                  className="btn-reset-filter-action"
                  onClick={() => setSupportQueueFilterRegion(null)}
                >
                  Tampilkan Semua Wilayah
                </button>
              )}
            </div>
          </div>
        ) : (
          filtered.map((r) => {
            const isPending = r.status === 'Menunggu Persetujuan'
            const isCritical = r.urgensi === 'kritis'

            return (
              <div key={r.id} className={`support-request-card ${isPending ? 'pending-highlight' : ''}`}>
                {/* CARD TOP META */}
                <div className="req-card-top">
                  <div className="req-id-group">
                    <span className="req-id-badge">#{r.id}</span>
                    <span className="req-cat-pill">
                      {getCategoryIcon(r.kategori)}
                      <span>{r.kategori}</span>
                    </span>
                    <span className={`req-urgency-pill ${isCritical ? 'urgency-kritis' : 'urgency-tinggi'}`}>
                      URGENSI {r.urgensi.toUpperCase()}
                    </span>
                  </div>

                  <span className={`req-status-pill status-${r.status.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')}`}>
                    {r.status}
                  </span>
                </div>

                {/* ORIGIN REGION & APPLICANT */}
                <div className="req-origin-info">
                  <h4 className="req-origin-region">
                    {r.wilayahNama} ({r.provinsi})
                  </h4>
                  <span className="req-applicant">
                    Diajukan oleh: <strong>{r.diajukanOleh}</strong>
                  </span>
                </div>

                {/* RINCIAN PERMINTAAN */}
                <div className="req-detail-box">
                  <strong className="detail-box-title">Rincian Armada / Logistik yang Diminta:</strong>
                  <p className="detail-box-content">{r.rincian}</p>
                </div>

                {/* ALASAN ESKALASI */}
                <div className="req-reason-box">
                  <span className="reason-kicker">Alasan Eskalasi Darurat:</span>
                  <p className="reason-content">{r.alasanKhusus}</p>
                </div>

                {/* DISPOSISI PUSAT (JIKA SUDAH DISETUJUI) */}
                {r.disposisiSatgas && (
                  <div className="req-disposition-trail">
                    <ShieldCheck size={16} className="text-emerald" />
                    <div>
                      <strong>Disposisi Satgas Pusat:</strong>
                      <span>{r.disposisiSatgas}</span>
                      {r.disetujuiOleh && (
                        <div className="disposition-meta">
                          Disetujui oleh: <em>{r.disetujuiOleh}</em> ({r.waktuPersetujuan})
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CARD ACTION BUTTONS */}
                <div className="req-card-actions">
                  {isPending ? (
                    <button
                      type="button"
                      className="btn-approve-request"
                      onClick={() => openApproveModal(r)}
                    >
                      <Send size={15} />
                      <span>Setujui & Kerahkan Bantuan Pusat</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-track-dispatch"
                      onClick={() => setNationalActiveTab('distribusi')}
                    >
                      <span>Lihat Pelacakan Pengiriman</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* CONFIRMATION MODAL BEFORE APPROVAL */}
      {selectedReqForApproval && (
        <div
          className="approval-modal-backdrop"
          onClick={() => setSelectedReqForApproval(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-modal-title"
        >
          <div className="approval-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <div className="approval-header-left">
                <div className="approval-icon-badge">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="approval-eyebrow">OTORISASI KOMANDO NASIONAL BNPB</div>
                  <h3 id="approval-modal-title" className="approval-modal-title">
                    Konfirmasi Pengerahan Bantuan Pusat
                  </h3>
                  <span className="approval-modal-subtitle">
                    Permohonan #{selectedReqForApproval.id} · {selectedReqForApproval.wilayahNama}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="approval-btn-close"
                onClick={() => setSelectedReqForApproval(null)}
                aria-label="Tutup Dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="approval-modal-body">
              {/* SUMMARY BOX */}
              <div className="approval-summary-card">
                <div className="summary-row">
                  <span className="sum-label">Wilayah Sasaran:</span>
                  <strong className="sum-val">{selectedReqForApproval.wilayahNama} ({selectedReqForApproval.provinsi})</strong>
                </div>
                <div className="summary-row">
                  <span className="sum-label">Kategori / Urgensi:</span>
                  <span className="sum-val">{selectedReqForApproval.kategori} · URGENSI {selectedReqForApproval.urgensi.toUpperCase()}</span>
                </div>
                <div className="summary-row">
                  <span className="sum-label">Bantuan yang Diminta:</span>
                  <p className="sum-detail-text">{selectedReqForApproval.rincian}</p>
                </div>
                <div className="summary-row">
                  <span className="sum-label">Alasan Eskalasi BPBD:</span>
                  <p className="sum-reason-text">{selectedReqForApproval.alasanKhusus}</p>
                </div>
              </div>

              {/* INPUT FIELDS */}
              <div className="approval-form-group">
                <label className="approval-label" htmlFor="depoAsal">
                  Pangkalan / Depo Asal Pengiriman:
                </label>
                <input
                  id="depoAsal"
                  type="text"
                  className="approval-input"
                  value={depoAsalInput}
                  onChange={(e) => setDepoAsalInput(e.target.value)}
                  placeholder="Contoh: Pusat Logistik Nasional Sentul / Lanud Halim..."
                />
              </div>

              <div className="approval-form-group">
                <label className="approval-label" htmlFor="armadaModa">
                  Moda Armada Pengerahan:
                </label>
                <input
                  id="armadaModa"
                  type="text"
                  className="approval-input"
                  value={armadaModaInput}
                  onChange={(e) => setArmadaModaInput(e.target.value)}
                  placeholder="Contoh: Pesawat C-130 Hercules TNI AU..."
                />
              </div>

              <div className="approval-form-group">
                <label className="approval-label" htmlFor="disposisiNotes">
                  Catatan Instruksi Disposisi Satgas Pusat:
                </label>
                <textarea
                  id="disposisiNotes"
                  rows={2}
                  className="approval-textarea"
                  value={catatanDisposisiInput}
                  onChange={(e) => setCatatanDisposisiInput(e.target.value)}
                  placeholder="Instruksi khusus kepada komandan satgas pengiriman..."
                />
              </div>

              <div className="approval-form-group">
                <label className="approval-label" htmlFor="operatorApprover">
                  Akun Petugas Pengesah (BNPB Pusat):
                </label>
                <input
                  id="operatorApprover"
                  type="text"
                  className="approval-input"
                  value={operatorInput}
                  onChange={(e) => setOperatorInput(e.target.value)}
                />
              </div>
            </div>

            <div className="approval-modal-footer">
              <button
                type="button"
                className="btn-approval-cancel"
                onClick={() => setSelectedReqForApproval(null)}
              >
                Batalkan
              </button>

              <button
                type="button"
                className="btn-approval-confirm"
                onClick={handleConfirmApproval}
              >
                <Send size={15} />
                <span>Konfirmasi & Kerahkan Bantuan Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW SUPPORT REQUEST MODAL */}
      {isCreateModalOpen && (
        <div
          className="approval-modal-backdrop"
          onClick={() => setIsCreateModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-request-modal-title"
        >
          <div className="approval-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="approval-modal-header">
              <div className="approval-header-left">
                <div className="approval-icon-badge" style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                  <Plus size={22} />
                </div>
                <div>
                  <div className="approval-eyebrow">FORMULIR PERMOHONAN RESMI BPBD</div>
                  <h3 id="create-request-modal-title" className="approval-modal-title">
                    Ajukan Dukungan Sumber Daya ke BNPB Pusat
                  </h3>
                  <span className="approval-modal-subtitle">
                    Eskalasi perbantuan logistik massal, armada darurat, SAR, dan personel lintas daerah
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="approval-btn-close"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Tutup Dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitNewRequest}>
              <div className="approval-modal-body">
                <div className="approval-form-row-2">
                  <div className="approval-form-group">
                    <label className="approval-label" htmlFor="newWilayahNama">
                      Wilayah Pemohon (Kabupaten/Kota):
                    </label>
                    <select
                      id="newWilayahNama"
                      className="approval-input"
                      value={newReqWilayahNama}
                      onChange={(e) => handleRegionSelectChange(e.target.value)}
                      required
                    >
                      {wilayahNasionalList.map((w) => (
                        <option key={w.id || w.nama} value={w.nama}>
                          {w.nama} ({w.provinsi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="approval-form-group">
                    <label className="approval-label" htmlFor="newProvinsi">
                      Provinsi:
                    </label>
                    <input
                      id="newProvinsi"
                      type="text"
                      className="approval-input"
                      value={newReqProvinsi}
                      onChange={(e) => setNewReqProvinsi(e.target.value)}
                      placeholder="Provinsi..."
                      required
                    />
                  </div>
                </div>

                <div className="approval-form-row-2">
                  <div className="approval-form-group">
                    <label className="approval-label" htmlFor="newKategori">
                      Kategori Bantuan:
                    </label>
                    <select
                      id="newKategori"
                      className="approval-input"
                      value={newReqKategori}
                      onChange={(e) => setNewReqKategori(e.target.value)}
                    >
                      <option value="Evakuasi Udara / Helikopter">Evakuasi Udara / Helikopter</option>
                      <option value="Alat Berat & Pompa Air">Alat Berat & Pompa Air</option>
                      <option value="Logistik Pengungsi Nasional">Logistik Pengungsi Nasional</option>
                      <option value="Personel Medis Darurat">Personel Medis Darurat</option>
                    </select>
                  </div>

                  <div className="approval-form-group">
                    <label className="approval-label" htmlFor="newUrgensi">
                      Tingkat Urgensi:
                    </label>
                    <select
                      id="newUrgensi"
                      className="approval-input"
                      value={newReqUrgensi}
                      onChange={(e) => setNewReqUrgensi(e.target.value)}
                    >
                      <option value="kritis">🔴 Kritis (Mengancam Jiwa / Terisolir)</option>
                      <option value="tinggi">🟠 Tinggi (Stok Menipis / Eskalasi Cepat)</option>
                      <option value="sedang">🟡 Sedang (Dukungan Cadangan Posko)</option>
                    </select>
                  </div>
                </div>

                <div className="approval-form-group">
                  <label className="approval-label" htmlFor="newRincian">
                    Rincian Kebutuhan Spesifik:
                  </label>
                  <textarea
                    id="newRincian"
                    rows={2}
                    className="approval-textarea"
                    value={newReqRincian}
                    onChange={(e) => setNewReqRincian(e.target.value)}
                    placeholder="Contoh: Paket sembako 1.000 paket, tenda darurat 10 unit, perahu karet 3 unit..."
                    required
                  />
                </div>

                <div className="approval-form-group">
                  <label className="approval-label" htmlFor="newAlasan">
                    Alasan Eskalasi & Kondisi Lapangan:
                  </label>
                  <textarea
                    id="newAlasan"
                    rows={2}
                    className="approval-textarea"
                    value={newReqAlasan}
                    onChange={(e) => setNewReqAlasan(e.target.value)}
                    placeholder="Contoh: Akses darat terputus banjir, kapasitas logistik posko lokal tidak mencukupi..."
                    required
                  />
                </div>

                <div className="approval-form-group">
                  <label className="approval-label" htmlFor="newPengaju">
                    Instansi / Pejabat Pengaju:
                  </label>
                  <input
                    id="newPengaju"
                    type="text"
                    className="approval-input"
                    value={newReqPengaju}
                    onChange={(e) => setNewReqPengaju(e.target.value)}
                    placeholder="Contoh: Pusdalops BPBD Kab. Pesisir Selatan"
                    required
                  />
                </div>
              </div>

              <div className="approval-modal-footer">
                <button
                  type="button"
                  className="btn-approval-cancel"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="btn-approval-confirm"
                  style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                >
                  <Send size={15} />
                  <span>Kirim Permohonan ke Antrean Pusat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
