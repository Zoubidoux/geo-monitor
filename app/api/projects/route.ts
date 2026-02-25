import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { brand_name, domain, country, language, competitors, workspace_id } = body

  if (!brand_name || !domain || !workspace_id) {
    return NextResponse.json({ error: 'brand_name, domain, workspace_id are required' }, { status: 400 })
  }

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('projects')
    .insert({ brand_name, domain, country, language, competitors, workspace_id })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
