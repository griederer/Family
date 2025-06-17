import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, CheckSquare, ShoppingCart, DollarSign } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FamilyHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize your family&apos;s tasks, calendar, groceries, and budget in one beautiful app
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <FeatureCard
            icon={<CheckSquare className="w-8 h-8" />}
            title="Task Management"
            description="Track and assign tasks with smart prioritization"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Shared Calendar"
            description="Sync family events and never miss important dates"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-8 h-8" />}
            title="Grocery Lists"
            description="Collaborative shopping with smart categorization"
          />
          <FeatureCard
            icon={<DollarSign className="w-8 h-8" />}
            title="Budget Tracking"
            description="Monitor expenses and reach financial goals together"
          />
        </div>

        <div className="text-center space-x-4">
          <Link href="/auth/signup">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Sign In
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="ghost">
              Try Demo
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="neumorphic p-6 rounded-xl transition-smooth hover:scale-105">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}