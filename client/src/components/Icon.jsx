export default function Icon({name,size=20,stroke=1.8}){
  const p={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round'}
  const paths={
    grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    image:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 5"/></>,
    video:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3V9Z"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    trophy:<><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/></>,
    newspaper:<><path d="M4 4h16v16H4z"/><path d="M7 8h7M7 12h10M7 16h6"/></>,
    monitor:<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19 15.2a2 2 0 0 0 .3 2.1l.1.1-1.7 1.7-.1-.1a2 2 0 0 0-2.1-.3 2 2 0 0 0-1.2 1.8v.2H9.7v-.2a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.1.3l-.1.1-1.7-1.7.1-.1a2 2 0 0 0 .3-2.1 2 2 0 0 0-1.8-1.2H3v-2.4h.2A2 2 0 0 0 5 10.2a2 2 0 0 0-.3-2.1l-.1-.1 1.7-1.7.1.1a2 2 0 0 0 2.1.3A2 2 0 0 0 9.7 5V4.8h2.4V5a2 2 0 0 0 1.2 1.7 2 2 0 0 0 2.1-.3l.1-.1 1.7 1.7-.1.1a2 2 0 0 0-.3 2.1 2 2 0 0 0 1.8 1.2h.2v2.4h-.2a2 2 0 0 0-1.6 1.4Z"/></>,
    users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.1a4 4 0 0 1 0 7.75"/></>,
    play:<path d="m9 5 10 7-10 7V5Z"/>,
    pause:<><path d="M8 5v14M16 5v14"/></>,
    refresh:<path d="M20 11a8 8 0 0 0-14.9-3L4 10m0 0 1-4m-1 4 4-1M4 13a8 8 0 0 0 14.9 3L20 14m0 0-1 4m1-4-4 1"/>,
    plus:<><path d="M12 5v14M5 12h14"/></>,
    edit:<><path d="m4 20 4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="m14.5 6.5 3 3"/></>,
    trash:<><path d="M4 7h16M10 11v6M14 11v6"/><path d="M9 7V4h6v3M6 7l1 14h10l1-14"/></>,
    eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    upload:<><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 20h16"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    volume:<><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9.5a4 4 0 0 1 0 5M19 7a8 8 0 0 1 0 10"/></>,
    mute:<><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 4 6m0-6-4 6"/></>,
    external:<><path d="M14 5h5v5M19 5l-8 8"/><path d="M18 13v6H5V6h6"/></>,
    shield:<><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    bolt:<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>,
    chevron:<path d="m9 18 6-6-6-6"/>,
    close:<><path d="m6 6 12 12M18 6 6 18"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    monitorPlay:<><rect x="3" y="4" width="18" height="13" rx="2"/><path d="m10 8 5 4-5 4V8Z"/><path d="M8 21h8M12 17v4"/></>,
    zap:<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>,
  }
  return <svg {...p}>{paths[name]||paths.grid}</svg>
}
