import {AppError} from './errors.ts';
export async function providerJSON(url:string,init:RequestInit={},timeout=25000):Promise<Record<string,any>>{
 let r:Response;try{r=await fetch(url,{...init,redirect:'error',signal:AbortSignal.timeout(timeout)});}catch{throw new AppError('Le service externe n’a pas confirmé sa réponse. Consultez le journal avant de réessayer une opération.',502);}
 const raw:unknown=await r.json().catch(()=>null);const d=raw&&typeof raw==='object'?raw as Record<string,any>:null;
 if(!r.ok||!d||d.error||d.errors){throw new AppError(r.status===429?'Limite du fournisseur atteinte. Réessayez plus tard.':r.status===401||r.status===403?'Accès refusé par le fournisseur. Vérifiez les autorisations ou reconnectez le compte.':`Le fournisseur n’a pas confirmé la requête (${r.status}).`,r.status===429?429:502);}
 return d;
}
export async function boundedBytes(body:ReadableStream<Uint8Array>|null,limit:number){if(!body)throw new AppError('Contenu absent.');const reader=body.getReader();const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new AppError('Contenu trop volumineux.',413);}chunks.push(value);}const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}return result;}
