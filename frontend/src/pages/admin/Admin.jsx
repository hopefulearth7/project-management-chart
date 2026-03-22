import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatKRW } from '../../utils/format'

export default function Admin() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [users, setUsers] = useState([])
  const [roleSalaries, setRoleSalaries] = useState([])
  const [timeline, setTimeline] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userProjects, setUserProjects] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    employment_start_date: '',
    employment_end_date: '',
    actual_annual_salary: '',
    employment_status: 'active'
  })
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'user',
    employment_start_date: '',
    actual_annual_salary: '',
    employment_status: 'active'
  })
  const [roles, setRoles] = useState([])
  const [salaries, setSalaries] = useState([])
  const [editingSalary, setEditingSalary] = useState(null)
  const [salaryFormData, setSalaryFormData] = useState({
    role_id: '',
    annual_salary: '',
    monthly_salary: '',
    daily_salary: '',
    hourly_salary: '',
    effective_date: new Date().toISOString().split('T')[0]
  })
  const [showSalaryForm, setShowSalaryForm] = useState(false)
  const [adminSettings, setAdminSettings] = useState(null)
  const [showSettingsForm, setShowSettingsForm] = useState(false)
  const [settingsFormData, setSettingsFormData] = useState({
    admin_code: '',
    company_name: ''
  })
  const [isInitialSetup, setIsInitialSetup] = useState(false)
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    level: ''
  })

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setAuthenticated(true)
      fetchData()
      fetchAdminSettings()
    } else {
      // 인증되지 않은 경우 관리자 설정 확인
      checkAdminSettings()
    }
  }, [])

  const checkAdminSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings')
      setAdminSettings(response.data)
      // 관리자 코드가 기본값이거나 없으면 초기 설정 모드
      if (!response.data || !response.data.admin_code || response.data.admin_code === '1234') {
        setIsInitialSetup(true)
        setShowSettingsForm(true)
        setSettingsFormData({
          admin_code: response.data?.admin_code || '',
          company_name: response.data?.company_name || ''
        })
      }
    } catch (error) {
      console.error('관리자 설정 조회 실패:', error)
      // 설정이 없으면 초기 설정 모드
      setIsInitialSetup(true)
      setShowSettingsForm(true)
    }
  }

  const fetchAdminSettings = async () => {
    try {
      const response = await axios.get('/api/admin/settings')
      setAdminSettings(response.data)
    } catch (error) {
      console.error('관리자 설정 조회 실패:', error)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    if (!settingsFormData.admin_code || settingsFormData.admin_code.length < 4) {
      alert('관리자 코드는 4자 이상이어야 합니다.')
      return
    }
    if (!settingsFormData.company_name || settingsFormData.company_name.trim() === '') {
      alert('접근명은 필수 입력 항목입니다.')
      return
    }
    
    try {
      await axios.post('/api/admin/settings', settingsFormData)
      setShowSettingsForm(false)
      setIsInitialSetup(false)
      setAdminSettings(settingsFormData)
      if (isInitialSetup) {
        // 초기 설정 완료 후 자동 인증
        setAuthenticated(true)
        sessionStorage.setItem('admin_authenticated', 'true')
        fetchData()
        fetchAdminSettings()
        alert('관리자 설정이 완료되었습니다.')
      } else {
        alert('관리자 설정이 저장되었습니다.')
        fetchAdminSettings()
      }
    } catch (error) {
      console.error('관리자 설정 저장 실패:', error)
      alert(error.response?.data?.error || '관리자 설정 저장 실패')
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    if (!companyName || !companyName.trim()) {
      setAuthError('접근명을 입력해주세요.')
      return
    }
    if (!code || code.length < 4) {
      setAuthError('관리자 코드를 입력해주세요.')
      return
    }
    
    setAuthError('')
    try {
      const response = await axios.post('/api/admin/verify-code', { 
        code,
        company_name: companyName.trim()
      })
      if (response.data.valid) {
        setAuthenticated(true)
        sessionStorage.setItem('admin_authenticated', 'true')
        fetchData()
        fetchAdminSettings()
      } else {
        setAuthError('접근명 또는 관리자 코드가 올바르지 않습니다.')
        setCode('')
        setCompanyName('')
      }
    } catch (error) {
      console.error('코드 확인 실패:', error)
      setAuthError(error.response?.data?.error || '코드 확인 중 오류가 발생했습니다.')
      setCode('')
    }
  }

  const fetchData = async () => {
    try {
      const [usersRes, salariesRes, timelineRes, rolesRes, salaryListRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/admin/role-salaries'),
        axios.get('/api/admin/member-timeline'),
        axios.get('/api/roles'),
        axios.get('/api/salaries')
      ])
      setUsers(usersRes.data.filter(u => u.role !== 'admin'))
      setRoleSalaries(salariesRes.data)
      setTimeline(timelineRes.data)
      setRoles(rolesRes.data)
      setSalaries(salaryListRes.data)
    } catch (error) {
      console.error('데이터 조회 실패:', error)
    }
  }
  
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
    setSalaryFormData({
      ...salaryFormData,
      [type === 'annual' ? 'annual_salary' : type === 'monthly' ? 'monthly_salary' : type === 'daily' ? 'daily_salary' : 'hourly_salary']: value,
      ...calculated
    })
  }
  
  const handleAddRole = async (e) => {
    e.preventDefault()
    if (!roleFormData.name || !roleFormData.name.trim()) {
      alert('직급명을 입력해주세요.')
      return
    }
    if (!roleFormData.level || roleFormData.level === '') {
      alert('직급 레벨을 입력해주세요.')
      return
    }
    
    try {
      const response = await axios.post('/api/roles', {
        name: roleFormData.name.trim(),
        level: parseInt(roleFormData.level)
      })
      console.log('직급 등록 성공:', response.data)
      setShowRoleForm(false)
      setRoleFormData({ name: '', level: '' })
      // 직급 목록만 새로고침
      try {
        const rolesResponse = await axios.get('/api/roles')
        setRoles(rolesResponse.data)
        alert('직급이 등록되었습니다.')
      } catch (fetchError) {
        console.error('직급 목록 조회 실패:', fetchError)
        // 전체 데이터 새로고침 시도
        fetchData()
        alert('직급이 등록되었습니다.')
      }
    } catch (error) {
      console.error('직급 등록 실패:', error)
      console.error('에러 상세:', error.response?.data)
      alert(error.response?.data?.error || error.message || '직급 등록 실패')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/users', newUserForm)
      setShowAddUserForm(false)
      setNewUserForm({
        name: '',
        email: '',
        role: 'user',
        employment_start_date: '',
        actual_annual_salary: ''
      })
      fetchData()
      alert('인원이 추가되었습니다.')
    } catch (error) {
      console.error('인원 추가 실패:', error)
      alert(error.response?.data?.error || '인원 추가 실패')
    }
  }
  
  const handleEditSalary = (salary) => {
    setEditingSalary(salary.id)
    setShowSalaryForm(true)
    setSalaryFormData({
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
      await axios.post('/api/salaries', salaryFormData)
      setEditingSalary(null)
      setShowSalaryForm(false)
      setSalaryFormData({
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

  const handleUserClick = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}/projects`)
      setUserProjects(response.data)
      setSelectedUser(users.find(u => u.id === userId))
    } catch (error) {
      console.error('프로젝트 이력 조회 실패:', error)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setUserFormData({
      employment_start_date: user.employment_start_date || '',
      employment_end_date: user.employment_end_date || '',
      actual_annual_salary: user.actual_annual_salary || '',
      employment_status: user.employment_status || 'active'
    })
  }

  const handleSaveUser = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}`, userFormData)
      setEditingUser(null)
      fetchData()
      alert('저장되었습니다.')
    } catch (error) {
      console.error('사용자 수정 실패:', error)
      alert('수정 실패')
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          {isInitialSetup ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">관리자 코드 설정</h1>
              <p className="text-sm text-gray-600 mb-6 text-center">처음 사용하시는 경우 관리자 코드를 설정해주세요</p>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    접근명 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settingsFormData.company_name}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, company_name: e.target.value })}
                    placeholder="접근명을 입력하세요"
                  />
                  <p className="text-xs text-gray-500 mt-1">접근명과 관리자 코드가 모두 일치해야 접근 가능합니다.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관리자 코드 (4자 이상) *
                  </label>
                  <input
                    type="text"
                    maxLength="10"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={settingsFormData.admin_code}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, admin_code: e.target.value.replace(/\s/g, '') })}
                    placeholder="관리자 코드 입력"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">4자 이상 10자 이하의 코드를 입력하세요</p>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  설정 완료
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">관리자 접근</h1>
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                {authError && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                    {authError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    접근명 *
                  </label>
                  <input
                    type="text"
                    autoComplete="organization"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="접근명을 입력하세요"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관리자 코드 *
                  </label>
                  <input
                    type="password"
                    maxLength="10"
                    autoComplete="new-password"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
                    placeholder="관리자 코드 입력"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">접근명과 관리자 코드가 모두 일치해야 접근 가능합니다.</p>
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  접근
                </button>
              </form>
            </>
          )}
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

  // 타임라인 데이터 가공
  const timelineByUser = timeline.reduce((acc, item) => {
    if (!acc[item.user_id]) {
      acc[item.user_id] = {
        user_name: item.user_name,
        projects: []
      }
    }
    acc[item.user_id].projects.push(item)
    return acc
  }, {})

  // 날짜 범위 계산
  const getDateRange = () => {
    if (timeline.length === 0) return { start: new Date(), end: new Date() }
    const dates = timeline.flatMap(t => [
      new Date(t.start_date),
      t.end_date ? new Date(t.end_date) : new Date()
    ])
    return {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    }
  }

  const dateRange = getDateRange()
  const days = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">관리자 페이지</h1>
          {adminSettings?.company_name && (
            <p className="text-sm text-slate-500">{adminSettings.company_name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowSettingsForm(true)
              setSettingsFormData({
                admin_code: adminSettings?.admin_code || '',
                company_name: adminSettings?.company_name || ''
              })
            }}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-white hover:bg-slate-900 rounded-lg border border-slate-300 hover:border-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            설정 변경
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('admin_authenticated')
              setAuthenticated(false)
              navigate('/')
            }}
            className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium rounded-xl transition-all duration-300"
          >
            나가기
          </button>
        </div>
      </div>

      {/* 관리자 설정 변경 폼 */}
      {showSettingsForm && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/60 p-8 mb-6 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-purple-800 bg-clip-text text-transparent">관리자 설정</h2>
            <button
              onClick={() => {
                setShowSettingsForm(false)
                setIsInitialSetup(false)
              }}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all text-xl font-light"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                접근명 *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                value={settingsFormData.company_name}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, company_name: e.target.value })}
                placeholder="접근명을 입력하세요"
              />
              <p className="text-xs text-gray-500 mt-1">접근명과 관리자 코드가 모두 일치해야 접근 가능합니다.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관리자 코드 (4자 이상) *
              </label>
              <input
                type="text"
                maxLength="10"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                value={settingsFormData.admin_code}
                onChange={(e) => setSettingsFormData({ ...settingsFormData, admin_code: e.target.value.replace(/\s/g, '') })}
                placeholder="관리자 코드 입력"
              />
              <p className="text-xs text-gray-500 mt-1">4자 이상 10자 이하의 코드를 입력하세요</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsForm(false)
                  setIsInitialSetup(false)
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-semibold transition-all duration-300"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 직급 관리 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">직급 관리</h2>
          {!showRoleForm && (
            <button
              onClick={() => {
                setShowRoleForm(true)
                setRoleFormData({ name: '', level: '' })
              }}
              className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>직급 추가</span>
            </button>
          )}
        </div>
        
        {showRoleForm && (
          <div className="mb-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">직급 등록</h3>
              <button
                onClick={() => {
                  setShowRoleForm(false)
                  setRoleFormData({ name: '', level: '' })
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all text-xl font-light"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddRole} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직급명 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                    placeholder="예: 사원, 대리, 과장"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직급 레벨 *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={roleFormData.level}
                    onChange={(e) => setRoleFormData({ ...roleFormData, level: e.target.value })}
                    placeholder="숫자 (1=최하위, 숫자가 클수록 높은 직급)"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-6 py-3 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200">
                  등록
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleForm(false)
                    setRoleFormData({ name: '', level: '' })
                  }}
                  className="px-6 py-3 text-sm font-semibold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">직급명</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">레벨</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{role.name}</td>
                    <td className="px-4 py-3 text-slate-600">{role.level}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-3 py-4 text-center text-gray-500 text-sm">
                    등록된 직급이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 직급별 급여 설정 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">직급별 급여 설정</h2>
          {!showSalaryForm && (
            <button
              onClick={() => {
                setShowSalaryForm(true)
                setEditingSalary(null)
                setSalaryFormData({
                  role_id: '',
                  annual_salary: '',
                  monthly_salary: '',
                  daily_salary: '',
                  hourly_salary: '',
                  effective_date: new Date().toISOString().split('T')[0]
                })
              }}
              className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>급여 추가</span>
            </button>
          )}
        </div>
        
        {showSalaryForm && (
          <div className="mb-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">급여 설정</h3>
              <button
                onClick={() => {
                  setShowSalaryForm(false)
                  setEditingSalary(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveSalary} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">직급 *</label>
                  <select
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={salaryFormData.role_id}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, role_id: e.target.value })}
                  >
                    <option value="">선택</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">적용일 *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={salaryFormData.effective_date}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, effective_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded space-y-2">
                <div className="text-xs font-medium text-gray-700 mb-2">급여 입력 (세후 기준) - 하나만 입력하면 자동 계산됩니다</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">연봉 (원)</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded"
                      value={salaryFormData.annual_salary ? Number(salaryFormData.annual_salary).toLocaleString('ko-KR') : ''}
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
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded"
                      value={salaryFormData.monthly_salary ? Number(salaryFormData.monthly_salary).toLocaleString('ko-KR') : ''}
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
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded"
                      value={salaryFormData.daily_salary ? Number(salaryFormData.daily_salary).toLocaleString('ko-KR') : ''}
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
                      className="w-full px-2 py-1.5 text-sm bg-white border border-gray-300 rounded"
                      value={salaryFormData.hourly_salary ? Number(salaryFormData.hourly_salary).toLocaleString('ko-KR') : ''}
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
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-6 py-3 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200">
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSalaryForm(false)
                    setEditingSalary(null)
                  }}
                  className="px-6 py-3 text-sm font-semibold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">직급</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">연봉</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">월 급여</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">일 급여</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">시간 급여</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">적용일</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {salaries.length > 0 ? (
                salaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{salary.role_name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {salary.annual_salary ? formatKRW(salary.annual_salary) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatKRW(salary.monthly_salary || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {salary.daily_salary ? formatKRW(salary.daily_salary) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {salary.hourly_salary ? formatKRW(salary.hourly_salary) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{salary.effective_date}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEditSalary(salary)}
                        className="text-xs font-medium px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-3 py-4 text-center text-gray-500 text-sm">
                    등록된 급여가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 전체 회사 인원 관리 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">전체 회사 인원</h2>
          {!showAddUserForm && (
            <button
              onClick={() => setShowAddUserForm(true)}
              className="px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              <span>인원 추가</span>
            </button>
          )}
        </div>
        
        {showAddUserForm && (
          <div className="mb-4 p-5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">인원 추가</h3>
              <button
                onClick={() => {
                  setShowAddUserForm(false)
                  setNewUserForm({
                    name: '',
                    email: '',
                    role: 'user',
                    employment_start_date: '',
                    actual_annual_salary: '',
                    employment_status: 'active'
                  })
                }}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all text-xl font-light"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이름 *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="이름"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">이메일 *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">재직 시작일</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={newUserForm.employment_start_date}
                    onChange={(e) => setNewUserForm({ ...newUserForm, employment_start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
                  <select
                    className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white text-slate-900 font-medium"
                    value={newUserForm.employment_status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, employment_status: e.target.value })}
                  >
                    <option value="active">재직</option>
                    <option value="on-leave">휴직</option>
                    <option value="resigned">퇴직</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">실연봉 (원)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded"
                  value={newUserForm.actual_annual_salary ? Number(newUserForm.actual_annual_salary).toLocaleString('ko-KR') : ''}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/,/g, '')
                    if (numValue === '' || /^\d+$/.test(numValue)) {
                      setNewUserForm({ ...newUserForm, actual_annual_salary: numValue })
                    }
                  }}
                  placeholder="실제 연봉"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-6 py-3 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-200">
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserForm(false)
                    setNewUserForm({
                      name: '',
                      email: '',
                      role: 'user',
                      employment_start_date: '',
                      actual_annual_salary: ''
                    })
                  }}
                  className="px-6 py-3 text-sm font-semibold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">이름</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">이메일</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">상태</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">재직기간</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">실연봉</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">작업</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.length > 0 ? (
                users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUserClick(user.id)}
                      className="font-semibold text-slate-900 hover:text-slate-700 transition-colors"
                    >
                      {user.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {editingUser === user.id ? (
                      <select
                        className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                        value={userFormData.employment_status}
                        onChange={(e) => setUserFormData({ ...userFormData, employment_status: e.target.value })}
                      >
                        <option value="active">재직</option>
                        <option value="on-leave">휴직</option>
                        <option value="resigned">퇴직</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        user.employment_status === 'active' ? 'bg-green-100 text-green-700' :
                        user.employment_status === 'on-leave' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.employment_status === 'active' ? '재직' :
                         user.employment_status === 'on-leave' ? '휴직' : '퇴직'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingUser === user.id ? (
                      <div className="flex gap-1">
                        <input
                          type="date"
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-28"
                          value={userFormData.employment_start_date}
                          onChange={(e) => setUserFormData({ ...userFormData, employment_start_date: e.target.value })}
                        />
                        <span className="text-xs">~</span>
                        <input
                          type="date"
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-28"
                          value={userFormData.employment_end_date}
                          onChange={(e) => setUserFormData({ ...userFormData, employment_end_date: e.target.value })}
                        />
                      </div>
                    ) : (
                      user.employment_start_date 
                        ? `${user.employment_start_date} ~ ${user.employment_end_date || '재직중'}`
                        : '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        className="px-2 py-1 border border-slate-300 rounded text-xs w-28"
                        value={userFormData.actual_annual_salary ? Number(userFormData.actual_annual_salary).toLocaleString('ko-KR') : ''}
                        onChange={(e) => {
                          const numValue = e.target.value.replace(/,/g, '')
                          if (numValue === '' || /^\d+$/.test(numValue)) {
                            setUserFormData({ ...userFormData, actual_annual_salary: numValue })
                          }
                        }}
                        placeholder="연봉"
                      />
                    ) : (
                      <span>
                        {user.actual_annual_salary ? formatKRW(user.actual_annual_salary) : '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingUser === user.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveUser(user.id)}
                          className="px-2 py-1 bg-slate-900 text-white rounded text-xs hover:bg-slate-800"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-xs font-medium text-slate-700 hover:text-slate-900"
                      >
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-gray-500 text-sm">
                    등록된 인원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 인원별 프로젝트 투입 타임라인 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold mb-4 text-slate-900">인원별 프로젝트 투입 타임라인</h2>
        <div className="space-y-4">
          {Object.keys(timelineByUser).length > 0 ? (
            Object.entries(timelineByUser).map(([userId, data]) => (
              <div key={userId} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="font-semibold text-slate-900 mb-3">{data.user_name}</div>
                <div className="space-y-2">
                  {data.projects.map((project, idx) => {
                    const start = new Date(project.start_date)
                    const end = project.end_date ? new Date(project.end_date) : new Date()
                    const startDateStr = start.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
                    const endDateStr = end.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
                    
                    return (
                      <div
                        key={idx}
                        className="bg-slate-900 rounded-lg px-4 py-3 text-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1 truncate">{project.project_name}</div>
                            <div className="text-xs text-blue-100 flex items-center gap-3">
                              <span>{startDateStr} ~ {project.end_date ? endDateStr : '진행중'}</span>
                              {project.role_name && (
                                <span className="bg-blue-400 bg-opacity-30 px-2 py-0.5 rounded">역할: {project.role_name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
              프로젝트에 투입된 인원이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 사용자 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedUser.name} - 프로젝트 이력</h2>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setUserProjects([])
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {userProjects.length > 0 ? (
                <div className="space-y-3">
                  {userProjects.map((project) => (
                    <div key={project.id} className="p-3 border border-gray-200 rounded">
                      <div className="font-medium mb-1">{project.name}</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>역할: {project.role_name}</div>
                        <div>투입기간: {project.member_start_date} ~ {project.member_end_date || '진행중'}</div>
                        <div>프로젝트 기간: {project.start_date} ~ {project.end_date || '진행중'}</div>
                        <div>상태: {
                          project.status === 'completed' ? '완료' :
                          project.status === 'in-progress' ? '진행중' : '예정'
                        }</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  참여한 프로젝트가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

