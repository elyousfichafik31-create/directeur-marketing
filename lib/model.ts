import { z } from 'zod';
import {minorUnits} from './security.ts';
export const productSchema = z.object({id:z.string().max(80),name:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(1500),price:z.number().min(0).max(100000),category:z.enum(['Porte-bébé','Coussin','Soins','Maison','Autre']),example:z.boolean().default(false),imageUrl:z.string().max(1000).optional(),source:z.enum(['manual','shopify']).optional(),syncedAt:z.string().datetime().optional(),currency:z.enum(['EUR','CHF']).optional()});
export const workspaceSchema = z.object({
 brand:z.object({name:z.string().trim().min(2).max(80),audience:z.string().trim().min(2).max(200),tone:z.enum(['Chaleureux','Élégant','Direct']),market:z.enum(['France','Suisse','Belgique']),currency:z.enum(['EUR','CHF'])}),
 policy:z.object({daily:z.number().min(0).max(10000),monthly:z.number().min(0).max(100000),paused:z.boolean()}),
 products:z.array(productSchema).max(100),
 plans:z.array(z.object({id:z.string().max(80),productId:z.string().max(80),angles:z.array(z.string().max(500)).length(3),created:z.string().datetime(),engine:z.enum(['template','openai']).optional()})).max(100),
 creatives:z.array(z.object({id:z.string().max(80),productId:z.string().max(80),title:z.string().min(1).max(100),body:z.string().max(1500),format:z.enum(['Carré','Story']),color:z.enum(['Lavande','Sauge','Sable']),status:z.enum(['Brouillon','Validé']),created:z.string().datetime(),imageId:z.string().uuid().optional()})).max(300),
 publications:z.array(z.object({id:z.string().max(80),creativeId:z.string().max(80),channel:z.enum(['Instagram','Facebook','TikTok']),date:z.string().datetime(),status:z.literal('À publier manuellement')})).max(300),
 campaigns:z.array(z.object({id:z.string().max(80),name:z.string().min(2).max(100),productId:z.string().max(80),daily:z.number().positive(),total:z.number().positive(),channel:z.enum(['Meta Ads','Google Ads','TikTok Ads']),status:z.enum(['Brouillon','En pause'])})).max(100)
});
export type Workspace = z.infer<typeof workspaceSchema>;
export type Product = z.infer<typeof productSchema>;
export type Log = {id:string;time:string;action:string};
export const initialWorkspace:Workspace={brand:{name:'Ma boutique',audience:'Jeunes parents',tone:'Chaleureux',market:'France',currency:'EUR'},policy:{daily:20,monthly:300,paused:true},products:[],plans:[],creatives:[],publications:[],campaigns:[]};
export function validateRelations(s:Workspace){
 const ids=new Set(s.products.map(p=>p.id));
 if(ids.size!==s.products.length)throw new Error('Identifiants produits dupliqués.');
 for(const list of [s.plans,s.creatives,s.campaigns]){if(new Set(list.map(i=>i.id)).size!==list.length)throw new Error('Identifiants dupliqués.'); for(const item of list)if(!ids.has(item.productId))throw new Error('Produit introuvable.');}
 const assets=new Map(s.creatives.map(c=>[c.id,c]));
 if(new Set(s.publications.map(p=>p.id)).size!==s.publications.length)throw new Error('Identifiants de publication dupliqués.');
 for(const p of s.publications){if(assets.get(p.creativeId)?.status!=='Validé')throw new Error('Validez la création avant de la planifier.');}
 minorUnits(s.policy.daily);minorUnits(s.policy.monthly);let reservedDaily=0,reservedTotal=0;
 for(const c of s.campaigns){const daily=minorUnits(c.daily),total=minorUnits(c.total);if(c.status==='Brouillon'){reservedDaily+=daily;reservedTotal+=total;}if(c.daily>s.policy.daily||c.total>s.policy.monthly||c.daily>c.total)throw new Error('Le budget de campagne dépasse vos plafonds autorisés.');}
 if(reservedDaily>minorUnits(s.policy.daily)||reservedTotal>minorUnits(s.policy.monthly))throw new Error('Le cumul des brouillons dépasse vos plafonds. Mettez un brouillon en pause ou modifiez les plafonds.');
}
export function anglesFor(p:Product,audience:string){return [`Découverte : présenter ${p.name} à ${audience.toLowerCase()}, à partir des caractéristiques fournies.`,`Usage : montrer ${p.name} dans une situation du quotidien, sans ajouter de bénéfice non vérifié.`,`Détails : expliquer le prix et les caractéristiques de ${p.name}, sans remise ni témoignage inventés.`];}

export const responseSchema=z.object({state:workspaceSchema,logs:z.array(z.object({id:z.string(),time:z.string(),action:z.string()})),revision:z.number()});
