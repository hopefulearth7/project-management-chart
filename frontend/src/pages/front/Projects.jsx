import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatKRW } from '../../utils/format'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data || [])
    } catch (error) {
      console.error('프로젝트 조회 실패:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">로딩 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">프로젝트 목록</h1>
        <span className="text-sm text-gray-600">총 {projects.length}개</span>
      </div>

      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {project.description || '설명 없음'}
              </p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'completed' ? '완료' :
                   project.status === 'in-progress' ? '진행중' : '계획중'}
                </span>
                {project.expected_gain && (
                  <span className="text-xs font-medium text-blue-600">
                    {formatKRW(project.expected_gain)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-600 text-sm">등록된 프로젝트가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
