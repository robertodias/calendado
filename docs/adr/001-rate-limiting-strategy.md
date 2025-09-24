# ADR-001: Rate Limiting Strategy

## Status
Accepted

## Context
The Calendado application has public endpoints that could be abused by malicious actors. We need to implement rate limiting to prevent:
- Spam submissions to the waitlist
- DoS attacks on our functions
- Resource exhaustion
- Unfair usage of our services

## Decision
We will implement a multi-layered rate limiting strategy:

1. **In-memory rate limiting** for development and small-scale production
2. **Redis-based rate limiting** for production scale
3. **Different limits for different endpoints**:
   - Waitlist: 5 requests per 15 minutes per email
   - Webhooks: 100 requests per minute per IP
   - Admin: 20 requests per minute per IP

## Implementation
- Custom rate limiting middleware using Map for development
- Redis integration for production
- Rate limit headers in responses
- Graceful degradation when limits are exceeded

## Consequences
### Positive
- Prevents abuse and spam
- Protects system resources
- Fair usage enforcement
- Clear error messages for legitimate users

### Negative
- Additional complexity in code
- Memory usage for in-memory store
- Redis dependency for production
- Potential false positives for legitimate users

## Alternatives Considered
1. **Cloudflare rate limiting**: Would be simpler but less control
2. **Firebase App Check**: Good for authentication but not rate limiting
3. **Third-party services**: Additional cost and complexity

## Monitoring
- Track rate limit hits
- Monitor false positive rates
- Alert on unusual patterns
- Regular review of limits
