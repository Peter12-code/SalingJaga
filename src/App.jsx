import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ChatbotWidget from './components/ChatbotWidget'
import './App.css'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const NationalDashboard = lazy(() => import('./components/national/NationalDashboard'))
const NationalBPBDAdminPage = lazy(() => import('./pages/NationalBPBDAdminPage'))

function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0f1d',
        color: '#94a3b8',
        gap: '14px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          border: '3px solid rgba(16, 185, 129, 0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'salingJagaSpin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0', letterSpacing: '0.02em' }}>
        Memuat Komando SalingJaga...
      </span>
      <style>{`@keyframes salingJagaSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard viewRole="warga" />} />
            <Route path="/bpbd" element={<Dashboard viewRole="petugas" />} />
            <Route path="/bnpb" element={<NationalDashboard />} />
            <Route path="/bnpb/administrasi-bpbd" element={<NationalBPBDAdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ChatbotWidget />
      </AppProvider>
    </Router>
  )
}

