import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { formatKRW } from '../utils/format'

export default function UserProjects() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/users/${id}/projects`)
      ])
      setUser(userRes.data)
      setProjects(projectsRes.data)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          ← 뒤로
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.name} - 프로젝트 이력
        </h1>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                  project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'completed' ? '완료' :
                   project.status === 'in-progress' ? '진행중' : '예정'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">역할:</span> {project.role_name}
                </div>
                <div>
                  <span className="font-medium">투입기간:</span> {project.member_start_date} ~ {project.member_end_date || '진행중'}
                </div>
                <div>
                  <span className="font-medium">프로젝트 기간:</span> {project.start_date} ~ {project.end_date || '진행중'}
                </div>
                {project.expected_gain && (
                  <div>
                    <span className="font-medium">예상 수익:</span> {formatKRW(project.expected_gain)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-600">참여한 프로젝트가 없습니다.</p>
        </div>
      )}
    </div>
  )
}



