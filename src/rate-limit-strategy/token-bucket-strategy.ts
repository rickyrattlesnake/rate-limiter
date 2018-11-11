import { IRateLimitStrategy } from './model';
import { TokenBucket } from './token-bucket';

export class TokenBucketStrategy implements IRateLimitStrategy {
  private tokenBucket: TokenBucket;
  private intervalToNextTokenHydrationMs: number;
  private tokensToHydratePerMs: number;

  constructor(
    private maxTokensPerIdentitiy: number,
    private intervalMs: number,
  ) {
    this.tokenBucket = new TokenBucket(
      this.maxTokensPerIdentitiy,
    );

    if (maxTokensPerIdentitiy <= 0) {
      throw new TypeError('maxTokensPerIdentity must be greater than 0.');
    }
    this.tokensToHydratePerMs = maxTokensPerIdentitiy / intervalMs;
    this.intervalToNextTokenHydrationMs = 1 / this.tokensToHydratePerMs;
  }

  public attempt(identity: string) {
    const attemptTimeMs = (new Date()).getTime();

    this.hydrate(identity);

    const { success, remainingTokens, lastHydrateTimeMs } = this.consume(identity);
    const timeToNextAllowedAttemptMs = Math.max(
      this.intervalToNextTokenHydrationMs - (attemptTimeMs - lastHydrateTimeMs),
      0);

    return {
      remainingAttempts: (success ? remainingTokens : 0),
      success,
      timeToNextAllowedAttemptMs,
    };
  }

  private hydrate(identity: string): void {
    const newHydrateTimeMs = (new Date()).getTime();

    if (!this.tokenBucket.keyExists(identity)) {
      this.tokenBucket.createBucket(identity, {
        lastHydrateTimeMs: newHydrateTimeMs,
        tokens: this.maxTokensPerIdentitiy,
      });

      return;
    }

    const tokensToHydrate = Math.floor(
      this.tokensToHydratePerMs
      * (newHydrateTimeMs - this.tokenBucket.getLastHydrateTimeMs(identity)));

    if (tokensToHydrate > 0) {
      this.tokenBucket.drip(identity, tokensToHydrate, newHydrateTimeMs);
    }
  }

  private consume(identity: string) {
    let success = false;
    success = this.tokenBucket.take(identity, 1);

    return {
      lastHydrateTimeMs: this.tokenBucket.getLastHydrateTimeMs(identity),
      remainingTokens: this.tokenBucket.getTokens(identity),
      success,
    };
  }
}
