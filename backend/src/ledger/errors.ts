export class LedgerCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LedgerCorruptionError';
    Object.setPrototypeOf(this, LedgerCorruptionError.prototype);
  }
}
