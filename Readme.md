timer: 20:10pm -

ideas

- able to apply the rate limiter to controller functions in
- able to easily extend the code to a service layer


assumptions:
- requester is identified by their ip address
-

ideas:
- leaky queue data structure : every known interval we release x amount of requests per identifier
- fixed window strategy :
  - potential to exploit the window length -> double the number of requests
- sliding log :
  - summation is expensive, but precise windowing
-

distributed services issues:
- sticky sessions from the load balancer: affects scalability
- central store:
  - latency vs concurrency
  - >> use set then get methods : force the value to be lower then the rate limit
  - data-sync with a local store : relax ratelimit conditions but allow low latency
- consider transitions from one ratelimit parameter to the next
  - i.e. 10 min intervals vs 1 hour
  -

- token bucket :
  -

- performance impact of middleware
- killswitch?
- dark launch?
