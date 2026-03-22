import axios from 'axios'

// Netlify: netlify.toml 프록시 사용 시 동일 출처 /api
const isNetlifyHost =
  typeof window !== 'undefined' && /\.netlify\.app$/i.test(window.location.hostname)

/**
 * API base URL
 * - 로컬 개발(import.meta.env.DEV): 항상 /api → Vite proxy → http://localhost:3000 (원격 백엔드 자동 연결 없음)
 * - 배포 빌드: VITE_API_URL 이 있으면 해당 백엔드(예: Render)로 직접 호출
 * - Netlify: /api 유지
 */
function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL
  if (raw) {
    const trimmed = String(raw).trim()
    const noSlash = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
    if (noSlash.startsWith('http')) {
      return noSlash.endsWith('/api') ? noSlash : `${noSlash}/api`
    }
  }

  if (import.meta.env.DEV) {
    return '/api'
  }

  if (isNetlifyHost) {
    return '/api'
  }

  return '/api'
}

const API_BASE_URL = resolveApiBaseUrl()

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.debug('[api] baseURL =', API_BASE_URL)
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터: 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const base = import.meta.env.BASE_URL || '/'
      const loginPath =
        base === '/' ? '/login' : `${base.replace(/\/$/, '')}/login`
      window.location.href = loginPath
    }
    return Promise.reject(error)
  }
)

export default api
