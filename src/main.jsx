import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Cloud, CloudDownload, CloudUpload, Copy, Database, Edit3, FileImage, FileText, Flag,
  Gauge, GraduationCap, Home, ImagePlus, LineChart, ListChecks, Menu, MessageCircle, Moon,
  Plus, Rocket, Save, Send, Settings, Sparkles, Sun, Target, Trash2, Trophy, Users, X,
  Download, Upload, RotateCcw
} from 'lucide-react'
import './styles.css'

const APP_KEY = 'strategisk-phd-os-v2'
const DRIVE_FILE = 'strategiSK-data.json'
const LOCAL_UPDATED_KEY = 'strategisk-local-updated-at'
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
const iso = (date = new Date()) => { const d = new Date(date); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}` }
const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return iso(d) }
const addMonths = (date, n) => { const d = new Date(date + 'T00:00:00'); d.setMonth(d.getMonth() + n); return iso(d) }
const monthsBetween = (start, end) => { const a = new Date(start + 'T00:00:00'); const b = new Date(end + 'T00:00:00'); return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) }
const pct = (a, b) => b ? Math.min(100, Math.max(0, Math.round((a / b) * 100))) : 0
const daysBetween = (date) => Math.max(0, Math.ceil((new Date(date + 'T23:59:59') - new Date()) / 86400000))
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
const formatDate = (date, opts = { day:'numeric', month:'long', year:'numeric' }) => new Date(date + 'T00:00:00').toLocaleDateString('ms-MY', opts)

const defaultData = {
  profile: {
    name: 'Shahril Khairi', tagline: 'konsisten . komited . konstruktif . kreatif . karismatik',
    startDate: '2026-10-01', targetDate: '2029-03-31', currentDraft: 17, draftGoal: 111,
    whatsapp: '', telegramChatId: ''
  },
  countdowns: [
    { id: uid(), label: 'Hantar pembetulan SV', date: addDays(5), type: 'short' },
    { id: uid(), label: 'Naik Draft seterusnya', date: addDays(12), type: 'short' },
    { id: uid(), label: 'Fasa pengumpulan data', date: addDays(45), type: 'mid' },
  ],
  tasks: [
    { id: uid(), title: 'Naik Draft 017 — Problem Statement', date: iso(), done: true, category: 'Draft' },
    { id: uid(), title: 'Isi TDR harian', date: iso(), done: false, category: 'Dr Roket' },
    { id: uid(), title: 'Baca dan catat 2 artikel', date: iso(), done: false, category: 'Reading' },
  ],
  chapters: [
    { id: uid(), name: 'Bab 1 — Pengenalan', progress: 65 }, { id: uid(), name: 'Bab 2 — Sorotan Literatur', progress: 35 },
    { id: uid(), name: 'Bab 3 — Metodologi', progress: 20 }, { id: uid(), name: 'Bab 4 — Dapatan', progress: 0 },
    { id: uid(), name: 'Bab 5 — Perbincangan', progress: 0 }, { id: uid(), name: 'Bab 6 — Kesimpulan', progress: 0 },
  ],
  events: [
    { id: uid(), title: 'Konsultasi SV', date: iso(), start: '10:00', end: '11:00' },
    { id: uid(), title: 'Rancang carian expert', date: addDays(2), start: '14:00', end: '15:00' },
  ],
  diary: [{ id: uid(), date: iso(), reflection: 'Kemaskan problem statement dan kaitkan isu document-centric e-submission.', win: 'Berjaya naikkan satu versi draft.', mood: 4, image: '' }],
  consultations: [{ id: uid(), date: addDays(-2), topic: 'Problem Statement & Significance', comment: 'Strengthen gap dan konteks tempatan.', action: 'Tambah data terkini dan justifikasi.', status: 'Dalam tindakan', image: '' }],
  draftHistory: [{ id: uid(), draft: 17, date: iso(), focus: 'Problem Statement', pages: 2, note: 'Kemas isu dan jurang kajian.' }],
  experts: [{ id: uid(), name: 'Expert 01', institution: 'PBT / Universiti', expertise: 'BIM e-Submission', email: '', phone: '', notes: '', image: '', status: 'Belum dihubungi', phase: 'Fuzzy Delphi' }],
  publications: [{ id: uid(), title: 'BIM e-Submission Framework for Malaysian Local Authorities', outlet: 'Target journal', due: addDays(90), status: 'Drafting', progress: 20 }],
  researchPhases: [
    { id: uid(), name: 'Fasa 1 — Temu bual & analisis dokumen', current: 8, target: 20, progress: 40 },
    { id: uid(), name: 'Fasa 2 — Soal selidik', current: 0, target: 120, progress: 0 },
    { id: uid(), name: 'Fasa 3 — Fuzzy Delphi', current: 0, target: 15, progress: 0 },
    { id: uid(), name: 'Fasa 4 — FGD Validasi', current: 0, target: 10, progress: 0 },
  ],
  analysis: [
    { id: uid(), name: 'Analisis dokumen', progress: 60 }, { id: uid(), name: 'Transkripsi & coding', progress: 30 },
    { id: uid(), name: 'Pembangunan tema', progress: 20 }, { id: uid(), name: 'Fuzzy Delphi', progress: 0 }, { id: uid(), name: 'FGD validasi', progress: 0 },
  ],
  weekly: { draftPages: 5, draftTarget: 8, articles: 3, articleTarget: 5, writingHours: 12, writingTarget: 20, tm168: false, fow: '', fod: '' },
  messageTemplates: {
    fow: [
      { id: uid(), title: 'Pembuka FOW', text: 'Assalamualaikum Dr, izinkan saya berkongsi Focus of the Week saya.' },
      { id: uid(), title: 'Penutup FOW', text: 'Terima kasih Dr. Saya akan kemas kini progres pada hujung minggu.' },
    ],
    fod: [
      { id: uid(), title: 'Pembuka FOD', text: 'Assalamualaikum Dr, berikut ialah Focus of the Day saya hari ini.' },
      { id: uid(), title: 'Penutup FOD', text: 'Insya-Allah saya akan beri fokus untuk menyelesaikan sasaran hari ini.' },
    ],
  },
  monthly: { month: new Date().toLocaleString('ms-MY', { month: 'long', year: 'numeric' }), targets: [
    { id: uid(), name: 'Bab 3 Draft', progress: 60 }, { id: uid(), name: 'Pengumpulan Data', progress: 40 },
    { id: uid(), name: 'Analisis Data', progress: 20 }, { id: uid(), name: 'Artikel Jurnal', progress: 10 },
  ]},
  monthlyArchives: [],
  timeline: [
    { id: uid(), name: 'Asas & Proposal', startMonth: 0, duration: 6, progress: 55 },
    { id: uid(), name: 'Sorotan & Metodologi', startMonth: 4, duration: 8, progress: 35 },
    { id: uid(), name: 'Pengumpulan Data', startMonth: 12, duration: 6, progress: 10 },
    { id: uid(), name: 'Analisis Data', startMonth: 18, duration: 6, progress: 0 },
    { id: uid(), name: 'Penulisan Dapatan', startMonth: 22, duration: 5, progress: 0 },
    { id: uid(), name: 'Semakan, Viva & Pembetulan', startMonth: 27, duration: 3, progress: 0 },
  ],
  settings: { theme: 'light', compact: false, showGraphics: true },
}

function migrate(raw) {
  const merged = { ...defaultData, ...raw }
  merged.profile = { ...defaultData.profile, ...(raw.profile || {}) }
  merged.settings = { ...defaultData.settings, ...(raw.settings || {}) }
  merged.weekly = { ...defaultData.weekly, ...(raw.weekly || {}) }
  merged.messageTemplates = { ...defaultData.messageTemplates, ...(raw.messageTemplates || {}) }
  merged.monthlyArchives = raw.monthlyArchives || []
  merged.timeline = raw.timeline || defaultData.timeline
  merged.diary = (raw.diary || defaultData.diary).map(d => ({ image:'', ...d, reflection: d.reflection ?? d.text ?? '' }))
  merged.experts = (raw.experts || defaultData.experts).map(x => ({ phone:'', notes:'', image:'', ...x }))
  merged.consultations = (raw.consultations || defaultData.consultations).map(x => ({ image:'', ...x }))
  return merged
}
function loadData() { try { return migrate(JSON.parse(localStorage.getItem(APP_KEY) || localStorage.getItem('strategisk-phd-os-v1') || '{}')) } catch { return defaultData } }

function Ring({ value, label, size = 108, stroke = 10 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return <div className="ring" style={{ width:size, height:size }}><svg viewBox={`0 0 ${size} ${size}`}><circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/><circle className="ring-value" cx={size/2} cy={size/2} r={r} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c-c*value/100}/></svg><div className="ring-label"><strong>{value}%</strong><small>{label}</small></div></div>
}
function Modal({ title, children, onClose, wide=false }) { return <div className="modal-backdrop" onMouseDown={onClose}><div className={`modal ${wide?'modal-wide':''}`} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>{children}</div></div> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }
function CardTitle({ title, icon }) { return <div className="card-title"><h3>{title}</h3><span>{React.cloneElement(icon,{size:18})}</span></div> }
function ProgressList({ items, compact=false }) { return <div className={`progress-list ${compact?'compact-list':''}`}>{items.map(x=><div key={x.id}><div><span>{x.name}</span><b>{x.progress}%</b></div><div className="bar"><i style={{width:`${x.progress}%`}}/></div></div>)}</div> }
function statusClass(status) { return status === 'Selesai' ? 'status-done' : status === 'Tertangguh' ? 'status-pending' : 'status-action' }

function App() {
  const [data,setData]=useState(loadData), [page,setPage]=useState('dashboard'), [sidebar,setSidebar]=useState(false)
  const [modal,setModal]=useState(null), [editingDraft,setEditingDraft]=useState(null), [toast,setToast]=useState('')
  const [drive,setDrive]=useState({token:'',fileId:'',profile:null,syncing:false,lastSync:'',scopeOk:false,apiOk:false,fileStatus:'Belum diperiksa',lastError:'',grantedScopes:''})
  const tokenClientRef=useRef(null)
  useEffect(()=>localStorage.setItem(APP_KEY,JSON.stringify(data)),[data])
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t)}},[toast])
  useEffect(()=>{document.documentElement.dataset.theme=data.settings.theme},[data.settings.theme])
  const markLocalChanged=()=>localStorage.setItem(LOCAL_UPDATED_KEY,new Date().toISOString())
  const update=(key,value)=>{markLocalChanged();setData(d=>({...d,[key]:typeof value==='function'?value(d[key]):value}))}
  const showToast=(m)=>setToast(m)
  const elapsedDays=Math.max(0,Math.ceil((new Date()-new Date(data.profile.startDate))/86400000))
  const journeyTotal=Math.max(1,Math.ceil((new Date(data.profile.targetDate)-new Date(data.profile.startDate))/86400000))
  const gbtProgress=Math.min(100,Math.max(0,Math.round(elapsedDays/journeyTotal*100)))
  const targetDays=daysBetween(data.profile.targetDate), draftProgress=pct(data.profile.currentDraft,data.profile.draftGoal)
  const todayTasks=[...data.tasks].filter(t=>!t.done).sort((a,b)=>(a.date||'').localeCompare(b.date||'')).slice(0,6), todayEvents=data.events.filter(e=>e.date===iso()).sort((a,b)=>a.start.localeCompare(b.start))
  const weeklyProgress=Math.round((pct(data.weekly.draftPages,data.weekly.draftTarget)+pct(data.weekly.articles,data.weekly.articleTarget)+pct(data.weekly.writingHours,data.weekly.writingTarget))/3)

  const loadGoogleIdentity=()=>new Promise((resolve,reject)=>{
    if(window.google?.accounts?.oauth2)return resolve(window.google)
    const existing=document.querySelector('script[data-strategisk-gsi]')||document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    const script=existing||document.createElement('script')
    let settled=false
    const done=()=>{if(settled)return;settled=true;window.google?.accounts?.oauth2?resolve(window.google):reject(new Error('Google Identity tidak dapat dimuatkan pada browser ini.'))}
    const fail=()=>{if(settled)return;settled=true;reject(new Error('Google Identity gagal dimuatkan. Buka aplikasi menggunakan Chrome atau Safari biasa.'))}
    script.addEventListener('load',done,{once:true})
    script.addEventListener('error',fail,{once:true})
    if(!existing){
      script.src='https://accounts.google.com/gsi/client'
      script.async=true
      script.defer=true
      script.dataset.strategiskGsi='1'
      document.head.appendChild(script)
    }
    setTimeout(()=>{if(window.google?.accounts?.oauth2)done();else fail()},10000)
  })
  const initGoogleClient=async(callback,forceConsent=false)=>{
    const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
    if(!clientId){setModal('google-help');return}
    try{await loadGoogleIdentity()}catch(e){showToast(e.message);return}
    tokenClientRef.current=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:GOOGLE_SCOPE,include_granted_scopes:true,callback:async(response)=>{
      if(response.error)return showToast(`Google: ${response.error}`)
      const token=response.access_token
      const grantedScopes=response.scope||''
      const scopeOk=grantedScopes.includes('https://www.googleapis.com/auth/drive.appdata')||grantedScopes.includes('drive.appdata')
      let profile=null;try{profile=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json())}catch{}
      setDrive(x=>({...x,token,profile,scopeOk,grantedScopes,lastError:''}));callback?.(token)
    },error_callback:(err)=>{
      const type=err?.type||'popup_failed'
      const msg=type==='popup_failed_to_open'?'Popup Google disekat. Benarkan pop-up dan cuba semula.':type==='popup_closed'?'Login Google dibatalkan.':`Google login gagal: ${type}`
      setDrive(x=>({...x,lastError:msg}));showToast(msg)
    }})
    tokenClientRef.current.requestAccessToken({prompt:forceConsent?'consent':(drive.token?'':'consent')})
  }
  async function googleApiError(r,action){
    let detail='';try{const j=await r.clone().json();detail=j?.error?.message||j?.error_description||''}catch{}
    const msg=`${action} — Drive API ${r.status}${detail?`: ${detail}`:''}`
    setDrive(x=>({...x,apiOk:false,lastError:msg,fileStatus:'Ralat akses Drive'}))
    throw new Error(msg)
  }
  async function findDriveFile(token){
    const q=new URLSearchParams({spaces:'appDataFolder',fields:'files(id,name,modifiedTime,mimeType)'});
    const r=await fetch(`https://www.googleapis.com/drive/v3/files?${q}`,{headers:{Authorization:`Bearer ${token}`}})
    if(!r.ok)await googleApiError(r,'Tidak dapat membaca appDataFolder')
    const files=(await r.json()).files||[]
    const file=files.find(f=>f.name===DRIVE_FILE)||null
    setDrive(x=>({...x,apiOk:true,fileStatus:file?`Fail ditemui: ${file.name}`:'Drive OK — fail strategiSK belum wujud',lastError:''}))
    return file
  }
  async function uploadDriveData(token,existing=null){
    const savedAt=new Date().toISOString(),body=JSON.stringify({...data,meta:{savedAt,version:4}});let r
    if(existing){r=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body})}
    else{const boundary='strategisk_boundary';const multipart=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:DRIVE_FILE,parents:['appDataFolder'],mimeType:'application/json'})}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body:multipart})}
    if(!r.ok)await googleApiError(r,existing?'Gagal mengemas kini fail Drive':'Gagal mencipta fail strategiSK')
    const result=await r.json();localStorage.setItem(LOCAL_UPDATED_KEY,savedAt);setDrive(x=>({...x,apiOk:true,fileStatus:'Fail strategiSK tersedia',lastError:''}));return {id:result.id||existing?.id||'',savedAt}
  }
  async function fetchRemoteData(token,existing){const r=await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)await googleApiError(r,'Gagal memuat turun data Google Drive');return r.json()}
  async function testDrive(token=drive.token){
    if(!token)return initGoogleClient(testDrive,true)
    setDrive(x=>({...x,syncing:true,lastError:'',fileStatus:'Memeriksa...'}))
    try{const existing=await findDriveFile(token);setDrive(x=>({...x,syncing:false,apiOk:true,fileStatus:existing?`Fail ditemui: ${DRIVE_FILE}`:'Drive API OK — fail belum wujud'}));showToast(existing?'Drive OK dan fail strategiSK ditemui.':'Drive API OK. Fail belum wujud; tekan Sync Dua Hala untuk cipta.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function reconnectDrive(){
    try{if(drive.token&&window.google?.accounts?.oauth2?.revoke)await new Promise(resolve=>window.google.accounts.oauth2.revoke(drive.token,()=>resolve()))}catch{}
    setDrive({token:'',fileId:'',profile:null,syncing:false,lastSync:'',scopeOk:false,apiOk:false,fileStatus:'Belum diperiksa',lastError:'',grantedScopes:''})
    setTimeout(()=>initGoogleClient(syncDrive,true),100)
  }
  async function saveDrive(token=drive.token){if(!token)return initGoogleClient(saveDrive,true);setDrive(x=>({...x,syncing:true}));try{const existing=await findDriveFile(token),result=await uploadDriveData(token,existing);setDrive(x=>({...x,fileId:result.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'})}));showToast('Data peranti ini berjaya disimpan ke Google Drive.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}}
  async function loadDrive(token=drive.token){if(!token)return initGoogleClient(loadDrive,true);setDrive(x=>({...x,syncing:true}));try{const existing=await findDriveFile(token);if(!existing)throw new Error('Drive API OK tetapi fail strategiSK belum wujud. Buat Sync Dua Hala dari PC dahulu atau tekan Paksa Simpan.');const remote=await fetchRemoteData(token,existing),savedAt=remote.meta?.savedAt||existing.modifiedTime;delete remote.meta;setData(migrate(remote));localStorage.setItem(LOCAL_UPDATED_KEY,savedAt||new Date().toISOString());setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail ditemui: ${DRIVE_FILE}`,lastError:''}));showToast('Data Google Drive berjaya dimuatkan ke peranti ini.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}}
  async function syncDrive(token=drive.token){
    if(!token)return initGoogleClient(syncDrive,true)
    setDrive(x=>({...x,syncing:true,lastError:''}))
    try{
      const existing=await findDriveFile(token)
      if(!existing){const result=await uploadDriveData(token);setDrive(x=>({...x,fileId:result.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail dicipta: ${DRIVE_FILE}`}));return showToast('Fail cloud pertama berjaya dicipta.')}
      const remote=await fetchRemoteData(token,existing),remoteTime=new Date(remote.meta?.savedAt||existing.modifiedTime||0).getTime(),localStamp=localStorage.getItem(LOCAL_UPDATED_KEY),localTime=localStamp?new Date(localStamp).getTime():0
      if(!localTime||remoteTime>localTime){const savedAt=remote.meta?.savedAt||existing.modifiedTime;delete remote.meta;setData(migrate(remote));localStorage.setItem(LOCAL_UPDATED_KEY,savedAt);showToast('Data terbaru dari Google Drive dimuatkan.')}
      else if(localTime>remoteTime){await uploadDriveData(token,existing);showToast('Perubahan terbaru peranti dihantar ke Google Drive.')}
      else showToast('Data PC dan telefon sudah sama.')
      setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail ditemui: ${DRIVE_FILE}`,lastError:''}))
    }catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  function exportJson(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`strategiSK-backup-${iso()}.json`;a.click();URL.revokeObjectURL(a.href)}
  function importJson(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{markLocalChanged();setData(migrate(JSON.parse(reader.result)));showToast('Backup berjaya diimport.')}catch{showToast('Fail JSON tidak sah.')}};reader.readAsText(file)}
  function sendWhatsApp(text){const phone=data.profile.whatsapp.replace(/\D/g,'');if(!phone)return showToast('Masukkan nombor WhatsApp di Settings.');window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')}
  async function sendTelegram(text){try{if(!data.profile.telegramChatId)throw new Error('Masukkan Telegram Chat ID di Settings.');const r=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:data.profile.telegramChatId,text})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Gagal menghantar Telegram.');showToast('Mesej berjaya dihantar ke Telegram.')}catch(e){showToast(e.message)}}

  const menu=[['dashboard',Home,'Dashboard'],['calendar',CalendarDays,'Calendar & Diary'],['draft',FileText,'Draft 111 Tracker'],['chapters',BookOpen,'Chapter Tracker'],['data',Database,'Data Collection'],['analysis',LineChart,'Data Analysis'],['experts',Users,'Expert List'],['publications',GraduationCap,'Publication Tracker'],['tasks',ListChecks,'Task Assignment'],['weekly',Target,'Weekly Target'],['monthly',Flag,'Monthly Target'],['consultation',MessageCircle,'Supervisor Consultation'],['settings',Settings,'Settings']]
  const title=menu.find(m=>m[0]===page)?.[2]||'Dashboard'
  const props={data,update,setModal,showToast}
  return <div className={`app ${data.settings.compact?'compact':''}`}>
    <aside className={`sidebar ${sidebar?'open':''}`}><div className="brand"><div className="brand-shield">SK</div><div><div className="brand-name">strategi<span>SK</span></div><div className="brand-tag">{data.profile.tagline}</div></div></div><nav>{menu.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setSidebar(false)}}><Icon size={18}/><span>{label}</span></button>)}</nav><div className="side-progress"><div className="side-progress-head"><span>GBT PROGRESS</span></div><Ring value={gbtProgress} label="perjalanan" size={104}/><div className="side-stat"><span>Target GBT</span><b>30 bulan</b></div><div className="side-stat"><span>Hari berbaki</span><b>{targetDays}</b></div><button className="primary full" onClick={()=>setModal('progress')}><Gauge size={16}/> Lihat Butiran</button><Rocket className="side-rocket" size={46}/></div></aside>
    {sidebar&&<div className="sidebar-scrim" onClick={()=>setSidebar(false)}/>}<main><header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setSidebar(true)}><Menu/></button><div className="welcome"><h1>{page==='dashboard'?<>Selamat kembali, <span>{data.profile.name}</span></>:title}</h1><p>{page==='dashboard'?`Anda berada pada Hari ke-${Math.max(1,elapsedDays)} perjalanan PhD GBT anda`:'Urus, pantau dan kemas kini rekod anda.'}</p></div><div className="top-actions"><button className="icon-btn" onClick={()=>update('settings',s=>({...s,theme:s.theme==='dark'?'light':'dark'}))}>{data.settings.theme==='dark'?<Sun/>:<Moon/>}</button><button className="drive-button" onClick={()=>syncDrive()}><Cloud size={18}/><span>{drive.syncing?'Menyegerak...':drive.profile?'Sync Sekarang':'Sambung & Sync'}</span></button><button className="avatar"><CircleUserRound/><span>{drive.profile?.given_name||data.profile.name.split(' ')[0]}</span></button></div></header>
      <section className="content">
        {page==='dashboard'&&<Dashboard {...props} targetDays={targetDays} gbtProgress={gbtProgress} draftProgress={draftProgress} todayTasks={todayTasks} todayEvents={todayEvents} weeklyProgress={weeklyProgress}/>} 
        {page==='calendar'&&<CalendarPage {...props}/>} {page==='draft'&&<DraftPage {...props} setEditingDraft={setEditingDraft}/>} 
        {page==='chapters'&&<SimpleProgressPage title="Chapter Tracker" items={data.chapters} setItems={v=>update('chapters',v)} nameKey="name"/>}
        {page==='data'&&<ResearchDataPage {...props}/>} {page==='analysis'&&<SimpleProgressPage title="Data Analysis" items={data.analysis} setItems={v=>update('analysis',v)} nameKey="name"/>}
        {page==='experts'&&<ExpertsPage {...props}/>} {page==='publications'&&<PublicationsPage {...props}/>} {page==='tasks'&&<TasksPage {...props}/>} 
        {page==='weekly'&&<WeeklyPage {...props} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram}/>} {page==='monthly'&&<MonthlyPage {...props}/>} {page==='consultation'&&<ConsultationPage {...props}/>} 
        {page==='settings'&&<SettingsPage {...props} drive={drive} saveDrive={saveDrive} loadDrive={loadDrive} syncDrive={syncDrive} testDrive={testDrive} reconnectDrive={reconnectDrive} exportJson={exportJson} importJson={importJson}/>} 
      </section></main>
    <nav className="mobile-nav">{[['dashboard',Home,'Home'],['calendar',CalendarDays,'Kalendar'],['tasks',ListChecks,'Task'],['weekly',Target,'Weekly'],['settings',Settings,'More']].map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>
    {toast&&<div className="toast"><Check size={18}/>{toast}</div>}
    {modal==='task'&&<TaskModal {...props} close={()=>setModal(null)}/>} {modal==='event'&&<EventModal {...props} close={()=>setModal(null)}/>} {modal==='diary'&&<DiaryModal {...props} close={()=>setModal(null)}/>} 
    {modal==='draft'&&<DraftModal {...props} initial={editingDraft} close={()=>{setModal(null);setEditingDraft(null)}}/>} {modal==='countdown'&&<CountdownModal {...props} close={()=>setModal(null)}/>} {modal==='timeline'&&<TimelineModal {...props} close={()=>setModal(null)}/>} 
    {modal==='progress'&&<ProgressModal data={data} gbtProgress={gbtProgress} draftProgress={draftProgress} targetDays={targetDays} close={()=>setModal(null)}/>} 
    {modal==='google-help'&&<Modal title="Sediakan Google Drive Sync" onClose={()=>setModal(null)}><div className="help-text"><p>Anda tidak perlu mencari atau memuat turun item bernama <b>drive.appdata</b>. Ia ialah nama kebenaran OAuth yang dimasukkan dalam kod aplikasi.</p><p>Di Google Cloud Console: enable <b>Google Drive API</b>, cipta OAuth Web Client ID, tambah alamat Vercel sebagai Authorized JavaScript Origin, kemudian masukkan Client ID itu sebagai:</p><code>VITE_GOOGLE_CLIENT_ID</code><p>Apabila anda tekan Sambung Drive, Google akan meminta izin untuk strategiSK mengurus fail datanya sendiri.</p></div></Modal>}
  </div>
}

function Dashboard({data,update,setModal,targetDays,gbtProgress,draftProgress,todayTasks,todayEvents,weeklyProgress}) {
  const [diaryIndex,setDiaryIndex]=useState(0)
  const diarySorted=useMemo(()=>[...data.diary].sort((a,b)=>b.date.localeCompare(a.date)),[data.diary])
  useEffect(()=>{if(diaryIndex>=diarySorted.length)setDiaryIndex(Math.max(0,diarySorted.length-1))},[diarySorted.length,diaryIndex])
  const diary=diarySorted[diaryIndex]
  const countdowns=[...data.countdowns.slice(0,3),{label:'GBT Target — 2.5 Years',date:data.profile.targetDate,type:'long'}]
  return <>
    <div className="section-title"><div><h2>DAYS REMAINING</h2><p>Short, mid and long-term research targets</p></div><button className="soft-btn" onClick={()=>setModal('countdown')}><Target size={16}/> Manage Targets</button></div>
    <div className="countdown-grid">{countdowns.map((c,i)=><div key={c.id||'long'} className={`countdown-card ${c.type}`}><div><span>{c.type==='short'?'SHORT TERM':c.type==='mid'?'MID TERM':'LONG TERM'}</span><h3>{c.label}</h3><strong>{daysBetween(c.date)} <small>Days</small></strong><p><CalendarDays size={14}/>{formatDate(c.date)}</p></div><span className="countdown-icon">{i===3?<Rocket/>:i===2?<Users/>:i===1?<Edit3/>:<CalendarDays/>}</span></div>)}</div>

    <div className="card task-highlight"><CardTitle title="Task Assignment — Priority" icon={<ListChecks/>}/><div className="task-list dashboard-task-list">{todayTasks.length?todayTasks.map(t=><label key={t.id} className="task-row"><input type="checkbox" checked={t.done} onChange={()=>update('tasks',xs=>xs.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span className={t.done?'done':''}>{t.title}</span><small>{t.category}</small></label>):<p>No active tasks.</p>}</div><button className="link-btn" onClick={()=>setModal('task')}>Add task <Plus size={15}/></button></div>

    <div className="dashboard-workspace">
      <div className="dashboard-core">
        <div className="card timeline-card"><div className="card-slider-head"><CardTitle title="2.5-Year Gantt Timeline" icon={<Trophy/>}/><button className="soft-btn" onClick={()=>setModal('timeline')}><Edit3 size={15}/> Edit Timeline</button></div><GanttTimeline data={data} gbtProgress={gbtProgress}/></div>
        <div className="card chapter-progress-card"><CardTitle title="Chapter Writing Progress" icon={<BookOpen/>}/><ChapterSpiderChart items={data.chapters}/></div>
        <div className="card draft-card draft-card-wide"><CardTitle title="Draft 111 Tracker" icon={<LineChart/>}/><div className="draft-card-inner"><Ring value={draftProgress} label={`${data.profile.currentDraft}/${data.profile.draftGoal}`} size={152}/><div className="draft-card-copy"><div className="metric-label">Current Draft <b>{String(data.profile.currentDraft).padStart(3,'0')}</b></div><p className="muted">Track your writing momentum and update every thesis draft consistently.</p><button className="primary full" onClick={()=>setModal('draft')}><Edit3 size={16}/> Update Draft</button></div></div></div>
        <div className="card full-progress-card"><CardTitle title="Data Collection Progress" icon={<Database/>}/><ProgressList items={data.researchPhases}/></div>
        <div className="card full-progress-card"><CardTitle title="Data Analysis Progress" icon={<LineChart/>}/><ProgressList items={data.analysis}/></div>
        <div className="card weekly-target-card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="split-chart weekly-summary"><Ring value={weeklyProgress} label="complete" size={104}/><div className="mini-list"><span>Draft <b>{data.weekly.draftPages}/{data.weekly.draftTarget} pages</b></span><span>Reading <b>{data.weekly.articles}/{data.weekly.articleTarget} articles</b></span><span>Writing <b>{data.weekly.writingHours}/{data.weekly.writingTarget} hrs</b></span></div></div></div>
        <div className="card mountain-card"><CardTitle title="Monthly Progress" icon={<Flag/>}/><div className="monthly-progress-layer"><ProgressList items={data.monthly.targets}/></div><div className="mountain"><Flag/></div></div>
        <div className="card consultation-dashboard-card"><CardTitle title="Latest Supervisor Consultation" icon={<MessageCircle/>}/>{data.consultations[0]?<div className="consult-mini"><b>{data.consultations[0].topic}</b><p>{data.consultations[0].comment}</p><small>Action: {data.consultations[0].action}</small><span className={`status-pill ${statusClass(data.consultations[0].status)}`}>{data.consultations[0].status}</span></div>:<p className="muted">No consultation record yet.</p>}</div>
      </div>
      <aside className="dashboard-today-rail">
        <div className="card schedule-card"><CardTitle title="Today's Schedule" icon={<CalendarDays/>}/><p className="muted">{new Date().toLocaleDateString('en-MY',{weekday:'long',day:'numeric',month:'long'})}</p><div className="schedule-list">{todayEvents.map(e=><div key={e.id} className="schedule red-only"><b>{e.start}–{e.end}</b><span>{e.title}</span></div>)}</div><button className="link-btn" onClick={()=>setModal('event')}>Add activity <Plus size={15}/></button></div>
        <div className="card slider-card"><div className="card-slider-head"><CardTitle title="Daily Diary" icon={<BookOpen/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><DiarySnippet diary={diary}/><button className="link-btn" onClick={()=>setModal('diary')}>Write diary <Edit3 size={15}/></button></div>
        <div className="card win-card slider-card"><div className="card-slider-head"><CardTitle title="Today's Win" icon={<Trophy/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><small>{diary?formatDate(diary.date):''}</small><p>{diary?.win||'No small win recorded yet.'}</p><Sparkles size={48}/></div>
        <div className="card diary-photo-card slider-card"><div className="card-slider-head"><CardTitle title="Diary Photo" icon={<FileImage/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><small>{diary?formatDate(diary.date):''}</small>{diary?.image?<a href={diary.image} target="_blank" rel="noreferrer" className="diary-photo-view"><img src={diary.image} alt={`Diary ${diary.date}`}/></a>:<div className="diary-photo-empty"><ImagePlus/><span>No photo for this day</span></div>}<button className="link-btn" onClick={()=>setModal('diary')}>Add photo <ImagePlus size={15}/></button></div>
      </aside>
    </div>
  </>
}
function SliderButtons({index,total,setIndex}){return <div className="slider-buttons"><button className="icon-btn" disabled={index>=total-1} onClick={()=>setIndex(Math.min(total-1,index+1))}><ChevronLeft size={17}/></button><span>{total?index+1:0}/{total}</span><button className="icon-btn" disabled={index<=0} onClick={()=>setIndex(Math.max(0,index-1))}><ChevronRight size={17}/></button></div>}
function DiarySnippet({diary}){return diary?<div className="diary-snippet"><small>{formatDate(diary.date)}</small><p><b>Refleksi:</b> {diary.reflection}</p><p><b>Win:</b> {diary.win}</p><div className="mood">Mood {'●'.repeat(diary.mood)}{'○'.repeat(5-diary.mood)}</div></div>:<p className="muted">Belum ada catatan.</p>}
function ChapterSpiderChart({items}){
  const list=items.slice(0,6), n=Math.max(3,list.length), cx=110, cy=108, maxR=78
  const point=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r]}
  const web=[.2,.4,.6,.8,1].map(level=>Array.from({length:n},(_,i)=>point(i,maxR*level).join(',')).join(' '))
  const dataPts=list.map((x,i)=>point(i,maxR*(Math.max(0,Math.min(100,x.progress))/100))).map(p=>p.join(',')).join(' ')
  return <div className="chapter-spider"><svg viewBox="0 0 220 225" role="img" aria-label="Spider web chart for chapter writing progress"><defs><linearGradient id="spiderFill" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#e40055" stopOpacity=".55"/><stop offset="100%" stopColor="#ff7aa7" stopOpacity=".18"/></linearGradient></defs>{web.map((pts,i)=><polygon key={i} points={pts} className="spider-web"/>)}{Array.from({length:n},(_,i)=>{const [x,y]=point(i,maxR);return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="spider-axis"/>})}<polygon points={dataPts} className="spider-data"/>{list.map((x,i)=>{const [x1,y1]=point(i,maxR*1.18);const [dx,dy]=point(i,maxR*(x.progress/100));return <g key={x.id}><circle cx={dx} cy={dy} r="4.5" className="spider-dot"/><text x={x1} y={y1} textAnchor="middle" className="spider-label">Ch {i+1}</text><text x={x1} y={y1+11} textAnchor="middle" className="spider-value">{x.progress}%</text></g>})}</svg><div className="spider-legend">{list.map((x,i)=><div key={x.id}><span><b>Ch {i+1}</b>{x.name.replace(/^Bab\s*\d+\s*[—-]\s*/i,'')}</span><strong>{x.progress}%</strong></div>)}</div></div>
}
function RadarMini({items}){return <ChapterSpiderChart items={items}/>} 
function GanttTimeline({data,gbtProgress}){
  const start=data.profile.startDate
  const totalMonths=30
  const yearSegments=[]
  for(let i=0;i<totalMonths;i++){
    const d=new Date(addMonths(start,i)+'T00:00')
    const year=d.getFullYear()
    const found=yearSegments[yearSegments.length-1]
    if(found && found.year===year) found.count += 1
    else yearSegments.push({year,count:1})
  }
  const nowIndex=Math.max(0,Math.min(totalMonths-1, monthsBetween(start, iso())))
  return <div className="gantt-dots">
    <div className="gantt-years">{yearSegments.map(seg=><span key={seg.year} style={{gridColumn:`span ${seg.count}`}}>{seg.year}</span>)}</div>
    <div className="gantt-month-pips">{Array.from({length:totalMonths},(_,i)=><i key={i} className={i===nowIndex?'active':''} title={`Month ${i+1}`}/>)}</div>
    <div className="gantt-dot-table">
      {data.timeline.map(row=>{
        const activeCount=Math.max(0,Math.min(totalMonths-row.startMonth,row.duration))
        const doneCount=Math.round(activeCount * (Math.max(0,Math.min(100,row.progress))/100))
        return <div className="gantt-dot-row" key={row.id}>
          <strong title={row.name}>{row.name}</strong>
          <div className="gantt-dot-track" title={`${row.name}: ${formatDate(addMonths(start,row.startMonth))} – ${formatDate(addMonths(start,row.startMonth+row.duration))}`}>
            {Array.from({length:totalMonths},(_,i)=>{
              let cls='idle'
              if(i>=row.startMonth && i<row.startMonth+activeCount) cls = i<row.startMonth+doneCount ? 'done' : 'plan'
              if(i===nowIndex) cls += ' now'
              return <span key={i} className={`gdot ${cls}`}/>
            })}
          </div>
          <small>{new Date(addMonths(start,row.startMonth)+'T00:00').toLocaleDateString('en-MY',{month:'short',year:'2-digit'})} – {new Date(addMonths(start,row.startMonth+row.duration)+'T00:00').toLocaleDateString('en-MY',{month:'short',year:'2-digit'})}</small>
        </div>
      })}
    </div>
  </div>}

function CalendarPage({data,update,setModal}){
  const [selected,setSelected]=useState(iso()),[month,setMonth]=useState(new Date())
  const days=useMemo(()=>{const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),arr=[];for(let i=0;i<(first.getDay()+6)%7;i++)arr.push(null);for(let d=1;d<=last.getDate();d++)arr.push(new Date(y,m,d));return arr},[month])
  const selectedEvents=data.events.filter(e=>e.date===selected),selectedDiary=data.diary.find(d=>d.date===selected)
  return <div className="page-grid"><div className="card calendar-full"><div className="calendar-head"><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{month.toLocaleDateString('ms-MY',{month:'long',year:'numeric'})}</h2><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div><div className="weekdays">{['Isn','Sel','Rab','Kha','Jum','Sab','Aha'].map(x=><b key={x}>{x}</b>)}</div><div className="month-grid">{days.map((d,i)=>d?<button key={i} className={`${iso(d)===selected?'selected':''} ${iso(d)===iso()?'today':''}`} onClick={()=>setSelected(iso(d))}><span>{d.getDate()}</span>{data.events.some(e=>e.date===iso(d))&&<i className="red-dot"/>}{data.diary.some(e=>e.date===iso(d))&&<em className="red-dot second"/>}</button>:<div key={i}/>)}</div></div><div className="card day-panel"><CardTitle title="Calendar & Diary" icon={<CalendarDays/>}/><h2>{formatDate(selected,{weekday:'long',day:'numeric',month:'long'})}</h2><div className="schedule-list">{selectedEvents.map(e=><div key={e.id} className="schedule red-only"><div><b>{e.start}–{e.end}</b><span>{e.title}</span></div><button className="icon-btn danger" onClick={()=>update('events',xs=>xs.filter(i=>i.id!==e.id))}><Trash2 size={15}/></button></div>)}</div>{selectedDiary&&<DiarySnippet diary={selectedDiary}/>}<div className="button-row"><button className="primary" onClick={()=>setModal('event')}><Plus/> Aktiviti</button><button className="secondary" onClick={()=>setModal('diary')}><Edit3/> Diari</button></div></div></div>
}
function DraftPage({data,update,setModal,setEditingDraft}){const remove=x=>{const next=data.draftHistory.filter(i=>i.id!==x.id);update('draftHistory',next);update('profile',{...data.profile,currentDraft:Math.max(0,...next.map(i=>i.draft))})};return <div><div className="hero-stat card"><Ring value={pct(data.profile.currentDraft,data.profile.draftGoal)} label="Draft 111" size={160}/><div><span className="eyebrow">CURRENT DRAFT</span><h2>{String(data.profile.currentDraft).padStart(3,'0')} / {data.profile.draftGoal}</h2><p>Naik draft secara konsisten setiap minggu dan simpan sejarah perubahan.</p><button className="primary" onClick={()=>{setEditingDraft(null);setModal('draft')}}><Plus/> Naik Draft</button></div></div><div className="card table-card"><CardTitle title="Sejarah Draft" icon={<FileText/>}/><div className="responsive-table"><table><thead><tr><th>Draft</th><th>Tarikh</th><th>Fokus</th><th>Muka surat</th><th>Catatan</th><th>Tindakan</th></tr></thead><tbody>{[...data.draftHistory].sort((a,b)=>b.draft-a.draft).map(x=><tr key={x.id}><td><b>#{String(x.draft).padStart(3,'0')}</b></td><td>{x.date}</td><td>{x.focus}</td><td>{x.pages}</td><td>{x.note}</td><td><div className="row-actions"><button className="icon-btn" onClick={()=>{setEditingDraft(x);setModal('draft')}}><Edit3 size={16}/></button><button className="icon-btn danger" onClick={()=>remove(x)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></div></div>}
function SimpleProgressPage({title,items,setItems,nameKey}){return <div className="card editable-list"><div className="section-title"><div><h2>{title}</h2><p>Klik nama atau progress untuk ubah suai.</p></div><button className="primary" onClick={()=>setItems([...items,{id:uid(),[nameKey]:'Item baharu',progress:0}])}><Plus/> Tambah</button></div>{items.map(x=><div className="edit-progress" key={x.id}><input value={x[nameKey]} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,[nameKey]:e.target.value}:i))}/><input type="range" min="0" max="100" value={x.progress} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>setItems(items.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function ResearchDataPage({data,update}){const add=()=>update('researchPhases',xs=>[...xs,{id:uid(),name:'Fasa / sampel baharu',current:0,target:10,progress:0}]);return <div className="page-grid"><div className="card"><div className="section-title"><div><h2>Fasa Kajian</h2><p>Pantau sasaran dan pencapaian pengumpulan data.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{data.researchPhases.map(x=><div className="phase-editor phase-with-delete" key={x.id}><input value={x.name} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/><div><Field label="Semasa"><input type="number" value={x.current} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,current:+e.target.value,progress:pct(+e.target.value,i.target)}:i))}/></Field><Field label="Sasaran"><input type="number" value={x.target} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,target:+e.target.value,progress:pct(i.current,+e.target.value)}:i))}/></Field></div><div className="bar"><i style={{width:`${x.progress}%`}}/></div><button className="icon-btn danger phase-delete" onClick={()=>update('researchPhases',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div><div className="card"><CardTitle title="Ringkasan Visual" icon={<BarChart3/>}/><div className="big-bars">{data.researchPhases.map(x=><div key={x.id}><span>{x.name}</span><div><i style={{height:`${Math.max(8,x.progress*1.8)}px`}}/><b>{x.progress}%</b></div></div>)}</div></div></div>}
function ExpertsPage({data,update}){
  const add=()=>update('experts',xs=>[...xs,{id:uid(),name:'',institution:'',expertise:'',email:'',phone:'',notes:'',image:'',status:'Belum dihubungi',phase:'Fuzzy Delphi'}])
  const upload=(id,file)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>update('experts',xs=>xs.map(i=>i.id===id?{...i,image:reader.result}:i));reader.readAsDataURL(file)}
  const patch=(id,key,value)=>update('experts',xs=>xs.map(i=>i.id===id?{...i,[key]:value}:i))
  return <div className="experts-page"><div className="section-title"><div><h2>Expert List</h2><p>Expert profile, contact information, key notes and reference photo.</p></div><button className="primary" onClick={add}><Plus/> Add Expert</button></div><div className="expert-card-list">{data.experts.map((x,index)=><div className="card expert-card" key={x.id}><div className="expert-card-head"><div><span className="eyebrow">EXPERT {String(index+1).padStart(2,'0')}</span><h3>{x.name||'Expert baharu'}</h3></div><button className="icon-btn danger" onClick={()=>update('experts',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={18}/></button></div><div className="expert-main-grid"><label className={`expert-photo-upload ${x.image?'has-image':''}`}>{x.image?<img src={x.image} alt={x.name||'Expert'}/>:<><CircleUserRound size={42}/><span>Upload expert photo</span></>}<input type="file" accept="image/*" onChange={e=>upload(x.id,e.target.files?.[0])}/></label><div className="expert-fields-top"><Field label="Name"><input value={x.name} onChange={e=>patch(x.id,'name',e.target.value)}/></Field><Field label="Institution / Organisation"><input value={x.institution} onChange={e=>patch(x.id,'institution',e.target.value)}/></Field><Field label="Expertise"><input value={x.expertise} onChange={e=>patch(x.id,'expertise',e.target.value)}/></Field><Field label="Phase / Role"><input value={x.phase} onChange={e=>patch(x.id,'phase',e.target.value)}/></Field></div></div><div className="expert-contact-row"><Field label="Email"><input type="email" value={x.email} onChange={e=>patch(x.id,'email',e.target.value)}/></Field><Field label="Phone"><input value={x.phone} onChange={e=>patch(x.id,'phone',e.target.value)}/></Field><Field label="Status"><select value={x.status} onChange={e=>patch(x.id,'status',e.target.value)}><option>Belum dihubungi</option><option>Jemputan dihantar</option><option>Setuju</option><option>Selesai</option><option>Tolak</option></select></Field></div><Field label="Key Notes"><textarea className="expert-notes" rows="6" value={x.notes} placeholder="Contoh: kepakaran khusus, perkara penting semasa dihubungi, potensi soalan, persetujuan, tarikh follow-up..." onChange={e=>patch(x.id,'notes',e.target.value)}/></Field></div>)}</div></div>
}
function PublicationsPage({data,update}){const add=()=>update('publications',xs=>[...xs,{id:uid(),title:'Artikel baharu',outlet:'',due:addDays(60),status:'Idea',progress:0}]);return <div className="card"><div className="section-title"><div><h2>Publication Tracker</h2><p>Rancang tarikh submit dan pantau status penerbitan.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{data.publications.map(x=><div className="publication publication-delete" key={x.id}><div><input className="title-input" value={x.title} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input value={x.outlet} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,outlet:e.target.value}:i))}/></div><input type="date" value={x.due} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,due:e.target.value}:i))}/><select value={x.status} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,status:e.target.value}:i))}><option>Idea</option><option>Drafting</option><option>Submitted</option><option>Revision</option><option>Accepted</option><option>Published</option></select><input type="range" min="0" max="100" value={x.progress} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>update('publications',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function TasksPage({data,update}){const[filter,setFilter]=useState('all');const items=data.tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));return <div className="card"><div className="section-title"><div><h2>Task Assignment</h2><p>Urus task thesis, Dr Roket dan penyelidikan.</p></div><button className="primary" onClick={()=>update('tasks',xs=>[...xs,{id:uid(),title:'Tugasan baharu',date:iso(),done:false,category:'Thesis'}])}><Plus/> Tambah</button></div><div className="chips"><button onClick={()=>setFilter('all')} className={filter==='all'?'active':''}>Semua</button><button onClick={()=>setFilter('open')} className={filter==='open'?'active':''}>Belum siap</button><button onClick={()=>setFilter('done')} className={filter==='done'?'active':''}>Selesai</button></div>{items.map(x=><div className="task-editor" key={x.id}><input type="checkbox" checked={x.done} onChange={()=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,done:!i.done}:i))}/><input value={x.title} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input type="date" value={x.date} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,date:e.target.value}:i))}/><input value={x.category} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,category:e.target.value}:i))}/><button className="icon-btn danger" onClick={()=>update('tasks',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function WeeklyPage({data,update,sendWhatsApp,sendTelegram,showToast}){const w=data.weekly,set=(k,v)=>update('weekly',{...w,[k]:v});return <div className="weekly-layout"><div className="card form-card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="form-grid"><Field label="Draft pages / target"><div className="inline-input"><input type="number" value={w.draftPages} onChange={e=>set('draftPages',+e.target.value)}/><span>/</span><input type="number" value={w.draftTarget} onChange={e=>set('draftTarget',+e.target.value)}/></div></Field><Field label="Articles read / target"><div className="inline-input"><input type="number" value={w.articles} onChange={e=>set('articles',+e.target.value)}/><span>/</span><input type="number" value={w.articleTarget} onChange={e=>set('articleTarget',+e.target.value)}/></div></Field><Field label="Writing hours / target"><div className="inline-input"><input type="number" value={w.writingHours} onChange={e=>set('writingHours',+e.target.value)}/><span>/</span><input type="number" value={w.writingTarget} onChange={e=>set('writingTarget',+e.target.value)}/></div></Field></div></div><MessageComposer kind="fow" title="FOW — Focus of the Week" value={w.fow} setValue={v=>set('fow',v)} data={data} update={update} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram} showToast={showToast}/><MessageComposer kind="fod" title="FOD — Focus of the Day" value={w.fod} setValue={v=>set('fod',v)} data={data} update={update} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram} showToast={showToast}/></div>}
function MessageComposer({kind,title,value,setValue,data,update,sendWhatsApp,sendTelegram,showToast}){const templates=data.messageTemplates[kind]||[];const full=`${title}\n\n${value}`;const addTemplate=()=>update('messageTemplates',{...data.messageTemplates,[kind]:[...templates,{id:uid(),title:'Ayat contoh',text:''}]});const copy=t=>navigator.clipboard.writeText(t).then(()=>showToast('Ayat contoh disalin.'));return <div className="card message-workspace"><div className="message-editor"><CardTitle title={title} icon={<MessageCircle/>}/><textarea rows="11" value={value} onChange={e=>setValue(e.target.value)} placeholder={`Tulis ${kind.toUpperCase()} anda di sini...`}/><div className="send-row"><button className="whatsapp" onClick={()=>sendWhatsApp(full)}><MessageCircle/> Hantar WhatsApp</button><button className="telegram" onClick={()=>sendTelegram(full)}><Send/> Hantar Telegram</button></div></div><div className="template-panel"><div className="section-title"><div><h3>Template Ayat</h3><p>Simpan, copy dan paste ayat berulang.</p></div><button className="soft-btn" onClick={addTemplate}><Plus/> Ayat</button></div>{templates.map(t=><div className="template-row" key={t.id}><input value={t.title} onChange={e=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.map(i=>i.id===t.id?{...i,title:e.target.value}:i)})}/><textarea rows="3" value={t.text} onChange={e=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.map(i=>i.id===t.id?{...i,text:e.target.value}:i)})}/><div><button className="icon-btn" onClick={()=>copy(t.text)}><Copy size={16}/></button><button className="icon-btn danger" onClick={()=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.filter(i=>i.id!==t.id)})}><Trash2 size={16}/></button></div></div>)}</div></div>}
function MonthlyPage({data,update,showToast}){const m=data.monthly,setM=(k,v)=>update('monthly',{...m,[k]:v});const archive=()=>{if(!m.month.trim())return;update('monthlyArchives',xs=>[{id:uid(),month:m.month,savedAt:iso(),targets:JSON.parse(JSON.stringify(m.targets))},...xs]);showToast(`Target ${m.month} diarkibkan.`)};return <div className="monthly-layout"><div className="card"><div className="section-title"><div><h2>Monthly Target</h2><p>Name the month and save it to the archive.</p></div><button className="primary" onClick={archive}><Save/> Save & Archive</button></div><Field label="Month / target name"><input value={m.month} onChange={e=>setM('month',e.target.value)} placeholder="Contoh: Ogos 2026"/></Field>{m.targets.map(x=><div className="edit-progress" key={x.id}><input value={x.name} onChange={e=>setM('targets',m.targets.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/><input type="range" min="0" max="100" value={x.progress} onChange={e=>setM('targets',m.targets.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>setM('targets',m.targets.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}<button className="soft-btn" onClick={()=>setM('targets',[...m.targets,{id:uid(),name:'Target baharu',progress:0}])}><Plus/> Tambah Target</button></div><div className="card"><CardTitle title="Monthly Target Archive" icon={<Flag/>}/>{data.monthlyArchives.length?data.monthlyArchives.map(a=><details className="archive-card" key={a.id}><summary><b>{a.month}</b><span>Disimpan {formatDate(a.savedAt)}</span></summary><ProgressList items={a.targets}/><button className="danger-btn" onClick={()=>update('monthlyArchives',xs=>xs.filter(i=>i.id!==a.id))}><Trash2/> Padam Archive</button></details>):<p className="muted">Belum ada archive.</p>}</div></div>}
function ConsultationPage({data,update}){
  const add=()=>update('consultations',xs=>[{id:uid(),date:iso(),topic:'',comment:'',action:'',status:'Dalam tindakan',image:''},...xs])
  const upload=(id,file)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>update('consultations',xs=>xs.map(i=>i.id===id?{...i,image:reader.result}:i));reader.readAsDataURL(file)}
  const patch=(id,key,value)=>update('consultations',xs=>xs.map(i=>i.id===id?{...i,[key]:value}:i))
  return <div className="consultation-page"><div className="section-title"><div><h2>Supervisor Consultation</h2><p>Structured consultation notes, action items and visual evidence.</p></div><button className="primary" onClick={add}><Plus/> Add Log</button></div><div className="consultation-card-list">{data.consultations.map((x,index)=><div className="card consultation-card" key={x.id}><div className="consultation-card-head"><div><span className="eyebrow">CONSULTATION {String(index+1).padStart(2,'0')}</span><h3>{x.topic||'Supervisor consultation'}</h3></div><button className="icon-btn danger" onClick={()=>update('consultations',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={18}/></button></div><div className="consultation-top-row"><Field label="Date"><input type="date" value={x.date} onChange={e=>patch(x.id,'date',e.target.value)}/></Field><Field label="Topic"><input value={x.topic} placeholder="Consultation topic" onChange={e=>patch(x.id,'topic',e.target.value)}/></Field><Field label="Status"><select className={statusClass(x.status)} value={x.status} onChange={e=>patch(x.id,'status',e.target.value)}><option>Dalam tindakan</option><option>Tertangguh</option><option>Selesai</option></select></Field></div><div className="consultation-main-row"><Field label="Supervisor Comment"><textarea rows="7" value={x.comment} placeholder="Supervisor comments, corrections and key points..." onChange={e=>patch(x.id,'comment',e.target.value)}/></Field><label className={`consultation-photo-upload ${x.image?'has-image':''}`}>{x.image?<img src={x.image} alt="Consultation evidence"/>:<><ImagePlus size={42}/><span>Upload consultation photo</span></>}<input type="file" accept="image/*" onChange={e=>upload(x.id,e.target.files?.[0])}/></label></div><Field label="Action / Follow-up"><textarea rows="4" value={x.action} placeholder="Action items and follow-up..." onChange={e=>patch(x.id,'action',e.target.value)}/></Field></div>)}</div></div>
}
function SettingsPage({data,update,drive,saveDrive,loadDrive,syncDrive,testDrive,reconnectDrive,exportJson,importJson}){const p=data.profile,setP=(k,v)=>update('profile',{...p,[k]:v});return <div className="settings-grid"><div className="card form-card"><CardTitle title="Profile & GBT Target" icon={<Settings/>}/><Field label="Name"><input value={p.name} onChange={e=>setP('name',e.target.value)}/></Field><Field label="Tagline"><input value={p.tagline} onChange={e=>setP('tagline',e.target.value)}/></Field><div className="form-grid"><Field label="Tarikh mula PhD"><input type="date" value={p.startDate} onChange={e=>setP('startDate',e.target.value)}/></Field><Field label="Target GBT"><input type="date" value={p.targetDate} onChange={e=>setP('targetDate',e.target.value)}/></Field><Field label="Draft semasa"><input type="number" value={p.currentDraft} onChange={e=>setP('currentDraft',+e.target.value)}/></Field><Field label="Sasaran draft"><input type="number" value={p.draftGoal} onChange={e=>setP('draftGoal',+e.target.value)}/></Field></div></div><div className="card form-card"><CardTitle title="Personal Google Drive" icon={<Cloud/>}/><div className={`connection ${drive.profile?'connected':''}`}><Cloud size={28}/><div><b>{drive.profile?`Disambung: ${drive.profile.email}`:'Belum disambung'}</b><small>{drive.lastSync?`Sync terakhir ${drive.lastSync}`:'Sambungkan akaun Google yang sama pada PC dan telefon.'}</small></div></div><div className="drive-diagnostics"><div><span>Scope drive.appdata</span><b className={drive.scopeOk?'diag-ok':'diag-warn'}>{drive.scopeOk?'OK':'Belum disahkan'}</b></div><div><span>Google Drive API</span><b className={drive.apiOk?'diag-ok':'diag-warn'}>{drive.apiOk?'OK':'Belum diuji'}</b></div><div><span>Fail cloud</span><b>{drive.fileStatus}</b></div>{drive.lastError&&<div className="diag-error"><span>Ralat terakhir</span><b>{drive.lastError}</b></div>}</div><div className="button-row"><button className="primary" onClick={syncDrive}><Cloud/> Sync Dua Hala</button><button className="secondary" onClick={testDrive}><Database/> Uji Drive</button><button className="secondary" onClick={reconnectDrive}><RotateCcw/> Reconnect</button><button className="secondary" onClick={saveDrive}><CloudUpload/> Paksa Simpan</button><button className="secondary" onClick={loadDrive}><CloudDownload/> Paksa Muat Turun</button></div><p className="hint"><b>Uji Drive</b> akan semak sama ada token telefon benar-benar mempunyai akses ke appDataFolder. Jika scope atau API bermasalah, mesej ralat sebenar Google akan dipaparkan di sini.</p></div><div className="card form-card"><CardTitle title="FOW & FOD Recipients" icon={<Send/>}/><Field label="Nombor WhatsApp SV / CRMP (format 6012...)"><input value={p.whatsapp} onChange={e=>setP('whatsapp',e.target.value)} placeholder="60123456789"/></Field><Field label="Telegram Chat ID"><input value={p.telegramChatId} onChange={e=>setP('telegramChatId',e.target.value)} placeholder="123456789"/></Field><p className="hint">Butang hantar terletak terus dalam bahagian FOW dan FOD.</p></div><div className="card form-card"><CardTitle title="Display & Backup" icon={<Download/>}/><label className="check-card"><input type="checkbox" checked={data.settings.compact} onChange={e=>update('settings',{...data.settings,compact:e.target.checked})}/><span><b>Compact dashboard</b><small>Kurangkan jarak kad untuk skrin kecil.</small></span></label><label className="check-card"><input type="checkbox" checked={data.settings.showGraphics} onChange={e=>update('settings',{...data.settings,showGraphics:e.target.checked})}/><span><b>Elemen grafik</b><small>Papar chart dan ilustrasi.</small></span></label><div className="button-row"><button className="secondary" onClick={exportJson}><Download/> Export JSON</button><label className="secondary file-button"><Upload/> Import JSON<input type="file" accept="application/json" onChange={importJson}/></label><button className="danger-btn" onClick={()=>{if(confirm('Reset semua data?')){localStorage.removeItem(APP_KEY);location.reload()}}}><RotateCcw/> Reset</button></div></div></div>}

function TaskModal({update,close}){const[x,setX]=useState({title:'',date:iso(),category:'Thesis'});return <Modal title="Tambah Tugasan" onClose={close}><Field label="Tugasan"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Kategori"><input value={x.category} onChange={e=>setX({...x,category:e.target.value})}/></Field><button className="primary full" onClick={()=>{if(x.title.trim())update('tasks',xs=>[...xs,{...x,id:uid(),done:false}]);close()}}><Save/> Simpan</button></Modal>}
function EventModal({update,close}){const[x,setX]=useState({title:'',date:iso(),start:'09:00',end:'10:00'});return <Modal title="Tambah Aktiviti Kalendar" onClose={close}><Field label="Aktiviti"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><div className="form-grid"><Field label="Mula"><input type="time" value={x.start} onChange={e=>setX({...x,start:e.target.value})}/></Field><Field label="Tamat"><input type="time" value={x.end} onChange={e=>setX({...x,end:e.target.value})}/></Field></div><button className="primary full" onClick={()=>{if(x.title.trim())update('events',xs=>[...xs,{...x,id:uid()}]);close()}}><Save/> Simpan</button></Modal>}
function DiaryModal({data,update,close}){const old=data.diary.find(d=>d.date===iso())||{id:uid(),date:iso(),reflection:'',win:'',mood:4,image:''};const[x,setX]=useState({image:'',...old});const upload=file=>{if(!file)return;const reader=new FileReader();reader.onload=()=>setX(v=>({...v,image:reader.result}));reader.readAsDataURL(file)};return <Modal title="Daily Diary / TDR" onClose={close}><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Refleksi harian"><textarea rows="7" value={x.reflection} onChange={e=>setX({...x,reflection:e.target.value})}/></Field><Field label="Win kecil hari ini"><input value={x.win} onChange={e=>setX({...x,win:e.target.value})}/></Field><Field label={`Mood / tenaga: ${x.mood}/5`}><input type="range" min="1" max="5" value={x.mood} onChange={e=>setX({...x,mood:+e.target.value})}/></Field><Field label="Gambar diari / bukti progress"><label className={`diary-upload ${x.image?'has-image':''}`}>{x.image?<img src={x.image} alt="Preview diari"/>:<ImagePlus size={34}/>}<span>{x.image?'Klik untuk tukar gambar':'Upload gambar'}</span><input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/></label>{x.image&&<button className="text-danger" onClick={()=>setX({...x,image:''})}><Trash2 size={14}/> Buang gambar</button>}</Field><button className="primary full" onClick={()=>{update('diary',xs=>[...xs.filter(i=>i.date!==x.date),x]);close()}}><Save/> Simpan Diari</button></Modal>}
function DraftModal({data,update,initial,close}){const[x,setX]=useState(initial||{draft:data.profile.currentDraft+1,date:iso(),focus:'',pages:1,note:''});const save=()=>{if(initial)update('draftHistory',xs=>xs.map(i=>i.id===initial.id?{...x,id:initial.id}:i));else update('draftHistory',xs=>[...xs,{...x,id:uid()}]);const drafts=(initial?data.draftHistory.map(i=>i.id===initial.id?x:i):[...data.draftHistory,x]).map(i=>i.draft);update('profile',{...data.profile,currentDraft:Math.max(...drafts)});close()};return <Modal title={initial?'Edit Rekod Draft':'Naik Draft Thesis'} onClose={close}><div className="form-grid"><Field label="Nombor Draft"><input type="number" value={x.draft} onChange={e=>setX({...x,draft:+e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field></div><Field label="Fokus / seksyen"><input value={x.focus} onChange={e=>setX({...x,focus:e.target.value})}/></Field><Field label="Muka surat ditambah / dibaiki"><input type="number" value={x.pages} onChange={e=>setX({...x,pages:+e.target.value})}/></Field><Field label="Catatan perubahan"><textarea rows="4" value={x.note} onChange={e=>setX({...x,note:e.target.value})}/></Field><button className="primary full" onClick={save}>{initial?<Save/>:<Rocket/>}{initial?'Simpan Perubahan':`Naik ke Draft ${x.draft}`}</button></Modal>}
function CountdownModal({data,update,close}){const[x,setX]=useState({label:'',date:addDays(7),type:'short'});return <Modal title="Urus Days Remaining" onClose={close} wide><div className="countdown-manage">{data.countdowns.map(c=><div key={c.id}><input value={c.label} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,label:e.target.value}:i))}/><input type="date" value={c.date} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,date:e.target.value}:i))}/><select value={c.type} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,type:e.target.value}:i))}><option value="short">Short term</option><option value="mid">Mid term</option></select><b>{daysBetween(c.date)} hari</b><button className="icon-btn danger" onClick={()=>update('countdowns',xs=>xs.filter(i=>i.id!==c.id))}><Trash2/></button></div>)}</div><hr/><div className="countdown-add"><input placeholder="Nama sasaran" value={x.label} onChange={e=>setX({...x,label:e.target.value})}/><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/><select value={x.type} onChange={e=>setX({...x,type:e.target.value})}><option value="short">Short term</option><option value="mid">Mid term</option></select><button className="primary" onClick={()=>{if(x.label)update('countdowns',xs=>[...xs,{...x,id:uid()}]);setX({...x,label:''})}}><Plus/> Tambah</button></div></Modal>}
function TimelineModal({data,update,close}){const add=()=>update('timeline',xs=>[...xs,{id:uid(),name:'Fasa baharu',startMonth:0,duration:3,progress:0}]);return <Modal title="Edit Timeline GBT 2.5 Tahun" onClose={close} wide><p className="hint">Kiraan bulan bermula daripada bulan pertama PhD. Contoh: bulan mula 0 ialah bulan pertama, dan tempoh 6 ialah enam bulan.</p><div className="timeline-editor">{data.timeline.map((x,index)=><div key={x.id} className="timeline-edit-row"><span className="timeline-order">{index+1}</span><Field label="Nama fasa"><input value={x.name} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/></Field><Field label="Bulan mula (0–29)"><input type="number" min="0" max="29" value={x.startMonth} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,startMonth:Math.max(0,Math.min(29,+e.target.value))}:i))}/></Field><Field label="Tempoh (bulan)"><input type="number" min="1" max="30" value={x.duration} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,duration:Math.max(1,Math.min(30,+e.target.value))}:i))}/></Field><Field label="Progress %"><input type="number" min="0" max="100" value={x.progress} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,progress:Math.max(0,Math.min(100,+e.target.value))}:i))}/></Field><button className="icon-btn danger timeline-row-delete" onClick={()=>update('timeline',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div><div className="modal-actions"><button className="secondary" onClick={add}><Plus/> Tambah Fasa</button><button className="primary" onClick={close}><Save/> Selesai</button></div></Modal>}
function ProgressModal({data,gbtProgress,draftProgress,targetDays,close}){return <Modal title="Butiran Progress GBT" onClose={close} wide><div className="progress-overview"><Ring value={gbtProgress} label="GBT" size={150}/><Ring value={draftProgress} label="Draft 111" size={150}/><div className="big-number"><strong>{targetDays}</strong><span>hari berbaki</span></div></div><ProgressList items={data.chapters}/></Modal>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
