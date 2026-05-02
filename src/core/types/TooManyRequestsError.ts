export class TooManyRequestsError extends Error {
  constructor(public message: string = "too many requests") {
    super(message);
  }
}
