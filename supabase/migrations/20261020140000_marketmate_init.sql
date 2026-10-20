begin;
create schema if not exists marketmate;
revoke all on schema marketmate from public, anon, authenticated;
create table marketmate.workspaces(owner uuid primary key references auth.users(id) on delete cascade,revision integer not null default 0,payload text not null,updated_at text not null);
create table marketmate.integrations(id text primary key,owner uuid not null references auth.users(id) on delete cascade,provider text not null,ciphertext text not null,metadata text not null,updated_at text not null);
create table marketmate.oauth_states(nonce text primary key,owner uuid not null references auth.users(id) on delete cascade,provider text not null,target text not null,expires_at bigint not null);
create table marketmate.operations(id text primary key,owner uuid not null references auth.users(id) on delete cascade,kind text not null,status text not null,result text,created_at text not null);
create table marketmate.assets(id text primary key,owner uuid not null references auth.users(id) on delete cascade,object_key text not null,mime text not null,bytes integer not null check(bytes>=0),created_at text not null);
create table marketmate.daily_usage(id text primary key,owner uuid not null references auth.users(id) on delete cascade,count integer not null default 0 check(count>=0));
create table marketmate.social_publications(id text primary key,owner uuid not null references auth.users(id) on delete cascade,creative_id text not null,instagram_id text not null,caption text not null,image_url text not null,container_id text,media_id text,status text not null,created_at text not null);
create index on marketmate.integrations(owner);
create index on marketmate.oauth_states(owner);
create index on marketmate.operations(owner,created_at);
create index on marketmate.assets(owner);
create index on marketmate.social_publications(owner);
alter table marketmate.workspaces enable row level security;
alter table marketmate.integrations enable row level security;
alter table marketmate.oauth_states enable row level security;
alter table marketmate.operations enable row level security;
alter table marketmate.assets enable row level security;
alter table marketmate.daily_usage enable row level security;
alter table marketmate.social_publications enable row level security;
revoke all on all tables in schema marketmate from public,anon,authenticated;
-- Browsers cannot read secrets or mutate operational records through the Data API.
-- Next.js verifies each Supabase identity before owner-scoped queries on the server.
-- A user-scoped read policy is provided for future explicit schema exposure, with no grant enabled.
create policy workspace_owner_read on marketmate.workspaces for select to authenticated using(owner=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('marketmate-media','marketmate-media',false,16777216,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
-- No public Storage policies. Media reads/uploads go through authenticated owner-scoped server routes.
commit;
