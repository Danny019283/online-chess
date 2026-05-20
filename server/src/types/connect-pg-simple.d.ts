declare module 'connect-pg-simple' {
  import { SessionData, Store } from 'express-session';

  interface ConnectPgSimpleOptions {
    pool?: any;
    tableName?: string;
    schemaName?: string;
    ttl?: number;
    createTableIfMissing?: boolean;
  }

  function connectPgSimple(session: any): any;
  export default connectPgSimple;
}
