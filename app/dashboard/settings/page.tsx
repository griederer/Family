'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/hooks/useAuth'
import { Settings, User, Bell, Shield, Palette, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { user, familyMember, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    console.log('Saving profile:', { displayName })
  }

  const handleSignOut = async () => {
    try {
      // Clear demo mode if active
      if (typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true') {
        localStorage.removeItem('demo_mode')
        localStorage.removeItem('demo_user')
        localStorage.removeItem('demo_family_member')
        localStorage.removeItem('demo_tasks')
        window.location.href = '/'
        return
      }
      
      await signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Family Role</label>
              <Input
                value={familyMember?.role || 'Member'}
                disabled
                className="bg-muted capitalize"
              />
            </div>
            <Button onClick={handleSaveProfile} className="w-full">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Family Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Family Settings</CardTitle>
            <CardDescription>Manage your family organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Family Name</label>
              <Input
                value="Demo Family"
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Family ID</label>
              <Input
                value={familyMember?.family_id || 'demo-family-123'}
                disabled
                className="bg-muted font-mono text-xs"
              />
            </div>
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                Invite Family Member
              </Button>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                Manage Family Members
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Task Reminders</div>
                <div className="text-sm text-muted-foreground">Get notified about upcoming tasks</div>
              </div>
              <Button
                variant={notifications ? "default" : "outline"}
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Family Updates</div>
                <div className="text-sm text-muted-foreground">Get notified about family activity</div>
              </div>
              <Button variant="outline" size="sm">
                On
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive email summaries</div>
              </div>
              <Button variant="outline" size="sm">
                Weekly
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the app appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Switch to dark theme</div>
              </div>
              <Button
                variant={darkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Things 3 Theme</div>
                <div className="text-sm text-muted-foreground">Current theme</div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Active
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="mt-6 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Shield className="w-5 h-5" />
            <span>Account Actions</span>
          </CardTitle>
          <CardDescription>Manage your account and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-muted-foreground">
        <p>Settings functionality is under development.</p>
        <p>Future features: Advanced family management, notification preferences, theme customization, and data export.</p>
      </div>
    </div>
  )
}