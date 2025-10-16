import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Diagnostic endpoint to check if environment variables are configured
export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nlp_system: true, // Custom NLP system is always available
      stripe_secret: !!process.env.STRIPE_SECRET_KEY,
      stripe_publishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      app_url: !!process.env.NEXT_PUBLIC_APP_URL,
    },
    details: {
      supabase_url_prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'NOT SET',
      nlp_system_status: 'Custom NLP system active',
      app_url: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
      node_version: process.version,
    },
    missing: [] as string[],
  }

  // Check which variables are missing
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    // 'OPENAI_API_KEY', // No longer needed - using custom NLP
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      diagnostics.missing.push(varName)
    }
  })

  const allConfigured = diagnostics.missing.length === 0

  return NextResponse.json({
    status: allConfigured ? 'healthy' : 'missing_config',
    message: allConfigured
      ? '✅ All environment variables are configured!'
      : `❌ Missing ${diagnostics.missing.length} required environment variable(s)`,
    ...diagnostics,
  })
}

