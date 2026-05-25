export class TestOnlyError extends Error {
  constructor() {
    super("this function can only be called in tests");
  }
}
