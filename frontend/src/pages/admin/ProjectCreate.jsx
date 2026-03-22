import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

export default function ProjectCreate() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    expected_gain: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('/projects', {
        ...formData,
        expected_gain: formData.expected_gain ? parseFloat(formData.expected_gain) : null
      })
      navigate(`/projects/${response.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || '프로젝트 생성 실패')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">프로젝트 생성</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트명 *
            </label>
            <input
              type="text"
              required
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              className="input"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일 *
              </label>
              <input
                type="date"
                required
                className="input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료일
              </label>
              <input
                type="date"
                className="input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예상 수익 (G) - USD
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input"
              value={formData.expected_gain}
              onChange={(e) => setFormData({ ...formData, expected_gain: e.target.value })}
              placeholder="예: 10000"
            />
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="btn-primary">
              프로젝트 생성
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="btn-secondary"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

