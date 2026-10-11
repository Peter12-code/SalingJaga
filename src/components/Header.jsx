import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Shield,
  Sun,
  Moon,
  Zap,
  AlertTriangle,
  LogOut,
  Globe,
  ChevronDown,
  User,
  Building2,
  ShieldCheck,
  Lock,
  History,
  Layers,
  Users,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import LiveAlertTicker from './LiveAlertTicker'
import ProfilBnpbModal from './national/ProfilBnpbModal'
import StatusWilayahModal from './StatusWilayahModal'
import './Header.css'

export default function Header() {
  const {
    userRole,
    setUserRole,
    setActiveTab,
    citizenTab,
    setCitizenTab,
    setShowForm,
    simulasiBencanaBaru,
    theme,
    setTheme,
    setIsAuthenticated,
    bpbdWilayah,
    statusWilayah,
    setStatusWilayah,
    updateStatusWilayah,
    wilayahNasionalList = [],
    akunBpbdList = [],
    nationalActiveTab,
    setNationalActiveTab,
  } = useApp()

  const navigate = useNavigate()
  const location = useLocation()
  const isNational = location.pathname.startsWith('/bnpb')
  const isBPBD = location.pathname === '/bpbd' || (userRole === 'petugas' && !isNational)

  const [isBnpbMenuOpen, setIsBnpbMenuOpen] = useState(false)
  const [isProfilBnpbModalOpen, setIsProfilBnpbModalOpen] = useState(false)
  const [isPortalMenuOpen, setIsPortalMenuOpen] = useState(false)
  const [isOfficerMenuOpen, setIsOfficerMenuOpen] = useState(false)
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const bnpbMenuRef = useRef(null)
  const portalMenuRef = useRef(null)
  const officerMenuRef = useRef(null)
  const demoMenuRef = useRef(null)

  // Hitung permohonan aktivasi akun BPBD yang menunggu review (standar: 3)
  const pendingPermohonanCount = (akunBpbdList || []).filter(
    (a) => a.status === 'Menunggu Verifikasi'
  ).length

  // Tutup dropdown jika klik di luar atau tekan tombol ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bnpbMenuRef.current && !bnpbMenuRef.current.contains(e.target)) {
        setIsBnpbMenuOpen(false)
      }
      if (portalMenuRef.current && !portalMenuRef.current.contains(e.target)) {
        setIsPortalMenuOpen(false)
      }
      if (officerMenuRef.current && !officerMenuRef.current.contains(e.target)) {
        setIsOfficerMenuOpen(false)
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(e.target)) {
        setIsDemoMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsBnpbMenuOpen(false)
        setIsProfilBnpbModalOpen(false)
        setIsPortalMenuOpen(false)
        setIsOfficerMenuOpen(false)
        setIsDemoMenuOpen(false)
        setIsStatusModalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const activeNationalCount = wilayahNasionalList?.length || 7

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole('warga')
    setActiveTab('map')
    setCitizenTab('beranda')
    navigate('/')
  }

  return (
    <>
      <header className="header-vibrant">
        <div className="header-vibrant-inner">
          <Link to="/" className="brand-vibrant" style={{ textDecoration: 'none' }}>
            <div className="brand-logo-glow">
              <img src="/logo.png" alt="Logo SalingJaga" className="brand-logo-img" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title">
                Saling<span className="brand-highlight">Jaga</span>
              </div>
              <div className="brand-subtitle">
                <span className="dot-green-live" /> Tanggap, Bantu, Lindungi
              </div>
            </div>
          </Link>

          {isNational ? (
            <div className="header-bpbd-official-account header-bnpb-highlight" role="status" aria-label="Status Akun BNPB Pusat">
              <span className="bpbd-agency-name">
                <Globe size={15} className="text-amber" />
                <strong>PUSDALOPS BNPB PUSAT</strong>
              </span>
              <span className="bpbd-header-dot">·</span>
              <span className="bpbd-status-territory">
                Graha BNPB Jakarta
              </span>
              <span className="bpbd-header-dot header-badge-telemetry">·</span>
              <span className="bpbd-header-time header-badge-telemetry">
                38 Provinsi · {activeNationalCount} Wilayah Aktif
              </span>
            </div>
          ) : isBPBD ? (
            <div className="header-bpbd-official-account" role="status" aria-label="Status Akun BPBD Daerah">
              <span className="bpbd-agency-name">
                <Shield size={15} className="bpbd-shield-icon" />
                <strong>BPBD Kota {bpbdWilayah || 'Tangerang'}</strong>
              </span>
              <span className="bpbd-header-dot">·</span>
              <span className="bpbd-status-territory">
                Status:{' '}
                <button
                  type="button"
                  className={`bpbd-status-toggle status-${(statusWilayah || 'Siaga').toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setIsStatusModalOpen(true)}
                  title="Status keadaan wilayah (Klik untuk buka dialog konfirmasi perubahan status)"
                >
                  <span className="status-dot-pulse" />
                  <span>{statusWilayah || 'Siaga'}</span>
                  <span className="status-dropdown-caret">▾</span>
                </button>
              </span>
              <span className="bpbd-header-dot header-badge-telemetry">·</span>
              <span className="bpbd-header-time header-badge-telemetry">
                Pembaruan 10:42 WIB
              </span>
            </div>
          ) : (
            <LiveAlertTicker />
          )}

          <div className="header-vibrant-actions">
            <button
              type="button"
              className="btn-icon-minimal"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
              aria-label={theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isNational ? (
              <>
                {/* MENU GANTI PORTAL PADA BNPB */}
                <div className="portal-dropdown-wrapper" ref={portalMenuRef}>
                  <button
                    type="button"
                    className={`btn-portal-dropdown-trigger ${isPortalMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsPortalMenuOpen(!isPortalMenuOpen)}
                    title="Beralih ke Portal Lain"
                    aria-expanded={isPortalMenuOpen}
                  >
                    <Layers size={14} />
                    <span>Ganti Portal</span>
                    <ChevronDown size={13} className={`portal-caret ${isPortalMenuOpen ? 'open' : ''}`} />
                  </button>
                  {isPortalMenuOpen && (
                    <div className="header-dropdown-menu" role="menu">
                      <Link to="/bpbd" className="header-dropdown-item" onClick={() => {
                        setIsPortalMenuOpen(false)
                        setIsAuthenticated(false)
                      }}>
                        <Shield size={16} className="text-emerald" />
                        <div className="item-text">
                          <strong>BPBD Daerah</strong>
                          <span>Pusdalops Pelaksana Kab/Kota Tangerang</span>
                        </div>
                      </Link>
                      <Link to="/" className="header-dropdown-item" onClick={() => setIsPortalMenuOpen(false)}>
                        <Users size={16} className="text-blue" />
                        <div className="item-text">
                          <strong>Mode Warga</strong>
                          <span>Portal Pelaporan & Peta Publik</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* TOMBOL KELOLA AKUN BPBD (DI SAMPING GANTI PORTAL) */}
                <button
                  type="button"
                  className={`btn-header-admin-bpbd ${location.pathname === '/bnpb/administrasi-bpbd' || (location.pathname === '/bnpb' && nationalActiveTab === 'akun-bpbd') ? 'active' : ''}`}
                  onClick={() => {
                    if (setNationalActiveTab) setNationalActiveTab('akun-bpbd')
                    navigate('/bnpb')
                  }}
                  title="Kelola & Verifikasi Akun Resmi BPBD Kabupaten/Kota/Provinsi"
                >
                  <ShieldCheck size={15} className="admin-bpbd-shield-icon" />
                  <span>Kelola Akun BPBD</span>
                  {pendingPermohonanCount > 0 && (
                    <span className="btn-admin-badge" title={`${pendingPermohonanCount} akun menunggu verifikasi`}>
                      {pendingPermohonanCount}
                    </span>
                  )}
                </button>

                {/* TOMBOL KELUAR */}
                <button
                  type="button"
                  className="btn-header-exit"
                  onClick={handleLogout}
                  aria-label="Keluar dari ruang komando BNPB"
                  title="Keluar dari sesi BNPB"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </>
            ) : isBPBD ? (
              <>
                {/* MENU GANTI PORTAL PADA BPBD */}
                <div className="portal-dropdown-wrapper" ref={portalMenuRef}>
                  <button
                    type="button"
                    className={`btn-portal-dropdown-trigger ${isPortalMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsPortalMenuOpen(!isPortalMenuOpen)}
                    title="Beralih ke Portal Lain"
                    aria-expanded={isPortalMenuOpen}
                  >
                    <Layers size={14} />
                    <span>Ganti Portal</span>
                    <ChevronDown size={13} className={`portal-caret ${isPortalMenuOpen ? 'open' : ''}`} />
                  </button>
                  {isPortalMenuOpen && (
                    <div className="header-dropdown-menu" role="menu">
                      <Link to="/" className="header-dropdown-item" onClick={() => setIsPortalMenuOpen(false)}>
                        <Users size={16} className="text-blue" />
                        <div className="item-text">
                          <strong>Mode Warga</strong>
                          <span>Portal Pelaporan & Peta Publik</span>
                        </div>
                      </Link>
                      <Link to="/bnpb" className="header-dropdown-item" onClick={() => {
                        setIsPortalMenuOpen(false)
                        setIsAuthenticated(false)
                      }}>
                        <Globe size={16} className="text-amber" />
                        <div className="item-text">
                          <strong>BNPB Nasional</strong>
                          <span>Pusat Komando Bencana Republik Indonesia</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* MENU ALAT DEMONSTRASI (Pengganti ikon petir tunggal di ponsel) */}
                <div className="portal-dropdown-wrapper" ref={demoMenuRef}>
                  <button
                    type="button"
                    className={`btn-demo-dropdown-trigger ${isDemoMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                    title="Alat Demonstrasi & Pengujian Respon Lapangan"
                    aria-expanded={isDemoMenuOpen}
                  >
                    <Zap size={15} className="text-amber" />
                    <span>Alat Demo</span>
                    <ChevronDown size={13} className={`portal-caret ${isDemoMenuOpen ? 'open' : ''}`} />
                  </button>
                  {isDemoMenuOpen && (
                    <div className="header-dropdown-menu" role="menu">
                      <button
                        type="button"
                        className="header-dropdown-item btn-action-item"
                        onClick={() => {
                          setIsDemoMenuOpen(false)
                          simulasiBencanaBaru()
                        }}
                      >
                        <Zap size={16} className="text-amber" />
                        <div className="item-text">
                          <strong>Uji Respon Lapangan</strong>
                          <span>Simulasi kejadian darurat & lonjakan laporan</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-header-exit"
                  onClick={handleLogout}
                  aria-label="Keluar dari ruang komando"
                  title="Keluar dari sesi BPBD"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                {citizenTab !== 'beranda' && (
                  <button type="button" className="btn-sos-primary" onClick={() => setShowForm(true)} aria-label="Laporkan kejadian">
                    <AlertTriangle size={18} /><span className="sos-text">Lapor Kejadian</span>
                  </button>
                )}

                {/* SATU TOMBOL KECIL PORTAL PETUGAS (PENGGANTI DUA LINK BESAR BPBD & BNPB) */}
                <div className="portal-dropdown-wrapper" ref={officerMenuRef}>
                  <button
                    type="button"
                    className={`btn-officer-dropdown-trigger ${isOfficerMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsOfficerMenuOpen(!isOfficerMenuOpen)}
                    title="Akses Portal Petugas Penolong Bencana"
                    aria-expanded={isOfficerMenuOpen}
                  >
                    <Shield size={15} className="text-emerald" />
                    <span>Portal Petugas</span>
                    <ChevronDown size={13} className={`portal-caret ${isOfficerMenuOpen ? 'open' : ''}`} />
                  </button>
                  {isOfficerMenuOpen && (
                    <div className="header-dropdown-menu" role="menu">
                      <Link
                        to="/bpbd"
                        className="header-dropdown-item"
                        onClick={() => {
                          setIsOfficerMenuOpen(false)
                          setIsAuthenticated(false)
                        }}
                      >
                        <Shield size={16} className="text-emerald" />
                        <div className="item-text">
                          <strong>BPBD Daerah</strong>
                          <span>Pusdalops Satgas Kab/Kota Tangerang</span>
                        </div>
                      </Link>
                      <Link
                        to="/bnpb"
                        className="header-dropdown-item"
                        onClick={() => {
                          setIsOfficerMenuOpen(false)
                          setIsAuthenticated(false)
                        }}
                      >
                        <Globe size={16} className="text-amber" />
                        <div className="item-text">
                          <strong>BNPB Nasional</strong>
                          <span>Pusat Kendali Krisis Bencana Nasional</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MODAL PROFIL INSTANSI BNPB PUSAT */}
      <ProfilBnpbModal
        isOpen={isProfilBnpbModalOpen}
        onClose={() => setIsProfilBnpbModalOpen(false)}
        onNavigateAdmin={() => navigate('/bnpb/administrasi-bpbd')}
      />

      {/* MODAL PERUBAHAN STATUS KESIAPSIAGAAN BPBD DENGAN ALASAN & KONFIRMASI */}
      <StatusWilayahModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={statusWilayah}
        bpbdWilayah={bpbdWilayah}
        onSaveStatus={updateStatusWilayah}
      />
    </>
  )
}
