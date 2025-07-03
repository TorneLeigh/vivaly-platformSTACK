declare module 'connect-pg-simple' {
  import session from 'express-session';
  function connectPg(session: typeof session): typeof session.Store;
  export = connectPg;
}
