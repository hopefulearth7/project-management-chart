// 금액 포맷팅 유틸리티 함수

/**
 * 숫자를 원화 형식으로 변환 (천 단위 구분자 포함)
 * @param {number} amount - 변환할 금액
 * @returns {string} 원화 형식 문자열 (예: "1,000,000원")
 */
export function formatKRW(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0원'
  }
  return `${Number(amount).toLocaleString('ko-KR')}원`
}

/**
 * 숫자를 원화 형식으로 변환 (원 표시 없이)
 * @param {number} amount - 변환할 금액
 * @returns {string} 숫자만 포함된 문자열 (예: "1,000,000")
 */
export function formatNumber(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0'
  }
  return Number(amount).toLocaleString('ko-KR')
}



