import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Cloud, CloudDownload, CloudUpload, Database, Edit3, FileText, Flag, Gauge, GraduationCap,
  Home, LineChart, ListChecks, Menu, MessageCircle, Moon, Plus, Rocket, Save, Search, Settings,
  Sparkles, Sun, Target, Trophy, Users, X, Zap, Send, Download, Upload, RotateCcw, Trash2
} from 'lucide-react'
import './styles.css'

const APP_KEY = 'strategisk-phd-os-v1'
const DRIVE_FILE = 'strategiSK-data.json'
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'

const iso = (date = new Date()) => date.toISOString().slice(0, 10)
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
const pct = (a, b) => b ? Math.min(100, Math.round((a / b) * 100)) : 0
const daysBetween = (date) => Math.max(0, Math.ceil((new Date(date + 'T23:59:59') - new Date()) / 86400000))
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`

const defaultData = {
  profile: {
    name: 'Shahril Khairi',
    tagline: 'konsisten . komited . konstruktif . kreatif . karismatik',
    startDate: '2026-10-01',
    targetDate: '2029-03-31',
    currentDraft: 17,
    draftGoal: 111,
    whatsapp: '',
    telegramChatId: '',
    autoSync: true,
  },
  countdowns: [
    { id: uid(), label: 'Hantar pembetulan SV', date: addDays(5), type: 'short', icon: 'calendar' },
    { id: uid(), label: 'Naik Draft seterusnya', date: addDays(12), type: 'short', icon: 'draft' },
    { id: uid(), label: 'Fasa pengumpulan data', date: addDays(45), type: 'mid', icon: 'people' },
  ],
  chapters: [
    { id: uid(), name: 'Bab 1 — Pengenalan', progress: 65 },
    { id: uid(), name: 'Bab 2 — Sorotan Literatur', progress: 35 },
    { id: uid(), name: 'Bab 3 — Metodologi', progress: 20 },
    { id: uid(), name: 'Bab 4 — Dapatan', progress: 0 },
    { id: uid(), name: 'Bab 5 — Perbincangan', progress: 0 },
    { id: uid(), name: 'Bab 6 — Kesimpulan', progress: 0 },
  ],
  tasks: [
    { id: uid(), title: 'Naik Draft 017 — Problem Statement', date: iso(), done: true, category: 'Draft' },
    { id: uid(), title: 'Isi TDR harian', date: iso(), done: false, category: 'Dr Roket' },
    { id: uid(), title: 'Baca dan catat 2 artikel', date: iso(), done: false, category: 'Reading' },
    { id: uid(), title: 'Kemaskini senarai expert', date: addDays(1), done: false, category: 'Research' },
  ],
  events: [
    { id: uid(), title: 'Menulis Draft — Problem Statement', date: iso(), start: '07:00', end: '08:30', type: 'draft' },
    { id: uid(), title: 'Konsultasi SV', date: iso(), start: '10:00', end: '11:00', type: 'sv' },
    { id: uid(), title: 'TDR + refleksi harian', date: iso(), start: '21:00', end: '21:20', type: 'diary' },
  ],
  diary: [{ id: uid(), date: iso(), text: 'Fokus hari ini: kemaskan problem statement dan kaitkan isu document-centric e-submission.', win: 'Berjaya naikkan satu versi draft.', mood: 4 }],
  consultations: [{ id: uid(), date: addDays(-2), topic: 'Problem Statement & Significance', comment: 'Strengthen gap dan konteks tempatan.', action: 'Tambah data terkini dan justifikasi.', due: addDays(5), status: 'Dalam tindakan' }],
  draftHistory: [{ id: uid(), draft: 17, date: iso(), focus: 'Problem Statement', pages: 2, note: 'Kemas isu dan jurang kajian.' }],
  experts: [{ id: uid(), name: 'Expert 01', institution: 'PBT / Universiti', expertise: 'BIM e-Submission', email: '', status: 'Belum dihubungi', phase: 'Fuzzy Delphi' }],
  publications: [{ id: uid(), title: 'BIM e-Submission Framework for Malaysian Local Authorities', outlet: 'Target journal', due: addDays(90), status: 'Drafting', progress: 20 }],
  researchPhases: [
    { id: uid(), name: 'Fasa 1 — Temu bual & analisis dokumen', current: 8, target: 20, progress: 40 },
    { id: uid(), name: 'Fasa 2 — Soal selidik', current: 0, target: 120, progress: 0 },
    { id: uid(), name: 'Fasa 3 — Fuzzy Delphi', current: 0, target: 15, progress: 0 },
    { id: uid(), name: 'Fasa 4 — FGD Validasi', current: 0, target: 10, progress: 0 },
  ],
  analysis: [
    { id: uid(), name: 'Analisis dokumen', progress: 60 },
    { id: uid(), name: 'Transkripsi & coding', progress: 30 },
    { id: uid(), name: 'Pembangunan tema', progress: 20 },
    { id: uid(), name: 'Fuzzy Delphi', progress: 0 },
    { id: uid(), name: 'FGD validasi', progress: 0 },
  ],
  weekly: { week: 'Minggu semasa', draftPages: 5, draftTarget: 8, articles: 3, articleTarget: 5, writingHours: 12, writingTarget: 20, tm168: false, fow: '', fod: '' },
  monthly: { month: new Date().toLocaleString('ms-MY', { month: 'long', year: 'numeric' }), targets: [
    { id: uid(), name: 'Bab 3 Draft', progress: 60 },
    { id: uid(), name: 'Pengumpulan Data', progress: 40 },
    { id: uid(), name: 'Analisis Data', progress: 20 },
    { id: uid(), name: 'Artikel Jurnal', progress: 10 },
  ]},
  settings: { theme: 'light', compact: false, showGraphics: true },
}

function loadData() {
  try { return { ...defaultData, ...JSON.parse(localStorage.getItem(APP_KEY) || '{}') } }
  catch { return defaultData }
}

function Ring({ value, label, size = 108, stroke = 10 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return <div className="ring" style={{ width: size, height: size }}>
    <svg viewBox={`0 0 ${size} ${size}`}><circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/><circle className="ring-value" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c - c * value / 100}/></svg>
    <div className="ring-label"><strong>{value}%</strong><small>{label}</small></div>
  </div>
}

function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className={`modal ${wide ? 'modal-wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>{children}
  </div></div>
}

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }

