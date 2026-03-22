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
  Mail as MailIcon,
  Phone,
  ShieldCheck,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  CircleDot
} from 'lucide-react'

const Management = () => {
  const [activeTab, setActiveTab] = useState('categories')
  const [viewMode, setViewMode] = useState('grid')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState({ name: '', color: '#3b82f6' })

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
      setNewCategory({ name: '', color: '#3b82f6' })
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Management</h1>
                <p className="text-xs text-muted-foreground">Organize your categories and team</p>
              </div>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-secondary p-1">
              <button 
                onClick={() => setViewMode('list')} 
                className={`rounded-lg p-2 transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`rounded-lg p-2 transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center gap-2 rounded-2xl bg-card p-1.5 w-fit border border-border/50 shadow-sm">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'categories' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Layers className="h-4 w-4" />
            Categories
          </button>
          <button 
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'people' 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Users className="h-4 w-4" />
            Team Members
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              {activeTab === 'categories' ? (
                <Plus className="h-4 w-4 text-primary" />
              ) : (
                <UserPlus className="h-4 w-4 text-primary" />
              )}
            </div>
            <h2 className="font-semibold text-foreground">
              {activeTab === 'categories' ? 'Add New Category' : 'Add Team Member'}
            </h2>
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
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="w-full sm:w-40">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Theme Color
                </label>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background px-4">
                  <div 
                    className="relative h-6 w-6 rounded-lg border border-border shadow-sm"
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
                className="h-11 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
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
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="h-11 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
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
                ? 'bg-primary/10 text-primary' 
                : 'bg-destructive/10 text-destructive'
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
          <CircleDot className="h-3 w-3 text-primary" />
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
                  className="group relative rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
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
                      className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="mt-4 font-semibold text-foreground">{cat.name}</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs font-mono text-muted-foreground uppercase">{cat.color}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-border/50 bg-secondary/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">Color</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="transition-colors hover:bg-secondary/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm"
                            style={{ backgroundColor: cat.color }}
                          >
                            <Layers className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-xs font-mono text-muted-foreground uppercase">{cat.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)} 
                          className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive"
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
                    className="group relative rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <img 
                          src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                          className="h-14 w-14 rounded-xl border-2 border-background shadow-md object-cover" 
                          alt={person.name} 
                        />
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background">
                          <ShieldCheck className="h-2.5 w-2.5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleDeletePerson(person.id)} 
                          className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-foreground">{person.name}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{person.email}</p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-secondary/50 p-3">
                        <p className="text-xs text-muted-foreground">Assigned</p>
                        <p className="mt-1 text-lg font-bold text-foreground">{stats.count}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 p-3">
                        <p className="text-xs text-primary">Performance</p>
                        <div className="mt-1 flex items-center gap-1">
                          <p className="text-lg font-bold text-primary">{stats.performance}%</p>
                          <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80">
                        <MailIcon className="h-4 w-4" />
                        Message
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 border-t border-border/50 pt-4">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                      <span className="text-xs font-medium text-primary">Online</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full">
                  <thead className="border-b border-border/50 bg-secondary/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Team Member</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">Assigned</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">Settled</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground">Performance</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {people.map((person) => {
                      const stats = getPersonStats(person.id)
                      return (
                        <tr key={person.id} className="transition-colors hover:bg-secondary/20">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} 
                                className="h-9 w-9 rounded-lg border border-border shadow-sm object-cover" 
                                alt={person.name} 
                              />
                              <div>
                                <h4 className="font-medium text-foreground">{person.name}</h4>
                                <p className="text-xs text-muted-foreground">{person.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-foreground">{stats.count}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-semibold text-primary">{stats.paid}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1">
                              <span className="text-sm font-semibold text-primary">{stats.performance}%</span>
                              <TrendingUp className="h-3 w-3 text-primary" />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => handleDeletePerson(person.id)} 
                                className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <button className="rounded-lg p-2 text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground">
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
