const API_BASE = import.meta.env.VITE_API_BASE || ''
const CLOUD_DEPLOYMENT = import.meta.env.PROD

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = localStorage.getItem('pulse-token')
  if (token) headers.set('x-pulse-token', token)
  const isForm = options.body instanceof FormData
  if (!isForm && options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  let response
  try { response = await fetch(`${API_BASE}${path}`, { ...options, headers }) }
  catch (e) { throw new Error('Cannot reach the Pulse Board server. Make sure the backend is running on port 8787.') }
  if (!response.ok) {
    let message = ''
    try { const body = await response.json(); message = body.error || body.message || '' } catch { message = await response.text() }
    if (response.status === 401) throw new Error(message || 'Session expired. Please sign in again.')
    if (response.status === 403) throw new Error(message || 'You do not have permission for this action.')
    throw new Error(message || `Request failed (${response.status})`)
  }
  const type = response.headers.get('content-type') || ''
  return type.includes('application/json') ? response.json() : response
}

export const login = (username, password) => api('/api/auth/login', { method:'POST', body:JSON.stringify({ username, password }) })
export const getMe = () => api('/api/me')
export const getDashboard = () => api('/api/dashboard')

export const getContent = (params='') => api(`/api/content${params}`)
async function prepareContentBody(data) {
  if (!(data instanceof FormData) || !CLOUD_DEPLOYMENT) return data instanceof FormData ? data : JSON.stringify(data)
  const values = {}
  for (const [key, value] of data.entries()) if (key !== 'file') values[key] = value
  const file = data.get('file')
  if (file instanceof File && file.size > 0) {
    const { upload } = await import('@vercel/blob/client')
    const token = localStorage.getItem('pulse-token')
    if (!token) throw new Error('Your session has expired. Please sign in again before uploading.')
    const name = file.name || 'media'
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : ''
    const video = (file.type || '').startsWith('video/') || ['.mp4','.webm','.mov','.m4v','.ogg','.ogv'].includes(ext)
    const image = (file.type || '').startsWith('image/') || ['.jpg','.jpeg','.png','.webp','.gif','.bmp'].includes(ext)
    if (!video && !image) throw new Error('Unsupported file. Choose an image or a supported video format.')
    if (video && values.type !== 'video') throw new Error('This is a video. Select Video as the content type before saving.')
    if (!video && values.type === 'video') throw new Error('This is an image. Select Poster / Image as the content type before saving.')
    if (file.size > 800 * 1024 * 1024) throw new Error('Media must be 800 MB or smaller.')
    const cleanName = name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-120)
    const blob = await upload(`pulse-board/${Date.now()}-${cleanName}`, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      clientPayload: token,
      contentType: file.type || undefined,
      multipart: file.size > 4 * 1024 * 1024,
    })
    values.mediaUrl = blob.url
    values.mediaKind = video ? 'video' : 'image'
  }
  return JSON.stringify(values)
}
export const addContent = async data => api('/api/content', { method:'POST', body:await prepareContentBody(data) })
export const updateContent = async (id, data) => api(`/api/content/${id}`, { method:'PUT', body:await prepareContentBody(data) })
export const deleteContent = id => api(`/api/content/${id}`, { method:'DELETE' })
export const toggleContent = id => api(`/api/content/${id}/toggle`, { method:'POST' })
export const duplicateContent = id => api(`/api/content/${id}/duplicate`, { method:'POST' })
export const publishContent = (id, published=true) => api(`/api/content/${id}/publish`, { method:'POST', body:JSON.stringify({ published }) })

export const getNews = () => api('/api/news')
export const getAllNews = () => api('/api/news/all')
export const createNews = data => api('/api/news', { method:'POST', body:JSON.stringify(data) })
export const updateNews = (id,data) => api(`/api/news/${id}`, { method:'PUT', body:JSON.stringify(data) })
export const deleteNews = id => api(`/api/news/${id}`, { method:'DELETE' })
export const refreshNews = () => api('/api/news/refresh', { method:'POST' })

export const getScores = () => api('/api/scores')
export const createScore = data => api('/api/scores', { method:'POST', body:JSON.stringify(data) })
export const updateScore = (id,data) => api(`/api/scores/${id}`, { method:'PUT', body:JSON.stringify(data) })
export const publishScore = (id, published=true) => api(`/api/scores/${id}/publish`, { method:'POST', body:JSON.stringify({ published, live: published }) })
export const deleteScore = id => api(`/api/scores/${id}`, { method:'DELETE' })

export const getBoards = () => api('/api/boards')
export const createBoard = data => api('/api/boards', { method:'POST', body:JSON.stringify(data) })
export const updateBoard = (id,data) => api(`/api/boards/${id}`, { method:'PUT', body:JSON.stringify(data) })
export const deleteBoard = id => api(`/api/boards/${id}`, { method:'DELETE' })
export const boardCommand = (id, command) => api(`/api/boards/${id}/command`, { method:'POST', body:JSON.stringify({ command }) })
export const boardCommandAll = command => api('/api/boards/command-all', { method:'POST', body:JSON.stringify({ command }) })

export const getUsers = () => api('/api/users')
export const createUser = data => api('/api/users', { method:'POST', body:JSON.stringify(data) })
export const updateUser = (id,data) => api(`/api/users/${id}`, { method:'PUT', body:JSON.stringify(data) })
export const deleteUser = id => api(`/api/users/${id}`, { method:'DELETE' })

export const getSettings = () => api('/api/settings')
export const updateSettings = data => api('/api/settings', { method:'PUT', body:JSON.stringify(data) })
export const getAudit = () => api('/api/audit')
export const resetDemo = () => api('/api/system/reset-demo', { method:'POST' })
export const exportData = async () => {
  const headers = new Headers(); const token = localStorage.getItem('pulse-token'); if (token) headers.set('x-pulse-token', token)
  const r = await fetch(`${API_BASE}/api/system/export`, { headers }); if (!r.ok) throw new Error('Could not export data.'); return r.blob()
}
export const getPlaylist = boardId => api(`/api/playlist/${boardId}`)
