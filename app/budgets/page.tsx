'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import type { Budget, Process } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react'

export default function BudgetsPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [processes, setProcesses] = useState<Process[]>([])

  useEffect(() => {
    loadBudgets()
    loadProcesses()
  }, [])

  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          processes (
            title,
            title_ur,
            category
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBudgets(data || [])
    } catch (error) {
      console.error('Error loading budgets:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'voting':
        return 'bg-blue-100 text-blue-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'approved':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat(language === 'ur' ? 'ur-PK' : 'en-PK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgress = (budget: Budget) => {
    const now = new Date()
    const start = new Date(budget.start_date)
    const end = new Date(budget.end_date)
    
    if (now < start) return 0
    if (now > end) return 100
    
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('participatoryBudgets')}
                </h1>
                <p className="mt-2 text-gray-600">
                  {t('participatoryBudgetsDescription')}
                </p>
              </div>
              {user && (
                <Link 
                  href="/budgets/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('createBudget')}
                </Link>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('totalBudgets')}</p>
                  <p className="text-2xl font-bold text-gray-900">{budgets.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('activeBudgets')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {budgets.filter(b => b.status === 'active' || b.status === 'voting').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('totalValue')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.total_amount, 0))}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{t('thisYear')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {budgets.filter(b => b.fiscal_year === new Date().getFullYear()).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budget List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{t('budgetList')}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {budgets.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('noBudgets')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('noBudgetsDescription')}
                  </p>
                  {user && (
                    <Link 
                      href="/budgets/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('createFirstBudget')}
                    </Link>
                  )}
                </div>
              ) : (
                budgets.map((budget) => (
                  <div key={budget.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link 
                          href={`/budgets/${budget.id}`}
                          className="block hover:text-blue-600"
                        >
                          <h3 className="text-lg font-medium text-gray-900">
                            {language === 'ur' && budget.title_ur ? budget.title_ur : budget.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'ur' && budget.description_ur ? budget.description_ur : budget.description}
                          </p>
                        </Link>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                            {t(budget.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {t('fiscalYear')}: {budget.fiscal_year}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(budget.total_amount, budget.currency)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgress(budget)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {getProgress(budget)}% {t('complete')}
                          </p>
                        </div>
                      </div>
                      <div className="ml-6">
                        <Link 
                          href={`/budgets/${budget.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {t('viewDetails')} →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}