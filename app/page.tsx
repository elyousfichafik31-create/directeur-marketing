import {redirect} from 'next/navigation';
import {requireChatGPTUser} from './chatgpt-auth';
import Dashboard from './dashboard';
export const dynamic='force-dynamic';
export default async function Page(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||!process.env.DATABASE_URL||!process.env.PILOT_OWNER_EMAIL||!process.env.TOKEN_ENCRYPTION_KEY)redirect('/setup');const user=await requireChatGPTUser('/');return <Dashboard name={user.fullName?.split(' ')[0]||''}/>;}
