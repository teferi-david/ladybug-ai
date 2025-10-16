import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: '1.0.0-fixed-405',
    buildTime: process.env.BUILD_TIME || 'unknown',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  }

  return NextResponse.json({
    status: 'deployed',
    message: 'Latest deployment is active',
    deployment: deploymentInfo,
    cacheStatus: 'fresh'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Deployment-Check': 'true',
      'X-Cache-Bust': 'true'
    }
  })
}

export async function POST(request: NextRequest) {
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    version: '1.0.0-fixed-405',
    buildTime: process.env.BUILD_TIME || 'unknown',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  }

  return NextResponse.json({
    status: 'deployed',
    message: 'Latest deployment is active - POST method working',
    deployment: deploymentInfo,
    cacheStatus: 'fresh'
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Deployment-Check': 'true',
      'X-Cache-Bust': 'true'
    }
  })
}
