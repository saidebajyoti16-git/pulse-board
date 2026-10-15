export const roleNames = { admin:'Administrator', warden:'Hostel Warden', editor:'Content Editor', scoreboard:'Scoreboard Updater', viewer:'Viewer' }
export function currentUser(){ try { return JSON.parse(localStorage.getItem('pulse-user') || 'null') } catch { return null } }
export function hasAnyRole(roles){ const u=currentUser(); return !!u && roles.includes(u.role) }
export function canEditContent(){ return hasAnyRole(['admin','warden','editor']) }
export function canEditScores(){ return hasAnyRole(['admin','warden','scoreboard']) }
export function canManageBoards(){ return hasAnyRole(['admin','warden']) }
export function canManageUsers(){ return hasAnyRole(['admin','warden']) }
export function isAdmin(){ return hasAnyRole(['admin']) }
export function fmtDateTime(value){ const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) }
export function fmtTime(value){ const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }
export function toLocalInput(value){ const d=new Date(value); if(Number.isNaN(d.getTime()))return ''; const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}` }
export function initials(name='Pulse Board'){ return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() }
