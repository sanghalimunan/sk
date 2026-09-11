import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Cloud, CloudDownload, CloudUpload, Copy, Database, Edit3, FileImage, FileText, Flag,
  Gauge, GraduationCap, Home, ImagePlus, LineChart, ListChecks, Menu, MessageCircle, Moon,
  Plus, Rocket, Save, Send, Settings, Sparkles, Sun, Target, Trash2, Trophy, Users, X,
  Download, Upload, RotateCcw, Search, Lightbulb, Link2, PenTool, Eraser, Printer, FileUp, ExternalLink, Folder, FolderOpen, Crop
} from 'lucide-react'
import './styles.css'

const APP_KEY = 'strategisk-phd-os-v2'
const DRIVE_FILE = 'strategiSK-data.json'
const SCHEMA_VERSION = 7
const DRIVE_ROOT_FOLDER = 'strategiSK'
const CANONICAL_ROOT_KEY = 'strategisk-canonical-root-id'
const MEDIA_FOLDERS = { diary:'diary', learning:'learning-point', learningFiles:'learning-files', thesis:'thesis-drafts', consultation:'consultation', experts:'experts', sketches:'sketches', backups:'backups' }
const LOCAL_UPDATED_KEY = 'strategisk-local-updated-at'
const LAST_AUTO_SYNC_KEY = 'strategisk-last-auto-sync-at'
const LOCAL_DIRTY_KEY = 'strategisk-local-dirty'
const LAST_CLOUD_SEEN_KEY = 'strategisk-last-cloud-seen-at'
const LAST_CLOUD_REVISION_KEY = 'strategisk-last-cloud-revision'
const GOOGLE_REMEMBER_KEY = 'strategisk-google-remember'
const DEVICE_ID_KEY = 'strategisk-device-id'
const DEVICE_NAME_KEY = 'strategisk-device-name'
const PENDING_COUNT_KEY = 'strategisk-pending-count'
const AUTO_SYNC_MS = 5 * 60 * 1000
const IDLE_SYNC_MS = 25 * 1000
const getDeviceId = () => { let id=localStorage.getItem(DEVICE_ID_KEY); if(!id){ id=(crypto?.randomUUID?.()||`device-${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem(DEVICE_ID_KEY,id) } return id }
const getDeviceName = () => localStorage.getItem(DEVICE_NAME_KEY) || (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)?'Phone / Tablet':'Desktop / Laptop')
const GOOGLE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
const iso = (date = new Date()) => { const d = new Date(date); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}` }
const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return iso(d) }
const addMonths = (date, n) => { const d = new Date(date + 'T00:00:00'); d.setMonth(d.getMonth() + n); return iso(d) }
const monthsBetween = (start, end) => { const a = new Date(start + 'T00:00:00'); const b = new Date(end + 'T00:00:00'); return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) }
const pct = (a, b) => b ? Math.min(100, Math.max(0, Math.round((a / b) * 100))) : 0
const daysBetween = (date) => Math.max(0, Math.ceil((new Date(date + 'T23:59:59') - new Date()) / 86400000))
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
const formatDate = (date, opts = { day:'numeric', month:'long', year:'numeric' }) => new Date(date + 'T00:00:00').toLocaleDateString('ms-MY', opts)
const HIJRI_MONTHS = ['Muharam','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']
const formatHijri = (date) => {
  const d = new Date(date + 'T00:00:00')
  const getParts = calendar => {
    const parts = new Intl.DateTimeFormat(`en-US-u-ca-${calendar}`,{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(d)
    const pick = type => Number(parts.find(x=>x.type===type)?.value || 0)
    const day=pick('day'), month=pick('month'), year=pick('year')
    return day && month && year ? `${day} ${HIJRI_MONTHS[month-1] || ''} ${year}H` : ''
  }
  try { return getParts('islamic-umalqura') } catch { try { return getParts('islamic') } catch { return '' } }
}

const isDataUrl = v => typeof v === 'string' && v.startsWith('data:')
const dataUrlToBlob = dataUrl => { const [head,body]=dataUrl.split(','); const mime=(head.match(/data:([^;]+)/)||[])[1]||'application/octet-stream'; const bytes=atob(body); const arr=new Uint8Array(bytes.length); for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i); return new Blob([arr],{type:mime}) }
const pendingMedia = (dataUrl, name='image.jpg', category='learning') => ({ id:uid(), driveFileId:'', name, mimeType:(dataUrl.match(/^data:([^;]+)/)||[])[1]||'image/jpeg', category, dataUrl, pending:true })
function useMediaSrc(media,token){
  const [src,setSrc]=useState(typeof media==='string'?media:(media?.dataUrl||''))
  useEffect(()=>{
    let objectUrl='',cancel=false
    if(typeof media==='string'){setSrc(media);return}
    if(media?.dataUrl){setSrc(media.dataUrl);return}
    if(!media?.driveFileId||!token){setSrc('');return}
    fetch(`https://www.googleapis.com/drive/v3/files/${media.driveFileId}?alt=media`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.blob():Promise.reject()).then(blob=>{if(cancel)return;objectUrl=URL.createObjectURL(blob);setSrc(objectUrl)}).catch(()=>setSrc(''))
    return()=>{cancel=true;if(objectUrl)URL.revokeObjectURL(objectUrl)}
  },[media,token])
  return src
}
function MediaImage({media,token,alt='',className='',style}){
  const src=useMediaSrc(media,token)
  return src?<img className={className} style={style} src={src} alt={alt}/>:<div className={`media-placeholder ${className}`}><FileImage size={24}/><span>{media?.driveFileId?'Connect Drive to view':'No image'}</span></div>
}
function SmartFocusImage({media,token,alt='',className=''}){
  const src=useMediaSrc(media,token)
  const [pos,setPos]=useState('50% 24%')
  useEffect(()=>{
    if(!src) return
    let cancelled=false
    const img=new Image()
    img.onload=async()=>{
      if(cancelled) return
      const fallbackY = img.naturalHeight>img.naturalWidth ? 18 : 28
      setPos(`50% ${fallbackY}%`)
      try{
        if(typeof window==='undefined' || !('FaceDetector' in window)) return
        const detector=new window.FaceDetector({fastMode:true,maxDetectedFaces:3})
        const faces=await detector.detect(img)
        if(cancelled || !faces?.length) return
        const best=[...faces].sort((a,b)=>((b.boundingBox?.width||0)*(b.boundingBox?.height||0))-((a.boundingBox?.width||0)*(a.boundingBox?.height||0)))[0]
        const box=best.boundingBox||{}
        const cx=((box.x||0)+(box.width||0)/2)/(img.naturalWidth||1)*100
        const cy=((box.y||0)+(box.height||0)*0.38)/(img.naturalHeight||1)*100
        const clamp=(v,min,max)=>Math.max(min,Math.min(max,v))
        setPos(`${clamp(cx,20,80)}% ${clamp(cy,12,55)}%`)
      }catch{}
    }
    img.onerror=()=>{}
    img.src=src
    return()=>{cancelled=true}
  },[src])
  return src?<img className={className} style={{objectPosition:pos}} src={src} alt={alt}/>:<div className={`media-placeholder ${className}`}><FileImage size={24}/><span>{media?.driveFileId?'Connect Drive to view':'No image'}</span></div>
}

function MediaSlider({items=[],token,alt='Image',variant='contain',onRemove=null}){
  const list=(items||[]).filter(Boolean),[index,setIndex]=useState(0),touchStart=useRef(null)
  useEffect(()=>{if(index>=list.length)setIndex(Math.max(0,list.length-1))},[list.length,index])
  if(!list.length)return null
  const go=n=>setIndex(i=>(i+n+list.length)%list.length)
  const endTouch=e=>{if(touchStart.current==null)return;const x=e.changedTouches?.[0]?.clientX??0,delta=x-touchStart.current;touchStart.current=null;if(Math.abs(delta)>40&&list.length>1)go(delta<0?1:-1)}
  return <div className={`media-slider media-slider-${variant}`} onTouchStart={e=>touchStart.current=e.touches?.[0]?.clientX??null} onTouchEnd={endTouch}>
    <div className="media-slider-stage"><MediaImage media={list[index]} token={token} alt={`${alt} ${index+1}`}/></div>
    {list.length>1&&<><button type="button" className="media-slide-btn prev" onClick={()=>go(-1)} aria-label="Previous image"><ChevronLeft size={20}/></button><button type="button" className="media-slide-btn next" onClick={()=>go(1)} aria-label="Next image"><ChevronRight size={20}/></button><div className="media-slide-count">{index+1} / {list.length}</div><div className="media-slide-dots">{list.map((_,i)=><button key={i} type="button" className={i===index?'active':''} onClick={()=>setIndex(i)} aria-label={`Image ${i+1}`}/>)}</div></>}
    {onRemove&&<button type="button" className="media-slide-remove" onClick={()=>onRemove(index)}><Trash2 size={14}/> Remove</button>}
  </div>
}

const readImageFile = (file, maxWidth=1600, quality=.8) => new Promise((resolve,reject)=>{
  if(!file) return resolve('')
  const reader=new FileReader()
  reader.onerror=()=>reject(new Error('Gagal membaca gambar.'))
  reader.onload=()=>{
    const img=new Image()
    img.onerror=()=>resolve(reader.result)
    img.onload=()=>{
      const scale=Math.min(1,maxWidth/img.width), w=Math.max(1,Math.round(img.width*scale)), h=Math.max(1,Math.round(img.height*scale))
      const c=document.createElement('canvas'); c.width=w; c.height=h
      c.getContext('2d').drawImage(img,0,0,w,h)
      resolve(c.toDataURL('image/jpeg',quality))
    }
    img.src=reader.result
  }
  reader.readAsDataURL(file)
})


const readAnyFile = (file) => new Promise((resolve,reject)=>{
  if(!file) return resolve('')
  const reader=new FileReader()
  reader.onerror=()=>reject(new Error('Gagal membaca fail.'))
  reader.onload=()=>resolve(reader.result)
  reader.readAsDataURL(file)
})
const escapeHtml = (v='') => String(v).replace(/[&<>\"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]))
const nl2br = (v='') => escapeHtml(v).replace(/\n/g,'<br>')
const blobToDataUrl = blob => new Promise(resolve=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.readAsDataURL(blob)})
async function mediaDataUrl(media,token){
  if(!media)return ''
  if(typeof media==='string')return media
  if(media.dataUrl)return media.dataUrl
  if(!media.driveFileId||!token)return ''
  const r=await fetch(`https://www.googleapis.com/drive/v3/files/${media.driveFileId}?alt=media`,{headers:{Authorization:`Bearer ${token}`}})
  if(!r.ok)return ''
  return blobToDataUrl(await r.blob())
}
function printWindow(html,title='strategiSK',existingWindow=null){
  const w=existingWindow||window.open('','_blank','width=1100,height=800')
  if(!w)return
  w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
  @page{margin:14mm}*{box-sizing:border-box}body{font-family:"Century Gothic",Arial,sans-serif;color:#151922;margin:0;font-size:12px;line-height:1.5}h1{font-size:24px;margin:0 0 4px}.meta{color:#666;margin-bottom:18px}.section{margin:18px 0}.section h2{font-size:15px;border-bottom:2px solid #111;padding-bottom:6px}.notes{font-size:13px;white-space:normal}.print-img{display:block;width:100%;height:auto;margin:12px 0;page-break-inside:avoid}.print-sketch{width:100%;height:auto;border:1px solid #ddd}.prompt{border:1px solid #bbb;border-radius:8px;padding:10px;margin:8px 0;page-break-inside:avoid}.link{margin:6px 0}.attachment{padding:7px 0;border-bottom:1px solid #ddd}table{width:100%;border-collapse:collapse;font-size:9px}th,td{border:1px solid #aaa;padding:6px;vertical-align:top}th{background:#eee;text-align:left}.expert-photo{width:44px;height:44px;object-fit:cover}.nowrap{white-space:nowrap}@media print{button{display:none}}
  </style></head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);w.document.close()
}

function sanitizeRichHtml(html=''){
  try{
    const doc=new DOMParser().parseFromString(`<div>${html}</div>`,'text/html')
    doc.querySelectorAll('script,style,iframe,object,embed').forEach(x=>x.remove())
    doc.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{if(/^on/i.test(a.name))el.removeAttribute(a.name)}))
    return doc.body.firstElementChild?.innerHTML||''
  }catch{return escapeHtml(String(html||''))}
}
function RichNotesEditor({html,text,onChange}){
  const ref=useRef(null)
  useEffect(()=>{if(ref.current)ref.current.innerHTML=html||escapeHtml(text||'').replace(/\n/g,'<br>')},[])
  return <div ref={ref} className="learning-notes rich-notes-editor" contentEditable suppressContentEditableWarning onInput={e=>onChange(sanitizeRichHtml(e.currentTarget.innerHTML),e.currentTarget.innerText)} data-placeholder="Conteng idea, rumusan bacaan, paste table dari ChatGPT, konsep, feedback SV..."/>
}

const defaultData = {
  schemaVersion: SCHEMA_VERSION,
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
    { id: uid(), title: 'Konsultasi SV', date: iso(), start: '10:00', end: '11:00', done:false },
    { id: uid(), title: 'Rancang carian expert', date: addDays(2), start: '14:00', end: '15:00', done:false },
  ],
  diary: [{ id: uid(), date: iso(), reflection: 'Kemaskan problem statement dan kaitkan isu document-centric e-submission.', win: 'Berjaya naikkan satu versi draft.', mood: 4, image: '', images: [], labels: ['Writing'] }],
  consultations: [{ id: uid(), date: addDays(-2), topic: 'Problem Statement & Significance', comment: 'Strengthen gap dan konteks tempatan.', action: 'Tambah data terkini dan justifikasi.', status: 'Dalam tindakan', image: '', images: [] }],
  draftHistory: [{ id: uid(), draft: 17, date: iso(), focus: 'Problem Statement', pages: 2, note: 'Kemas isu dan jurang kajian.' }],
  experts: [{ id: uid(), name: 'Expert 01', institution: 'PBT / Universiti', expertise: 'BIM e-Submission', email: '', phone: '', notes: '', image: '', status: 'Belum dihubungi', phase: 'Fuzzy Delphi', cropX: 50, cropY: 24, cropZoom: 1 }],
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
  learningFolders: [
    { id:'research', name:'Research' },
    { id:'courses', name:'Courses & Learning' },
  ],
  learningPoints: [
    { id: uid(), folderId:'research', date: iso(), title: 'Learning Point 01', notes: 'Catat apa yang dipelajari, idea, rumusan bacaan atau perkara penting di sini.', notesHtml:'', images: [], attachments: [], links: [], prompts: [], sketch: '' },
  ],
  settings: { theme: 'light', compact: false, showGraphics: true, autoSync: true },
}

