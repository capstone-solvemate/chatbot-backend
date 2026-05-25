export class TestGuard {
  static ensureInTestMode() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("this function can only be called in tests");
    }
  }
}
