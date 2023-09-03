## Astra Data Store

Create keyspace `feedo_dev`, `feedo_preview` and `feedo_prod` (for corresponding Vercel environments)

schema

```sql
use feedo_dev;
use feedo_preview;
use feedo_prod;

CREATE TABLE bilibili (
  key text,
  p0 text,
  data text,
  PRIMARY KEY (key, p0)
) WITH CLUSTERING ORDER BY (p0 DESC);
```

| key        | p0                                                 | data                         |
| ---------- | -------------------------------------------------- | ---------------------------- |
| {mid}-meta | 'info'                                             | '{"title":"x", "...":"..."}' |
| {mid}-meta | 'infoLastFetchedAt'                                | '1693730304249'              |
| {mid}-meta | 'itemLastFetchedAt'                                | '1693730304249'              |
| {mid}-item | '2023-08-31T04:00:00.000Z' (`item.date_published`) | entry                        |


**Add environment variables on Vercel**

```bash
BILIBILI_ASTRA_DB_ID=
BILIBILI_ASTRA_REGION=
BILIBILI_ASTRA_KEYSPACE=
BILIBILI_ASTRA_APP_TOKEN=
```
