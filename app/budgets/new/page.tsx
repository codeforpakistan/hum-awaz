'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import type { Process, BudgetCategory } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'

interface CategoryForm {
  name: string
  name_ur: string
  description: string
  description_ur: string
  icon: string
  color: string
  min_amount: number
  max_amount: number
  suggested_amount: number
  order_index: number
}

export default function NewBudgetPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [processes, setProcesses] = useState<Process[]>([])
  
  // Budget form data
  const [formData, setFormData] = useState({
    process_id: '',
    title: '',
    title_ur: '',
    description: '',
    description_ur: '',
    total_amount: 0,
    currency: 'PKR',
    fiscal_year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    status: 'draft' as const
  })

  // Categories
  const [categories, setCategories] = useState<CategoryForm[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadProcesses()
  }, [user, router])

  const loadProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .eq('status', 'active')
        .order('title')

      if (error) throw error
      setProcesses(data || [])
    } catch (error) {
      console.error('Error loading processes:', error)
    }
  }

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        name: '',
        name_ur: '',
        description: '',
        description_ur: '',
        icon: 'building',
        color: '#3B82F6',
        min_amount: 0,
        max_amount: 0,
        suggested_amount: 0,
        order_index: categories.length
      }
    ])
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const updateCategory = (index: number, field: keyof CategoryForm, value: any) => {
    const updated = [...categories]
    updated[index] = { ...updated[index], [field]: value }
    setCategories(updated)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert(t('titleRequired'))
      return false
    }
    if (!formData.description.trim()) {
      alert(t('descriptionRequired'))
      return false
    }
    if (formData.total_amount <= 0) {
      alert(t('totalAmountRequired'))
      return false
    }
    if (!formData.start_date || !formData.end_date) {
      alert(t('datesRequired'))
      return false
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert(t('endDateAfterStart'))
      return false
    }
    if (categories.length === 0) {
      alert(t('categoriesRequired'))
      return false
    }
    
    // Validate categories
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      if (!cat.name.trim()) {
        alert(t('categoryNameRequired') + ` (${i + 1})`)
        return false
      }
      if (cat.suggested_amount <= 0) {
        alert(t('categorySuggestedAmountRequired') + ` (${cat.name})`)
        return false
      }
    }

    // Check if total suggested amounts don't exceed budget
    const totalSuggested = categories.reduce((sum, cat) => sum + cat.suggested_amount, 0)
    if (totalSuggested > formData.total_amount) {
      alert(t('totalSuggestedExceedsBudget'))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // Create budget
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert({
          ...formData,
          created_by: user!.id
        })
        .select()
        .single()

      if (budgetError) throw budgetError

      // Create categories
      const categoriesData = categories.map(cat => ({
        budget_id: budget.id,
        ...cat
      }))

      const { error: categoriesError } = await supabase
        .from('budget_categories')
        .insert(categoriesData)

      if (categoriesError) throw categoriesError

      router.push(`/budgets/${budget.id}`)
    } catch (error) {
      console.error('Error creating budget:', error)
      alert(t('errorCreatingBudget'))
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = [
    'building', 'heart', 'car', 'graduation-cap', 'shield', 
    'leaf', 'users', 'zap', 'home', 'briefcase'
  ]

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary mr-8">
                Hum Awaz
              </Link>
              <MainNav />
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {!user && (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/login">
                    <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                      {t('common.login')}
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                      {t('common.register')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link 
              href="/budgets"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToBudgets')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('createNewBudget')}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('createBudgetDescription')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                {t('basicInformation')}
              </h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('linkedProcess')} ({t('optional')})
                  </label>
                  <select
                    value={formData.process_id}
                    onChange={(e) => setFormData({ ...formData, process_id: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('selectProcess')}</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {language === 'ur' && process.title_ur ? process.title_ur : process.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('title')} (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('title')} (Urdu)
                    </label>
                    <input
                      type="text"
                      value={formData.title_ur}
                      onChange={(e) => setFormData({ ...formData, title_ur: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('description')} (English) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('description')} (Urdu)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description_ur}
                      onChange={(e) => setFormData({ ...formData, description_ur: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('totalAmount')} *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('currency')}
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('fiscalYear')} *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      value={formData.fiscal_year}
                      onChange={(e) => setFormData({ ...formData, fiscal_year: Number(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('startDate')} *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('endDate')} *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {t('budgetCategories')}
                </h2>
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addCategory')}
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('noCategoriesYet')}</p>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addFirstCategory')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map((category, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-md font-medium text-gray-900">
                          {t('category')} {index + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('name')} (English) *
                          </label>
                          <input
                            type="text"
                            required
                            value={category.name}
                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('name')} (Urdu)
                          </label>
                          <input
                            type="text"
                            value={category.name_ur}
                            onChange={(e) => updateCategory(index, 'name_ur', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('description')} (English)
                          </label>
                          <textarea
                            rows={2}
                            value={category.description}
                            onChange={(e) => updateCategory(index, 'description', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('description')} (Urdu)
                          </label>
                          <textarea
                            rows={2}
                            value={category.description_ur}
                            onChange={(e) => updateCategory(index, 'description_ur', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            dir="rtl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('icon')}
                          </label>
                          <select
                            value={category.icon}
                            onChange={(e) => updateCategory(index, 'icon', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            {iconOptions.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('color')}
                          </label>
                          <div className="mt-1 flex space-x-2">
                            {colorOptions.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateCategory(index, 'color', color)}
                                className={`w-8 h-8 rounded border-2 ${category.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('suggestedAmount')} *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={category.suggested_amount}
                            onChange={(e) => updateCategory(index, 'suggested_amount', Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t('maxAmount')} ({t('optional')})
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={category.max_amount}
                            onChange={(e) => updateCategory(index, 'max_amount', Number(e.target.value))}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/budgets"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? t('creating') : t('createBudget')}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}