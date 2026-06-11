export class DataNotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} data not found`);
  }
}
