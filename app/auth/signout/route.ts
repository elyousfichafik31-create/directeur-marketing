import {createClient} from '../../../lib/supabase/server';
export async function POST(request:Request){const origin=new URL(request.url).origin;if(request.headers.get('origin')!==origin)return new Response('Origine non autorisée',{status:403});const supabase=await createClient();await supabase.auth.signOut();return Response.redirect(origin+'/login',303);}
