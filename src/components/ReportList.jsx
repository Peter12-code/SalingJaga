import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MapPin, Users, Clock, Search, X, Layers, AlertCircle, Sparkles, Target } from 'lucide-react'
import './ReportList.css'

function formatTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ALL_FILTER = 'Semua'
const FILTERS = [ALL_FILTER, 'Baru', 'Ditinjau Admin', 'Diproses', 'Selesai']

export default function ReportList() {
  const {
    laporan,
    selectedId,
    setSelectedId,
    reportFilter,
    setReportFilter,
    activeIncidentId,
    setActiveIncidentId,
    getPotentialDuplicates,
    checkKelengkapanData,
  } = useApp()
  const activeFilter = reportFilter || ALL_FILTER
  const setActiveFilter = (f) => setReportFilter ? setReportFilter(f) : null
  const [search, setSearch] = useState('')

  let filtered = activeFilter === ALL_FILTER
    ? laporan
    : activeFilter === 'Baru'
      ? laporan.filter((l) => l.status === 'Baru' || l.status === 'Ditinjau Admin')
      : laporan.filter((l) => l.status === activeFilter)

  if (search.trim()) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (l) =>
        l.jenis.toLowerCase().includes(q) ||
        l.lokasi.toLowerCase().includes(q) ||
        l.kebutuhan.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q)
    )
  }

  const getPriority = (l) => l.analisisAI?.prioritas || 'sedang'

  const getFilterCount = (f) => {
    if (f === ALL_FILTER) return laporan.length
    return laporan.filter((l) => l.status === f).length
  }

  return (
    <section className="report-list-section" aria-label="Daftar laporan musibah">
      {/* SECTION HEADER */}
      <div className="section-title">
        <div className="title-left">
          <div className="title-icon-badge">
            <Layers size={18} />
          </div>
          <div>
            <span className="title-text">Antrian Laporan Musibah</span>
            <span className="title-sub">Triase darurat & verifikasi lapangan</span>
          </div>
        </div>
        <span className="section-count">{filtered.length} Aktif</span>
      </div>

      {/* SEARCH BOX */}
      <div className="list-search-box">
        <Search size={16} className="search-input-icon" />
        <input
          type="text"
          placeholder="Cari ID laporan, jenis bencana, atau desa/lokasi…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => setSearch('')}
            aria-label="Bersihkan pencarian"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* STATUS FILTER TOOLBAR */}
      <div className="list-toolbar" role="group" aria-label="Filter status laporan">
        {FILTERS.map((f) => {
          const count = getFilterCount(f)
          const isActive = activeFilter === f
          return (
            <button
              key={f}
              className={`filter-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              <span>{f}</span>
              <span className={`filter-btn-count ${isActive ? 'active-count' : ''}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* REPORT CARDS FEED */}
      <div className="report-cards">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} className="empty-icon" />
            <p className="empty-title">Tidak ada laporan ditemukan</p>
            <p className="empty-desc">
              Kriteria filter <strong>"{activeFilter}"</strong> {search ? `dengan kata kunci "${search}"` : ''} saat ini kosong.
            </p>
          </div>
        ) : (
          filtered.map((l) => {
            const prio = getPriority(l)
            const isSelected = l.id === selectedId
            const isCritical = ['kritis', 'tinggi'].includes(prio)

            return (
              <article
                key={l.id}
                className={`report-card ${isSelected ? 'selected' : ''}`}
                data-priority={prio}
                onClick={() => setSelectedId(l.id)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedId(l.id)}
              >
                <div className="card-top">
                  <div className="card-left">
                    <span className="card-id">#{l.id}</span>
                    <span className="card-title">{l.jenis}</span>
                  </div>

                  <div className="card-badges">
                    <button
                      type="button"
                      className={`btn-report-focus-pill ${activeIncidentId === l.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveIncidentId(activeIncidentId === l.id ? null : l.id)
                      }}
                      title="Fokuskan seluruh data dashboard hanya ke insiden ini"
                    >
                      <Target size={11} />
                      <span>{activeIncidentId === l.id ? 'Fokus Aktif' : 'Fokus'}</span>
                    </button>

                    {/* BADGE DETEKSI LAPORAN GANDA */}
                    {getPotentialDuplicates && getPotentialDuplicates(l).length > 0 && (
                      <span className="card-badge-dup" title="Peringatan: Ditemukan laporan serupa berdekatan">
                        ⚠️ Duplikat
                      </span>
                    )}

                    {/* BADGE DATA BELUM LENGKAP */}
                    {checkKelengkapanData && checkKelengkapanData(l).length > 0 && (
                      <span className="card-badge-incomplete" title="Data foto / koordinat / jumlah warga belum lengkap">
                        Data Kurang
                      </span>
                    )}

                    {/* BADGE STATUS AKSES LOKASI */}
                    <span className={`card-badge-access access-${(l.aksesLokasi || 'terbuka').toLowerCase()}`}>
                      {l.aksesLokasi || 'Terbuka'}
                    </span>

                    {l.analisisAI && (
                      <span className="ai-indicator" title="Terdokumentasi AI Analisis">
                        <Sparkles size={11} /> AI {l.analisisAI.skor ? `${l.analisisAI.skor}%` : 'Triage'}
                      </span>
                    )}
                    <span className={`priority-badge ${prio}`}>
                      {isCritical && <span className="prio-pulse-dot" />}
                      {prio.toUpperCase()}
                    </span>
                    <span className={`status-pill status-${l.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {l.status}
                    </span>
                  </div>
                </div>

                <div className="card-meta">
                  <span className="meta-item">
                    <MapPin size={13} className="meta-icon" />
                    <span className="meta-text">{l.lokasi}</span>
                  </span>
                  <div className="meta-row-two">
                    <span className="meta-item">
                      <Users size={13} className="meta-icon" />
                      <strong>{Number(l.jumlahWarga || 0).toLocaleString('id-ID')}</strong> warga
                      {l.balitaDanLansia ? ` (${l.balitaDanLansia} balita/lansia)` : ''}
                    </span>
                    <span className="meta-item">
                      <Clock size={13} className="meta-icon" />
                      {formatTime(l.waktuLapor)}
                    </span>
                  </div>
                </div>

                {l.kebutuhan && (
                  <div className="card-kebutuhan">
                    <span className="kebutuhan-tag">Kebutuhan:</span>
                    <span className="kebutuhan-content">{l.kebutuhan}</span>
                  </div>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
