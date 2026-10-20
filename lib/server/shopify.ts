import {getIntegration,putIntegration} from './vault';
import {required,providerJSON,AppError} from './runtime';
import {shopSchema} from '../security';
import type {Product} from '../model';
export const CATALOG_QUERY=`query MarketMateCatalog($after: String) {
 shop { name currencyCode }
 products(first: 25, after: $after, query: "status:active") {
  nodes {
   id title description
   featuredMedia { preview { image { url } } }
   priceRangeV2 { minVariantPrice { amount currencyCode } }
  }
  pageInfo { hasNextPage endCursor }
 }
}`;
export async function shopifyToken(owner:string){const connection=await getIntegration(owner,'shopify');const shop=shopSchema.parse(connection.metadata.shop);let token=connection.token;if(Number(token.expiresAt)<Date.now()+120000){if(!token.refresh_token)throw new AppError('Reconnectez Shopify : le jeton a expiré.',401);const next=await providerJSON(`https://${shop}/admin/oauth/access_token`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:required('SHOPIFY_CLIENT_ID'),client_secret:required('SHOPIFY_CLIENT_SECRET'),grant_type:'refresh_token',refresh_token:token.refresh_token})});if(typeof next.access_token!=='string'||typeof next.refresh_token!=='string'||!Number.isFinite(next.expires_in))throw new AppError('Réponse de renouvellement Shopify incomplète.',502);token={...next,expiresAt:Date.now()+next.expires_in*1000};await putIntegration(owner,'shopify',token,connection.metadata);}return {shop,token};}
export async function fetchCatalog(owner:string){const {shop,token}=await shopifyToken(owner);const result:Product[]=[];let after:string|null=null;let hasMore=false;let shopName='';let currency='';for(let page=0;page<4;page++){const data=await providerJSON(`https://${shop}/admin/api/2026-07/graphql.json`,{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Access-Token':token.access_token},body:JSON.stringify({query:CATALOG_QUERY,variables:{after}})});const d=data.data;if(!d?.shop||!Array.isArray(d.products?.nodes))throw new AppError('Catalogue Shopify incomplet.',502);currency=d.shop.currencyCode;if(currency!=='EUR'&&currency!=='CHF')throw new AppError('La boutique utilise une devise non prise en charge pour le pilote (EUR/CHF).',409);shopName=String(d.shop.name);for(const p of d.products.nodes){const price=Number(p.priceRangeV2?.minVariantPrice?.amount);if(!Number.isFinite(price)||price<0||price>100000)continue;const url=p.featuredMedia?.preview?.image?.url;const safeUrl=typeof url==='string'&&new URL(url).hostname==='cdn.shopify.com'?url:undefined;result.push({id:String(p.id),name:String(p.title).slice(0,100),description:(String(p.description||'').trim().length>=10?String(p.description):'Fiche Shopify : '+String(p.description||'description non fournie.')).slice(0,1500),price,category:'Autre',example:false,source:'shopify',currency:currency as 'EUR'|'CHF',imageUrl:safeUrl,syncedAt:new Date().toISOString()});}hasMore=Boolean(d.products.pageInfo.hasNextPage);after=d.products.pageInfo.endCursor;if(!hasMore)break;}return {products:result,shopName,currency:currency as 'EUR'|'CHF',hasMore};}
