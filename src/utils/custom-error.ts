export class CustomError extends Error {
  constructor(
    // eslint-disable-next-line no-unused-vars
    public statusCode: number,
    message?: string
  ) {
    super(message);
  }
}
