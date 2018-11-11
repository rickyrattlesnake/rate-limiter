import { OnLimitReachedHandler } from './model';

export const defaultHandler: OnLimitReachedHandler = (req, res, callback, context) => {
  const timeToWaitSeconds = Math.ceil(context.timeToNextAllowedAttemptMs / 1000);

  res.writeHead(429, {
    'Content-Type': 'text/plain',
    'Retry-After': `${timeToWaitSeconds}`,
  });
  return res.end(`Rate limit exceeded. Try again in ${timeToWaitSeconds} seconds`);
};
