'use client'

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET'
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Environment Variables</h1>
      <div className="space-y-2">
        <p><strong>SUPABASE_URL:</strong> {supabaseUrl}</p>
        <p><strong>SUPABASE_KEY:</strong> {supabaseKey.substring(0, 20)}...</p>
      </div>
    </div>
  )
}