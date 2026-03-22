import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatKRW } from '../../utils/format'
import { formatDate, formatDateRange } from '../../utils/dateFormat'
import GanttChart from '../../components/GanttChart'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [roi, setRoi] = useState(null)
  const [members, setMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [editingMember, setEditingMember] = useState(null)
  const [memberDates, setMemberDates] = useState({ start_date: '', end_date: '', exclude_weekends: true })
  const [loading, setLoading] = useState(true)
  const [wbsItems, setWbsItems] = useState([])
  const [editingWBS, setEditingWBS] = useState(null)
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [showAddWBSForm, setShowAddWBSForm] = useState(false)
  const [wbsFormData, setWbsFormData] = useState({
    code: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'not-started',
    progress: 0,
    assigned_to: '',
    estimated_hours: '',
    exclude_weekends: true
  })
  const [openWBSMenuId, setOpenWBSMenuId] = useState(null)
  const [showWBSModal, setShowWBSModal] = useState(false)
  const [showWBSDetailModal, setShowWBSDetailModal] = useState(false)
  const [selectedWBS, setSelectedWBS] = useState(null)

  useEffect(() => {
    fetchProject()
    fetchROI()
    fetchMembers()
    fetchRoles()
    fetchUsers()
    fetchWBS()
  }, [id])

  useEffect(() => {
    if (members.length > 0) {
      fetchROI()
    }
  }, [members])

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.wbs-menu-container')) {
        setOpenWBSMenuId(null)
      }
    }
    if (openWBSMenuId) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openWBSMenuId])

  const fetchProject = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}`)
      setProject(response.data)
    } catch (error) {
      console.error('프로젝트 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchROI = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/roi`)
      setRoi(response.data)
    } catch (error) {
      console.error('ROI 조회 실패:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/members`)
      setMembers(response.data)
    } catch (error) {
      console.error('멤버 조회 실패:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('직급 조회 실패:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      console.error('사용자 조회 실패:', error)
    }
  }

  const fetchWBS = async () => {
    try {
      const response = await axios.get(`/api/projects/${id}/wbs`)
      setWbsItems(response.data)
    } catch (error) {
      console.error('WBS 조회 실패:', error)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedUser || !selectedRole) {
      alert('사용자와 직급을 선택하세요')
      return
    }

    try {
      await axios.post(`/api/projects/${id}/members`, {
        user_id: selectedUser,
        role_id: selectedRole,
        start_date: project.start_date,
        end_date: project.end_date
      })
      fetchMembers()
      setSelectedUser('')
      setSelectedRole('')
    } catch (error) {
      console.error('멤버 추가 실패:', error)
      alert('멤버 추가 실패')
    }
  }

  const handleEditMember = (member) => {
    setEditingMember(member.id)
    setMemberDates({
      start_date: member.start_date,
      end_date: member.end_date || '',
      exclude_weekends: true
    })
  }

  const handleSaveMember = async (memberId) => {
    try {
      await axios.put(`/api/projects/${id}/members/${memberId}`, memberDates)
      setEditingMember(null)
      fetchMembers()
      alert('기간이 수정되었습니다.')
    } catch (error) {
      console.error('멤버 수정 실패:', error)
      alert('멤버 수정 실패')
    }
  }

  const handleDeleteMember = async (memberId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await axios.delete(`/api/projects/${id}/members/${memberId}`)
      fetchMembers()
    } catch (error) {
      console.error('멤버 삭제 실패:', error)
      alert('멤버 삭제 실패')
    }
  }

  const handleAddWBS = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/projects/${id}/wbs`, {
        ...wbsFormData,
        project_id: id,
        estimated_hours: wbsFormData.estimated_hours ? parseFloat(wbsFormData.estimated_hours) : null
      })
      setWbsFormData({
        code: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'not-started',
        progress: 0,
        assigned_to: '',
        estimated_hours: ''
      })
      setShowAddWBSForm(false)
      fetchWBS()
    } catch (error) {
      console.error('WBS 추가 실패:', error)
      alert('WBS 추가 실패')
    }
  }

  // 날짜 기반 자동 상태 계산
  const calculateStatusFromDates = (startDate, endDate) => {
    if (!startDate) return 'not-started'
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(0, 0, 0, 0)
    
    if (end && today > end) {
      return 'completed'
    } else if (today >= start) {
      return 'in-progress'
    } else {
      return 'not-started'
    }
  }

  const handleEditWBS = (wbs) => {
    setSelectedWBS(wbs)
    // 날짜를 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
    const startDate = wbs.start_date ? formatDate(wbs.start_date) : ''
    const endDate = wbs.end_date ? formatDate(wbs.end_date) : ''
    
    setWbsFormData({
      code: wbs.code || '',
      name: wbs.name || '',
      description: wbs.description || '',
      start_date: startDate,
      end_date: endDate,
      status: wbs.status || calculateStatusFromDates(startDate, endDate),
      progress: wbs.progress || 0,
      assigned_to: wbs.assigned_to || '',
      estimated_hours: wbs.estimated_hours || '',
      exclude_weekends: true
    })
    setShowWBSModal(true)
  }

  const handleViewWBSDetail = (wbs) => {
    setSelectedWBS(wbs)
    setShowWBSDetailModal(true)
  }

  const handleSaveWBS = async (wbsId) => {
    try {
      // 날짜 변경 시 자동 상태 계산
      const autoStatus = calculateStatusFromDates(wbsFormData.start_date, wbsFormData.end_date)
      const finalStatus = wbsFormData.status || autoStatus
      
      await axios.put(`/api/wbs/${wbsId}`, {
        ...wbsFormData,
        status: finalStatus,
        estimated_hours: wbsFormData.estimated_hours ? parseFloat(wbsFormData.estimated_hours) : null
      })
      setShowWBSModal(false)
      setSelectedWBS(null)
      fetchWBS()
      alert('WBS가 수정되었습니다.')
    } catch (error) {
      console.error('WBS 수정 실패:', error)
      alert('WBS 수정 실패')
    }
  }

  const handleQuickChangeStatus = async (wbsId, newStatus) => {
    try {
      await axios.put(`/api/wbs/${wbsId}`, {
        status: newStatus
      })
      fetchWBS()
    } catch (error) {
      console.error('상태 변경 실패:', error)
      alert('상태 변경 실패')
    }
  }

  const handleQuickAssignWorker = async (wbsId, userId) => {
    try {
      await axios.put(`/api/wbs/${wbsId}`, {
        assigned_to: userId || null
      })
      fetchWBS()
    } catch (error) {
      console.error('작업자 할당 실패:', error)
      alert('작업자 할당 실패')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm('정말 이 프로젝트를 삭제하시겠습니까?\n프로젝트와 관련된 모든 데이터(인원, WBS, 비용 등)가 함께 삭제됩니다.')) {
      return
    }
    
    try {
      await axios.delete(`/api/projects/${id}`)
      alert('프로젝트가 삭제되었습니다.')
      navigate('/')
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error)
      alert(error.response?.data?.error || '프로젝트 삭제 실패')
    }
  }

  const handleDeleteWBS = async (wbsId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await axios.delete(`/api/wbs/${wbsId}`)
      fetchWBS()
    } catch (error) {
      console.error('WBS 삭제 실패:', error)
      alert('WBS 삭제 실패')
    }
  }

  if (loading) {
    return <div className="text-center py-12">로딩 중...</div>
  }

  if (!project) {
    return <div className="text-center py-12">프로젝트를 찾을 수 없습니다.</div>
  }

  const memberCountByRole = members.reduce((acc, member) => {
    const roleName = member.role_name || '미지정'
    acc[roleName] = (acc[roleName] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      {/* 프로젝트 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {project.status === 'completed' ? '완료' :
                 project.status === 'in-progress' ? '진행중' : '계획중'}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
            )}
            <div className="text-sm text-gray-500">
              {formatDateRange(project.start_date, project.end_date)}
            </div>
          </div>
          <button
            onClick={handleDeleteProject}
            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 font-medium rounded border border-red-300 transition-all"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 예산 정보 */}
      {roi && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 전체 프로젝트 예산 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">전체 예산</div>
            <div className="text-xl font-bold text-blue-600">{formatKRW(project.expected_gain || 0)}</div>
          </div>

          {/* 실제 소요 예산 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">실제 소요</div>
            <div className="text-xl font-bold text-red-600 mb-1">{formatKRW(roi.total_cost)}</div>
            <div className="text-xs text-gray-400">
              인건비: {formatKRW(roi.labor_cost || 0)}
            </div>
          </div>

          {/* 예상 소요 예산 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">예상 소요</div>
            <div className="text-xl font-bold text-orange-600 mb-1">{formatKRW(roi.estimated_total_cost || 0)}</div>
            <div className="text-xs text-gray-400">
              예상 인건비: {formatKRW(roi.estimated_labor_cost || 0)}
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1">ROI</div>
            <div className={`text-xl font-bold ${
              roi.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {roi.roi_percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* 투입 인원 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">투입 인원</h2>
            <p className="text-sm text-gray-500 mt-1">프로젝트에 투입된 인원을 관리하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">총 {members.length}명</span>
            {!showAddMemberForm && (
              <button
                onClick={() => setShowAddMemberForm(true)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold"
              >
                <span className="text-lg">+</span>
                <span>인원 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* 투입 일수 및 예산 요약 */}
        {members.length > 0 && (() => {
          const totalDays = members.reduce((sum, member) => {
            if (!member.start_date) return sum;
            const start = new Date(member.start_date);
            const end = member.end_date ? new Date(member.end_date) : (project?.end_date ? new Date(project.end_date) : new Date());
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return sum + Math.max(0, days);
          }, 0);
          
          const totalBudget = members.reduce((sum, member) => {
            if (!member.start_date) return sum;
            const start = new Date(member.start_date);
            const end = member.end_date ? new Date(member.end_date) : (project?.end_date ? new Date(project.end_date) : new Date());
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            const dailySalary = parseFloat(member.daily_salary || 0);
            return sum + (dailySalary * Math.max(0, days));
          }, 0);
          
          return (
            <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-500">투입 일수:</span>
                  <span className="ml-1 font-semibold text-gray-900">{totalDays}일</span>
                </div>
                <div>
                  <span className="text-gray-500">투입 예산:</span>
                  <span className="ml-1 font-semibold text-gray-900">{formatKRW(totalBudget)}</span>
                </div>
                {Object.keys(memberCountByRole).length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">직급별:</span>
                    {Object.entries(memberCountByRole).map(([role, count]) => (
                      <span key={role} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {role} {count}명
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 인원 추가 폼 */}
        {showAddMemberForm && (
            <div className="p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-gray-800">인원 추가</h3>
                <button
                  onClick={() => {
                    setShowAddMemberForm(false)
                    setSelectedUser('')
                    setSelectedRole('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
                >
                  ×
                </button>
              </div>
              <form onSubmit={(e) => {
                handleAddMember(e)
                setShowAddMemberForm(false)
              }} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">사용자 *</label>
                    <select
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">선택</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">직급 *</label>
                    <select
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="">선택</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="member_exclude_weekends"
                    defaultChecked={true}
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="member_exclude_weekends" className="text-xs text-gray-600 cursor-pointer">
                    주말 및 공휴일 제외
                  </label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                    추가
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMemberForm(false)
                      setSelectedUser('')
                      setSelectedRole('')
                    }}
                    className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
        )}

        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">직급</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">기간</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/users/${member.user_id}/projects`)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {member.user_name}
                      </button>
                    </td>
                    <td className="px-3 py-2">{member.role_name}</td>
                    <td className="px-3 py-2">
                      {editingMember === member.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-1 items-center">
                            <input
                              type="date"
                              className="px-2 py-1 border border-gray-300 rounded-lg text-xs w-28 focus:ring-2 focus:ring-blue-500"
                              value={memberDates.start_date}
                              onChange={(e) => setMemberDates({ ...memberDates, start_date: e.target.value })}
                            />
                            <span className="text-xs text-gray-500">~</span>
                            <input
                              type="date"
                              className="px-2 py-1 border border-gray-300 rounded-lg text-xs w-28 focus:ring-2 focus:ring-blue-500"
                              value={memberDates.end_date}
                              onChange={(e) => setMemberDates({ ...memberDates, end_date: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`exclude_weekends_${member.id}`}
                              checked={memberDates.exclude_weekends}
                              onChange={(e) => setMemberDates({ ...memberDates, exclude_weekends: e.target.checked })}
                              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`exclude_weekends_${member.id}`} className="text-xs text-gray-600 cursor-pointer">
                              주말/공휴일 제외
                            </label>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveMember(member.id)}
                              className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 font-medium"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditingMember(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 font-medium"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">
                          {formatDateRange(member.start_date, member.end_date)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            투입된 인원이 없습니다.
          </div>
        )}
      </div>

      {/* WBS Gantt 차트 */}
      {wbsItems.length > 0 && project && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">일정 보기 (Gantt)</h2>
          <GanttChart 
            wbsItems={wbsItems} 
            project={project} 
            users={users}
            onTaskClick={handleViewWBSDetail}
          />
        </div>
      )}

      {/* WBS 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">작업 목록 (WBS)</h2>
          {!showAddWBSForm && (
            <button
              onClick={() => setShowAddWBSForm(true)}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-all"
            >
              + 작업 추가
            </button>
          )}
        </div>
        
        {/* WBS 추가 폼 */}
        {showAddWBSForm && (
          <div className="mb-3 p-4 bg-gray-50 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-gray-800">작업 추가</h3>
              <button
                onClick={() => {
                  setShowAddWBSForm(false)
                  setWbsFormData({
                    code: '',
                    name: '',
                    description: '',
                    start_date: '',
                    end_date: '',
                    status: 'not-started',
                    progress: 0,
                    assigned_to: '',
                    estimated_hours: '',
                    exclude_weekends: true
                  })
                }}
                className="text-gray-400 hover:text-gray-600 text-lg transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              handleAddWBS(e)
              setShowAddWBSForm(false)
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">코드 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 1.0"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.code}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">작업명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="작업명을 입력하세요"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.name}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">설명</label>
                <textarea
                  placeholder="작업에 대한 설명을 입력하세요"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  rows="2"
                  value={wbsFormData.description}
                  onChange={(e) => setWbsFormData({ ...wbsFormData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">시작일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={wbsFormData.start_date}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">종료일</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={wbsFormData.end_date}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wbs_exclude_weekends"
                  checked={wbsFormData.exclude_weekends}
                  onChange={(e) => setWbsFormData({ ...wbsFormData, exclude_weekends: e.target.checked })}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="wbs_exclude_weekends" className="text-xs text-gray-600 cursor-pointer">
                  주말 및 공휴일 제외
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">상태</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.status}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, status: e.target.value })}
                  >
                    <option value="not-started">시작전</option>
                    <option value="in-progress">진행중</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">작업자</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.assigned_to}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, assigned_to: e.target.value })}
                  >
                    <option value="">선택</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">예상 시간 (시간)</label>
                  <input
                    type="number"
                    placeholder="예상 작업 시간"
                    min="0"
                    step="0.5"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.estimated_hours}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, estimated_hours: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">진행률 (%)</label>
                  <input
                    type="number"
                    placeholder="0-100"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                    value={wbsFormData.progress}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddWBSForm(false)
                    setWbsFormData({
                      code: '',
                      name: '',
                      description: '',
                      start_date: '',
                      end_date: '',
                      status: 'not-started',
                      progress: 0,
                      assigned_to: '',
                      estimated_hours: '',
                      exclude_weekends: true
                    })
                  }}
                  className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {wbsItems.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">코드</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">작업명</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">기간</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">작업자</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">예상시간</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">진행률</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-12">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wbsItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <>
                        <td className="px-3 py-2">
                          <span className="text-xs text-gray-900 font-mono">{item.code}</span>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleViewWBSDetail(item)}
                            className="text-left font-medium text-blue-600 hover:text-blue-800 text-xs cursor-pointer"
                          >
                            {item.name}
                          </button>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{item.description}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {formatDateRange(item.start_date, item.end_date)}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                            item.status === 'completed' ? 'bg-green-100 text-green-700' :
                            item.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.status === 'completed' ? '완료' :
                             item.status === 'in-progress' ? '진행중' : '시작 전'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {item.status === 'not-started' ? (
                            <select
                              value={item.assigned_to || ''}
                              onChange={(e) => handleQuickAssignWorker(item.id, e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">선택</option>
                              {users.map((user) => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-gray-900">
                              {item.assigned_to ? users.find(u => u.id === item.assigned_to)?.name || '-' : '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                          {item.estimated_hours ? `${parseFloat(item.estimated_hours).toFixed(1)}h` : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 min-w-[50px] bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  item.progress === 100 ? 'bg-green-500' :
                                  item.progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                                }`}
                                style={{ width: `${item.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 w-8 text-right">{item.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block wbs-menu-container">
                            <button
                              type="button"
                              className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all focus:outline-none"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setOpenWBSMenuId(openWBSMenuId === item.id ? null : item.id)
                              }}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                            {openWBSMenuId === item.id && (
                              <div
                                className="absolute right-0 mt-1 w-20 bg-white rounded shadow-lg border border-gray-200 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setOpenWBSMenuId(null)
                                    handleEditWBS(item)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-t transition-colors"
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setOpenWBSMenuId(null)
                                    handleDeleteWBS(item.id)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-b transition-colors"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            등록된 작업이 없습니다.
          </div>
        )}
      </div>

      {/* WBS 수정 모달 */}
      {showWBSModal && selectedWBS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowWBSModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">작업 수정</h2>
                <button
                  onClick={() => {
                    setShowWBSModal(false)
                    setSelectedWBS(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                handleSaveWBS(selectedWBS.id)
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">코드 *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.code}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업명 *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.name}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세부 설명</label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    value={wbsFormData.description}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, description: e.target.value })}
                    placeholder="작업에 대한 상세 설명을 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.start_date}
                      onChange={(e) => {
                        const newStartDate = e.target.value
                        const autoStatus = calculateStatusFromDates(newStartDate, wbsFormData.end_date)
                        setWbsFormData({ 
                          ...wbsFormData, 
                          start_date: newStartDate,
                          status: autoStatus
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.end_date}
                      onChange={(e) => {
                        const newEndDate = e.target.value
                        const autoStatus = calculateStatusFromDates(wbsFormData.start_date, newEndDate)
                        setWbsFormData({ 
                          ...wbsFormData, 
                          end_date: newEndDate,
                          status: autoStatus
                        })
                      }}
                      min={wbsFormData.start_date}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wbs_modal_exclude_weekends"
                    checked={wbsFormData.exclude_weekends}
                    onChange={(e) => setWbsFormData({ ...wbsFormData, exclude_weekends: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="wbs_modal_exclude_weekends" className="text-sm text-gray-700 cursor-pointer">
                    주말 및 공휴일 제외
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.status}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, status: e.target.value })}
                    >
                      <option value="not-started">시작 전</option>
                      <option value="in-progress">진행중</option>
                      <option value="completed">완료</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업자</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.assigned_to}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, assigned_to: e.target.value })}
                    >
                      <option value="">선택</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">예상 시간 (시간)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.estimated_hours}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, estimated_hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">진행률 (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={wbsFormData.progress}
                      onChange={(e) => setWbsFormData({ ...wbsFormData, progress: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWBSModal(false)
                      setSelectedWBS(null)
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* WBS 상세 보기 모달 */}
      {showWBSDetailModal && selectedWBS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowWBSDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedWBS.name}</h2>
                <button
                  onClick={() => {
                    setShowWBSDetailModal(false)
                    setSelectedWBS(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
                  <div className="text-sm text-gray-900 font-mono">{selectedWBS.code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">세부 설명</label>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 min-h-[100px]">
                    {selectedWBS.description || '설명이 없습니다.'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">기간</label>
                    <div className="text-sm text-gray-900">{formatDateRange(selectedWBS.start_date, selectedWBS.end_date)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <div className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        selectedWBS.status === 'completed' ? 'bg-green-100 text-green-700' :
                        selectedWBS.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedWBS.status === 'completed' ? '완료' :
                         selectedWBS.status === 'in-progress' ? '진행중' : '시작 전'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업자</label>
                    <div className="text-sm text-gray-900">
                      {selectedWBS.assigned_to ? users.find(u => u.id === selectedWBS.assigned_to)?.name || '-' : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">예상 시간</label>
                    <div className="text-sm text-gray-900">
                      {selectedWBS.estimated_hours ? `${parseFloat(selectedWBS.estimated_hours).toFixed(1)}시간` : '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">진행률</label>
                    <div className="text-sm text-gray-900">{selectedWBS.progress || 0}%</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowWBSDetailModal(false)
                      handleEditWBS(selectedWBS)
                    }}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => {
                      setShowWBSDetailModal(false)
                      setSelectedWBS(null)
                    }}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
