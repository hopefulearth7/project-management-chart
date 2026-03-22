// 날짜 포맷 유틸리티
export const formatDate = (dateString) => {
  if (!dateString) return '-'
  
  // ISO 형식의 날짜 문자열 처리 (시간 제거)
  const date = new Date(dateString.split('T')[0])
  
  if (isNaN(date.getTime())) {
    return dateString // 파싱 실패 시 원본 반환
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate)
  const end = endDate ? formatDate(endDate) : '진행중'
  return `${start} ~ ${end}`
}



