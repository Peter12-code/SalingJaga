import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  AlertTriangle,
  Phone,
  ShieldCheck,
  HeartHandshake,
  Compass,
  ChevronLeft,
  ChevronRight,
  Minus,
  Maximize2,
  Minimize2
} from 'lucide-react'
import './ChatbotWidget.css'

// DAFTAR RESPON CEPAT LENGKAP & KOMPREHENSIF
const SUGGESTIONS = [
  { label: '🚨 Nomor Darurat', query: 'Apa saja nomor telepon darurat nasional yang bisa dihubungi saat bencana?' },
  { label: '🌋 Panduan Gempa', query: 'Apa saja langkah keselamatan dan protokol saat terjadi gempa bumi?' },
  { label: '🌊 Bahaya Banjir', query: 'Bagaimana langkah evakuasi dan pencegahan bahaya saat air banjir naik?' },
  { label: '⛰️ Tanah Longsor', query: 'Apa tanda-tanda ancaman tanah longsor dan bagaimana cara menyelamatkan diri?' },
  { label: '🔥 Kebakaran', query: 'Bagaimana cara evakuasi aman saat terjadi kebakaran di pemukiman padat?' },
  { label: '🌊 Tsunami 20-20-20', query: 'Apa aturan 20-20-20 evakuasi tsunami dan ciri-ciri alam tsunami di pesisir?' },
  { label: '🎒 Tas Siaga 72 Jam', query: 'Apa saja isi barang penting di dalam Tas Siaga Bencana untuk 3 hari?' },
  { label: '🩹 Pertolongan P3K', query: 'Bagaimana pertolongan pertama pada korban pendarahan, patah tulang, dan hipotermia?' },
  { label: '🔍 Temukan Warga Posko', query: 'Bagaimana cara mencari sanak keluarga yang terpisah di posko pengungsian SalingJaga?' },
  { label: '🏥 Posko & Ranjang', query: 'Bagaimana cara mengecek ketersediaan ranjang dan posko pengungsian terdekat?' },
  { label: '📦 Donasi Logistik', query: 'Bantuan logistik apa yang paling mendesak dibutuhkan dan bagaimana cara donasi?' },
  { label: '📝 Cara Lapor Bencana', query: 'Bagaimana alur melaporkan kejadian musibah baru dengan koordinat GPS di SalingJaga?' },
  { label: '⛅ Radar BMKG & Cuaca', query: 'Bagaimana data cuaca satelit dan sensor TEWS gempa BMKG terintegrasi di SalingJaga?' },
  { label: '🛡️ Validasi Anti-Hoaks', query: 'Bagaimana SalingJaga mencegah dan memvalidasi laporan hoaks atau fiktif?' }
]

