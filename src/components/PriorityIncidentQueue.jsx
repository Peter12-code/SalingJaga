import { AlertTriangle, Clock, MapPin, Users, Rocket, Compass, ClipboardList, Target, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './PriorityIncidentQueue.css'

export default function PriorityIncidentQueue() {
  const {
    laporan,
    selectedId,
    setSelectedId,
    setActiveTab,
    setDispatchTargetReport,
    setDispatchModalOpen,
    activeIncidentId,
    setActiveIncidentId,
  } = useApp()

  // Filter prioritas kritis dan tinggi lokal (Tangerang), tampilkan 3–5 laporan paling mendesak
  const priorityReports = laporan
    .filter((l) => ['kritis', 'tinggi'].includes(l.analisisAI?.prioritas) && l.status !== 'Selesai')
    .slice(0, 5)

  if (priorityReports.length === 0) {
    return null
  }

  const handleSelectAndFocusMap = (report) => {
    setSelectedId(report.id)
    setActiveTab('map')
  }

  const handleDispatch = (report) => {
    setDispatchTargetReport(report)
    setDispatchModalOpen(true)
  }

  const handleOpenDetail = (report) => {
    setSelectedId(report.id)
    setActiveTab('reports')
  }

  return (
    <section className="priority-queue-section" aria-label="Tindakan prioritas hari ini">
      <div className="priority-queue-header">
        <div className="priority-header-left">
          <div className="priority-icon-glow">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="priority-title-row">
              <h3 className="priority-title">Tindakan Prioritas Hari Ini</h3>
              <span className="priority-pulse-chip">
                <span className="queue-ping-dot" />
                {priorityReports.length} Laporan Butuh Aksi Cepat
              </span>
            </div>
            <p className="priority-sub">
              Daftar musibah paling mendesak di wilayah yang memerlukan pengerahan armada penyelamatan dalam batas Golden Time.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-view-all-reports"
          onClick={() => setActiveTab('reports')}
        >
          <span>Semua Laporan</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="priority-cards-grid">
        {priorityReports.map((item) => {
          const prio = item.analisisAI?.prioritas || 'tinggi'
          const deadline = item.analisisAI?.batasWaktuRespons || '< 2 Jam'
          const isSelected = item.id === selectedId

          return (
            <article
              key={item.id}
              className={`priority-queue-card ${prio} ${isSelected ? 'selected' : ''}`}
            >
              <div className="queue-card-top">
                <div className="queue-card-ident">
                  <span className="queue-id">#{item.id}</span>
                  <span className={`queue-badge ${prio}`}>
                    {prio.toUpperCase()}
                  </span>
                </div>
                <div className="queue-golden-time">
                  <Clock size={12} />
                  <span>Batas: {deadline}</span>
                </div>
              </div>

              <div className="queue-card-main">
                <h4 className="queue-card-title">{item.jenis} — {item.lokasi}</h4>
                <p className="queue-card-desc">{item.kondisi}</p>
              </div>

              <div className="queue-card-stats-row">
                <div className="queue-stat-chip">
                  <Users size={12} />
                  <span><strong>{Number(item.jumlahWarga || 0).toLocaleString('id-ID')}</strong> Warga</span>
                  {item.balitaDanLansia ? <small>({item.balitaDanLansia} lansia/balita)</small> : null}
                </div>
                <div className="queue-status-chip">
                  <span>Status: <strong>{item.status}</strong></span>
                </div>
              </div>

              {item.kebutuhan && (
                <div className="queue-needs-callout">
                  <span className="needs-kicker">Kebutuhan Mendesak:</span>
                  <span className="needs-text">{item.kebutuhan}</span>
                </div>
              )}

              <div className="queue-card-actions">
                <button
                  type="button"
                  className={`btn-queue-focus ${activeIncidentId === item.id ? 'active' : ''}`}
                  onClick={() => {
                    if (activeIncidentId === item.id) {
                      setActiveIncidentId(null)
                    } else {
                      setActiveIncidentId(item.id)
                    }
                  }}
                  title="Fokuskan seluruh data dashboard hanya ke insiden ini"
                >
                  <Target size={13} />
                  <span>{activeIncidentId === item.id ? 'Fokus Aktif' : 'Fokus Insiden'}</span>
                </button>
                <button
                  type="button"
                  className="btn-queue-dispatch"
                  onClick={() => handleDispatch(item)}
                  title="Kerahkan tim relawan ke lokasi ini"
                >
                  <Rocket size={13} />
                  <span>Kerahkan Tim</span>
                </button>
                <button
                  type="button"
                  className="btn-queue-map"
                  onClick={() => handleSelectAndFocusMap(item)}
                  title="Tinjau di Peta GIS"
                >
                  <Compass size={13} />
                  <span>Lihat Peta</span>
                </button>
                <button
                  type="button"
                  className="btn-queue-detail"
                  onClick={() => handleOpenDetail(item)}
                  title="Buka Berkas & Triase AI"
                >
                  <ClipboardList size={13} />
                  <span>Triase AI</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
