'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Calendar, ShoppingCart, DollarSign, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { user, familyMember, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">
              Welcome back, {user?.user_metadata?.display_name?.split(' ')[0] || familyMember?.display_name || 'Family Member'}!
            </h1>
            <p className="text-sm text-muted-foreground">
              {familyMember?.role === 'admin' && 'Family Administrator'}
              {familyMember?.role === 'parent' && 'Parent'}
              {familyMember?.role === 'child' && 'Family Member'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          icon={<CheckSquare className="w-8 h-8" />}
          title="Tasks"
          description="Manage family tasks"
          href="/dashboard/tasks"
          count="3 pending"
        />
        <DashboardCard
          icon={<Calendar className="w-8 h-8" />}
          title="Calendar"
          description="View family events"
          href="/dashboard/calendar"
          count="2 today"
        />
        <DashboardCard
          icon={<ShoppingCart className="w-8 h-8" />}
          title="Grocery"
          description="Shopping lists"
          href="/dashboard/grocery"
          count="1 active"
        />
        {(familyMember?.role === 'parent' || familyMember?.role === 'admin') && (
          <DashboardCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Budget"
            description="Track expenses"
            href="/dashboard/budget"
            count="$2,450 this month"
          />
        )}
      </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="things-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Mom completed "Buy groceries"</span>
                  <span className="text-xs text-muted-foreground ml-auto">2h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Dad added "Soccer practice" to calendar</span>
                  <span className="text-xs text-muted-foreground ml-auto">4h ago</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Sarah added items to grocery list</span>
                  <span className="text-xs text-muted-foreground ml-auto">1d ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="things-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start text-sm h-9" variant="ghost">
                <CheckSquare className="w-4 h-4 mr-3" />
                Add New Task
              </Button>
              <Button className="w-full justify-start text-sm h-9" variant="ghost">
                <Calendar className="w-4 h-4 mr-3" />
                Create Event
              </Button>
              <Button className="w-full justify-start text-sm h-9" variant="ghost">
                <ShoppingCart className="w-4 h-4 mr-3" />
                Add to Grocery List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ 
  icon, 
  title, 
  description, 
  href, 
  count 
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  count: string
}) {
  return (
    <Link href={href}>
      <Card className="things-shadow transition-things hover:shadow-lg cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-muted-foreground">{icon}</div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{count}</span>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}