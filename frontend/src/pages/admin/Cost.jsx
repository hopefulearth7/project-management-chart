import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminCost() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [costs, setCosts] = useState([])
  const [formData, setFormData] = useState({
    cost_type: 'one-time',
    category: '',
    amount: '',
    currency: 'USD',
    start_date: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchCosts()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('프로젝트 조회 실패:', error)
    }
  }

  const fetchCosts = async () => {
    try {
      const response = await axios.get(`/api/projects/${selectedProject}/costs`)
      setCosts(response.data)
    } catch (error) {
      console.error('비용 조회 실패:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProject) {
      alert('프로젝트를 선택하세요')
      return
    }

    try {
      await axios.post(`/api/projects/${selectedProject}/costs`, formData)
      setFormData({
        cost_type: 'one-time',
        category: '',
        amount: '',
        currency: 'USD',
        start_date: new Date().toISOString().split('T')[0],
        description: ''
      })
      fetchCosts()
    } catch (error) {
      console.error('비용 등록 실패:', error)
      alert('비용 등록 실패')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">비용 관리</h1>

      {/* 프로젝트 선택 */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          프로젝트 선택
        </label>
        <select
          className="input"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">프로젝트를 선택하세요</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* 비용 등록 폼 */}
      {selectedProject && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">비용 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비용 유형
              </label>
              <select
                required
                className="input"
                value={formData.cost_type}
                onChange={(e) => setFormData({ ...formData, cost_type: e.target.value })}
              >
                <option value="one-time">일회성 비용</option>
                <option value="recurring">지속적 비용</option>
                <option value="long-term">장기적 비용</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                required
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">선택하세요</option>
                <option value="인프라">인프라</option>
                <option value="라이선스">라이선스</option>
                <option value="인건비">인건비</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                금액
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            {formData.cost_type === 'recurring' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반복 주기
                </label>
                <select
                  className="input"
                  value={formData.recurrence || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                >
                  <option value="monthly">월간</option>
                  <option value="yearly">연간</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                className="input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary">
              등록
            </button>
          </form>
        </div>
      )}

      {/* 비용 목록 */}
      {selectedProject && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">비용 목록</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    유형
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costs.map((cost) => (
                  <tr key={cost.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {cost.cost_type === 'one-time' ? '일회성' :
                       cost.cost_type === 'recurring' ? '지속적' : '장기적'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {cost.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${parseFloat(cost.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {cost.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

