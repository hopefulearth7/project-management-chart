import axios from 'axios'

// Netlify: netlify.toml에서 /api → Render 프록시 시 동일 출처(/api)만 쓰면 CORS 설정 부담 감소
const isNetlifyHost =
  typeof window !== 'undefined' && /\.netlify\.app$/i.test(window.location.hostname)

// VITE_API_URL이 있으면 우선(직접 백엔드 호출), 없으면 상대 경로 /api
let API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL.endsWith('/')
      ? import.meta.env.VITE_API_URL.slice(0, -1)
      : import.meta.env.VITE_API_URL)
  : '/api'

if (API_BASE_URL.startsWith('http')) {
  API_BASE_URL = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL
    : `${API_BASE_URL}/api`
} else if (API_BASE_URL === '/api') {
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  if (isNetlifyHost) {
    // Netlify Edge 프록시 경로 유지
    API_BASE_URL = '/api'
  } else if (!isLocal) {
    // 기타 호스팅(Vercel 등): Render 백엔드 직접 호출
    API_BASE_URL = 'https://project-management-backend-vn80.onrender.com/api'
    console.log('🌐 배포 환경 감지: 배포된 백엔드 API 사용', API_BASE_URL)
  }
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

