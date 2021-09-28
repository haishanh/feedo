## Setup

There are several components involved for this feed.

- Cassandra database (I'm using Astra)
- Feedo
  - endpoint `/api/epicgames/offers/v1/sync` to trigger a data pull from a Epic Games and write to DB
  - endpoint `/api/epicgames/offers/v1/*` for the actual feed
- Cloudflare worker to trigger sync on a fixed schedule (Let'me know if want the source of the worker script)

Here are overall steps, there are some details down below.

1. Setup database
2. Add environment variables on Vercel
3. Deploy Cloudflare worker

**Setup database**

Create keyspace `feedo_dev`, `feedo_preview` and `feedo_prod` (for corresponding Vercel environments)

Create table `epicgames_offers` in all keyspaces.

```sql
CREATE TABLE epicgames_offers (
  key text,
  p0 text,
  data text,
  PRIMARY KEY (key, p0)
) WITH CLUSTERING ORDER BY (p0 ASC);
```

**Add environment variables on Vercel**

```bash
EPICGAMES_ASTRA_DB_ID=
EPICGAMES_ASTRA_REGION=
EPICGAMES_ASTRA_KEYSPACE=
EPICGAMES_ASTRA_APP_TOKEN=
```
