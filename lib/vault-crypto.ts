const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const b64=(b:Uint8Array)=>btoa(String.fromCharCode(...b));
async function key(secret:string){return crypto.subtle.importKey('raw',bytes(secret),'AES-GCM',false,['encrypt','decrypt']);}
export async function encrypt(secret:string,owner:string,provider:string,data:unknown){const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(owner+':'+provider)},await key(secret),new TextEncoder().encode(JSON.stringify(data)));return b64(iv)+'.'+b64(new Uint8Array(cipher));}
export async function decrypt(secret:string,owner:string,provider:string,value:string){const [iv,cipher]=value.split('.');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv),additionalData:new TextEncoder().encode(owner+':'+provider)},await key(secret),bytes(cipher));return JSON.parse(new TextDecoder().decode(plain));}
