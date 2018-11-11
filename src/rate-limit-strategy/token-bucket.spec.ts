import { expect } from 'chai';
import { SinonFakeTimers, useFakeTimers } from 'sinon';
import { TokenBucket } from './token-bucket';

describe('TokenBucket', () => {
  let anotherIdentity: string;
  let clock: SinonFakeTimers;
  let identity: string;
  let initialTokens: number;
  let bucketCapacity: number;
  let tokenBucket: TokenBucket;

  beforeEach(() => {
    clock = useFakeTimers(0);
    identity = 'identity-1';
    anotherIdentity = 'identity-2';
    bucketCapacity = 100;
    initialTokens = bucketCapacity;

    tokenBucket = new TokenBucket(bucketCapacity);
  });

  afterEach(() => {
    clock.restore();
  });

  describe('when initialising', () => {
    it('should create an instance', () => {
      expect(tokenBucket).not.to.equal(undefined);
    });

    it('should create a bucket correctly', () => {
      tokenBucket.createBucket(identity, {
        lastHydrateTimeMs: (new Date()).getTime(),
        tokens: initialTokens,
      });

      expect(tokenBucket.keyExists(identity)).to.equal(true);
    });
  });

  describe('when taking tokens', () => {
    beforeEach(() => {
      tokenBucket.createBucket(identity, {
        lastHydrateTimeMs: (new Date()).getTime(),
        tokens: initialTokens,
      });
      tokenBucket.createBucket(anotherIdentity, {
        lastHydrateTimeMs: (new Date()).getTime(),
        tokens: initialTokens,
      });
    });

    it('should take the correct number of tokens', () => {
      tokenBucket.take(identity, 10);
      expect(tokenBucket.getTokens(identity)).to.equal(initialTokens - 10);

      tokenBucket.take(identity, 10);
      expect(tokenBucket.getTokens(identity)).to.equal(initialTokens - 20);
    });

    it('should only take tokens of the specific identity', () => {
      tokenBucket.take(identity, 1);
      expect(tokenBucket.getTokens(anotherIdentity)).to.equal(initialTokens);
    });

    it('should not take more than the available number of tokens', () => {
      const result = tokenBucket.take(identity, initialTokens + 1);

      expect(result).to.equal(false);
      expect(tokenBucket.getTokens(identity)).to.equal(initialTokens);
    });
  });

  describe('when dripping tokens', () => {
    let initialTokensTaken: number;

    beforeEach(() => {
      initialTokensTaken = 10;

      tokenBucket.createBucket(identity, {
        lastHydrateTimeMs: (new Date()).getTime(),
        tokens: initialTokens,
      });
      tokenBucket.createBucket(anotherIdentity, {
        lastHydrateTimeMs: (new Date()).getTime(),
        tokens: initialTokens,
      });

      tokenBucket.take(identity, initialTokensTaken);
      tokenBucket.take(anotherIdentity, initialTokensTaken);
    });

    it('should add the specified tokens to the bucket and set the hydrate time', () => {
      tokenBucket.drip(identity, 1, 1);
      expect(tokenBucket.getTokens(identity)).to.equal(bucketCapacity - initialTokensTaken + 1);
      expect(tokenBucket.getLastHydrateTimeMs(identity)).to.equal(1);
    });

    it('should only add tokens to the specificed bucket', () => {
      tokenBucket.drip(identity, 1, 1);
      expect(tokenBucket.getTokens(anotherIdentity)).to.equal(bucketCapacity - initialTokensTaken);
      expect(tokenBucket.getLastHydrateTimeMs(anotherIdentity)).to.equal(0);
    });
  });
});
