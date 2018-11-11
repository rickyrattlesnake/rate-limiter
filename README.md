# Simple Rate Limiter
> Http Request rate limiter to use with nodejs servers

[![Build Status][travis-image]][travis-url]

A simple rate-limiting interceptor for NodeJS Http servers. Designed to be extensible with custom implementations of request identifiers, handlers and to apply rate-limiting on a per-route basis.

Default implementation identifies the client remote-ip address from the `IncomingRequest`, and uses the an `in-memory` implementation of the [TokenBucketStrategy](https://en.wikipedia.org/wiki/Token_bucket). When a request conforms to the rate-limit, the server callback handler is called. When a request exceeds the rate-limit,



Note: The default implementation does not share state with other processes or servers, this is not a distributed rate-limiter implementation.

## Installation

#### NOTE: package is not published on npm, so this won't work

```sh
npm install simple-rate-limiter --save
```

## Configuration options and Usage

Configurations are passed to the RateLimiterFactory

```javascript
const options = {
  // The interval window the request limit is applied over
  // e.g. 3600000 for 1 hour
  intervalMs: number;
  // The max number of requests allow within interval
  // e.g. 100
  allowedRequestsWithinInterval: number;
  // Strategy Definition (exported as part of package)
  // RateLimiterStrategy.IN_MEMORY_TOKEN_BUCKET is default
  rateLimitStrategy?: RateLimiterStrategy;
  // used to customise the identifier for a request
  // by default it will attempt to identify the remote client ip address
  identifier?: IIdentifier;
  // used to customise handling of the request that went over the limit. Handler is called or every request over the limit
  // by default ServerResponse is called with 429 with appropriate headers and plain/text body
  onLimitReachedHandler?: OnLimitReachedHandler;
}
```

The `HttpRateLimiterFactory.build(options)` returns a `limiter` and `wrapper` using the same instance of the rate-limit strategy store.

The `limiter` can be used inside server route implementations
e.g.
```javascript
const {
  success: isWithinRateLimit,
  timeToNextAllowedAttemptMs,
} = limiter(req);

if (!isWithinRateLimit) {
  res.writeHead(429);
  return res.end(`Rate limit exceeded.`);
}
```

The `wrapper` is designed to easily decorate existing route handler implementations

e.g.
```javascript
const server = createServer(wrapper((req, res) => {
  res.writeHead(200, undefined, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify('hello world'));
}));
```

## Development setup

```sh
npm install
npm build
```

## Usage example

Some examples are created in the `examples` folder.

To run, follow the `Development setup` guide. Then:
```sh
cd examples
npm install
npm run examples:http-server:{{example-name}}
```

`simple-rate-limiter` configurations can be changes in the relevant example files

You can then use a testing tool like `ab` or `curl` commands to and modify and test the examples

## Release History

## Meta

Ricky Ratnayake

Distributed under the MIT license.

[https://github.com/rickyrattlesnake/](https://github.com/dbader/)


<!-- Markdown link & img dfn's -->
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
