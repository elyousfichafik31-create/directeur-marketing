import 'server-only';
export function setting(name:string){return process.env[name]||'';}
export function settings(){return process.env;}
export function required(name:string){const value=setting(name);if(!value)throw new AppError(`Configuration requise : ${name}.`,503);return value;}
export {AppError} from '../errors';
import {AppError} from '../errors';
export {providerJSON} from '../provider-http';
export function baseUrl(){return required('APP_BASE_URL').replace(/\/$/,'');}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
export function errorResponse(e:unknown){return json({error:e instanceof AppError?e.message:'La demande n’a pas pu être terminée. Aucune réussite n’est confirmée.'},e instanceof AppError?e.status:500);}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');if(origin!==new URL(request.url).origin||origin!==baseUrl())throw new AppError('Origine non autorisée.',403);}
