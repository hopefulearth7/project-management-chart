import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatKRW } from '../../utils/format'

export default function AdminSalary() {
  const [roles, setRoles] = useState([])
  const [salaries, setSalaries] = useState([])
  const [formData, setFormData] = useState({
    role_id: '',
    monthly_salary: '',
    effective_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rolesRes, salariesRes] = await Promise.all([
        api.get('/roles'),
        api.get('/salaries')
      ])
      setRoles(rolesRes.data)
      setSalaries(salariesRes.data)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/salaries', formData)
      setFormData({
        role_id: '',
        monthly_salary: '',
        effective_date: new Date().toISOString().split('T')[0]
      })
      fetchData()
      alert('급여가 등록되었습니다.')
    } catch (error) {
      console.error('급여 등록 실패:', error)
      alert('급여 등록 실패')
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-gray-900">직급별 급여 관리</h1>

      {/* 급여 등록 폼 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">급여 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">직급</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              >
                <option value="">선택하세요</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">월 급여 (원)</label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                value={formData.monthly_salary}
                onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                placeholder="예: 3000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">적용 시작일</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            등록
          </button>
        </form>
      </div>

      {/* 급여 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">직급별 급여 현황</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">직급</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">월 급여</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">적용일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{salary.role_name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {formatKRW(salary.monthly_salary)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{salary.effective_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    등록된 급여 정보가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
