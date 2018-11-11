export interface IRateLimitStrategy {
  attempt(identifier: string): {
    remainingAttempts: number;
    success: boolean,
    timeToNextAllowedAttemptMs: number;
  };
}
