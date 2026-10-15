import React,{useEffect,useMemo,useState} from 'react'
import {NavLink,Navigate,Route,Routes,useLocation,useNavigate} from 'react-router-dom'
import Icon from './components/Icon.jsx'
import {getMe,login} from './lib/api.js'
import {currentUser,initials,roleNames} from './lib/auth.js'
import Dashboard from './pages/Dashboard.jsx'
import Content from './pages/Content.jsx'
import Schedule from './pages/Schedule.jsx'
import Scoreboard from './pages/Scoreboard.jsx'
import News from './pages/News.jsx'
import Boards from './pages/Boards.jsx'
import Users from './pages/Users.jsx'
import Settings from './pages/Settings.jsx'
import Display from './pages/Display.jsx'

const nav=[
 ['Overview','/','grid',['admin','warden','editor','scoreboard','viewer']],
 ['Content','/content','image',['admin','warden','editor','viewer']],
 ['Schedule','/schedule','calendar',['admin','warden','editor','viewer']],
 ['Live Scoreboard','/scoreboard','trophy',['admin','warden','scoreboard','viewer']],
 ['Daily News','/news','newspaper',['admin','warden','editor','viewer']],
 ['Display Boards','/boards','monitor',['admin','warden','viewer']],
 ['Users & Roles','/users','users',['admin','warden']],
 ['System','/settings','settings',['admin','warden']],
]
const titleByPath=Object.fromEntries(nav.map(x=>[x[1],x[0]]))

class UIErrorBoundary extends React.Component{
 constructor(props){super(props);this.state={error:null}}
 static getDerivedStateFromError(error){return {error}}
 render(){if(this.state.error)return <div className="crash-page"><div className="crash-card"><div className="crash-badge">!</div><h2>This page hit an error</h2><p>{this.state.error?.message||'Unexpected UI error.'}</p><div className="crash-actions"><button className="primary-btn" onClick={()=>this.setState({error:null})}>Try again</button><button className="secondary-btn" onClick={()=>window.location.reload()}>Reload app</button></div></div></div>;return this.props.children}
}

function Shell({children}){
 const location=useLocation(),navigate=useNavigate(); const [mobile,setMobile]=useState(false); const [user,setUser]=useState(currentUser())
 useEffect(()=>{const sync=()=>setUser(currentUser());window.addEventListener('pulse-user-change',sync);return()=>window.removeEventListener('pulse-user-change',sync)},[])
 const signOut=()=>{localStorage.removeItem('pulse-token');localStorage.removeItem('pulse-user');navigate('/login')}
 const allowed=roles=>roles.includes(user?.role)
 return <div className="app-shell">
  <aside className={`sidebar ${mobile?'open':''}`}>
   <div className="brand"><div className="brand-mark">P</div><div><strong>Pulse Board</strong><span>SSSIHL · CodeEX</span></div></div>
   <div className="workspace"><span>HOSTEL OPERATIONS</span><b>{user?.name||'Operations'}</b><small>{user?roleNames[user.role]:''}</small></div>
   <nav>{nav.filter(x=>allowed(x[3])).map(([label,to,icon,roles])=><NavLink key={to} to={to} end={to==='/' } onClick={()=>setMobile(false)} className={({isActive})=>isActive?'active':''}><Icon name={icon}/><span>{label}</span>{label==='Live Scoreboard'&&<i className="live-pip"/>}</NavLink>)}</nav>
   <div className="sidebar-bottom"><a href="/display/board-1" target="_blank" rel="noreferrer" className="secondary-btn"><Icon name="monitorPlay" size={16}/> Board preview</a><button className="nav-button" onClick={signOut}><Icon name="close" size={16}/> Sign out</button></div>
  </aside>
  <div className="main-wrap">
   <header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(v=>!v)}><Icon name="grid" size={18}/></button><div className="breadcrumbs"><span>Home</span><Icon name="chevron" size={14}/><strong>{titleByPath[location.pathname]||'Pulse Board'}</strong></div><div className="topbar-right"><span className="system-live"><i/> Server connected</span><div className="avatar" title={user?.name}>{initials(user?.name||'Pulse')}</div></div></header>
   <main><UIErrorBoundary>{children}</UIErrorBoundary></main>
  </div>
 </div>
}

function Login(){
 const navigate=useNavigate();const [username,setUsername]=useState('admin');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false)
 async function submit(e){e.preventDefault();setBusy(true);setError('');try{const r=await login(username.trim(),password);localStorage.setItem('pulse-token',r.token);localStorage.setItem('pulse-user',JSON.stringify(r.user));window.dispatchEvent(new Event('pulse-user-change'));navigate('/')}catch(err){setError(err.message||'Unable to sign in')}finally{setBusy(false)}}
 return <div className="login-page"><div className="login-orb one"/><div className="login-orb two"/><div className="login-card"><div className="brand login-brand"><div className="brand-mark">P</div><div><strong>Pulse Board</strong><span>Digital hostel engagement</span></div></div><div className="login-title"><span>CONTROL CENTRE</span><h1>Run every display from one place.</h1><p>Publish notices, schedule media, update live scores, manage news and control your boards remotely.</p></div><form onSubmit={submit}><label>Username<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Password<input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="form-error">{error}</div>}<button className="primary-btn wide-btn" disabled={busy}>{busy?'Signing in…':'Sign in'} <Icon name="chevron" size={16}/></button></form>{!import.meta.env.PROD&&<div className="demo-box"><b>Local demo access</b><div><span>Admin</span><code>admin / admin2026</code></div><div><span>Warden</span><code>warden / pulse2026</code></div><div><span>Editor</span><code>editor / editor2026</code></div><div><span>Score updater</span><code>score / score2026</code></div></div>}</div></div>
}

function Protected(){
 const [valid,setValid]=useState(null)
 useEffect(()=>{if(!localStorage.getItem('pulse-token')){setValid(false);return}getMe().then(u=>{localStorage.setItem('pulse-user',JSON.stringify(u));setValid(true);window.dispatchEvent(new Event('pulse-user-change'))}).catch(()=>{localStorage.removeItem('pulse-token');localStorage.removeItem('pulse-user');setValid(false)})},[])
 if(valid===null)return <div className="full-loading"><div className="spinner"/><span>Starting Pulse Board…</span></div>
 if(!valid)return <Navigate to="/login" replace/>
 return <Shell><Routes><Route path="/" element={<Dashboard/>}/><Route path="/content" element={<Content/>}/><Route path="/schedule" element={<Schedule/>}/><Route path="/scoreboard" element={<Scoreboard/>}/><Route path="/news" element={<News/>}/><Route path="/boards" element={<Boards/>}/><Route path="/users" element={<Users/>}/><Route path="/settings" element={<Settings/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></Shell>
}

export default function App(){return <Routes><Route path="/login" element={<Login/>}/><Route path="/display/:boardId" element={<Display/>}/><Route path="*" element={<Protected/>}/></Routes>}
