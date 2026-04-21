export class DbConfig {
  constructor(
    public host: string,
    public port: number,
    public user: string,
    public password: string,
    public dbName: string,
    public secureConn: boolean,
    public ignoreSelfSignedCert: boolean,
  ) {}
}
