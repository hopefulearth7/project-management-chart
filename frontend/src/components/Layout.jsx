import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              프로젝트 관리
            </Link>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 text-sm">
                홈
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 text-sm">
                관리자
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
