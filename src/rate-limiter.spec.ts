import { expect } from 'chai';
import { HttpRateLimiterFactory, RateLimiterStrategy } from './rate-limiter';

describe('HttpRateLimiterFactory', () => {

  it('should build with options', () => {
    expect(() => HttpRateLimiterFactory.build({
      allowedRequestsWithinInterval: 100,
      identifier: () => 'fake-1',
      intervalMs: 60 * 60 * 1000,
      onLimitReachedHandler: () => { },
      rateLimitStrategy: RateLimiterStrategy.IN_MEMORY_TOKEN_BUCKET,
    })).not.to.throw();
  });

  it('should build with defaults', () => {
    expect(() => HttpRateLimiterFactory.build({
      allowedRequestsWithinInterval: 100,
      intervalMs: 60 * 60 * 1000,
    })).not.to.throw();
  });

  it('should build and return a limiter and wrapper', () => {
    const { limiter, wrapper } = HttpRateLimiterFactory.build({
      allowedRequestsWithinInterval: 100,
      intervalMs: 60 * 60 * 1000,
    });

    expect(limiter == null).to.equal(false);
    expect(wrapper == null).to.equal(false);
  });
});