// BASIS PENGETAHUAN LENGKAP SIAGA BENCANA NASIONAL (BNPB, BASARNAS, BMKG, KEMENKES, PMI)
function getDisasterKnowledgeReply(text) {
  const q = text.toLowerCase()

  // 1. NOMOR DARURAT
  if (/kontak|darurat|nomor|telepon|hotline|call center|hubungi/i.test(q)) {
    return `📞 **Daftar Panggilan Darurat Nasional (Aktif 24 Jam):**

• **112** — **Panggilan Darurat Terpadu Nasional** (Bebas pulsa dari semua ponsel, tanpa kartu SIM/kuota).
• **115** — **Basarnas** (Pencarian, Penyelamatan, & Evakuasi SAR Lapangan).
• **119** — **Kemenkes RI** (Ambulans Siaga & Gawat Darurat Medis).
• **113** — **Pemadam Kebakaran & Penyelamatan (Damkar)**.
• **117** — **BNPB Pusat** (Komando Tanggap Darurat & Pusdalops Bencana).
• **021-7992325 / 1500-090** — **Palang Merah Indonesia (PMI)** (Darah & Dapur Umum).
• **123** — **PLN** (Pemutusan Listrik Darurat Area Genangan/Runtuh).

💡 *Tips: Buka tab **Kontak Darurat** di menu navigasi atas untuk langsung melakukan panggilan 1-klik ke nomor instansi di atas.*`
  }

  // 2. PROTOKOL GEMPA BUMI
  if (/gempa|lindhu|shakemap|tews/i.test(q)) {
    return `🌋 **Protokol Lengkap Keselamatan Gempa Bumi:**

**A. Saat Guncangan Terjadi:**
1. **Drop, Cover, Hold On**: Merunduk ke lantai, berlindung di bawah meja kokoh, pegang erat kaki meja.
2. **Lindungi Kepala**: Gunakan tas, bantal, atau helm jika tidak ada meja.
3. **Jauhi Bahaya**: Hindari jendela kaca, lemari gantung, cermin, dan kabel listrik.

**B. Jika di Dalam Gedung Bertingkat:**
• **JANGAN gunakan lift!** Gunakan tangga darurat hanya setelah guncangan berhenti.
• Jangan panik berebut keluar pintu secara serentak.

**C. Jika di Luar Ruangan:**
• Menjauh dari gedung tinggi, tiang listrik, papan reklame, dan pohon tua. Menuju lapangan terbuka.

**D. Pasca Gempa:**
• Matikan saklar MCB listrik dan lepas regulator gas kompor.
• Waspadai gempa susulan (*aftershocks*). Cek peta guncangan BMKG Shakemap resmi di Beranda SalingJaga.`
  }

  // 3. PROTOKOL BANJIR
  if (/banjir|genangan|luapan|air naik/i.test(q)) {
    return `🌊 **Protokol Evakuasi & Keselamatan Banjir:**

1. **Matikan Sakelar Listrik (MCB Utama)**: Lakukan segera sebelum air masuk rumah guna mencegah bahaya sengatan listrik mematikan.
2. **Selamatkan Dokumen Penting**: Masukkan KK, ijazah, sertifikat, dan buku nikah ke dalam kantong plastik kedap air (*zip-lock*) di posisi tertinggi.
3. **Prioritaskan Kelompok Rentan**: Evakuasi balita, ibu hamil, lansia, dan penyandang disabilitas ke posko sebelum air mencapai 30 cm.
4. **Waspadai Arus Deras**: Jangan berjalan atau mengendarai motor melintasi arus banjir > 15 cm (arus setinggi mata kaki dapat merobohkan orang dewasa).
5. **Cek Kapasitas Posko**: Buka menu **Peta & Posko** di SalingJaga untuk melihat lokasi posko terdekat yang masih memiliki kasur/ranjang kosong.`
  }

  // 4. PROTOKOL TANAH LONGSOR
  if (/longsor|tanah longsor|lereng|tebing/i.test(q)) {
    return `⛰️ **Tanda Bahaya & Langkah Evakuasi Tanah Longsor:**

**A. Gejala Awal yang Wajib Diwaspadai:**
• Muncul retakan baru di tanah lereng, jalan, atau dinding rumah mendadak miring/retak.
• Pintu atau jendela rumah tiba-tiba macet karena pergeseran fondasi tanah.
• Air sumur mendadak keruh atau muncul mata air baru berlumpur di lereng.
• Terdengar suara gemuruh misterius atau derak patahan pohon dari arah bukit.

**B. Langkah Penyelamatan:**
1. Jika hujan lebat turun lebih dari 2 jam di daerah lereng, **segera mengungsi mandiri**.
2. **Arah Evakuasi**: Berlari **MENYAMPING (tegak lurus)** terhadap jalur longsor, jangan berlari ke arah lembah alur material runtuhan.
3. Jauhi bibir tebing dan bantaran sungai di bawah lereng perbukitan.`
  }

  // 5. PROTOKOL KEBAKARAN
  if (/kebakaran|api|asap|damkar/i.test(q)) {
    return `🔥 **Protokol Keselamatan Saat Terjadi Kebakaran:**

1. **Merayap di Bawah Asap (Crawl Low)**: Udara bersih dan oksigen berada 30–50 cm dari lantai. Asap beracun dan karbon monoksida naik ke atas.
2. **Gunakan Kain Basah**: Tutup hidung dan mulut dengan kain/baju basah untuk menyaring asap panas.
3. **Raba Daun Pintu**: Sebelum membuka pintu ruangan, raba gagang pintu dengan punggung tangan. Jika terasa panas, JANGAN BUKA karena kobaran api ada di baliknya.
4. **Jika Pakaian Terbakar (Stop, Drop, & Roll)**: Berhenti, jatuhkan diri ke lantai, dan berguling-guling hingga api padam. Jangan pernah berlari!
5. Hubungi Damkar **113** dan laporkan titik GPS via tombol **Lapor Kejadian** di SalingJaga.`
  }

  // 6. PROTOKOL TSUNAMI (20-20-20)
  if (/tsunami|pesisir|pantai|gelombang pasang/i.test(q)) {
    return `🌊 **Pedoman Evakuasi Cepat Tsunami (Rumus 20-20-20):**

• **20 Detik Guncangan**: Jika Anda merasakan gempa kuat atau guncangan terus-menerus selama > 20 detik di dekat pantai.
• **20 Menit Waktu Evakuasi**: Anda hanya memiliki perkiraan waktu 20 menit sebelum gelombang pertama tiba di daratan.
• **20 Meter Ketinggian**: Segera lari menuju tempat berketinggian minimal 20 meter di atas permukaan laut atau menjauh 2–3 km dari garis pantai.

⚠️ **Tanda Alami Tsunami:**
• Air laut surut secara mendadak hingga dasar karang dan ikan terlihat menggelepar.
• Bau garam/belerang menyengat dan terdengar suara dentuman gemuruh ombak raksasa dari laut lepas.
• *JANGAN menunggu sirine atau peringatan resmi!* Begitu melihat tanda di atas, langsung evakuasi mandiri ke tempat tinggi.`
  }

  // 7. TAS SIAGA BENCANA (72 JAM)
  if (/tas siaga|survival bag|go bag|perbekalan|tas darurat/i.test(q)) {
    return `🎒 **Daftar Isi Tas Siaga Bencana (Siap untuk 72 Jam Mandiri):**

1. **Dokumen Penting**: Fotokopi KTP, KK, akta lahir, sertifikat tanah, dan buku rekening dalam plastik kedap air.
2. **Air Minum & Pangan**: Minimal 3 liter air per orang dan makanan siap saji tahan lama (biskuit, makanan kaleng, madu, kurma).
3. **Kotak P3K & Obat Khusus**: Obat pribadi rutin, plester, antiseptik, perban, minyak kayu putih, parasetamol, oralit.
4. **Penerangan & Energi**: Senter LED, baterai cadangan, korek api kedap air, lilin, dan powerbank berdaya penuh.
5. **Alat Komunikasi & Sinyal**: Radio transistor portabel, serta **peluit darurat** untuk memandu tim SAR jika terjebak.
6. **Pakaian & Hangat**: 1–2 set pakaian ganti, jaket tebal, jas hujan, selimut darurat foil thermal (*emergency space blanket*).
7. **Perlengkapan Higienis & Uang**: Sabun, tisu basah, pembalut wanita, masker medis, dan uang tunai pecahan kecil.`
  }

  // 8. PERTOLONGAN PERTAMA (P3K)
  if (/p3k|pertolongan pertama|pendarahan|patah tulang|hipotermia|luka bakar|medis darurat/i.test(q)) {
    return `🩹 **Panduan Tindakan Cepat Pertolongan Pertama (P3K):**

• **Luka Pendarahan Hebat**: Tekan luka secara langsung menggunakan kain bersih atau kasa steril selama 10–15 menit tanpa dilepas. Posisikan bagian luka lebih tinggi dari dada/jantung.
• **Patah Tulang**: Jangan ubah atau paksa luruskan posisi tulang! Pasang bidai darurat (bilah kayu/papan lurus) di kedua sisi sendi dan ikat lembut dengan kain.
• **Hipotermia (Kedinginan Banjir)**: Lepas pakaian basah, bungkus korban dengan selimut kering tebal atau foil thermal. Berikan minuman hangat manis jika sadar. Jangan gunakan air panas mendadak!
• **Luka Bakar**: Guyur luka dengan **air bersih mengalir suhu ruang** selama 15–20 menit. JANGAN oleskan pasta gigi, kecap, atau mentega! Tutup longgar dengan kain steril.
• Segera hubungi ambulans **119** atau rujuk ke Faskes terdekat di menu *Peta & Posko*.`
  }

  // 9. CARI KELUARGA & WARGA POSKO
  if (/keluarga|hilang|terpisah|orang hilang|reuni|warga posko/i.test(q)) {
    return `🔍 **Cara Menemukan Anggota Keluarga yang Terpisah di SalingJaga:**

SalingJaga menyediakan **2 Mode Cepat Terpadu**:
1. **Direktori Warga Posko (Cari Langsung)**:
   • Buka tab **Temukan Keluarga** di navigasi atas.
   • Ketik nama, panggilan, atau asal kampung (cth: *Yuni*, *Budi*, *Kampung Baru*).
   • Jika warga ditemukan, langsung klik **Hubungi Posko** untuk tersambung ke WhatsApp koordinator atau klik **Ini Keluarga Saya** untuk klaim identitas.
2. **Lapor Cepat & Pencocokan AI Instan**:
   • Cukup isi 4 data (Nama, Perkiraan Usia, Asal, No WhatsApp).
   • Mesin AI SalingJaga langsung menyisir 3 posko dalam 1 detik dan menampilkan persentase kecocokan serta bukti identitas di layar.`
  }

  // 10. INFORMASI POSKO & KAPASITAS RANJANG
  if (/posko|pengungsian|faskes|ranjang|tempat tinggal/i.test(q)) {
    return `🏥 **Informasi Posko Pengungsian & Fasilitas Terpadu:**

Buka menu **Peta & Posko** di navigasi warga untuk mengakses:
• **Peta Interaktif GIS**: Titik posko evakuasi aman dan rumah sakit rujukan darurat.
• **Kapasitas Ranjang Kosong**: Update status sisa kasur kosong secara real-time (cth: *Sisa 45 Ranjang*).
• **Fasilitas Tersedia**: Ketersediaan dapur umum, pos medis darurat, toilet portabel, dan genset listrik.
• **Kontak Koordinator**: Nama dan nomor HP koordinator lapangan yang dapat ditelepon langsung 24 jam.`
  }

  // 11. BANTUAN & DONASI LOGISTIK
  if (/donasi|bantuan|logistik|sembako|obat/i.test(q)) {
    return `📦 **Penyaluran Bantuan & Donasi Tepat Sasaran:**

Buka tab **Kebutuhan** di navigasi warga untuk melihat:
• **Daftar Kebutuhan Riil Posko**: Sembako, air bersih, popok bayi, selimut, pakaian dalam, dan obat ISPA yang diverifikasi koordinator posko.
• **Status Kebutuhan**: Indikator apakah stok mencukupi, menipis, atau darurat.
• **Donasi Terarah**: Anda dapat memilih item logistik spesifik dan menyalurkannya langsung tanpa risiko penumpukan barang yang tidak terpakai.`
  }

  // 12. CARA LAPOR KEJADIAN BENCANA
  if (/lapor|buat laporan|melapor|lapor kejadian/i.test(q)) {
    return `📝 **Langkah Mudah Melaporkan Kejadian Bencana:**

1. Klik tombol hijau **Lapor Kejadian** di navbar kanan atau beranda.
2. Pilih jenis bencana (Banjir, Gempa, Longsor, Kebakaran, Puting Beliung, dll).
3. Sistem akan otomatis mendeteksi koordinat GPS lokasi Anda (atau Anda dapat mengetik alamat spesifik).
4. Masukkan perkiraan korban, warga mengungsi, dan kebutuhan darurat utama (makanan siap saji, perahu karet, medis).
5. Unggah foto situasi jika memungkinkan.
6. Laporan Anda langsung diteruskan ke Peta Komando BPBD dan feed radar warga terdekat.`
  }

  // 13. RADAR BMKG & CUACA
  if (/bmkg|cuaca|radar|hujan|suhu|autogempa/i.test(q)) {
    return `⛅ **Integrasi Data Satelit Resmi BMKG di SalingJaga:**

SalingJaga terhubung langsung ke server Open Data BMKG Pusat:
• **Radar Cuaca Kelurahan (ADM4)**: Menampilkan prakiraan cuaca detail, kelembapan, kecepatan angin, dan curah hujan berbasis GPS lokasi Anda.
• **Sensor TEWS Gempa Terkini**: Menampilkan gempa bumi M 5.0+ terbaru di Indonesia dengan kalkulasi jarak radius (Haversine) dari posisi Anda ke episentrum gempa.
• **Akses Peta Guncangan (BMKG Shakemap)**: Klik tombol *Lihat Peta Shakemap* di widget radar cuaca untuk melihat intensitas guncangan resmi BMKG.`
  }

  // 14. SISTEM ANTI-HOAKS
  if (/hoaks|fiksi|palsu|validasi|nik|uu ite|karantina/i.test(q)) {
    return `🛡️ **Sistem Multi-Layer Anti-Laporan Palsu SalingJaga:**

1. **Cross-Check Sensor Satelit BMKG**: Memverifikasi apakah laporan cuaca atau gempa sinkron dengan data seismik dan radar BMKG saat kejadian.
2. **Validasi Konsensus Komunitas (Vote Warga)**: Warga di sekitar lokasi dapat menekan tombol *Ya (Valid)* atau *Tidak (Ragu)*. Laporan terverifikasi setelah meraih konsensus.
3. **Pilihan NIK Sukarela**: Laporan beridentitas terverifikasi otomatis mendapat prioritas respons di Peta Komando BPBD.
4. **Peringatan Hukum UU ITE**: Dilengkapi penafian resmi Pasal 28 UU ITE untuk mencegah laporan palsu yang meresahkan publik.`
  }

  // DEFAULT FALLBACK
  return `Halo! Saya Asisten AI Siaga Bencana SalingJaga. 

Saya dapat memberikan panduan komprehensif terkait:
• 🚨 **Nomor Kontak Darurat** (112, 115 Basarnas, 119 Medis, dll)
• 🌋 **Panduan Evakuasi Bencana** (Gempa, Banjir, Longsor, Kebakaran, Tsunami)
• 🎒 **Tas Siaga Bencana 72 Jam** & Panduan Pertolongan Pertama (P3K)
• 🔍 **Pencarian Warga & Keluarga Terpisah** di posko pengungsian
• 🏥 **Lokasi Posko & Sisa Ranjang Kosong**
• ⛅ **Informasi Cuaca & Radar Gempa Terkini BMKG**

Silakan ketik pertanyaan spesifik Anda atau klik salah satu topik respon cepat di atas!`
}

