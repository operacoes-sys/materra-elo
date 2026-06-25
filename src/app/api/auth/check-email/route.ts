import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ exists: false });

    const { data } = await supabaseAdmin.auth.admin.listUsers();
    const found = data?.users?.some(u => u.email?.toLowerCase() === email.trim().toLowerCase());

    return NextResponse.json({ exists: !!found });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
