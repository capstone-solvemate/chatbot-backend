export enum UnauthenticatedReason {
  UserNotFound,
  InvalidPassword,
  InvalidToken,
  NoToken,
}

export class UnauthenticatedError extends Error {
  constructor(
    public reason: UnauthenticatedReason,
    public email?: string,
    public id?: number,
  ) {
    super("Unauthenticated");
  }
}
