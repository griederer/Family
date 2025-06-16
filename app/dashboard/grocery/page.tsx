'use client'

import { ShoppingCart, Plus } from 'lucide-react'

export default function GroceryPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-muted-foreground">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold">Shopping List</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items</h3>
          <p className="text-muted-foreground mb-4">
            Your shopping list is empty
          </p>
        </div>

        {/* Add Item Button */}
        <div className="p-4 border-t border-border">
          <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </div>
  )
}