import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { Link } from 'react-router-dom'
import { formatKRW } from '../../utils/format'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await api.get('/admin/summary')
      setSummary(response.data)
    } catch (error) {
      console.error('대시보드 데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  if (!summary) {
    return <div className="text-center py-12 text-red-600">데이터를 불러올 수 없습니다.</div>
  }

  const { projects, users } = summary

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">어드민 대시보드</h1>
        <div className="flex gap-3">
          <Link to="/admin/salary" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            급여 관리
          </Link>
          <Link to="/admin/cost" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            비용 관리
          </Link>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-600 mb-1">전체 프로젝트</div>
          <div className="text-2xl font-bold text-blue-600">
            {projects.stats.reduce((sum, stat) => sum + parseInt(stat.count), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-600 mb-1">진행 중</div>
          <div className="text-2xl font-bold text-green-600">
            {projects.stats.find(s => s.status === 'in-progress')?.count || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-600 mb-1">완료</div>
          <div className="text-2xl font-bold text-purple-600">
            {projects.stats.find(s => s.status === 'completed')?.count || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-600 mb-1">전체 직원</div>
          <div className="text-2xl font-bold text-orange-600">
            {users.stats.total_users}
          </div>
        </div>
      </div>

      {/* 프로젝트 일정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">프로젝트 일정</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">프로젝트명</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">진행률</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">예상 수익</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.schedule.map((project) => {
                const progress = project.wbs_count > 0 
                  ? Math.round((project.completed_wbs_count / project.wbs_count) * 100) 
                  : 0
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <Link to={`/projects/${project.id}`} className="text-blue-600 hover:underline font-medium">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'completed' ? '완료' :
                         project.status === 'in-progress' ? '진행중' : '계획중'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {project.start_date} ~ {project.end_date || '진행중'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium">
                      {formatKRW(project.expected_gain || 0)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 입사자 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">입사자 정보</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-600">전체 직원 수</div>
            <div className="text-2xl font-bold text-blue-600">{users.stats.total_users}명</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-600">최근 1년 입사자</div>
            <div className="text-2xl font-bold text-green-600">{users.stats.new_users_this_year}명</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">역할</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">입사일</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium">{employee.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{employee.email}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      {employee.role === 'admin' ? '관리자' : '일반 사용자'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(employee.join_date).toLocaleDateString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
