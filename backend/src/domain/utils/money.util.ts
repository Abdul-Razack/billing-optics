export type Paise = number;

export class Money {
  private readonly amountInPaise: Paise;

  private constructor(amountInPaise: Paise) {
    if (!Number.isInteger(amountInPaise)) {
      throw new Error(`Money amount must be an integer, got: ${amountInPaise}`);
    }
    this.amountInPaise = amountInPaise;
  }

  public static fromPaise(paise: Paise): Money {
    return new Money(Math.round(paise));
  }

  public static zero(): Money {
    return new Money(0);
  }

  public getPaise(): Paise {
    return this.amountInPaise;
  }

  public add(other: Money): Money {
    return new Money(this.amountInPaise + other.amountInPaise);
  }

  public subtract(other: Money): Money {
    return new Money(this.amountInPaise - other.amountInPaise);
  }

  public multiply(factor: number): Money {
    return new Money(Math.round(this.amountInPaise * factor));
  }

  public divide(divisor: number): Money {
    if (divisor === 0) {
      throw new Error("Division by zero");
    }
    return new Money(Math.round(this.amountInPaise / divisor));
  }

  public allocate(ratios: number[]): Money[] {
    const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
    if (totalRatio <= 0) {
      throw new Error("Total ratio must be greater than zero");
    }

    let remainder = this.amountInPaise;
    const results: number[] = [];

    for (const ratio of ratios) {
      const share = Math.floor((this.amountInPaise * ratio) / totalRatio);
      results.push(share);
      remainder -= share;
    }

    const sign = remainder > 0 ? 1 : -1;
    const absRemainder = Math.abs(remainder);
    for (let i = 0; i < absRemainder; i++) {
      results[i % results.length] += sign;
    }

    return results.map(paise => new Money(paise));
  }

  public isLessThanZero(): boolean {
    return this.amountInPaise < 0;
  }

  public equals(other: Money): boolean {
    return this.amountInPaise === other.amountInPaise;
  }
}
