import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { formatKRW } from '../utils/format'

export default function Settings() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [roles, setRoles] = useState([])
  const [salaries, setSalaries] = useState([])
  const [editingSalary, setEditingSalary] = useState(null)
  const [formData, setFormData] = useState({
    role_id: '',
    annual_salary: '',
    monthly_salary: '',
    daily_salary: '',
    hourly_salary: '',
    effective_date: new Date().toISOString().split('T')[0]
  })
  
  // 급여 자동 계산 함수
  const calculateSalaries = (type, value) => {
    const numValue = parseFloat(value) || 0
    if (numValue <= 0) {
      return { annual_salary: '', monthly_salary: '', daily_salary: '', hourly_salary: '' }
    }
    
    let annual, monthly, daily, hourly
    
    if (type === 'annual') {
      annual = numValue
      monthly = annual / 12
      daily = monthly / 20
      hourly = daily / 8
    } else if (type === 'monthly') {
      monthly = numValue
      annual = monthly * 12
      daily = monthly / 20
      hourly = daily / 8
    } else if (type === 'daily') {
      daily = numValue
      monthly = daily * 20
      annual = monthly * 12
      hourly = daily / 8
    } else if (type === 'hourly') {
      hourly = numValue
      daily = hourly * 8
      monthly = daily * 20
      annual = monthly * 12
    }
    
    return {
      annual_salary: Math.round(annual).toString(),
      monthly_salary: Math.round(monthly).toString(),
      daily_salary: Math.round(daily).toString(),
      hourly_salary: Math.round(hourly).toString()
    }
  }
  
  const handleSalaryChange = (type, value) => {
    const calculated = calculateSalaries(type, value)
    setFormData({
      ...formData,
      [type === 'annual' ? 'annual_salary' : type === 'monthly' ? 'monthly_salary' : type === 'daily' ? 'daily_salary' : 'hourly_salary']: value,
      ...calculated
    })
  }

  const SETTINGS_CODE = '1234' // 설정 코드

  useEffect(() => {
    // 세션에서 인증 상태 확인
    const auth = sessionStorage.getItem('settings_authenticated')
    if (auth === 'true') {
      setAuthenticated(true)
      fetchData()
    }
  }, [])

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    if (code === SETTINGS_CODE) {
      setAuthenticated(true)
      sessionStorage.setItem('settings_authenticated', 'true')
      fetchData()
    } else {
      alert('설정 코드가 올바르지 않습니다.')
      setCode('')
    }
  }

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
    }
  }

  const handleEditSalary = (salary) => {
    setEditingSalary(salary.id)
    setFormData({
      role_id: salary.role_id,
      annual_salary: salary.annual_salary || '',
      monthly_salary: salary.monthly_salary || '',
      daily_salary: salary.daily_salary || '',
      hourly_salary: salary.hourly_salary || '',
      effective_date: salary.effective_date
    })
  }

  const handleSaveSalary = async (e) => {
    e.preventDefault()
    try {
      await api.post('/salaries', formData)
      setEditingSalary(null)
      setFormData({
        role_id: '',
        annual_salary: '',
        monthly_salary: '',
        daily_salary: '',
        hourly_salary: '',
        effective_date: new Date().toISOString().split('T')[0]
      })
      fetchData()
      alert('급여가 저장되었습니다.')
    } catch (error) {
      console.error('급여 저장 실패:', error)
      alert('급여 저장 실패')
    }
  }

  const handleCancelEdit = () => {
    setEditingSalary(null)
    setFormData({
      role_id: '',
      annual_salary: '',
      monthly_salary: '',
      daily_salary: '',
      hourly_salary: '',
      effective_date: new Date().toISOString().split('T')[0]
    })
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">설정 접근</h1>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설정 코드 (4자리)
              </label>
              <input
                type="password"
                maxLength="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 text-center text-2xl tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              접근
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            홈으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('settings_authenticated')
            setAuthenticated(false)
            navigate('/')
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          나가기
        </button>
      </div>

      {/* 급여 관리 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">직급별 급여 설정</h2>
        
        {editingSalary ? (
          <form onSubmit={handleSaveSalary} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">직급 *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                >
                  <option value="">선택</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">적용일 *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded space-y-3">
              <div className="text-sm font-medium text-gray-700 mb-3">급여 입력 (세후 기준) - 하나만 입력하면 자동 계산됩니다</div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">연봉 (원)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                    value={formData.annual_salary ? Number(formData.annual_salary).toLocaleString('ko-KR') : ''}
                    onChange={(e) => {
                      const numValue = e.target.value.replace(/,/g, '')
                      if (numValue === '' || /^\d+$/.test(numValue)) {
                        handleSalaryChange('annual', numValue)
                      }
                    }}
                    placeholder="연봉 입력"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">월 급여 (원)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                    value={formData.monthly_salary ? Number(formData.monthly_salary).toLocaleString('ko-KR') : ''}
                    onChange={(e) => {
                      const numValue = e.target.value.replace(/,/g, '')
                      if (numValue === '' || /^\d+$/.test(numValue)) {
                        handleSalaryChange('monthly', numValue)
                      }
                    }}
                    placeholder="월 급여 입력"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">일 급여 (원)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                    value={formData.daily_salary ? Number(formData.daily_salary).toLocaleString('ko-KR') : ''}
                    onChange={(e) => {
                      const numValue = e.target.value.replace(/,/g, '')
                      if (numValue === '' || /^\d+$/.test(numValue)) {
                        handleSalaryChange('daily', numValue)
                      }
                    }}
                    placeholder="일 급여 입력"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">시간 급여 (원)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 text-sm"
                    value={formData.hourly_salary ? Number(formData.hourly_salary).toLocaleString('ko-KR') : ''}
                    onChange={(e) => {
                      const numValue = e.target.value.replace(/,/g, '')
                      if (numValue === '' || /^\d+$/.test(numValue)) {
                        handleSalaryChange('hourly', numValue)
                      }
                    }}
                    placeholder="시간 급여 입력"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                저장
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">직급</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">연봉</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">월 급여</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">일 급여</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">시간 급여</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">적용일</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium">{salary.role_name}</td>
                    <td className="px-3 py-2 text-sm font-semibold text-blue-600">
                      {salary.annual_salary ? formatKRW(salary.annual_salary) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm">{formatKRW(salary.monthly_salary || 0)}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {salary.daily_salary ? formatKRW(salary.daily_salary) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">
                      {salary.hourly_salary ? formatKRW(salary.hourly_salary) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-600">{salary.effective_date}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleEditSalary(salary)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