function App() {
  const [data, setData] = useState(loadData)
  const [page, setPage] = useState('dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [drive, setDrive] = useState({ token: '', fileId: '', profile: null, syncing: false, lastSync: '' })
  const tokenClientRef = useRef(null)

  useEffect(() => { localStorage.setItem(APP_KEY, JSON.stringify(data)) }, [data])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 3000); return () => clearTimeout(t) } }, [toast])
  useEffect(() => { document.documentElement.dataset.theme = data.settings.theme }, [data.settings.theme])

  const update = (key, value) => setData(d => ({ ...d, [key]: typeof value === 'function' ? value(d[key]) : value }))
  const targetDays = daysBetween(data.profile.targetDate)
  const elapsedDays = Math.max(0, Math.ceil((new Date() - new Date(data.profile.startDate)) / 86400000))
  const journeyTotal = Math.max(1, Math.ceil((new Date(data.profile.targetDate) - new Date(data.profile.startDate)) / 86400000))
  const gbtProgress = Math.min(100, Math.max(0, Math.round(elapsedDays / journeyTotal * 100)))
  const draftProgress = pct(data.profile.currentDraft, data.profile.draftGoal)
  const todayTasks = data.tasks.filter(t => t.date === iso())
  const todayEvents = data.events.filter(e => e.date === iso()).sort((a,b) => a.start.localeCompare(b.start))
  const weeklyProgress = Math.round((pct(data.weekly.draftPages, data.weekly.draftTarget) + pct(data.weekly.articles, data.weekly.articleTarget) + pct(data.weekly.writingHours, data.weekly.writingTarget)) / 3)

  const showToast = (msg) => setToast(msg)

  const initGoogleClient = (callback) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) { setModal('google-help'); return }
    if (!window.google?.accounts?.oauth2) { showToast('Google Identity belum siap. Cuba semula beberapa saat lagi.'); return }
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPE,
      callback: async (response) => {
        if (response.error) return showToast(`Google: ${response.error}`)
        const token = response.access_token
        let profile = null
        try { profile = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()) } catch {}
        setDrive(x => ({ ...x, token, profile }))
        callback?.(token)
      },
    })
    tokenClientRef.current.requestAccessToken({ prompt: drive.token ? '' : 'consent' })
  }

  async function findDriveFile(token) {
    const q = new URLSearchParams({ spaces: 'appDataFolder', q: `name='${DRIVE_FILE}' and trashed=false`, fields: 'files(id,name,modifiedTime)' })
    const r = await fetch(`https://www.googleapis.com/drive/v3/files?${q}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!r.ok) throw new Error('Tidak dapat mencari fail Google Drive.')
    const j = await r.json(); return j.files?.[0] || null
  }

  async function saveDrive(token = drive.token) {
    if (!token) return initGoogleClient(saveDrive)
    setDrive(x => ({ ...x, syncing: true }))
    try {
      const existing = await findDriveFile(token)
      const body = JSON.stringify({ ...data, meta: { savedAt: new Date().toISOString(), version: 1 } })
      let r
      if (existing) {
        r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body })
      } else {
        const boundary = 'strategisk_boundary'
        const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: DRIVE_FILE, parents: ['appDataFolder'], mimeType: 'application/json' })}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`
        r = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart })
      }
      if (!r.ok) throw new Error((await r.json().catch(() => null))?.error?.message || 'Sync Google Drive gagal.')
      const result = await r.json(); const now = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      setDrive(x => ({ ...x, fileId: result.id || existing?.id || '', syncing: false, lastSync: now }))
      showToast('Data berjaya disimpan ke Google Drive.')
    } catch (e) { setDrive(x => ({ ...x, syncing: false })); showToast(e.message) }
  }

  async function loadDrive(token = drive.token) {
    if (!token) return initGoogleClient(loadDrive)
    setDrive(x => ({ ...x, syncing: true }))
    try {
      const existing = await findDriveFile(token)
      if (!existing) throw new Error('Belum ada backup strategiSK dalam Google Drive.')
      const r = await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`, { headers: { Authorization: `Bearer ${token}` } })
      if (!r.ok) throw new Error('Gagal memuat turun data Google Drive.')
      const remote = await r.json(); delete remote.meta
      setData({ ...defaultData, ...remote })
      setDrive(x => ({ ...x, fileId: existing.id, syncing: false, lastSync: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) }))
      showToast('Data Google Drive berjaya dipulihkan.')
    } catch (e) { setDrive(x => ({ ...x, syncing: false })); showToast(e.message) }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `strategiSK-backup-${iso()}.json`; a.click(); URL.revokeObjectURL(a.href)
  }

  function importJson(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader(); reader.onload = () => { try { setData({ ...defaultData, ...JSON.parse(reader.result) }); showToast('Backup berjaya diimport.') } catch { showToast('Fail JSON tidak sah.') } }; reader.readAsText(file)
  }

  function composeDailySummary() {
    const done = todayTasks.filter(t => t.done).map(t => `✅ ${t.title}`).join('\n') || 'Belum ada task ditanda selesai.'
    const latestDiary = data.diary.find(d => d.date === iso())
    return `strategiSK — Laporan Harian ${new Date().toLocaleDateString('ms-MY')}\n\nDraft: ${data.profile.currentDraft}/${data.profile.draftGoal}\nGBT: ${gbtProgress}% | ${targetDays} hari berbaki\n\nTask selesai:\n${done}\n\nWin kecil: ${latestDiary?.win || '-'}\nFokus/Refleksi: ${latestDiary?.text || '-'}\n\nKonsisten • Komited • Konstruktif • Kreatif • Karismatik`
  }

  function sendWhatsApp() {
    const phone = data.profile.whatsapp.replace(/\D/g, '')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(composeDailySummary())}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function sendTelegram() {
    try {
      const r = await fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: data.profile.telegramChatId, text: composeDailySummary() }) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Gagal menghantar Telegram.')
      showToast('Laporan berjaya dihantar ke Telegram.')
    } catch (e) { showToast(e.message) }
  }

  const menu = [
    ['dashboard', Home, 'Dashboard'], ['calendar', CalendarDays, 'Kalendar & Diari'], ['draft', FileText, 'Draft 111 Tracker'],
    ['chapters', BookOpen, 'Chapter Tracker'], ['data', Database, 'Data Collection'], ['analysis', LineChart, 'Data Analysis'],
    ['experts', Users, 'Expert List'], ['publications', GraduationCap, 'Publication Tracker'], ['tasks', ListChecks, 'Task Assignment'],
    ['weekly', Target, 'Weekly / TM168 / FOW'], ['monthly', Flag, 'Monthly Target'], ['consultation', MessageCircle, 'SV Consultation'],
    ['settings', Settings, 'Settings'],
  ]

  const title = menu.find(m => m[0] === page)?.[2] || 'Dashboard'

  return <div className={`app ${data.settings.compact ? 'compact' : ''}`}>
    <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
      <div className="brand"><div className="brand-shield">SK</div><div><div className="brand-name">strategi<span>SK</span></div><div className="brand-tag">{data.profile.tagline}</div></div></div>
      <nav>{menu.map(([id, Icon, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setSidebar(false) }}><Icon size={18}/><span>{label}</span></button>)}</nav>
      <div className="side-progress"><div className="side-progress-head"><span>GBT PROGRESS</span><ChevronRight size={18}/></div><Ring value={gbtProgress} label="perjalanan" size={104}/><div className="side-stat"><span>Target GBT</span><b>30 bulan</b></div><div className="side-stat"><span>Hari berbaki</span><b>{targetDays}</b></div><button className="primary full" onClick={() => setModal('progress')}><Gauge size={16}/> Lihat Butiran</button><Rocket className="side-rocket" size={46}/></div>
    </aside>
    {sidebar && <div className="sidebar-scrim" onClick={() => setSidebar(false)}/>} 

    <main>
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setSidebar(true)}><Menu/></button>
        <div className="welcome"><h1>{page === 'dashboard' ? <>Selamat kembali, <span>{data.profile.name}</span> 👋</> : title}</h1><p>{page === 'dashboard' ? `Anda berada pada Hari ke-${Math.max(1, elapsedDays)} perjalanan PhD GBT anda` : 'Urus, pantau dan kemas kini rekod anda.'}</p></div>
        <div className="top-actions"><button className="icon-btn" onClick={() => update('settings', s => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}>{data.settings.theme === 'dark' ? <Sun/> : <Moon/>}</button><button className="drive-button" onClick={() => drive.token ? saveDrive() : initGoogleClient()}><Cloud size={18}/><span>{drive.syncing ? 'Menyimpan...' : drive.profile ? 'Sync Drive' : 'Sambung Drive'}</span></button><button className="avatar"><CircleUserRound/><span>{drive.profile?.given_name || data.profile.name.split(' ')[0]}</span></button></div>
      </header>

      <section className="content">
        {page === 'dashboard' && <Dashboard data={data} update={update} setModal={setModal} targetDays={targetDays} gbtProgress={gbtProgress} draftProgress={draftProgress} todayTasks={todayTasks} todayEvents={todayEvents} weeklyProgress={weeklyProgress}/>} 
        {page === 'calendar' && <CalendarPage data={data} update={update} setModal={setModal}/>} 
        {page === 'draft' && <DraftPage data={data} update={update} setModal={setModal}/>} 
        {page === 'chapters' && <SimpleProgressPage title="Chapter Tracker" items={data.chapters} setItems={(v)=>update('chapters',v)} nameKey="name"/>}
        {page === 'data' && <ResearchDataPage data={data} update={update}/>} 
        {page === 'analysis' && <SimpleProgressPage title="Data Analysis" items={data.analysis} setItems={(v)=>update('analysis',v)} nameKey="name"/>}
        {page === 'experts' && <ExpertsPage data={data} update={update}/>} 
        {page === 'publications' && <PublicationsPage data={data} update={update}/>} 
        {page === 'tasks' && <TasksPage data={data} update={update}/>} 
        {page === 'weekly' && <WeeklyPage data={data} update={update}/>} 
        {page === 'monthly' && <MonthlyPage data={data} update={update}/>} 
        {page === 'consultation' && <ConsultationPage data={data} update={update}/>} 
        {page === 'settings' && <SettingsPage data={data} update={update} drive={drive} saveDrive={saveDrive} loadDrive={loadDrive} exportJson={exportJson} importJson={importJson} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram}/>} 
      </section>
    </main>

    <nav className="mobile-nav">{[['dashboard',Home,'Home'],['calendar',CalendarDays,'Kalendar'],['draft',FileText,'Draft'],['weekly',Target,'Weekly'],['settings',Settings,'More']].map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>

    {toast && <div className="toast"><Check size={18}/>{toast}</div>}
    {modal === 'task' && <TaskModal data={data} update={update} close={()=>setModal(null)}/>} 
    {modal === 'event' && <EventModal data={data} update={update} close={()=>setModal(null)}/>} 
    {modal === 'diary' && <DiaryModal data={data} update={update} close={()=>setModal(null)}/>} 
    {modal === 'draft' && <DraftModal data={data} update={update} close={()=>setModal(null)}/>} 
    {modal === 'countdown' && <CountdownModal data={data} update={update} close={()=>setModal(null)}/>} 
    {modal === 'progress' && <ProgressModal data={data} gbtProgress={gbtProgress} draftProgress={draftProgress} targetDays={targetDays} close={()=>setModal(null)}/>} 
    {modal === 'google-help' && <Modal title="Sediakan Google Drive Sync" onClose={()=>setModal(null)}><div className="help-text"><p>Masukkan Google OAuth Web Client ID sebagai environment variable:</p><code>VITE_GOOGLE_CLIENT_ID</code><p>Enable <b>Google Drive API</b>, tambah domain Vercel sebagai Authorized JavaScript Origin, kemudian redeploy.</p><p>App menggunakan scope <code>drive.appdata</code> supaya hanya fail data strategiSK boleh diakses.</p></div></Modal>}
  </div>
}

function Dashboard({ data, update, setModal, targetDays, gbtProgress, draftProgress, todayTasks, todayEvents, weeklyProgress }) {
  const longTarget = { label: 'GBT Target — 2.5 Tahun', date: data.profile.targetDate, type: 'long' }
  const countdowns = [...data.countdowns.slice(0,3), longTarget]
  return <>
    <div className="section-title"><div><h2>DAYS REMAINING</h2><p>Pelbagai sasaran jangka pendek hingga GBT</p></div><button className="soft-btn" onClick={()=>setModal('countdown')}><Target size={16}/> Urus Sasaran</button></div>
    <div className="countdown-grid">{countdowns.map((c,i)=><div key={c.id||'long'} className={`countdown-card ${c.type}`}><div><span>{c.type === 'short' ? 'SHORT TERM' : c.type === 'mid' ? 'MID TERM' : 'LONG TERM'}</span><h3>{c.label}</h3><strong>{daysBetween(c.date)} <small>Hari Lagi</small></strong><p><CalendarDays size={14}/> {new Date(c.date+'T00:00').toLocaleDateString('ms-MY',{day:'numeric',month:'short',year:'numeric'})}</p></div>{i===0?<CalendarDays/>:i===1?<Edit3/>:i===2?<Users/>:<Rocket/>}</div>)}</div>

    <div className="dashboard-grid">
      <div className="card timeline-card span-2"><CardTitle title="Timeline 2.5 Tahun" icon={<Trophy/>}/><Timeline gbtProgress={gbtProgress}/></div>
      <div className="card"><CardTitle title="Progress Chapter" icon={<BookOpen/>}/><ProgressList items={data.chapters}/></div>
      <div className="card schedule-card"><CardTitle title="Today's Schedule & Diari" icon={<CalendarDays/>}/><p className="muted">{new Date().toLocaleDateString('ms-MY',{weekday:'long',day:'numeric',month:'long'})}</p><div className="schedule-list">{todayEvents.map(e=><div key={e.id} className={`schedule ${e.type}`}><b>{e.start}–{e.end}</b><span>{e.title}</span></div>)}</div><button className="link-btn" onClick={()=>setModal('event')}>Tambah aktiviti <Plus size={15}/></button></div>
      <div className="card draft-card"><CardTitle title="Draft 111 Tracker" icon={<LineChart/>}/><Ring value={draftProgress} label={`${data.profile.currentDraft}/111`} size={130}/><div className="metric-label">Current Draft <b>{String(data.profile.currentDraft).padStart(3,'0')}</b></div><button className="primary full" onClick={()=>setModal('draft')}><Edit3 size={16}/> Update Draft</button></div>
      <div className="card"><CardTitle title="Progres Pengumpulan Data" icon={<Database/>}/><div className="split-chart"><Ring value={Math.round(data.researchPhases.reduce((s,x)=>s+x.progress,0)/data.researchPhases.length)} label="selesai" size={104}/><ProgressList items={data.researchPhases} compact/></div></div>
      <div className="card"><CardTitle title="Progres Analisis Data" icon={<LineChart/>}/><RadarMini items={data.analysis}/></div>
      <div className="card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="split-chart"><Ring value={weeklyProgress} label="selesai" size={104}/><div className="mini-list"><span>Draft <b>{data.weekly.draftPages}/{data.weekly.draftTarget} ms</b></span><span>Reading <b>{data.weekly.articles}/{data.weekly.articleTarget} artikel</b></span><span>Writing <b>{data.weekly.writingHours}/{data.weekly.writingTarget} jam</b></span><span>TM168 <b>{data.weekly.tm168?'Selesai':'Belum'}</b></span></div></div></div>
      <div className="card mountain-card"><CardTitle title="Monthly Target" icon={<Flag/>}/><ProgressList items={data.monthly.targets}/><div className="mountain"><Flag/></div></div>
      <div className="card"><CardTitle title="Daily Diary" icon={<BookOpen/>}/><DiarySnippet diary={data.diary.find(d=>d.date===iso())}/><button className="link-btn" onClick={()=>setModal('diary')}>Tulis diari <Edit3 size={15}/></button></div>
      <div className="card win-card"><CardTitle title="Today's Win" icon={<Trophy/>}/><p>{data.diary.find(d=>d.date===iso())?.win || 'Belum catat win kecil hari ini.'}</p><Sparkles size={48}/></div>
      <div className="card"><CardTitle title="SV Consultation Terkini" icon={<MessageCircle/>}/>{data.consultations[0] ? <div className="consult-mini"><b>{data.consultations[0].topic}</b><p>{data.consultations[0].comment}</p><small>Tindakan: {data.consultations[0].action}</small></div>:<p className="muted">Belum ada rekod.</p>}</div>
      <div className="card span-2"><CardTitle title="Today's Tasks" icon={<ListChecks/>}/><div className="task-list">{todayTasks.map(t=><label key={t.id} className="task-row"><input type="checkbox" checked={t.done} onChange={()=>update('tasks',xs=>xs.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span className={t.done?'done':''}>{t.title}</span><small>{t.category}</small></label>)}</div><button className="link-btn" onClick={()=>setModal('task')}>Tambah tugasan <Plus size={15}/></button></div>
    </div>
  </>
}

function CardTitle({ title, icon }) { return <div className="card-title"><h3>{title}</h3><span>{React.cloneElement(icon,{size:18})}</span></div> }
function ProgressList({ items, compact=false }) { return <div className={`progress-list ${compact?'compact-list':''}`}>{items.map(x=><div key={x.id}><div><span>{x.name}</span><b>{x.progress}%</b></div><div className="bar"><i style={{width:`${x.progress}%`}}/></div></div>)}</div> }
function Timeline({ gbtProgress }) { const stages=[['Asas','0–6 bln'],['Pembangunan','7–12 bln'],['Data','13–18 bln'],['Analisis','19–24 bln'],['Penulisan','25–27 bln'],['Peringkat Akhir','28–30 bln']]; return <div className="timeline"><div className="timeline-track"><i style={{width:`${gbtProgress}%`}}/>{stages.map((s,i)=><div key={s[0]} className={`timeline-node ${gbtProgress>=i*20?'reached':''}`}><span>{i+1}</span><b>{s[0]}</b><small>{s[1]}</small></div>)}</div><svg className="wave" viewBox="0 0 600 110" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cf0a4e" stopOpacity=".24"/><stop offset="1" stopColor="#cf0a4e" stopOpacity="0"/></linearGradient></defs><path d="M0,80 C70,12 120,82 180,48 C250,5 310,90 370,45 C435,-5 505,80 600,30 L600,110 L0,110 Z" fill="url(#fill)"/><path d="M0,80 C70,12 120,82 180,48 C250,5 310,90 370,45 C435,-5 505,80 600,30" fill="none" stroke="#cf0a4e" strokeWidth="3"/></svg></div> }
function RadarMini({ items }) { const vals=items.slice(0,5).map(x=>x.progress); const pts=vals.map((v,i)=>{const a=-Math.PI/2+i*2*Math.PI/5,r=45*(.2+.8*v/100);return `${60+Math.cos(a)*r},${60+Math.sin(a)*r}`}).join(' '); return <div className="radar-wrap"><svg viewBox="0 0 120 120" className="radar">{[20,35,50].map(r=><polygon key={r} points={[0,1,2,3,4].map(i=>{const a=-Math.PI/2+i*2*Math.PI/5;return `${60+Math.cos(a)*r},${60+Math.sin(a)*r}`}).join(' ')}/>) }<polygon className="radar-value" points={pts}/></svg><ProgressList items={items} compact/></div> }
function DiarySnippet({ diary }) { return diary ? <div className="diary-snippet"><p><b>Fokus:</b> {diary.text}</p><p><b>Win:</b> {diary.win}</p><div className="mood">Mood {'●'.repeat(diary.mood)}{'○'.repeat(5-diary.mood)}</div></div>:<p className="muted">Belum ada catatan hari ini.</p> }

function CalendarPage({ data, update, setModal }) {
  const [selected,setSelected]=useState(iso())
  const [month,setMonth]=useState(new Date())
  const days=useMemo(()=>{const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0);const arr=[];for(let i=0;i<(first.getDay()+6)%7;i++)arr.push(null);for(let d=1;d<=last.getDate();d++)arr.push(new Date(y,m,d));return arr},[month])
  const selectedEvents=data.events.filter(e=>e.date===selected)
  const selectedDiary=data.diary.find(d=>d.date===selected)
  return <div className="page-grid"><div className="card calendar-full"><div className="calendar-head"><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{month.toLocaleDateString('ms-MY',{month:'long',year:'numeric'})}</h2><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div><div className="weekdays">{['Isn','Sel','Rab','Kha','Jum','Sab','Aha'].map(x=><b key={x}>{x}</b>)}</div><div className="month-grid">{days.map((d,i)=>d?<button key={i} className={`${iso(d)===selected?'selected':''} ${iso(d)===iso()?'today':''}`} onClick={()=>setSelected(iso(d))}><span>{d.getDate()}</span>{data.events.some(e=>e.date===iso(d))&&<i/>}{data.diary.some(e=>e.date===iso(d))&&<em/>}</button>:<div key={i}/>)}</div></div><div className="card day-panel"><CardTitle title="Kalendar & Diari" icon={<CalendarDays/>}/><h2>{new Date(selected+'T00:00').toLocaleDateString('ms-MY',{weekday:'long',day:'numeric',month:'long'})}</h2><div className="schedule-list">{selectedEvents.map(e=><div key={e.id} className={`schedule ${e.type}`}><b>{e.start}–{e.end}</b><span>{e.title}</span></div>)}</div>{selectedDiary&&<DiarySnippet diary={selectedDiary}/>}<div className="button-row"><button className="primary" onClick={()=>setModal('event')}><Plus/> Aktiviti</button><button className="secondary" onClick={()=>setModal('diary')}><Edit3/> Diari</button></div></div></div>
}

function DraftPage({ data, update, setModal }) { return <div><div className="hero-stat card"><Ring value={pct(data.profile.currentDraft,data.profile.draftGoal)} label="Draft 111" size={160}/><div><span className="eyebrow">CURRENT DRAFT</span><h2>{String(data.profile.currentDraft).padStart(3,'0')} / {data.profile.draftGoal}</h2><p>Naik draft secara konsisten setiap minggu. Rekodkan fokus, bilangan muka surat dan perubahan utama.</p><button className="primary" onClick={()=>setModal('draft')}><Plus/> Naik Draft</button></div></div><div className="card table-card"><CardTitle title="Sejarah Draft" icon={<FileText/>}/><table><thead><tr><th>Draft</th><th>Tarikh</th><th>Fokus</th><th>Muka surat</th><th>Catatan</th></tr></thead><tbody>{[...data.draftHistory].sort((a,b)=>b.draft-a.draft).map(x=><tr key={x.id}><td><b>#{String(x.draft).padStart(3,'0')}</b></td><td>{x.date}</td><td>{x.focus}</td><td>{x.pages}</td><td>{x.note}</td></tr>)}</tbody></table></div></div> }

function SimpleProgressPage({ title,items,setItems,nameKey }) { const add=()=>setItems([...items,{id:uid(),[nameKey]:'Item baharu',progress:0}]); return <div className="card editable-list"><div className="section-title"><div><h2>{title}</h2><p>Klik nama atau progress untuk ubah suai.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{items.map(x=><div className="edit-progress" key={x.id}><input value={x[nameKey]} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,[nameKey]:e.target.value}:i))}/><input type="range" min="0" max="100" value={x.progress} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>setItems(items.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div> }
function ResearchDataPage({data,update}) { return <div className="page-grid"><div className="card"><CardTitle title="Fasa Kajian" icon={<Database/>}/>{data.researchPhases.map(x=><div className="phase-editor" key={x.id}><input value={x.name} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/><div><Field label="Semasa"><input type="number" value={x.current} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,current:+e.target.value,progress:pct(+e.target.value,i.target)}:i))}/></Field><Field label="Sasaran"><input type="number" value={x.target} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,target:+e.target.value,progress:pct(i.current,+e.target.value)}:i))}/></Field></div><div className="bar"><i style={{width:`${x.progress}%`}}/></div></div>)}</div><div className="card"><CardTitle title="Ringkasan Visual" icon={<BarChart3/>}/><div className="big-bars">{data.researchPhases.map(x=><div key={x.id}><span>{x.name}</span><div><i style={{height:`${Math.max(8,x.progress*1.8)}px`}}/><b>{x.progress}%</b></div></div>)}</div></div></div> }

function ExpertsPage({data,update}) { const add=()=>update('experts',xs=>[...xs,{id:uid(),name:'',institution:'',expertise:'',email:'',status:'Belum dihubungi',phase:'Fuzzy Delphi'}]); return <div className="card table-card"><div className="section-title"><div><h2>Expert List</h2><p>Pantau jemputan, kepakaran dan fasa penglibatan expert.</p></div><button className="primary" onClick={add}><Plus/> Tambah Expert</button></div><div className="responsive-table"><table><thead><tr><th>Nama</th><th>Institusi</th><th>Kepakaran</th><th>Emel</th><th>Status</th><th>Fasa</th></tr></thead><tbody>{data.experts.map(x=><tr key={x.id}>{['name','institution','expertise','email'].map(k=><td key={k}><input value={x[k]} onChange={e=>update('experts',xs=>xs.map(i=>i.id===x.id?{...i,[k]:e.target.value}:i))}/></td>)}<td><select value={x.status} onChange={e=>update('experts',xs=>xs.map(i=>i.id===x.id?{...i,status:e.target.value}:i))}><option>Belum dihubungi</option><option>Jemputan dihantar</option><option>Setuju</option><option>Selesai</option><option>Tolak</option></select></td><td><input value={x.phase} onChange={e=>update('experts',xs=>xs.map(i=>i.id===x.id?{...i,phase:e.target.value}:i))}/></td></tr>)}</tbody></table></div></div> }
function PublicationsPage({data,update}) { const add=()=>update('publications',xs=>[...xs,{id:uid(),title:'Artikel baharu',outlet:'',due:addDays(60),status:'Idea',progress:0}]); return <div className="card"><div className="section-title"><div><h2>Publication Tracker</h2><p>Rancang tarikh submit dan pantau status penerbitan.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{data.publications.map(x=><div className="publication" key={x.id}><div><input className="title-input" value={x.title} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input value={x.outlet} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,outlet:e.target.value}:i))}/></div><input type="date" value={x.due} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,due:e.target.value}:i))}/><select value={x.status} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,status:e.target.value}:i))}><option>Idea</option><option>Drafting</option><option>Submitted</option><option>Revision</option><option>Accepted</option><option>Published</option></select><input type="range" min="0" max="100" value={x.progress} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b></div>)}</div> }
function TasksPage({data,update}) { const [filter,setFilter]=useState('all'); const items=data.tasks.filter(t=>filter==='all'||filter==='done'?filter==='all'||t.done:!t.done); return <div className="card"><div className="section-title"><div><h2>Task Assignment</h2><p>Urus task thesis, Dr Roket dan urusan penyelidikan.</p></div><button className="primary" onClick={()=>update('tasks',xs=>[...xs,{id:uid(),title:'Tugasan baharu',date:iso(),done:false,category:'Thesis'}])}><Plus/> Tambah</button></div><div className="chips"><button onClick={()=>setFilter('all')} className={filter==='all'?'active':''}>Semua</button><button onClick={()=>setFilter('open')} className={filter==='open'?'active':''}>Belum siap</button><button onClick={()=>setFilter('done')} className={filter==='done'?'active':''}>Selesai</button></div>{items.map(x=><div className="task-editor" key={x.id}><input type="checkbox" checked={x.done} onChange={()=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,done:!i.done}:i))}/><input value={x.title} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input type="date" value={x.date} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,date:e.target.value}:i))}/><input value={x.category} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,category:e.target.value}:i))}/><button className="icon-btn danger" onClick={()=>update('tasks',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div> }
function WeeklyPage({data,update}) { const w=data.weekly; const set=(k,v)=>update('weekly',{...w,[k]:v}); return <div className="page-grid"><div className="card form-card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="form-grid"><Field label="Muka surat siap / sasaran"><div className="inline-input"><input type="number" value={w.draftPages} onChange={e=>set('draftPages',+e.target.value)}/><span>/</span><input type="number" value={w.draftTarget} onChange={e=>set('draftTarget',+e.target.value)}/></div></Field><Field label="Artikel dibaca / sasaran"><div className="inline-input"><input type="number" value={w.articles} onChange={e=>set('articles',+e.target.value)}/><span>/</span><input type="number" value={w.articleTarget} onChange={e=>set('articleTarget',+e.target.value)}/></div></Field><Field label="Jam menulis / sasaran"><div className="inline-input"><input type="number" value={w.writingHours} onChange={e=>set('writingHours',+e.target.value)}/><span>/</span><input type="number" value={w.writingTarget} onChange={e=>set('writingTarget',+e.target.value)}/></div></Field><label className="check-card"><input type="checkbox" checked={w.tm168} onChange={e=>set('tm168',e.target.checked)}/><span><b>TM168 Mingguan</b><small>Tandakan selepas selesai diisi.</small></span></label></div></div><div className="card form-card"><CardTitle title="FOW & FOD" icon={<Zap/>}/><Field label="Focus of the Week (FOW)"><textarea rows="7" value={w.fow} onChange={e=>set('fow',e.target.value)} placeholder="Senaraikan fokus utama minggu ini..."/></Field><Field label="Focus of the Day (FOD)"><textarea rows="7" value={w.fod} onChange={e=>set('fod',e.target.value)} placeholder="Tulis fokus hari ini..."/></Field></div></div> }
function MonthlyPage({data,update}) { return <SimpleProgressPage title="Monthly Target" items={data.monthly.targets} setItems={v=>update('monthly',{...data.monthly,targets:v})} nameKey="name"/> }
function ConsultationPage({data,update}) { const add=()=>update('consultations',xs=>[{id:uid(),date:iso(),topic:'',comment:'',action:'',due:addDays(7),status:'Dalam tindakan'},...xs]); return <div className="card"><div className="section-title"><div><h2>SV Consultation Log</h2><p>Rekod perbincangan, komen, tindakan dan due date.</p></div><button className="primary" onClick={add}><Plus/> Tambah Log</button></div>{data.consultations.map(x=><div className="consult-editor" key={x.id}><input type="date" value={x.date} onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,date:e.target.value}:i))}/><input value={x.topic} placeholder="Topik" onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,topic:e.target.value}:i))}/><textarea value={x.comment} placeholder="Komen SV" onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,comment:e.target.value}:i))}/><textarea value={x.action} placeholder="Tindakan susulan" onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,action:e.target.value}:i))}/><input type="date" value={x.due} onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,due:e.target.value}:i))}/><select value={x.status} onChange={e=>update('consultations',xs=>xs.map(i=>i.id===x.id?{...i,status:e.target.value}:i))}><option>Dalam tindakan</option><option>Selesai</option><option>Tertangguh</option></select></div>)}</div> }

function SettingsPage({data,update,drive,saveDrive,loadDrive,exportJson,importJson,sendWhatsApp,sendTelegram}) { const p=data.profile; const setP=(k,v)=>update('profile',{...p,[k]:v}); return <div className="settings-grid"><div className="card form-card"><CardTitle title="Profil & Sasaran GBT" icon={<Settings/>}/><Field label="Nama"><input value={p.name} onChange={e=>setP('name',e.target.value)}/></Field><Field label="Tagline"><input value={p.tagline} onChange={e=>setP('tagline',e.target.value)}/></Field><div className="form-grid"><Field label="Tarikh mula PhD"><input type="date" value={p.startDate} onChange={e=>setP('startDate',e.target.value)}/></Field><Field label="Target GBT"><input type="date" value={p.targetDate} onChange={e=>setP('targetDate',e.target.value)}/></Field><Field label="Draft semasa"><input type="number" value={p.currentDraft} onChange={e=>setP('currentDraft',+e.target.value)}/></Field><Field label="Sasaran draft"><input type="number" value={p.draftGoal} onChange={e=>setP('draftGoal',+e.target.value)}/></Field></div></div><div className="card form-card"><CardTitle title="Google Drive Personal" icon={<Cloud/>}/><div className={`connection ${drive.profile?'connected':''}`}><Cloud size={28}/><div><b>{drive.profile ? `Disambung: ${drive.profile.email}` : 'Belum disambung'}</b><small>{drive.lastSync ? `Sync terakhir ${drive.lastSync}` : 'Data kekal dalam browser sehingga anda sync.'}</small></div></div><div className="button-row"><button className="primary" onClick={saveDrive}><CloudUpload/> Simpan ke Drive</button><button className="secondary" onClick={loadDrive}><CloudDownload/> Pulihkan dari Drive</button></div><p className="hint">Fail disimpan sebagai data aplikasi tersembunyi dan hanya strategiSK boleh mengaksesnya.</p></div><div className="card form-card"><CardTitle title="WhatsApp & Telegram" icon={<Send/>}/><Field label="Nombor WhatsApp (format 6012...)"><input value={p.whatsapp} onChange={e=>setP('whatsapp',e.target.value)} placeholder="60123456789"/></Field><Field label="Telegram Chat ID"><input value={p.telegramChatId} onChange={e=>setP('telegramChatId',e.target.value)} placeholder="123456789"/></Field><div className="button-row"><button className="whatsapp" onClick={sendWhatsApp}><MessageCircle/> Buka WhatsApp</button><button className="telegram" onClick={sendTelegram}><Send/> Auto-hantar Telegram</button></div><p className="hint">WhatsApp personal membuka mesej siap diisi untuk anda tekan Send. Auto-send WhatsApp memerlukan WhatsApp Business Cloud API. Telegram boleh auto-send selepas token bot diset dalam Vercel.</p></div><div className="card form-card"><CardTitle title="Paparan & Backup" icon={<Download/>}/><label className="check-card"><input type="checkbox" checked={data.settings.compact} onChange={e=>update('settings',{...data.settings,compact:e.target.checked})}/><span><b>Compact dashboard</b><small>Kurangkan jarak kad untuk skrin kecil.</small></span></label><label className="check-card"><input type="checkbox" checked={data.settings.showGraphics} onChange={e=>update('settings',{...data.settings,showGraphics:e.target.checked})}/><span><b>Elemen grafik</b><small>Papar chart, mountain dan ilustrasi.</small></span></label><div className="button-row"><button className="secondary" onClick={exportJson}><Download/> Export JSON</button><label className="secondary file-button"><Upload/> Import JSON<input type="file" accept="application/json" onChange={importJson}/></label><button className="danger-btn" onClick={()=>{if(confirm('Reset semua data?')){localStorage.removeItem(APP_KEY);location.reload()}}}><RotateCcw/> Reset</button></div></div></div> }

function TaskModal({data,update,close}) { const [x,setX]=useState({title:'',date:iso(),category:'Thesis'}); return <Modal title="Tambah Tugasan" onClose={close}><Field label="Tugasan"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Kategori"><input value={x.category} onChange={e=>setX({...x,category:e.target.value})}/></Field><button className="primary full" onClick={()=>{if(x.title.trim())update('tasks',xs=>[...xs,{...x,id:uid(),done:false}]);close()}}><Save/> Simpan</button></Modal> }
function EventModal({data,update,close}) { const [x,setX]=useState({title:'',date:iso(),start:'09:00',end:'10:00',type:'draft'}); return <Modal title="Tambah Aktiviti Kalendar" onClose={close}><Field label="Aktiviti"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><div className="form-grid"><Field label="Mula"><input type="time" value={x.start} onChange={e=>setX({...x,start:e.target.value})}/></Field><Field label="Tamat"><input type="time" value={x.end} onChange={e=>setX({...x,end:e.target.value})}/></Field></div><Field label="Jenis"><select value={x.type} onChange={e=>setX({...x,type:e.target.value})}><option value="draft">Draft</option><option value="sv">SV Consultation</option><option value="data">Data</option><option value="diary">Diari / Dr Roket</option></select></Field><button className="primary full" onClick={()=>{if(x.title.trim())update('events',xs=>[...xs,{...x,id:uid()}]);close()}}><Save/> Simpan</button></Modal> }
function DiaryModal({data,update,close}) { const old=data.diary.find(d=>d.date===iso())||{id:uid(),date:iso(),text:'',win:'',mood:4}; const [x,setX]=useState(old); return <Modal title="Daily Diary / TDR" onClose={close}><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Catatan, fokus dan refleksi"><textarea rows="6" value={x.text} onChange={e=>setX({...x,text:e.target.value})}/></Field><Field label="Win kecil hari ini"><input value={x.win} onChange={e=>setX({...x,win:e.target.value})}/></Field><Field label={`Mood / tenaga: ${x.mood}/5`}><input type="range" min="1" max="5" value={x.mood} onChange={e=>setX({...x,mood:+e.target.value})}/></Field><button className="primary full" onClick={()=>{update('diary',xs=>[...xs.filter(i=>i.date!==x.date),x]);close()}}><Save/> Simpan Diari</button></Modal> }
function DraftModal({data,update,close}) { const [x,setX]=useState({draft:data.profile.currentDraft+1,date:iso(),focus:'',pages:1,note:''}); return <Modal title="Naik Draft Thesis" onClose={close}><div className="form-grid"><Field label="Nombor Draft"><input type="number" value={x.draft} onChange={e=>setX({...x,draft:+e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field></div><Field label="Fokus / seksyen"><input value={x.focus} onChange={e=>setX({...x,focus:e.target.value})}/></Field><Field label="Muka surat ditambah / dibaiki"><input type="number" value={x.pages} onChange={e=>setX({...x,pages:+e.target.value})}/></Field><Field label="Catatan perubahan"><textarea rows="4" value={x.note} onChange={e=>setX({...x,note:e.target.value})}/></Field><button className="primary full" onClick={()=>{update('draftHistory',xs=>[...xs,{...x,id:uid()}]);update('profile',{...data.profile,currentDraft:x.draft});close()}}><Rocket/> Naik ke Draft {x.draft}</button></Modal> }
function CountdownModal({data,update,close}) { const [x,setX]=useState({label:'',date:addDays(7),type:'short',icon:'calendar'}); return <Modal title="Urus Days Remaining" onClose={close} wide><div className="countdown-manage">{data.countdowns.map(c=><div key={c.id}><input value={c.label} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,label:e.target.value}:i))}/><input type="date" value={c.date} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,date:e.target.value}:i))}/><select value={c.type} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,type:e.target.value}:i))}><option value="short">Short term</option><option value="mid">Mid term</option></select><b>{daysBetween(c.date)} hari</b><button className="icon-btn danger" onClick={()=>update('countdowns',xs=>xs.filter(i=>i.id!==c.id))}><Trash2/></button></div>)}</div><hr/><div className="countdown-add"><input placeholder="Nama sasaran" value={x.label} onChange={e=>setX({...x,label:e.target.value})}/><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/><select value={x.type} onChange={e=>setX({...x,type:e.target.value})}><option value="short">Short term</option><option value="mid">Mid term</option></select><button className="primary" onClick={()=>{if(x.label)update('countdowns',xs=>[...xs,{...x,id:uid()}]);setX({...x,label:''})}}><Plus/> Tambah</button></div></Modal> }
function ProgressModal({data,gbtProgress,draftProgress,targetDays,close}) { return <Modal title="Butiran Progress GBT" onClose={close} wide><div className="progress-overview"><Ring value={gbtProgress} label="GBT" size={150}/><Ring value={draftProgress} label="Draft 111" size={150}/><div className="big-number"><strong>{targetDays}</strong><span>hari berbaki</span></div></div><ProgressList items={data.chapters}/></Modal> }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
