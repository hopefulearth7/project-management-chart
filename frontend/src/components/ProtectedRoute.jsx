import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requireAuth = false }) {
  // requireAuth가 false면 로그인 없이도 접근 가능
  if (requireAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      return <Navigate to="/login" replace />
    }
  }
  
  return children
}

