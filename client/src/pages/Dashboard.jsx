import {useEffect,useState} from 'react'
import PageHeader from '../components/PageHeader.jsx'
import Icon from '../components/Icon.jsx'
import StatCard from '../components/StatCard.jsx'
import BoardPreview from '../components/BoardPreview.jsx'
import {ErrorState,Loading} from '../components/Feedback.jsx'
import {boardCommandAll,getDashboard} from '../lib/api.js'
import {currentUser,fmtDateTime,hasAnyRole} from '../lib/auth.js'

export default function Dashboard(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const editable=hasAnyRole(['admin','warden'])
 const load=()=>{setError('');getDashboard().then(setData).catch(e=>setError(e.message||'Unable to load dashboard'))}
 useEffect(()=>{load();const t=setInterval(load,8000);return()=>clearInterval(t)},[])
 const globalCommand=async cmd=>{setBusy(true);try{await boardCommandAll(cmd);load()}catch(e){setError(e.message||'Command failed')}finally{setBusy(false)}}
 if(error&&!data)return <div className="page"><ErrorState message={error} retry={load}/></div>
 if(!data)return <div className="page"><Loading label="Loading control centre…"/></div>
 const u=currentUser()
 return <div className="page">
  <PageHeader eyebrow="OPERATIONS OVERVIEW" title={`Good morning, ${u?.name?.split(' ')[0]||'Admin'}.`} description="Monitor every board and control the complete publishing pipeline from one console." action={editable&&<div className="action-pair"><button className="secondary-btn" disabled={busy} onClick={()=>globalCommand('refresh')}><Icon name="refresh" size={16}/> Refresh all</button><a className="primary-btn" href="/content"><Icon name="plus" size={16}/> Add content</a></div>}/>
  {error&&<div className="inline-error">{error}</div>}
  <section className="stats-grid">
   <StatCard label="Online boards" value={`${data.stats.boards}/${data.stats.totalBoards}`} detail="Heartbeat status" icon={<Icon name="monitor"/>}/>
   <StatCard label="Published content" value={data.stats.activeContent} detail="Currently eligible" icon={<Icon name="image"/>}/>
   <StatCard label="Scheduled items" value={data.stats.scheduled} detail="Future windows" icon={<Icon name="calendar"/>}/>
   <StatCard label="Live matches" value={data.stats.liveMatches} detail="Published scoreboards" icon={<Icon name="trophy"/>}/>
   <StatCard label="News stories" value={data.stats.news} detail="Visible to boards" icon={<Icon name="newspaper"/>}/>
  </section>

  <section className="panel hero-control">
   <div className="panel-head"><div><div className="section-kicker">LIVE CONTROL</div><h2>Every board, live</h2><p>The previews below load the same display route used by the kiosk screens.</p></div><a className="secondary-link" href="/boards">Open board manager <Icon name="chevron" size={14}/></a></div>
   <div className="preview-grid">{data.boards.map(b=><div className="preview-tile" key={b.id}><div className="preview-tile-head"><div><b>{b.name}</b><span>{b.location}</span></div><span className={`status-chip ${b.enabled&&b.status==='Online'?'online':''}`}>{b.enabled?b.status:'Disabled'}</span></div><BoardPreview board={b} height={240} onOpen={()=>window.open(`/display/${b.id}`,'_blank','noopener,noreferrer')}/></div>)}</div>
  </section>

  <div className="dashboard-grid">
   <section className="panel quick-panel"><div className="panel-head"><div><div className="section-kicker">ADMIN CONTROL</div><h2>Master controls</h2><p>Use these when you need to act on every screen at once.</p></div></div><div className="master-grid"><button onClick={()=>globalCommand('play')} disabled={!editable||busy}><Icon name="play"/><span>Play all</span><small>Resume every board</small></button><button onClick={()=>globalCommand('pause')} disabled={!editable||busy}><Icon name="pause"/><span>Pause all</span><small>Stop rotation</small></button><button onClick={()=>globalCommand('refresh')} disabled={!editable||busy}><Icon name="refresh"/><span>Refresh all</span><small>Reload playlists</small></button><button onClick={()=>globalCommand('blackout')} disabled={!editable||busy} className="danger-control"><Icon name="monitor"/><span>Blackout all</span><small>Hide public output</small></button></div></section>
   <section className="panel"><div className="panel-head"><div><div className="section-kicker">ACTIVITY</div><h2>Recent changes</h2><p>Who changed the system and when.</p></div><a className="secondary-link" href="/settings">Audit log</a></div><div className="activity-list">{data.audit.slice(0,7).map(a=><div className="activity-row" key={a.id}><div className="activity-icon"><Icon name="bolt" size={13}/></div><div><b>{a.action}</b><span>{a.actor} · {fmtDateTime(a.time)}</span><small>{a.detail}</small></div></div>)}</div></section>
  </div>

  <section className="panel"><div className="panel-head"><div><div className="section-kicker">NEXT ON AIR</div><h2>Upcoming schedule</h2><p>Items entering the display rotation next.</p></div><a className="secondary-link" href="/schedule">Manage schedule <Icon name="chevron" size={14}/></a></div>{data.upcoming.length===0?<div className="empty-inline">No scheduled items.</div>:<div className="schedule-table"><div className="schedule-head"><span>Start</span><span>Content</span><span>Boards</span><span>Status</span></div>{data.upcoming.map(x=><div className="schedule-row" key={x.id}><span>{fmtDateTime(x.startAt)}</span><div><b>{x.title}</b><small>{x.type} · {x.duration}s · priority {x.priority}</small></div><span>{x.board}</span><span className="status-text">{x.status}</span></div>)}</div>}</section>
 </div>
}
