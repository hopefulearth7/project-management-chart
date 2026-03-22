import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatKRW } from '../utils/format'

export default function ProjectBudgetTable({ projectId }) {
  const [budgetItems, setBudgetItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    task_name: '',
    labor_hours: '',
    labor_rate: '',
    materials_units: '',
    materials_unit_price: '',
    fixed_cost: '',
    actual_budget: ''
  })
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    fetchBudgetItems()
  }, [projectId])

  const fetchBudgetItems = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/budget-items`)
      setBudgetItems(response.data || [])
    } catch (error) {
      console.error('예산 항목 조회 실패:', error)
      setBudgetItems([])
    } finally {
      setLoading(false)
    }
  }

  // 카테고리별로 그룹화
  const groupedItems = budgetItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  // 카테고리별 합계 계산
  const calculateCategoryTotals = (items) => {
    const totals = items.reduce((acc, item) => {
      acc.target += parseFloat(item.target_budget || 0)
      acc.actual += parseFloat(item.actual_budget || 0)
      acc.underOver += parseFloat(item.under_over || 0)
      return acc
    }, { target: 0, actual: 0, underOver: 0 })
    return totals
  }

  // 전체 합계 계산
  const totalTarget = budgetItems.reduce((sum, item) => sum + parseFloat(item.target_budget || 0), 0)
  const totalActual = budgetItems.reduce((sum, item) => sum + parseFloat(item.actual_budget || 0), 0)
  const totalUnderOver = totalActual - totalTarget

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/projects/${projectId}/budget-items`, {
        ...formData,
        labor_hours: formData.labor_hours ? parseFloat(formData.labor_hours) : 0,
        labor_rate: formData.labor_rate ? parseFloat(formData.labor_rate.replace(/,/g, '')) : 0,
        materials_units: formData.materials_units ? parseFloat(formData.materials_units) : 0,
        materials_unit_price: formData.materials_unit_price ? parseFloat(formData.materials_unit_price.replace(/,/g, '')) : 0,
        fixed_cost: formData.fixed_cost ? parseFloat(formData.fixed_cost.replace(/,/g, '')) : 0,
        actual_budget: formData.actual_budget ? parseFloat(formData.actual_budget.replace(/,/g, '')) : 0
      })
      setShowAddForm(false)
      setFormData({
        category: '',
        task_name: '',
        labor_hours: '',
        labor_rate: '',
        materials_units: '',
        materials_unit_price: '',
        fixed_cost: '',
        actual_budget: ''
      })
      fetchBudgetItems()
    } catch (error) {
      console.error('예산 항목 추가 실패:', error)
      alert('예산 항목 추가 실패')
    }
  }

  const handleEditItem = (item) => {
    setEditingItem(item.id)
    setFormData({
      category: item.category,
      task_name: item.task_name,
      labor_hours: item.labor_hours || '',
      labor_rate: item.labor_rate ? Number(item.labor_rate).toLocaleString('ko-KR') : '',
      materials_units: item.materials_units || '',
      materials_unit_price: item.materials_unit_price ? Number(item.materials_unit_price).toLocaleString('ko-KR') : '',
      fixed_cost: item.fixed_cost ? Number(item.fixed_cost).toLocaleString('ko-KR') : '',
      actual_budget: item.actual_budget ? Number(item.actual_budget).toLocaleString('ko-KR') : ''
    })
  }

  const handleSaveItem = async (itemId) => {
    try {
      // 필수 필드 검증
      if (!formData.category || formData.category.trim() === '') {
        alert('카테고리는 필수 입력 항목입니다.')
        return
      }
      if (!formData.task_name || formData.task_name.trim() === '') {
        alert('작업명은 필수 입력 항목입니다.')
        return
      }
      
      await api.put(`/budget-items/${itemId}`, {
        category: formData.category.trim(),
        task_name: formData.task_name.trim(),
        labor_hours: formData.labor_hours ? parseFloat(formData.labor_hours) : 0,
        labor_rate: formData.labor_rate ? parseFloat(formData.labor_rate.replace(/,/g, '')) : 0,
        materials_units: formData.materials_units ? parseFloat(formData.materials_units) : 0,
        materials_unit_price: formData.materials_unit_price ? parseFloat(formData.materials_unit_price.replace(/,/g, '')) : 0,
        fixed_cost: formData.fixed_cost ? parseFloat(formData.fixed_cost.replace(/,/g, '')) : 0,
        actual_budget: formData.actual_budget ? parseFloat(formData.actual_budget.replace(/,/g, '')) : 0
      })
      setEditingItem(null)
      fetchBudgetItems()
      alert('예산 항목이 수정되었습니다.')
    } catch (error) {
      console.error('예산 항목 수정 실패:', error)
      alert(error.response?.data?.error || '예산 항목 수정 실패')
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await api.delete(`/budget-items/${itemId}`)
      fetchBudgetItems()
    } catch (error) {
      console.error('예산 항목 삭제 실패:', error)
      alert('예산 항목 삭제 실패')
    }
  }

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    setFormData({ ...formData, category: newCategory })
    setNewCategory('')
    setShowAddForm(true)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  const categories = Object.keys(groupedItems)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">프로젝트 예산</h2>
          <p className="text-sm text-gray-500 mt-1">항목별 예산을 관리하세요</p>
        </div>
        <div className="flex gap-2">
          {categories.length > 0 && (
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">카테고리 선택</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="새 카테고리"
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
            >
              + 항목 추가
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">예산 항목 추가</h3>
            <button
              onClick={() => {
                setShowAddForm(false)
                setFormData({
                  category: '',
                  task_name: '',
                  labor_hours: '',
                  labor_rate: '',
                  materials_units: '',
                  materials_unit_price: '',
                  fixed_cost: '',
                  actual_budget: ''
                })
              }}
              className="text-gray-400 hover:text-gray-600 text-lg"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleAddItem} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">비용 구분 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="예: 인건비, 자재비, 외주비"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">작업 내용 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.task_name}
                  onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                  placeholder="예: 개발자 인건비, 서버 구축비"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">인건비 시간 (시간)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.labor_hours}
                  onChange={(e) => setFormData({ ...formData, labor_hours: e.target.value })}
                  placeholder="예: 40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">인건비 단가 (원/시간)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.labor_rate}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/,/g, '')
                    if (numValue === '' || /^\d+$/.test(numValue)) {
                      setFormData({ ...formData, labor_rate: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                    }
                  }}
                  placeholder="예: 50,000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">자재 수량</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.materials_units}
                  onChange={(e) => setFormData({ ...formData, materials_units: e.target.value })}
                  placeholder="예: 10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">자재 단가 (원/단위)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.materials_unit_price}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/,/g, '')
                    if (numValue === '' || /^\d+$/.test(numValue)) {
                      setFormData({ ...formData, materials_unit_price: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                    }
                  }}
                  placeholder="예: 100,000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">기타 고정비 (원)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.fixed_cost}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/,/g, '')
                    if (numValue === '' || /^\d+$/.test(numValue)) {
                      setFormData({ ...formData, fixed_cost: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                    }
                  }}
                  placeholder="예: 1,000,000"
                />
                <p className="text-xs text-gray-500 mt-1">인건비/자재비 외 고정 비용 (예: 라이선스, 구독료)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">실제 지출 금액 (원)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900"
                  value={formData.actual_budget}
                  onChange={(e) => {
                    const numValue = e.target.value.replace(/,/g, '')
                    if (numValue === '' || /^\d+$/.test(numValue)) {
                      setFormData({ ...formData, actual_budget: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                    }
                  }}
                  placeholder="예: 2,000,000"
                />
                <p className="text-xs text-gray-500 mt-1">실제로 지출한 금액 (목표 예산과 비교용)</p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold whitespace-nowrap"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm border-collapse">
          {/* 상단 헤더 */}
          <thead>
            <tr>
              <th rowSpan="2" className="bg-blue-700 text-white px-3 py-3 text-left font-bold border border-blue-800">작업명</th>
              <th colSpan="2" className="bg-green-500 text-white px-3 py-2 text-center font-bold border border-green-600">인건비</th>
              <th colSpan="2" className="bg-green-500 text-white px-3 py-2 text-center font-bold border border-green-600">자재비</th>
              <th rowSpan="2" className="bg-blue-700 text-white px-3 py-3 text-center font-bold border border-blue-800">고정비</th>
              <th colSpan="3" className="bg-yellow-400 text-gray-900 px-3 py-2 text-center font-bold border border-yellow-500">
                <div className="flex justify-center items-center gap-4">
                  <div className="text-center">
                    <div>목표 예산</div>
                    <div className="text-xs font-normal">예산</div>
                  </div>
                  <div className="text-center">
                    <div>실제 예산</div>
                    <div className="text-xs font-normal">실제</div>
                  </div>
                  <div className="text-center">
                    <div>차이</div>
                    <div className="text-xs font-normal">초과/부족</div>
                  </div>
                </div>
              </th>
            </tr>
            <tr>
              <th className="bg-green-400 text-gray-900 px-2 py-2 text-center font-semibold border border-green-500">시간</th>
              <th className="bg-green-400 text-gray-900 px-2 py-2 text-center font-semibold border border-green-500">단가</th>
              <th className="bg-green-400 text-gray-900 px-2 py-2 text-center font-semibold border border-green-500">수량</th>
              <th className="bg-green-400 text-gray-900 px-2 py-2 text-center font-semibold border border-green-500">단가</th>
              <th className="bg-yellow-300 text-gray-900 px-2 py-2 text-center font-semibold border border-yellow-400">목표</th>
              <th className="bg-yellow-300 text-gray-900 px-2 py-2 text-center font-semibold border border-yellow-400">실제</th>
              <th className="bg-yellow-300 text-gray-900 px-2 py-2 text-center font-semibold border border-yellow-400">차이</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([category, items]) => {
              const categoryTotals = calculateCategoryTotals(items)
              return (
                <React.Fragment key={category}>
                  {/* 카테고리 헤더 */}
                  <tr>
                    <td colSpan="9" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 font-bold border border-blue-800 shadow-sm">
                      📁 {category}
                    </td>
                  </tr>
                  {/* 카테고리 항목들 */}
                  {items.map((item, idx) => (
                    <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-800">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            value={formData.task_name}
                            onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{item.task_name}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-center text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-center"
                            value={formData.labor_hours}
                            onChange={(e) => setFormData({ ...formData, labor_hours: e.target.value })}
                          />
                        ) : (
                          item.labor_hours || '-'
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-right text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-right"
                            value={formData.labor_rate}
                            onChange={(e) => {
                              const numValue = e.target.value.replace(/,/g, '')
                              if (numValue === '' || /^\d+$/.test(numValue)) {
                                setFormData({ ...formData, labor_rate: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                              }
                            }}
                          />
                        ) : (
                          item.labor_rate ? formatKRW(item.labor_rate) : '-'
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-center text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-center"
                            value={formData.materials_units}
                            onChange={(e) => setFormData({ ...formData, materials_units: e.target.value })}
                          />
                        ) : (
                          item.materials_units || '-'
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-right text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-right"
                            value={formData.materials_unit_price}
                            onChange={(e) => {
                              const numValue = e.target.value.replace(/,/g, '')
                              if (numValue === '' || /^\d+$/.test(numValue)) {
                                setFormData({ ...formData, materials_unit_price: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                              }
                            }}
                          />
                        ) : (
                          item.materials_unit_price ? formatKRW(item.materials_unit_price) : '-'
                        )}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-right text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-right"
                            value={formData.fixed_cost}
                            onChange={(e) => {
                              const numValue = e.target.value.replace(/,/g, '')
                              if (numValue === '' || /^\d+$/.test(numValue)) {
                                setFormData({ ...formData, fixed_cost: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                              }
                            }}
                          />
                        ) : (
                          item.fixed_cost ? formatKRW(item.fixed_cost) : '-'
                        )}
                      </td>
                      <td className="px-2 py-2 border border-gray-300 text-right font-semibold">
                        {formatKRW(item.target_budget || 0)}
                      </td>
                      <td className="px-3 py-2 border-b border-gray-200 text-right text-gray-700">
                        {editingItem === item.id ? (
                          <input
                            type="text"
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded text-right"
                            value={formData.actual_budget}
                            onChange={(e) => {
                              const numValue = e.target.value.replace(/,/g, '')
                              if (numValue === '' || /^\d+$/.test(numValue)) {
                                setFormData({ ...formData, actual_budget: numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR') })
                              }
                            }}
                          />
                        ) : (
                          formatKRW(item.actual_budget || 0)
                        )}
                      </td>
                      <td className={`px-2 py-2 border border-gray-300 text-right font-semibold ${
                        (item.under_over || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatKRW(item.under_over || 0)}
                      </td>
                    </tr>
                  ))}
                  {/* 카테고리 합계 */}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-3 py-2 border border-gray-300">합계</td>
                    <td colSpan="5" className="px-2 py-2 border border-gray-300"></td>
                    <td className="px-2 py-2 border border-gray-300 text-right">{formatKRW(categoryTotals.target)}</td>
                    <td className="px-2 py-2 border border-gray-300 text-right">{formatKRW(categoryTotals.actual)}</td>
                    <td className={`px-2 py-2 border border-gray-300 text-right ${
                      categoryTotals.underOver >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatKRW(categoryTotals.underOver)}
                    </td>
                  </tr>
                </React.Fragment>
              )
            })}
            {/* 전체 합계 */}
            {budgetItems.length > 0 && (
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white font-bold shadow-lg">
                <td className="px-4 py-4 border-b-2 border-blue-900 text-lg">전체 합계</td>
                <td colSpan="5" className="px-3 py-4 border-b-2 border-blue-900"></td>
                <td className="px-3 py-4 border-b-2 border-blue-900 text-right text-lg">{formatKRW(totalTarget)}</td>
                <td className="px-3 py-4 border-b-2 border-blue-900 text-right text-lg">{formatKRW(totalActual)}</td>
                <td className={`px-3 py-4 border-b-2 border-blue-900 text-right text-lg font-extrabold ${
                  totalUnderOver >= 0 ? 'text-green-200' : 'text-red-200'
                }`}>
                  {totalUnderOver >= 0 ? '+' : ''}{formatKRW(totalUnderOver)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {editingItem && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveItem(editingItem)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
              >
                저장
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold whitespace-nowrap"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {budgetItems.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">등록된 예산 항목이 없습니다.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              첫 항목 추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

