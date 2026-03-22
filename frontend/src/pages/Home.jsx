import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { formatKRW } from '../utils/format'
import { formatDateRange } from '../utils/dateFormat'

export default function Home() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    expected_gain: '',
    project_type: '',
    exclude_weekends: true
  })
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuId(null)
      }
    }
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data || [])
    } catch (error) {
      console.error('프로젝트 조회 실패:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('/api/projects', {
        ...formData,
        expected_gain: formData.expected_gain ? parseFloat(formData.expected_gain) : null
      })
      setShowCreateModal(false)
      setFormData({
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        expected_gain: '',
        project_type: '',
        exclude_weekends: true
      })
      fetchProjects()
      navigate(`/projects/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || '프로젝트 생성 실패')
    }
  }

  const handleDeleteProject = async (projectId, projectName, e) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!confirm(`정말 "${projectName}" 프로젝트를 삭제하시겠습니까?\n프로젝트와 관련된 모든 데이터(인원, WBS, 비용 등)가 함께 삭제됩니다.`)) {
      return
    }
    
    try {
      await axios.delete(`/api/projects/${projectId}`)
      alert('프로젝트가 삭제되었습니다.')
      fetchProjects()
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error)
      alert(error.response?.data?.error || '프로젝트 삭제 실패')
    }
  }

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter)

  const projectsByStatus = {
    'in-progress': projects.filter(p => p.status === 'in-progress'),
    'planning': projects.filter(p => p.status === 'planning'),
    'completed': projects.filter(p => p.status === 'completed')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            <span>프로젝트 생성</span>
          </button>
        </div>
      </div>

      {/* 상태별 필터 */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-2 backdrop-blur-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              filter === 'all' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            전체 ({projects.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              filter === 'in-progress' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            진행중 ({projectsByStatus['in-progress'].length})
          </button>
          <button
            onClick={() => setFilter('planning')}
            className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              filter === 'planning' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            예정 ({projectsByStatus['planning'].length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
              filter === 'completed' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            완료 ({projectsByStatus['completed'].length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-16 text-center backdrop-blur-sm">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
          <p className="mt-6 text-slate-600 font-medium">로딩 중...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">프로젝트명</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">기간</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">투입인원</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">예산</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider w-20">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-slate-500 mt-1 truncate max-w-md">{project.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-full shadow-sm ${
                        project.status === 'completed' 
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white' :
                        project.status === 'in-progress' 
                          ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white' :
                          'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                      }`}>
                        {project.status === 'completed' ? '완료' :
                         project.status === 'in-progress' ? '진행중' : '예정'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                      {formatDateRange(project.start_date, project.end_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                      {project.member_count || 0}명
                    </td>
                    <td className="px-6 py-4 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {project.expected_gain ? formatKRW(project.expected_gain) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block menu-container">
                        <button
                          type="button"
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === project.id ? null : project.id)
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {openMenuId === project.id && (
                          <div
                            className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setOpenMenuId(null)
                                handleDeleteProject(project.id, project.name, e)
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 rounded-2xl shadow-xl border border-slate-200/60 p-16 text-center backdrop-blur-sm">
          <div className="text-7xl mb-6 opacity-80">📋</div>
          <p className="text-slate-700 mb-6 text-lg font-semibold">등록된 프로젝트가 없습니다.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            첫 프로젝트 생성하기
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-bold">프로젝트 생성</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">프로젝트명 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="프로젝트 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">프로젝트 성격 *</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                  >
                    <option value="">선택하세요</option>
                    <option value="mobile-app">모바일 앱 런칭</option>
                    <option value="exhibition">전시</option>
                    <option value="website">웹사이트 개발</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">설명</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="프로젝트에 대한 설명을 입력하세요"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">시작일 *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      min={formData.start_date}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="exclude_weekends"
                    checked={formData.exclude_weekends}
                    onChange={(e) => setFormData({ ...formData, exclude_weekends: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="exclude_weekends" className="text-xs text-gray-700 cursor-pointer">
                    주말 및 공휴일 제외 (작업일 기준)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">예상 수익 (원)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formData.expected_gain ? Number(formData.expected_gain).toLocaleString('ko-KR') : ''}
                    onChange={(e) => {
                      const numValue = e.target.value.replace(/,/g, '')
                      if (numValue === '' || /^\d+$/.test(numValue)) {
                        setFormData({ ...formData, expected_gain: numValue })
                      }
                    }}
                    placeholder="예: 10,000,000"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    프로젝트 생성
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-semibold transition-all duration-300"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
