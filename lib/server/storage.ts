import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {required,setting,AppError} from './runtime';
const BUCKET='marketmate-media';
function admin(){return createClient(required('NEXT_PUBLIC_SUPABASE_URL'),setting('SUPABASE_SECRET_KEY')||required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});}
export function storageReady(){return Boolean(setting('NEXT_PUBLIC_SUPABASE_URL')&&(setting('SUPABASE_SECRET_KEY')||setting('SUPABASE_SERVICE_ROLE_KEY')));}
export const mediaStorage={
 async put(key:string,body:Uint8Array|ArrayBuffer,options:{httpMetadata:{contentType:string}}){const {error}=await admin().storage.from(BUCKET).upload(key,body,{contentType:options.httpMetadata.contentType,upsert:false});if(error)throw new AppError('Le média n’a pas pu être enregistré dans Supabase Storage.',502);},
 async get(key:string){const {data,error}=await admin().storage.from(BUCKET).download(key);if(error||!data)return null;return {body:data.stream(),arrayBuffer:()=>data.arrayBuffer()};},
 async delete(key:string){const {error}=await admin().storage.from(BUCKET).remove([key]);if(error)throw new AppError('Le média n’a pas pu être supprimé.',502);}
};
