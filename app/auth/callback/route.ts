import {NextResponse} from 'next/server';
import {createClient} from '../../../lib/supabase/server';
export async function GET(request:Request){const url=new URL(request.url),code=url.searchParams.get('code');const requested=url.searchParams.get('next');const next=requested==='/auth/update-password'?requested:'/';if(code){const supabase=await createClient();const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,url.origin),303);}return NextResponse.redirect(new URL('/login?error=confirmation',url.origin),303);}
