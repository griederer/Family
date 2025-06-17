'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DollarSign, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react'

export default function BudgetPage() {
  const [budgetEntries, setBudgetEntries] = useState([
    { id: 1, category: 'Groceries', amount: 500, spent: 320, type: 'expense' },
    { id: 2, category: 'Utilities', amount: 200, spent: 180, type: 'expense' },
    { id: 3, category: 'Entertainment', amount: 150, spent: 95, type: 'expense' },
    { id: 4, category: 'Salary', amount: 4000, received: 4000, type: 'income' }
  ])

  const totalIncome = budgetEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + (entry.received || 0), 0)
  
  const totalExpenses = budgetEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.spent, 0)
  
  const totalBudget = budgetEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0)
  
  const remaining = totalIncome - totalExpenses

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage > 90) return 'bg-red-500'
    if (percentage > 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Family Budget</h1>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Allocated</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className={`h-4 w-4 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${remaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Track your family expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetEntries.filter(entry => entry.type === 'expense').map(entry => (
              <div key={entry.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{entry.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ${entry.spent} / ${entry.amount}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(entry.spent, entry.amount)}`}
                    style={{ width: `${Math.min((entry.spent / entry.amount) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {((entry.spent / entry.amount) * 100).toFixed(1)}% used
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Track your family income</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetEntries.filter(entry => entry.type === 'income').map(entry => (
              <div key={entry.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">{entry.category}</span>
                <span className="font-bold text-green-600">${entry.received?.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center text-muted-foreground">
        <p>Budget tracking functionality is under development.</p>
        <p>Future features: Expense tracking, receipt scanning, automated categorization, and financial goal setting.</p>
      </div>
    </div>
  )
}