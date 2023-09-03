// import type { RequestInfo, RequestInit, Response, Headers } from "node-fetch";

// CREATE TABLE t1 (
//   key text,
//   p0 text,
//   data text,
//   PRIMARY KEY (key, p0)
// ) WITH CLUSTERING ORDER BY (p0 ASC);
//
// CREATE TABLE t2 (
//   key text,
//   p0 text,
//   data text,
//   PRIMARY KEY (key, p0)
// ) WITH CLUSTERING ORDER BY (p0 DESC);

type Fetch = (url: RequestInfo, init: RequestInit) => Promise<Response>;

type AstraOptions = {
  dbId: string;
  region: string;
  keyspace: string;
  appToken: string;
};

export interface FetcherResponse<T = any> {
  data: T;
  status: number;
  headers: any;
  // config: Partial<RequestConfig>;
  // request?: any;
}

export class FetcherError<T = any> {
  constructor(
    public readonly errMsg: any | null,
    public readonly response: FetcherResponse<T> | null
  ) {}
}

export class Astra {
  private baseUrl: string;
  private appToken: string;

  constructor(protected opts: AstraOptions, private fetch: Fetch) {
    this.baseUrl = "https://" + opts.dbId + "-" + opts.region + ".apps.astra.datastax.com/api";
    this.appToken = opts.appToken;
  }

  protected async req(opts: { uri: string; method?: string; data?: any }) {
    const init: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Cassandra-Token": this.appToken,
      },
      method: opts.method || "GET",
    };
    if (opts.data) {
      init.body = JSON.stringify(opts.data);
    }

    const op = `${init.method} ${opts.uri}`;

    let res: Response;
    try {
      res = await this.fetch(this.baseUrl + opts.uri, init);
    } catch (e) {
      throw new FetcherError(e, null);
    }

    let result: { data: any; headers: Headers; status: number };
    try {
      const headers = res.headers;
      const ct = headers.get("content-type") || "";
      let data: any;
      if (ct.slice(0, 5) === "text/") {
        data = await res.text();
      } else if (/application\/.*?json/.test(ct)) {
        data = await res.json();
      } else {
        throw new Error(`failed to parse response body of content-type ${ct}`);
      }
      result = { data, headers, status: res.status };
    } catch (e) {
      console.log(op, e)
      throw new FetcherError(e, null);
    }

    if (res.ok) {
      return result;
    } else {
      console.log(op, result)
      throw new FetcherError(null, result);
    }
  }

  public getAllKeyspaces() {
    return this.req({ uri: "/rest/v2/schemas/keyspaces" });
  }

  public getAllTables() {
    const uri = `/rest/v2/schemas/keyspaces/${this.opts.keyspace}/tables`;
    return this.req({ uri });
  }

  // public createTable() {
  //   return this.req({
  //     uri: `/rest/v2/schemas/keyspaces/${this.opts.keyspace}/tables`,
  //     method: "POST",
  //     data: {
  //       name: "test",
  //       ifNotExists: true,
  //       columnDefinitions: [
  //         { name: "key", static: false, typeDefinition: "text" },
  //         { name: "p0", static: false, typeDefinition: "text" },
  //         { name: "p1", static: false, typeDefinition: "text" },
  //         { name: "p1", static: false, typeDefinition: "text" },
  //       ],
  //       primaryKey: {
  //         partitionKey: ["key"],
  //         clusteringKey: ["p0", "p1"],
  //       },
  //       tableOptions: {
  //         clusteringExpression: [],
  //         defaultTimeToLive: 0,
  //       },
  //     },
  //   });
  // }

  public gql(opts: { query: any; variables?: any }) {
    return this.req({
      uri: `/graphql/${this.opts.keyspace}`,
      method: "POST",
      data: {
        query: opts.query,
        variables: opts.variables || {},
      },
    });
  }

  public addRow(opts: { table: string; data: Record<string, any> }) {
    const { table, data } = opts;
    const keys = Object.keys(data);
    const columns = [];
    for (let k of keys) {
      columns.push({ name: k, value: data[k] });
    }

    return this.req({
      uri: `/rest/v1/keyspaces/${this.opts.keyspace}/tables/${table}/rows`,
      method: "POST",
      data: { columns },
    });
  }

  public addRowV2(opts: { table: string; data: any }) {
    const { table } = opts;
    return this.req({
      uri: `/rest/v2/keyspaces/${this.opts.keyspace}/${table}`,
      method: "POST",
      data: opts.data,
    });
  }

  public getRows(opts: { table: string; key: string }) {
    const { table, key } = opts;
    return this.req({
      uri: `/rest/v2/keyspaces/${this.opts.keyspace}/${table}/${key}`,
    });
  }

  public query(opts: { table: string; where: any; pageSize?: number }) {
    const { table, where } = opts;
    // $eq, $ne, $in, $nin, $gt, $lt, $gte, $lte, $exists
    const qs = new URLSearchParams({ where: JSON.stringify(where) });
    if (opts.pageSize) qs.append("page-size", "" + opts.pageSize);
    return this.req({ uri: `/rest/v2/keyspaces/${this.opts.keyspace}/${table}?${qs}` });
  }
}
