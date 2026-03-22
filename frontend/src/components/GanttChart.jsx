import { useMemo, useState } from 'react'

// 주말 제외 날짜 배열 생성
const getWorkDays = (startDate, endDate, excludeWeekends = true) => {
  const days = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(start)
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      days.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }
  return days
}

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateString = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 날짜가 특정 날짜 범위에 포함되는지 확인
const isDateInRange = (date, startDate, endDate) => {
  if (!startDate) return false
  const dateStr = formatDateString(date)
  const start = formatDateString(startDate)
  const end = endDate ? formatDateString(endDate) : formatDateString(new Date())
  
  return dateStr >= start && dateStr <= end
}

export default function GanttChart({ wbsItems, project, users, onTaskClick }) {
  // 프로젝트 기간 계산
  const projectDates = useMemo(() => {
    if (!project || !project.start_date) return []
    const endDate = project.end_date || new Date().toISOString().split('T')[0]
    return getWorkDays(project.start_date, endDate, true)
  }, [project])

  // WBS 항목을 레벨별로 그룹화
  const groupedWBS = useMemo(() => {
    const groups = {}
    wbsItems.forEach(item => {
      const level = item.level || 1
      if (!groups[level]) {
        groups[level] = []
      }
      groups[level].push(item)
    })
    return groups
  }, [wbsItems])

  // 날짜를 주 단위로 그룹화
  const weekGroups = useMemo(() => {
    if (projectDates.length === 0) return []
    
    const weeks = []
    let currentWeek = []
    let currentWeekStart = null
    
    projectDates.forEach((date, index) => {
      const dayOfWeek = date.getDay()
      const isMonday = dayOfWeek === 1
      
      if (isMonday && currentWeek.length > 0) {
        weeks.push({
          start: currentWeekStart,
          dates: currentWeek,
          weekNumber: weeks.length + 1
        })
        currentWeek = []
        currentWeekStart = date
      }
      
      if (currentWeek.length === 0) {
        currentWeekStart = date
      }
      
      currentWeek.push(date)
      
      // 마지막 날짜 처리
      if (index === projectDates.length - 1) {
        weeks.push({
          start: currentWeekStart,
          dates: currentWeek,
          weekNumber: weeks.length + 1
        })
      }
    })
    
    return weeks
  }, [projectDates])

  // 날짜 포맷팅 (MM/DD)
  const formatDateShort = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  // 요일 약자
  const getDayAbbr = (date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return days[date.getDay()]
  }

  if (projectDates.length === 0) {
    return <div className="text-center py-8 text-gray-500 text-sm">프로젝트 기간 정보가 없습니다.</div>
  }

  if (wbsItems.length === 0) {
    return <div className="text-center py-8 text-gray-500 text-sm">등록된 작업이 없습니다.</div>
  }

  // 모든 레벨의 WBS 항목을 평탄화하여 표시
  const allWBSItems = Object.values(groupedWBS).flat().sort((a, b) => {
    // 레벨별, 코드별로 정렬
    if ((a.level || 1) !== (b.level || 1)) return (a.level || 1) - (b.level || 1)
    return (a.code || '').localeCompare(b.code || '')
  })

  return (
    <div>
      {/* 범례 (Legend) */}
      <div className="mb-4 flex items-center gap-6 text-xs bg-gray-50 p-3 rounded-lg">
        <div className="font-semibold text-gray-700">상태 범례:</div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">진행중 (시작~종료일 설정)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-blue-500 rounded"></div>
          <span className="text-gray-600">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">기간 연장됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-3 bg-gray-400 rounded"></div>
          <span className="text-gray-600">대기</span>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <div className="min-w-full inline-block">
        {/* 헤더 */}
        <div className="flex border-b-2 border-gray-300">
          {/* 왼쪽 헤더 - 스크롤 시에도 고정 */}
          <div className="flex-shrink-0 bg-blue-600 text-white rounded-tl-lg sticky left-0 z-20" style={{ width: '450px' }}>
            <div className="grid grid-cols-6 gap-0 text-xs font-semibold">
              <div className="px-3 py-2 border-r border-blue-500">코드</div>
              <div className="px-3 py-2 border-r border-blue-500 col-span-2">작업명</div>
              <div className="px-3 py-2 border-r border-blue-500">작업자</div>
              <div className="px-3 py-2 border-r border-blue-500">시작일</div>
              <div className="px-3 py-2">종료일</div>
            </div>
          </div>
          
          {/* 오른쪽 타임라인 헤더 */}
          <div className="flex-1 bg-green-50 border-l border-gray-300">
            <div className="flex">
              {weekGroups.map((week, weekIndex) => (
                <div key={weekIndex} className="flex-1 border-r border-gray-300 last:border-r-0">
                  <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 text-center">
                    Phase {weekIndex + 1}
                  </div>
                  <div className="bg-green-100 text-blue-700 text-xs font-medium px-2 py-1 text-center border-b border-green-200">
                    Week {week.weekNumber}
                  </div>
                  <div className="flex">
                    {week.dates.map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className="flex-1 border-r border-gray-200 last:border-r-0 text-center"
                        style={{ minWidth: '40px' }}
                      >
                        <div className="text-xs text-blue-700 font-medium px-1 py-1 border-b border-gray-200">
                          {getDayAbbr(date)}
                        </div>
                        <div className="text-xs text-gray-600 px-1 py-0.5">
                          {formatDateShort(date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 바디 */}
        <div className="border border-t-0 border-gray-300">
          {allWBSItems.map((item, itemIndex) => {
            const startDate = item.start_date ? new Date(item.start_date) : null
            const endDate = item.end_date ? new Date(item.end_date) : null
            const assignedUser = users.find(u => u.id === item.assigned_to)
            
            // 시작 위치 계산
            let startCol = 0
            let spanCols = 0
            
            if (startDate && endDate) {
              weekGroups.forEach((week, weekIndex) => {
                week.dates.forEach((date, dateIndex) => {
                  if (isDateInRange(date, item.start_date, item.end_date)) {
                    if (spanCols === 0) {
                      // 첫 날짜의 위치 계산
                      let colIndex = 0
                      for (let w = 0; w < weekIndex; w++) {
                        colIndex += weekGroups[w].dates.length
                      }
                      startCol = colIndex + dateIndex
                    }
                    spanCols++
                  }
                })
              })
            }

            // 색상 구분 로직
            // 1. 완료된 작업 → 파란색
            // 2. 기간 연장된 작업 → 노란색 (original_end_date가 있고 end_date보다 이전인 경우)
            // 3. 진행 중 작업 → 빨간색
            const isExtended = item.original_end_date && 
                               item.end_date && 
                               new Date(item.original_end_date) < new Date(item.end_date)
            
            const statusColor = 
              item.status === 'completed' ? 'bg-blue-500' : // 완료: 파란색
              isExtended ? 'bg-yellow-500' :                 // 연장: 노란색
              item.status === 'in-progress' ? 'bg-red-500' : // 진행중: 빨간색
              'bg-gray-400'                                  // 기타: 회색
            
            const statusText = 
              item.status === 'completed' ? '완료' :
              isExtended ? '연장' :
              item.status === 'in-progress' ? '진행중' :
              '대기'

            return (
              <div
                key={item.id}
                className={`flex border-b border-gray-200 hover:bg-gray-50 ${
                  (item.level || 1) === 1 ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                {/* 왼쪽 작업 정보 - 스크롤 시에도 고정 */}
                <div className={`flex-shrink-0 grid grid-cols-6 gap-0 sticky left-0 z-10 ${
                  (item.level || 1) === 1 ? 'bg-blue-50' : 'bg-white'
                }`} style={{ width: '450px' }}>
                  <div className={`px-3 py-2 text-xs border-r border-gray-200 ${
                    (item.level || 1) === 1 ? 'text-blue-700 font-bold' : 'text-gray-900'
                  }`}>
                    {item.code}
                  </div>
                  <div className="px-3 py-2 text-xs border-r border-gray-200 col-span-2">
                    <button
                      onClick={() => onTaskClick && onTaskClick(item)}
                      className="text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer w-full truncate"
                      title={`${item.name} [${statusText}]`}
                    >
                      {item.name}
                    </button>
                  </div>
                  <div className="px-3 py-2 text-xs border-r border-gray-200 text-gray-600">
                    {assignedUser ? assignedUser.name : '-'}
                  </div>
                  <div className="px-3 py-2 text-xs border-r border-gray-200 text-gray-600">
                    {item.start_date ? formatDateShort(new Date(item.start_date)) : '-'}
                  </div>
                  <div className="px-3 py-2 text-xs text-gray-600">
                    {item.end_date ? formatDateShort(new Date(item.end_date)) : '-'}
                  </div>
                </div>

                {/* 오른쪽 타임라인 */}
                <div className="flex-1 flex border-l border-gray-300 relative">
                  {weekGroups.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex-1 flex border-r border-gray-200 last:border-r-0">
                      {week.dates.map((date, dateIndex) => {
                        const dateStr = formatDateString(date)
                        const startStr = formatDateString(item.start_date)
                        const endStr = formatDateString(item.end_date)
                        const isInRange = item.start_date && dateStr >= startStr && (!endStr || dateStr <= endStr)
                        
                        // 같은 주 내에서 첫 번째/마지막 날짜 확인
                        const weekStartStr = formatDateString(week.dates[0])
                        const weekEndStr = formatDateString(week.dates[week.dates.length - 1])
                        const isFirstInWeek = dateIndex === 0 && dateStr === startStr
                        const isLastInWeek = dateIndex === week.dates.length - 1 && dateStr === endStr
                        const isFirstDay = dateStr === startStr
                        const isLastDay = dateStr === endStr
                        
                        return (
                          <div
                            key={dateIndex}
                            className="flex-1 border-r border-gray-100 last:border-r-0 relative"
                            style={{ minWidth: '40px', height: '40px' }}
                          >
                            {isInRange && (
                              <div
                                className={`absolute top-0 bottom-0 ${statusColor} opacity-90 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-100 transition-all`}
                                style={{
                                  left: isFirstDay ? '0' : '-1px',
                                  right: isLastDay ? '0' : '-1px',
                                  zIndex: 1,
                                  borderRadius: isFirstDay && isLastDay ? '4px' : isFirstDay ? '4px 0 0 4px' : isLastDay ? '0 4px 4px 0' : '0'
                                }}
                                title={`${item.name}\n상태: ${statusText}\n기간: ${startStr} ~ ${endStr || '진행중'}${isExtended ? '\n⚠️ 기간 연장됨' : ''}`}
                                onClick={() => onTaskClick && onTaskClick(item)}
                              >
                                {isFirstDay && <span className="text-xs font-bold">{statusText}</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </div>
  )
}

