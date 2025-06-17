'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ShoppingCart, Plus, Trash2, Check } from 'lucide-react'

interface GroceryItem {
  id: number
  name: string
  category: string
  completed: boolean
  addedBy: string
}

export default function GroceryPage() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([
    { id: 1, name: 'Milk', category: 'Dairy', completed: false, addedBy: 'Mom' },
    { id: 2, name: 'Bread', category: 'Bakery', completed: true, addedBy: 'Dad' },
    { id: 3, name: 'Apples', category: 'Produce', completed: false, addedBy: 'Sarah' },
    { id: 4, name: 'Chicken Breast', category: 'Meat', completed: false, addedBy: 'Mom' },
    { id: 5, name: 'Rice', category: 'Pantry', completed: true, addedBy: 'Dad' },
    { id: 6, name: 'Yogurt', category: 'Dairy', completed: false, addedBy: 'Sarah' }
  ])

  const [newItem, setNewItem] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Produce')

  const categories = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Snacks', 'Beverages']

  const toggleItem = (id: number) => {
    setGroceryItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const deleteItem = (id: number) => {
    setGroceryItems(items => items.filter(item => item.id !== id))
  }

  const addItem = () => {
    if (!newItem.trim()) return
    
    const item: GroceryItem = {
      id: Date.now(),
      name: newItem.trim(),
      category: selectedCategory,
      completed: false,
      addedBy: 'You'
    }
    
    setGroceryItems(items => [item, ...items])
    setNewItem('')
  }

  const completedItems = groceryItems.filter(item => item.completed)
  const pendingItems = groceryItems.filter(item => !item.completed)

  const groupedItems = pendingItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, GroceryItem[]>)

  const categoryColors = {
    'Produce': 'bg-green-100 text-green-800',
    'Dairy': 'bg-blue-100 text-blue-800',
    'Meat': 'bg-red-100 text-red-800',
    'Bakery': 'bg-yellow-100 text-yellow-800',
    'Pantry': 'bg-orange-100 text-orange-800',
    'Frozen': 'bg-cyan-100 text-cyan-800',
    'Snacks': 'bg-purple-100 text-purple-800',
    'Beverages': 'bg-pink-100 text-pink-800'
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Grocery List</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {completedItems.length} of {groceryItems.length} items completed
        </div>
      </div>

      {/* Add Item Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter grocery item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
              className="flex-1"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Shopping List</h2>
          
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {category}
                  </span>
                  <span>{items.length} items</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className="flex-1">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.addedBy}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {pendingItems.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Done!</h3>
                <p className="text-muted-foreground">Your grocery list is complete.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Completed Items */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed ({completedItems.length})</h2>
          
          {completedItems.length > 0 ? (
            <Card>
              <CardContent className="space-y-2 pt-6">
                {completedItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 opacity-60">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span className="flex-1 line-through">{item.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      categoryColors[item.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No completed items yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6 text-center text-muted-foreground">
        <p>Grocery list functionality is under development.</p>
        <p>Future features: Smart suggestions, store layouts, price tracking, and automatic list sharing.</p>
      </div>
    </div>
  )
}