'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { 
  Inbox, 
  Star, 
  Calendar, 
  Clock,
  Archive,
  ShoppingCart,
  Users,
  Folder,
  Plus,
  Settings,
  DollarSign
} from 'lucide-react'

interface SidebarItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  count?: number
  color?: string
}

interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

export function Sidebar() {
  const pathname = usePathname()

  const sections: SidebarSection[] = [
    {
      items: [
        { id: 'inbox', name: 'Inbox', icon: Inbox, href: '/dashboard/tasks', count: 7 },
        { id: 'today', name: 'Today', icon: Star, href: '/dashboard/tasks/today', count: 6 },
        { id: 'upcoming', name: 'Upcoming', icon: Calendar, href: '/dashboard/tasks/upcoming' },
        { id: 'anytime', name: 'Anytime', icon: Clock, href: '/dashboard/tasks/anytime' },
        { id: 'someday', name: 'Someday', icon: Archive, href: '/dashboard/tasks/someday' }
      ]
    },
    {
      title: 'Lists',
      items: [
        { id: 'shopping', name: 'Shopping List', icon: ShoppingCart, href: '/dashboard/grocery' },
        { id: 'family', name: 'Family & Friends', icon: Users, href: '/dashboard/family' }
      ]
    },
    {
      title: 'Personal Stuff',
      items: [
        { id: 'projects', name: 'Projects', icon: Folder, href: '/dashboard/projects' },
        { id: 'budget', name: 'Budget', icon: DollarSign, href: '/dashboard/budget' }
      ]
    }
  ]

  return (
    <div className="sidebar w-64 h-screen overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="font-semibold text-lg">FamilyHub</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            {section.title && (
              <div className="section-header">
                {section.title}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.id} href={item.href}>
                    <div className={cn(
                      'sidebar-item flex items-center justify-between group cursor-pointer',
                      isActive && 'active'
                    )}>
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      {item.count && item.count > 0 && (
                        <span className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          isActive 
                            ? 'bg-white/20 text-current' 
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {item.count}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <Link href="/dashboard/tasks">
            <button className="sidebar-item flex items-center space-x-2 text-sm">
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </Link>
          <Link href="/dashboard/settings">
            <button className="sidebar-item p-2">
              <Settings className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}