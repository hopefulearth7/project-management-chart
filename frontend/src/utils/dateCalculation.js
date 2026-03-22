// 주말 및 공휴일 제외한 작업일 계산 유틸리티

// 한국 공휴일 목록 (2024-2025)
const KOREAN_HOLIDAYS = [
  // 2024
  '2024-01-01', '2024-03-01', '2024-05-05', '2024-06-06', '2024-08-15',
  '2024-10-03', '2024-10-09', '2024-12-25',
  // 2025
  '2025-01-01', '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15',
  '2025-10-03', '2025-10-09', '2025-12-25',
  // 설날, 추석 (매년 다름, 여기서는 대략적인 날짜)
  '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', // 설날
  '2024-09-15', '2024-09-16', '2024-09-17', '2024-09-18', // 추석
  '2025-01-28', '2025-01-29', '2025-01-30', // 설날
  '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08' // 추석
]

// 주말인지 확인
export const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6 // 일요일(0) 또는 토요일(6)
}

// 공휴일인지 확인
export const isHoliday = (dateString) => {
  return KOREAN_HOLIDAYS.includes(dateString)
}

// 주말과 공휴일을 제외한 작업일 계산
export const calculateWorkingDays = (startDateString, endDateString, excludeWeekends = true) => {
  if (!startDateString) return 0
  
  const start = new Date(startDateString)
  const end = endDateString ? new Date(endDateString) : new Date()
  
  if (end < start) return 0
  
  let workingDays = 0
  const current = new Date(start)
  
  while (current <= end) {
    const dateString = current.toISOString().split('T')[0]
    const isWeekendDay = excludeWeekends && isWeekend(current)
    const isHolidayDay = isHoliday(dateString)
    
    if (!isWeekendDay && !isHolidayDay) {
      workingDays++
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  return workingDays
}

// 전체 일수 계산
export const calculateTotalDays = (startDateString, endDateString) => {
  if (!startDateString) return 0
  
  const start = new Date(startDateString)
  const end = endDateString ? new Date(endDateString) : new Date()
  
  if (end < start) return 0
  
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}



