'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useLanguage } from '@/components/language-provider'
import { MainNav } from '@/components/main-nav'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/footer'
import { supabase } from '@/lib/supabase'
import type { Budget, BudgetCategory, BudgetVote, BudgetVoteAllocation, BudgetAllocationSummary } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, Vote, Save, AlertCircle } from 'lucide-react'

interface BudgetWithCategories extends Budget {
  categories: BudgetCategory[]
  allocation_summary?: BudgetAllocationSummary[]
}

export default function BudgetDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  
  const [budget, setBudget] = useState<BudgetWithCategories | null>(null)
  const [loading, setLoading] = useState(true)
  const [votingMode, setVotingMode] = useState(false)
  const [userVote, setUserVote] = useState<BudgetVote | null>(null)
  const [allocations, setAllocations] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [totalAllocated, setTotalAllocated] = useState(0)

  useEffect(() => {
    if (id) {
      loadBudget()
      if (user) {
        loadUserVote()
      }
    }
  }, [id, user])

  useEffect(() => {
    const total = Object.values(allocations).reduce((sum, amount) => sum + amount, 0)
    setTotalAllocated(total)
  }, [allocations])

  const loadBudget = async () => {
    try {
      // Load budget with categories
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          processes (
            title,
            title_ur
          )
        `)
        .eq('id', id)
        .single()

      if (budgetError) throw budgetError

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', id)
        .order('order_index')

      if (categoriesError) throw categoriesError

      // Load allocation summary
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_budget_allocation_summary', { budget_uuid: id })

      if (summaryError) console.error('Summary error:', summaryError)

      setBudget({
        ...budgetData,
        categories: categoriesData || [],
        allocation_summary: summaryData || []
      })
    } catch (error) {
      console.error('Error loading budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserVote = async () => {
    try {
      const { data: voteData, error: voteError } = await supabase
        .from('budget_votes')
        .select(`
          *,
          budget_vote_allocations (
            category_id,
            amount
          )
        `)
        .eq('budget_id', id)
        .eq('user_id', user!.id)
        .single()

      if (voteData) {
        setUserVote(voteData)
        
        // Set current allocations
        const currentAllocations: Record<string, number> = {}
        voteData.budget_vote_allocations?.forEach((allocation: any) => {
          currentAllocations[allocation.category_id] = allocation.amount
        })
        setAllocations(currentAllocations)
      }
    } catch (error) {
      // User hasn't voted yet - this is normal
      console.log('No existing vote found')
    }
  }

  const handleAllocationChange = (categoryId: string, amount: number) => {
    setAllocations(prev => ({
      ...prev,
      [categoryId]: Math.max(0, amount)
    }))
  }

  const resetAllocations = () => {
    if (!budget) return
    
    const suggested: Record<string, number> = {}
    budget.categories.forEach(category => {
      suggested[category.id] = category.suggested_amount || 0
    })
    setAllocations(suggested)
  }

  const saveVote = async () => {
    if (!user || !budget) return

    setSaving(true)
    try {
      let voteId = userVote?.id

      if (!voteId) {
        // Create new vote
        const { data: newVote, error: voteError } = await supabase
          .from('budget_votes')
          .insert({
            budget_id: budget.id,
            user_id: user.id
          })
          .select()
          .single()

        if (voteError) throw voteError
        voteId = newVote.id
        setUserVote(newVote)
      }

      // Delete existing allocations
      await supabase
        .from('budget_vote_allocations')
        .delete()
        .eq('vote_id', voteId)

      // Insert new allocations
      const allocationData = Object.entries(allocations)
        .filter(([_, amount]) => amount > 0)
        .map(([categoryId, amount]) => ({
          vote_id: voteId,
          category_id: categoryId,
          amount: amount
        }))

      if (allocationData.length > 0) {
        const { error: allocError } = await supabase
          .from('budget_vote_allocations')
          .insert(allocationData)

        if (allocError) throw allocError
      }

      setVotingMode(false)
      loadBudget() // Refresh to show updated summary
      alert(t('voteSubmittedSuccessfully'))
    } catch (error) {
      console.error('Error saving vote:', error)
      alert(t('errorSavingVote'))
    } finally {
      setSaving(false)
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

  const getProgress = () => {
    if (!budget) return 0
    const now = new Date()
    const start = new Date(budget.start_date)
    const end = new Date(budget.end_date)
    
    if (now < start) return 0
    if (now > end) return 100
    
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    return Math.round((elapsed / total) * 100)
  }

  const getRemainingAmount = () => {
    return budget ? budget.total_amount - totalAllocated : 0
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('budgetNotFound')}</h1>
          <Link href="/budgets" className="text-blue-600 hover:text-blue-800">
            {t('backToBudgets')}
          </Link>
        </div>
      </div>
    )
  }

  const canVote = user && budget.status === 'active'
  const isOverBudget = totalAllocated > budget.total_amount
  const progress = getProgress()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary mr-8">
                hum awaz
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/budgets"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToBudgets')}
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {language === 'ur' && budget.title_ur ? budget.title_ur : budget.title}
                </h1>
                <p className="mt-2 text-gray-600">
                  {language === 'ur' && budget.description_ur ? budget.description_ur : budget.description}
                </p>
                <div className="flex items-center mt-4 space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                    {t(budget.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {t('fiscalYear')}: {budget.fiscal_year}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(budget.total_amount, budget.currency)}
                  </span>
                </div>
              </div>
              
              {canVote && !votingMode && (
                <div className="mt-4 lg:mt-0">
                  <button
                    onClick={() => setVotingMode(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    {userVote ? t('updateVote') : t('voteOnBudget')}
                  </button>
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress}% {t('complete')} • {t('ends')}: {new Date(budget.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Budget Categories */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    {votingMode ? t('allocateBudget') : t('budgetCategories')}
                  </h2>
                  {votingMode && (
                    <p className="text-sm text-gray-600 mt-1">
                      {t('allocateBudgetDescription')}
                    </p>
                  )}
                </div>
                
                <div className="p-6">
                  {votingMode && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">
                          {t('totalBudget')}: {formatCurrency(budget.total_amount, budget.currency)}
                        </span>
                        <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                          {t('remaining')}: {formatCurrency(getRemainingAmount(), budget.currency)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min((totalAllocated / budget.total_amount) * 100, 100)}%` }}
                        ></div>
                      </div>
                      {isOverBudget && (
                        <div className="flex items-center mt-2 text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span className="text-xs">{t('budgetExceeded')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-6">
                    {budget.categories.map((category) => {
                      const currentAllocation = allocations[category.id] || 0
                      const summary = budget.allocation_summary?.find(s => s.category_id === category.id)
                      const averageAllocation = summary?.average_allocation || 0
                      const voteCount = summary?.vote_count || 0

                      return (
                        <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded mr-3"
                                style={{ backgroundColor: category.color || '#3B82F6' }}
                              ></div>
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {language === 'ur' && category.name_ur ? category.name_ur : category.name}
                                </h3>
                                {category.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {language === 'ur' && category.description_ur ? category.description_ur : category.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{t('suggested')}</p>
                              <p className="font-medium">
                                {formatCurrency(category.suggested_amount || 0, budget.currency)}
                              </p>
                            </div>
                          </div>

                          {votingMode ? (
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('yourAllocation')}
                              </label>
                              <div className="flex items-center space-x-4">
                                <input
                                  type="number"
                                  min="0"
                                  max={budget.total_amount}
                                  value={currentAllocation}
                                  onChange={(e) => handleAllocationChange(category.id, Number(e.target.value))}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                                <button
                                  onClick={() => handleAllocationChange(category.id, category.suggested_amount || 0)}
                                  className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                  {t('useSuggested')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">{t('averageAllocation')}</p>
                                <p className="font-medium">
                                  {formatCurrency(averageAllocation, budget.currency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">{t('totalVotes')}</p>
                                <p className="font-medium">{voteCount}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">{t('yourVote')}</p>
                                <p className="font-medium">
                                  {currentAllocation > 0 
                                    ? formatCurrency(currentAllocation, budget.currency)
                                    : t('notVoted')
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {votingMode && (
                    <div className="mt-6 flex justify-between">
                      <div className="space-x-2">
                        <button
                          onClick={resetAllocations}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {t('useSuggestedAmounts')}
                        </button>
                        <button
                          onClick={() => setVotingMode(false)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                      <button
                        onClick={saveVote}
                        disabled={saving || isOverBudget || totalAllocated === 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? t('saving') : t('submitVote')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('budgetStats')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('totalBudget')}</p>
                      <p className="font-medium">{formatCurrency(budget.total_amount, budget.currency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('totalParticipants')}</p>
                      <p className="font-medium">
                        {budget.allocation_summary?.reduce((sum, s) => sum + s.vote_count, 0) || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('categories')}</p>
                      <p className="font-medium">{budget.categories.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-indigo-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{t('timeRemaining')}</p>
                      <p className="font-medium">{100 - progress}% {t('remaining')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Participation */}
              {user && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('yourParticipation')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('votingStatus')}</span>
                      <span className={`text-sm font-medium ${userVote ? 'text-green-600' : 'text-orange-600'}`}>
                        {userVote ? t('voted') : t('notVoted')}
                      </span>
                    </div>
                    {userVote && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('totalAllocated')}</span>
                        <span className="text-sm font-medium">
                          {formatCurrency(totalAllocated, budget.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('lastUpdated')}</span>
                      <span className="text-sm text-gray-500">
                        {userVote ? new Date(userVote.updated_at).toLocaleDateString() : t('never')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}