import {useEffect,useRef,useState} from 'react'
import {useLocation,useParams} from 'react-router-dom'
import {getPlaylist} from '../lib/api.js'

export default function Display(){
 const {boardId='board-1'}=useParams();const loc=useLocation();const [payload,setPayload]=useState(null),[error,setError]=useState(''),[index,setIndex]=useState(0),[clock,setClock]=useState(new Date()),[blackout,setBlackout]=useState(false),[lastCommand,setLastCommand]=useState('');const videoRef=useRef(null)
 const load=()=>getPlaylist(boardId).then(p=>{setError('');setPayload(p)}).catch(e=>setError(e.message||'Connecting…'))
 useEffect(()=>{load();const t=setInterval(load,3500);const c=setInterval(()=>setClock(new Date()),1000);return()=>{clearInterval(t);clearInterval(c)}},[boardId])
 const items=payload?.items||[];const item=items[index]||items[0]||null;const board=payload?.board;const embedded=new URLSearchParams(loc.search).get('embed')==='1'
 useEffect(()=>{if(!payload?.command?.at||payload.command.at===lastCommand)return;const c=payload.command;setLastCommand(c.at);if(c.name==='pause')return;if(c.name==='play'){setBlackout(false);return}if(c.name==='blackout'){setBlackout(true);return}if(c.name==='resume'){setBlackout(false);return}if(c.name==='refresh'){setIndex(0);return}if(c.name==='next'){setIndex(i=>items.length?(i+1)%items.length:0);return}if(c.name==='previous'){setIndex(i=>items.length?(i-1+items.length)%items.length:0);return}if(c.name==='restart'&&videoRef.current){videoRef.current.currentTime=0;videoRef.current.play().catch(()=>{})}},[payload,items.length,lastCommand])
 const paused=board?.manualState==='paused'||blackout
 useEffect(()=>{if(!items.length||paused||!item)return;if(item.type==='video')return;const t=setTimeout(()=>setIndex(i=>items.length?(i+1)%items.length:0),Math.max(2500,(item.duration||8)*1000));return()=>clearTimeout(t)},[index,items,paused,item])
 useEffect(()=>{const v=videoRef.current;if(!v||item?.type!=='video')return;v.muted=!!item.muted;v.volume=(board?.volume??70)/100;if(board?.autoplay&&!paused){v.currentTime=0;v.play().catch(()=>{})}},[item?.id,board?.volume,board?.autoplay,paused])
 const next=()=>setIndex(i=>items.length?(i+1)%items.length:0)
 if(error&&!payload)return <div className="display-fallback"><b>Pulse Board</b><span>Connecting to {boardId}…</span><small>{error}</small></div>
 if(paused&&!blackout&&board?.manualState==='paused')return <div className="display-paused"><b>Display paused</b><span>Waiting for the administrator to resume this board.</span></div>
 return <div className={`public-display ${embedded?'embedded':''} ${board?.orientation==='portrait'?'portrait':''}`} style={{filter:`brightness(${(board?.brightness??100)/100})`}}>
  {blackout?<div className="blackout"><span>Display temporarily offline</span></div>:<>
   <div className="public-stage">
    {!item?<div className="public-placeholder"><b>Pulse Board</b><span>No content is scheduled for this display.</span></div>:item.type==='video'?<div className="media-area video-area"><video ref={videoRef} src={item.mediaUrl||undefined} playsInline muted={!!item.muted} autoPlay={board?.autoplay&&!paused} loop={!!item.loop} onEnded={next}/>{!item.mediaUrl&&<div className="no-media"><span>VIDEO</span><b>{item.title}</b></div>}</div>:item.type==='poster'?<div className="media-area poster-area">{item.mediaUrl?<img src={item.mediaUrl} alt=""/>:<div className="poster-fallback"><span>{item.category}</span><h1>{item.title}</h1></div>}</div>:item.type==='news'?<NewsScreen item={item}/>:item.type==='score'?<ScoreScreen item={item}/>:<div className="media-area system-area"><h1>{item.title}</h1></div>}
   </div>
   <div className="caption-bar"><div><b>{item?.title||''}</b><span>{item?.description||''}</span></div><div className="caption-meta">{item?.type==='video'?'VIDEO':item?.type?.toUpperCase()||'SYSTEM'}</div></div>
   {payload?.settings?.tickerEnabled&&<div className="ticker"><span>{payload.settings.tickerText}</span></div>}
   {board?.showBranding&&payload?.settings?.brandingEnabled&&<footer className="public-footer"><span>{payload.settings.instituteName} · {payload.settings.hostelName}</span>{board.showClock&&<span>{clock.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>}</footer>}
   <div className="public-progress"><span style={{width:`${items.length?((index+1)/items.length)*100:0}%`}}/></div>
  </>}
 </div>
}
function NewsScreen({item}){return <div className="news-screen-public"><div className="news-accent">DAILY NEWS</div><h1>{item.title}</h1><div className="news-screen-tag">{item.description}</div></div>}
function ScoreScreen({item}){return <div className="score-screen-public"><span>{item.sport||'LIVE'} · {item.event}</span><div className="score-big"><div><small>{item.teamA}</small><b>{item.scoreA}</b></div><em>VS</em><div><small>{item.teamB}</small><b>{item.scoreB}</b></div></div><p>{item.description}</p></div>}
