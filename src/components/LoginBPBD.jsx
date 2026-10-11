import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, MapPinned, Radio, ShieldCheck, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './LoginBPBD.css'

const DEMO_ACCOUNTS = {
  regional: { id: '12345678', password: 'bpbd', title: 'BPBD Daerah', detail: 'Koordinasi laporan dan tim lapangan' },
  nasional: { id: '99999999', password: 'bnpb', title: 'BNPB Nasional', detail: 'Pemantauan komando lintas wilayah' },
}

export default function LoginBPBD({ initialRole }) {
  const location = useLocation()
  const navigate = useNavigate()
  const targetRole = initialRole || (location.pathname.startsWith('/bnpb') ? 'nasional' : 'regional')
  const defaultAccount = DEMO_ACCOUNTS[targetRole] || DEMO_ACCOUNTS.regional

  const [nip, setNip] = useState(defaultAccount.id)
  const [password, setPassword] = useState(defaultAccount.password)
  const [selectedDemo, setSelectedDemo] = useState(targetRole)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { setIsAuthenticated, setAdminLevel, setUserRole, setActiveTab } = useApp()

  useEffect(() => {
    const acc = DEMO_ACCOUNTS[targetRole] || DEMO_ACCOUNTS.regional
    setNip(acc.id)
    setPassword(acc.password)
    setSelectedDemo(targetRole)
    setError('')
  }, [targetRole])

  const selectDemo = (level) => {
    const account = DEMO_ACCOUNTS[level]
    setNip(account.id)
    setPassword(account.password)
    setSelectedDemo(level)
    setError('')
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const match = Object.entries(DEMO_ACCOUNTS).find(([, account]) =>
      nip.trim() === account.id && password === account.password
    )

    if (!match) {
      setError('ID petugas atau kata sandi demo belum sesuai. Pilih akun demo di bawah untuk mencoba.')
      return
    }

    const level = match[0]
    setAdminLevel(level)
    setUserRole('petugas')
    setActiveTab('map')
    setIsAuthenticated(true)

    if (level === 'nasional') {
      navigate('/bnpb')
    } else {
      navigate('/bpbd')
    }
  }

  return (
    <main className="login-bpbd-container">
      <div className="login-layout">
        <aside className="login-story-panel" aria-label="Tentang portal petugas">
          <div className="login-story-brand">
            <span className="login-story-logo"><img src="/logo.png" alt="" /></span>
            <span>Saling<span>Jaga</span><small>PORTAL KOMANDO</small></span>
          </div>

          <div className="login-story-copy">
            <span className="login-story-eyebrow"><span /> RUANG KOORDINASI BENCANA</span>
            <h1>Satu ruang untuk <em>bergerak lebih cepat.</em></h1>
            <p>Pantau situasi, prioritaskan laporan warga, dan arahkan bantuan dari satu dashboard yang mudah dibaca.</p>
            <div className="login-story-points">
              <div><span><MapPinned size={20} /></span><div><strong>Peta situasi</strong><small>Laporan dan posko dalam satu tampilan</small></div></div>
              <div><span><Users size={20} /></span><div><strong>Koordinasi tim</strong><small>Relawan, penugasan, dan bantuan</small></div></div>
              <div><span><Radio size={20} /></span><div><strong>Respons terarah</strong><small>Fokus pada kebutuhan paling mendesak</small></div></div>
            </div>
          </div>

          <div className="login-story-note"><ShieldCheck size={18} /> Lingkungan demonstrasi SalingJaga</div>
        </aside>

        <section className="login-bpbd-card" aria-labelledby="login-heading">
          <div className="login-card-topline"><LockKeyhole size={18} /> AKSES DASHBOARD PETUGAS</div>
          <h2 id="login-heading">Masuk ke ruang komando</h2>
          <p className="login-subtitle">Gunakan akun demonstrasi BPBD atau BNPB untuk menjelajahi dashboard sesuai peran.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="officer-id">ID petugas demo</label>
              <input
                id="officer-id"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="Masukkan ID petugas"
                value={nip}
                onChange={(event) => { setNip(event.target.value); setSelectedDemo(null); setError('') }}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="officer-password">Kata sandi demo</label>
              <div className="password-field">
                <input
                  id="officer-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setSelectedDemo(null); setError('') }}
                  required
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <button type="submit" className="btn-login">Masuk ke Dashboard <ArrowRight size={18} /></button>
          </form>

          <div className="demo-section">
            <div className="demo-heading"><span>Pilih akun demo</span><small>Mengisi formulir secara otomatis</small></div>
            <div className="demo-actions">
              {Object.entries(DEMO_ACCOUNTS).map(([level, account]) => (
                <button
                  key={level}
                  type="button"
                  className={`btn-demo ${level} ${selectedDemo === level ? 'selected' : ''}`}
                  onClick={() => selectDemo(level)}
                  aria-pressed={selectedDemo === level}
                >
                  <span className="demo-account-icon">{level === 'regional' ? <MapPinned size={19} /> : <ShieldCheck size={19} />}</span>
                  <span><strong>{account.title}</strong><small>{account.detail}</small></span>
                  <ArrowRight size={17} className="demo-account-arrow" />
                </button>
              ))}
            </div>
          </div>

          <Link to="/" className="btn-back-warga"><ArrowLeft size={17} /> Kembali ke portal warga</Link>
        </section>
      </div>
    </main>
  )
}
