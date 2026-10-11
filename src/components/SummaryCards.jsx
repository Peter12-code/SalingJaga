import {
  AlertTriangle,
  Users,
  Building2,
  Package,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import './SummaryCards.css'

export default function SummaryCards() {
  const { laporan, relawanList, poskoList, logistikList, setActiveTab, setReportFilter } = useApp()

  // 1. Laporan Belum Ditangani (Status: Baru atau Ditinjau Admin)
  const unhandledReports = laporan.filter((l) => l.status === 'Baru' || l.status === 'Ditinjau Admin')
  const criticalUnhandled = unhandledReports.filter((l) => l.analisisAI?.prioritas === 'kritis').length

  // 2. Tim Tersedia (Status: Siaga (Standby) atau Siap Berangkat)
  const availableTeams = relawanList.filter((r) =>
    ['siaga (standby)', 'siaga', 'siap berangkat', 'standby'].includes(r.status.toLowerCase())
  )
  const availablePersonnel = availableTeams.reduce((sum, r) => sum + Number(r.jumlahPersonel || 0), 0)

  // 3. Posko Penuh / Kritis Kapasitas (Keterisian >= 85%)
  const fullShelters = poskoList.filter((p) => {
    if (!p.kapasitas) return false
    const occupancyRatio = Number(p.terisi || 0) / Number(p.kapasitas || 1)
    return occupancyRatio >= 0.85
  })
  const hasExtremelyFullShelter = fullShelters.some((p) => (Number(p.terisi || 0) / Number(p.kapasitas || 1)) >= 0.95)

  // 4. Stok Logistik Kritis (Urgensi kritis atau pemenuhan < 50%)
  const criticalLogistics = logistikList.filter((i) => {
    const ratio = Number(i.terkumpul || 0) / Number(i.target || 1)
    return i.urgensi === 'kritis' || ratio < 0.5
  })

  // Konsistensi Warna Status:
  // Merah: Kritis / Bahaya
  // Kuning / Amber: Perlu Tindak Lanjut / Siaga
  // Hijau: Selesai / Siap / Aman
  const operationalCards = [
    {
      key: 'laporanBelumDitangani',
      val: unhandledReports.length,
      unit: 'Laporan',
      label: 'Laporan Belum Ditangani',
      sub: criticalUnhandled > 0 ? `${criticalUnhandled} insiden berstatus kritis` : 'Perlu respon triase cepat',
      tag: criticalUnhandled > 0 ? 'Kritis' : (unhandledReports.length > 0 ? 'Perlu Tindak Lanjut' : 'Aman'),
      tagType: criticalUnhandled > 0 ? 'tag-red' : (unhandledReports.length > 0 ? 'tag-amber' : 'tag-green'),
      color: criticalUnhandled > 0 ? 'red' : (unhandledReports.length > 0 ? 'amber' : 'green'),
      icon: AlertTriangle,
      targetTab: 'reports',
      targetFilter: 'Baru',
    },
    {
      key: 'timTersedia',
      val: availableTeams.length,
      unit: 'Tim',
      label: 'Tim Relawan Tersedia',
      sub: `${availablePersonnel} personel siaga posko`,
      tag: availableTeams.length > 0 ? 'Siap Berangkat' : 'Perlu Tambahan Tim',
      tagType: availableTeams.length > 0 ? 'tag-green' : 'tag-amber',
      color: availableTeams.length > 0 ? 'green' : 'amber',
      icon: Users,
      targetTab: 'volunteers',
      targetFilter: null,
    },
    {
      key: 'poskoPenuh',
      val: fullShelters.length,
      unit: 'Titik',
      label: 'Posko Penuh (Kapasitas Kritis)',
      sub: 'Keterisian ≥ 85% dari batas aman',
      tag: hasExtremelyFullShelter ? 'Kritis (≥95%)' : (fullShelters.length > 0 ? 'Perlu Relokasi' : 'Kapasitas Aman'),
      tagType: hasExtremelyFullShelter ? 'tag-red' : (fullShelters.length > 0 ? 'tag-amber' : 'tag-green'),
      color: hasExtremelyFullShelter ? 'red' : (fullShelters.length > 0 ? 'amber' : 'green'),
      icon: Building2,
      targetTab: 'map',
      targetFilter: null,
    },
    {
      key: 'stokKritis',
      val: criticalLogistics.length,
      unit: 'Item',
      label: 'Stok Logistik Kritis',
      sub: 'Defisit armada SAR & sembako',
      tag: criticalLogistics.length > 0 ? 'Kritis (Defisit)' : 'Stok Cukup',
      tagType: criticalLogistics.length > 0 ? 'tag-red' : 'tag-green',
      color: criticalLogistics.length > 0 ? 'red' : 'green',
      icon: Package,
      targetTab: 'logistics',
      targetFilter: null,
    },
  ]

  const handleCardClick = (card) => {
    if (card.targetFilter && setReportFilter) {
      setReportFilter(card.targetFilter)
    }
    if (setActiveTab && card.targetTab) {
      setActiveTab(card.targetTab)
    }
  }

  return (
    <section className="summary-cards-section" aria-label="Fokus operasional lokal BPBD">
      <div className="summary-cards-grid four-cols">
        {operationalCards.map((c) => {
          const Icon = c.icon
          return (
            <article
              key={c.key}
              className={`stat-card-tactical ${c.color}`}
              onClick={() => handleCardClick(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCardClick(c)
                }
              }}
              title={`Klik untuk membuka tab ${c.label}`}
            >
              <div className="card-top-header">
                <div className={`stat-tactical-icon ${c.color}`}>
                  <Icon size={22} />
                </div>
                <span className={`stat-pill-tag ${c.tagType}`}>
                  {c.tag}
                </span>
              </div>

              <div className="stat-tactical-body">
                <div className="stat-tactical-value-row">
                  <span className="stat-tactical-value">
                    {c.val.toLocaleString('id-ID')}
                  </span>
                  <span className="stat-tactical-unit">{c.unit}</span>
                </div>
                <div className="stat-tactical-label">
                  <strong>{c.label}</strong>
                  <span>{c.sub}</span>
                </div>
              </div>

              <div className="stat-tactical-footer">
                <span className="card-nav-hint">
                  Kelola di Tab <ArrowRight size={13} className="hint-arrow" />
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
