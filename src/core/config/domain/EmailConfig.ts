export class EmailConfig {
  constructor(
    public host: string,
    public port: number,
    public secure: boolean,
    public user: string,
    public password: string,
    public from: string,
  ) {}
}
