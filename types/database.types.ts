export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PlanType = 'trial' | 'monthly' | 'annual' | 'single-use' | 'none'
export type ToolName = 'humanizer' | 'paraphraser' | 'citation'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          stripe_customer_id: string | null
          current_plan: PlanType
          plan_expiry: string | null
          uses_left: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          stripe_customer_id?: string | null
          current_plan?: PlanType
          plan_expiry?: string | null
          uses_left?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          stripe_customer_id?: string | null
          current_plan?: PlanType
          plan_expiry?: string | null
          uses_left?: number
          created_at?: string
          updated_at?: string
        }
      }
      daily_usage: {
        Row: {
          id: string
          user_id: string | null
          ip_address: string | null
          tool_name: ToolName
          uses_today: number
          last_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          tool_name: ToolName
          uses_today?: number
          last_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          tool_name?: ToolName
          uses_today?: number
          last_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string | null
          price_id: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string | null
          price_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string | null
          price_id?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          tool_name: string
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tool_name: string
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tool_name?: string
          tokens_used?: number | null
          created_at?: string
        }
      }
    }
  }
}

