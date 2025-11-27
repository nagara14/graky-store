import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories()
    
    // Return empty array if no categories, instead of error
    const result = Array.isArray(categories) ? categories : []

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('[Categories API] Error:', error)
    
    // Return empty array on error instead of 500 - graceful fallback
    return NextResponse.json(
      [],
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=0',
        },
      }
    )
  }
}
