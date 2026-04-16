export enum UnauthenticatedReason {
  UserNotFound,
  InvalidPassword,
}

export class UnauthenticatedError extends Error {
  constructor(
    public reason: UnauthenticatedReason,
    public email?: string,
  ) {
    super("Unauthenticated");
  }
}
