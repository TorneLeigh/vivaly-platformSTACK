declare module 'connect-pg-simple' {
  import { Store } from 'express-session';
  function ConnectPgSimple(session: { Store: typeof Store }): typeof Store;
  export = ConnectPgSimple;
}