function migrate(raw) {
  const merged = { ...defaultData, ...raw, schemaVersion: SCHEMA_VERSION }
  merged.experts = (merged.experts||[]).map(x=>({cropX:50,cropY:24,cropZoom:1,...x}))
  merged.profile = { ...defaultData.profile, ...(raw.profile || {}) }
  merged.settings = { ...defaultData.settings, ...(raw.settings || {}) }
  merged.weekly = { ...defaultData.weekly, ...(raw.weekly || {}) }
  merged.messageTemplates = { ...defaultData.messageTemplates, ...(raw.messageTemplates || {}) }
  merged.monthlyArchives = raw.monthlyArchives || []
  merged.timeline = raw.timeline || defaultData.timeline
  merged.learningFolders = Array.isArray(raw.learningFolders) ? raw.learningFolders : defaultData.learningFolders
  merged.events = (raw.events || defaultData.events).map(e => ({ done:false, ...e }))
  merged.diary = (raw.diary || defaultData.diary).map(d => { const base={ image:'', images:[], ...d, labels:Array.isArray(d.labels)?d.labels:[], reflection:d.reflection ?? d.text ?? '' }; base.images=Array.isArray(base.images)&&base.images.length?base.images:(base.image?[base.image]:[]); base.image=base.images[0]||base.image||''; return base })
  merged.experts = (raw.experts || defaultData.experts).map(x => ({ phone:'', notes:'', image:'', ...x }))
  merged.consultations = (raw.consultations || defaultData.consultations).map(x => { const base={ image:'', images:[], ...x }; base.images=Array.isArray(base.images)&&base.images.length?base.images:(base.image?[base.image]:[]); base.image=base.images[0]||base.image||''; return base })
  merged.learningPoints = (raw.learningPoints || defaultData.learningPoints).map(x => ({ folderId:'', images:[], attachments:[], links:[], prompts:[], sketch:'', notesHtml:'', ...x }))
  merged.draftHistory = (raw.draftHistory || defaultData.draftHistory).map(x => ({ thesisFile:null, ...x }))
  delete merged.mindMaps
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
  const [drive,setDrive]=useState({token:'',fileId:'',profile:null,syncing:false,lastSync:'',scopeOk:false,apiOk:false,fileStatus:'Belum diperiksa',lastError:'',grantedScopes:'',conflict:false,pendingCount:Number(localStorage.getItem(PENDING_COUNT_KEY)||0),lastDevice:'',syncStatus:'idle'})
  const [recovery,setRecovery]=useState({scanning:false,roots:[],canonicalRootId:localStorage.getItem(CANONICAL_ROOT_KEY)||'',orphans:[],latestMedia:null,latestBackup:null,error:''})
  const tokenClientRef=useRef(null), autoAuthTriedRef=useRef(false), idleSyncTimerRef=useRef(null)
  useEffect(()=>localStorage.setItem(APP_KEY,JSON.stringify(data)),[data])
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(t)}},[toast])
  useEffect(()=>{document.documentElement.dataset.theme=data.settings.theme},[data.settings.theme])
  useEffect(()=>{
    if(!data.settings.autoSync || !drive.token || !drive.profile) return
    const check=()=>{
      const last=Number(localStorage.getItem(LAST_AUTO_SYNC_KEY)||0)
      if(!last || Date.now()-last>=AUTO_SYNC_MS) syncDrive(drive.token,true)
    }
    check()
    const timer=setInterval(check,AUTO_SYNC_MS)
    const onVisible=()=>{if(document.visibilityState==='visible')syncDrive(drive.token,true)}
    document.addEventListener('visibilitychange',onVisible)
    window.addEventListener('focus',onVisible)
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',onVisible);window.removeEventListener('focus',onVisible)}
  },[data.settings.autoSync,drive.token,drive.profile?.email])
  const markLocalChanged=()=>{const now=new Date().toISOString();const pending=Number(localStorage.getItem(PENDING_COUNT_KEY)||0)+1;localStorage.setItem(LOCAL_UPDATED_KEY,now);localStorage.setItem(LOCAL_DIRTY_KEY,'1');localStorage.setItem(PENDING_COUNT_KEY,String(pending));setDrive(x=>({...x,pendingCount:pending,syncStatus:x.conflict?'conflict':'pending'}))}
  const localIsDirty=()=>localStorage.getItem(LOCAL_DIRTY_KEY)==='1'
  const markCloudBaseline=(savedAt,revision='')=>{const stamp=savedAt||new Date().toISOString();localStorage.setItem(LOCAL_UPDATED_KEY,stamp);localStorage.setItem(LAST_CLOUD_SEEN_KEY,stamp);if(revision)localStorage.setItem(LAST_CLOUD_REVISION_KEY,revision);localStorage.setItem(LOCAL_DIRTY_KEY,'0');localStorage.setItem(PENDING_COUNT_KEY,'0');localStorage.setItem(LAST_AUTO_SYNC_KEY,String(Date.now()));setDrive(x=>({...x,pendingCount:0,conflict:false,syncStatus:'synced'}))}
  const scheduleIdleSync=()=>{if(idleSyncTimerRef.current)clearTimeout(idleSyncTimerRef.current);idleSyncTimerRef.current=setTimeout(()=>{if(data.settings.autoSync&&drive.token&&drive.profile&&!drive.syncing)syncDrive(drive.token,true)},IDLE_SYNC_MS)}
  const update=(key,value)=>{markLocalChanged();setData(d=>({...d,[key]:typeof value==='function'?value(d[key]):value}));scheduleIdleSync()}
  useEffect(()=>{
    if(autoAuthTriedRef.current||localStorage.getItem(GOOGLE_REMEMBER_KEY)!=='1')return
    autoAuthTriedRef.current=true
    const t=setTimeout(()=>initGoogleClient((token)=>safeCloudImportAfterAuth(token,true),false,true),500)
    return()=>clearTimeout(t)
  },[])
  const showToast=(m)=>setToast(m)
  const elapsedDays=Math.max(0,Math.ceil((new Date()-new Date(data.profile.startDate))/86400000))
  const journeyTotal=Math.max(1,Math.ceil((new Date(data.profile.targetDate)-new Date(data.profile.startDate))/86400000))
  const gbtProgress=Math.min(100,Math.max(0,Math.round(elapsedDays/journeyTotal*100)))
  const targetDays=daysBetween(data.profile.targetDate), draftProgress=pct(data.profile.currentDraft,data.profile.draftGoal)
  const todayTasks=[...data.events].filter(e=>!e.done && (e.date||'')>=iso()).sort((a,b)=>`${a.date||''} ${a.start||''}`.localeCompare(`${b.date||''} ${b.start||''}`)).slice(0,6), todayEvents=data.events.filter(e=>e.date===iso()).sort((a,b)=>(a.start||'').localeCompare(b.start||''))
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
  const initGoogleClient=async(callback,forceConsent=false,silent=false)=>{
    const clientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
    if(!clientId){setModal('google-help');return}
    try{await loadGoogleIdentity()}catch(e){showToast(e.message);return}
    tokenClientRef.current=window.google.accounts.oauth2.initTokenClient({client_id:clientId,scope:GOOGLE_SCOPE,include_granted_scopes:true,callback:async(response)=>{
      if(response.error){if(!silent)showToast(`Google: ${response.error}`);return}
      const token=response.access_token
      const grantedScopes=response.scope||''
      const appDataOk=grantedScopes.includes('https://www.googleapis.com/auth/drive.appdata')||grantedScopes.includes('drive.appdata'); const mediaOk=grantedScopes.includes('https://www.googleapis.com/auth/drive.file')||grantedScopes.includes('drive.file'); const scopeOk=appDataOk&&mediaOk
      let profile=null;try{profile=await fetch('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json())}catch{}
      if(profile?.email)localStorage.setItem(GOOGLE_REMEMBER_KEY,'1');setDrive(x=>({...x,token,profile,scopeOk,grantedScopes,lastError:''}));callback?.(token)
    },error_callback:(err)=>{
      const type=err?.type||'popup_failed'
      const msg=type==='popup_failed_to_open'?'Popup Google disekat. Benarkan pop-up dan cuba semula.':type==='popup_closed'?'Login Google dibatalkan.':`Google login gagal: ${type}`
      setDrive(x=>({...x,lastError:msg}));if(!silent)showToast(msg)
    }})
    tokenClientRef.current.requestAccessToken({prompt:forceConsent?'consent':(silent?'':(localStorage.getItem(GOOGLE_REMEMBER_KEY)==='1'?'':'consent'))})
  }
  async function googleApiError(r,action){
    let detail='',reason='';try{const j=await r.clone().json();detail=j?.error?.message||j?.error_description||'';reason=j?.error?.errors?.[0]?.reason||''}catch{}
    let hint=''
    if(r.status===403 && /scope|permission|insufficient/i.test(`${detail} ${reason}`)) hint=' — Semak Google Cloud > Google Auth Platform > Data Access dan pastikan scope drive.appdata ditambah, kemudian Reconnect.'
    else if(r.status===403) hint=' — Pastikan Google Drive API Enabled dalam project Google Cloud yang sama dengan OAuth Client ID.'
    else if(r.status===401) hint=' — Token telah tamat/ditarik balik. Tekan Reconnect.'
    const msg=`${action} — Drive API ${r.status}${detail?`: ${detail}`:''}${hint}`
    setDrive(x=>({...x,apiOk:false,lastError:msg,fileStatus:'Ralat akses Drive'}))
    throw new Error(msg)
  }
  async function driveJson(token,url,options={},label='Google Drive'){
    const r=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,...(options.headers||{})}})
    if(!r.ok)await googleApiError(r,label)
    return r.status===204?{}:r.json()
  }
  async function listVisibleFolders(token,name,parentId='root'){
    const escaped=name.replace(/'/g,"\'")
    const q=new URLSearchParams({q:`name = '${escaped}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,spaces:'drive',fields:'files(id,name,createdTime,modifiedTime,parents)',orderBy:'modifiedTime desc'})
    const found=await driveJson(token,`https://www.googleapis.com/drive/v3/files?${q}`,{},`Tidak dapat mencari folder ${name}`)
    return found.files||[]
  }
  async function listChildren(token,parentId){
    const q=new URLSearchParams({q:`'${parentId}' in parents and trashed = false`,spaces:'drive',fields:'files(id,name,mimeType,createdTime,modifiedTime,parents,size)',orderBy:'createdTime desc',pageSize:'1000'})
    const found=await driveJson(token,`https://www.googleapis.com/drive/v3/files?${q}`,{},'Tidak dapat membaca kandungan folder Drive')
    return found.files||[]
  }
  async function chooseCanonicalRoot(token){
    const roots=await listVisibleFolders(token,DRIVE_ROOT_FOLDER,'root')
    const saved=localStorage.getItem(CANONICAL_ROOT_KEY)
    if(saved&&roots.some(r=>r.id===saved))return {id:saved,roots}
    if(!roots.length)return {id:'',roots}
    const expected=new Set(Object.values(MEDIA_FOLDERS)),scored=[]
    for(const root of roots){
      let children=[];try{children=await listChildren(token,root.id)}catch{}
      const folderNames=new Set(children.filter(x=>x.mimeType==='application/vnd.google-apps.folder').map(x=>x.name))
      scored.push({root,score:[...expected].filter(n=>folderNames.has(n)).length,childCount:children.length})
    }
    scored.sort((a,b)=>b.score-a.score||b.childCount-a.childCount||String(b.root.modifiedTime||'').localeCompare(String(a.root.modifiedTime||'')))
    const id=scored[0]?.root?.id||roots[0].id
    localStorage.setItem(CANONICAL_ROOT_KEY,id)
    return {id,roots}
  }
  async function ensureVisibleFolder(token,name,parentId='root'){
    if(parentId==='root'&&name===DRIVE_ROOT_FOLDER){const pick=await chooseCanonicalRoot(token);if(pick.id)return pick.id}
    const found=await listVisibleFolders(token,name,parentId)
    if(found[0])return found[0].id
    const created=await driveJson(token,'https://www.googleapis.com/drive/v3/files',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,mimeType:'application/vnd.google-apps.folder',parents:[parentId]})},`Tidak dapat mencipta folder ${name}`)
    if(parentId==='root'&&name===DRIVE_ROOT_FOLDER)localStorage.setItem(CANONICAL_ROOT_KEY,created.id)
    return created.id
  }
  async function ensureMediaFolder(token,category){
    const root=await ensureVisibleFolder(token,DRIVE_ROOT_FOLDER,'root')
    return ensureVisibleFolder(token,MEDIA_FOLDERS[category]||category,root)
  }
  async function uploadVisibleBlob(token,blob,name,category){
    const parentId=await ensureMediaFolder(token,category)
    const boundary=`strategisk_${Date.now()}`
    const meta=JSON.stringify({name,parents:[parentId]})
    const head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: ${blob.type||'application/octet-stream'}\r\n\r\n`
    const tail=`\r\n--${boundary}--`
    const body=new Blob([head,blob,tail],{type:`multipart/related; boundary=${boundary}`})
    const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body})
    if(!r.ok)await googleApiError(r,`Gagal upload ${name}`)
    return r.json()
  }
  async function migrateMediaValue(token,value,category,name){
    if(!value)return value
    if(typeof value==='object'&&value.driveFileId){const {dataUrl,pending,...rest}=value;return {...rest,pending:false}}
    const dataUrl=typeof value==='string'?value:value?.dataUrl
    if(!isDataUrl(dataUrl))return value
    const blob=dataUrlToBlob(dataUrl)
    const safeName=(value?.name||name||`${category}-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]+/g,'-')
    const uploaded=await uploadVisibleBlob(token,blob,safeName,category)
    return {id:value?.id||uid(),driveFileId:uploaded.id,name:uploaded.name||safeName,mimeType:uploaded.mimeType||blob.type,category,pending:false}
  }
  async function prepareMediaForCloud(token,source=data){
    const next=JSON.parse(JSON.stringify(source))
    for(const d of next.diary||[]){ const src=Array.isArray(d.images)&&d.images.length?d.images:(d.image?[d.image]:[]); d.images=[]; for(let i=0;i<src.length;i++) d.images.push(await migrateMediaValue(token,src[i],'diary',`diary-${d.date}-${i+1}.jpg`)); d.image=d.images[0]||'' }
    for(const x of next.consultations||[]){ const src=Array.isArray(x.images)&&x.images.length?x.images:(x.image?[x.image]:[]); x.images=[]; for(let i=0;i<src.length;i++) x.images.push(await migrateMediaValue(token,src[i],'consultation',`consultation-${x.date||Date.now()}-${i+1}.jpg`)); x.image=x.images[0]||'' }
    for(const x of next.experts||[]) x.image=await migrateMediaValue(token,x.image,'experts',`expert-${x.name||Date.now()}.jpg`)
    for(const lp of next.learningPoints||[]){
      const out=[]
      for(let i=0;i<(lp.images||[]).length;i++) out.push(await migrateMediaValue(token,lp.images[i],'learning',`learning-${lp.date||Date.now()}-${i+1}.jpg`))
      lp.images=out
      const files=[]
      for(let i=0;i<(lp.attachments||[]).length;i++) files.push(await migrateMediaValue(token,lp.attachments[i],'learningFiles',lp.attachments[i]?.name||`learning-file-${i+1}`))
      lp.attachments=files
      lp.sketch=await migrateMediaValue(token,lp.sketch,'sketches',`sketch-${lp.date||Date.now()}.png`)
    }
    next.schemaVersion=SCHEMA_VERSION
    return next
  }
  function stripLocalMedia(source){
    const clean=JSON.parse(JSON.stringify(source))
    const strip=v=>{if(v&&typeof v==='object'&&v.driveFileId){const {dataUrl,pending,...rest}=v;return rest}return v}
    for(const d of clean.diary||[]){d.images=(d.images||[]).map(strip);d.image=d.images[0]||strip(d.image)}
    for(const x of clean.consultations||[]){x.images=(x.images||[]).map(strip);x.image=x.images[0]||strip(x.image)}
    for(const x of clean.experts||[])x.image=strip(x.image)
    for(const lp of clean.learningPoints||[]){lp.images=(lp.images||[]).map(strip);lp.attachments=(lp.attachments||[]).map(strip);lp.sketch=strip(lp.sketch)}
    return clean
  }
  async function createVisibleBackup(token,backupData,label='auto'){
    const stamp=new Date().toISOString().replace(/[:.]/g,'-')
    const blob=new Blob([JSON.stringify(backupData,null,2)],{type:'application/json'})
    return uploadVisibleBlob(token,blob,`strategiSK-backup-${label}-${stamp}.json`,'backups')
  }
  async function findDriveFile(token){
    // First verify the token can access Drive at all. This gives a clearer 403 diagnosis.
    const about=await fetch('https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)',{headers:{Authorization:`Bearer ${token}`}})
    if(!about.ok)await googleApiError(about,'Token Google tidak mempunyai akses Google Drive')
    const q=new URLSearchParams({spaces:'appDataFolder',q:`name = '${DRIVE_FILE}'`,fields:'files(id,name,modifiedTime,mimeType)'});
    const r=await fetch(`https://www.googleapis.com/drive/v3/files?${q}`,{headers:{Authorization:`Bearer ${token}`}})
    if(!r.ok)await googleApiError(r,'Tidak dapat membaca appDataFolder')
    const files=(await r.json()).files||[]
    const file=files.find(f=>f.name===DRIVE_FILE)||null
    setDrive(x=>({...x,apiOk:true,fileStatus:file?`Fail ditemui: ${file.name}`:'Drive OK — fail strategiSK belum wujud',lastError:''}))
    return file
  }
  function referencedLearningMediaIds(source=data){
    const ids=new Set(),add=v=>{if(v&&typeof v==='object'&&v.driveFileId)ids.add(v.driveFileId)}
    for(const lp of source.learningPoints||[]){(lp.images||[]).forEach(add);(lp.attachments||[]).forEach(add);add(lp.sketch)}
    return ids
  }
  async function scanDriveRecovery(tokenArg=drive.token){
    const token=tokenArg||drive.token
    if(!token){showToast('Reconnect Google Drive dahulu.');return}
    setRecovery(r=>({...r,scanning:true,error:''}))
    try{
      const roots=await listVisibleFolders(token,DRIVE_ROOT_FOLDER,'root')
      const expected=new Set(Object.values(MEDIA_FOLDERS)),rootRows=[],allLearning=[],allBackups=[]
      for(const root of roots){
        let children=[];try{children=await listChildren(token,root.id)}catch{}
        const subfolders=children.filter(x=>x.mimeType==='application/vnd.google-apps.folder')
        rootRows.push({...root,score:subfolders.filter(x=>expected.has(x.name)).length,subfolders:subfolders.map(x=>({id:x.id,name:x.name}))})
        for(const folder of subfolders){
          if(folder.name==='learning-point'){const files=await listChildren(token,folder.id);files.filter(f=>String(f.mimeType||'').startsWith('image/')).forEach(f=>allLearning.push({...f,rootId:root.id,folderId:folder.id}))}
          if(folder.name==='backups'){const files=await listChildren(token,folder.id);files.filter(f=>f.mimeType==='application/json'||/\.json$/i.test(f.name||'')).forEach(f=>allBackups.push({...f,rootId:root.id,folderId:folder.id}))}
        }
      }
      rootRows.sort((a,b)=>b.score-a.score||String(b.modifiedTime||'').localeCompare(String(a.modifiedTime||'')))
      let canonical=localStorage.getItem(CANONICAL_ROOT_KEY)||''
      if(!canonical||!rootRows.some(r=>r.id===canonical)){canonical=rootRows[0]?.id||'';if(canonical)localStorage.setItem(CANONICAL_ROOT_KEY,canonical)}
      const refs=referencedLearningMediaIds(data)
      const orphans=allLearning.filter(f=>!refs.has(f.id)).sort((a,b)=>String(b.createdTime||'').localeCompare(String(a.createdTime||'')))
      const latestMedia=allLearning.slice().sort((a,b)=>String(b.createdTime||'').localeCompare(String(a.createdTime||'')))[0]||null
      const latestBackup=allBackups.slice().sort((a,b)=>String(b.createdTime||'').localeCompare(String(a.createdTime||'')))[0]||null
      setRecovery({scanning:false,roots:rootRows,canonicalRootId:canonical,orphans,latestMedia,latestBackup,error:''})
      showToast(`Drive scan selesai: ${orphans.length} orphan Learning Point image ditemui.`)
    }catch(e){setRecovery(r=>({...r,scanning:false,error:e.message}));showToast(e.message)}
  }
  function setCanonicalRoot(rootId){if(!rootId)return;localStorage.setItem(CANONICAL_ROOT_KEY,rootId);setRecovery(r=>({...r,canonicalRootId:rootId}));showToast('Canonical strategiSK root ditetapkan. Upload baru akan guna folder ini.')}
  function recoverLearningOrphans(fileIds){
    const ids=new Set(fileIds||[]),items=(recovery.orphans||[]).filter(f=>ids.has(f.id))
    if(!items.length){showToast('Pilih sekurang-kurangnya satu gambar orphan.');return}
    const groups={}
    for(const f of items){const d=new Date(f.createdTime||Date.now()),key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;(groups[key]??=[]).push(f)}
    const recovered=Object.entries(groups).map(([date,files])=>({id:uid(),title:`Recovered Learning Point — ${date}`,date,folderId:'',notes:'Recovered from orphan media found in Google Drive. Please rename and reorganise this Learning Point.',images:files.sort((a,b)=>String(a.createdTime||'').localeCompare(String(b.createdTime||''))).map(f=>({id:uid(),driveFileId:f.id,name:f.name||'recovered-image',mimeType:f.mimeType||'image/jpeg',category:'learning',pending:false})),attachments:[],links:[],prompts:[],sketch:''}))
    update('learningPoints',xs=>[...recovered,...xs]);setRecovery(r=>({...r,orphans:r.orphans.filter(f=>!ids.has(f.id))}));showToast(`${items.length} gambar berjaya dipulihkan ke ${recovered.length} Learning Point.`)
  }

  async function uploadDriveData(token,existing=null,{backup=true}={}){
    const savedAt=new Date().toISOString()
    let migrated=await prepareMediaForCloud(token,data)
    migrated={...migrated,schemaVersion:SCHEMA_VERSION}
    if(existing&&backup){
      try{const previous=await fetchRemoteData(token,existing);await createVisibleBackup(token,previous,'before-update')}catch(e){console.warn('Backup snapshot gagal:',e)}
    }
    setData(migrated)
    const cloudData=stripLocalMedia(migrated)
    const revision=(crypto?.randomUUID?.()||`rev-${Date.now()}-${Math.random().toString(36).slice(2)}`); const body=JSON.stringify({...cloudData,meta:{savedAt,revision,version:SCHEMA_VERSION,deviceId:getDeviceId(),deviceName:getDeviceName()}})
    let r
    if(existing){r=await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=media`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body})}
    else{const boundary='strategisk_boundary';const multipart=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({name:DRIVE_FILE,parents:['appDataFolder'],mimeType:'application/json'})}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body:multipart})}
    if(!r.ok)await googleApiError(r,existing?'Gagal mengemas kini fail Drive':'Gagal mencipta fail strategiSK')
    const result=await r.json();localStorage.setItem(LOCAL_UPDATED_KEY,savedAt);setDrive(x=>({...x,apiOk:true,fileStatus:'Fail strategiSK tersedia',lastError:''}));return {id:result.id||existing?.id||'',savedAt,revision}
  }
  async function fetchRemoteData(token,existing){const r=await fetch(`https://www.googleapis.com/drive/v3/files/${existing.id}?alt=media`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok)await googleApiError(r,'Gagal memuat turun data Google Drive');return r.json()}
  async function testDrive(token=drive.token){
    if(token && typeof token !== 'string') token = drive.token
    if(!token)return initGoogleClient(testDrive,true)
    setDrive(x=>({...x,syncing:true,lastError:'',fileStatus:'Memeriksa...'}))
    try{const existing=await findDriveFile(token);await ensureVisibleFolder(token,DRIVE_ROOT_FOLDER,'root');setDrive(x=>({...x,syncing:false,apiOk:true,fileStatus:existing?`Data + folder media OK`:'Drive API OK — data belum wujud'}));showToast(existing?'Drive OK: data appDataFolder dan folder media strategiSK boleh diakses.':'Drive OK. Folder media strategiSK tersedia; tekan Sync Dua Hala untuk cipta data.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function safeCloudImportAfterAuth(token, quiet=false){
    if(!token||typeof token!=='string')return
    setDrive(x=>({...x,syncing:true,lastError:'',fileStatus:'Memeriksa...'}))
    try{
      const existing=await findDriveFile(token)
      await ensureVisibleFolder(token,DRIVE_ROOT_FOLDER,'root')
      if(!existing)throw new Error('Drive berjaya disambung, tetapi strategiSK-data.json belum wujud dalam cloud. Gunakan Paksa Simpan hanya jika peranti ini memang mengandungi data utama.')
      setDrive(x=>({...x,apiOk:true,fileStatus:'Data + folder media OK',lastError:''}))
      const remote=await fetchRemoteData(token,existing)
      const meta=remote.meta||{}
      const savedAt=meta.savedAt||existing.modifiedTime||new Date().toISOString(), revision=meta.revision||'', lastDevice=meta.deviceName||''
      if(localIsDirty()){
        const baseRev=localStorage.getItem(LAST_CLOUD_REVISION_KEY)||'', baseStamp=localStorage.getItem(LAST_CLOUD_SEEN_KEY)||''
        const changed=baseRev&&revision?revision!==baseRev:!!baseStamp&&new Date(savedAt).getTime()>new Date(baseStamp).getTime()+1000
        setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:'',apiOk:true,fileStatus:changed?'CONFLICT — cloud lebih baru':`Fail ditemui: ${DRIVE_FILE}`,lastError:'',conflict:changed,lastDevice,syncStatus:changed?'conflict':'pending'}))
        if(!quiet)showToast(changed?'Perubahan cloud dikesan pada device lain. Sync dihentikan supaya data tidak ditindih.':'Login berjaya. Device ini ada perubahan belum sync.')
        return
      }
      if(!quiet)showToast('Drive OK. Mengambil data terkini dari Google Drive...')
      delete remote.meta
      setData(migrate(remote))
      markCloudBaseline(savedAt,revision)
      setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail ditemui: ${DRIVE_FILE}`,lastError:''}))
      if(!quiet)showToast('Data terkini Google Drive berjaya dimuatkan ke peranti ini.')
    }catch(e){
      setDrive(x=>({...x,syncing:false,lastError:e.message,fileStatus:'Import Drive gagal'}))
      if(!quiet)showToast(`Import dihentikan: ${e.message}`)
    }
  }
  async function reconnectDrive(){
    try{if(drive.token&&window.google?.accounts?.oauth2?.revoke)await new Promise(resolve=>window.google.accounts.oauth2.revoke(drive.token,()=>resolve()))}catch{}
    setDrive({token:'',fileId:'',profile:null,syncing:false,lastSync:'',scopeOk:false,apiOk:false,fileStatus:'Belum diperiksa',lastError:'',grantedScopes:'',conflict:false,pendingCount:Number(localStorage.getItem(PENDING_COUNT_KEY)||0),lastDevice:'',syncStatus:'idle'})
    setTimeout(()=>initGoogleClient((token)=>safeCloudImportAfterAuth(token,false),true),100)
  }
  async function profileReconnectTestSync(){
    if(drive.syncing)return
    showToast('Menyambung Google, semak cloud revision dan sync dengan selamat...')
    const afterAuth=async(token)=>syncDrive(token,false)
    try{
      await initGoogleClient(afterAuth,false)
    }catch(e){
      setDrive(x=>({...x,syncing:false,lastError:e.message}))
      showToast(e.message)
    }
  }
  async function saveDrive(token=drive.token){
    if(token && typeof token !== 'string') token=drive.token
    if(!token)return initGoogleClient(saveDrive,true)
    setDrive(x=>({...x,syncing:true}))
    try{
      const existing=await findDriveFile(token),result=await uploadDriveData(token,existing)
      markCloudBaseline(result.savedAt,result.revision)
      setDrive(x=>({...x,fileId:result.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'})}))
      showToast('Data peranti ini berjaya disimpan ke Google Drive.')
    }catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function loadDrive(token=drive.token){
    if(token && typeof token !== 'string') token=drive.token
    if(!token)return initGoogleClient(loadDrive,true)
    setDrive(x=>({...x,syncing:true}))
    try{
      const existing=await findDriveFile(token)
      if(!existing)throw new Error('Drive API OK tetapi fail strategiSK belum wujud. Gunakan Paksa Simpan hanya pada peranti yang memang mempunyai data utama.')
      const remote=await fetchRemoteData(token,existing),meta=remote.meta||{},savedAt=meta.savedAt||existing.modifiedTime,revision=meta.revision||''
      try{if(localIsDirty())await createVisibleBackup(token,data,'local-before-force-download')}catch{}
      delete remote.meta
      setData(migrate(remote));markCloudBaseline(savedAt||new Date().toISOString(),revision)
      setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail ditemui: ${DRIVE_FILE}`,lastError:''}))
      showToast('Data Google Drive berjaya dimuatkan ke peranti ini.')
    }catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function syncDrive(token=drive.token,quiet=false){
    if(token && typeof token !== 'string') token=drive.token
    if(!token)return initGoogleClient((fresh)=>syncDrive(fresh,quiet),false)
    setDrive(x=>({...x,syncing:true,lastError:''}))
    try{
      const existing=await findDriveFile(token)
      const dirty=localIsDirty()
      if(!existing){
        if(!dirty){
          setDrive(x=>({...x,syncing:false,apiOk:true,fileStatus:'Drive OK — data belum wujud'}))
          if(!quiet)showToast('Fail cloud belum wujud. Tiada perubahan device dihantar. Gunakan Paksa Simpan jika peranti ini memang data utama.')
          return
        }
        const result=await uploadDriveData(token)
        markCloudBaseline(result.savedAt,result.revision)
        setDrive(x=>({...x,fileId:result.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail dicipta: ${DRIVE_FILE}`}))
        if(!quiet)showToast('Perubahan device disimpan sebagai data cloud pertama.')
        return
      }
      const remote=await fetchRemoteData(token,existing)
      const remoteMeta=remote.meta||{}
      const remoteSavedAt=remoteMeta.savedAt||existing.modifiedTime||new Date().toISOString(),remoteRevision=remoteMeta.revision||'',remoteDevice=remoteMeta.deviceName||''
      const remoteTime=new Date(remoteSavedAt).getTime()||0
      const baselineStamp=localStorage.getItem(LAST_CLOUD_SEEN_KEY)||'',baselineRevision=localStorage.getItem(LAST_CLOUD_REVISION_KEY)||''
      const baselineTime=baselineStamp?new Date(baselineStamp).getTime():0

      if(dirty){
        const cloudAlsoChanged=baselineRevision&&remoteRevision?remoteRevision!==baselineRevision:(baselineTime>0&&remoteTime>baselineTime+1000)
        if(cloudAlsoChanged){
          try{await createVisibleBackup(token,data,'conflict-local-pending')}catch{}
          setDrive(x=>({...x,syncing:false,conflict:true,lastDevice:remoteDevice,fileStatus:'CONFLICT — cloud lebih baru',syncStatus:'conflict'}))
          if(!quiet)showToast(`Sync dihentikan: cloud berubah${remoteDevice?` pada ${remoteDevice}`:''}. Pilih penyelesaian konflik dalam Settings.`)
          return
        }
        const result=await uploadDriveData(token,existing,{backup:false})
        markCloudBaseline(result.savedAt,result.revision)
        if(!quiet)showToast('Perubahan terbaru device berjaya disimpan ke Google Drive.')
      }else{
        delete remote.meta
        setData(migrate(remote))
        markCloudBaseline(remoteSavedAt,remoteRevision)
        setDrive(x=>({...x,lastDevice:remoteDevice}))
        if(!quiet)showToast(remoteTime>baselineTime?'Data terbaru dari Google Drive dimuatkan ke device.':'Device sudah menggunakan data cloud terkini.')
      }
      setDrive(x=>({...x,fileId:existing.id,syncing:false,lastSync:new Date().toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'}),apiOk:true,fileStatus:`Fail ditemui: ${DRIVE_FILE}`,lastError:''}))
    }catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));if(!quiet)showToast(e.message)}
  }

  async function resolveConflictKeepCloud(token=drive.token){
    if(!token)return initGoogleClient(resolveConflictKeepCloud,false)
    try{setDrive(x=>({...x,syncing:true}));const existing=await findDriveFile(token);if(!existing)throw new Error('Data cloud tidak ditemui.');try{await createVisibleBackup(token,data,'conflict-local-before-cloud')}catch{};const remote=await fetchRemoteData(token,existing),meta=remote.meta||{};delete remote.meta;setData(migrate(remote));markCloudBaseline(meta.savedAt||existing.modifiedTime||new Date().toISOString(),meta.revision||'');setDrive(x=>({...x,syncing:false,conflict:false,lastDevice:meta.deviceName||'',fileStatus:'Conflict selesai — cloud digunakan'}));showToast('Conflict selesai: data cloud terbaru digunakan. Salinan local dibuat sebagai backup.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function resolveConflictKeepLocal(token=drive.token){
    if(!token)return initGoogleClient(resolveConflictKeepLocal,false)
    try{setDrive(x=>({...x,syncing:true}));const existing=await findDriveFile(token);if(existing){try{const remote=await fetchRemoteData(token,existing);await createVisibleBackup(token,remote,'conflict-cloud-before-local')}catch{}}const result=await uploadDriveData(token,existing,{backup:false});markCloudBaseline(result.savedAt,result.revision);setDrive(x=>({...x,syncing:false,conflict:false,lastDevice:getDeviceName(),fileStatus:'Conflict selesai — device ini digunakan'}));showToast('Conflict selesai: perubahan device ini disimpan. Versi cloud lama dibackup.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }

  async function manualDriveBackup(token=drive.token){
    if(token && typeof token !== 'string') token=drive.token
    if(!token)return initGoogleClient(manualDriveBackup,true)
    try{setDrive(x=>({...x,syncing:true}));await createVisibleBackup(token,data,'manual');setDrive(x=>({...x,syncing:false}));showToast('Snapshot manual disimpan dalam My Drive > strategiSK > backups.')}catch(e){setDrive(x=>({...x,syncing:false,lastError:e.message}));showToast(e.message)}
  }
  async function uploadLearningAttachment(file){
    if(!file)throw new Error('Tiada fail dipilih.')
    if(!drive.token)throw new Error('Google Drive belum disambungkan.')
    const uploaded=await uploadVisibleBlob(drive.token,file,file.name,'learningFiles')
    return {id:uid(),driveFileId:uploaded.id,name:uploaded.name||file.name,mimeType:uploaded.mimeType||file.type||'application/octet-stream',category:'learningFiles',pending:false}
  }
  async function uploadDraftAttachment(file){
    if(!file)throw new Error('Tiada fail tesis dipilih.')
    if(!drive.token)throw new Error('Google Drive belum disambungkan.')
    const uploaded=await uploadVisibleBlob(drive.token,file,file.name,'thesis')
    return {id:uid(),driveFileId:uploaded.id,name:uploaded.name||file.name,mimeType:uploaded.mimeType||file.type||'application/vnd.openxmlformats-officedocument.wordprocessingml.document',category:'thesis',pending:false}
  }
  function exportJson(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`strategiSK-backup-${iso()}.json`;a.click();URL.revokeObjectURL(a.href)}
  function importJson(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{markLocalChanged();setData(migrate(JSON.parse(reader.result)));showToast('Backup berjaya diimport.')}catch{showToast('Fail JSON tidak sah.')}};reader.readAsText(file)}
  function sendWhatsApp(text){const phone=data.profile.whatsapp.replace(/\D/g,'');if(!phone)return showToast('Masukkan nombor WhatsApp di Settings.');window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer')}
  async function sendTelegram(text){try{if(!data.profile.telegramChatId)throw new Error('Masukkan Telegram Chat ID di Settings.');const r=await fetch('/api/telegram',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:data.profile.telegramChatId,text})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Gagal menghantar Telegram.');showToast('Mesej berjaya dihantar ke Telegram.')}catch(e){showToast(e.message)}}

  const menu=[['dashboard',Home,'Dashboard'],['calendar',CalendarDays,'Calendar & Diary'],['learning',Lightbulb,'Learning Point'],['draft',FileText,'Draft 111 Tracker'],['chapters',BookOpen,'Chapter Tracker'],['data',Database,'Data Collection'],['analysis',LineChart,'Data Analysis'],['experts',Users,'Expert List'],['publications',GraduationCap,'Publication Tracker'],['weekly',Target,'Weekly Target'],['monthly',Flag,'Monthly Target'],['consultation',MessageCircle,'SV Consultation'],['settings',Settings,'Settings']]
  const title=menu.find(m=>m[0]===page)?.[2]||'Dashboard'
  const props={data,update,setModal,showToast,driveToken:drive.token,uploadLearningAttachment,uploadDraftAttachment}
  return <div className={`app ${data.settings.compact?'compact':''}`}>
    <aside className={`sidebar ${sidebar?'open':''}`}><button className="brand brand-button" type="button" aria-label="Go to Dashboard" title="Dashboard" onClick={()=>{setPage('dashboard');setSidebar(false);window.scrollTo({top:0,behavior:'smooth'})}}><div className="brand-shield">SK</div><div><div className="brand-name">strategi<span>SK</span></div><div className="brand-tag">{data.profile.tagline}</div></div></button><nav>{menu.map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>{setPage(id);setSidebar(false)}}><Icon size={18}/><span>{label}</span></button>)}</nav><div className="side-progress"><div className="side-progress-head"><span>GBT PROGRESS</span></div><Ring value={gbtProgress} label="perjalanan" size={104}/><div className="side-stat"><span>Target GBT</span><b>30 bulan</b></div><div className="side-stat"><span>Hari berbaki</span><b>{targetDays}</b></div><button className="primary full" onClick={()=>setModal('progress')}><Gauge size={16}/> Lihat Butiran</button><Rocket className="side-rocket" size={46}/></div></aside>
    {sidebar&&<div className="sidebar-scrim" onClick={()=>setSidebar(false)}/>}<main><header className="topbar"><button className="icon-btn menu-btn" onClick={()=>setSidebar(true)}><Menu/></button><div className="welcome"><h1>{page==='dashboard'?<>Selamat kembali, <span className="welcome-name">{data.profile.name}</span></>:title}</h1><p>{page==='dashboard'?`Perjalanan pembelajaran Hari ke-${Math.max(1,elapsedDays)} SK`:'Urus dan kemaskini rekod'}</p></div><div className="top-actions"><button className="icon-btn" onClick={()=>update('settings',s=>({...s,theme:s.theme==='dark'?'light':'dark'}))}>{data.settings.theme==='dark'?<Sun/>:<Moon/>}</button>{drive.profile&&<button className="drive-button" onClick={()=>syncDrive()}><Cloud size={18}/><span>{drive.syncing?'Menyegerak...':drive.conflict?'Conflict':drive.pendingCount>0?`${drive.pendingCount} Pending`:'Synced'}</span></button>}<button className="avatar avatar-sync" type="button" onClick={profileReconnectTestSync} disabled={drive.syncing} title="Sign in / refresh Google Drive session" aria-label="Sign in / refresh Google Drive session"><CircleUserRound/><span>{drive.syncing?'CONNECTING...':(drive.profile?.given_name||'SIGN IN')}</span></button></div></header>
      <section className="content">
        {page==='dashboard'&&<Dashboard {...props} targetDays={targetDays} gbtProgress={gbtProgress} draftProgress={draftProgress} todayTasks={todayTasks} todayEvents={todayEvents} weeklyProgress={weeklyProgress}/>} 
        {page==='calendar'&&<CalendarPage {...props}/>} {page==='learning'&&<LearningPointPage {...props}/>} {page==='draft'&&<DraftPage {...props} setEditingDraft={setEditingDraft}/>} 
        {page==='chapters'&&<SimpleProgressPage title="Chapter Tracker" items={data.chapters} setItems={v=>update('chapters',v)} nameKey="name"/>}
        {page==='data'&&<ResearchDataPage {...props}/>} {page==='analysis'&&<SimpleProgressPage title="Data Analysis" items={data.analysis} setItems={v=>update('analysis',v)} nameKey="name"/>}
        {page==='experts'&&<ExpertsPage {...props}/>} {page==='publications'&&<PublicationsPage {...props}/>} 
        {page==='weekly'&&<WeeklyPage {...props} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram}/>} {page==='monthly'&&<MonthlyPage {...props}/>} {page==='consultation'&&<ConsultationPage {...props}/>} 
        {page==='settings'&&<SettingsPage {...props} drive={drive} saveDrive={saveDrive} loadDrive={loadDrive} syncDrive={syncDrive} testDrive={testDrive} reconnectDrive={reconnectDrive} exportJson={exportJson} importJson={importJson} manualDriveBackup={manualDriveBackup} resolveConflictKeepCloud={resolveConflictKeepCloud} resolveConflictKeepLocal={resolveConflictKeepLocal} recovery={recovery} scanDriveRecovery={scanDriveRecovery} setCanonicalRoot={setCanonicalRoot} recoverLearningOrphans={recoverLearningOrphans}/>} 
      </section></main>
    <nav className="mobile-nav">{[['dashboard',Home,'Home'],['calendar',CalendarDays,'Kalendar'],['learning',Lightbulb,'Learning'],['weekly',Target,'Weekly'],['settings',Settings,'More']].map(([id,Icon,label])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={20}/><span>{label}</span></button>)}</nav>
    {!drive.profile&&<div className="auth-lock"><div className="auth-lock-card"><div className="brand-shield auth-lock-logo">SK</div><span className="eyebrow">PERSONAL GOOGLE DRIVE</span><h2>Sign in sebelum guna strategiSK</h2><p>Untuk elak data device lama menimpa Drive, semua fungsi dikunci sehingga akaun Google berjaya disambungkan. Jika device ini tiada perubahan belum sync, app akan terus memuatkan data terbaru dari Drive.</p><button className="primary auth-signin" onClick={profileReconnectTestSync} disabled={drive.syncing}><CircleUserRound size={18}/>{drive.syncing?'Menyambung...':'Sign in Google'}</button><small>Selepas berjaya, sesi Google akan cuba dipulihkan secara automatik pada kunjungan seterusnya selagi sesi Google pada browser masih aktif.</small></div></div>}
    {toast&&<div className="toast"><Check size={18}/>{toast}</div>}
    {(modal==='event'||modal?.type==='event')&&<EventModal {...props} initialDate={modal?.date||iso()} close={()=>setModal(null)}/>} {(modal==='diary'||modal?.type==='diary')&&<DiaryModal {...props} initialDate={modal?.date||iso()} initialId={modal?.id||null} close={()=>setModal(null)}/>} 
    {modal==='draft'&&<DraftModal {...props} initial={editingDraft} close={()=>{setModal(null);setEditingDraft(null)}}/>} {modal==='countdown'&&<CountdownModal {...props} close={()=>setModal(null)}/>} {modal==='timeline'&&<TimelineModal {...props} close={()=>setModal(null)}/>} 
    {modal==='progress'&&<ProgressModal data={data} gbtProgress={gbtProgress} draftProgress={draftProgress} targetDays={targetDays} close={()=>setModal(null)}/>} 
    {modal==='google-help'&&<Modal title="Sediakan Google Drive Sync" onClose={()=>setModal(null)}><div className="help-text"><p>Anda tidak perlu mencari atau memuat turun item bernama <b>drive.appdata</b>. Ia ialah nama kebenaran OAuth yang dimasukkan dalam kod aplikasi.</p><p>Di Google Cloud Console: enable <b>Google Drive API</b>, cipta OAuth Web Client ID, tambah alamat Vercel sebagai Authorized JavaScript Origin, kemudian masukkan Client ID itu sebagai:</p><code>VITE_GOOGLE_CLIENT_ID</code><p>Apabila anda tekan Sambung Drive, Google akan meminta izin untuk strategiSK mengurus fail datanya sendiri.</p></div></Modal>}
  </div>
}

function Dashboard({data,update,setModal,targetDays,gbtProgress,draftProgress,todayTasks,todayEvents,weeklyProgress,driveToken}) {
  const [diaryIndex,setDiaryIndex]=useState(0)
  const todayKey=iso()
  const diarySorted=useMemo(()=>data.diary.filter(d=>d.date===todayKey).sort((a,b)=>(a.createdAt||a.id||'').localeCompare(b.createdAt||b.id||'')),[data.diary,todayKey])
  useEffect(()=>{if(diaryIndex>=diarySorted.length)setDiaryIndex(Math.max(0,diarySorted.length-1))},[diarySorted.length,diaryIndex])
  const diary=diarySorted[diaryIndex]
  const countdowns=[...data.countdowns.slice(0,3),{label:'GBT Target — 2.5 Years',date:data.profile.targetDate,type:'long'}]
  return <>
    <div className="section-title"><div><h2>DAYS REMAINING</h2><p>Short, mid and long-term research targets</p></div><button className="soft-btn" onClick={()=>setModal('countdown')}><Target size={16}/> Manage Targets</button></div>
    <div className="countdown-grid">{countdowns.map((c,i)=><div key={c.id||'long'} className={`countdown-card ${c.type}`}><div><span>{c.type==='short'?'SHORT TERM':c.type==='mid'?'MID TERM':'LONG TERM'}</span><h3>{c.label}</h3><strong>{daysBetween(c.date)} <small>Days</small></strong><p><CalendarDays size={14}/>{formatDate(c.date)}</p></div><span className="countdown-icon">{i===3?<Rocket/>:i===2?<Users/>:i===1?<Edit3/>:<CalendarDays/>}</span></div>)}</div>

    <div className="card task-highlight"><CardTitle title="Task Assignment — Calendar Activity" icon={<ListChecks/>}/><div className="task-list dashboard-task-list">{todayTasks.length?todayTasks.map(t=><label key={t.id} className="task-row"><input type="checkbox" checked={!!t.done} onChange={()=>update('events',xs=>xs.map(x=>x.id===t.id?{...x,done:!x.done}:x))}/><span className={t.done?'done':''}>{t.title}</span><small>{formatDate(t.date,{day:'numeric',month:'short'})} • {t.start||'--:--'}–{t.end||'--:--'}</small></label>):<p>No upcoming calendar activity.</p>}</div><button className="link-btn" onClick={()=>setModal({type:'event',date:iso()})}>Add activity <Plus size={15}/></button></div>

    <div className="dashboard-workspace">
      <div className="dashboard-core">
        <div className="card timeline-card"><div className="card-slider-head"><CardTitle title="2.5-Year Gantt Timeline" icon={<Trophy/>}/><button className="soft-btn" onClick={()=>setModal('timeline')}><Edit3 size={15}/> Edit Timeline</button></div><GanttTimeline data={data} gbtProgress={gbtProgress}/></div>
        <div className="card chapter-progress-card"><CardTitle title="Chapter Writing Progress" icon={<BookOpen/>}/><ChapterSpiderChart items={data.chapters}/></div>
        <div className="card draft-card draft-card-wide"><CardTitle title="Draft 111 Tracker" icon={<LineChart/>}/><div className="draft-card-centered"><Ring value={draftProgress} label={`${data.profile.currentDraft}/${data.profile.draftGoal}`} size={152}/><div className="metric-label draft-current">Current Draft <b>{String(data.profile.currentDraft).padStart(3,'0')}</b></div><button className="primary draft-update-btn" onClick={()=>setModal('draft')}><Edit3 size={16}/> Update Draft</button></div></div>
        <div className="card full-progress-card"><CardTitle title="Data Collection Progress" icon={<Database/>}/><ProgressList items={data.researchPhases}/></div>
        <div className="card full-progress-card"><CardTitle title="Data Analysis Progress" icon={<LineChart/>}/><ProgressList items={data.analysis}/></div>
        <div className="card weekly-target-card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="split-chart weekly-summary"><Ring value={weeklyProgress} label="complete" size={104}/><div className="mini-list"><span>Draft <b>{data.weekly.draftPages}/{data.weekly.draftTarget} pages</b></span><span>Reading <b>{data.weekly.articles}/{data.weekly.articleTarget} articles</b></span><span>Writing <b>{data.weekly.writingHours}/{data.weekly.writingTarget} hrs</b></span></div></div></div>
        <div className="card mountain-card"><CardTitle title="Monthly Progress" icon={<Flag/>}/><div className="monthly-progress-layer"><ProgressList items={data.monthly.targets}/></div><div className="mountain"><Flag/></div></div>
        <div className="card consultation-dashboard-card"><CardTitle title="Latest SV Consultation" icon={<MessageCircle/>}/>{data.consultations[0]?<div className="consult-mini"><b>{data.consultations[0].topic}</b><p>{data.consultations[0].comment}</p><small>Action: {data.consultations[0].action}</small><span className={`status-pill ${statusClass(data.consultations[0].status)}`}>{data.consultations[0].status}</span></div>:<p className="muted">No consultation record yet.</p>}</div>
      </div>
      <aside className="dashboard-today-rail">
        <div className="card schedule-card"><CardTitle title="Today's Schedule" icon={<CalendarDays/>}/><p className="muted">{new Date().toLocaleDateString('en-MY',{weekday:'long',day:'numeric',month:'long'})}</p><div className="schedule-list">{todayEvents.map(e=><div key={e.id} className="schedule red-only"><b>{e.start}–{e.end}</b><span>{e.title}</span></div>)}</div><button className="link-btn" onClick={()=>setModal('event')}>Add activity <Plus size={15}/></button></div>
        <div className="card slider-card"><div className="card-slider-head"><CardTitle title="Daily Diary" icon={<BookOpen/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><DiarySnippet diary={diary} date={todayKey}/><button className="link-btn" onClick={()=>setModal('diary')}>Write diary <Edit3 size={15}/></button></div>
        <div className="card win-card slider-card"><div className="card-slider-head"><CardTitle title="Today's Win" icon={<Trophy/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><small>{formatDate(todayKey)}</small><p>{diary?.win||'No small win recorded yet.'}</p><Sparkles size={48}/></div>
        <div className="card diary-photo-card slider-card"><div className="card-slider-head"><CardTitle title="Diary Photo" icon={<FileImage/>}/><SliderButtons index={diaryIndex} total={diarySorted.length} setIndex={setDiaryIndex}/></div><small>{formatDate(todayKey)}</small>{diary?.image?<div className="diary-photo-view"><MediaImage media={diary.image} token={driveToken} alt={`Diary ${diary.date}`}/></div>:<div className="diary-photo-empty"><ImagePlus/><span>No photo for this day</span></div>}<button className="link-btn" onClick={()=>setModal('diary')}>Add photo <ImagePlus size={15}/></button></div>
      </aside>
    </div>
  </>
}
function SliderButtons({index,total,setIndex}){return <div className="slider-buttons"><button className="icon-btn" disabled={index>=total-1} onClick={()=>setIndex(Math.min(total-1,index+1))}><ChevronLeft size={17}/></button><span>{total?index+1:0}/{total}</span><button className="icon-btn" disabled={index<=0} onClick={()=>setIndex(Math.max(0,index-1))}><ChevronRight size={17}/></button></div>}
function DiarySnippet({diary,date}){return diary?<div className="diary-snippet"><small>{formatDate(date||diary.date)}</small><p><b>Reflection:</b> {diary.reflection}</p><div className="mood">Mood {'●'.repeat(diary.mood)}{'○'.repeat(5-diary.mood)}</div></div>:<div className="diary-snippet"><small>{formatDate(date||iso())}</small><p className="muted">No diary entry for today yet.</p></div>}
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
              const selected=i>=row.startMonth && i<row.startMonth+activeCount
              if(!selected)return <span key={i} className="gdot-slot"/>
              let cls=i<row.startMonth+doneCount?'done':'plan'
              if(i===nowIndex) cls += ' now'
              return <span key={i} className={`gdot ${cls}`}/>
            })}
          </div>
          <small>{new Date(addMonths(start,row.startMonth)+'T00:00').toLocaleDateString('en-MY',{month:'short',year:'2-digit'})} – {new Date(addMonths(start,row.startMonth+row.duration)+'T00:00').toLocaleDateString('en-MY',{month:'short',year:'2-digit'})}</small>
        </div>
      })}
    </div>
  </div>}

function CalendarPage({data,update,setModal,driveToken}){
  const [selected,setSelected]=useState(iso()),[month,setMonth]=useState(new Date()),[query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[view,setView]=useState('calendar'),[timelineLabel,setTimelineLabel]=useState('ALL')
  const days=useMemo(()=>{const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),arr=[];for(let i=0;i<(first.getDay()+6)%7;i++)arr.push(null);for(let d=1;d<=last.getDate();d++)arr.push(new Date(y,m,d));return arr},[month])
  const selectedEvents=data.events.filter(e=>e.date===selected).sort((a,b)=>(a.start||'').localeCompare(b.start||'')),selectedDiaries=data.diary.filter(d=>d.date===selected).sort((a,b)=>(a.createdAt||a.id||'').localeCompare(b.createdAt||b.id||''))
  const allLabels=useMemo(()=>Array.from(new Set(data.diary.flatMap(d=>d.labels||[]).map(x=>String(x).trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b)),[data.diary])
  const searchResults=useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return[];const rows=[];data.events.forEach(e=>{if(`${e.title} ${e.date} ${e.start} ${e.end}`.toLowerCase().includes(q))rows.push({id:`event-${e.id}`,type:'Activity',date:e.date,title:e.title,detail:`${e.start}–${e.end}`})});data.diary.forEach(d=>{if(`${d.reflection||''} ${d.win||''} ${(d.labels||[]).join(' ')} ${d.date}`.toLowerCase().includes(q))rows.push({id:`diary-${d.id}`,type:'Diary',date:d.date,title:(d.reflection||'Diary entry').slice(0,90),detail:(d.labels||[]).join(' • ')||d.win||''})});return rows.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30)},[query,data.events,data.diary])
  const jumpTo=date=>{setSelected(date);const d=new Date(date+'T00:00:00');setMonth(new Date(d.getFullYear(),d.getMonth(),1));setQuery('');setView('calendar')}
  const filterByLabel=x=>{setTimelineLabel(x);setView('timeline');setSearchOpen(false);setQuery('')}
  const printCalendar=async()=>{
    const tab=window.open('','_blank','width=1100,height=800');if(!tab)return
    tab.document.write('<p style="font-family:Arial;padding:30px">Preparing Calendar & Diary…</p>')
    if(view==='calendar'){
      const rows=[]
      for(const d of selectedDiaries){const img=await mediaDataUrl(d.image,driveToken);rows.push(`<div class="section"><h2>Diary Story</h2>${(d.labels||[]).length?`<p>${d.labels.map(x=>`<b>#${escapeHtml(x)}</b>`).join(' &nbsp; ')}</p>`:''}<div class="notes">${nl2br(d.reflection||'')}</div>${img?`<img class="print-img" src="${img}">`:''}${d.win?`<p><b>Win:</b> ${escapeHtml(d.win)}</p>`:''}</div>`)}
      const acts=selectedEvents.map(e=>`<tr><td>${escapeHtml(e.start||'')}</td><td>${escapeHtml(e.end||'')}</td><td>${escapeHtml(e.title||'')}</td><td>${e.done?'Completed':'Open'}</td></tr>`).join('')
      printWindow(`<h1>Calendar & Diary</h1><div class="meta">${escapeHtml(formatDate(selected,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))} • ${escapeHtml(formatHijri(selected))}</div>${acts?`<div class="section"><h2>Activities</h2><table><tr><th>Start</th><th>End</th><th>Activity</th><th>Status</th></tr>${acts}</table></div>`:''}${rows.join('')}`,`Calendar & Diary ${selected}`,tab)
    }else{
      const allTime=timelineLabel!=='ALL'&&timelineLabel!=='Activity'
      const pref=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`
      const ds=data.diary.filter(d=>allTime?(d.labels||[]).includes(timelineLabel):d.date?.startsWith(pref)).filter(d=>timelineLabel==='ALL'||timelineLabel==='Activity'?timelineLabel!=='Activity':(d.labels||[]).includes(timelineLabel))
      const es=data.events.filter(e=>!allTime&&e.date?.startsWith(pref)).filter(()=>timelineLabel==='ALL'||timelineLabel==='Activity')
      const items=[...ds.map(d=>({date:d.date,type:'Diary',text:d.reflection||'',extra:(d.labels||[]).join(', ')})),...es.map(e=>({date:e.date,type:'Activity',text:e.title||'',extra:`${e.start||''}–${e.end||''}`}))].sort((a,b)=>a.date.localeCompare(b.date))
      printWindow(`<h1>${allTime?`Label: ${escapeHtml(timelineLabel)} — All Years`:`Monthly Timeline — ${escapeHtml(month.toLocaleDateString('ms-MY',{month:'long',year:'numeric'}))}`}</h1><table><tr><th>Date</th><th>Type</th><th>Detail</th><th>Label / Time</th></tr>${items.map(x=>`<tr><td>${escapeHtml(x.date)}</td><td>${x.type}</td><td>${escapeHtml(x.text)}</td><td>${escapeHtml(x.extra)}</td></tr>`).join('')}</table>`,'Calendar & Diary Timeline',tab)
    }
  }
  return <div className="calendar-page-wrap">
    <div className="calendar-toolbar"><button className={`soft-btn ${view==='timeline'?'active-view':''}`} onClick={()=>setView(v=>v==='timeline'?'calendar':'timeline')}><BarChart3 size={16}/> {view==='timeline'?'Calendar View':'Monthly Timeline'}</button><button className="soft-btn calendar-search-toggle" onClick={()=>{setSearchOpen(v=>!v);if(searchOpen)setQuery('')}}><Search size={16}/> Search</button><button className="soft-btn" onClick={printCalendar}><Printer size={16}/> Print / PDF</button></div>
    {searchOpen&&<div className="calendar-search card"><Search size={19}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search diary, label or activity by keyword..."/>{query&&<button className="icon-btn" onClick={()=>setQuery('')}><X size={17}/></button>}{query&&<div className="calendar-search-results">{searchResults.length?searchResults.map(r=><button key={r.id} onClick={()=>{jumpTo(r.date);setSearchOpen(false);setQuery('')}}><span className={`search-type ${r.type==='Diary'?'diary':''}`}>{r.type}</span><div><b>{r.title}</b><small>{formatDate(r.date)} {r.detail?`• ${r.detail}`:''}</small></div></button>):<p>No matching diary or activity found.</p>}</div>}</div>}
    {view==='timeline'?<MonthlyDiaryTimeline data={data} month={month} setMonth={setMonth} label={timelineLabel} setLabel={setTimelineLabel} labels={allLabels} driveToken={driveToken} jumpTo={jumpTo}/>:<div className="page-grid"><div className="card calendar-full"><div className="calendar-head"><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><h2>{month.toLocaleDateString('ms-MY',{month:'long',year:'numeric'})}</h2><button className="icon-btn" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div><div className="weekdays">{['Isn','Sel','Rab','Kha','Jum','Sab','Aha'].map(x=><b key={x}>{x}</b>)}</div><div className="month-grid">{days.map((d,i)=>d?<button key={i} className={`${iso(d)===selected?'selected':''} ${iso(d)===iso()?'today':''}`} onClick={()=>setSelected(iso(d))}><span>{d.getDate()}</span>{data.events.some(e=>e.date===iso(d))&&<i className="red-dot"/>}{data.diary.some(e=>e.date===iso(d))&&<em className="red-dot second"/>}</button>:<div key={i}/>)}</div></div><div className="card day-panel"><CardTitle title="Calendar & Diary" icon={<CalendarDays/>}/><h2>{formatDate(selected,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h2><div className="schedule-list">{selectedEvents.map(e=><div key={e.id} className="schedule red-only"><label className="calendar-event-check"><input type="checkbox" checked={!!e.done} onChange={()=>update('events',xs=>xs.map(i=>i.id===e.id?{...i,done:!i.done}:i))}/><div><b>{e.start}–{e.end}</b><span className={e.done?'done':''}>{e.title}</span></div></label><button className="icon-btn danger" onClick={()=>update('events',xs=>xs.filter(i=>i.id!==e.id))}><Trash2 size={15}/></button></div>)}</div><div className="button-row calendar-actions"><button className="primary" onClick={()=>setModal({type:'event',date:selected})}><Plus/> Activity</button><button className="secondary" onClick={()=>setModal({type:'diary',date:selected})}><Edit3/> New Diary Story</button></div>{selectedDiaries.length?<div className="calendar-diary-list">{selectedDiaries.map((d,idx)=><div className="calendar-diary-detail" key={d.id}><div className="calendar-diary-head"><div><span className="eyebrow">DIARY STORY {String(idx+1).padStart(2,'0')}</span><h3>{formatDate(selected,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>{d.labels?.length>0&&<div className="diary-labels">{d.labels.map(x=><button type="button" key={x} onClick={()=>filterByLabel(x)}>{x}</button>)}</div>}</div><div className="calendar-diary-head-actions"><button className="soft-btn" onClick={()=>setModal({type:'diary',date:selected,id:d.id})}><Edit3 size={15}/> Edit</button><button className="danger-btn diary-delete-btn" onClick={()=>{if(confirm('Delete this diary story?'))update('diary',xs=>xs.filter(i=>i.id!==d.id))}}><Trash2 size={15}/> Delete</button></div></div>{(d.images?.length||d.image)&&<div className="calendar-diary-image"><MediaSlider items={d.images?.length?d.images:[d.image]} token={driveToken} alt={`Diary ${selected}`} variant="contain"/></div>}<p className="calendar-reflection">{d.reflection||'No reflection written.'}</p><div className="calendar-diary-meta"><span>Mood {'●'.repeat(d.mood)}{'○'.repeat(5-d.mood)}</span>{d.win&&<span>Win: {d.win}</span>}</div></div>)}</div>:<div className="calendar-diary-empty"><BookOpen size={24}/><span>No diary story saved for this date.</span></div>}<div className="hijri-card"><small>HIJRI</small><strong>{formatHijri(selected)}</strong></div></div></div>}
  </div>
}

function MonthlyDiaryTimeline({data,month,setMonth,label,setLabel,labels,driveToken,jumpTo}){
  const prefix=`${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}`
  const allTimeLabel=label!=='ALL'&&label!=='Activity'
  const entries=useMemo(()=>{
    const diaries=data.diary.filter(d=>allTimeLabel?true:d.date?.startsWith(prefix)).filter(d=>label==='ALL'||(label!=='Activity'&&(d.labels||[]).includes(label))).map(d=>({...d,_type:'diary',_sort:`${d.date} 99:99`}))
    const activities=data.events.filter(e=>!allTimeLabel&&e.date?.startsWith(prefix)).filter(()=>label==='ALL'||label==='Activity').map(e=>({...e,_type:'activity',_sort:`${e.date} ${e.start||'00:00'}`}))
    return [...diaries,...activities].sort((a,b)=>a._sort.localeCompare(b._sort))
  },[data.diary,data.events,prefix,label,allTimeLabel])
  const dayGroups=useMemo(()=>{
    const map=new Map()
    for(const item of entries){
      const date=item.date
      if(!map.has(date)) map.set(date,{date,diaries:[],activities:[]})
      const group=map.get(date)
      if(item._type==='activity') group.activities.push(item)
      else group.diaries.push(item)
    }
    return [...map.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(g=>({
      ...g,
      diaries:g.diaries.sort((a,b)=>(a._sort||'').localeCompare(b._sort||'')),
      activities:g.activities.sort((a,b)=>(a._sort||'').localeCompare(b._sort||''))
    }))
  },[entries])
  return <div className="card monthly-diary-timeline"><div className="timeline-view-head"><div><span className="eyebrow">MONTHLY TIMELINE</span><h2>{allTimeLabel?`${label} — All Years`:month.toLocaleDateString('ms-MY',{month:'long',year:'numeric'})}</h2><small>{entries.length} item{entries.length===1?'':'s'} displayed</small></div><div className="timeline-view-controls"><button className="icon-btn" disabled={allTimeLabel} onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft/></button><select value={label} onChange={e=>setLabel(e.target.value)}><option value="ALL">All items</option><option value="Activity">Activity</option>{labels.map(x=><option key={x} value={x}>{x}</option>)}</select><button className="icon-btn" disabled={allTimeLabel} onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight/></button></div></div>{dayGroups.length?<div className="story-timeline day-group-timeline">{dayGroups.map((g,i)=>{
    const dt=new Date(g.date+'T00:00:00')
    const side=i%2?'right':'left'
    return <article key={g.date} className={`timeline-day-group ${side}`}>
      <div className="timeline-day-content">
        <div className="timeline-diaries">{g.diaries.map(d=><div className="story-card" key={d.id}>{d.labels?.length>0&&<div className="diary-labels">{d.labels.map(x=><button type="button" key={x} onClick={()=>setLabel(x)}>{x}</button>)}</div>}<p>{d.reflection||'No reflection written.'}</p>{(d.images?.length||d.image)?<div className="story-image"><MediaSlider items={d.images?.length?d.images:[d.image]} token={driveToken} alt={`Diary ${d.date}`} variant="contain"/></div>:<div className="story-no-image"><FileImage size={20}/><span>No image</span></div>}<button className="link-btn" onClick={()=>jumpTo(d.date)}>Open date <ChevronRight size={14}/></button></div>)}</div>
        {g.activities.length>0&&<div className="activity-timeline-grid">{g.activities.map(a=><div key={a.id} className="activity-story-card compact-activity-card"><div className="activity-badge">ACTIVITY</div><h3>{a.title}</h3><p><b>{a.start}–{a.end}</b>{a.done?' • Completed':''}</p><button className="link-btn" onClick={()=>jumpTo(a.date)}>Open <ChevronRight size={13}/></button></div>)}</div>}
      </div>
      <button className="story-date timeline-date-center" onClick={()=>jumpTo(g.date)}><strong>{dt.getDate()}</strong><span>{dt.toLocaleDateString('ms-MY',{weekday:'short'}).toUpperCase()}</span><small>{dt.toLocaleDateString('ms-MY',{month:'short',year:'numeric'}).toUpperCase()}</small></button><i className="story-dot"/>
    </article>})}</div>:<div className="timeline-empty"><BookOpen size={30}/><h3>No timeline item found</h3><p>Tiada diary atau activity untuk bulan / label yang dipilih.</p></div>}</div>
}
function PenCanvas({value,onSave,token}){
  const canvasRef=useRef(null),drawing=useRef(false),fileRef=useRef(null),[color,setColor]=useState('#181818'),[width,setWidth]=useState(3),[loadedValue,setLoadedValue]=useState(typeof value==='string'?value:(value?.dataUrl||''))
  const drawImageSrc=src=>{const c=canvasRef.current,ctx=c?.getContext('2d');if(!c||!ctx||!src)return;const img=new Image();img.onload=()=>{ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);const scale=Math.min(c.width/img.width,c.height/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(c.width-w)/2,(c.height-h)/2,w,h)};img.src=src}
  useEffect(()=>{let cancelled=false;if(typeof value==='string'){setLoadedValue(value);return}if(value?.dataUrl){setLoadedValue(value.dataUrl);return}if(!value?.driveFileId||!token){setLoadedValue('');return}fetch(`https://www.googleapis.com/drive/v3/files/${value.driveFileId}?alt=media`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.blob():Promise.reject()).then(blob=>new Promise(resolve=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.readAsDataURL(blob)})).then(v=>{if(!cancelled)setLoadedValue(v)}).catch(()=>{if(!cancelled)setLoadedValue('')});return()=>{cancelled=true}},[value,token])
  useEffect(()=>{const c=canvasRef.current,ctx=c?.getContext('2d');if(!c||!ctx)return;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);if(loadedValue)drawImageSrc(loadedValue)},[loadedValue])
  const pos=e=>{const c=canvasRef.current,r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*(c.width/r.width),y:(e.clientY-r.top)*(c.height/r.height)}}
  const down=e=>{e.preventDefault();drawing.current=true;const c=canvasRef.current,ctx=c.getContext('2d'),p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);c.setPointerCapture?.(e.pointerId)}
  const move=e=>{if(!drawing.current)return;e.preventDefault();const ctx=canvasRef.current.getContext('2d'),p=pos(e);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,width*(e.pressure&&e.pointerType==='pen' ? (.65+e.pressure) : 1));ctx.lineTo(p.x,p.y);ctx.stroke()}
  const up=e=>{drawing.current=false;canvasRef.current?.releasePointerCapture?.(e.pointerId)}
  const clear=()=>{const c=canvasRef.current,ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height)}
  const loadFile=file=>{if(!file||!file.type.startsWith('image/'))return;const fr=new FileReader();fr.onload=()=>drawImageSrc(fr.result);fr.readAsDataURL(file)}
  const pasteImage=e=>{const file=[...(e.clipboardData?.files||[])].find(f=>f.type.startsWith('image/'))||[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'))?.getAsFile();if(file){e.preventDefault();loadFile(file)}}
  return <div className="pen-board" onPaste={pasteImage}><div className="pen-toolbar"><PenTool size={17}/><label>Ink <input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label><label>Size <input type="range" min="1" max="10" value={width} onChange={e=>setWidth(+e.target.value)}/></label><button className="secondary" onClick={clear}><Eraser size={15}/> Clear</button><button className="secondary" onClick={()=>fileRef.current?.click()}><ImagePlus size={15}/> Image</button><input ref={fileRef} hidden type="file" accept="image/*" onChange={e=>loadFile(e.target.files?.[0])}/><button className="primary" onClick={()=>onSave(canvasRef.current.toDataURL('image/png'))}><Save size={15}/> Save Sketch</button></div><canvas ref={canvasRef} width="1400" height="990" tabIndex="0" onPaste={pasteImage} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}/><small>A4 landscape canvas. Upload or paste an image, then annotate it using Surface Pen, mouse or touch. Ctrl+V works when the canvas is focused.</small></div>
}

function LearningPointPage({data,update,showToast,driveToken,uploadLearningAttachment}){
  const list=data.learningPoints||[],folders=data.learningFolders||[],[folderFilter,setFolderFilter]=useState('ALL'),[selectedId,setSelectedId]=useState(list[0]?.id||null),[previewMedia,setPreviewMedia]=useState(null)
  const visibleList=folderFilter==='ALL'?list:folderFilter==='UNFILED'?list.filter(x=>!x.folderId):list.filter(x=>x.folderId===folderFilter)
  useEffect(()=>{if(!visibleList.some(x=>x.id===selectedId))setSelectedId(visibleList[0]?.id||null)},[folderFilter,list.length])
  const current=list.find(x=>x.id===selectedId)
  const activeFolder=folders.find(x=>x.id===folderFilter)
  const addFolder=()=>{const name=prompt('Nama folder Learning Point?')?.trim();if(!name)return;const id=uid();update('learningFolders',xs=>[...(xs||[]),{id,name}]);setFolderFilter(id)}
  const renameFolder=id=>{const f=folders.find(x=>x.id===id);if(!f)return;const name=prompt('Nama baharu folder?',f.name)?.trim();if(!name||name===f.name)return;update('learningFolders',xs=>xs.map(x=>x.id===id?{...x,name}:x));showToast(`Folder ditukar kepada ${name}.`)}
  const deleteFolder=id=>{const f=folders.find(x=>x.id===id);if(!f||!confirm(`Padam folder "${f.name}"? Item di dalamnya akan dipindahkan ke Unfiled.`))return;update('learningPoints',xs=>xs.map(x=>x.folderId===id?{...x,folderId:''}:x));update('learningFolders',xs=>xs.filter(x=>x.id!==id));setFolderFilter('ALL')}
  const moveLearningPoint=(itemId,folderId)=>{update('learningPoints',xs=>xs.map(x=>x.id===itemId?{...x,folderId}:x));const dest=folderId?folders.find(f=>f.id===folderId)?.name||'folder':'Unfiled';showToast(`Learning Point dipindahkan ke ${dest}.`)}
  const dropToFolder=(e,folderId)=>{e.preventDefault();const itemId=e.dataTransfer?.getData('text/learning-point')||e.dataTransfer?.getData('text/plain');if(itemId&&list.some(x=>x.id===itemId))moveLearningPoint(itemId,folderId)}
  const add=()=>{const item={id:uid(),folderId:(!['ALL','UNFILED'].includes(folderFilter)?folderFilter:''),date:iso(),title:`Learning Point ${String(list.length+1).padStart(2,'0')}`,notes:'',notesHtml:'',images:[],attachments:[],links:[],prompts:[],sketch:''};update('learningPoints',xs=>[item,...xs]);setSelectedId(item.id)}
  const patch=(key,value)=>update('learningPoints',xs=>xs.map(x=>x.id===selectedId?{...x,[key]:value}:x))
  const uploadImages=async files=>{const arr=Array.from(files||[]);if(!arr.length)return;try{const imgs=await Promise.all(arr.map(async f=>pendingMedia(await readImageFile(f),f.name,'learning')));patch('images',[...(current.images||[]),...imgs.filter(Boolean)]);showToast(`${imgs.length} image(s) added. Media will move to Google Drive on next sync.`)}catch(e){showToast(e.message)}}
  const uploadAttachments=async files=>{const arr=Array.from(files||[]);if(!arr.length)return;try{showToast(`Uploading ${arr.length} file(s) to Google Drive...`);const uploaded=[];for(const f of arr)uploaded.push(await uploadLearningAttachment(f));patch('attachments',[...(current.attachments||[]),...uploaded.filter(Boolean)]);showToast(`${uploaded.length} file(s) uploaded to Google Drive.`)}catch(e){showToast(e.message)}}
  const openAttachment=a=>{if(a?.driveFileId){window.open(`https://drive.google.com/file/d/${a.driveFileId}/view`,'_blank','noopener,noreferrer');return}if(a?.dataUrl){const w=window.open('','_blank');if(w)w.location.href=a.dataUrl}}
  const printCurrent=async()=>{if(!current)return;const printTab=window.open('','_blank','width=1100,height=800');if(!printTab){showToast('Benarkan pop-up untuk fungsi Print / PDF.');return}printTab.document.write('<p style="font-family:Arial;padding:30px">Preparing Learning Point…</p>');const imageUrls=[];for(const img of current.images||[])imageUrls.push(await mediaDataUrl(img,driveToken));const sketch=await mediaDataUrl(current.sketch,driveToken);const links=(current.links||[]).map(l=>`<div class="link"><b>${escapeHtml(l.title||'Reference')}</b><br>${escapeHtml(l.url||'')}</div>`).join('');const prompts=(current.prompts||[]).map(p=>`<div class="prompt"><b>${escapeHtml(p.title||'Prompt')}</b><div>${nl2br(p.text||'')}</div></div>`).join('');const atts=(current.attachments||[]).map(a=>`<div class="attachment"><b>${escapeHtml(a.name||'Attachment')}</b> <span>(${escapeHtml(a.mimeType||'file')})</span></div>`).join('');const imgs=imageUrls.filter(Boolean).map((u,i)=>`<img class="print-img" src="${u}" alt="Image ${i+1}">`).join('');printWindow(`<h1>${escapeHtml(current.title||'Learning Point')}</h1><div class="meta">${escapeHtml(formatDate(current.date))}</div><div class="section"><h2>Learning Notes / Reflection</h2><div class="notes rich-print">${current.notesHtml?sanitizeRichHtml(current.notesHtml):nl2br(current.notes||'')}</div></div>${imgs?`<div class="section"><h2>Images & Visual References</h2>${imgs}</div>`:''}${links?`<div class="section"><h2>Video & Reference Links</h2>${links}</div>`:''}${prompts?`<div class="section"><h2>Prompt Library</h2>${prompts}</div>`:''}${atts?`<div class="section"><h2>Slides / HTML / Files</h2>${atts}</div>`:''}${sketch?`<div class="section"><h2>Pen Notepad / Sketch</h2><img class="print-sketch" src="${sketch}"></div>`:''}`,current.title||'Learning Point',printTab)}
  if(!current)return <div className="card empty-learning"><FolderOpen size={38}/><h2>Learning Point</h2><p>Tiada item dalam folder ini.</p><div className="button-row"><button className="primary" onClick={add}><Plus/> New Learning Point</button><button className="secondary" onClick={addFolder}><Folder/> New Folder</button></div></div>
  return <><div className="learning-layout"><aside className="card learning-index"><div className="learning-index-head"><div><span className="eyebrow">LEARNING NOTEBOOK</span><h2>{activeFolder?activeFolder.name:'Learning Point'}</h2></div><div className="learning-index-actions">{folderFilter!=='ALL'&&<button className="secondary" onClick={()=>setFolderFilter('ALL')}><ChevronLeft size={15}/> Back</button>}{activeFolder&&<button className="secondary" onClick={()=>renameFolder(activeFolder.id)}><Edit3 size={15}/> Rename</button>}<button className="secondary" onClick={addFolder}><Folder size={15}/> Folder</button><button className="primary" onClick={add}><Plus size={16}/> New</button></div></div><div className="learning-folder-list"><button className={folderFilter==='ALL'?'active':''} onClick={()=>setFolderFilter('ALL')}><FolderOpen size={18}/><span>All</span><b>{list.length}</b></button>{folders.map(f=><div className={`learning-folder-row ${folderFilter===f.id?'active':''}`} key={f.id} onDragOver={e=>e.preventDefault()} onDrop={e=>dropToFolder(e,f.id)}><button className={folderFilter===f.id?'active':''} onClick={()=>setFolderFilter(f.id)}><Folder size={18}/><span>{f.name}</span><b>{list.filter(x=>x.folderId===f.id).length}</b></button><div className="folder-row-actions"><button className="folder-action" title="Rename folder" onClick={()=>renameFolder(f.id)}><Edit3 size={13}/></button><button className="folder-delete" title="Delete folder" onClick={()=>deleteFolder(f.id)}><X size={13}/></button></div></div>)}<button className={folderFilter==='UNFILED'?'active':''} onClick={()=>setFolderFilter('UNFILED')} onDragOver={e=>e.preventDefault()} onDrop={e=>dropToFolder(e,'')}><Folder size={18}/><span>Unfiled</span><b>{list.filter(x=>!x.folderId).length}</b></button></div><div className="learning-index-list">{visibleList.map(x=><button key={x.id} draggable onDragStart={e=>{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/learning-point',x.id);e.dataTransfer.setData('text/plain',x.id)}} className={x.id===selectedId?'active':''} onClick={()=>setSelectedId(x.id)} title="Drag ke folder untuk pindah"><Lightbulb size={17}/><div><b>{x.title||'Untitled'}</b><small>{formatDate(x.date)}</small></div></button>)}</div></aside><section className="learning-editor"><div className="card learning-main"><div className="learning-title-row"><div className="learning-title-fields"><input className="learning-title-input" value={current.title} onChange={e=>patch('title',e.target.value)} placeholder="Learning point title"/><input type="date" value={current.date} onChange={e=>patch('date',e.target.value)}/><select value={current.folderId||''} onChange={e=>patch('folderId',e.target.value)}><option value="">Unfiled</option>{folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div><div className="learning-title-actions"><button className="secondary" onClick={printCurrent}><Printer size={16}/> Print / PDF</button><button className="danger-btn" onClick={()=>{if(confirm('Delete this Learning Point?'))update('learningPoints',xs=>xs.filter(x=>x.id!==selectedId))}}><Trash2 size={16}/> Delete</button></div></div><Field label="Learning Notes / Reflection"><RichNotesEditor key={current.id} html={current.notesHtml} text={current.notes} onChange={(html,text)=>{patch('notesHtml',html);patch('notes',text)}}/></Field><div className="learning-section"><div className="learning-section-head"><div><FileImage size={18}/><b>Images & Visual References</b></div><label className="secondary file-button"><ImagePlus size={16}/> Add Images<input type="file" accept="image/*" multiple onChange={e=>uploadImages(e.target.files)}/></label></div><p className="learning-help">Boleh pilih banyak gambar sekali. Desktop memaparkan gambar pada saiz sederhana; telefon menggunakan lebar penuh skrin. Double-click gambar untuk preview besar.</p><div className="learning-gallery learning-gallery-stack">{(current.images||[]).map((img,i)=><div className="learning-image-row" key={i} onDoubleClick={()=>setPreviewMedia(img)} title="Double-click untuk preview besar"><MediaImage media={img} token={driveToken} alt={`Learning reference ${i+1}`} className="learning-full-image"/><div className="learning-image-tools"><span>Image {i+1}</span><button className="icon-btn danger" onClick={()=>patch('images',current.images.filter((_,j)=>j!==i))}><Trash2 size={15}/></button></div></div>)}{!current.images?.length&&<div className="learning-gallery-empty"><ImagePlus/><span>Upload screenshots, diagrams, photos or visual notes.</span></div>}</div></div><div className="learning-section"><div className="learning-section-head"><div><FileUp size={18}/><b>Slides / HTML / Reference Files</b></div><label className="secondary file-button"><Upload size={16}/> Upload Files<input type="file" accept=".ppt,.pptx,.pdf,.html,.htm,text/html,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" multiple onChange={e=>uploadAttachments(e.target.files)}/></label></div><p className="learning-help">Simpan slide, PDF atau fail HTML bersama Learning Point. Fail sebenar terus dimuat naik ke My Drive → strategiSK → learning-files supaya fail slide besar tidak membebankan browser.</p><div className="learning-attachments">{(current.attachments||[]).map((a,i)=><div className="learning-attachment" key={a.id||i}><div><FileText size={18}/><span><b>{a.name||`File ${i+1}`}</b><small>{a.mimeType||'File'}</small></span></div><div><button className="soft-btn" onClick={()=>openAttachment(a)}><ExternalLink size={15}/> Open</button><button className="icon-btn danger" onClick={()=>patch('attachments',current.attachments.filter((_,j)=>j!==i))}><Trash2 size={15}/></button></div></div>)}{!current.attachments?.length&&<div className="muted">Belum ada slide / HTML / file.</div>}</div></div><div className="learning-section"><div className="learning-section-head"><div><Link2 size={18}/><b>Video & Reference Links</b></div><button className="secondary" onClick={()=>patch('links',[...(current.links||[]),{id:uid(),title:'',url:''}])}><Plus size={15}/> Add Link</button></div><div className="reference-links">{(current.links||[]).map(l=><div key={l.id}><input value={l.title} onChange={e=>patch('links',current.links.map(x=>x.id===l.id?{...x,title:e.target.value}:x))} placeholder="Reference title"/><input value={l.url} onChange={e=>patch('links',current.links.map(x=>x.id===l.id?{...x,url:e.target.value}:x))} placeholder="https://..."/><a className="soft-btn" href={/^https?:\/\//i.test(l.url)?l.url:`https://${l.url}`} target="_blank" rel="noreferrer"><Link2 size={15}/> Open</a><button className="icon-btn danger" onClick={()=>patch('links',current.links.filter(x=>x.id!==l.id))}><Trash2 size={15}/></button></div>)}</div></div><div className="learning-section"><div className="learning-section-head"><div><Sparkles size={18}/><b>Prompt Library</b></div><button className="secondary" onClick={()=>patch('prompts',[...(current.prompts||[]),{id:uid(),title:'New Prompt',text:''}])}><Plus size={15}/> Add Prompt</button></div><div className="prompt-library">{(current.prompts||[]).map(p=><div className="prompt-card" key={p.id}><div><input value={p.title} onChange={e=>patch('prompts',current.prompts.map(x=>x.id===p.id?{...x,title:e.target.value}:x))}/><div className="row-actions"><button className="icon-btn" title="Copy prompt" onClick={()=>{navigator.clipboard?.writeText(p.text);showToast('Prompt copied.')}}><Copy size={15}/></button><button className="icon-btn danger" onClick={()=>patch('prompts',current.prompts.filter(x=>x.id!==p.id))}><Trash2 size={15}/></button></div></div><textarea rows="5" value={p.text} onChange={e=>patch('prompts',current.prompts.map(x=>x.id===p.id?{...x,text:e.target.value}:x))} placeholder="Write reusable AI prompt here..."/></div>)}</div></div><div className="learning-section"><div className="learning-section-head"><div><PenTool size={18}/><b>Pen Notepad / Sketch</b></div></div><PenCanvas value={current.sketch} token={driveToken} onSave={img=>{const sketchMedia=pendingMedia(img,`sketch-${current.date}.png`,'sketches'); const visualMedia=pendingMedia(img,`sketch-ref-${current.date}-${Date.now()}.png`,'learning'); patch('sketch',sketchMedia); patch('images',[...(current.images||[]),visualMedia]); showToast('Sketch saved and added to Images & Visual References. It will move to Google Drive on next sync.')}}/></div></div></section></div>{previewMedia&&<div className="image-preview-backdrop" onClick={()=>setPreviewMedia(null)}><button className="image-preview-close" onClick={()=>setPreviewMedia(null)}><X/></button><div className="image-preview-inner" onClick={e=>e.stopPropagation()}><MediaImage media={previewMedia} token={driveToken} alt="Learning preview" className="image-preview-full"/></div></div>}</>
}

function SimpleProgressPage({title,items,setItems,nameKey}){return <div className="card editable-list"><div className="section-title"><div><h2>{title}</h2><p>Klik nama atau progress untuk ubah suai.</p></div><button className="primary" onClick={()=>setItems([...items,{id:uid(),[nameKey]:'Item baharu',progress:0}])}><Plus/> Tambah</button></div>{items.map(x=><div className="edit-progress" key={x.id}><input value={x[nameKey]} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,[nameKey]:e.target.value}:i))}/><input type="range" min="0" max="100" value={x.progress} onChange={e=>setItems(items.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>setItems(items.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function ResearchDataPage({data,update}){const add=()=>update('researchPhases',xs=>[...xs,{id:uid(),name:'Fasa / sampel baharu',current:0,target:10,progress:0}]);return <div className="page-grid"><div className="card"><div className="section-title"><div><h2>Fasa Kajian</h2><p>Pantau sasaran dan pencapaian pengumpulan data.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{data.researchPhases.map(x=><div className="phase-editor phase-with-delete" key={x.id}><input value={x.name} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/><div><Field label="Semasa"><input type="number" value={x.current} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,current:+e.target.value,progress:pct(+e.target.value,i.target)}:i))}/></Field><Field label="Sasaran"><input type="number" value={x.target} onChange={e=>update('researchPhases',xs=>xs.map(i=>i.id===x.id?{...i,target:+e.target.value,progress:pct(i.current,+e.target.value)}:i))}/></Field></div><div className="bar"><i style={{width:`${x.progress}%`}}/></div><button className="icon-btn danger phase-delete" onClick={()=>update('researchPhases',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div><div className="card"><CardTitle title="Ringkasan Visual" icon={<BarChart3/>}/><div className="big-bars">{data.researchPhases.map(x=><div key={x.id}><span>{x.name}</span><div><i style={{height:`${Math.max(8,x.progress*1.8)}px`}}/><b>{x.progress}%</b></div></div>)}</div></div></div>}
function ExpertsPage({data,update,driveToken}){
  const [cropOpen,setCropOpen]=useState({})
  const add=()=>update('experts',xs=>[...xs,{id:uid(),name:'',institution:'',expertise:'',email:'',phone:'',notes:'',image:'',status:'Belum dihubungi',phase:'Fuzzy Delphi',cropX:50,cropY:24,cropZoom:1}])
  const upload=(id,file)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>update('experts',xs=>xs.map(i=>i.id===id?{...i,image:pendingMedia(reader.result,file.name,'experts'),cropX:i.cropX??50,cropY:i.cropY??24,cropZoom:i.cropZoom??1}:i));reader.readAsDataURL(file)}
  const patch=(id,key,value)=>update('experts',xs=>xs.map(i=>i.id===id?{...i,[key]:value}:i))
  const printAll=async()=>{const printTab=window.open('','_blank','width=1200,height=800');if(!printTab)return;printTab.document.write('<p style="font-family:Arial;padding:30px">Preparing Expert List…</p>');const rows=[];for(let i=0;i<data.experts.length;i++){const x=data.experts[i],photo=await mediaDataUrl(x.image,driveToken);rows.push(`<tr><td>${i+1}</td><td>${photo?`<img class="expert-photo" src="${photo}">`:''}</td><td><b>${escapeHtml(x.name||'')}</b></td><td>${escapeHtml(x.institution||'')}</td><td>${escapeHtml(x.expertise||'')}</td><td>${escapeHtml(x.phase||'')}</td><td>${escapeHtml(x.email||'')}<br>${escapeHtml(x.phone||'')}</td><td>${escapeHtml(x.status||'')}</td><td>${nl2br(x.notes||'')}</td></tr>`)}printWindow(`<h1>Expert List</h1><div class="meta">Generated ${escapeHtml(new Date().toLocaleString('ms-MY'))} · ${data.experts.length} expert(s)</div><table><thead><tr><th>No.</th><th>Photo</th><th>Name</th><th>Institution</th><th>Expertise</th><th>Phase / Role</th><th>Contact</th><th>Status</th><th>Key Notes</th></tr></thead><tbody>${rows.join('')}</tbody></table>`,'strategiSK Expert List',printTab)}
  return <div className="experts-page"><div className="section-title"><div><h2>Expert List</h2><p>Expert profile, contact information, key notes and reference photo.</p></div><div className="section-actions"><button className="secondary" onClick={printAll}><Printer/> Print / PDF All</button><button className="primary" onClick={add}><Plus/> Add Expert</button></div></div><div className="expert-card-list">{data.experts.map((x,index)=>{const open=!!cropOpen[x.id],cropStyle={objectPosition:`${x.cropX??50}% ${x.cropY??24}%`,transform:`scale(${x.cropZoom??1})`};return <div className="card expert-card" key={x.id}><div className="expert-card-head"><div><span className="eyebrow">EXPERT {String(index+1).padStart(2,'0')}</span><h3>{x.name||'Expert baharu'}</h3></div><div className="expert-card-head-actions">{x.image&&<button className={`icon-btn crop-mini-btn ${open?'active':''}`} type="button" title={open?'Hide crop controls':'Adjust photo crop'} aria-label={open?'Hide crop controls':'Adjust photo crop'} onClick={()=>setCropOpen(s=>({...s,[x.id]:!s[x.id]}))}><Crop size={15}/></button>}<button className="icon-btn danger" onClick={()=>update('experts',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={18}/></button></div></div><div className="expert-main-grid"><label className={`expert-photo-upload expert-photo-smart ${x.image?'has-image':''}`}>{x.image?<MediaImage media={x.image} token={driveToken} alt={x.name||'Expert'} style={cropStyle}/>:<><CircleUserRound size={42}/><span>Upload expert photo</span></>}<input type="file" accept="image/*" onChange={e=>upload(x.id,e.target.files?.[0])}/></label><div className="expert-fields-top"><Field label="Name"><input value={x.name} onChange={e=>patch(x.id,'name',e.target.value)}/></Field><Field label="Institution / Organisation"><input value={x.institution} onChange={e=>patch(x.id,'institution',e.target.value)}/></Field><Field label="Expertise"><input value={x.expertise} onChange={e=>patch(x.id,'expertise',e.target.value)}/></Field><Field label="Phase / Role"><input value={x.phase} onChange={e=>patch(x.id,'phase',e.target.value)}/></Field></div></div>{x.image&&open&&<div className="expert-crop-tools"><div className="crop-tool-row"><span>Focus Left / Right</span><input type="range" min="0" max="100" value={x.cropX??50} onChange={e=>patch(x.id,'cropX',+e.target.value)}/><b>{Math.round(x.cropX??50)}%</b></div><div className="crop-tool-row"><span>Focus Up / Down</span><input type="range" min="0" max="100" value={x.cropY??24} onChange={e=>patch(x.id,'cropY',+e.target.value)}/><b>{Math.round(x.cropY??24)}%</b></div><div className="crop-tool-row"><span>Zoom</span><input type="range" min="1" max="1.8" step="0.02" value={x.cropZoom??1} onChange={e=>patch(x.id,'cropZoom',+e.target.value)}/><b>{(x.cropZoom??1).toFixed(2)}x</b></div><div className="crop-hint">Auto focus starts near the upper-centre so faces usually sit better in frame. Adjust only if needed.</div></div>}<div className="expert-contact-row"><Field label="Email"><input type="email" value={x.email} onChange={e=>patch(x.id,'email',e.target.value)}/></Field><Field label="Phone"><input value={x.phone} onChange={e=>patch(x.id,'phone',e.target.value)}/></Field><Field label="Status"><select value={x.status} onChange={e=>patch(x.id,'status',e.target.value)}><option>Belum dihubungi</option><option>Jemputan dihantar</option><option>Setuju</option><option>Selesai</option><option>Tolak</option></select></Field></div><Field label="Key Notes"><textarea className="expert-notes" rows="6" value={x.notes} placeholder="Contoh: kepakaran khusus, perkara penting semasa dihubungi, potensi soalan, persetujuan, tarikh follow-up..." onChange={e=>patch(x.id,'notes',e.target.value)}/></Field></div>})}</div></div>
}

function PublicationsPage({data,update}){const add=()=>update('publications',xs=>[...xs,{id:uid(),title:'Artikel baharu',outlet:'',due:addDays(60),status:'Idea',progress:0}]);return <div className="card"><div className="section-title"><div><h2>Publication Tracker</h2><p>Rancang tarikh submit dan pantau status penerbitan.</p></div><button className="primary" onClick={add}><Plus/> Tambah</button></div>{data.publications.map(x=><div className="publication publication-delete" key={x.id}><div><input className="title-input" value={x.title} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input value={x.outlet} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,outlet:e.target.value}:i))}/></div><input type="date" value={x.due} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,due:e.target.value}:i))}/><select value={x.status} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,status:e.target.value}:i))}><option>Idea</option><option>Drafting</option><option>Submitted</option><option>Revision</option><option>Accepted</option><option>Published</option></select><input type="range" min="0" max="100" value={x.progress} onChange={e=>update('publications',xs=>xs.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>update('publications',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function TasksPage({data,update}){const[filter,setFilter]=useState('all');const items=data.tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done));return <div className="card"><div className="section-title"><div><h2>Task Assignment</h2><p>Urus task thesis, Dr Roket dan penyelidikan.</p></div><button className="primary" onClick={()=>update('tasks',xs=>[...xs,{id:uid(),title:'Tugasan baharu',date:iso(),done:false,category:'Thesis'}])}><Plus/> Tambah</button></div><div className="chips"><button onClick={()=>setFilter('all')} className={filter==='all'?'active':''}>Semua</button><button onClick={()=>setFilter('open')} className={filter==='open'?'active':''}>Belum siap</button><button onClick={()=>setFilter('done')} className={filter==='done'?'active':''}>Selesai</button></div>{items.map(x=><div className="task-editor" key={x.id}><input type="checkbox" checked={x.done} onChange={()=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,done:!i.done}:i))}/><input value={x.title} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,title:e.target.value}:i))}/><input type="date" value={x.date} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,date:e.target.value}:i))}/><input value={x.category} onChange={e=>update('tasks',xs=>xs.map(i=>i.id===x.id?{...i,category:e.target.value}:i))}/><button className="icon-btn danger" onClick={()=>update('tasks',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div>}
function WeeklyPage({data,update,sendWhatsApp,sendTelegram,showToast}){const w=data.weekly,set=(k,v)=>update('weekly',{...w,[k]:v});return <div className="weekly-layout"><div className="card form-card"><CardTitle title="Weekly Target" icon={<Target/>}/><div className="form-grid"><Field label="Draft pages / target"><div className="inline-input"><input type="number" value={w.draftPages} onChange={e=>set('draftPages',+e.target.value)}/><span>/</span><input type="number" value={w.draftTarget} onChange={e=>set('draftTarget',+e.target.value)}/></div></Field><Field label="Articles read / target"><div className="inline-input"><input type="number" value={w.articles} onChange={e=>set('articles',+e.target.value)}/><span>/</span><input type="number" value={w.articleTarget} onChange={e=>set('articleTarget',+e.target.value)}/></div></Field><Field label="Writing hours / target"><div className="inline-input"><input type="number" value={w.writingHours} onChange={e=>set('writingHours',+e.target.value)}/><span>/</span><input type="number" value={w.writingTarget} onChange={e=>set('writingTarget',+e.target.value)}/></div></Field></div></div><MessageComposer kind="fow" title="FOW — Focus of the Week" value={w.fow} setValue={v=>set('fow',v)} data={data} update={update} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram} showToast={showToast}/><MessageComposer kind="fod" title="FOD — Focus of the Day" value={w.fod} setValue={v=>set('fod',v)} data={data} update={update} sendWhatsApp={sendWhatsApp} sendTelegram={sendTelegram} showToast={showToast}/></div>}
function MessageComposer({kind,title,value,setValue,data,update,sendWhatsApp,sendTelegram,showToast}){const templates=data.messageTemplates[kind]||[];const full=`${title}\n\n${value}`;const addTemplate=()=>update('messageTemplates',{...data.messageTemplates,[kind]:[...templates,{id:uid(),title:'Ayat contoh',text:''}]});const copy=t=>navigator.clipboard.writeText(t).then(()=>showToast('Ayat contoh disalin.'));return <div className="card message-workspace"><div className="message-editor"><CardTitle title={title} icon={<MessageCircle/>}/><textarea rows="11" value={value} onChange={e=>setValue(e.target.value)} placeholder={`Tulis ${kind.toUpperCase()} anda di sini...`}/><div className="send-row"><button className="whatsapp" onClick={()=>sendWhatsApp(full)}><MessageCircle/> Hantar WhatsApp</button><button className="telegram" onClick={()=>sendTelegram(full)}><Send/> Hantar Telegram</button></div></div><div className="template-panel"><div className="section-title"><div><h3>Template Ayat</h3><p>Simpan, copy dan paste ayat berulang.</p></div><button className="soft-btn" onClick={addTemplate}><Plus/> Ayat</button></div>{templates.map(t=><div className="template-row" key={t.id}><input value={t.title} onChange={e=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.map(i=>i.id===t.id?{...i,title:e.target.value}:i)})}/><textarea rows="3" value={t.text} onChange={e=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.map(i=>i.id===t.id?{...i,text:e.target.value}:i)})}/><div><button className="icon-btn" onClick={()=>copy(t.text)}><Copy size={16}/></button><button className="icon-btn danger" onClick={()=>update('messageTemplates',{...data.messageTemplates,[kind]:templates.filter(i=>i.id!==t.id)})}><Trash2 size={16}/></button></div></div>)}</div></div>}
function MonthlyPage({data,update,showToast}){const m=data.monthly,setM=(k,v)=>update('monthly',{...m,[k]:v});const archive=()=>{if(!m.month.trim())return;update('monthlyArchives',xs=>[{id:uid(),month:m.month,savedAt:iso(),targets:JSON.parse(JSON.stringify(m.targets))},...xs]);showToast(`Target ${m.month} diarkibkan.`)};return <div className="monthly-layout"><div className="card"><div className="section-title"><div><h2>Monthly Target</h2><p>Name the month and save it to the archive.</p></div><button className="primary" onClick={archive}><Save/> Save & Archive</button></div><Field label="Month / target name"><input value={m.month} onChange={e=>setM('month',e.target.value)} placeholder="Contoh: Ogos 2026"/></Field>{m.targets.map(x=><div className="edit-progress" key={x.id}><input value={x.name} onChange={e=>setM('targets',m.targets.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/><input type="range" min="0" max="100" value={x.progress} onChange={e=>setM('targets',m.targets.map(i=>i.id===x.id?{...i,progress:+e.target.value}:i))}/><b>{x.progress}%</b><button className="icon-btn danger" onClick={()=>setM('targets',m.targets.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}<button className="soft-btn" onClick={()=>setM('targets',[...m.targets,{id:uid(),name:'Target baharu',progress:0}])}><Plus/> Tambah Target</button></div><div className="card"><CardTitle title="Monthly Target Archive" icon={<Flag/>}/>{data.monthlyArchives.length?data.monthlyArchives.map(a=><details className="archive-card" key={a.id}><summary><b>{a.month}</b><span>Disimpan {formatDate(a.savedAt)}</span></summary><ProgressList items={a.targets}/><button className="danger-btn" onClick={()=>update('monthlyArchives',xs=>xs.filter(i=>i.id!==a.id))}><Trash2/> Padam Archive</button></details>):<p className="muted">Belum ada archive.</p>}</div></div>}
function ConsultationPage({data,update,driveToken}){
  const add=()=>update('consultations',xs=>[{id:uid(),date:iso(),topic:'',comment:'',action:'',status:'Dalam tindakan',image:'',images:[]},...xs])
  const upload=async(id,files)=>{const arr=Array.from(files||[]);if(!arr.length)return;const added=[];for(const file of arr){const img=await readImageFile(file);added.push(pendingMedia(img,file.name,'consultation'))}update('consultations',xs=>xs.map(i=>{if(i.id!==id)return i;const current=Array.isArray(i.images)&&i.images.length?i.images:(i.image?[i.image]:[]),images=[...current,...added];return {...i,images,image:images[0]||''}}))}
  const patch=(id,key,value)=>update('consultations',xs=>xs.map(i=>i.id===id?{...i,[key]:value}:i))
  const printAll=async()=>{const tab=window.open('','_blank','width=1100,height=800');if(!tab)return;tab.document.write('<p style="font-family:Arial;padding:30px">Preparing SV Consultation…</p>');const rows=[];for(const x of [...data.consultations].sort((a,b)=>b.date.localeCompare(a.date))){const imgs=[];for(const m of (x.images?.length?x.images:(x.image?[x.image]:[]))){const u=await mediaDataUrl(m,driveToken);if(u)imgs.push(u)};rows.push(`<div class="section" style="page-break-inside:avoid"><h2>${escapeHtml(x.topic||'SV Consultation')}</h2><div class="meta">${escapeHtml(formatDate(x.date))} • ${escapeHtml(x.status||'')}</div><p><b>Supervisor Comment</b><br>${nl2br(x.comment||'')}</p><p><b>Action / Follow-up</b><br>${nl2br(x.action||'')}</p>${imgs.map(img=>`<img class="print-img" style="max-width:520px" src="${img}">`).join('')}</div>`)}printWindow(`<h1>SV Consultation</h1>${rows.join('')}`,'SV Consultation',tab)}
  return <div className="consultation-page"><div className="section-title"><div><h2>SV Consultation</h2><p>Structured consultation notes, action items and visual evidence.</p></div><div className="button-row"><button className="secondary" onClick={printAll}><Printer size={16}/> Print / PDF</button><button className="primary" onClick={add}><Plus/> Add Log</button></div></div><div className="consultation-card-list">{data.consultations.map((x,index)=><div className="card consultation-card" key={x.id}><div className="consultation-card-head"><div><span className="eyebrow">CONSULTATION {String(index+1).padStart(2,'0')}</span><h3>{x.topic||'SV consultation'}</h3></div><button className="icon-btn danger" onClick={()=>update('consultations',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={18}/></button></div><div className="consultation-top-row"><Field label="Date"><input type="date" value={x.date} onChange={e=>patch(x.id,'date',e.target.value)}/></Field><Field label="Topic"><input value={x.topic} placeholder="Consultation topic" onChange={e=>patch(x.id,'topic',e.target.value)}/></Field><Field label="Status"><select className={statusClass(x.status)} value={x.status} onChange={e=>patch(x.id,'status',e.target.value)}><option>Dalam tindakan</option><option>Tertangguh</option><option>Selesai</option></select></Field></div><div className="consultation-main-row"><Field label="Supervisor Comment"><textarea rows="7" value={x.comment} placeholder="Supervisor comments, corrections and key points..." onChange={e=>patch(x.id,'comment',e.target.value)}/></Field><div className="consultation-photo-box">{(x.images?.length||x.image)?<MediaSlider items={x.images?.length?x.images:[x.image]} token={driveToken} alt="Consultation evidence" variant="cover43" onRemove={idx=>update('consultations',xs=>xs.map(i=>{if(i.id!==x.id)return i;const cur=i.images?.length?i.images:(i.image?[i.image]:[]),images=cur.filter((_,n)=>n!==idx);return {...i,images,image:images[0]||''}}))}/>:null}<label className={`consultation-photo-upload ${(x.images?.length||x.image)?'compact-add':'empty'}`}><ImagePlus size={(x.images?.length||x.image)?22:42}/><span>{(x.images?.length||x.image)?'Tambah gambar':'Upload consultation photo'}</span><input type="file" accept="image/*" multiple onChange={e=>upload(x.id,e.target.files)}/></label></div></div><Field label="Action / Follow-up"><textarea rows="4" value={x.action} placeholder="Action items and follow-up..." onChange={e=>patch(x.id,'action',e.target.value)}/></Field></div>)}</div></div>
}


function DraftPage({data,update,setModal,setEditingDraft,uploadDraftAttachment,showToast}){
  const [previewFile,setPreviewFile]=useState(null)
  const uploadThesis=async(id,file)=>{if(!file)return;try{showToast('Uploading thesis file to Google Drive...');const att=await uploadDraftAttachment(file);update('draftHistory',xs=>xs.map(x=>x.id===id?{...x,thesisFile:att}:x));showToast('Fail tesis berjaya dimuat naik.')}catch(e){showToast(e.message)}}
  const remove=x=>{
    if(!confirm(`Delete Draft #${String(x.draft).padStart(3,'0')} record?`)) return
    const next=data.draftHistory.filter(i=>i.id!==x.id)
    update('draftHistory',next)
    update('profile',{...data.profile,currentDraft:Math.max(0,...next.map(i=>i.draft))})
  }
  const printDraftHistory=()=>{const rows=[...(data.draftHistory||[])].sort((a,b)=>b.draft-a.draft).map(x=>`<tr><td><b>#${String(x.draft).padStart(3,'0')}</b></td><td>${escapeHtml(x.date||'')}</td><td>${escapeHtml(x.focus||'')}</td><td>${escapeHtml(String(x.pages||''))}</td><td>${escapeHtml(x.note||'')}</td><td>${escapeHtml(x.thesisFile?.name||'-')}</td></tr>`).join('');printWindow(`<h1>Draft 111 Tracker</h1><div class="meta">Current Draft: ${String(data.profile.currentDraft).padStart(3,'0')} / ${data.profile.draftGoal}</div><table><tr><th>Draft</th><th>Tarikh</th><th>Fokus</th><th>Muka surat</th><th>Catatan</th><th>Fail Tesis</th></tr>${rows}</table>`,'Draft 111 Tracker')}

  return <div>
    <div className="hero-stat card">
      <Ring value={pct(data.profile.currentDraft,data.profile.draftGoal)} label="Draft 111" size={160}/>
      <div>
        <span className="eyebrow">CURRENT DRAFT</span>
        <h2>{String(data.profile.currentDraft).padStart(3,'0')} / {data.profile.draftGoal}</h2>
        <p>Naik draft secara konsisten setiap minggu dan simpan sejarah perubahan.</p>
        <button className="primary" onClick={()=>{setEditingDraft(null);setModal('draft')}}><Plus/> Naik Draft</button>
      </div>
    </div>
    <div className="card table-card">
      <div className="section-title draft-history-head"><div><h2>Sejarah Draft</h2></div><button className="secondary" onClick={printDraftHistory}><Printer size={16}/> Print / PDF</button></div>
      <div className="responsive-table draft-history-table">
        <table>
          <thead><tr><th>Draft</th><th>Tarikh</th><th>Fokus</th><th>Muka surat</th><th>Catatan</th><th>Fail Tesis</th><th>Tindakan</th></tr></thead>
          <tbody>{[...(data.draftHistory||[])].sort((a,b)=>b.draft-a.draft).map(x=><tr key={x.id}>
            <td><b>#{String(x.draft).padStart(3,'0')}</b></td><td>{x.date}</td><td>{x.focus}</td><td>{x.pages}</td><td>{x.note}</td>
            <td><div className="draft-file-actions">{x.thesisFile?.driveFileId?<><button className="soft-btn" onClick={()=>setPreviewFile(x.thesisFile)}><BookOpen size={14}/> View</button><small>{x.thesisFile.name}</small></>:<label className="soft-btn file-button"><Upload size={14}/> Upload Word<input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e=>uploadThesis(x.id,e.target.files?.[0])}/></label>}</div></td>
            <td><div className="row-actions"><button className="icon-btn" title="Edit draft" onClick={()=>{setEditingDraft(x);setModal('draft')}}><Edit3 size={16}/></button><button className="icon-btn danger" title="Delete draft" onClick={()=>remove(x)}><Trash2 size={16}/></button></div></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="draft-history-mobile">
        {[...(data.draftHistory||[])].sort((a,b)=>b.draft-a.draft).map(x=><article className="draft-mobile-card" key={`mobile-${x.id}`}>
          <div className="draft-mobile-head">
            <div><span className="draft-mobile-kicker">DRAFT</span><strong>#{String(x.draft).padStart(3,'0')}</strong></div>
            <div className="draft-mobile-meta"><span>{formatDate(x.date)}</span><b>{x.pages || 0} muka surat</b></div>
          </div>
          <div className="draft-mobile-section"><span>Fokus</span><p>{x.focus || '—'}</p></div>
          <div className="draft-mobile-section"><span>Catatan</span><p>{x.note || '—'}</p></div>
          <div className="draft-mobile-section draft-mobile-file"><span>Fail Tesis</span>
            {x.thesisFile?.driveFileId?<div className="draft-mobile-file-row"><button className="soft-btn" onClick={()=>setPreviewFile(x.thesisFile)}><BookOpen size={15}/> View</button><small title={x.thesisFile.name}>{x.thesisFile.name}</small></div>:<label className="soft-btn file-button"><Upload size={15}/> Upload Word<input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e=>uploadThesis(x.id,e.target.files?.[0])}/></label>}
          </div>
          <div className="draft-mobile-actions">
            <button className="secondary" onClick={()=>{setEditingDraft(x);setModal('draft')}}><Edit3 size={15}/> Edit</button>
            <button className="danger-btn" onClick={()=>remove(x)}><Trash2 size={15}/> Delete</button>
          </div>
        </article>)}
      </div>
    </div>
    {previewFile&&<div className="doc-preview-backdrop" onClick={()=>setPreviewFile(null)}><div className="doc-preview-modal" onClick={e=>e.stopPropagation()}><div className="doc-preview-head"><div><b>{previewFile.name||'Thesis file'}</b><small>Google Drive preview</small></div><div className="row-actions"><a className="secondary" href={`https://drive.google.com/file/d/${previewFile.driveFileId}/view`} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open Drive</a><button className="icon-btn" onClick={()=>setPreviewFile(null)}><X/></button></div></div><iframe title="Thesis preview" src={`https://drive.google.com/file/d/${previewFile.driveFileId}/preview`} allow="autoplay"></iframe></div></div>}
  </div>
}

function SettingsPage({data,update,drive,saveDrive,loadDrive,syncDrive,testDrive,reconnectDrive,exportJson,importJson,manualDriveBackup,resolveConflictKeepCloud,resolveConflictKeepLocal,recovery,scanDriveRecovery,setCanonicalRoot,recoverLearningOrphans}){const p=data.profile,setP=(k,v)=>update('profile',{...p,[k]:v});const[selectedRecovery,setSelectedRecovery]=useState([]);const toggleRecovery=id=>setSelectedRecovery(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id]);return <div className="settings-grid"><div className="card form-card"><CardTitle title="Profile & GBT Target" icon={<Settings/>}/><Field label="Name"><input value={p.name} onChange={e=>setP('name',e.target.value)}/></Field><Field label="Tagline"><input value={p.tagline} onChange={e=>setP('tagline',e.target.value)}/></Field><div className="form-grid"><Field label="Tarikh mula PhD"><input type="date" value={p.startDate} onChange={e=>setP('startDate',e.target.value)}/></Field><Field label="Target GBT"><input type="date" value={p.targetDate} onChange={e=>setP('targetDate',e.target.value)}/></Field><Field label="Draft semasa"><input type="number" value={p.currentDraft} onChange={e=>setP('currentDraft',+e.target.value)}/></Field><Field label="Sasaran draft"><input type="number" value={p.draftGoal} onChange={e=>setP('draftGoal',+e.target.value)}/></Field></div></div><div className="card form-card"><CardTitle title="Personal Google Drive" icon={<Cloud/>}/><div className={`connection ${drive.profile?'connected':''}`}><Cloud size={28}/><div><b>{drive.profile?`Disambung: ${drive.profile.email}`:'Belum disambung'}</b><small>{drive.lastSync?`Sync terakhir ${drive.lastSync}${drive.lastDevice?` • cloud terakhir: ${drive.lastDevice}`:''}`:'Sambungkan akaun Google yang sama pada PC dan telefon.'}</small></div></div><Field label="Nama device ini"><input defaultValue={getDeviceName()} onBlur={e=>{const v=e.target.value.trim()||getDeviceName();localStorage.setItem(DEVICE_NAME_KEY,v)}} placeholder="Contoh: Surface, PC Office, Phone"/></Field>{drive.conflict&&<div className="sync-conflict-box"><b>Sync Conflict</b><p>Cloud berubah pada device lain ketika device ini juga ada perubahan. Auto overwrite telah dihentikan.</p><div className="button-row"><button className="secondary" onClick={()=>resolveConflictKeepCloud()}>Use Cloud Latest</button><button className="danger-btn" onClick={()=>resolveConflictKeepLocal()}>Keep This Device</button></div></div>}<div className="drive-diagnostics"><div><span>Scopes appData + media</span><b className={drive.scopeOk?'diag-ok':'diag-warn'}>{drive.scopeOk?'OK':'Belum disahkan'}</b></div><div><span>Google Drive API</span><b className={drive.apiOk?'diag-ok':'diag-warn'}>{drive.apiOk?'OK':'Belum diuji'}</b></div><div><span>Fail cloud</span><b>{drive.fileStatus}</b></div>{drive.lastError&&<div className="diag-error"><span>Ralat terakhir</span><b>{drive.lastError}</b></div>}</div><div className="button-row"><button className="primary" onClick={()=>syncDrive()}><Cloud/> Smart Sync</button><button className="secondary" onClick={()=>testDrive()}><Database/> Uji Drive</button><button className="secondary" onClick={()=>reconnectDrive()}><RotateCcw/> Reconnect</button><button className="secondary" onClick={()=>saveDrive()}><CloudUpload/> Paksa Simpan</button><button className="secondary" onClick={()=>loadDrive()}><CloudDownload/> Paksa Muat Turun</button></div><p className="hint"><b>Uji Drive</b> semak data tersembunyi dan folder media. v35.3 menggunakan <code>drive.appdata</code> untuk database serta <code>drive.file</code> untuk folder <b>My Drive → strategiSK</b>. Smart Sync: jika device berubah, perubahan dihantar ke Drive; jika device tidak berubah, data terbaru Drive dimuat turun. Selepas naik taraf, tambah kedua-dua scope dalam Google Auth Platform → Data Access dan tekan <b>Reconnect</b> sekali. Origin semasa: <code>{window.location.origin}</code></p></div><div className="card form-card storage-card"><CardTitle title="Safe Storage Architecture — v35.3" icon={<Database/>}/><p className="hint">Database teks kekal di <b>appDataFolder</b>. Gambar dan sketch dipindahkan semasa sync ke folder biasa dalam My Drive.</p><div className="storage-tree"><code>strategiSK/</code><code>├─ diary/</code><code>├─ learning-point/</code><code>├─ learning-files/</code><code>├─ thesis-drafts/</code><code>├─ consultation/</code><code>├─ experts/</code><code>├─ sketches/</code><code>└─ backups/</code></div><p className="hint">Schema data semasa: <b>v{data.schemaVersion||SCHEMA_VERSION}</b>. Data versi lama dimigrate tanpa reset.</p></div><div className="card form-card drive-recovery-card"><CardTitle title="Drive Recovery & Repair" icon={<RotateCcw/>}/><p className="hint">Scan semua folder <b>strategiSK</b> dalam My Drive, kenal pasti duplicate root dan gambar Learning Point yang wujud di Drive tetapi tidak lagi dirujuk oleh database.</p><div className="button-row"><button className="primary" onClick={()=>scanDriveRecovery()} disabled={recovery?.scanning}><Search size={16}/>{recovery?.scanning?'Scanning…':'Scan Drive Recovery'}</button></div>{recovery?.roots?.length>0&&<div className="recovery-roots"><b>strategiSK root folders</b>{recovery.roots.map((r,i)=><label key={r.id} className={`recovery-root ${recovery.canonicalRootId===r.id?'canonical':''}`}><input type="radio" name="canonical-root" checked={recovery.canonicalRootId===r.id} onChange={()=>setCanonicalRoot(r.id)}/><span><strong>Root {i+1} {recovery.canonicalRootId===r.id?'— CANONICAL':''}</strong><small>{r.id} • structure score {r.score}/{Object.keys(MEDIA_FOLDERS).length}</small></span></label>)}</div>}{(recovery?.latestMedia||recovery?.latestBackup)&&<div className="recovery-dates"><div><span>Latest Learning media</span><b>{recovery.latestMedia?.createdTime?new Date(recovery.latestMedia.createdTime).toLocaleString('en-MY'):'—'}</b></div><div><span>Latest visible backup</span><b>{recovery.latestBackup?.createdTime?new Date(recovery.latestBackup.createdTime).toLocaleString('en-MY'):'—'}</b></div></div>}{recovery?.orphans?.length>0&&<><div className="recovery-head"><b>Orphan Learning Point images ({recovery.orphans.length})</b><button className="soft-btn" onClick={()=>setSelectedRecovery(recovery.orphans.map(x=>x.id))}>Select All</button></div><div className="recovery-orphan-list">{recovery.orphans.map(f=><label key={f.id}><input type="checkbox" checked={selectedRecovery.includes(f.id)} onChange={()=>toggleRecovery(f.id)}/><FileImage size={18}/><span><b>{f.name}</b><small>{f.createdTime?new Date(f.createdTime).toLocaleString('en-MY'):''}</small></span></label>)}</div><button className="primary full" disabled={!selectedRecovery.length} onClick={()=>{recoverLearningOrphans(selectedRecovery);setSelectedRecovery([])}}><RotateCcw size={16}/> Recover Selected to Learning Point</button></>}{recovery&&!recovery.scanning&&recovery.roots?.length>0&&!recovery.orphans?.length&&<p className="recovery-ok">No orphan Learning Point image detected.</p>}{recovery?.error&&<p className="diag-error">{recovery.error}</p>}</div><div className="card form-card"><CardTitle title="FOW & FOD Recipients" icon={<Send/>}/><Field label="Nombor WhatsApp SV / CRMP (format 6012...)"><input value={p.whatsapp} onChange={e=>setP('whatsapp',e.target.value)} placeholder="60123456789"/></Field><Field label="Telegram Chat ID"><input value={p.telegramChatId} onChange={e=>setP('telegramChatId',e.target.value)} placeholder="123456789"/></Field><p className="hint">Butang hantar terletak terus dalam bahagian FOW dan FOD.</p></div><div className="card form-card"><CardTitle title="Display & Backup" icon={<Download/>}/><label className="check-card"><input type="checkbox" checked={data.settings.compact} onChange={e=>update('settings',{...data.settings,compact:e.target.checked})}/><span><b>Compact dashboard</b><small>Kurangkan jarak kad untuk skrin kecil.</small></span></label><label className="check-card"><input type="checkbox" checked={data.settings.showGraphics} onChange={e=>update('settings',{...data.settings,showGraphics:e.target.checked})}/><span><b>Elemen grafik</b><small>Papar chart dan ilustrasi.</small></span></label><label className="check-card"><input type="checkbox" checked={data.settings.autoSync!==false} onChange={e=>update('settings',{...data.settings,autoSync:e.target.checked})}/><span><b>Multi-Device Safe Sync</b><small>Auto-save local serta-merta, cuba sync selepas ±25 saat idle, semak semula cloud setiap 5 minit dan apabila app kembali aktif. Jika cloud berubah pada device lain, overwrite dihentikan dan Conflict dipaparkan.</small></span></label><div className="button-row"><button className="secondary" onClick={exportJson}><Download/> Export JSON</button><button className="secondary" onClick={()=>manualDriveBackup()}><CloudUpload/> Snapshot Drive</button><label className="secondary file-button"><Upload/> Import JSON<input type="file" accept="application/json" onChange={importJson}/></label><button className="danger-btn" onClick={()=>{if(confirm('Reset semua data?')){localStorage.removeItem(APP_KEY);location.reload()}}}><RotateCcw/> Reset</button></div></div></div>}

function TaskModal({update,close}){const[x,setX]=useState({title:'',date:iso(),category:'Thesis'});return <Modal title="Tambah Tugasan" onClose={close}><Field label="Tugasan"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Kategori"><input value={x.category} onChange={e=>setX({...x,category:e.target.value})}/></Field><button className="primary full" onClick={()=>{if(x.title.trim())update('tasks',xs=>[...xs,{...x,id:uid(),done:false}]);close()}}><Save/> Simpan</button></Modal>}
function EventModal({update,close,initialDate=iso()}){const[x,setX]=useState({title:'',date:initialDate,start:'09:00',end:'10:00'});return <Modal title="Tambah Aktiviti Kalendar" onClose={close}><Field label="Aktiviti"><input autoFocus value={x.title} onChange={e=>setX({...x,title:e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><div className="form-grid"><Field label="Mula"><input type="time" value={x.start} onChange={e=>setX({...x,start:e.target.value})}/></Field><Field label="Tamat"><input type="time" value={x.end} onChange={e=>setX({...x,end:e.target.value})}/></Field></div><button className="primary full" onClick={()=>{if(x.title.trim())update('events',xs=>[...xs,{...x,id:uid()}]);close()}}><Save/> Simpan</button></Modal>}
function DiaryModal({data,update,close,initialDate=iso(),initialId=null,driveToken}){
  const existing=initialId?data.diary.find(d=>d.id===initialId):null
  const blank=date=>({id:uid(),date,reflection:'',win:'',mood:4,image:'',images:[],labels:[],createdAt:new Date().toISOString()})
  const[x,setX]=useState(existing?(()=>{const v={image:'',images:[],labels:[],...existing};v.images=Array.isArray(v.images)&&v.images.length?v.images:(v.image?[v.image]:[]);v.image=v.images[0]||'';return v})():blank(initialDate)),[labelText,setLabelText]=useState('')
  const commonLabels=['Writing','Reading','Supervisor','Methodology','Data','Analysis','Publication','Milestone','Personal']
  const upload=async files=>{const arr=Array.from(files||[]);if(!arr.length)return;try{const added=[];for(const file of arr){const img=await readImageFile(file);added.push(pendingMedia(img,file.name,'diary'))}setX(v=>{const images=[...(v.images||[]),...added];return {...v,images,image:images[0]||''}})}catch{}}
  const addLabel=value=>{const parts=String(value||'').split(',').map(x=>x.trim()).filter(Boolean);if(!parts.length)return;setX(v=>({...v,labels:Array.from(new Set([...(v.labels||[]),...parts]))}));setLabelText('')}
  const save=()=>{const images=(x.images||[]).filter(Boolean);const entry={...x,images,image:images[0]||'',labels:x.labels||[],updatedAt:new Date().toISOString()};update('diary',xs=>existing?xs.map(i=>i.id===existing.id?entry:i):[...xs,entry]);close()}
  return <Modal title={existing?'Edit Diary Story':'New Diary Story'} onClose={close}><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field><Field label="Cerita / refleksi"><textarea rows="7" value={x.reflection} onChange={e=>setX({...x,reflection:e.target.value})} placeholder="Tulis satu cerita / refleksi untuk gambar ini..."/></Field><Field label="Win kecil hari ini"><input value={x.win} onChange={e=>setX({...x,win:e.target.value})}/></Field><Field label="Diary Labels"><div className="label-entry"><input value={labelText} onChange={e=>setLabelText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addLabel(labelText)}}} placeholder="Contoh: Writing, Supervisor, Milestone"/><button className="secondary" type="button" onClick={()=>addLabel(labelText)}><Plus size={14}/> Add</button></div><div className="label-quick">{commonLabels.map(lbl=><button type="button" key={lbl} className={(x.labels||[]).includes(lbl)?'selected':''} onClick={()=> (x.labels||[]).includes(lbl)?setX(v=>({...v,labels:v.labels.filter(i=>i!==lbl)})):addLabel(lbl)}>{lbl}</button>)}</div>{x.labels?.length>0&&<div className="diary-labels editable">{x.labels.map(lbl=><button type="button" key={lbl} onClick={()=>setX(v=>({...v,labels:v.labels.filter(i=>i!==lbl)}))}>{lbl}<X size={12}/></button>)}</div>}</Field><Field label={`Mood / tenaga: ${x.mood}/5`}><input type="range" min="1" max="5" value={x.mood} onChange={e=>setX({...x,mood:+e.target.value})}/></Field><Field label="Gambar diari (boleh pilih banyak)"><label className="diary-upload multi-upload"><ImagePlus size={30}/><span>Tambah gambar</span><input type="file" accept="image/*" multiple onChange={e=>upload(e.target.files)}/></label>{x.images?.length>0&&<MediaSlider items={x.images} token={driveToken} alt="Preview diari" variant="contain" onRemove={idx=>setX(v=>{const images=(v.images||[]).filter((_,i)=>i!==idx);return {...v,images,image:images[0]||''}})}/>}</Field><p className="hint">Boleh pilih beberapa gambar serentak. Paparan menunjukkan satu gambar pada satu masa; swipe kiri/kanan atau guna anak panah untuk melihat gambar lain.</p><button className="primary full" onClick={save}><Save/> {existing?'Simpan Perubahan':'Simpan Cerita Diari'}</button></Modal>
}
function DraftModal({data,update,initial,close}){const[x,setX]=useState(initial||{draft:data.profile.currentDraft+1,date:iso(),focus:'',pages:1,note:''});const save=()=>{if(initial)update('draftHistory',xs=>xs.map(i=>i.id===initial.id?{...x,id:initial.id}:i));else update('draftHistory',xs=>[...xs,{...x,id:uid()}]);const drafts=(initial?data.draftHistory.map(i=>i.id===initial.id?x:i):[...data.draftHistory,x]).map(i=>i.draft);update('profile',{...data.profile,currentDraft:Math.max(...drafts)});close()};return <Modal title={initial?'Edit Rekod Draft':'Naik Draft Thesis'} onClose={close}><div className="form-grid"><Field label="Nombor Draft"><input type="number" value={x.draft} onChange={e=>setX({...x,draft:+e.target.value})}/></Field><Field label="Tarikh"><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/></Field></div><Field label="Fokus / seksyen"><input value={x.focus} onChange={e=>setX({...x,focus:e.target.value})}/></Field><Field label="Muka surat ditambah / dibaiki"><input type="number" value={x.pages} onChange={e=>setX({...x,pages:+e.target.value})}/></Field><Field label="Catatan perubahan"><textarea rows="4" value={x.note} onChange={e=>setX({...x,note:e.target.value})}/></Field><button className="primary full" onClick={save}>{initial?<Save/>:<Rocket/>}{initial?'Simpan Perubahan':`Naik ke Draft ${x.draft}`}</button></Modal>}
function CountdownModal({data,update,close}){const[x,setX]=useState({label:'',date:addDays(7),type:'short'});return <Modal title="Urus Days Remaining" onClose={close} wide><div className="countdown-manage">{data.countdowns.map(c=><div key={c.id}><input value={c.label} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,label:e.target.value}:i))}/><input type="date" value={c.date} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,date:e.target.value}:i))}/><select value={c.type} onChange={e=>update('countdowns',xs=>xs.map(i=>i.id===c.id?{...i,type:e.target.value}:i))}><option value="short">Short term</option><option value="mid">Mid term</option></select><b>{daysBetween(c.date)} hari</b><button className="icon-btn danger" onClick={()=>update('countdowns',xs=>xs.filter(i=>i.id!==c.id))}><Trash2/></button></div>)}</div><hr/><div className="countdown-add"><input placeholder="Nama sasaran" value={x.label} onChange={e=>setX({...x,label:e.target.value})}/><input type="date" value={x.date} onChange={e=>setX({...x,date:e.target.value})}/><select value={x.type} onChange={e=>setX({...x,type:e.target.value})}><option value="short">Short term</option><option value="mid">Mid term</option></select><button className="primary" onClick={()=>{if(x.label)update('countdowns',xs=>[...xs,{...x,id:uid()}]);setX({...x,label:''})}}><Plus/> Tambah</button></div></Modal>}
function TimelineModal({data,update,close}){const add=()=>update('timeline',xs=>[...xs,{id:uid(),name:'Fasa baharu',startMonth:0,duration:3,progress:0}]);return <Modal title="Edit Timeline GBT 2.5 Tahun" onClose={close} wide><p className="hint">Kiraan bulan bermula daripada bulan pertama PhD. Contoh: bulan mula 0 ialah bulan pertama, dan tempoh 6 ialah enam bulan.</p><div className="timeline-editor">{data.timeline.map((x,index)=><div key={x.id} className="timeline-edit-row"><span className="timeline-order">{index+1}</span><Field label="Nama fasa"><input value={x.name} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,name:e.target.value}:i))}/></Field><Field label="Bulan mula (0–29)"><input type="number" min="0" max="29" value={x.startMonth} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,startMonth:Math.max(0,Math.min(29,+e.target.value))}:i))}/></Field><Field label="Tempoh (bulan)"><input type="number" min="1" max="30" value={x.duration} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,duration:Math.max(1,Math.min(30,+e.target.value))}:i))}/></Field><Field label="Progress %"><input type="number" min="0" max="100" value={x.progress} onChange={e=>update('timeline',xs=>xs.map(i=>i.id===x.id?{...i,progress:Math.max(0,Math.min(100,+e.target.value))}:i))}/></Field><button className="icon-btn danger timeline-row-delete" onClick={()=>update('timeline',xs=>xs.filter(i=>i.id!==x.id))}><Trash2 size={17}/></button></div>)}</div><div className="modal-actions"><button className="secondary" onClick={add}><Plus/> Tambah Fasa</button><button className="primary" onClick={close}><Save/> Selesai</button></div></Modal>}
function ProgressModal({data,gbtProgress,draftProgress,targetDays,close}){return <Modal title="Butiran Progress GBT" onClose={close} wide><div className="progress-overview"><Ring value={gbtProgress} label="GBT" size={150}/><Ring value={draftProgress} label="Draft 111" size={150}/><div className="big-number"><strong>{targetDays}</strong><span>hari berbaki</span></div></div><ProgressList items={data.chapters}/></Modal>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
