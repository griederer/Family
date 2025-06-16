export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string
          settings: Json | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          created_by: string
          settings?: Json | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string
          settings?: Json | null
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'admin' | 'parent' | 'child'
          display_name: string
          joined_at: string
          permissions: Json | null
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: 'admin' | 'parent' | 'child'
          display_name: string
          joined_at?: string
          permissions?: Json | null
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'admin' | 'parent' | 'child'
          display_name?: string
          joined_at?: string
          permissions?: Json | null
        }
      }
      tasks: {
        Row: {
          id: string
          family_id: string
          title: string
          description: string | null
          assigned_to: string[]
          created_by: string
          priority: 'urgent' | 'high' | 'normal' | 'low'
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          due_time: string | null
          tags: string[]
          category: string | null
          estimated_duration: number | null
          actual_duration: number | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          description?: string | null
          assigned_to?: string[]
          created_by: string
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          tags?: string[]
          category?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          assigned_to?: string[]
          created_by?: string
          priority?: 'urgent' | 'high' | 'normal' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          due_time?: string | null
          tags?: string[]
          category?: string | null
          estimated_duration?: number | null
          actual_duration?: number | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_priority: 'urgent' | 'high' | 'normal' | 'low'
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
      family_role: 'admin' | 'parent' | 'child'
    }
  }
}