// Helper untuk parse format inline: **teks tebal**, *miring*, `kode`
function parseInline(text) {
  if (!text) return null
  // Regex: 1) ***bold-italic***, 2) **bold**, 3) *italic*, 4) `code`
  const regex = /(\*\*\*[\s\S]*?\*\*\*|\*\*[\s\S]*?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g
  const parts = text.split(regex)

  return parts.map((part, idx) => {
    if (!part) return null
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={idx} className="chat-strong">
          <em>{part.slice(3, -3)}</em>
        </strong>
      )
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="chat-strong">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={idx} className="chat-em">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={idx} className="chat-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    // Bersihkan tanda bintang ganda nyasar jika ada format yang tidak tertutup rapi
    return part.replace(/\*\*/g, '')
  })
}

// Komponen untuk merender seluruh pesan dengan format list dan heading rapi (bebas tanda ** mentah)
function FormattedMessage({ text }) {
  if (!text) return null
  const lines = text.split('\n')

  return (
    <div className="chat-formatted-body">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim()

        // Baris spasi/paragraf baru
        if (!trimmed) {
          return <div key={lineIdx} className="chat-line-spacer" />
        }

        // Heading markdown: ### atau ## atau #
        const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
        if (headingMatch) {
          return (
            <div key={lineIdx} className="chat-heading-line">
              {parseInline(headingMatch[2])}
            </div>
          )
        }

        // Bullet point: • atau - atau *
        const bulletMatch = trimmed.match(/^([•\-\*])\s+(.+)$/)
        if (bulletMatch) {
          return (
            <div key={lineIdx} className="chat-bullet-row">
              <span className="chat-bullet-icon">•</span>
              <span className="chat-bullet-text">{parseInline(bulletMatch[2])}</span>
            </div>
          )
        }

        // Numbered list: 1. atau 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
        if (numMatch) {
          return (
            <div key={lineIdx} className="chat-num-row">
              <span className="chat-num-badge">{numMatch[1]}.</span>
              <span className="chat-num-text">{parseInline(numMatch[2])}</span>
            </div>
          )
        }

        // Subheader bagian (misal: "**B. Jika di Dalam Gedung Bertingkat:**")
        if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length >= 4) {
          return (
            <div key={lineIdx} className="chat-section-header">
              {parseInline(trimmed)}
            </div>
          )
        }

        // Baris teks biasa
        return (
          <div key={lineIdx} className="chat-text-line">
            {parseInline(line)}
          </div>
        )
      })}
    </div>
  )
}

