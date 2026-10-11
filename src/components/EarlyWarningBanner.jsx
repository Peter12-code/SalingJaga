import { useApp } from '../context/AppContext'
import './EarlyWarningBanner.css'

export default function EarlyWarningBanner() {
  const { peringatanList, broadcastEWS } = useApp()

  if (!peringatanList || peringatanList.length === 0) return null

  const activeAlert = peringatanList[0]

  return (
    <div className="ews-banner-wrapper" role="alert">
      <div className="ews-banner-inner">
        <div className="ews-badge-col">
          <div className="ews-pulse-beacon">
            <span className="ews-ping" />
            <span className="ews-dot" />
          </div>
          <span className="ews-level-tag">{activeAlert.level}</span>
        </div>

        <div className="ews-content-col">
          <div className="ews-header-row">
            <span className="ews-source">📡 {activeAlert.sumber}</span>
            <span className="ews-title">{activeAlert.judul}</span>
          </div>
          <p className="ews-desc">{activeAlert.rincian}</p>
        </div>

        <div className="ews-action-col">
          <button
            className="btn-broadcast-ews"
            onClick={() => broadcastEWS(activeAlert.id)}
            title="Kirim siaran peringatan darurat ke nomor warga di sekitar lokasi"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4.93 19.07A10 10 0 0 1 12 2a10 10 0 0 1 7.07 17.07" />
              <path d="M7.76 16.24A6 6 0 0 1 12 6a6 6 0 0 1 4.24 10.24" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>Broadcast Darurat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
