import { expect } from 'chai';
import { SinonFake, SinonFakeTimers, useFakeTimers } from 'sinon';
import { TokenBucketStrategy } from './token-bucket-strategy';

describe('TokenBucketStrategy', () => {
  let tokenBucketStrategy: TokenBucketStrategy;
  let identity: string;
  let clock: SinonFakeTimers;
  let intervalMs: number;
  let maxTokensPerIdentity: number;

  beforeEach(() => {
    clock = useFakeTimers(0);
    intervalMs = 10000;
    maxTokensPerIdentity = 1;
    identity = 'identity-1';
    tokenBucketStrategy = new TokenBucketStrategy(maxTokensPerIdentity, intervalMs);
  });

  it('should initialise', () => {
    expect(tokenBucketStrategy).not.to.equal(undefined);
  });

  it('should throw an error when constructor params are incorrect', () => {
    expect(() => new TokenBucketStrategy(0, 1)).to.throw();
  });

  describe('when an attempt is made', () => {
    it('should succeed when enough tokens are available', () => {
      const result = tokenBucketStrategy.attempt(identity);

      expect(result.success).to.equal(true);
    });

    it('should fail when not enough tokens are available ', () => {
      tokenBucketStrategy.attempt(identity);
      const result = tokenBucketStrategy.attempt(identity);

      expect(result.success).to.equal(false);
    });
  });

  describe('when an attempt fails', () => {
    beforeEach(() => {
      tokenBucketStrategy = new TokenBucketStrategy(1, intervalMs);
      tokenBucketStrategy.attempt(identity);
    });

    it('should return the time to next allowed attempt in milliseconds', () => {
      const attemptTimeMs = 1;
      clock.tick(attemptTimeMs);

      const expectedTimeToNextAllowedAttemptMs =
        (1 / (maxTokensPerIdentity / intervalMs)) - attemptTimeMs;

      const result = tokenBucketStrategy.attempt(identity);
      expect(result.timeToNextAllowedAttemptMs).to.equal(expectedTimeToNextAllowedAttemptMs);
    });
  });

  describe('when an attempt succeed', () => {
    beforeEach(() => {
      tokenBucketStrategy = new TokenBucketStrategy(2, intervalMs);
    });

    it('should return the remaining number of attempts', () => {
      const result = tokenBucketStrategy.attempt(identity);
      expect(result.remainingAttempts).to.equal(1);
    });
  });

  describe('when re-hydrating tokens', () => {
    let nextClockTimeMs: number;
    let attemptsConsumed: number;

    beforeEach(() => {
      nextClockTimeMs = 3000;
      maxTokensPerIdentity = 100;
      intervalMs = 10000;
      attemptsConsumed = 50;

      tokenBucketStrategy = new TokenBucketStrategy(maxTokensPerIdentity, intervalMs);

      for (let i = 0; i < attemptsConsumed; i++) {
        tokenBucketStrategy.attempt(identity);
      }
    });

    it('should re-hydrate at an even rate', () => {
      clock.tick(nextClockTimeMs);

      const expectedTokensToHydrate =
        Math.floor((maxTokensPerIdentity / intervalMs) * nextClockTimeMs);
      const expectedRemainingTokensAfterAttempt =
        maxTokensPerIdentity - attemptsConsumed + expectedTokensToHydrate - 1;

      const result = tokenBucketStrategy.attempt(identity);

      expect(result.remainingAttempts).to.equal(expectedRemainingTokensAfterAttempt);
    });

    it('should not re-hydrate above the specified maximum token limit', () => {
      clock.tick(intervalMs * 2);

      const expectedRemainingTokensAfterAttempt =
        maxTokensPerIdentity - 1;

      const result = tokenBucketStrategy.attempt(identity);

      expect(result.remainingAttempts).to.equal(expectedRemainingTokensAfterAttempt);
    });
  });

});
