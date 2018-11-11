import { createServer } from 'http';
import { HttpRateLimiterFactory } from '../../';

const PORT = process.env.PORT || 3000;

const { wrapper } = HttpRateLimiterFactory.build({
  allowedRequestsWithinInterval: 1,
  intervalMs: 10000,
});

const server = createServer(wrapper((req, res) => {
  console.log('[-] request received');

  res.writeHead(200, undefined, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify('hello world'));
}));

server.listen(PORT, () => {
  console.log('[-] server listening on', PORT);
});
