import { createServer } from 'http';
import { HttpRateLimiterFactory } from '../../';

const PORT = process.env.PORT || 3000;

const { limiter } = HttpRateLimiterFactory.build({
  allowedRequestsWithinInterval: 1,
  intervalMs: 10000,
});

const server = createServer((req, res) => {
  console.log('[-] request received');

  const {
    success: isWithinRateLimit,
    timeToNextAllowedAttemptMs,
  } = limiter(req);

  if (!isWithinRateLimit) {
    res.writeHead(429);
    return res.end(`Rate limit exceeded. Try again in ${
      (timeToNextAllowedAttemptMs / 1000).toFixed(2)
      } seconds`);
  }

  res.writeHead(200, undefined, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify('hello world'));
});

server.listen(PORT, () => {
  console.log('[-] server listening on', PORT);
});
