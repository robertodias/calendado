# ADR-002: Error Handling Pattern

## Status
Accepted

## Context
The current codebase has inconsistent error handling patterns:
- Some functions throw generic Error objects
- Error responses vary in format
- No standardized error codes
- Difficult to debug production issues
- Poor user experience with unclear error messages

## Decision
We will implement a standardized error handling pattern:

1. **Custom AppError class** with structured error information
2. **Standardized error codes** for different error types
3. **Consistent error response format** across all endpoints
4. **Error context preservation** for debugging
5. **Retry logic** for transient errors

## Implementation
```typescript
interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode: number;
  retryable: boolean;
}
```

## Error Categories
- **Validation errors** (400): Invalid input data
- **Authentication errors** (401): Missing or invalid auth
- **Authorization errors** (403): Insufficient permissions
- **Rate limiting** (429): Too many requests
- **External service errors** (502): Third-party service failures
- **Internal errors** (500): System failures

## Consequences
### Positive
- Consistent error responses
- Better debugging experience
- Clear error categorization
- Retry logic for transient errors
- Better user experience

### Negative
- More boilerplate code
- Learning curve for developers
- Potential over-engineering for simple cases

## Alternatives Considered
1. **Generic Error objects**: Too simple, poor debugging
2. **HTTP status codes only**: Not enough context
3. **Third-party error libraries**: Additional dependencies

## Monitoring
- Track error rates by category
- Monitor retry success rates
- Alert on high error rates
- Regular error pattern analysis
