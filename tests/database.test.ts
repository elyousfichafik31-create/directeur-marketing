import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq,and,sql} from 'drizzle-orm';
import * as tables from '../db/schema.ts';
const alice='11111111-1111-4111-8111-111111111111',bob='22222222-2222-4222-8222-222222222222';
test('PostgreSQL migration, atomic revisions, OAuth consumption and RLS',async()=>{
 const pg=new PGlite();try{await pg.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 await pg.exec(await readFile(new URL('../supabase/migrations/20261020140000_marketmate_init.sql',import.meta.url),'utf8'));
 const result=await pg.query<{n:number}>('select count(*)::int as n from pg_tables where schemaname=$1',['marketmate']);assert.equal(result.rows[0].n,7);
 await pg.query('insert into auth.users(id) values($1),($2)',[alice,bob]);const db=drizzle(pg,{schema:tables});
 await db.insert(tables.workspaces).values([{owner:alice,payload:'{"owner":"alice"}',updatedAt:'now'},{owner:bob,payload:'{"owner":"bob"}',updatedAt:'now'}]);
 const updated=await db.update(tables.workspaces).set({revision:1}).where(and(eq(tables.workspaces.owner,alice),eq(tables.workspaces.revision,0))).returning();assert.equal(updated.length,1);
 const stale=await db.update(tables.workspaces).set({revision:2}).where(and(eq(tables.workspaces.owner,alice),eq(tables.workspaces.revision,0))).returning();assert.equal(stale.length,0);
 assert.equal((await db.select().from(tables.workspaces).where(eq(tables.workspaces.owner,bob)))[0].revision,0);
 await db.insert(tables.oauthStates).values({nonce:'one-use',owner:alice,provider:'shopify',target:'pilot.myshopify.com',expiresAt:Date.now()+600000});
 assert.equal((await db.delete(tables.oauthStates).where(and(eq(tables.oauthStates.nonce,'one-use'),eq(tables.oauthStates.owner,bob))).returning()).length,0);
 assert.equal((await db.delete(tables.oauthStates).where(and(eq(tables.oauthStates.nonce,'one-use'),eq(tables.oauthStates.owner,alice))).returning()).length,1);
 assert.equal((await db.delete(tables.oauthStates).where(eq(tables.oauthStates.nonce,'one-use')).returning()).length,0);
 await db.insert(tables.dailyUsage).values({id:'quota',owner:alice,count:0});let successes=0;for(let i=0;i<6;i++){const rows=await db.update(tables.dailyUsage).set({count:sql`${tables.dailyUsage.count}+1`}).where(and(eq(tables.dailyUsage.id,'quota'),sql`${tables.dailyUsage.count}<3`)).returning();successes+=rows.length;}assert.equal(successes,3);
 await pg.exec('set role authenticated');await assert.rejects(()=>pg.query('select * from marketmate.integrations'));await pg.exec('reset role');
 await pg.exec('grant usage on schema marketmate to authenticated;grant select on marketmate.workspaces to authenticated;set role authenticated');await pg.query("select set_config('request.jwt.claim.sub',$1,false)",[alice]);
 const visible=await pg.query<{owner:string}>('select owner from marketmate.workspaces');assert.deepEqual(visible.rows.map(r=>r.owner),[alice]);await assert.rejects(()=>pg.query('select * from marketmate.integrations'));await pg.exec('reset role');
 const bucket=await pg.query<{public:boolean}>("select public from storage.buckets where id='marketmate-media'");assert.equal(bucket.rows[0].public,false);
 }finally{await pg.close();}
});
