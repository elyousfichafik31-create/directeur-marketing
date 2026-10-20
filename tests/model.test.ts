import test from 'node:test';
import assert from 'node:assert/strict';
import {initialWorkspace,workspaceSchema,validateRelations,anglesFor,type Workspace} from '../lib/model.ts';
const product={id:'p1',name:'Produit test',description:'Caractéristiques vérifiées du produit.',price:89,category:'Autre' as const,example:false};
function state():Workspace{return {...structuredClone(initialWorkspace),products:[product]};}
function campaign(s:Workspace,daily=10,total=100){s.campaigns.push({id:'c'+s.campaigns.length,name:'Campagne test',productId:'p1',daily,total,channel:'Meta Ads',status:'Brouillon'});return s;}
test('valid bounded draft',()=>{assert.doesNotThrow(()=>validateRelations(workspaceSchema.parse(campaign(state()))));});
test('reject campaign above daily limit',()=>assert.throws(()=>validateRelations(campaign(state(),21,100))));
test('reject campaign above monthly limit',()=>assert.throws(()=>validateRelations(campaign(state(),10,301))));
test('reject inconsistent total',()=>assert.throws(()=>validateRelations(campaign(state(),20,10))));
test('reject missing product',()=>{const s=campaign(state());s.products=[];assert.throws(()=>validateRelations(s));});
test('reject duplicate product IDs',()=>{const s=state();s.products.push(product);assert.throws(()=>validateRelations(s));});
test('require validated creative before scheduling',()=>{const s=state();s.publications=[{id:'post',creativeId:'missing',date:new Date().toISOString(),channel:'Instagram',status:'À publier manuellement'}];assert.throws(()=>validateRelations(s));});
test('reject negative, nonfinite and arbitrary status input',()=>{const s=state();s.policy.daily=-1;assert.equal(workspaceSchema.safeParse(s).success,false);s.policy.daily=Infinity;assert.equal(workspaceSchema.safeParse(s).success,false);});
test('angles use product facts without inventing benefits',()=>{const a=anglesFor(product,'Jeunes parents');assert.equal(a.length,3);assert.ok(a.every(t=>t.includes(product.name)));});
test('combined draft budgets cannot bypass daily cap',()=>{const s=campaign(campaign(state(),12,100),12,100);assert.throws(()=>validateRelations(s));});
test('combined draft budgets cannot bypass monthly cap',()=>{const s=campaign(campaign(state(),5,200),5,200);assert.throws(()=>validateRelations(s));});
test('paused drafts do not reserve planned budgets',()=>{const s=campaign(campaign(state(),10,200),10,200);s.campaigns[0].status='En pause';assert.doesNotThrow(()=>validateRelations(s));});
test('fractional cent budgets are rejected',()=>assert.throws(()=>validateRelations(campaign(state(),1.001,100))));
test('duplicate publication identifiers are rejected',()=>{const s=state();s.creatives=[{id:'asset',productId:'p1',title:'Titre',body:'Contenu',color:'Sauge',format:'Carré',status:'Validé',created:new Date().toISOString()}];const p={id:'post',creativeId:'asset',date:new Date().toISOString(),channel:'Instagram' as const,status:'À publier manuellement' as const};s.publications=[p,p];assert.throws(()=>validateRelations(s));});
