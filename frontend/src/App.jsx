import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Admin from './pages/admin/Admin'
import FrontProjects from './pages/front/Projects'
import FrontProjectDetail from './pages/front/ProjectDetail'
import UserProjects from './pages/UserProjects'

// GitHub Pages 등 서브 경로 배포 시 Vite BASE_URL과 맞춤
const routerBasename =
  (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || undefined

function App() {
  return (
    <Router
      basename={routerBasename}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="settings" element={<Navigate to="/admin" replace />} />
          <Route path="admin" element={<Admin />} />
          <Route path="projects">
            <Route index element={<FrontProjects />} />
            <Route path=":id" element={<FrontProjectDetail />} />
          </Route>
          <Route path="users/:id/projects" element={<UserProjects />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
