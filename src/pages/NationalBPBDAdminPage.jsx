import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  KeyRound,
  AlertTriangle,
  Archive,
  RefreshCw,
  Search,
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
  ArrowRight,
  ArrowLeft,
  Globe,
  Users,
  FileText,
  Eye,
  AlertOctagon,
  Radio,
  FileCheck,
  Send,
  Download
} from 'lucide-react'
import Header from '../components/Header'
import LoginBPBD from '../components/LoginBPBD'
import { useApp } from '../context/AppContext'
import {
  STATUS_AKUN_BPBD,
  MODE_PEMBEKUAN_BPBD,
  STATUS_PERMOHONAN_AKTIVASI,
  RINGKASAN_AKUN_BPBD_BASELINE,
} from '../data/nationalData'
import './NationalBPBDAdminPage.css'

export default function NationalBPBDAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    isAuthenticated,
    adminLevel,
    akunBpbdList = [],
    auditAdministrasiList = [],
    tambahAkunBpbd,
    verifikasiAkunBpbd,
    setujuiPermohonanAktivasi,
    kembalikanPermohonanAktivasi,
    ubahModePembekuan,
    pulihkanAksesAkun,
    akhiriSemuaSesiPerangkat,
    editAkunBpbd,
    resetPasswordAkunBpbd,
    tangguhkanAkunBpbd,
    aktifkanKembaliAkunBpbd,
    akhiriSesiPerangkatAkunBpbd,
    arsipkanAkunBpbd,
    showNotif,
  } = useApp()

  // Active sub-tab from query parameter (default: 'direktori')
  const activeTab = searchParams.get('tab') || 'direktori'

  const handleSetTab = (tabKey) => {
    setSearchParams({ tab: tabKey })
  }

  // Search & Filters for Directory
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterTingkat, setFilterTingkat] = useState('Semua')

  // Search & Filter for Audit
  const [auditSearch, setAuditSearch] = useState('')
  const [auditFilterAksi, setAuditFilterAksi] = useState('Semua')

  // Modals state
  const [inspectModalAcc, setInspectModalAcc] = useState(null) // Remote Read-Only Inspection Modal
  const [detailModalAcc, setDetailModalAcc] = useState(null)
  const [approveModalAcc, setApproveModalAcc] = useState(null)
  const [returnModalAcc, setReturnModalAcc] = useState(null)
  const [freezeModalAcc, setFreezeModalAcc] = useState(null)
  const [recoveryModalAcc, setRecoveryModalAcc] = useState(null)
  const [editModalAcc, setEditModalAcc] = useState(null)
  const [docInspectAcc, setDocInspectAcc] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [recoveryResult, setRecoveryResult] = useState(null)
  const [hasCopiedPass, setHasCopiedPass] = useState(false)

  // Forms state
  const [approvePetugas, setApprovePetugas] = useState('Drs. Hendro Wibowo (BNPB Pusat)')
  const [approveCatatan, setApproveCatatan] = useState('Dokumen SK Pelantikan Kalaksa & Surat Tugas Pusdalops lengkap terverifikasi sah.')
  const [approveKesiapsiagaan, setApproveKesiapsiagaan] = useState('Siaga Darurat')

  const [returnPetugas, setReturnPetugas] = useState('Drs. Hendro Wibowo (BNPB Pusat)')
  const [returnCatatan, setReturnCatatan] = useState('Lampiran SK Bupati belum distempel basah dan NIP pejabat penanggung jawab perlu diverifikasi ulang ke BKD daerah.')

  const [freezeMode, setFreezeMode] = useState('BEKUKAN_TINDAKAN_STRATEGIS')
  const [freezeAlasan, setFreezeAlasan] = useState('Klarifikasi keabsahan struktur satgas darurat daerah')
  const [freezeDurasi, setFreezeDurasi] = useState('3 Hari (72 Jam)')
  const [freezePetugas, setFreezePetugas] = useState('Satgas Siber Pusdalops BNPB Pusat')
  const [freezeCatatan, setFreezeCatatan] = useState('Akses tindakan strategis dibekukan sementara. Pemantauan dashboard lokal tetap diizinkan.')

  // Recovery Form State
  const [recoverySurat, setRecoverySurat] = useState('050/BPBD-PML/X/2026')
  const [recoveryPetugas, setRecoveryPetugas] = useState('Drs. Hendro Wibowo (BNPB Pusat)')
  const [recoveryAlasan, setRecoveryAlasan] = useState('Permohonan resmi pemulihan akses & reset kredensial darurat oleh Kepala Pelaksana')
  const [recoveryHotlineChecked, setRecoveryHotlineChecked] = useState(true)

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    instansi: '',
    wilayah: '',
    provinsi: '',
    kodeWilayah: '',
    tingkat: 'Kabupaten',
    alamatKantor: '',
    poskoUtama: '',
    statusKesiapsiagaan: 'Normal',
    hotline: '',
    emailResmi: '',
    penanggungJawabNama: '',
    penanggungJawabNip: '',
    penanggungJawabJabatan: '',
    penanggungJawabKontak: '',
  })

  // Create Form State
  const [createFormData, setCreateFormData] = useState({
    kodeWilayah: '',
    instansi: '',
    wilayah: '',
    provinsi: '',
    tingkat: 'Kabupaten',
    alamatKantor: '',
    poskoUtama: '',
    statusKesiapsiagaan: 'Siaga Darurat',
    hotline: '',
    emailResmi: '',
    namaPic: '',
    nipPic: '',
    jabatanPic: 'Kepala Pelaksana BPBD',
    kontakPic: '',
    petugasPendaftar: 'Drs. Hendro Wibowo (BNPB Pusat)',
  })
  const [createError, setCreateError] = useState('')

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setInspectModalAcc(null)
        setDetailModalAcc(null)
        setApproveModalAcc(null)
        setReturnModalAcc(null)
        setFreezeModalAcc(null)
        setRecoveryModalAcc(null)
        setEditModalAcc(null)
        setDocInspectAcc(null)
        setIsCreateModalOpen(false)
        setRecoveryResult(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // KPI calculations
  const permohonanPendingList = useMemo(() => {
    return akunBpbdList.filter(
      (a) =>
        a.status === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI ||
        (a.permohonanAktivasi &&
          a.permohonanAktivasi.status !== STATUS_PERMOHONAN_AKTIVASI.DISETUJUI)
    )
  }, [akunBpbdList])

  const pendingCount = permohonanPendingList.length

  const ditangguhkanList = useMemo(() => {
    return akunBpbdList.filter(
      (a) =>
        a.status === STATUS_AKUN_BPBD.DITANGGUHKAN ||
        Boolean(a.modePembekuan) ||
        (a.keamanan && a.keamanan.loginGagalCount > 5)
    )
  }, [akunBpbdList])

  const totalSesiAktifNasional = useMemo(() => {
    return akunBpbdList.reduce((acc, curr) => acc + (curr.sesiAktif || 0), 0)
  }, [akunBpbdList])

  // Filtered accounts for directory
  const filteredAccounts = useMemo(() => {
    return akunBpbdList.filter((acc) => {
      if (filterStatus !== 'Semua' && acc.status !== filterStatus) return false
      if (filterTingkat !== 'Semua' && acc.tingkat !== filterTingkat) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchInstansi = (acc.instansi || '').toLowerCase().includes(q)
        const matchWilayah = (acc.wilayah || '').toLowerCase().includes(q)
        const matchProvinsi = (acc.provinsi || '').toLowerCase().includes(q)
        const matchPic = (acc.penanggungJawab?.nama || '').toLowerCase().includes(q)
        const matchKode = (acc.kodeWilayah || '').toLowerCase().includes(q)
        const matchHotline = (acc.hotline || '').toLowerCase().includes(q)
        const matchPosko = (acc.poskoUtama || '').toLowerCase().includes(q)
        if (!matchInstansi && !matchWilayah && !matchProvinsi && !matchPic && !matchKode && !matchHotline && !matchPosko) {
          return false
        }
      }
      return true
    })
  }, [akunBpbdList, filterStatus, filterTingkat, searchQuery])

  // Filtered audit list
  const filteredAuditList = useMemo(() => {
    return auditAdministrasiList.filter((log) => {
      if (auditFilterAksi !== 'Semua' && !log.aksi.toLowerCase().includes(auditFilterAksi.toLowerCase())) {
        return false
      }
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase()
        const matchPetugas = (log.petugas || '').toLowerCase().includes(q)
        const matchInstansi = (log.instansi || '').toLowerCase().includes(q)
        const matchWilayah = (log.wilayah || '').toLowerCase().includes(q)
        const matchAksi = (log.aksi || '').toLowerCase().includes(q)
        const matchAlasan = (log.alasan || '').toLowerCase().includes(q)
        const matchKode = (log.kodeWilayah || '').toLowerCase().includes(q)
        if (!matchPetugas && !matchInstansi && !matchWilayah && !matchAksi && !matchAlasan && !matchKode) {
          return false
        }
      }
      return true
    })
  }, [auditAdministrasiList, auditFilterAksi, auditSearch])

  // Open edit modal helper
  const handleOpenEdit = (acc) => {
    setEditFormData({
      instansi: acc.instansi || '',
      wilayah: acc.wilayah || '',
      provinsi: acc.provinsi || '',
      kodeWilayah: acc.kodeWilayah || '',
      tingkat: acc.tingkat || 'Kabupaten',
      alamatKantor: acc.alamatKantor || '',
      poskoUtama: acc.poskoUtama || '',
      statusKesiapsiagaan: acc.statusKesiapsiagaan || 'Normal',
      hotline: acc.hotline || '',
      emailResmi: acc.emailResmi || '',
      penanggungJawabNama: acc.penanggungJawab?.nama || '',
      penanggungJawabNip: acc.penanggungJawab?.nip || '',
      penanggungJawabJabatan: acc.penanggungJawab?.jabatan || '',
      penanggungJawabKontak: acc.penanggungJawab?.kontak || '',
    })
    setEditModalAcc(acc)
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    if (!editModalAcc) return
    editAkunBpbd(editModalAcc.id, editFormData, 'Pusdalops BNPB Pusat')
    setEditModalAcc(null)
  }

  // Handle create new account with duplicate prevention
  const handleSubmitCreate = (e) => {
    e.preventDefault()
    setCreateError('')

    // Validate Kemendagri code duplication
    const duplicateCode = akunBpbdList.find(
      (a) => a.kodeWilayah === createFormData.kodeWilayah.trim()
    )
    if (duplicateCode) {
      setCreateError(
        `Kode Kemendagri ${createFormData.kodeWilayah} sudah terdaftar untuk ${duplicateCode.instansi}! Setiap wilayah hanya boleh memiliki satu akun resmi.`
      )
      return
    }

    // Validate county duplication
    const duplicateCounty = akunBpbdList.find(
      (a) =>
        a.wilayah.toLowerCase().trim() === createFormData.wilayah.toLowerCase().trim() &&
        a.provinsi.toLowerCase().trim() === createFormData.provinsi.toLowerCase().trim()
    )
    if (duplicateCounty) {
      setCreateError(
        `Wilayah ${createFormData.wilayah} (${createFormData.provinsi}) sudah memiliki akun resmi (${duplicateCounty.instansi}). Akun ganda dilarang.`
      )
      return
    }

    tambahAkunBpbd(createFormData, createFormData.petugasPendaftar)
    setIsCreateModalOpen(false)
    setCreateFormData({
      kodeWilayah: '',
      instansi: '',
      wilayah: '',
      provinsi: '',
      tingkat: 'Kabupaten',
      alamatKantor: '',
      poskoUtama: '',
      statusKesiapsiagaan: 'Siaga Darurat',
      hotline: '',
      emailResmi: '',
      namaPic: '',
      nipPic: '',
      jabatanPic: 'Kepala Pelaksana BPBD',
      kontakPic: '',
      petugasPendaftar: 'Drs. Hendro Wibowo (BNPB Pusat)',
    })
  }

  // Handle confirm approve
  const handleConfirmApprove = () => {
    if (!approveModalAcc) return
    setujuiPermohonanAktivasi(approveModalAcc.id, {
      petugas: approvePetugas,
      catatan: approveCatatan,
      statusKesiapsiagaan: approveKesiapsiagaan,
    })
    setApproveModalAcc(null)
  }

  // Handle confirm return for revision
  const handleConfirmReturn = () => {
    if (!returnModalAcc) return
    if (!returnCatatan.trim()) {
      showNotif('Harap masukkan catatan revisi perbaikan berkas untuk BPBD.', 'warning')
      return
    }
    kembalikanPermohonanAktivasi(returnModalAcc.id, {
      catatanRevisi: returnCatatan,
      petugas: returnPetugas,
    })
    setReturnModalAcc(null)
  }

  // Handle confirm freeze mode change
  const handleConfirmFreeze = () => {
    if (!freezeModalAcc) return
    ubahModePembekuan(freezeModalAcc.id, {
      modePembekuan: freezeMode,
      alasan: freezeAlasan,
      durasi: freezeDurasi,
      petugas: freezePetugas,
      catatan: freezeCatatan,
    })
    setFreezeModalAcc(null)
  }

  // Handle confirm access recovery
  const handleConfirmRecovery = (acc) => {
    const target = acc || recoveryModalAcc
    if (!target) return
    const res = pulihkanAksesAkun(target.id, {
      noSuratVerifikasi: recoverySurat,
      hotlineTervalidasi: recoveryHotlineChecked,
      petugas: recoveryPetugas,
      alasan: recoveryAlasan,
    })
    setRecoveryResult(res)
    setHasCopiedPass(false)
    setRecoveryModalAcc(null)
  }

  if (!isAuthenticated || adminLevel !== 'nasional') {
    return <LoginBPBD initialRole="nasional" />
  }

  return (
    <div className="national-admin-page-layout">
      {/* 1. TOP HEADER WITH BNPB DROPDOWN */}
      <Header />

      <main className="admin-page-main" id="adminMainContent">
        {/* 2. SUB-HERO BREADCRUMB & CONTEXT BANNER */}
        <div className="admin-subhero-banner">
          <div className="admin-subhero-inner">
            <div className="admin-subhero-left">
              <Link to="/bnpb" className="btn-back-to-command">
                <ArrowLeft size={16} />
                <span>Kembali ke Pusat Komando BNPB</span>
              </Link>
              <div className="admin-breadcrumb-row">
                <span className="crumb-segment">PUSDALOPS BNPB PUSAT</span>
                <span className="crumb-divider">/</span>
                <span className="crumb-current">ADMINISTRASI & KEAMANAN AKUN BPBD</span>
              </div>
              <h1 className="admin-page-heading">
                Pusat Administrasi & Keamanan <span className="gradient-admin-text">Akun Resmi BPBD</span>
              </h1>
              <p className="admin-page-subtitle">
                Direktori tunggal per wilayah Kemendagri, verifikasi berkas SK aktivasi, pengawasan integritas siber, pembekuan darurat terbatas, dan audit trail tak terhapus.
              </p>
            </div>

            <div className="admin-subhero-right">
              <div className="admin-policy-chip">
                <ShieldCheck size={16} className="text-emerald" />
                <div>
                  <strong>Integritas Kemendagri:</strong> 1 Wilayah = 1 Akun Resmi Tunggal
                </div>
              </div>
              <div className="admin-policy-chip">
                <KeyRound size={16} className="text-amber" />
                <div>
                  <strong>Zero-Knowledge:</strong> BNPB Tidak Pernah Menyimpan/Melihat Sandi BPBD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 5-SUBSECTION NAVIGATION TABS (SEPARATED FROM OPERATIONAL DISASTER TABS) */}
        <div className="admin-subsections-nav">
          <div className="admin-tabs-list" role="tablist">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'direktori' ? 'active' : ''}`}
              onClick={() => handleSetTab('direktori')}
              role="tab"
              aria-selected={activeTab === 'direktori'}
            >
              <Building2 size={16} />
              <span>Direktori BPBD</span>
              <span className="tab-counter-pill green">{akunBpbdList.filter(a => a.status === STATUS_AKUN_BPBD.AKTIF).length}</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'permohonan' ? 'active' : ''}`}
              onClick={() => handleSetTab('permohonan')}
              role="tab"
              aria-selected={activeTab === 'permohonan'}
            >
              <FileCheck size={16} />
              <span>Permohonan Akun</span>
              {pendingCount > 0 && (
                <span className="tab-counter-pill yellow highlight-badge">{pendingCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'keamanan' ? 'active' : ''}`}
              onClick={() => handleSetTab('keamanan')}
              role="tab"
              aria-selected={activeTab === 'keamanan'}
            >
              <ShieldAlert size={16} />
              <span>Keamanan & Penangguhan</span>
              {ditangguhkanList.length > 0 && (
                <span className="tab-counter-pill red">{ditangguhkanList.length}</span>
              )}
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'pemulihan' ? 'active' : ''}`}
              onClick={() => handleSetTab('pemulihan')}
              role="tab"
              aria-selected={activeTab === 'pemulihan'}
            >
              <KeyRound size={16} />
              <span>Pemulihan Akses</span>
            </button>

            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => handleSetTab('audit')}
              role="tab"
              aria-selected={activeTab === 'audit'}
            >
              <History size={16} />
              <span>Riwayat Administrasi</span>
              <span className="tab-counter-pill blue">{auditAdministrasiList.length}</span>
            </button>
          </div>
        </div>

        {/* 4. CONTENT OF SUB-SECTIONS */}
        <div className="admin-tab-content-area">

          {/* ========================================================================= */}
          {/* SUB-SECTION 1: DIREKTORI BPBD                                            */}
          {/* ========================================================================= */}
          {activeTab === 'direktori' && (
            <div className="subsection-container">
              {/* Macro KPI Ribbon */}
              <div className="admin-summary-ribbon">
                <div className="summary-ribbon-card">
                  <div className="ribbon-card-icon blue"><Building2 size={20} /></div>
                  <div className="ribbon-card-data">
                    <span className="ribbon-num">514</span>
                    <span className="ribbon-lbl">Kab/Kota se-Indonesia</span>
                    <span className="ribbon-sub">Cakupan 38 Provinsi Kemendagri</span>
                  </div>
                </div>

                <div
                  className={`summary-ribbon-card clickable ${filterStatus === STATUS_AKUN_BPBD.AKTIF ? 'active' : ''}`}
                  onClick={() => setFilterStatus(filterStatus === STATUS_AKUN_BPBD.AKTIF ? 'Semua' : STATUS_AKUN_BPBD.AKTIF)}
                >
                  <div className="ribbon-card-icon green"><CheckCircle2 size={20} /></div>
                  <div className="ribbon-card-data">
                    <span className="ribbon-num">{akunBpbdList.filter(a => a.status === STATUS_AKUN_BPBD.AKTIF).length}</span>
                    <span className="ribbon-lbl">Akun Resmi Aktif</span>
                    <span className="ribbon-sub">Otoritas kendali darurat penuh</span>
                  </div>
                </div>

                <div
                  className={`summary-ribbon-card clickable ${filterStatus === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI ? 'active' : ''}`}
                  onClick={() => setFilterStatus(filterStatus === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI ? 'Semua' : STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI)}
                >
                  <div className="ribbon-card-icon yellow"><Clock size={20} /></div>
                  <div className="ribbon-card-data">
                    <span className="ribbon-num">{pendingCount}</span>
                    <span className="ribbon-lbl">Menunggu Review</span>
                    <span className="ribbon-sub">Permohonan perlu pengesahan</span>
                  </div>
                </div>

                <div
                  className={`summary-ribbon-card clickable ${filterStatus === STATUS_AKUN_BPBD.DITANGGUHKAN ? 'active' : ''}`}
                  onClick={() => setFilterStatus(filterStatus === STATUS_AKUN_BPBD.DITANGGUHKAN ? 'Semua' : STATUS_AKUN_BPBD.DITANGGUHKAN)}
                >
                  <div className="ribbon-card-icon red"><Lock size={20} /></div>
                  <div className="ribbon-card-data">
                    <span className="ribbon-num">{ditangguhkanList.length}</span>
                    <span className="ribbon-lbl">Dibekukan / Ditangguhkan</span>
                    <span className="ribbon-sub">Pembatasan akses terukur</span>
                  </div>
                </div>
              </div>

              {/* Controls Toolbar */}
              <div className="directory-controls-bar">
                <div className="dir-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="dir-search-input"
                    placeholder="Cari kode Kemendagri (contoh: 13.06), instansi, kabupaten/kota, provinsi, Kalaksa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button type="button" className="btn-clear-q" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="dir-filters-wrap">
                  <select
                    className="dir-filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="Semua">Semua Status</option>
                    <option value={STATUS_AKUN_BPBD.AKTIF}>Aktif</option>
                    <option value={STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI}>Menunggu Verifikasi</option>
                    <option value={STATUS_AKUN_BPBD.DITANGGUHKAN}>Ditangguhkan</option>
                    <option value={STATUS_AKUN_BPBD.DIARSIPKAN}>Diarsipkan</option>
                  </select>

                  <select
                    className="dir-filter-select"
                    value={filterTingkat}
                    onChange={(e) => setFilterTingkat(e.target.value)}
                  >
                    <option value="Semua">Semua Tingkat</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Kota">Kota</option>
                    <option value="Provinsi">Provinsi</option>
                  </select>

                  <button
                    type="button"
                    className="btn-create-account-main"
                    onClick={() => {
                      setCreateError('')
                      setIsCreateModalOpen(true)
                    }}
                  >
                    <Plus size={16} />
                    <span>Daftarkan Akun BPBD Baru</span>
                  </button>
                </div>
              </div>

              {/* DIRECTORY TABLE */}
              <div className="directory-table-card">
                <div className="table-responsive">
                  <table className="official-bpbd-table">
                    <thead>
                      <tr>
                        <th>Kode Kemendagri</th>
                        <th>Instansi BPBD & Wilayah</th>
                        <th>Hotline & Alamat Kantor</th>
                        <th>Kepala Pelaksana (Kalaksa)</th>
                        <th>Posko Utama & Kesiapsiagaan</th>
                        <th>Kesehatan Akun</th>
                        <th>Status</th>
                        <th className="th-action">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((acc) => {
                        const isSuspended = acc.status === STATUS_AKUN_BPBD.DITANGGUHKAN
                        const isArchived = acc.status === STATUS_AKUN_BPBD.DIARSIPKAN
                        const isPending = acc.status === STATUS_AKUN_BPBD.MENUNGGU_VERIFIKASI

                        return (
                          <tr key={acc.id} className={`tr-acc-row ${isSuspended ? 'row-suspended' : isArchived ? 'row-archived' : ''}`}>
                            <td className="td-kode">
                              <span className="kode-kemendagri-badge">{acc.kodeWilayah || '-'}</span>
                              <span className="tingkat-pill">{acc.tingkat || 'Kabupaten'}</span>
                            </td>

                            <td className="td-instansi">
                              <div className="instansi-name-strong">{acc.instansi}</div>
                              <div className="wilayah-province-sub">
                                <MapPin size={12} />
                                <span>{acc.wilayah}, {acc.provinsi}</span>
                              </div>
                            </td>

                            <td className="td-kontak">
                              <div className="hotline-val">
                                <Phone size={12} className="text-emerald" />
                                <strong>{acc.hotline}</strong>
                              </div>
                              <div className="alamat-sub" title={acc.alamatKantor}>
                                {acc.alamatKantor ? acc.alamatKantor.slice(0, 45) + '...' : '-'}
                              </div>
                            </td>

                            <td className="td-kalaksa">
                              <div className="kalaksa-name">{acc.penanggungJawab?.nama || '-'}</div>
                              <div className="kalaksa-sub">NIP: {acc.penanggungJawab?.nip || '-'}</div>
                              <div className="kalaksa-contact">{acc.penanggungJawab?.kontak || '-'}</div>
                            </td>

                            <td className="td-posko">
                              <div className="posko-val" title={acc.poskoUtama}>
                                {acc.poskoUtama ? acc.poskoUtama.slice(0, 40) + '...' : 'Belum diisi'}
                              </div>
                              <div className="kesiapsiagaan-row">
                                <span className={`siaga-dot ${acc.statusKesiapsiagaan === 'Tanggap Darurat' ? 'red' : acc.statusKesiapsiagaan === 'Siaga Darurat' ? 'yellow' : 'green'}`} />
                                <span className="siaga-text">{acc.statusKesiapsiagaan || 'Normal'}</span>
                              </div>
                            </td>

                            <td className="td-kesehatan">
                              {acc.kesehatan?.inaktifHari > 30 ? (
                                <span className="health-badge orange" title={`Tidak aktif ${acc.kesehatan.inaktifHari} hari`}>
                                  Inaktif {acc.kesehatan.inaktifHari} Hari
                                </span>
                              ) : acc.modePembekuan ? (
                                <span className="health-badge red" title={acc.penangguhanInfo?.modeLabel || 'Akses dibekukan'}>
                                  {acc.modePembekuan === 'MODE_DARURAT' ? 'Mode Darurat' : 'Akses Dibatasi'}
                                </span>
                              ) : !acc.kesehatan?.profilLengkap ? (
                                <span className="health-badge yellow" title="Profil belum lengkap">
                                  Profil Belum Lengkap
                                </span>
                              ) : isPending ? (
                                <span className="health-badge yellow" title="Menunggu verifikasi SK">
                                  Perlu Aktivasi
                                </span>
                              ) : isArchived ? (
                                <span className="health-badge gray" title="Akun diarsipkan">
                                  Diarsipkan
                                </span>
                              ) : (
                                <span className="health-badge green" title="Seluruh data lengkap & aktif">
                                  Sehat (Optimal)
                                </span>
                              )}
                              <div className="terakhir-login-sub">
                                Sesi Aktif: <strong>{acc.sesiAktif || 0}</strong>
                              </div>
                            </td>

                            <td className="td-status">
                              <span className={`status-pill-badge ${acc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {acc.status}
                              </span>
                            </td>

                            <td className="td-action">
                              <div className="action-buttons-cell">
                                {/* BUTTON BANTUAN JARAK JAUH / LIHAT DASHBOARD BPBD MODE HANYA BACA */}
                                <button
                                  type="button"
                                  className="btn-tbl-inspect"
                                  onClick={() => setInspectModalAcc(acc)}
                                  title="Buka Asistensi Jarak Jauh (Lihat Dashboard BPBD dalam Mode Hanya Baca)"
                                >
                                  <Eye size={14} />
                                  <span>Lihat Dashboard (Hanya Baca)</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn-tbl-action"
                                  onClick={() => handleOpenEdit(acc)}
                                  title="Edit Profil & Penanggung Jawab"
                                  disabled={isArchived}
                                >
                                  <Edit3 size={13} />
                                </button>

                                <button
                                  type="button"
                                  className="btn-tbl-action"
                                  onClick={() => setDetailModalAcc(acc)}
                                  title="Lihat Detail Lengkap Akun"
                                >
                                  <Info size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredAccounts.length === 0 && (
                  <div className="empty-filter-state">
                    <Building2 size={36} className="text-muted" />
                    <h4>Tidak Ada Akun BPBD Ditemukan</h4>
                    <p>Sesuaikan kata kunci pencarian atau bersihkan filter status.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION 2: PERMOHONAN AKUN                                           */}
          {/* ========================================================================= */}
          {activeTab === 'permohonan' && (
            <div className="subsection-container">
              {/* 4-Step Official Activation Workflow Banner */}
              <div className="permohonan-workflow-banner">
                <div className="workflow-title-row">
                  <FileCheck size={18} className="text-amber" />
                  <h3>Alur Resmi Permohonan & Aktivasi Akun BPBD Daerah</h3>
                </div>
                <div className="workflow-steps-grid">
                  <div className="workflow-step-card active">
                    <span className="step-num">1</span>
                    <div className="step-content">
                      <strong>BPBD Mengajukan Aktivasi</strong>
                      <p>Mengunggah SK Pelantikan Kalaksa, stempel basah, dan surat tugas kedinasan resmi.</p>
                    </div>
                  </div>

                  <div className="workflow-step-card active">
                    <span className="step-num">2</span>
                    <div className="step-content">
                      <strong>BNPB Memeriksa Dokumen</strong>
                      <p>Pusdatin & Biro Hukum BNPB memverifikasi keabsahan SK kepala daerah dan hotline resmi.</p>
                    </div>
                  </div>

                  <div className="workflow-step-card highlight">
                    <span className="step-num">3</span>
                    <div className="step-content">
                      <strong>Menyetujui atau Mengembalikan</strong>
                      <p>BNPB menyetujui aktivasi atau mengembalikan permohonan dengan catatan perbaikan wajib.</p>
                    </div>
                  </div>

                  <div className="workflow-step-card">
                    <span className="step-num">4</span>
                    <div className="step-content">
                      <strong>Satu Akun Wilayah Aktif</strong>
                      <p>Sistem mengaktifkan tepat satu akun resmi wilayah. Mencegah akun ganda selamanya.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of Pending Requests */}
              <div className="permohonan-cards-list">
                {permohonanPendingList.map((acc) => {
                  const isReturned = acc.permohonanAktivasi?.status === STATUS_PERMOHONAN_AKTIVASI.DIKEMBALIKAN
                  return (
                    <div key={acc.id} className={`permohonan-card-item ${isReturned ? 'border-amber' : 'border-blue'}`}>
                      <div className="pcard-header">
                        <div className="pcard-title-block">
                          <span className="pcard-kode-badge">{acc.kodeWilayah}</span>
                          <div>
                            <h4 className="pcard-instansi">{acc.instansi}</h4>
                            <span className="pcard-wilayah">{acc.wilayah}, Provinsi {acc.provinsi}</span>
                          </div>
                        </div>

                        <div className="pcard-status-badge">
                          <span className={`status-badge-bubble ${isReturned ? 'yellow' : 'blue'}`}>
                            {acc.permohonanAktivasi?.status || 'Menunggu Review BNPB'}
                          </span>
                        </div>
                      </div>

                      <div className="pcard-body-grid">
                        <div className="pcard-info-box">
                          <span className="info-box-label">Surat & Waktu Pengajuan</span>
                          <span className="info-box-val">{acc.permohonanAktivasi?.noSurat || 'Nomor Surat Terlampir'}</span>
                          <span className="info-box-sub">Diajukan: {acc.permohonanAktivasi?.tanggalPengajuan || acc.tanggalDibuat}</span>
                        </div>

                        <div className="pcard-info-box">
                          <span className="info-box-label">Penanggung Jawab (Kalaksa)</span>
                          <span className="info-box-val">{acc.penanggungJawab?.nama}</span>
                          <span className="info-box-sub">NIP: {acc.penanggungJawab?.nip || '-'} · Kontak: {acc.penanggungJawab?.kontak}</span>
                        </div>

                        <div className="pcard-info-box">
                          <span className="info-box-label">Hotline & Posko Utama</span>
                          <span className="info-box-val">{acc.hotline}</span>
                          <span className="info-box-sub">{acc.poskoUtama || 'Belum diisi'}</span>
                        </div>

                        <div className="pcard-info-box">
                          <span className="info-box-label">Dokumen Berkas SK</span>
                          <button
                            type="button"
                            className="btn-download-sk"
                            onClick={() => setDocInspectAcc(acc)}
                          >
                            <FileText size={14} />
                            <span>{acc.permohonanAktivasi?.dokumenSK || 'Berkas_SK_Bupati.pdf'}</span>
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Display Return Revision Note if returned */}
                      {isReturned && (
                        <div className="pcard-revision-callout">
                          <AlertTriangle size={16} className="text-amber" />
                          <div>
                            <strong>Catatan Perbaikan dari BNPB:</strong>
                            <p>{acc.permohonanAktivasi?.catatanRevisi}</p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pcard-footer-actions">
                        <button
                          type="button"
                          className="btn-pcard-inspect-doc"
                          onClick={() => setDocInspectAcc(acc)}
                        >
                          <Eye size={15} />
                          <span>Periksa Kelengkapan Berkas</span>
                        </button>

                        <div className="pcard-action-group-right">
                          <button
                            type="button"
                            className="btn-pcard-return"
                            onClick={() => {
                              setReturnCatatan(acc.permohonanAktivasi?.catatanRevisi || '')
                              setReturnModalAcc(acc)
                            }}
                          >
                            <ArrowLeft size={15} />
                            <span>Kembalikan untuk Diperbaiki</span>
                          </button>

                          <button
                            type="button"
                            className="btn-pcard-approve"
                            onClick={() => setApproveModalAcc(acc)}
                          >
                            <CheckCircle2 size={16} />
                            <span>Setujui & Aktifkan Akun</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {permohonanPendingList.length === 0 && (
                  <div className="empty-permohonan-box">
                    <CheckCircle2 size={40} className="text-emerald" />
                    <h4>Seluruh Permohonan Telah Diproses</h4>
                    <p>Tidak ada permohonan aktivasi akun BPBD yang sedang menunggu review saat ini.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION 3: KEAMANAN & PENANGGUHAN (AKUN DITANGGUHKAN)                 */}
          {/* ========================================================================= */}
          {activeTab === 'keamanan' && (
            <div className="subsection-container">
              {/* Security Metrics Header */}
              <div className="security-overview-grid">
                <div className="sec-metric-card red">
                  <div className="metric-icon-wrap"><AlertOctagon size={20} /></div>
                  <div className="metric-text-wrap">
                    <span className="metric-number">32 Kali</span>
                    <span className="metric-label">Percobaan Brute-Force Dicegah</span>
                    <span className="metric-sub">Deteksi IDS pada Pasaman Barat</span>
                  </div>
                </div>

                <div className="sec-metric-card yellow">
                  <div className="metric-icon-wrap"><Globe size={20} /></div>
                  <div className="metric-text-wrap">
                    <span className="metric-number">1 Wilayah</span>
                    <span className="metric-label">Anomali IP Asing Terdeteksi</span>
                    <span className="metric-sub">IP Luar Negeri (Tor Exit Node)</span>
                  </div>
                </div>

                <div className="sec-metric-card blue">
                  <div className="metric-icon-wrap"><Radio size={20} /></div>
                  <div className="metric-text-wrap">
                    <span className="metric-number">{totalSesiAktifNasional} Sesi</span>
                    <span className="metric-label">Sesi Perangkat Aktif Nasional</span>
                    <span className="metric-sub">Pantauan real-time seluruh BPBD</span>
                  </div>
                </div>

                <div className="sec-metric-card amber">
                  <div className="metric-icon-wrap"><Lock size={20} /></div>
                  <div className="metric-text-wrap">
                    <span className="metric-number">{ditangguhkanList.length} Akun</span>
                    <span className="metric-label">Pembatasan Mode Pembekuan</span>
                    <span className="metric-sub">Termasuk 1 mode darurat aktif</span>
                  </div>
                </div>
              </div>

              {/* 4 Freeze Modes Policy Explainers */}
              <div className="freeze-policy-box">
                <div className="freeze-policy-header">
                  <ShieldAlert size={18} className="text-amber" />
                  <h4>4 Tingkatan Mode Pembekuan Terbatas (Bukan Sekadar Blokir Total)</h4>
                </div>
                <div className="freeze-tiers-grid">
                  <div className="freeze-tier-item">
                    <span className="tier-tag blue">Mode 1: Bekukan Perubahan Data</span>
                    <p>Akun masih bisa masuk dan melihat dashboard dalam mode hanya baca. Cocok untuk audit kelengkapan profil.</p>
                  </div>
                  <div className="freeze-tier-item">
                    <span className="tier-tag yellow">Mode 2: Bekukan Tindakan Strategis</span>
                    <p>Tidak bisa menyiarkan EWS atau meminta bantuan pusat. Digunakan saat ada klarifikasi struktur satgas darurat.</p>
                  </div>
                  <div className="freeze-tier-item">
                    <span className="tier-tag red">Mode 3: Tangguhkan Penuh</span>
                    <p>Akses masuk diblokir total untuk audit siber forensik jika terdeteksi serangan brute-force kredensial.</p>
                  </div>
                  <div className="freeze-tier-item highlight-emergency">
                    <span className="tier-tag emerald">Mode 4: Mode Darurat (Sangat Penting)</span>
                    <p><strong>BPBD HANYA dapat kirim laporan & permohonan bantuan.</strong> BPBD tetap dapat meminta pertolongan darurat walau akun sedang diperiksa!</p>
                  </div>
                </div>
              </div>

              {/* Suspended & Watched Accounts Table */}
              <div className="security-accounts-table-card">
                <div className="card-header-bar">
                  <h4>Daftar Akun Dalam Pengawasan & Pembekuan Terbatas</h4>
                  <span className="text-sm text-muted">Menampilkan akun dengan pembatasan mode atau anomali login</span>
                </div>

                <div className="table-responsive">
                  <table className="security-bpbd-table">
                    <thead>
                      <tr>
                        <th>Kode & Instansi</th>
                        <th>Status & Mode Pembekuan</th>
                        <th>Anomali & Keamanan</th>
                        <th>Waktu & IP Login Terakhir</th>
                        <th>Sesi Aktif</th>
                        <th className="th-action">Tindakan Keamanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ditangguhkanList.map((acc) => {
                        const hasAnomaly = acc.keamanan?.anomaliLokasi || (acc.keamanan?.loginGagalCount > 5)
                        return (
                          <tr key={acc.id} className={hasAnomaly ? 'row-alert-security' : ''}>
                            <td className="td-sec-instansi">
                              <span className="kode-mini-pill">{acc.kodeWilayah}</span>
                              <div className="strong-title">{acc.instansi}</div>
                              <span className="sub-text">{acc.wilayah}, {acc.provinsi}</span>
                            </td>

                            <td className="td-sec-mode">
                              <span className={`sec-mode-pill ${acc.modePembekuan === 'MODE_DARURAT' ? 'emerald' : acc.modePembekuan === 'BEKUKAN_TINDAKAN_STRATEGIS' ? 'yellow' : 'red'}`}>
                                {acc.modePembekuan ? MODE_PEMBEKUAN_BPBD[acc.modePembekuan] || acc.modePembekuan : 'Tangguhkan Penuh'}
                              </span>
                              {acc.penangguhanInfo?.alasan && (
                                <div className="sec-alasan-sub" title={acc.penangguhanInfo.alasan}>
                                  Alasan: {acc.penangguhanInfo.alasan.slice(0, 50)}...
                                </div>
                              )}
                            </td>

                            <td className="td-sec-anomaly">
                              {acc.keamanan?.loginGagalCount > 0 ? (
                                <div className="anomaly-warning">
                                  <AlertTriangle size={13} className="text-red" />
                                  <span>{acc.keamanan.loginGagalCount} Kali Login Gagal</span>
                                </div>
                              ) : (
                                <span className="text-muted text-sm">Tidak ada kegagalan</span>
                              )}
                              {acc.keamanan?.anomaliLokasi && (
                                <div className="anomaly-location-tag">
                                  {acc.keamanan.anomaliLokasi}
                                </div>
                              )}
                            </td>

                            <td className="td-sec-lastlogin">
                              <div className="login-time-text">{acc.terakhirLogin}</div>
                              <div className="ip-text">IP: {acc.ipTerakhir}</div>
                            </td>

                            <td className="td-sec-sessions">
                              <span className="session-count-number">{acc.sesiAktif || 0} Perangkat</span>
                              {acc.keamanan?.sesiAktifList?.map((s) => (
                                <div key={s.id} className="session-device-sub">
                                  · {s.perangkat}
                                </div>
                              ))}
                            </td>

                            <td className="td-sec-actions">
                              <div className="sec-btn-group">
                                <button
                                  type="button"
                                  className="btn-sec-freeze-mode"
                                  onClick={() => {
                                    setFreezeMode(acc.modePembekuan || 'MODE_DARURAT')
                                    setFreezeAlasan(acc.penangguhanInfo?.alasan || '')
                                    setFreezeModalAcc(acc)
                                  }}
                                  title="Ubah Tingkat Mode Pembekuan Terbatas"
                                >
                                  <ShieldAlert size={14} />
                                  <span>Ubah Mode Pembekuan</span>
                                </button>

                                {acc.sesiAktif > 0 && (
                                  <button
                                    type="button"
                                    className="btn-sec-force-logout"
                                    onClick={() => akhiriSemuaSesiPerangkat(acc.id, 'Satgas Siber BNPB Pusat')}
                                    title="Keluarkan paksa dari seluruh perangkat aktif"
                                  >
                                    <LogOut size={13} />
                                    <span>Keluarkan Sesi</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="btn-sec-unfreeze"
                                  onClick={() => ubahModePembekuan(acc.id, { modePembekuan: 'NORMAL', alasan: 'Pencabutan status pembekuan oleh operator BNPB' })}
                                  title="Aktifkan kembali akses penuh BPBD"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Pulihkan Penuh</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION 4: PEMULIHAN AKSES RESMI                                     */}
          {/* ========================================================================= */}
          {activeTab === 'pemulihan' && (
            <div className="subsection-container">
              <div className="recovery-form-grid">
                {/* Form Card */}
                <div className="recovery-form-card">
                  <div className="card-top-title">
                    <KeyRound size={20} className="text-amber" />
                    <div>
                      <h3>Formulir Otorisasi Pemulihan Akses & Reset Kredensial</h3>
                      <p>Hanya dapat dilakukan berdasarkan surat permohonan resmi dan validasi nomor hotline Kemendagri.</p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!recoveryModalAcc) {
                        showNotif('Pilih salah satu akun BPBD untuk dipulihkan.', 'warning')
                        return
                      }
                      handleConfirmRecovery()
                    }}
                    className="recovery-main-form"
                  >
                    <div className="form-group-item">
                      <label htmlFor="selectRecoveryAcc">Pilih Akun BPBD Sasaran Pemulihan *</label>
                      <select
                        id="selectRecoveryAcc"
                        className="admin-input-styled"
                        value={recoveryModalAcc ? recoveryModalAcc.id : ''}
                        onChange={(e) => {
                          const found = akunBpbdList.find((a) => a.id === e.target.value)
                          setRecoveryModalAcc(found || null)
                        }}
                        required
                      >
                        <option value="">-- Pilih Akun BPBD --</option>
                        {akunBpbdList.map((a) => (
                          <option key={a.id} value={a.id}>
                            [{a.kodeWilayah}] {a.instansi} - {a.wilayah} ({a.status})
                          </option>
                        ))}
                      </select>
                    </div>

                    {recoveryModalAcc && (
                      <div className="selected-acc-preview-box">
                        <div className="preview-row">
                          <span className="lbl">Instansi Resmi:</span>
                          <span className="val font-semibold">{recoveryModalAcc.instansi}</span>
                        </div>
                        <div className="preview-row">
                          <span className="lbl">Hotline Resmi Terdaftar:</span>
                          <span className="val text-emerald font-bold">{recoveryModalAcc.hotline}</span>
                        </div>
                        <div className="preview-row">
                          <span className="lbl">Kepala Pelaksana (Kalaksa):</span>
                          <span className="val">{recoveryModalAcc.penanggungJawab?.nama}</span>
                        </div>
                        <div className="preview-row">
                          <span className="lbl">Status Saat Ini:</span>
                          <span className={`status-pill-badge ${recoveryModalAcc.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {recoveryModalAcc.status} {recoveryModalAcc.modePembekuan ? `(${recoveryModalAcc.modePembekuan})` : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="form-group-item">
                      <label htmlFor="inputSuratPemulihan">Nomor Surat / Kode Verifikasi Resmi Pemda *</label>
                      <input
                        id="inputSuratPemulihan"
                        type="text"
                        className="admin-input-styled"
                        value={recoverySurat}
                        onChange={(e) => setRecoverySurat(e.target.value)}
                        placeholder="Contoh: 050/BPBD-AGAM/PML/X/2026"
                        required
                      />
                      <span className="helper-text">Harus sesuai dengan surat permohonan bertandatangan Kalaksa atau Sekda.</span>
                    </div>

                    <div className="form-group-checkbox">
                      <input
                        type="checkbox"
                        id="checkHotlineValid"
                        checked={recoveryHotlineChecked}
                        onChange={(e) => setRecoveryHotlineChecked(e.target.checked)}
                        required
                      />
                      <label htmlFor="checkHotlineValid">
                        <strong>Konfirmasi Panggilan Hotline:</strong> Petugas telah menghubungi nomor hotline resmi terdaftar untuk memvalidasi identitas penelepon.
                      </label>
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="inputPetugasPemulihan">Nama Petugas BNPB yang Bertanggung Jawab *</label>
                      <input
                        id="inputPetugasPemulihan"
                        type="text"
                        className="admin-input-styled"
                        value={recoveryPetugas}
                        onChange={(e) => setRecoveryPetugas(e.target.value)}
                        placeholder="Nama dan unit tugas petugas piket"
                        required
                      />
                    </div>

                    <div className="form-group-item">
                      <label htmlFor="inputAlasanPemulihan">Alasan Pemulihan & Catatan *</label>
                      <textarea
                        id="inputAlasanPemulihan"
                        className="admin-textarea-styled"
                        rows={3}
                        value={recoveryAlasan}
                        onChange={(e) => setRecoveryAlasan(e.target.value)}
                        placeholder="Jelaskan dasar permohonan kredensial baru oleh instansi BPBD..."
                        required
                      />
                    </div>

                    <button type="submit" className="btn-submit-recovery-action" disabled={!recoveryModalAcc}>
                      <KeyRound size={16} />
                      <span>Otorisasi & Terbitkan Kata Sandi Sementara</span>
                    </button>
                  </form>
                </div>

                {/* Policy & Security Guidance Card */}
                <div className="recovery-guidance-card">
                  <div className="guidance-header">
                    <ShieldCheck size={20} className="text-emerald" />
                    <h4>Prinsip Keamanan Zero-Knowledge BNPB</h4>
                  </div>
                  <div className="guidance-points">
                    <div className="guidance-point">
                      <strong>1. Tidak Ada Akses Sandi Lama:</strong>
                      <p>Sistem enkripsi menjamin petugas BNPB tidak pernah dapat melihat atau mengetahui kata sandi asli milik BPBD.</p>
                    </div>
                    <div className="guidance-point">
                      <strong>2. Kata Sandi Acak Sekali Pakai:</strong>
                      <p>Sistem akan menghasilkan kata sandi sementara berkekuatan tinggi yang wajib diganti langsung pada saat login pertama.</p>
                    </div>
                    <div className="guidance-point">
                      <strong>3. Pemutusan Seluruh Sesi:</strong>
                      <p>Seluruh sesi login perangkat lama akan otomatis diputus paksa (force logout) untuk menjamin kredensial baru terlindungi.</p>
                    </div>
                    <div className="guidance-point">
                      <strong>4. Pencatatan Audit Abadi:</strong>
                      <p>Tindakan pemulihan ini dicatat permanen dalam riwayat audit administrasi dengan nama petugas yang bertugas.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECOVERY RESULT MODAL / CALLOUT */}
              {recoveryResult && (
                <div className="recovery-success-modal-backdrop" onClick={() => setRecoveryResult(null)}>
                  <div className="recovery-success-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-icon-badge">
                      <KeyRound size={28} className="text-amber" />
                    </div>
                    <h3>Kata Sandi Sementara Diterbitkan</h3>
                    <p className="modal-lead-instansi">{recoveryResult.instansi}</p>
                    <p className="modal-explain">
                      Serahkan kredensial sementara ini kepada Kepala Pelaksana BPBD melalui saluran hotline resmi tervalidasi. Pengguna wajib mengganti kata sandi ini saat login pertama.
                    </p>

                    <div className="password-display-box">
                      <span className="pwd-label">Kata Sandi Sementara (Sekali Pakai):</span>
                      <div className="pwd-value-row">
                        <code>{recoveryResult.tempPassword}</code>
                        <button
                          type="button"
                          className="btn-copy-temp-pass"
                          onClick={() => {
                            navigator.clipboard.writeText(recoveryResult.tempPassword)
                            setHasCopiedPass(true)
                            setTimeout(() => setHasCopiedPass(false), 3000)
                          }}
                        >
                          {hasCopiedPass ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
                          <span>{hasCopiedPass ? 'Tersalin!' : 'Salin Sandi'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="security-notice-sub">
                      Seluruh sesi login lama telah diputus. Counter kegagalan login telah direset.
                    </div>

                    <button type="button" className="btn-close-modal-result" onClick={() => setRecoveryResult(null)}>
                      Selesai & Tutup Jendela
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-SECTION 5: RIWAYAT ADMINISTRASI (AUDIT TRAIL IMMUTABLE)               */}
          {/* ========================================================================= */}
          {activeTab === 'audit' && (
            <div className="subsection-container">
              {/* Audit Toolbar */}
              <div className="audit-controls-bar">
                <div className="audit-search-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="audit-search-input"
                    placeholder="Cari nama petugas BNPB, instansi target, kode Kemendagri, alasan tindakan..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                  />
                  {auditSearch && (
                    <button type="button" className="btn-clear-q" onClick={() => setAuditSearch('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="audit-filters-wrap">
                  <select
                    className="audit-filter-select"
                    value={auditFilterAksi}
                    onChange={(e) => setAuditFilterAksi(e.target.value)}
                  >
                    <option value="Semua">Semua Jenis Tindakan</option>
                    <option value="Aktivasi">Aktivasi / Verifikasi</option>
                    <option value="Pembekuan">Pembekuan Akses</option>
                    <option value="Darurat">Mode Darurat</option>
                    <option value="Pemulihan">Pemulihan / Reset Sandi</option>
                    <option value="Pengembalian">Pengembalian Berkas</option>
                    <option value="Arsip">Pengarsipan</option>
                  </select>

                  <div className="audit-count-pill">
                    Total: <strong>{filteredAuditList.length}</strong> Catatan Audit
                  </div>
                </div>
              </div>

              {/* AUDIT TIMELINE TABLE */}
              <div className="audit-table-card">
                <div className="table-responsive">
                  <table className="audit-immutable-table">
                    <thead>
                      <tr>
                        <th>Waktu & IP Perangkat</th>
                        <th>Petugas yang Bertugas</th>
                        <th>Akun & Wilayah Sasaran</th>
                        <th>Tindakan Administratif</th>
                        <th>Alasan & Dasar Keputusan</th>
                        <th>Kondisi Sebelum → Sesudah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditList.map((log) => (
                        <tr key={log.id}>
                          <td className="td-audit-time">
                            <div className="time-val">{log.waktu}</div>
                            <div className="ip-val">{log.ip}</div>
                          </td>

                          <td className="td-audit-petugas">
                            <div className="officer-name-bold">
                              <User size={13} className="text-amber" />
                              <span>{log.petugas}</span>
                            </div>
                          </td>

                          <td className="td-audit-target">
                            <span className="kode-mini-pill">{log.kodeWilayah}</span>
                            <div className="instansi-bold">{log.instansi}</div>
                            <span className="wilayah-sub">{log.wilayah}</span>
                          </td>

                          <td className="td-audit-aksi">
                            <span className="action-pill-tag">{log.aksi}</span>
                          </td>

                          <td className="td-audit-alasan">
                            <p className="alasan-text">{log.alasan}</p>
                          </td>

                          <td className="td-audit-diff">
                            <div className="state-diff-box">
                              <div className="state-before-tag">
                                <span className="diff-lbl">Sebelum:</span>
                                <span className="diff-val">
                                  {log.stateBefore?.status || log.stateBefore?.modePembekuan || JSON.stringify(log.stateBefore).replace(/[{""}]/g, '')}
                                </span>
                              </div>
                              <ArrowRight size={13} className="diff-arrow" />
                              <div className="state-after-tag">
                                <span className="diff-lbl">Sesudah:</span>
                                <span className="diff-val">
                                  {log.stateAfter?.status || log.stateAfter?.modePembekuan || JSON.stringify(log.stateAfter).replace(/[{""}]/g, '')}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredAuditList.length === 0 && (
                  <div className="empty-audit-box">
                    <History size={36} className="text-muted" />
                    <h4>Tidak Ada Catatan Audit Ditemukan</h4>
                    <p>Sesuaikan kata kunci pencarian audit atau bersihkan filter jenis tindakan.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: BANTUAN JARAK JAUH / LIHAT DASHBOARD BPBD MODE HANYA BACA       */}
      {/* ========================================================================= */}
      {inspectModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setInspectModalAcc(null)}>
          <div className="admin-inspect-modal" onClick={(e) => e.stopPropagation()}>
            {/* MANDATORY UNMISSABLE READ-ONLY BANNER */}
            <div className="remote-inspect-mandatory-banner">
              <AlertTriangle size={20} className="banner-icon" />
              <div className="banner-text-block">
                <strong>MODE INSPEKSI JARAK JAUH BNPB PUSAT — HANYA BACA (READ-ONLY)</strong>
                <p>
                  BNPB Pusat tidak dapat mengubah data operasional atau bertindak atas nama BPBD.
                  Seluruh tombol eksekusi dinonaktifkan untuk menjaga kedaulatan penanganan darurat daerah.
                </p>
              </div>
              <button
                type="button"
                className="btn-close-inspect-banner"
                onClick={() => setInspectModalAcc(null)}
                aria-label="Tutup Inspeksi"
              >
                <X size={18} />
              </button>
            </div>

            {/* Simulated Regional Dashboard Content */}
            <div className="inspect-dashboard-viewport">
              <div className="inspect-top-meta">
                <div className="meta-left">
                  <span className="kode-inspect-pill">Kode Kemendagri: {inspectModalAcc.kodeWilayah}</span>
                  <h2>{inspectModalAcc.instansi}</h2>
                  <p>{inspectModalAcc.wilayah}, {inspectModalAcc.provinsi} · Hotline: {inspectModalAcc.hotline}</p>
                </div>
                <div className="meta-right">
                  <div className="siaga-badge-inspect">
                    <span className="status-dot-pulse" />
                    <span>Status: {inspectModalAcc.statusKesiapsiagaan || 'Normal'}</span>
                  </div>
                  <span className="update-time-text">Pembaruan: {inspectModalAcc.terakhirUpdateKesiapsiagaan || 'Hari ini'}</span>
                </div>
              </div>

              {/* Grid Widgets (Read-Only) */}
              <div className="inspect-widgets-grid">
                <div className="inspect-widget-card">
                  <h4>Posko Utama & Penanggung Jawab</h4>
                  <div className="widget-row">
                    <span className="w-lbl">Posko Induk:</span>
                    <span className="w-val">{inspectModalAcc.poskoUtama || 'Belum diisi'}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">Kalaksa:</span>
                    <span className="w-val">{inspectModalAcc.penanggungJawab?.nama}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">NIP:</span>
                    <span className="w-val">{inspectModalAcc.penanggungJawab?.nip || '-'}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">Kontak Kalaksa:</span>
                    <span className="w-val text-emerald">{inspectModalAcc.penanggungJawab?.kontak}</span>
                  </div>
                </div>

                <div className="inspect-widget-card">
                  <h4>Status Operasional & Telemetri</h4>
                  <div className="widget-row">
                    <span className="w-lbl">Status Akun:</span>
                    <span className="w-val font-bold">{inspectModalAcc.status}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">Mode Pembekuan:</span>
                    <span className="w-val">{inspectModalAcc.modePembekuan ? MODE_PEMBEKUAN_BPBD[inspectModalAcc.modePembekuan] || inspectModalAcc.modePembekuan : 'Normal (Tidak Ada Pembekuan)'}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">Terakhir Login:</span>
                    <span className="w-val">{inspectModalAcc.terakhirLogin}</span>
                  </div>
                  <div className="widget-row">
                    <span className="w-lbl">IP Login:</span>
                    <span className="w-val font-mono">{inspectModalAcc.ipTerakhir}</span>
                  </div>
                </div>

                <div className="inspect-widget-card full-width">
                  <h4>Riwayat Aktivitas Lokal BPBD Terkini (Hanya Baca)</h4>
                  <div className="inspect-activities-list">
                    {(inspectModalAcc.riwayatAktivitas || []).slice(0, 4).map((act) => (
                      <div key={act.id} className="inspect-act-item">
                        <span className="act-time">{act.waktu}</span>
                        <span className="act-desc">{act.aksi}</span>
                        <span className="act-op">Operator: {act.operator}</span>
                      </div>
                    ))}
                    {(!inspectModalAcc.riwayatAktivitas || inspectModalAcc.riwayatAktivitas.length === 0) && (
                      <p className="text-muted text-sm">Belum ada riwayat aktivitas lokal tercatat.</p>
                    )}
                  </div>
                </div>

                {/* Simulated Action Buttons with Disabled State */}
                <div className="inspect-widget-card full-width actions-disabled-card">
                  <h4>Panel Kendali Lapangan BPBD (Dinonaktifkan dalam Mode Inspeksi BNPB)</h4>
                  <div className="disabled-buttons-row">
                    <button type="button" className="btn-disabled-action" disabled title="Mode Hanya Baca — BNPB tidak dapat menyiarkan atas nama BPBD">
                      <Radio size={14} /> <span>Siarkan EWS Lokal</span>
                    </button>
                    <button type="button" className="btn-disabled-action" disabled title="Mode Hanya Baca — BNPB tidak dapat meminta bantuan atas nama BPBD">
                      <Send size={14} /> <span>Ajukan Permohonan Bantuan Pusat</span>
                    </button>
                    <button type="button" className="btn-disabled-action" disabled title="Mode Hanya Baca — BPBD lokal yang berwenang mengubah status wilayah">
                      <Shield size={14} /> <span>Ubah Status Keadaan Wilayah</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="inspect-footer">
              <button type="button" className="btn-close-inspect-main" onClick={() => setInspectModalAcc(null)}>
                Tutup Inspeksi Jarak Jauh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SETUJUI PERMOHONAN AKTIVASI                                      */}
      {/* ========================================================================= */}
      {approveModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setApproveModalAcc(null)}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <CheckCircle2 size={20} className="text-emerald" />
                <h3>Setujui & Aktifkan Akun BPBD</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setApproveModalAcc(null)}><X size={18} /></button>
            </div>

            <div className="modal-body-styled">
              <div className="modal-info-summary">
                <strong>{approveModalAcc.instansi}</strong>
                <span>{approveModalAcc.wilayah}, {approveModalAcc.provinsi} (Kode: {approveModalAcc.kodeWilayah})</span>
              </div>

              <div className="form-group-item">
                <label>Nama Petugas BNPB Pengesah *</label>
                <input
                  type="text"
                  className="admin-input-styled"
                  value={approvePetugas}
                  onChange={(e) => setApprovePetugas(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Status Kesiapsiagaan Awal *</label>
                <select
                  className="admin-input-styled"
                  value={approveKesiapsiagaan}
                  onChange={(e) => setApproveKesiapsiagaan(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Siaga">Siaga</option>
                  <option value="Siaga Darurat">Siaga Darurat</option>
                  <option value="Tanggap Darurat">Tanggap Darurat</option>
                </select>
              </div>

              <div className="form-group-item">
                <label>Catatan Pengesahan Berkas *</label>
                <textarea
                  className="admin-textarea-styled"
                  rows={3}
                  value={approveCatatan}
                  onChange={(e) => setApproveCatatan(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer-styled">
              <button type="button" className="btn-cancel-modal" onClick={() => setApproveModalAcc(null)}>Batal</button>
              <button type="button" className="btn-confirm-approve" onClick={handleConfirmApprove}>
                <CheckCircle2 size={16} />
                <span>Sah & Aktifkan Satu Akun Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: KEMBALIKAN PERMOHONAN UNTUK DIPERBAIKI (DENGAN CATATAN REVISI)   */}
      {/* ========================================================================= */}
      {returnModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setReturnModalAcc(null)}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <ArrowLeft size={20} className="text-amber" />
                <h3>Kembalikan Permohonan untuk Diperbaiki</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setReturnModalAcc(null)}><X size={18} /></button>
            </div>

            <div className="modal-body-styled">
              <div className="modal-info-summary">
                <strong>{returnModalAcc.instansi}</strong>
                <span>{returnModalAcc.wilayah}, {returnModalAcc.provinsi} (Kode: {returnModalAcc.kodeWilayah})</span>
              </div>

              <div className="form-group-item">
                <label>Nama Petugas BNPB yang Mengembalikan *</label>
                <input
                  type="text"
                  className="admin-input-styled"
                  value={returnPetugas}
                  onChange={(e) => setReturnPetugas(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Catatan Wajib Perbaikan untuk BPBD Daerah *</label>
                <textarea
                  className="admin-textarea-styled"
                  rows={4}
                  value={returnCatatan}
                  onChange={(e) => setReturnCatatan(e.target.value)}
                  placeholder="Sebutkan berkas yang kurang, ketidakjelasan stempel, verifikasi NIP, atau perbaikan lainnya..."
                  required
                />
                <span className="helper-text">Catatan ini akan langsung tampil di dashboard BPBD daerah agar segera diperbaiki.</span>
              </div>
            </div>

            <div className="modal-footer-styled">
              <button type="button" className="btn-cancel-modal" onClick={() => setReturnModalAcc(null)}>Batal</button>
              <button type="button" className="btn-confirm-return" onClick={handleConfirmReturn}>
                <ArrowLeft size={16} />
                <span>Kirim Catatan Revisi ke BPBD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: UBAH TINGKAT MODE PEMBEKUAN TERBATAS (4 TINGKATAN)               */}
      {/* ========================================================================= */}
      {freezeModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setFreezeModalAcc(null)}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <ShieldAlert size={20} className="text-red" />
                <h3>Ubah Mode Pembekuan Terbatas</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setFreezeModalAcc(null)}><X size={18} /></button>
            </div>

            <div className="modal-body-styled">
              <div className="modal-info-summary">
                <strong>{freezeModalAcc.instansi}</strong>
                <span>{freezeModalAcc.wilayah}, {freezeModalAcc.provinsi} (Kode: {freezeModalAcc.kodeWilayah})</span>
              </div>

              <div className="form-group-item">
                <label>Pilih Tingkatan Mode Pembekuan *</label>
                <div className="freeze-mode-select-grid">
                  <label className={`freeze-option-card ${freezeMode === 'BEKUKAN_PERUBAHAN_DATA' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="freezeModeOpt"
                      value="BEKUKAN_PERUBAHAN_DATA"
                      checked={freezeMode === 'BEKUKAN_PERUBAHAN_DATA'}
                      onChange={() => setFreezeMode('BEKUKAN_PERUBAHAN_DATA')}
                    />
                    <div>
                      <strong>Bekukan Perubahan Data (Hanya Baca)</strong>
                      <p>Akun masih bisa melihat situasi dashboard, namun seluruh formulir terkunci.</p>
                    </div>
                  </label>

                  <label className={`freeze-option-card ${freezeMode === 'BEKUKAN_TINDAKAN_STRATEGIS' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="freezeModeOpt"
                      value="BEKUKAN_TINDAKAN_STRATEGIS"
                      checked={freezeMode === 'BEKUKAN_TINDAKAN_STRATEGIS'}
                      onChange={() => setFreezeMode('BEKUKAN_TINDAKAN_STRATEGIS')}
                    />
                    <div>
                      <strong>Bekukan Tindakan Strategis</strong>
                      <p>Tidak bisa menyiarkan EWS atau meminta bantuan pusat. Data lokal tetap bisa dicatat.</p>
                    </div>
                  </label>

                  <label className={`freeze-option-card ${freezeMode === 'TANGGUHKAN_PENUH' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="freezeModeOpt"
                      value="TANGGUHKAN_PENUH"
                      checked={freezeMode === 'TANGGUHKAN_PENUH'}
                      onChange={() => setFreezeMode('TANGGUHKAN_PENUH')}
                    />
                    <div>
                      <strong>Tangguhkan Penuh (Blokir Akses Masuk)</strong>
                      <p>Tidak dapat masuk ke sistem sama sekali demi penyelidikan forensik siber.</p>
                    </div>
                  </label>

                  <label className={`freeze-option-card highlight-emerald ${freezeMode === 'MODE_DARURAT' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="freezeModeOpt"
                      value="MODE_DARURAT"
                      checked={freezeMode === 'MODE_DARURAT'}
                      onChange={() => setFreezeMode('MODE_DARURAT')}
                    />
                    <div>
                      <strong>Mode Darurat (Hanya Lapor & Bantuan)</strong>
                      <p><strong>Paling Direkomendasikan Saat Bencana:</strong> BPBD tetap bisa meminta tolong dan lapor korban saat akun diaudit!</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group-item">
                <label>Alasan Pembekuan *</label>
                <input
                  type="text"
                  className="admin-input-styled"
                  value={freezeAlasan}
                  onChange={(e) => setFreezeAlasan(e.target.value)}
                  placeholder="Contoh: Klarifikasi keabsahan struktur satgas darurat daerah"
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Durasi Pembekuan *</label>
                <select
                  className="admin-input-styled"
                  value={freezeDurasi}
                  onChange={(e) => setFreezeDurasi(e.target.value)}
                >
                  <option value="24 Jam (1 Hari)">24 Jam (1 Hari)</option>
                  <option value="48 Jam (2 Hari)">48 Jam (2 Hari)</option>
                  <option value="3 Hari (72 Jam)">3 Hari (72 Jam)</option>
                  <option value="7 Hari">7 Hari</option>
                  <option value="Hingga Audit Selesai">Hingga Audit Selesai</option>
                </select>
              </div>

              <div className="form-group-item">
                <label>Nama Petugas BNPB yang Berwenang *</label>
                <input
                  type="text"
                  className="admin-input-styled"
                  value={freezePetugas}
                  onChange={(e) => setFreezePetugas(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer-styled">
              <button type="button" className="btn-cancel-modal" onClick={() => setFreezeModalAcc(null)}>Batal</button>
              <button type="button" className="btn-confirm-freeze" onClick={handleConfirmFreeze}>
                <ShieldAlert size={16} />
                <span>Terapkan Mode Pembekuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: INSPEKSI DOKUMEN SK                                              */}
      {/* ========================================================================= */}
      {docInspectAcc && (
        <div className="admin-modal-backdrop" onClick={() => setDocInspectAcc(null)}>
          <div className="admin-doc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <FileText size={20} className="text-amber" />
                <h3>Pemeriksaan Dokumen Keabsahan BPBD</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setDocInspectAcc(null)}><X size={18} /></button>
            </div>

            <div className="doc-preview-body">
              <div className="doc-meta-banner">
                <div>
                  <strong>{docInspectAcc.permohonanAktivasi?.dokumenSK || 'Dokumen_SK.pdf'}</strong>
                  <p>Surat Permohonan: {docInspectAcc.permohonanAktivasi?.noSurat || 'N/A'}</p>
                </div>
                <span className="doc-status-badge">Terunggah Terenkripsi SHA-256</span>
              </div>

              <div className="simulated-pdf-viewer">
                <div className="pdf-page-simulated">
                  <div className="pdf-garuda-header">
                    <Building2 size={24} className="text-amber" />
                    <h4>PEMERINTAH DAERAH {docInspectAcc.wilayah.toUpperCase()}</h4>
                    <p>SURAT KEPUTUSAN KEPALA DAERAH</p>
                    <p className="pdf-decree-no">Nomor: {docInspectAcc.permohonanAktivasi?.noSurat || 'SK-01/BPBD/2026'}</p>
                  </div>
                  <div className="pdf-text-lines">
                    <p>TENTANG: PENETAPAN STRUKTUR SATUAN TUGAS PUSDALOPS BPBD DAN PENANGGUNG JAWAB KEDINASAN</p>
                    <p>Menimbang bahwa dalam rangka kesiapsiagaan menghadapi potensi bencana di wilayah {docInspectAcc.wilayah}, Provinsi {docInspectAcc.provinsi}...</p>
                    <p>MEMUTUSKAN: Menetapkan <strong>{docInspectAcc.penanggungJawab?.nama}</strong> (NIP: {docInspectAcc.penanggungJawab?.nip || '-'}) sebagai Kepala Pelaksana / Koordinator Akun Resmi BPBD.</p>
                  </div>
                  <div className="pdf-stamp-area">
                    <span className="stamp-circle">TERVERIFIKASI PUSDALOPS PB</span>
                    <span className="signature-line">Bupati / Walikota {docInspectAcc.wilayah}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-styled">
              <button type="button" className="btn-cancel-modal" onClick={() => setDocInspectAcc(null)}>Tutup Berkas</button>
              <button
                type="button"
                className="btn-confirm-approve"
                onClick={() => {
                  setDocInspectAcc(null)
                  setApproveModalAcc(docInspectAcc)
                }}
              >
                <CheckCircle2 size={16} />
                <span>Berkas Valid — Lanjutkan Persetujuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: DETAIL LENGKAP AKUN BPBD                                        */}
      {/* ========================================================================= */}
      {detailModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setDetailModalAcc(null)}>
          <div className="admin-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <Building2 size={20} className="text-amber" />
                <h3>Direktori Resmi BPBD Nasional</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setDetailModalAcc(null)}><X size={18} /></button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-hero-box">
                <span className="kode-large-pill">{detailModalAcc.kodeWilayah}</span>
                <h2>{detailModalAcc.instansi}</h2>
                <p>{detailModalAcc.wilayah}, {detailModalAcc.provinsi}</p>
              </div>

              <div className="detail-fields-grid">
                <div className="detail-field-card">
                  <span className="f-lbl">Alamat Kantor Resmi</span>
                  <span className="f-val">{detailModalAcc.alamatKantor || '-'}</span>
                </div>

                <div className="detail-field-card">
                  <span className="f-lbl">Hotline Kedinasan & Email</span>
                  <span className="f-val font-bold text-emerald">{detailModalAcc.hotline}</span>
                  <span className="f-sub">{detailModalAcc.emailResmi}</span>
                </div>

                <div className="detail-field-card">
                  <span className="f-lbl">Kepala Pelaksana (Kalaksa)</span>
                  <span className="f-val font-bold">{detailModalAcc.penanggungJawab?.nama}</span>
                  <span className="f-sub">NIP: {detailModalAcc.penanggungJawab?.nip || '-'}</span>
                  <span className="f-sub">Kontak: {detailModalAcc.penanggungJawab?.kontak}</span>
                </div>

                <div className="detail-field-card">
                  <span className="f-lbl">Posko Utama Kedaruratan</span>
                  <span className="f-val">{detailModalAcc.poskoUtama || 'Belum diisi'}</span>
                </div>

                <div className="detail-field-card">
                  <span className="f-lbl">Status Kesiapsiagaan Terkini</span>
                  <span className="f-val font-bold text-amber">{detailModalAcc.statusKesiapsiagaan}</span>
                  <span className="f-sub">Diperbarui: {detailModalAcc.terakhirUpdateKesiapsiagaan || '-'}</span>
                </div>

                <div className="detail-field-card">
                  <span className="f-lbl">Keamanan & Sesi</span>
                  <span className="f-val">Login Terakhir: {detailModalAcc.terakhirLogin}</span>
                  <span className="f-sub">IP: {detailModalAcc.ipTerakhir} · Sesi: {detailModalAcc.sesiAktif} aktif</span>
                </div>
              </div>
            </div>

            <div className="modal-footer-styled">
              <button type="button" className="btn-cancel-modal" onClick={() => setDetailModalAcc(null)}>Tutup</button>
              <button
                type="button"
                className="btn-tbl-inspect"
                onClick={() => {
                  const target = detailModalAcc
                  setDetailModalAcc(null)
                  setInspectModalAcc(target)
                }}
              >
                <Eye size={15} />
                <span>Lihat Dashboard (Hanya Baca)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT DATA AKUN BPBD                                             */}
      {/* ========================================================================= */}
      {editModalAcc && (
        <div className="admin-modal-backdrop" onClick={() => setEditModalAcc(null)}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <Edit3 size={20} className="text-amber" />
                <h3>Pembaruan Data Instansi BPBD</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setEditModalAcc(null)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="modal-body-styled">
                <div className="form-group-item">
                  <label>Nama Instansi Resmi BPBD *</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    value={editFormData.instansi}
                    onChange={(e) => setEditFormData({ ...editFormData, instansi: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Hotline Resmi BPBD *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      value={editFormData.hotline}
                      onChange={(e) => setEditFormData({ ...editFormData, hotline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-item">
                    <label>Email Resmi Kedinasan *</label>
                    <input
                      type="email"
                      className="admin-input-styled"
                      value={editFormData.emailResmi}
                      onChange={(e) => setEditFormData({ ...editFormData, emailResmi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Alamat Kantor Resmi</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    value={editFormData.alamatKantor}
                    onChange={(e) => setEditFormData({ ...editFormData, alamatKantor: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Posko Utama Kedaruratan</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    value={editFormData.poskoUtama}
                    onChange={(e) => setEditFormData({ ...editFormData, poskoUtama: e.target.value })}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Nama Kepala Pelaksana (Kalaksa) *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      value={editFormData.penanggungJawabNama}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabNama: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-item">
                    <label>NIP Pejabat</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      value={editFormData.penanggungJawabNip}
                      onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabNip: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Kontak Langsung Kalaksa *</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    value={editFormData.penanggungJawabKontak}
                    onChange={(e) => setEditFormData({ ...editFormData, penanggungJawabKontak: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer-styled">
                <button type="button" className="btn-cancel-modal" onClick={() => setEditModalAcc(null)}>Batal</button>
                <button type="submit" className="btn-confirm-approve">
                  <CheckCircle2 size={16} />
                  <span>Simpan Perubahan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: DAFTAR AKUN BARU (DENGAN CEK DUPLIKASI KEMENDAGRI)               */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCreateModalOpen(false)}>
          <div className="admin-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-styled">
              <div className="title-row">
                <Plus size={20} className="text-emerald" />
                <h3>Pendaftaran Akun Resmi BPBD Baru</h3>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setIsCreateModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="modal-body-styled">
                {createError && (
                  <div className="create-error-callout">
                    <AlertTriangle size={18} />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Kode Wilayah Kemendagri *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Contoh: 14.03"
                      value={createFormData.kodeWilayah}
                      onChange={(e) => setCreateFormData({ ...createFormData, kodeWilayah: e.target.value })}
                      required
                    />
                    <span className="helper-text">Mencegah pembuatan akun ganda untuk wilayah sama.</span>
                  </div>

                  <div className="form-group-item">
                    <label>Tingkat Pemerintahan *</label>
                    <select
                      className="admin-input-styled"
                      value={createFormData.tingkat}
                      onChange={(e) => setCreateFormData({ ...createFormData, tingkat: e.target.value })}
                    >
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Kota">Kota</option>
                      <option value="Provinsi">Provinsi</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Nama Kabupaten / Kota / Provinsi *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Contoh: Kabupaten Bengkalis"
                      value={createFormData.wilayah}
                      onChange={(e) => setCreateFormData({ ...createFormData, wilayah: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Provinsi *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Contoh: Riau"
                      value={createFormData.provinsi}
                      onChange={(e) => setCreateFormData({ ...createFormData, provinsi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Nama Instansi BPBD Resmi *</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    placeholder="Contoh: BPBD Kabupaten Bengkalis"
                    value={createFormData.instansi}
                    onChange={(e) => setCreateFormData({ ...createFormData, instansi: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Hotline Resmi BPBD *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Contoh: 0766-21222"
                      value={createFormData.hotline}
                      onChange={(e) => setCreateFormData({ ...createFormData, hotline: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Email Resmi Kedinasan *</label>
                    <input
                      type="email"
                      className="admin-input-styled"
                      placeholder="Contoh: bpbd@bengkaliskab.go.id"
                      value={createFormData.emailResmi}
                      onChange={(e) => setCreateFormData({ ...createFormData, emailResmi: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label>Alamat Kantor Resmi</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    placeholder="Contoh: Jl. Ahmad Yani No. 10, Bengkalis"
                    value={createFormData.alamatKantor}
                    onChange={(e) => setCreateFormData({ ...createFormData, alamatKantor: e.target.value })}
                  />
                </div>

                <div className="form-group-item">
                  <label>Posko Utama Kedaruratan</label>
                  <input
                    type="text"
                    className="admin-input-styled"
                    placeholder="Contoh: Posko Tanggap Darurat Karhutla Bengkalis"
                    value={createFormData.poskoUtama}
                    onChange={(e) => setCreateFormData({ ...createFormData, poskoUtama: e.target.value })}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-group-item">
                    <label>Nama Kepala Pelaksana (Kalaksa) *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Nama lengkap beserta gelar"
                      value={createFormData.namaPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, namaPic: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Kontak Kalaksa *</label>
                    <input
                      type="text"
                      className="admin-input-styled"
                      placeholder="Nomor ponsel aktif"
                      value={createFormData.kontakPic}
                      onChange={(e) => setCreateFormData({ ...createFormData, kontakPic: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer-styled">
                <button type="button" className="btn-cancel-modal" onClick={() => setIsCreateModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-confirm-approve">
                  <Plus size={16} />
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
