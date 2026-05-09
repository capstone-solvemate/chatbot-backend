export class ConflictError extends Error {
  constructor(public field: string) {
    super("ConflictError");
  }
}