export default function ChatbotWidget() {
  const location = useLocation()
  const { isAuthenticated } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Halo! Saya Asisten AI SalingJaga. Ada yang bisa saya bantu terkait informasi siaga bencana, kontak darurat, atau panduan evakuasi?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false)

  // Otomatis sembunyikan chatbot saat modal sistem terbuka agar tidak menutupi aksi/konten modal
  useEffect(() => {
    const checkModals = () => {
      const modalElements = document.querySelectorAll(
        '.modal-overlay, .premium-modal-overlay, .family-modal-overlay, .form-overlay-vibrant, .nat-modal-overlay, .pantau-modal-overlay, .bnpb-prof-overlay, .ews-modal-overlay, .activity-modal-overlay, .coord-modal-overlay, .close-report-overlay, .sitrep-overlay, .contacts-modal-overlay, .status-dialog-overlay, [role="dialog"]'
      )
      setIsAnyModalOpen(modalElements.length > 0)
    }

    checkModals()
    const observer = new MutationObserver(() => {
      checkModals()
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Scroll Adaptif Baris Saran Respon Cepat
  const suggestionsRef = useRef(null)
  const [canScrollSuggestLeft, setCanScrollSuggestLeft] = useState(false)
  const [canScrollSuggestRight, setCanScrollSuggestRight] = useState(false)

  const checkSuggestScroll = useCallback(() => {
    const el = suggestionsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const isScrollable = scrollWidth > clientWidth + 2
    setCanScrollSuggestLeft(isScrollable && scrollLeft > 6)
    setCanScrollSuggestRight(isScrollable && scrollLeft + clientWidth < scrollWidth - 6)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(checkSuggestScroll, 200)
    }
  }, [isOpen, checkSuggestScroll])

  const handleSuggestScroll = (direction) => {
    const el = suggestionsRef.current
    if (!el) return
    const scrollAmount = 160
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
    setTimeout(checkSuggestScroll, 250)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processQuery = async (userText) => {
    if (!userText.trim()) return

    setMessages(prev => [...prev, { role: 'user', text: userText }])
    setInput('')
    setIsLoading(true)

    try {
      const langflowUrl = import.meta.env.VITE_LANGFLOW_URL || 'http://localhost:7860'
      const flowId = import.meta.env.VITE_LANGFLOW_CHAT_FLOW_ID || import.meta.env.VITE_LANGFLOW_FLOW_ID || '2711834c-3cec-4a25-93df-524bc13593ee'

      const res = await fetch(`${langflowUrl}/api/v1/run/${flowId}?stream=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_value: userText,
          input_type: 'chat',
          output_type: 'chat',
          tweaks: {},
        }),
      })

      if (!res.ok) throw new Error('Langflow offline')

      const raw = await res.json()
      const aiText = raw?.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
                     raw?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
                     getDisasterKnowledgeReply(userText)

      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch {
      // Smart Fallback offline instant intelligence
      setTimeout(() => {
        const reply = getDisasterKnowledgeReply(userText)
        setMessages(prev => [...prev, { role: 'ai', text: reply }])
        setIsLoading(false)
      }, 450)
      return
    }

    setIsLoading(false)
  }

  const handleSend = (e) => {
    e.preventDefault()
    processQuery(input)
  }

  const handleSuggestionClick = (query) => {
    processQuery(query)
  }

  if (location.pathname === '/bpbd' && !isAuthenticated) return null

  return (
    <div className={`chatbot-wrapper ${isAnyModalOpen ? 'hidden-by-modal' : ''}`}>
      {isOpen && (
        <div className={`chatbot-window ${isMinimized ? 'minimized' : ''} ${isMaximized ? 'maximized' : ''}`}>
          {/* Header */}
          <div
            className="chatbot-header"
            onClick={() => {
              if (isMinimized) setIsMinimized(false)
            }}
            title={isMinimized ? 'Klik untuk memperluas' : undefined}
          >
            <div className="chatbot-header-info">
              <span className="chatbot-avatar">🤖</span>
              <div>
                <h4>Asisten AI SalingJaga</h4>
                <p>
                  <span className="bot-status-dot" />{' '}
                  {isMinimized ? 'Klik untuk memperluas' : 'Respon Cepat Bencana (BNPB & BMKG)'}
                </p>
              </div>
            </div>

            <div className="chatbot-header-actions" onClick={(e) => e.stopPropagation()}>
              {/* Tombol Minimize */}
              <button
                type="button"
                className="chatbot-ctrl-btn btn-minimize"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Perluas jendela (Restore)' : 'Kecilkan (Minimize)'}
                aria-label="Minimize asisten"
              >
                <Minus size={15} />
              </button>

              {/* Tombol Maximize (Hanya saat tidak di-minimize) */}
              {!isMinimized && (
                <button
                  type="button"
                  className="chatbot-ctrl-btn btn-maximize"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Kembalikan ukuran normal' : 'Perbesar jendela (Maximize)'}
                  aria-label="Maximize asisten"
                >
                  {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
              )}

              {/* Tombol Tutup */}
              <button
                type="button"
                className="chatbot-ctrl-btn btn-close"
                onClick={() => {
                  setIsOpen(false)
                  setIsMinimized(false)
                }}
                title="Tutup asisten"
                aria-label="Tutup asisten"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips with Left/Right Scroll Controls */}
          <div className="chatbot-suggestions-wrapper">
            {canScrollSuggestLeft && (
              <button
                type="button"
                className="chip-scroll-btn chip-scroll-left"
                onClick={() => handleSuggestScroll('left')}
                aria-label="Geser topik ke kiri"
                title="Topik sebelumnya"
              >
                <ChevronLeft size={13} />
              </button>
            )}

            <div
              className={`chatbot-suggestions-bar ${canScrollSuggestLeft ? 'has-left-fade' : ''} ${canScrollSuggestRight ? 'has-right-fade' : ''}`}
              ref={suggestionsRef}
              onScroll={checkSuggestScroll}
            >
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(item.query)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {canScrollSuggestRight && (
              <button
                type="button"
                className="chip-scroll-btn chip-scroll-right"
                onClick={() => handleSuggestScroll('right')}
                aria-label="Geser topik ke kanan"
                title="Topik lainnya"
              >
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-row ${m.role}`}>
                <div className="chat-bubble">
                  <FormattedMessage text={m.text} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-bubble-row ai">
                <div className="chat-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chatbot-input-area" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Tanyakan protokol bencana, nomor 112, BMKG..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Kirim pesan"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        className={`chatbot-toggle-btn ${isOpen && !isMinimized ? 'open' : ''}`}
        onClick={() => {
          if (isOpen && isMinimized) {
            setIsMinimized(false)
          } else {
            setIsOpen(!isOpen)
            if (isOpen) {
              setIsMinimized(false)
            }
          }
        }}
        title={isOpen && isMinimized ? 'Buka kembali Asisten AI' : 'Tanya Asisten AI SalingJaga'}
        aria-label={isOpen && !isMinimized ? 'Tutup asisten AI' : 'Tanya Asisten AI'}
      >
        {isOpen && !isMinimized ? (
          <X size={24} />
        ) : (
          <>
            <MessageSquare size={24} />
            <span className="bot-btn-pulse" />
          </>
        )}
      </button>
    </div>
  )
}
