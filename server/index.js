const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { neon } = require('@neondatabase/serverless')
const IS_VERCEL = Boolean(process.env.VERCEL)

const app = express()
const PORT = Number(process.env.PORT || 8787)
const ROOT = path.join(__dirname, '..')
const UPLOADS = path.join(ROOT, 'uploads')
const DATA_FILE = path.join(__dirname, 'data.json')
const SECRET = process.env.PULSE_SECRET || 'pulse-board-local-secret-change-me'

if (!IS_VERCEL) fs.mkdirSync(UPLOADS, { recursive: true })
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '5mb' }))
if (!IS_VERCEL) app.use('/uploads', express.static(UPLOADS, { fallthrough: true, maxAge: '1h' }))

const upload = multer({
  storage: multer.diskStorage({ destination: UPLOADS, filename: (_req, _file, cb) => cb(null, `tmp-${crypto.randomUUID()}`) }),
  limits: { fileSize: 800 * 1024 * 1024 },
})

const ROLE_LABELS = {
  admin: 'Administrator', warden: 'Hostel Warden', editor: 'Content Editor', scoreboard: 'Scoreboard Updater', viewer: 'Viewer',
}
const makeId = prefix => `${prefix}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
const nowIso = () => new Date().toISOString()
const makeIso = minutes => new Date(Date.now() + minutes * 60000).toISOString()
const isoOr = (value, fallback) => { const d = value ? new Date(value) : null; return d && !Number.isNaN(d.getTime()) ? d.toISOString() : fallback }
const clamp = (v,min,max,def) => { const n=Number(v); return Number.isFinite(n) ? Math.min(max,Math.max(min,n)) : def }

const seedData = () => ({
  settings: {
    instituteName: 'Sri Sathya Sai Institute of Higher Learning',
    hostelName: 'Pulse Board', timezone: 'Asia/Kolkata', defaultDuration: 10, defaultRefreshSeconds: 5,
    newsRefreshMinutes: 30, newsEnabled: true, scoresEnabled: true, brandingEnabled: true,
    tickerEnabled: true, tickerText: 'Welcome to Pulse Board · Hostel notices · Daily news · Live house scores',
    maintenanceMode: false, defaultTransition: 'fade', defaultVolume: 70, defaultBrightness: 100,
  },
  boards: [
    { id:'board-1',name:'Board 01',location:'Prasanthi Hostel · Dining Hall Entrance',status:'Online',lastSeen:nowIso(),refreshIntervalSec:5,volume:75,brightness:100,autoplay:true,orientation:'landscape',transition:'fade',showClock:true,showBranding:true,enabled:true,manualState:'playing',command:null,commandAt:null },
    { id:'board-2',name:'Board 02',location:'Students Hostel · Main Corridor',status:'Online',lastSeen:new Date(Date.now()-3500).toISOString(),refreshIntervalSec:5,volume:65,brightness:95,autoplay:true,orientation:'landscape',transition:'slide',showClock:true,showBranding:true,enabled:true,manualState:'playing',command:null,commandAt:null },
    { id:'board-3',name:'Board 03',location:'Ladies Hostel · Common Area',status:'Online',lastSeen:new Date(Date.now()-7500).toISOString(),refreshIntervalSec:5,volume:60,brightness:100,autoplay:true,orientation:'landscape',transition:'fade',showClock:true,showBranding:true,enabled:true,manualState:'playing',command:null,commandAt:null },
  ],
  users: [
    { id:'u-admin',name:'Pulse Administrator',username:'admin',password:'admin2026',role:'admin',active:true },
    { id:'u-warden',name:'Hostel Warden',username:'warden',password:'pulse2026',role:'warden',active:true },
    { id:'u-editor',name:'Content Editor',username:'editor',password:'editor2026',role:'editor',active:true },
    { id:'u-score',name:'Scoreboard Updater',username:'score',password:'score2026',role:'scoreboard',active:true },
    { id:'u-viewer',name:'Display Viewer',username:'viewer',password:'viewer2026',role:'viewer',active:true },
  ],
  content: [
    { id:'c1',title:'Inter-House Cultural Evening',description:'Dining Hall · 6:30 PM · All houses welcome',category:'Campus',type:'poster',mediaKind:'image',mediaUrl:'',enabled:true,published:true,startAt:makeIso(-120),endAt:makeIso(7200),duration:12,priority:8,muted:false,loop:false,boardIds:['board-1','board-2','board-3'],createdAt:nowIso(),updatedAt:nowIso() },
    { id:'c2',title:'Hostel Mess Menu · September 29',description:'Breakfast · lunch · dinner timings and menu',category:'Hostel',type:'poster',mediaKind:'image',mediaUrl:'',enabled:true,published:true,startAt:makeIso(-60),endAt:makeIso(900),duration:10,priority:6,muted:false,loop:false,boardIds:['board-1','board-2'],createdAt:nowIso(),updatedAt:nowIso() },
    { id:'c3',title:'Orientation Welcome Video',description:'Welcome message for students',category:'Campus',type:'video',mediaKind:'video',mediaUrl:'',enabled:true,published:true,startAt:makeIso(-30),endAt:makeIso(2400),duration:30,priority:5,muted:true,loop:false,boardIds:['board-1'],createdAt:nowIso(),updatedAt:nowIso() },
    { id:'c4',title:'Library Timings — Exam Week',description:'Extended reading room hours',category:'Academic',type:'poster',mediaKind:'image',mediaUrl:'',enabled:true,published:true,startAt:makeIso(1440),endAt:makeIso(4320),duration:12,priority:3,muted:false,loop:false,boardIds:['board-2','board-3'],createdAt:nowIso(),updatedAt:nowIso() },
    { id:'c5',title:'Emergency Contacts',description:'Warden office · security · medical centre',category:'Emergency',type:'poster',mediaKind:'image',mediaUrl:'',enabled:true,published:true,startAt:makeIso(-500),endAt:makeIso(12000),duration:8,priority:12,muted:false,loop:false,boardIds:['board-1','board-2','board-3'],createdAt:nowIso(),updatedAt:nowIso() },
  ],
  scores: [
    { id:'s1',sport:'CRICKET',event:'Inter-House League · Match 07',teamA:'Love House',teamB:'Shanti House',scoreA:'142/5',scoreB:'96/7',meta:'Love House batting · 16.2 overs',live:true,published:true,boardIds:['board-1','board-2','board-3'],updatedAt:nowIso() },
    { id:'s2',sport:'VOLLEYBALL',event:'Semi-final · Court 2',teamA:'Prasanthi',teamB:'Sai Ganga',scoreA:'21',scoreB:'18',meta:'Set 2 · best of 3',live:true,published:true,boardIds:['board-2'],updatedAt:nowIso() },
    { id:'s3',sport:'QUIZ',event:'General Knowledge Round',teamA:'Vivekananda',teamB:'Sivananda',scoreA:'34',scoreB:'31',meta:'Round 4 of 6',live:false,published:false,boardIds:['board-1'],updatedAt:nowIso() },
  ],
  news: [
    { id:'n1',category:'National',title:'Today’s top India headlines in 30 seconds',source:'Pulse Digest',time:'07:45',active:true,updatedAt:nowIso() },
    { id:'n2',category:'Education',title:'Campus and higher-education updates for students',source:'Campus Desk',time:'07:42',active:true,updatedAt:nowIso() },
    { id:'n3',category:'Sports',title:'Cricket, football and house-sport highlights',source:'Sports Desk',time:'07:40',active:true,updatedAt:nowIso() },
    { id:'n4',category:'Campus',title:'Library and hostel announcements to know today',source:'Hostel Office',time:'07:35',active:true,updatedAt:nowIso() },
  ],
  audit: [{ id:makeId('audit'),time:nowIso(),actor:'System',action:'Pulse Board initialized',detail:'Version 3 demo data created.' }],
})

let data
try { data = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE,'utf8')) : seedData() } catch { data = seedData() }
function migrate(){
  const seed=seedData()
  data.settings={...seed.settings,...(data.settings||{})}
  data.boards=(data.boards||seed.boards).map(b=>({...seed.boards[0],...b}))
  data.users=(data.users||seed.users).map(u=>({active:true,...u}))
  data.content=(data.content||[]).map(c=>({enabled:true,published:true,duration:10,priority:1,muted:false,loop:false,boardIds:data.boards.map(b=>b.id),mediaKind:c.type==='video'?'video':'image',...c,type:c.type==='video'?'video':'poster'}))
  data.scores=(data.scores||[]).map(s=>({live:false,published:s.live!==false,boardIds:data.boards.map(b=>b.id),...s}))
  data.news=data.news||seed.news
  data.audit=data.audit||[]
}
migrate()
let cloudDirty = false
let cloudVersion = 0
let cloudSql = null
let cloudTablePromise = null
let apiRequestQueue = Promise.resolve()
const save=()=>{ if (IS_VERCEL) { cloudDirty = true; return } fs.writeFileSync(DATA_FILE,JSON.stringify(data,null,2)) }
const record=(actor,action,detail='')=>{ data.audit.unshift({id:makeId('audit'),time:nowIso(),actor:actor||'Admin',action,detail}); data.audit=data.audit.slice(0,500); save() }

function publicUser(u){ return {id:u.id,name:u.name,username:u.username,role:u.role,roleLabel:ROLE_LABELS[u.role]||u.role,active:u.active} }
function signToken(user){
  const payload=Buffer.from(JSON.stringify({id:user.id,exp:Date.now()+8*60*60*1000})).toString('base64url')
  const sig=crypto.createHmac('sha256',SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}
function verifyToken(token){
  try { const [payload,sig]=String(token||'').split('.'); if(!payload||!sig)return null; const expected=crypto.createHmac('sha256',SECRET).update(payload).digest('base64url'); if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null; const p=JSON.parse(Buffer.from(payload,'base64url').toString('utf8')); if(!p.id||Date.now()>p.exp)return null; return p } catch { return null }
}
function reqUser(req){ const p=verifyToken(req.header('x-pulse-token')); return p ? data.users.find(u=>u.id===p.id&&u.active) : null }
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(String(password || ''), salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}
function passwordMatches(user, supplied) {
  if (user.passwordHash) {
    try {
      const [, salt, expectedHex] = user.passwordHash.split('$')
      const actual = crypto.scryptSync(String(supplied || ''), salt, 64)
      const expected = Buffer.from(expectedHex, 'hex')
      return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
    } catch { return false }
  }
  return user.password === String(supplied || '')
}
function cloudSeedData() {
  const password = process.env.PULSE_ADMIN_PASSWORD
  if (!password || String(password).length < 12) throw new Error('Set PULSE_ADMIN_PASSWORD to a strong password of at least 12 characters before first deployment.')
  const seeded = seedData()
  seeded.users = [{ id:'u-admin', name:'Pulse Administrator', username:String(process.env.PULSE_ADMIN_USERNAME || 'admin').trim(), passwordHash:hashPassword(password), role:'admin', active:true }]
  seeded.audit = [{ id:makeId('audit'), time:nowIso(), actor:'System', action:'Pulse Board cloud initialized', detail:'Cloud database initialized with an environment-configured administrator account.' }]
  return seeded
}
function getCloudSql() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) throw new Error('Cloud database is not configured. Add DATABASE_URL (or POSTGRES_URL) in Vercel → Settings → Environment Variables.')
  if (!cloudSql) cloudSql = neon(connectionString)
  return cloudSql
}
async function ensureCloudTable() {
  if (!cloudTablePromise) {
    cloudTablePromise = (async () => {
      const sql = getCloudSql()
      await sql`CREATE TABLE IF NOT EXISTS pulse_board_state (id text PRIMARY KEY, payload jsonb NOT NULL, version bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now())`
    })().catch(error => { cloudTablePromise = null; throw error })
  }
  return cloudTablePromise
}
async function loadCloudState() {
  if (!process.env.PULSE_SECRET || String(process.env.PULSE_SECRET).length < 32) throw new Error('Set PULSE_SECRET to a random secret of at least 32 characters in Vercel Environment Variables.')
  const sql = getCloudSql()
  await ensureCloudTable()
  const rows = await sql`SELECT payload, version FROM pulse_board_state WHERE id = 'main' LIMIT 1`
  if (rows.length) {
    data = typeof rows[0].payload === 'string' ? JSON.parse(rows[0].payload) : rows[0].payload
    cloudVersion = Number(rows[0].version || 0)
    migrate()
    return
  }
  data = cloudSeedData()
  const encoded = JSON.stringify(data)
  const inserted = await sql`INSERT INTO pulse_board_state (id, payload, version, updated_at) VALUES ('main', ${encoded}::jsonb, 0, now()) ON CONFLICT (id) DO NOTHING RETURNING payload, version`
  if (inserted.length) {
    cloudVersion = Number(inserted[0].version || 0)
  } else {
    const concurrent = await sql`SELECT payload, version FROM pulse_board_state WHERE id = 'main' LIMIT 1`
    data = typeof concurrent[0].payload === 'string' ? JSON.parse(concurrent[0].payload) : concurrent[0].payload
    cloudVersion = Number(concurrent[0].version || 0)
    migrate()
  }
}
async function persistCloudState() {
  const sql = getCloudSql()
  const encoded = JSON.stringify(data)
  const rows = await sql`UPDATE pulse_board_state SET payload = ${encoded}::jsonb, version = version + 1, updated_at = now() WHERE id = 'main' AND version = ${cloudVersion} RETURNING version`
  if (!rows.length) {
    cloudDirty = false
    const error = new Error('Another request changed Pulse Board at the same time. Refresh the page and repeat the action.')
    error.code = 'PULSE_WRITE_CONFLICT'
    throw error
  }
  cloudVersion = Number(rows[0].version)
  cloudDirty = false
}
if (IS_VERCEL) {
  // Serialize work within a warm function instance and use a DB version check across instances.
  app.use(async (req, res, next) => {
    if (!req.path.startsWith('/api/')) return next()
    const previous = apiRequestQueue
    let unlockQueue
    apiRequestQueue = new Promise(resolve => { unlockQueue = resolve })
    await previous
    let released = false
    const release = () => { if (!released) { released = true; unlockQueue() } }
    res.once('finish', release)
    res.once('close', release)
    try {
      await loadCloudState()
      cloudDirty = false
      const sendJson = res.json.bind(res)
      res.json = body => {
        if (!cloudDirty) return sendJson(body)
        persistCloudState().then(() => sendJson(body)).catch(error => {
          console.error('Pulse Board persistent write failed:', error)
          if (res.headersSent) return
          res.status(error.code === 'PULSE_WRITE_CONFLICT' ? 409 : 500)
          sendJson({ error: error.message || 'Could not save to the cloud database.' })
        })
        return res
      }
      next()
    } catch (error) {
      console.error('Pulse Board cloud initialization failed:', error)
      release()
      res.status(503).json({ error: error.message || 'Pulse Board cloud setup is incomplete. Configure a PostgreSQL database, PULSE_SECRET and PULSE_ADMIN_PASSWORD in Vercel Environment Variables.' })
    }
  })
}
function requireRoles(roles){ return (req,res,next)=>{ const u=reqUser(req); if(!u)return res.status(401).json({error:'Your session is expired. Please sign in again.'}); if(!roles.includes(u.role))return res.status(403).json({error:'You do not have permission for this action.'}); req.user=u; next() } }
function contentStatus(c){ if(!c.enabled)return 'Disabled'; if(!c.published)return 'Draft'; const s=new Date(c.startAt).getTime(),e=new Date(c.endAt).getTime(),n=Date.now(); if(Number.isNaN(s)||Number.isNaN(e))return 'Needs attention'; if(n<s)return 'Scheduled'; if(n>e)return 'Expired'; return 'Published' }
function decorateContent(c){ return {...c,status:contentStatus(c)} }
function boardNames(ids){return (ids||[]).map(id=>data.boards.find(b=>b.id===id)?.name).filter(Boolean)}
function safeBoardIds(ids){ const valid=new Set(data.boards.map(b=>b.id)); return Array.isArray(ids)?ids.filter(id=>valid.has(id)):[] }
function inferMedia(file){ if(!file)return null; if(file.mimetype?.startsWith('video/'))return 'video'; if(file.mimetype?.startsWith('image/'))return 'image'; const ext=path.extname(file.originalname).toLowerCase(); if(['.mp4','.webm','.mov','.m4v','.ogg','.ogv'].includes(ext))return 'video'; if(['.jpg','.jpeg','.png','.webp','.gif','.bmp'].includes(ext))return 'image'; return null }
function moveUpload(file,id,kind){ const ext=(path.extname(file.originalname)|| (kind==='video'?'.mp4':'.jpg')).toLowerCase(); const safeExt=ext.replace(/[^a-z0-9.]/g,'').slice(0,10)|| (kind==='video'?'.mp4':'.jpg'); const final=`${id}${safeExt}`; fs.renameSync(file.path,path.join(UPLOADS,final)); return `/uploads/${final}` }
function removeMedia(url){ if(!url)return; try{fs.unlinkSync(path.join(UPLOADS,path.basename(url)))}catch{} }

app.post('/api/auth/login',(req,res)=>{ const {username,password}=req.body||{}; const u=data.users.find(x=>x.username===String(username||'').trim()&&x.active); if(!u||!passwordMatches(u,password))return res.status(401).json({error:'Invalid username/password or inactive account.'}); res.json({token:signToken(u),user:publicUser(u)}) })
app.get('/api/me',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>res.json(publicUser(req.user)))

app.get('/api/dashboard',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>{
  const content=data.content.map(decorateContent); const online=data.boards.filter(b=>b.enabled&&b.status==='Online').length
  res.json({settings:data.settings,stats:{boards:online,totalBoards:data.boards.length,activeContent:content.filter(c=>c.status==='Published').length,scheduled:content.filter(c=>c.status==='Scheduled').length,liveMatches:data.scores.filter(s=>s.live&&s.published).length,news:data.news.filter(n=>n.active).length,users:data.users.filter(u=>u.active).length},boards:data.boards.map(b=>({...b,lastSeenSeconds:Math.max(0,Math.round((Date.now()-new Date(b.lastSeen).getTime())/1000))})),audit:data.audit.slice(0,10),upcoming:content.filter(c=>!['Expired','Disabled'].includes(c.status)).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt)).slice(0,8).map(c=>({...c,board:boardNames(c.boardIds)[0]||'No boards'}))})
})

app.post('/api/blob-upload', async (req, res) => {
  if (!IS_VERCEL) return res.status(404).json({ error: 'Cloud upload endpoint is only enabled on Vercel deployments.' })
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Create a Vercel Blob store and add BLOB_READ_WRITE_TOKEN to this deployment before uploading media.' })
  try {
    const { handleUpload } = await import('@vercel/blob/client')
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const tokenPayload = verifyToken(clientPayload)
        const user = tokenPayload ? data.users.find(u => u.id === tokenPayload.id && u.active) : null
        if (!user || !['admin','warden','editor'].includes(user.role)) throw new Error('Sign in with an Administrator, Warden or Content Editor account to upload media.')
        const safeName = String(pathname || '').toLowerCase()
        const video = /\.(mp4|webm|mov|m4v|ogg|ogv)$/.test(safeName)
        const image = /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(safeName)
        if (!video && !image) throw new Error('Unsupported media file. Upload an image or MP4, WebM, MOV, M4V video.')
        return {
          allowedContentTypes: ['image/jpeg','image/png','image/webp','image/gif','image/bmp','video/mp4','video/webm','video/quicktime','video/x-m4v','video/ogg'],
          maximumSizeInBytes: 800 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Pulse Board media uploaded', blob.pathname, tokenPayload ? 'authenticated' : 'unknown')
      },
    })
    res.json(result)
  } catch (error) {
    console.error('Blob upload token failed:', error)
    res.status(400).json({ error: error.message || 'Could not authorize media upload.' })
  }
})

app.get('/api/content',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>res.json(data.content.map(decorateContent)))
app.post('/api/content',requireRoles(['admin','warden','editor']),upload.single('file'),(req,res)=>{
  try{
    const b=req.body||{}, id=makeId('content'); let parsed=[]; try{parsed=JSON.parse(b.boardIds||'[]')}catch{}
    const detected=inferMedia(req.file) || (b.mediaKind==='video'?'video':b.mediaKind==='image'?'image':null)
    if((req.file || b.mediaUrl) && !detected)return res.status(400).json({error:'Unsupported media file. Upload JPG, PNG, WEBP, MP4, WEBM, MOV or M4V.'})
    if(detected==='video'&&b.type!=='video'){if(req.file)try{fs.unlinkSync(req.file.path)}catch{};return res.status(400).json({error:'This upload is a video. Select Video as the content type and submit again.'})}
    const kind=detected || (b.type==='video'?'video':'image')
    const item={id,title:b.title||'Untitled content',description:b.description||'',category:b.category||'Campus',type:kind==='video'?'video':'poster',mediaKind:kind,mediaUrl:req.file?moveUpload(req.file,id,kind):(typeof b.mediaUrl==='string'?b.mediaUrl:''),enabled:b.enabled!=='false',published:b.published!=='false',startAt:isoOr(b.startAt,nowIso()),endAt:isoOr(b.endAt,makeIso(4320)),duration:clamp(b.duration,1,3600,10),priority:clamp(b.priority,1,100,1),muted:b.muted==='true',loop:b.loop==='true',boardIds:safeBoardIds(parsed),createdAt:nowIso(),updatedAt:nowIso()}
    if(!item.boardIds.length)item.boardIds=data.boards.map(x=>x.id)
    data.content.unshift(item); record(req.user.name,'Created content',item.title); res.status(201).json(decorateContent(item))
  }catch(e){ if(req.file)try{fs.unlinkSync(req.file.path)}catch{}; res.status(500).json({error:e.message||'Could not save content.'}) }
})
app.put('/api/content/:id',requireRoles(['admin','warden','editor']),upload.single('file'),(req,res)=>{
  try{
    const item=data.content.find(x=>x.id===req.params.id); if(!item)return res.status(404).json({error:'Content not found.'}); const b=req.body||{}
    if(req.file){ const detected=inferMedia(req.file); if(!detected){try{fs.unlinkSync(req.file.path)}catch{};return res.status(400).json({error:'Unsupported media file.'});} if(b.type==='video'&&detected!=='video'){try{fs.unlinkSync(req.file.path)}catch{};return res.status(400).json({error:'Selected type is Video but uploaded file is not a video.'});} if(b.type!=='video'&&detected==='video'){try{fs.unlinkSync(req.file.path)}catch{};return res.status(400).json({error:'Uploaded file is a video. Select Video as type.'});} removeMedia(item.mediaUrl); item.mediaUrl=moveUpload(req.file,item.id,detected); item.mediaKind=detected; item.type=detected==='video'?'video':'poster' } else if(typeof b.mediaUrl==='string' && b.mediaUrl) { const detected=b.mediaKind==='video'?'video':b.mediaKind==='image'?'image':null; if(!detected)return res.status(400).json({error:'Missing or invalid media type for the uploaded file.'}); if((b.type==='video')!==(detected==='video'))return res.status(400).json({error:'Media file type does not match the selected content type.'}); item.mediaUrl=b.mediaUrl; item.mediaKind=detected; item.type=detected==='video'?'video':'poster' }
    for(const k of ['title','description','category'])if(b[k]!==undefined)item[k]=b[k]
    if(b.type!==undefined&&!req.file){ const requested=b.type==='video'?'video':'poster'; if(item.mediaUrl && requested!==item.type)return res.status(400).json({error:'To change Poster ↔ Video, upload a replacement media file of the new type.'}); item.type=requested }
    if(b.duration!==undefined)item.duration=clamp(b.duration,1,3600,item.duration)
    if(b.priority!==undefined)item.priority=clamp(b.priority,1,100,item.priority)
    if(b.startAt!==undefined)item.startAt=isoOr(b.startAt,item.startAt)
    if(b.endAt!==undefined)item.endAt=isoOr(b.endAt,item.endAt)
    if(b.enabled!==undefined)item.enabled=b.enabled===true||b.enabled==='true'
    if(b.published!==undefined)item.published=b.published===true||b.published==='true'
    if(b.muted!==undefined)item.muted=b.muted===true||b.muted==='true'
    if(b.loop!==undefined)item.loop=b.loop===true||b.loop==='true'
    if(b.boardIds!==undefined){let ids=[];try{ids=JSON.parse(b.boardIds)}catch{}; item.boardIds=safeBoardIds(ids); if(!item.boardIds.length)item.boardIds=data.boards.map(x=>x.id)}
    item.mediaKind=item.type==='video'?'video':'image'; item.updatedAt=nowIso(); record(req.user.name,'Updated content',item.title); res.json(decorateContent(item))
  }catch(e){if(req.file)try{fs.unlinkSync(req.file.path)}catch{};res.status(500).json({error:e.message||'Could not update content.'})}
})
app.post('/api/content/:id/toggle',requireRoles(['admin','warden','editor']), (req,res)=>{const i=data.content.find(x=>x.id===req.params.id);if(!i)return res.status(404).json({error:'Content not found.'});i.enabled=!i.enabled;i.updatedAt=nowIso();record(req.user.name,i.enabled?'Enabled content':'Disabled content',i.title);res.json(decorateContent(i))})
app.post('/api/content/:id/publish',requireRoles(['admin','warden','editor']),(req,res)=>{const i=data.content.find(x=>x.id===req.params.id);if(!i)return res.status(404).json({error:'Content not found.'});i.published=req.body?.published!==false;i.enabled=true;i.updatedAt=nowIso();record(req.user.name,i.published?'Published content':'Moved content to draft',i.title);res.json(decorateContent(i))})
app.post('/api/content/:id/duplicate',requireRoles(['admin','warden','editor']),(req,res)=>{const i=data.content.find(x=>x.id===req.params.id);if(!i)return res.status(404).json({error:'Content not found.'});const copy={...i,id:makeId('content'),title:`${i.title} · Copy`,startAt:nowIso(),endAt:makeIso(4320),createdAt:nowIso(),updatedAt:nowIso()};if(i.mediaUrl && i.mediaUrl.startsWith('/uploads/')){const source=path.join(UPLOADS,path.basename(i.mediaUrl));if(fs.existsSync(source)){const ext=path.extname(i.mediaUrl);const target=`${copy.id}${ext}`;fs.copyFileSync(source,path.join(UPLOADS,target));copy.mediaUrl=`/uploads/${target}`}}data.content.unshift(copy);record(req.user.name,'Duplicated content',copy.title);res.status(201).json(decorateContent(copy))})
app.delete('/api/content/:id',requireRoles(['admin','warden','editor']),(req,res)=>{const idx=data.content.findIndex(x=>x.id===req.params.id);if(idx<0)return res.status(404).json({error:'Content not found.'});const [i]=data.content.splice(idx,1);removeMedia(i.mediaUrl);record(req.user.name,'Deleted content',i.title);res.json({ok:true})})

app.get('/api/news',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>res.json(data.news.filter(n=>n.active)))
app.get('/api/news/all',requireRoles(['admin','warden','editor']),(req,res)=>res.json(data.news))
app.post('/api/news',requireRoles(['admin','warden','editor']),(req,res)=>{const b=req.body||{};const n={id:makeId('news'),category:b.category||'Campus',title:b.title||'Untitled headline',source:b.source||'Pulse Digest',time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),active:b.active!==false,updatedAt:nowIso()};data.news.unshift(n);record(req.user.name,'Added news story',n.title);res.status(201).json(n)})
app.put('/api/news/:id',requireRoles(['admin','warden','editor']),(req,res)=>{const n=data.news.find(x=>x.id===req.params.id);if(!n)return res.status(404).json({error:'News story not found.'});Object.assign(n,req.body||{});n.updatedAt=nowIso();record(req.user.name,'Updated news story',n.title);res.json(n)})
app.delete('/api/news/:id',requireRoles(['admin','warden','editor']),(req,res)=>{const idx=data.news.findIndex(x=>x.id===req.params.id);if(idx<0)return res.status(404).json({error:'News story not found.'});const [n]=data.news.splice(idx,1);record(req.user.name,'Deleted news story',n.title);res.json({ok:true})})
app.post('/api/news/refresh',requireRoles(['admin','warden','editor']),(req,res)=>{const stamp=new Date(); const headlines=[['National','India daily briefing','Pulse Digest'],['Education','Higher-education and campus updates','Campus Desk'],['Sports','Today’s sports and inter-house highlights','Sports Desk'],['Campus','Hostel and institute announcements','Hostel Office']];data.news=headlines.map((x,i)=>({id:`news-auto-${i+1}`,category:x[0],title:x[1],source:x[2],time:stamp.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),active:true,updatedAt:nowIso()}));record(req.user.name,'Refreshed news feed','Seeded local digest refreshed.');res.json(data.news)})

app.get('/api/scores',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>res.json(data.scores))
app.post('/api/scores',requireRoles(['admin','warden','scoreboard']),(req,res)=>{const b=req.body||{};const s={id:makeId('score'),sport:b.sport||'CRICKET',event:b.event||'New match',teamA:b.teamA||'Team A',teamB:b.teamB||'Team B',scoreA:b.scoreA||'0',scoreB:b.scoreB||'0',meta:b.meta||'Live update',live:b.live!==false,published:b.published!==false,boardIds:safeBoardIds(b.boardIds),updatedAt:nowIso()};if(!s.boardIds.length)s.boardIds=data.boards.map(x=>x.id);data.scores.unshift(s);record(req.user.name,'Created scoreboard match',s.event);res.status(201).json(s)})
app.put('/api/scores/:id',requireRoles(['admin','warden','scoreboard']),(req,res)=>{const s=data.scores.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Scoreboard match not found.'});Object.assign(s,req.body||{});s.boardIds=safeBoardIds(s.boardIds);if(!s.boardIds.length)s.boardIds=data.boards.map(x=>x.id);s.updatedAt=nowIso();record(req.user.name,'Updated scoreboard',s.event);res.json(s)})
app.post('/api/scores/:id/publish',requireRoles(['admin','warden','scoreboard']),(req,res)=>{const s=data.scores.find(x=>x.id===req.params.id);if(!s)return res.status(404).json({error:'Scoreboard match not found.'});s.published=req.body?.published!==false;s.live=s.published?req.body?.live!==false:false;s.updatedAt=nowIso();record(req.user.name,s.published?'Published scoreboard':'Unpublished scoreboard',s.event);res.json(s)})
app.delete('/api/scores/:id',requireRoles(['admin','warden','scoreboard']),(req,res)=>{const idx=data.scores.findIndex(x=>x.id===req.params.id);if(idx<0)return res.status(404).json({error:'Scoreboard match not found.'});const [s]=data.scores.splice(idx,1);record(req.user.name,'Deleted scoreboard',s.event);res.json({ok:true})})

app.get('/api/boards',requireRoles(Object.keys(ROLE_LABELS)),(req,res)=>res.json(data.boards))
app.post('/api/boards',requireRoles(['admin','warden']),(req,res)=>{const b=req.body||{};const board={id:b.id||makeId('board'),name:b.name||'New Board',location:b.location||'New location',status:b.status||'Online',lastSeen:nowIso(),refreshIntervalSec:clamp(b.refreshIntervalSec,2,120,5),volume:clamp(b.volume,0,100,70),brightness:clamp(b.brightness,20,100,100),autoplay:b.autoplay!==false,orientation:b.orientation||'landscape',transition:b.transition||'fade',showClock:b.showClock!==false,showBranding:b.showBranding!==false,enabled:b.enabled!==false,manualState:'playing',command:null,commandAt:null};data.boards.push(board);record(req.user.name,'Added board',board.name);res.status(201).json(board)})
app.put('/api/boards/:id',requireRoles(['admin','warden']),(req,res)=>{const b=data.boards.find(x=>x.id===req.params.id);if(!b)return res.status(404).json({error:'Board not found.'});const patch={...req.body};for(const k of ['refreshIntervalSec','volume','brightness'])if(patch[k]!==undefined)patch[k]=k==='refreshIntervalSec'?clamp(patch[k],2,120,b[k]):clamp(patch[k],0,k==='brightness'?100:100,b[k]);Object.assign(b,patch);b.lastSeen=b.lastSeen||nowIso();record(req.user.name,'Updated board settings',b.name);res.json(b)})
app.delete('/api/boards/:id',requireRoles(['admin','warden']),(req,res)=>{const idx=data.boards.findIndex(x=>x.id===req.params.id);if(idx<0)return res.status(404).json({error:'Board not found.'});const [b]=data.boards.splice(idx,1);data.content.forEach(c=>c.boardIds=(c.boardIds||[]).filter(id=>id!==b.id));data.scores.forEach(s=>s.boardIds=(s.boardIds||[]).filter(id=>id!==b.id));record(req.user.name,'Removed board',b.name);res.json({ok:true})})
function applyCommand(board,command){ board.command=command;board.commandAt=nowIso(); if(command==='pause')board.manualState='paused'; if(command==='play')board.manualState='playing'; if(command==='blackout')board.manualState='paused'; if(command==='resume')board.manualState='playing' }
app.post('/api/boards/:id/command',requireRoles(['admin','warden']),(req,res)=>{const b=data.boards.find(x=>x.id===req.params.id);if(!b)return res.status(404).json({error:'Board not found.'});const allowed=['play','pause','refresh','next','previous','restart','blackout','resume'];const c=allowed.includes(req.body?.command)?req.body.command:'refresh';applyCommand(b,c);record(req.user.name,`Board command · ${c}`,b.name);res.json(b)})
app.post('/api/boards/command-all',requireRoles(['admin','warden']),(req,res)=>{const allowed=['play','pause','refresh','blackout','resume'];const c=allowed.includes(req.body?.command)?req.body.command:'refresh';data.boards.forEach(b=>applyCommand(b,c));record(req.user.name,`All-board command · ${c}`,`${data.boards.length} boards`);res.json({ok:true,count:data.boards.length})})

app.get('/api/users',requireRoles(['admin','warden']),(req,res)=>res.json(data.users.map(publicUser)))
app.post('/api/users',requireRoles(['admin','warden']),(req,res)=>{const b=req.body||{};const username=String(b.username||'').trim();const password=String(b.password||'');if(!username)return res.status(400).json({error:'Username is required.'});if(data.users.some(u=>u.username.toLowerCase()===username.toLowerCase()))return res.status(409).json({error:'Username already exists.'});if(!ROLE_LABELS[b.role])return res.status(400).json({error:'Invalid role.'});if(b.role==='admin'&&req.user.role!=='admin')return res.status(403).json({error:'Only an Administrator can create another Administrator.'});if(IS_VERCEL&&password.length<12)return res.status(400).json({error:'Cloud user passwords must be at least 12 characters.'});const u={id:makeId('user'),name:b.name||'New User',username,passwordHash:hashPassword(password||'pulse2026'),role:b.role,active:b.active!==false};data.users.push(u);record(req.user.name,'Created user',`${u.name} · ${ROLE_LABELS[u.role]}`);res.status(201).json(publicUser(u))})
app.put('/api/users/:id',requireRoles(['admin','warden']),(req,res)=>{const u=data.users.find(x=>x.id===req.params.id);if(!u)return res.status(404).json({error:'User not found.'});if(req.body?.username&&data.users.some(x=>x.id!==u.id&&x.username.toLowerCase()===String(req.body.username).trim().toLowerCase()))return res.status(409).json({error:'Username already exists.'});if(req.body?.role&&!ROLE_LABELS[req.body.role])return res.status(400).json({error:'Invalid role.'});if(req.body?.role==='admin'&&req.user.role!=='admin')return res.status(403).json({error:'Only an Administrator can assign the Administrator role.'});if(req.body?.password&&IS_VERCEL&&String(req.body.password).length<12)return res.status(400).json({error:'Cloud user passwords must be at least 12 characters.'});const patch={};for(const k of ['name','role','active'])if(req.body?.[k]!==undefined)patch[k]=req.body[k];if(req.body?.username!==undefined)patch.username=String(req.body.username).trim();if(req.body?.password)patch.passwordHash=hashPassword(String(req.body.password));Object.assign(u,patch);delete u.password;record(req.user.name,'Updated user',`${u.name} · ${ROLE_LABELS[u.role]}`);res.json(publicUser(u))})
app.delete('/api/users/:id',requireRoles(['admin','warden']),(req,res)=>{const u=req.user; if(req.params.id===u.id)return res.status(400).json({error:'You cannot delete your own signed-in account.'});const idx=data.users.findIndex(x=>x.id===req.params.id);if(idx<0)return res.status(404).json({error:'User not found.'});const [removed]=data.users.splice(idx,1);record(u.name,'Deleted user',removed.name);res.json({ok:true})})

app.get('/api/settings',requireRoles(['admin','warden']),(req,res)=>res.json(data.settings))
app.put('/api/settings',requireRoles(['admin','warden']),(req,res)=>{data.settings={...data.settings,...req.body};record(req.user.name,'Updated system settings','Global configuration saved.');res.json(data.settings)})
app.get('/api/audit',requireRoles(['admin','warden']),(req,res)=>res.json(data.audit))
app.post('/api/system/reset-demo',requireRoles(['admin']),(req,res)=>{data=IS_VERCEL?cloudSeedData():seedData();save();record(req.user.name,'Reset demo data','All content, boards, scores and news returned to seed state.');res.json({ok:true})})
app.get('/api/system/export',requireRoles(['admin','warden']),(req,res)=>{const safe={...data,users:data.users.map(publicUser)};res.setHeader('Content-Disposition',`attachment; filename="pulse-board-backup-${new Date().toISOString().slice(0,10)}.json"`);res.json(safe)})

app.get('/api/playlist/:boardId',(req,res)=>{
  const b=data.boards.find(x=>x.id===req.params.boardId); if(!b)return res.status(404).json({error:'Board not found.'}); b.lastSeen=nowIso()
  const command=b.commandAt?{name:b.command,at:b.commandAt}:null
  const common={generatedAt:nowIso(),board:{...b},settings:data.settings}
  if(data.settings.maintenanceMode||!b.enabled||b.status==='Maintenance')return res.json({...common,items:[{id:'maintenance',type:'system',title:'Pulse Board is temporarily unavailable',description:data.settings.maintenanceMode?'System maintenance is active.':'This board is disabled or in maintenance mode.',duration:10}],maintenance:true,command})
  const media=data.content.map(decorateContent).filter(c=>c.enabled&&c.published&&c.status==='Published'&&(c.boardIds||[]).includes(b.id)).sort((x,y)=>(y.priority-x.priority)||new Date(y.updatedAt)-new Date(x.updatedAt)).map(c=>({id:c.id,type:c.type,title:c.title,description:c.description||'',mediaUrl:c.mediaUrl||'',mediaKind:c.mediaKind,duration:c.duration||data.settings.defaultDuration,muted:Boolean(c.muted),loop:Boolean(c.loop),updatedAt:c.updatedAt,priority:c.priority}))
  const news=data.settings.newsEnabled?data.news.filter(n=>n.active).slice(0,4).map(n=>({id:`news-${n.id}`,type:'news',title:n.title,description:`${n.category} · ${n.source}`,duration:7,updatedAt:n.updatedAt})):[]
  const liveScores=data.settings.scoresEnabled?data.scores.filter(s=>s.live&&s.published&&(s.boardIds||[]).includes(b.id)).sort((x,y)=>new Date(y.updatedAt)-new Date(x.updatedAt)).map(s=>({id:`score-${s.id}`,type:'score',sport:s.sport,event:s.event,teamA:s.teamA,teamB:s.teamB,scoreA:s.scoreA,scoreB:s.scoreB,title:s.event,description:s.meta,duration:8,updatedAt:s.updatedAt})):[]
  const items=[...liveScores,...media.slice(0,5),...news]
  if(!items.length)items.push({id:'fallback',type:'system',title:'Welcome to Pulse Board',description:'Hostel notices, daily news, live scores and events — all in one place.',duration:10})
  res.json({...common,items,command})
})

app.get('/api/health',(req,res)=>res.json({ok:true,version:'4.0.0',time:nowIso()}))

app.use((err,req,res,next)=>{ if(err instanceof multer.MulterError){ if(req.file)try{fs.unlinkSync(req.file.path)}catch{}; const msg=err.code==='LIMIT_FILE_SIZE'?'The media file is too large. Maximum size is 800 MB.':err.message; return res.status(400).json({error:msg}) } console.error(err); res.status(500).json({error:'Unexpected server error.'}) })

const clientDist=path.join(ROOT,'client','dist')
const publicIndex=path.join(ROOT,'public','index.html')
if (!IS_VERCEL && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*',(req,res)=>res.sendFile(path.join(clientDist,'index.html')))
}
if (IS_VERCEL) {
  // Public assets are served by Vercel's CDN; Express is the API/fallback function.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    if (fs.existsSync(publicIndex)) return res.sendFile(publicIndex)
    return res.status(404).send('Pulse Board frontend build is missing. Run npm run build and redeploy.')
  })
}
if (!IS_VERCEL) app.listen(PORT,()=>console.log(`Pulse Board v4 running on http://localhost:${PORT}`))
module.exports = app
