import { MongoClient } from '../deps.ts';

const client = new MongoClient();
const username = encodeURIComponent("admin");
const password = encodeURIComponent("wvkc2Wy!hUc7xpq");
const murl =  `mongodb+srv://${username}:${password}@cluster0.8ylkhdm.mongodb.net/?retryWrites=true&w=majority&authMechanism=SCRAM-SHA-1`;

try {
  await client.connect(murl)
} catch (err) {
  console.error("Error connecting to MongoDB", err);
  throw err;
}


export const db = client.database('src-app');
const dbs = client.listDatabases();
console.log(db);

export async function run(dt:any) {
  const adm = client.database(dt);
  return adm;
}

export class DatabaseConnection {
  public client: MongoClient;
  constructor(public dbName: string, public url: string) {
    this.dbName = dbName;
    this.url = url;
    this.client = {} as MongoClient;
  }
  public connect() {
    const client = new MongoClient();
    client.connect(this.url);
    this.client = client;
  }
  public getDatabase() {
    return this.client.database(this.dbName);
  }
}
const admindb = new DatabaseConnection('src-app', murl);
admindb.connect()
export {admindb};
