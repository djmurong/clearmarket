-- Run this in Supabase SQL Editor to align the `news` table
-- with Finnhub ingestion fields used by backend/jobs/newsSync.js.

alter table if exists news add column if not exists finnhub_id bigint unique;
alter table if exists news add column if not exists title text default '';
alter table if exists news add column if not exists summary text default '';
alter table if exists news add column if not exists url text default '';
alter table if exists news add column if not exists source text default 'Unknown';
alter table if exists news add column if not exists category text default 'general';
alter table if exists news add column if not exists published_at timestamptz;
alter table if exists news add column if not exists publish_date timestamptz;
alter table if exists news add column if not exists image_url text;
alter table if exists news add column if not exists symbols text[] default '{}';
alter table if exists news add column if not exists hotness_score numeric default 0;

create index if not exists idx_news_finnhub_id on news (finnhub_id);
create index if not exists idx_news_published_at on news (published_at desc);
create index if not exists idx_news_hotness_score on news (hotness_score desc);
