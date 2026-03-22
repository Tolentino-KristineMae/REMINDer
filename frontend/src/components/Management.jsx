"use client"

import React, { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { 
  Layers, 
  Users,
  Plus,
  Trash2,
  Palette,
  LayoutGrid,
  LayoutList,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
  MoreHorizontal,
  TrendingUp,
  CircleDot
} from 'lucide-react'

const Management = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '#22c55e' })

  const [people, setPeople] = useState([])
  const [bills, setBills] = useState([])
  const [newPerson, setNewPerson] = useState({ name: '', email: '' })

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'categories') {
        const response = await api.get('/categories')
        setCategories(response.data.categories || [])
      } else {
        const response = await api.get('/bills/dashboard')
        setPeople(response.data.people || [])
        setBills(response.data.bills || [])
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab}:`, err)
    }
  }, [activeTab])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await api.post('/categories', newCategory)
      setNewCategory({ name: '', color: '#22c55e' })
      fetchData()
      setMessage({ text: 'Category added successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add category.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/categories/${id}`)
      fetchData()
      setMessage({ text: 'Category deleted successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete category.', type: 'error' })
    }
  }

  const handleAddPerson = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await api.post('/people', newPerson)
      setNewPerson({ name: '', email: '' })
      fetchData()
      setMessage({ text: 'Person added successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add person.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePerson = async (id) => {
    if (!window.confirm('Are you sure you want to delete this person?')) return
    try {
      await api.delete(`/people/${id}`)
      fetchData()
      setMessage({ text: 'Person deleted successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to delete person.', type: 'error' })
    }
  }

  const getPersonStats = useCallback((personId) => {
    const personBills = bills.filter(b => b.person_in_charge_id === personId)
    const paidCount = personBills.filter(b => b.status === 'paid').length
    const totalAmount = personBills.reduce((acc, b) => acc + parseFloat(b.amount), 0)
    return {
      count: personBills.length,
      paid: paidCount,
      total: totalAmount,
      performance: personBills.length > 0 ? Math.round((paidCount / personBills.length) * 100) : 0
    }
  }, [bills])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center gap-2 rounded-2xl bg-white p-1.5 w-fit border border-green-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'categories' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-green-50'
            }`}
          >
            <Layers className="h-4 w-4" />
            Categories
          </button>
          <button 
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'people' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-green-50'
            }`}
          >
            <Users className="h-4 w-4" />
            Team Members
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                {activeTab === 'categories' ? (
                  <Plus className="h-4 w-4 text-green-600" />
                ) : (
                  <UserPlus className="h-4 w-4 text-green-600" />
                )}
              </div>
              <h2 className="font-semibold text-foreground">
                {activeTab === 'categories' ? 'Add New Category' : 'Add Team Member'}
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5 bg-green-50 p-1 rounded-xl border border-green-100">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                title="List View"
              >
                <LayoutList size={14} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white shadow-md' : 'text-gray-400 hover:bg-green-100'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {activeTab === 'categories' ? (
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Utilities, Rent, Insurance..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>

              <div className="w-full sm:w-40">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Theme Color
                </label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4">
                  <div 
                    className="relative h-6 w-6 rounded-lg border border-gray-200 shadow-sm"
                    style={{ backgroundColor: newCategory.color }}
                  >
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground uppercase">{newCategory.color}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="h-11 rounded-xl bg-green-600 px-6 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Category
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddPerson} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="h-11 rounded-xl bg-green-600 px-6 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </>
                )}
              </button>
            </form>
          )}

          {message.text && (
            <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center gap-2">
          <CircleDot className="h-3 w-3 text-green-500" />
          <h3 className="text-sm font-medium text-muted-foreground">
            {activeTab === 'categories' ? `${categories.length} Categories` : `${people.length} Team Members`}
          </h3>
        </div>

        {activeTab === 'categories' ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="group relative rounded-2xl border border-green-100 bg-white p-5 transition-all hover:border-green-300 hover:shadow-lg hover:shadow-green-500/5"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Layers className="h-5 w-5" />
                    </div>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)} 
                      className="rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="mt-4 font-semibold text-gray-900">{cat.name}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-mono text-gray-400 uppercase">{cat.color}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-green-50 bg-green-50/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Color</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-green-50/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            <Layers className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs font-mono text-gray-500 uppercase">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)} 
                          className="rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => {
                const stats = getPersonStats(person.id)
                return (
                  <div 
                    key={person.id} 
                    className="group relative rounded-2xl border border-green-100 bg-white p-6 transition-all hover:border-green-300 hover:shadow-lg hover:shadow-green-500/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <img 
                          src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                          className="h-14 w-14 rounded-xl border-2 border-white shadow-md object-cover" 
                          alt={person.name} 
                        />
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white border-2 border-white">
                          <ShieldCheck className="h-2.5 w-2.5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDeletePerson(person.id)} 
                          className="rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900">{person.name}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{person.email}</p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-500">Assigned</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">{stats.count}</p>
                      </div>
                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="text-xs text-green-600">Performance</p>
                        <div className="mt-1 flex items-center gap-1">
                          <p className="text-lg font-bold text-green-600">{stats.performance}%</p>
                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full">
                  <thead className="border-b border-green-50 bg-green-50/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Team Member</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Assigned</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Settled</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Performance</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-50">
                    {people.map((person) => {
                      const stats = getPersonStats(person.id)
                      return (
                        <tr key={person.id} className="transition-colors hover:bg-green-50/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                                className="h-9 w-9 rounded-lg border border-gray-100 shadow-sm object-cover" 
                                alt={person.name} 
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{person.name}</h4>
                                <p className="text-xs text-gray-500">{person.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-gray-900">{stats.count}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-green-600">{stats.paid}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1">
                              <span className="text-sm font-semibold text-green-600">{stats.performance}%</span>
                              <TrendingUp className="h-3 w-3 text-green-600" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleDeletePerson(person.id)} 
                                className="rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}

export default Management
