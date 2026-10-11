import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Lock,
  KeyRound,
  AlertTriangle,
  Archive,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  History,
  X,
  Plus,
  Edit3,
  ExternalLink,
  LogOut,
  Info,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { STATUS_AKUN_BPBD, RINGKASAN_AKUN_BPBD_BASELINE } from '../../data/nationalData'
import './NationalBPBDAdmin.css'

export default function NationalBPBDAdmin() {
  const {
    akunBpbdList = [],
    tambahAkunBpbd,
    verifikasiAkunBpbd,
    editAkunBpbd,
    resetPasswordAkunBpbd,
    tangguhkanAkunBpbd,
    aktifkanKembaliAkunBpbd,
    akhiriSesiPerangkatAkunBpbd,
    arsipkanAkunBpbd,
  } = useApp()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterTingkat, setFilterTingkat] = useState('Semua')

  // Modals state
  const [detailModalAcc, setDetailModalAcc] = useState(null)
  const [verifyModalAcc, setVerifyModalAcc] = useState(null)
  const [suspendModalAcc, setSuspendModalAcc] = useState(null)
  const [resetModalAcc, setResetModalAcc] = useState(null)
  const [archiveModalAcc, setArchiveModalAcc] = useState(null)
  const [editModalAcc, setEditModalAcc] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Form states for modals
  const [verifyPetugas, setVerifyPetugas] = useState('Drs. Hendro Wibowo (BNPB Pusat)')
  const [verifyCatatan, setVerifyCatatan] = useState('Dokumen SK Pelantikan Kalaksa & Surat Tugas Pusdalops lengkap terverifikasi.')

  const [suspendAlasan, setSuspendAlasan] = useState('Anomali percobaan akses berulang & klarifikasi struktur darurat BPBD')
  const [suspendDurasi, setSuspendDurasi] = useState('3 Hari (72 Jam)')
  const [suspendPetugas, setSuspendPetugas] = useState('Pusdalops BNPB Pusat - Satgas Siber')
  const [suspendCatatan, setSuspendCatatan] = useState('Akses dashboard ditangguhkan sementara demi keamanan. Layanan publik warga dan informasi tanggap darurat tetap beroperasi.')

  const [resetPetugas, setResetPetugas] = useState('Pusdalops BNPB Pusat')
  const [resetAlasan, setResetAlasan] = useState('Permohonan resmi reset kredensial oleh Kepala Pelaksana BPBD')
  const [resetResult, setResetResult] = useState(null)
  const [hasCopiedResetPass, setHasCopiedResetPass] = useState(false)

  const [archiveAlasan, setArchiveAlasan] = useState('Pemekaran daerah otonom baru / reorganisasi administratif wilayah')
  const [archivePetugas, setArchivePetugas] = useState('Pusdatin BNPB Pusat')

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    instansi: '',
    wilayah: '',
    provinsi: '',
    tingkat: 'Kabupaten',
    hotline: '',
    emailResmi: '',
    penanggungJawabNama: '',
    penanggungJawabNip: '',
    penanggungJawabJabatan: '',
    penanggungJawabKontak: '',
  })

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    instansi: '',
    wilayah: '',
    provinsi: '',
    tingkat: 'Kabupaten',
    hotline: '',
    emailResmi: '',
    namaPic: '',
    nipPic: '',
    jabatanPic: 'Kepala Pelaksana BPBD',
    kontakPic: '',
    petugasPendaftar: 'Pusdalops BNPB Pusat',
  })

  // Global ESC key listener for any open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailModalAcc(null)
        setVerifyModalAcc(null)
        setSuspendModalAcc(null)
        setResetModalAcc(null)
        setArchiveModalAcc(null)
        setEditModalAcc(null)
        setIsCreateModalOpen(false)
        setResetResult(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Dynamic KPI counters based on baseline & real mutations
  const kpiCounters = useMemo(() => {
    const sampleBaselineCount = 12
    const currentSampleCount = akunBpbdList.length
    const diffTotal = currentSampleCount - sampleBaselineCount

    const aktifCount = akunBpbdList.filter((a) => a.status === STATUS_AKUN_BPBD.AKTIF).length
    const menungguCount = akunBpbdList.filter((a) => a.status === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI).length
    const ditangguhkanCount = akunBpbdList.filter((a) => a.status === STATUS_AKUN_BPBD.DITANGGUHKAN).length
    const diarsipkanCount = akunBpbdList.filter((a) => a.status === STATUS_AKUN_BPBD.DIARSIPKAN).length

    // Initial dummy data breakdown was 6 Aktif, 2 Menunggu, 2 Ditangguhkan, 2 Diarsipkan
    const deltaAktif = aktifCount - 6
    const deltaMenunggu = menungguCount - 2
    const deltaDitangguhkan = ditangguhkanCount - 2
    const deltaDiarsipkan = diarsipkanCount - 2

    return {
      total: Math.max(514, RINGKASAN_AKUN_BPBD_BASELINE.totalAkunWilayah + diffTotal),
      aktif: Math.max(0, RINGKASAN_AKUN_BPBD_BASELINE.aktif + deltaAktif),
      menunggu: Math.max(0, RINGKASAN_AKUN_BPBD_BASELINE.menungguVerifikasi + deltaMenunggu),
      ditangguhkan: Math.max(0, RINGKASAN_AKUN_BPBD_BASELINE.ditangguhkan + deltaDitangguhkan),
      diarsipkan: Math.max(0, RINGKASAN_AKUN_BPBD_BASELINE.diarsipkan + deltaDiarsipkan),
    }
  }, [akunBpbdList])

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return akunBpbdList.filter((acc) => {
      // Status filter
      if (filterStatus !== 'Semua' && acc.status !== filterStatus) return false

      // Tingkat filter
      if (filterTingkat !== 'Semua' && acc.tingkat !== filterTingkat) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchInstansi = (acc.instansi || '').toLowerCase().includes(q)
        const matchWilayah = (acc.wilayah || '').toLowerCase().includes(q)
        const matchProvinsi = (acc.provinsi || '').toLowerCase().includes(q)
        const matchPic = (acc.penanggungJawab?.nama || '').toLowerCase().includes(q)
        const matchEmail = (acc.emailResmi || '').toLowerCase().includes(q)
        const matchHotline = (acc.hotline || '').toLowerCase().includes(q)
        const matchKode = (acc.kodeWilayah || '').toLowerCase().includes(q)
        if (!matchInstansi && !matchWilayah && !matchProvinsi && !matchPic && !matchEmail && !matchHotline && !matchKode) {
          return false
        }
      }

      return true
    })
  }, [akunBpbdList, filterStatus, filterTingkat, searchQuery])

  // Open Edit Modal helper
  const handleOpenEdit = (acc) => {
    setEditFormData({
      instansi: acc.instansi || '',
      wilayah: acc.wilayah || '',
      provinsi: acc.provinsi || '',
      tingkat: acc.tingkat || 'Kabupaten',
      hotline: acc.hotline || '',
      emailResmi: acc.emailResmi || '',
      penanggungJawabNama: acc.penanggungJawab?.nama || '',
      penanggungJawabNip: acc.penanggungJawab?.nip || '',
      penanggungJawabJabatan: acc.penanggungJawab?.jabatan || '',
      penanggungJawabKontak: acc.penanggungJawab?.kontak || '',
    })
    setEditModalAcc(acc)
  }

  // Handle Submit Edit
  const handleSubmitEdit = (e) => {
    e.preventDefault()
    if (!editModalAcc) return
    editAkunBpbd(editModalAcc.id, editFormData, 'Pusdalops BNPB Pusat')
    setEditModalAcc(null)
  }

  // Handle Submit Create
  const handleSubmitCreate = (e) => {
    e.preventDefault()
    tambahAkunBpbd(createFormData, createFormData.petugasPendaftar)
    setIsCreateModalOpen(false)
    setCreateFormData({
      instansi: '',
      wilayah: '',
      provinsi: '',
      tingkat: 'Kabupaten',
      hotline: '',
      emailResmi: '',
      namaPic: '',
      nipPic: '',
      jabatanPic: 'Kepala Pelaksana BPBD',
      kontakPic: '',
      petugasPendaftar: 'Pusdalops BNPB Pusat',
    })
  }

  // Handle Confirm Verify
  const handleConfirmVerify = () => {
    if (!verifyModalAcc) return
    verifikasiAkunBpbd(verifyModalAcc.id, verifyPetugas, verifyCatatan)
    setVerifyModalAcc(null)
  }

  // Handle Confirm Suspend
  const handleConfirmSuspend = () => {
    if (!suspendModalAcc) return
    tangguhkanAkunBpbd(suspendModalAcc.id, {
      alasan: suspendAlasan,
      durasi: suspendDurasi,
      petugas: suspendPetugas,
      catatan: suspendCatatan,
    })
    setSuspendModalAcc(null)
  }

  // Handle Confirm Reset Password
  const handleConfirmResetPassword = () => {
    if (!resetModalAcc) return
    const res = resetPasswordAkunBpbd(resetModalAcc.id, resetPetugas, resetAlasan)
    setResetResult(res)
    setHasCopiedResetPass(false)
  }

  // Handle Copy Temp Password
  const handleCopyPassword = () => {
    if (!resetResult?.tempPassword) return
    navigator.clipboard.writeText(resetResult.tempPassword)
    setHasCopiedResetPass(true)
    setTimeout(() => setHasCopiedResetPass(false), 3000)
  }

  // Handle Confirm Archive
  const handleConfirmArchive = () => {
    if (!archiveModalAcc) return
    arsipkanAkunBpbd(archiveModalAcc.id, {
      alasan: archiveAlasan,
      petugas: archivePetugas,
    })
    setArchiveModalAcc(null)
  }

  // Handle Force Terminate Sessions
  const handleForceTerminate = (acc) => {
    if (!acc) return
    akhiriSesiPerangkatAkunBpbd(acc.id, 'Pusdalops BNPB Pusat')
    if (detailModalAcc?.id === acc.id) {
      setDetailModalAcc((prev) => (prev ? { ...prev, sesiAktif: 0 } : null))
    }
  }

  return (
    <div className="national-bpbd-admin-section">
      {/* 1. HEADER & POLICY NOTICE */}
      <div className="admin-header-card">
        <div className="admin-header-left">
          <div className="admin-header-badge">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="admin-eyebrow">PUSDALOPS BNPB PUSAT · OTORISASI WILAYAH</div>
            <h2 className="admin-title">Administrasi Akun Resmi BPBD Daerah</h2>
            <p className="admin-subtitle">
              Satu akun institusi resmi per kabupaten/kota dan provinsi. Mengatur verifikasi identitas,
              pemulihan akses, penangguhan sementara, serta pengarsipan data historis tanpa pemutusan riwayat bencana.
            </p>
          </div>
        </div>

        <div className="admin-header-right">
          <button
            type="button"
            className="btn-admin-add-account"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Daftarkan Akun BPBD Baru</span>
          </button>
        </div>
      </div>

      {/* 2. REQUISITE SUMMARY KPI RIBBON (514 Akun, 500 Aktif, 8 Menunggu, 4 Ditangguhkan, 2 Diarsipkan) */}
      <div className="admin-kpi-ribbon" aria-label="Ringkasan status akun BPBD">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon blue">
            <Building2 size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-number">{kpiCounters.total}</span>
            <span className="admin-kpi-label">Akun Wilayah Terdaftar</span>
            <span className="admin-kpi-sub">514 Kab/Kota se-Indonesia</span>
          </div>
        </div>

        <div
          className={`admin-kpi-card clickable ${filterStatus === STATUS_AKUN_BPBD.AKTIF ? 'active-filter' : ''}`}
          onClick={() => setFilterStatus(filterStatus === STATUS_AKUN_BPBD.AKTIF ? 'Semua' : STATUS_AKUN_BPBD.AKTIF)}
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-number">{kpiCounters.aktif}</span>
            <span className="admin-kpi-label">Akun Aktif</span>
            <span className="admin-kpi-sub">Dapat akses dashboard BPBD</span>
          </div>
        </div>

        <div
          className={`admin-kpi-card clickable ${filterStatus === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI ? 'active-filter' : ''}`}
          onClick={() =>
            setFilterStatus(
              filterStatus === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI ? 'Semua' : STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI
            )
          }
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-icon yellow">
            <Clock size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-number">{kpiCounters.menunggu}</span>
            <span className="admin-kpi-label">Menunggu Verifikasi</span>
            <span className="admin-kpi-sub">Belum boleh masuk sistem</span>
          </div>
        </div>

        <div
          className={`admin-kpi-card clickable ${filterStatus === STATUS_AKUN_BPBD.DITANGGUHKAN ? 'active-filter' : ''}`}
          onClick={() =>
            setFilterStatus(filterStatus === STATUS_AKUN_BPBD.DITANGGUHKAN ? 'Semua' : STATUS_AKUN_BPBD.DITANGGUHKAN)
          }
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-icon red">
            <Lock size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-number">{kpiCounters.ditangguhkan}</span>
            <span className="admin-kpi-label">Ditangguhkan</span>
            <span className="admin-kpi-sub">Akses diblokir sementara</span>
          </div>
        </div>

        <div
          className={`admin-kpi-card clickable ${filterStatus === STATUS_AKUN_BPBD.DIARSIPKAN ? 'active-filter' : ''}`}
          onClick={() =>
            setFilterStatus(filterStatus === STATUS_AKUN_BPBD.DIARSIPKAN ? 'Semua' : STATUS_AKUN_BPBD.DIARSIPKAN)
          }
          role="button"
          tabIndex={0}
        >
          <div className="admin-kpi-icon gray">
            <Archive size={20} />
          </div>
          <div className="admin-kpi-content">
            <span className="admin-kpi-number">{kpiCounters.diarsipkan}</span>
            <span className="admin-kpi-label">Diarsipkan</span>
            <span className="admin-kpi-sub">Riwayat tetap aman terlindungi</span>
          </div>
        </div>
      </div>

      {/* 3. SECURITY & AUDIT POLICY CALLOUT */}
      <div className="admin-policy-banner">
        <div className="policy-banner-icon">
          <Info size={18} />
        </div>
        <div className="policy-banner-text">
          <strong>Kebijakan Integritas Data Nasional:</strong> Penghapusan permanen akun ditiadakan.
          Akun BPBD hanya dapat <em>Diarsipkan</em> ketika terjadi pemekaran wilayah atau pergantian kelembagaan,
          sehingga seluruh riwayat laporan bencana, permohonan bantuan logistik, pencarian keluarga,
          dan catatan audit tetap utuh tercatat sebagai aset sejarah daerah tersebut.
        </div>
      </div>

      {/* 4. SEARCH & FILTER TOOLBAR */}
      <div className="admin-controls-toolbar">
        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kabupaten/kota, instansi, provinsi, pejabat, kode wilayah..."
          />
          {searchQuery && (
            <button type="button" className="btn-clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="admin-filters-row">
          <div className="filter-pill-group">
            <span className="filter-group-label">Status:</span>
            {['Semua', STATUS_AKUN_BPBD.AKTIF, STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI, STATUS_AKUN_BPBD.DITANGGUHKAN, STATUS_AKUN_BPBD.DIARSIPKAN].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  className={`admin-filter-pill ${filterStatus === st ? 'active' : ''}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              )
            )}
          </div>

          <div className="filter-select-group">
            <label htmlFor="filterTingkatSelect" className="filter-select-label">
              Tingkat:
            </label>
            <select
              id="filterTingkatSelect"
              className="admin-select"
              value={filterTingkat}
              onChange={(e) => setFilterTingkat(e.target.value)}
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="Kabupaten">Kabupaten</option>
              <option value="Kota">Kota</option>
              <option value="Provinsi">Provinsi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. ACCOUNTS TABLE & CARDS */}
      <div className="admin-table-container">
        {filteredAccounts.length === 0 ? (
          <div className="admin-empty-state">
            <AlertTriangle size={32} />
            <h4>Tidak Ada Akun BPBD Ditemukan</h4>
            <p>Cobalah mengganti kata kunci pencarian atau mengubah filter status di atas.</p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setSearchQuery('')
                setFilterStatus('Semua')
                setFilterTingkat('Semua')
              }}
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Instansi & Wilayah</th>
                <th>Penanggung Jawab (PIC)</th>
                <th>Hotline & Kontak Resmi</th>
                <th>Status Akses</th>
                <th>Login Terakhir</th>
                <th className="th-actions">Aksi Otorisasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((acc) => {
                const isAktif = acc.status === STATUS_AKUN_BPBD.AKTIF
                const isPending = acc.status === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI
                const isSuspended = acc.status === STATUS_AKUN_BPBD.DITANGGUHKAN
                const isArchived = acc.status === STATUS_AKUN_BPBD.DIARSIPKAN

                return (
                  <tr key={acc.id} className={`tr-status-${acc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {/* 1. INSTANSI & WILAYAH */}
                    <td>
                      <div className="td-instansi-cell">
                        <div className={`instansi-avatar-badge ${acc.tingkat.toLowerCase()}`}>
                          <Building2 size={16} />
                        </div>
                        <div className="instansi-info">
                          <strong className="instansi-name">{acc.instansi}</strong>
                          <span className="instansi-sub">
                            <MapPin size={11} /> {acc.wilayah}, {acc.provinsi}
                          </span>
                          <span className="instansi-code">
                            Kode: {acc.kodeWilayah} · {acc.tingkat}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. PIC / PENANGGUNG JAWAB */}
                    <td>
                      <div className="td-pic-cell">
                        <div className="pic-name-row">
                          <User size={13} />
                          <strong>{acc.penanggungJawab?.nama || '-'}</strong>
                        </div>
                        <span className="pic-role">{acc.penanggungJawab?.jabatan || 'Kalaksa BPBD'}</span>
                        <span className="pic-nip">NIP: {acc.penanggungJawab?.nip || '-'}</span>
                      </div>
                    </td>

                    {/* 3. KONTAK & HOTLINE */}
                    <td>
                      <div className="td-contact-cell">
                        <div className="contact-row hotline">
                          <Phone size={12} />
                          <span>{acc.hotline}</span>
                        </div>
                        <div className="contact-row email">
                          <Mail size={12} />
                          <span>{acc.emailResmi}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. STATUS BADGE */}
                    <td>
                      <div className="td-status-cell">
                        <span
                          className={`status-pill ${
                            isAktif
                              ? 'status-aktif'
                              : isPending
                              ? 'status-pending'
                              : isSuspended
                              ? 'status-suspended'
                              : 'status-archived'
                          }`}
                        >
                          {isAktif && <CheckCircle2 size={12} />}
                          {isPending && <Clock size={12} />}
                          {isSuspended && <Lock size={12} />}
                          {isArchived && <Archive size={12} />}
                          <span>{acc.status}</span>
                        </span>

                        {isAktif && (
                          <span className="session-count-indicator" title="Sesi perangkat yang sedang aktif">
                            ● {acc.sesiAktif} Sesi Aktif
                          </span>
                        )}

                        {isSuspended && acc.penangguhanInfo && (
                          <span className="suspend-duration-hint" title={acc.penangguhanInfo.alasan}>
                            Durasi: {acc.penangguhanInfo.durasi}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. LOGIN TERAKHIR */}
                    <td>
                      <div className="td-login-cell">
                        <span className="login-time">{acc.terakhirLogin}</span>
                        <span className="login-ip">{acc.ipTerakhir}</span>
                      </div>
                    </td>

                    {/* 6. CONTEXTUAL ACTIONS */}
                    <td>
                      <div className="td-actions-cell">
                        {/* LIHAT DETAIL BUTTON */}
                        <button
                          type="button"
                          className="btn-action-sm btn-detail"
                          onClick={() => setDetailModalAcc(acc)}
                          title="Lihat profil lengkap, sesi login & riwayat aktivitas"
                        >
                          <History size={13} />
                          <span>Detail</span>
                        </button>

                        {/* VERIFIKASI (Khusus Menunggu Verifikasi) */}
                        {isPending && (
                          <button
                            type="button"
                            className="btn-action-sm btn-verify"
                            onClick={() => {
                              setVerifyModalAcc(acc)
                              setVerifyPetugas('Drs. Hendro Wibowo (BNPB Pusat)')
                              setVerifyCatatan('SK Pelantikan Kalaksa & Surat Tugas Pusdalops lengkap terverifikasi.')
                            }}
                            title="Verifikasi dokumen dan aktifkan akun resmi"
                          >
                            <ShieldCheck size={13} />
                            <span>Verifikasi</span>
                          </button>
                        )}

                        {/* RESET AKSES (Untuk Aktif & Ditangguhkan) */}
                        {(isAktif || isSuspended) && (
                          <button
                            type="button"
                            className="btn-action-sm btn-reset"
                            onClick={() => {
                              setResetModalAcc(acc)
                              setResetResult(null)
                              setResetPetugas('Pusdalops BNPB Pusat')
                              setResetAlasan('Permohonan resmi reset kredensial oleh Kepala Pelaksana BPBD')
                            }}
                            title="Reset kata sandi tanpa melihat kata sandi lama"
                          >
                            <KeyRound size={13} />
                            <span>Reset</span>
                          </button>
                        )}

                        {/* TANGGUHKAN (Khusus Aktif) */}
                        {isAktif && (
                          <button
                            type="button"
                            className="btn-action-sm btn-suspend"
                            onClick={() => {
                              setSuspendModalAcc(acc)
                              setSuspendAlasan('Anomali percobaan akses berulang & klarifikasi struktur darurat BPBD')
                              setSuspendDurasi('3 Hari (72 Jam)')
                              setSuspendPetugas('Pusdalops BNPB Pusat - Satgas Siber')
                              setSuspendCatatan('Akses dashboard ditangguhkan sementara demi keamanan. Layanan publik warga dan informasi tanggap darurat tetap beroperasi.')
                            }}
                            title="Tangguhkan akses dashboard BPBD sementara"
                          >
                            <Lock size={13} />
                            <span>Tangguhkan</span>
                          </button>
                        )}

                        {/* AKTIFKAN KEMBALI (Untuk Ditangguhkan atau Diarsipkan) */}
                        {(isSuspended || isArchived) && (
                          <button
                            type="button"
                            className="btn-action-sm btn-reactivate"
                            onClick={() => aktifkanKembaliAkunBpbd(acc.id, 'Pusdalops BNPB Pusat', 'Pencabutan status penangguhan')}
                            title="Aktifkan kembali akses akun BPBD"
                          >
                            <CheckCircle2 size={13} />
                            <span>Aktifkan</span>
                          </button>
                        )}

                        {/* EDIT INFO (Kecuali Diarsipkan) */}
                        {!isArchived && (
                          <button
                            type="button"
                            className="btn-action-sm btn-edit"
                            onClick={() => handleOpenEdit(acc)}
                            title="Ubah nama instansi, wilayah, hotline & penanggung jawab"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* ARSIPKAN (Pengganti Hapus Akun) */}
                        {!isArchived && (
                          <button
                            type="button"
                            className="btn-action-sm btn-archive"
                            onClick={() => {
                              setArchiveModalAcc(acc)
                              setArchiveAlasan('Pemekaran daerah otonom baru / reorganisasi administratif wilayah')
                              setArchivePetugas('Pusdatin BNPB Pusat')
                            }}
                            title="Arsipkan akun (pengganti hapus permanen agar riwayat terlindungi)"
                          >
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: DETAIL & AUDIT RIWAYAT AKUN BPBD
          ========================================================================= */}
      {detailModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setDetailModalAcc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-acc-modal-title"
        >
          <div className="admin-modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge blue">
                  <Building2 size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">DETAIL RESMI AKUN INSTITUSI BPBD</div>
                  <h3 id="detail-acc-modal-title" className="modal-title">
                    {detailModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    ID: {detailModalAcc.id} · Kode Wilayah Kemendagri: {detailModalAcc.kodeWilayah}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setDetailModalAcc(null)}
                aria-label="Tutup dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* PENANGGUHAN WARNING IF SUSPENDED */}
              {detailModalAcc.status === STATUS_AKUN_BPBD.DITANGGUHKAN && detailModalAcc.penangguhanInfo && (
                <div className="modal-alert-box alert-danger">
                  <div className="alert-box-icon">
                    <Lock size={18} />
                  </div>
                  <div>
                    <strong>Akun Sedang Dalam Penangguhan Sementara ({detailModalAcc.penangguhanInfo.durasi}):</strong>
                    <p>Alasan: {detailModalAcc.penangguhanInfo.alasan}</p>
                    <small>
                      Ditetapkan oleh: {detailModalAcc.penangguhanInfo.petugas} pada {detailModalAcc.penangguhanInfo.waktuMulai}.
                      Catatan: {detailModalAcc.penangguhanInfo.catatan}
                    </small>
                  </div>
                </div>
              )}

              {/* ARCHIVE NOTICE IF ARCHIVED */}
              {detailModalAcc.status === STATUS_AKUN_BPBD.DIARSIPKAN && detailModalAcc.pengarsipanInfo && (
                <div className="modal-alert-box alert-secondary">
                  <div className="alert-box-icon">
                    <Archive size={18} />
                  </div>
                  <div>
                    <strong>Akun Berstatus Diarsipkan Permanen:</strong>
                    <p>Alasan: {detailModalAcc.pengarsipanInfo.alasan}</p>
                    <small>
                      Diarsipkan oleh: {detailModalAcc.pengarsipanInfo.petugas} ({detailModalAcc.pengarsipanInfo.waktuArsip}).
                      Seluruh riwayat bencana daerah ini tetap aman tersimpan dalam basis data BNPB.
                    </small>
                  </div>
                </div>
              )}

              {/* PROFILE GRID */}
              <div className="detail-profile-grid">
                <div className="detail-item">
                  <span className="detail-item-label">Yurisdiksi Daerah:</span>
                  <strong className="detail-item-val">{detailModalAcc.wilayah}, {detailModalAcc.provinsi}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Status Akses:</span>
                  <span className={`status-pill status-${detailModalAcc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {detailModalAcc.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Kepala Pelaksana (PIC):</span>
                  <strong className="detail-item-val">{detailModalAcc.penanggungJawab?.nama}</strong>
                  <span className="detail-item-sub">NIP: {detailModalAcc.penanggungJawab?.nip}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Kontak PIC:</span>
                  <span className="detail-item-val">{detailModalAcc.penanggungJawab?.kontak}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Hotline Pusdalops 24 Jam:</span>
                  <strong className="detail-item-val text-green">{detailModalAcc.hotline}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Email Kedinasan:</span>
                  <span className="detail-item-val">{detailModalAcc.emailResmi}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Login Terakhir:</span>
                  <span className="detail-item-val">{detailModalAcc.terakhirLogin} ({detailModalAcc.ipTerakhir})</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item-label">Tanggal Registrasi:</span>
                  <span className="detail-item-val">{detailModalAcc.tanggalDibuat}</span>
                </div>
              </div>

              {/* ACTIVE DEVICE SESSIONS CARD */}
              <div className="detail-sessions-card">
                <div className="sessions-card-header">
                  <div>
                    <h4 className="sessions-title">Sesi Login Perangkat Aktif</h4>
                    <span className="sessions-sub">
                      {detailModalAcc.sesiAktif > 0
                        ? `${detailModalAcc.sesiAktif} perangkat terotentikasi ke dashboard BPBD`
                        : 'Tidak ada sesi perangkat yang aktif saat ini'}
                    </span>
                  </div>
                  {detailModalAcc.sesiAktif > 0 && (
                    <button
                      type="button"
                      className="btn-force-logout"
                      onClick={() => handleForceTerminate(detailModalAcc)}
                    >
                      <LogOut size={13} />
                      <span>Akhiri Seluruh Sesi Perangkat</span>
                    </button>
                  )}
                </div>

                {detailModalAcc.sesiAktif > 0 && (
                  <div className="active-sessions-list">
                    <div className="session-item">
                      <div className="session-dot" />
                      <div className="session-info">
                        <strong>Desktop Pusdalops (Windows 11 · Chrome 129)</strong>
                        <span>IP: {detailModalAcc.ipTerakhir} · Aktif sekarang</span>
                      </div>
                    </div>
                    {detailModalAcc.sesiAktif > 1 && (
                      <div className="session-item">
                        <div className="session-dot" />
                        <div className="session-info">
                          <strong>Mobile Tactical (Android 14 · SalingJaga PWA)</strong>
                          <span>IP: {detailModalAcc.ipTerakhir} · Aktif 45 menit lalu</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AUDIT ACTIVITY TRAIL */}
              <div className="detail-activity-card">
                <h4 className="activity-card-title">
                  <History size={15} /> Riwayat Aktivitas & Audit Akun
                </h4>
                <div className="detail-activity-list">
                  {detailModalAcc.riwayatAktivitas && detailModalAcc.riwayatAktivitas.length > 0 ? (
                    detailModalAcc.riwayatAktivitas.map((act) => (
                      <div key={act.id} className="activity-entry">
                        <span className="act-time">{act.waktu}</span>
                        <div className="act-desc">
                          <strong>{act.aksi}</strong>
                          <span className="act-meta">
                            Operator: {act.operator || 'Petugas'} · IP: {act.ip}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-activity">Belum ada riwayat aktivitas tercatat.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setDetailModalAcc(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: VERIFIKASI AKUN BPBD
          ========================================================================= */}
      {verifyModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setVerifyModalAcc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-acc-modal-title"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge green">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">VERIFIKASI AKUN RESMI BPBD</div>
                  <h3 id="verify-acc-modal-title" className="modal-title">
                    Sahkan & Aktifkan Akun {verifyModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    Wilayah: {verifyModalAcc.wilayah} ({verifyModalAcc.provinsi})
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setVerifyModalAcc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="modal-summary-box">
                <div className="summary-row">
                  <span className="sum-label">Instansi Pemohon:</span>
                  <strong className="sum-val">{verifyModalAcc.instansi}</strong>
                </div>
                <div className="summary-row">
                  <span className="sum-label">Penanggung Jawab:</span>
                  <span className="sum-val">{verifyModalAcc.penanggungJawab?.nama} ({verifyModalAcc.penanggungJawab?.jabatan})</span>
                </div>
                <div className="summary-row">
                  <span className="sum-label">Hotline & Email:</span>
                  <span className="sum-val">{verifyModalAcc.hotline} · {verifyModalAcc.emailResmi}</span>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="verifyPetugasInput">
                  Petugas Verifikator BNPB Pusat:
                </label>
                <input
                  id="verifyPetugasInput"
                  type="text"
                  className="admin-input"
                  value={verifyPetugas}
                  onChange={(e) => setVerifyPetugas(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="verifyCatatanInput">
                  Catatan Pengesahan / Dokumen Pendukung:
                </label>
                <textarea
                  id="verifyCatatanInput"
                  rows={3}
                  className="admin-textarea"
                  value={verifyCatatan}
                  onChange={(e) => setVerifyCatatan(e.target.value)}
                  placeholder="SK Bupati/Walikota, Surat Tugas, dsb..."
                  required
                />
              </div>

              <div className="modal-note-box">
                <CheckCircle2 size={15} />
                <span>
                  Setelah diverifikasi, akun ini akan langsung berstatus <strong>Aktif</strong> dan dapat login ke
                  Dashboard BPBD untuk mengelola logistik, permohonan bantuan, dan verifikasi warga.
                </span>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setVerifyModalAcc(null)}>
                Batal
              </button>
              <button type="button" className="btn-modal-confirm green" onClick={handleConfirmVerify}>
                <CheckCircle2 size={16} />
                <span>Sahkan & Aktifkan Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: PENANGGUHAN AKUN (SUSPEND MODAL - WAJIB 4 FIELD)
          ========================================================================= */}
      {suspendModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSuspendModalAcc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="suspend-acc-modal-title"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge red">
                  <Lock size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">PEMBEKUAN AKSES SEMENTARA</div>
                  <h3 id="suspend-acc-modal-title" className="modal-title">
                    Tangguhkan Akun {suspendModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    Blokir sementara akses petugas untuk investigasi keamanan atau administratif
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSuspendModalAcc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* MANDATORY WARNING NOTICE */}
              <div className="modal-alert-box alert-warning">
                <div className="alert-box-icon">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <strong>Jaminan Kelangsungan Layanan Publik:</strong>
                  <p>
                    Pemblokiran ini <strong>hanya menghentikan akses login petugas BPBD</strong>.
                    Pusat informasi publik, pelaporan darurat warga, dan layanan penyelamatan di wilayah tersebut
                    <strong> tetap berjalan normal</strong> di bawah pengawasan langsung satgas BNPB Pusat.
                  </p>
                </div>
              </div>

              {/* 1. ALASAN PEMBLOKIRAN (WAJIB) */}
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="suspendAlasanInput">
                  1. Alasan Pemblokiran / Penangguhan (Wajib):
                </label>
                <textarea
                  id="suspendAlasanInput"
                  rows={2}
                  className="admin-textarea"
                  value={suspendAlasan}
                  onChange={(e) => setSuspendAlasan(e.target.value)}
                  placeholder="Contoh: Percobaan login ilegal berulang, anomali kredensial, perubahan kepengurusan ilegal..."
                  required
                />
              </div>

              {/* 2. DURASI PEMBLOKIRAN (WAJIB) */}
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="suspendDurasiInput">
                  2. Durasi Pemblokiran:
                </label>
                <select
                  id="suspendDurasiInput"
                  className="admin-select"
                  value={suspendDurasi}
                  onChange={(e) => setSuspendDurasi(e.target.value)}
                  required
                >
                  <option value="24 Jam (1 Hari)">24 Jam (1 Hari)</option>
                  <option value="3 Hari (72 Jam)">3 Hari (72 Jam)</option>
                  <option value="7 Hari (1 Minggu)">7 Hari (1 Minggu)</option>
                  <option value="14 Hari (2 Minggu)">14 Hari (2 Minggu)</option>
                  <option value="Hingga Investigasi Satgas Selesai">Hingga Investigasi Satgas Selesai</option>
                </select>
              </div>

              {/* 3. NAMA PETUGAS BERTANGGUNG JAWAB (WAJIB) */}
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="suspendPetugasInput">
                  3. Nama Petugas BNPB yang Bertanggung Jawab:
                </label>
                <input
                  id="suspendPetugasInput"
                  type="text"
                  className="admin-input"
                  value={suspendPetugas}
                  onChange={(e) => setSuspendPetugas(e.target.value)}
                  placeholder="Nama & Unit Petugas BNPB"
                  required
                />
              </div>

              {/* 4. CATATAN TINDAK LANJUT (WAJIB) */}
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="suspendCatatanInput">
                  4. Catatan Tindak Lanjut:
                </label>
                <textarea
                  id="suspendCatatanInput"
                  rows={2}
                  className="admin-textarea"
                  value={suspendCatatan}
                  onChange={(e) => setSuspendCatatan(e.target.value)}
                  placeholder="Langkah investigasi, koordinasi dengan Sekda setempat, atau pemulihan akses..."
                  required
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setSuspendModalAcc(null)}>
                Batalkan
              </button>
              <button type="button" className="btn-modal-confirm red" onClick={handleConfirmSuspend}>
                <Lock size={15} />
                <span>Konfirmasi & Tangguhkan Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: RESET KATA SANDI (TANPA MELIHAT PASSWORD LAMA)
          ========================================================================= */}
      {resetModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setResetModalAcc(null)
            setResetResult(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-acc-modal-title"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge yellow">
                  <KeyRound size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">PEMULIHAN KREDENSIAL AMAN</div>
                  <h3 id="reset-acc-modal-title" className="modal-title">
                    Reset Kata Sandi Akun {resetModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    Kredensial lama terenkripsi satu arah dan tidak dapat dilihat oleh siapa pun
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => {
                  setResetModalAcc(null)
                  setResetResult(null)
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {!resetResult ? (
                <>
                  <div className="modal-note-box">
                    <Shield size={16} />
                    <span>
                      Sesuai standar enkripsi zero-knowledge BNPB, kata sandi lama <strong>tidak dapat dilihat</strong>.
                      Mereset kata sandi akan membuat sandi sementara baru dan otomatis memutuskan seluruh sesi aktif
                      pada semua perangkat demi keamanan.
                    </span>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="resetPetugasInput">
                      Petugas Otorisasi BNPB Pusat:
                    </label>
                    <input
                      id="resetPetugasInput"
                      type="text"
                      className="admin-input"
                      value={resetPetugas}
                      onChange={(e) => setResetPetugas(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="resetAlasanInput">
                      Alasan / Surat Permohonan Reset:
                    </label>
                    <textarea
                      id="resetAlasanInput"
                      rows={2}
                      className="admin-textarea"
                      value={resetAlasan}
                      onChange={(e) => setResetAlasan(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="reset-success-box">
                  <div className="reset-success-icon">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4>Kata Sandi Berhasil Direset!</h4>
                  <p>
                    Kredensial sementara di bawah ini telah dibuat untuk akun <strong>{resetResult.instansi}</strong>.
                    Sampaikan sandi ini kepada Kepala Pelaksana melalui saluran resmi terverifikasi.
                  </p>

                  <div className="temp-password-card">
                    <span className="temp-pass-label">KATA SANDI SEMENTARA (BERLAKU 24 JAM):</span>
                    <div className="temp-pass-display">
                      <code>{resetResult.tempPassword}</code>
                      <button
                        type="button"
                        className="btn-copy-temp-pass"
                        onClick={handleCopyPassword}
                        title="Salin kata sandi"
                      >
                        {hasCopiedResetPass ? <Check size={16} /> : <Copy size={16} />}
                        <span>{hasCopiedResetPass ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <span className="reset-warn-note">
                    ⚠️ Pengguna diwajibkan mengganti kata sandi ini saat pertama kali login kembali.
                  </span>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              {!resetResult ? (
                <>
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => {
                      setResetModalAcc(null)
                      setResetResult(null)
                    }}
                  >
                    Batal
                  </button>
                  <button type="button" className="btn-modal-confirm yellow" onClick={handleConfirmResetPassword}>
                    <KeyRound size={15} />
                    <span>Generate Sandi Baru Sekarang</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-modal-confirm green"
                  onClick={() => {
                    setResetModalAcc(null)
                    setResetResult(null)
                  }}
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: ARSIPKAN AKUN (PENGGANTI HAPUS PERMANEN)
          ========================================================================= */}
      {archiveModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setArchiveModalAcc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="archive-acc-modal-title"
        >
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge gray">
                  <Archive size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">PENGARSIPAN PERMANEN (DATA TERLINDUNGI)</div>
                  <h3 id="archive-acc-modal-title" className="modal-title">
                    Arsipkan Akun {archiveModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    Pengganti hapus permanen agar seluruh relasi riwayat bencana tetap aman
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setArchiveModalAcc(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="modal-alert-box alert-secondary">
                <div className="alert-box-icon">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong>Mengapa Mengarsipkan, Bukan Menghapus?</strong>
                  <p>
                    Penghapusan akun permanen akan memutus relasi data riwayat laporan bencana, permohonan bantuan,
                    penyaluran logistik, kasus pencarian keluarga, dan jejak audit BPBD.
                  </p>
                  <small>
                    Dengan mengarsipkan, akun tidak lagi aktif digunakan namun seluruh data historis tetap tercatat
                    sebagai aset resmi daerah tersebut.
                  </small>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="archiveAlasanInput">
                  Alasan Pengarsipan Akun:
                </label>
                <textarea
                  id="archiveAlasanInput"
                  rows={2}
                  className="admin-textarea"
                  value={archiveAlasan}
                  onChange={(e) => setArchiveAlasan(e.target.value)}
                  placeholder="Contoh: Pemekaran DOB baru, restrukturisasi dinas, peleburan satgas..."
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label" htmlFor="archivePetugasInput">
                  Petugas Otorisasi BNPB Pusat:
                </label>
                <input
                  id="archivePetugasInput"
                  type="text"
                  className="admin-input"
                  value={archivePetugas}
                  onChange={(e) => setArchivePetugas(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-modal-cancel" onClick={() => setArchiveModalAcc(null)}>
                Batalkan
              </button>
              <button type="button" className="btn-modal-confirm gray" onClick={handleConfirmArchive}>
                <Archive size={15} />
                <span>Konfirmasi & Arsipkan Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT DATA AKUN & PEJABAT
          ========================================================================= */}
      {editModalAcc && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setEditModalAcc(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-acc-modal-title"
        >
          <div className="admin-modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge blue">
                  <Edit3 size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">PEMBARUAN DATA ADMINISTRATIF</div>
                  <h3 id="edit-acc-modal-title" className="modal-title">
                    Ubah Data Akun {editModalAcc.instansi}
                  </h3>
                  <span className="modal-subtitle">
                    ID Akun: {editModalAcc.id} · Kode: {editModalAcc.kodeWilayah}
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setEditModalAcc(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="admin-modal-body">
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editInstansi">
                      Nama Instansi Resmi:
                    </label>
                    <input
                      id="editInstansi"
                      type="text"
                      className="admin-input"
                      value={editFormData.instansi}
                      onChange={(e) => setEditFormData({ ...editFormData, instansi: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editTingkat">
                      Tingkat Administrasi:
                    </label>
                    <select
                      id="editTingkat"
                      className="admin-select"
                      value={editFormData.tingkat}
                      onChange={(e) => setEditFormData({ ...editFormData, tingkat: e.target.value })}
                    >
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Kota">Kota</option>
                      <option value="Provinsi">Provinsi</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editWilayah">
                      Nama Kabupaten/Kota:
                    </label>
                    <input
                      id="editWilayah"
                      type="text"
                      className="admin-input"
                      value={editFormData.wilayah}
                      onChange={(e) => setEditFormData({ ...editFormData, wilayah: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editProvinsi">
                      Provinsi:
                    </label>
                    <input
                      id="editProvinsi"
                      type="text"
                      className="admin-input"
                      value={editFormData.provinsi}
                      onChange={(e) => setEditFormData({ ...editFormData, provinsi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editHotline">
                      Hotline Pusdalops 24 Jam:
                    </label>
                    <input
                      id="editHotline"
                      type="text"
                      className="admin-input"
                      value={editFormData.hotline}
                      onChange={(e) => setEditFormData({ ...editFormData, hotline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editEmail">
                      Email Dinas Resmi:
                    </label>
                    <input
                      id="editEmail"
                      type="email"
                      className="admin-input"
                      value={editFormData.emailResmi}
                      onChange={(e) => setEditFormData({ ...editFormData, emailResmi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-section-divider">
                  <span>Data Pejabat Penanggung Jawab (Kalaksa / PIC)</span>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editPicNama">
                      Nama Pejabat (Lengkap dengan Gelar):
                    </label>
                    <input
                      id="editPicNama"
                      type="text"
                      className="admin-input"
                      value={editFormData.penanggungJawabNama}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabNama: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editPicNip">
                      NIP Pejabat:
                    </label>
                    <input
                      id="editPicNip"
                      type="text"
                      className="admin-input"
                      value={editFormData.penanggungJawabNip}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabNip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editPicJabatan">
                      Jabatan Struktural:
                    </label>
                    <input
                      id="editPicJabatan"
                      type="text"
                      className="admin-input"
                      value={editFormData.penanggungJawabJabatan}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabJabatan: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="editPicKontak">
                      Nomor HP/WhatsApp Pejabat:
                    </label>
                    <input
                      id="editPicKontak"
                      type="text"
                      className="admin-input"
                      value={editFormData.penanggungJawabKontak}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabKontak: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditModalAcc(null)}>
                  Batalkan
                </button>
                <button type="submit" className="btn-modal-confirm blue">
                  <Edit3 size={15} />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: DAFTARKAN AKUN RESMI BARU
          ========================================================================= */}
      {isCreateModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setIsCreateModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-acc-modal-title"
        >
          <div className="admin-modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div className="modal-header-left">
                <div className="modal-icon-badge blue">
                  <Plus size={22} />
                </div>
                <div>
                  <div className="modal-eyebrow">REGISTRASI AKUN BARU</div>
                  <h3 id="create-acc-modal-title" className="modal-title">
                    Daftarkan Akun Resmi BPBD Kabupaten/Kota
                  </h3>
                  <span className="modal-subtitle">
                    Satu akun institusi resmi per wilayah administrasi pemerintah daerah
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setIsCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="admin-modal-body">
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newInstansi">
                      Nama Instansi Resmi BPBD:
                    </label>
                    <input
                      id="newInstansi"
                      type="text"
                      className="admin-input"
                      value={createFormData.instansi}
                      onChange={(e) => setCreateFormData({ ...createFormData, instansi: e.target.value })}
                      placeholder="Contoh: BPBD Kabupaten Pasaman Barat"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newTingkat">
                      Tingkat Daerah:
                    </label>
                    <select
                      id="newTingkat"
                      className="admin-select"
                      value={createFormData.tingkat}
                      onChange={(e) => setCreateFormData({ ...createFormData, tingkat: e.target.value })}
                    >
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Kota">Kota</option>
                      <option value="Provinsi">Provinsi</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newWilayah">
                      Kabupaten/Kota:
                    </label>
                    <input
                      id="newWilayah"
                      type="text"
                      className="admin-input"
                      value={createFormData.wilayah}
                      onChange={(e) => setCreateFormData({ ...createFormData, wilayah: e.target.value })}
                      placeholder="Contoh: Kabupaten Pasaman Barat"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newProvinsi">
                      Provinsi:
                    </label>
                    <input
                      id="newProvinsi"
                      type="text"
                      className="admin-input"
                      value={createFormData.provinsi}
                      onChange={(e) => setCreateFormData({ ...createFormData, provinsi: e.target.value })}
                      placeholder="Contoh: Sumatera Barat"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newHotline">
                      Hotline Darurat 24 Jam:
                    </label>
                    <input
                      id="newHotline"
                      type="text"
                      className="admin-input"
                      value={createFormData.hotline}
                      onChange={(e) => setCreateFormData({ ...createFormData, hotline: e.target.value })}
                      placeholder="Contoh: 0753-655-223"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newEmail">
                      Email Dinas Resmi (.go.id):
                    </label>
                    <input
                      id="newEmail"
                      type="email"
                      className="admin-input"
                      value={createFormData.emailResmi}
                      onChange={(e) => setCreateFormData({ ...createFormData, emailResmi: e.target.value })}
                      placeholder="Contoh: pusdalops@pasamanbaratkab.go.id"
                      required
                    />
                  </div>
                </div>

                <div className="form-section-divider">
                  <span>Data Kepala Pelaksana (Kalaksa / PIC)</span>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newPicNama">
                      Nama Lengkap Pejabat:
                    </label>
                    <input
                      id="newPicNama"
                      type="text"
                      className="admin-input"
                      value={createFormData.namaPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, namaPic: e.target.value })}
                      placeholder="Nama & Gelar Lengkap"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newPicNip">
                      NIP Pejabat:
                    </label>
                    <input
                      id="newPicNip"
                      type="text"
                      className="admin-input"
                      value={createFormData.nipPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, nipPic: e.target.value })}
                      placeholder="19xxxxxxxx xxxxxx x xxx"
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newPicJabatan">
                      Jabatan:
                    </label>
                    <input
                      id="newPicJabatan"
                      type="text"
                      className="admin-input"
                      value={createFormData.jabatanPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, jabatanPic: e.target.value })}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label" htmlFor="newPicKontak">
                      Nomor HP/WhatsApp:
                    </label>
                    <input
                      id="newPicKontak"
                      type="text"
                      className="admin-input"
                      value={createFormData.kontakPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, kontakPic: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label" htmlFor="newPetugasPendaftar">
                    Petugas Pendaftar BNPB Pusat:
                  </label>
                  <input
                    id="newPetugasPendaftar"
                    type="text"
                    className="admin-input"
                    value={createFormData.petugasPendaftar}
                    onChange={(e) => setCreateFormData({ ...createFormData, petugasPendaftar: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsCreateModalOpen(false)}>
                  Batalkan
                </button>
                <button type="submit" className="btn-modal-confirm blue">
                  <Plus size={15} />
                  <span>Daftarkan Akun (Menunggu Verifikasi)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
