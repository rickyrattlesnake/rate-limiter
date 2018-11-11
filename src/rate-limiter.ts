import { IncomingMessage, Server, ServerResponse } from 'http';
import { defaultHandler } from './handlers/default-handler';
import { OnLimitReachedHandler } from './handlers/model';
import { ipAddressIdentifier } from './identifiers/ip-address-identifier';
import { IIdentifier } from './identifiers/model';
import { IRateLimitStrategy } from './rate-limit-strategy/model';
import { TokenBucketStrategy } from './rate-limit-strategy/token-bucket-strategy';

export enum RateLimiterStrategy {
  IN_MEMORY_TOKEN_BUCKET = 'IN_MEMORY_TOKEN_BUCKET',
}

interface IRateLimiterResult {
  success: boolean;
  timeToNextAllowedAttemptMs: number;
}
type RateLimiter = (req: IncomingMessage) => IRateLimiterResult;
type RateLimitWrapperCallback = (req: IncomingMessage, res: ServerResponse) => any;

export interface IRateLimiterOptions {
  intervalMs: number;
  allowedRequestsWithinInterval: number;
  rateLimitStrategy?: RateLimiterStrategy;
  identifier?: IIdentifier;
  onLimitReachedHandler?: OnLimitReachedHandler;
}

interface IRateLimitFactoryOutput {
  limiter: RateLimiter;
  wrapper: (callback: RateLimitWrapperCallback) => (req: IncomingMessage, res: ServerResponse) => void;
}

export class HttpRateLimiterFactory {
  public static build(options: IRateLimiterOptions): IRateLimitFactoryOutput {
    if (!options.intervalMs || !options.allowedRequestsWithinInterval) {
      throw new Error('intervalMs and allowedRequestsWithinInterval must be defined');
    }

    let strategy: IRateLimitStrategy;
    switch (options.rateLimitStrategy) {
      case RateLimiterStrategy.IN_MEMORY_TOKEN_BUCKET:
      default:
        strategy = new TokenBucketStrategy(
          options.allowedRequestsWithinInterval,
          options.intervalMs,
        );
    }
    const identifier = options.identifier ?
      options.identifier : ipAddressIdentifier;
    const handler = options.onLimitReachedHandler ? options.onLimitReachedHandler :
      defaultHandler;
    const limiter = this.createLimiter(identifier, strategy);

    return {
      limiter,
      wrapper: this.createWrapper(limiter, handler),
    };
  }

  private static createLimiter(identifier: IIdentifier, limiterStrategy: IRateLimitStrategy) {
    return (req: IncomingMessage) => {
      const identity = identifier(req);

      if (identity == null) {
        return {
          success: false,
          timeToNextAllowedAttemptMs: 0,
        };
      }

      return limiterStrategy.attempt(identity);
    };
  }

  private static createWrapper(limiter: RateLimiter, handler: OnLimitReachedHandler) {
    return (callback: RateLimitWrapperCallback) => {
      return (req: IncomingMessage, res: ServerResponse) => {
        const result = limiter(req);
        if (result.success) {
          callback(req, res);
        } else {
          handler(req, res, callback, result);
        }
      };
    };
  }
}
