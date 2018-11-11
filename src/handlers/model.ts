import { IncomingMessage, ServerResponse } from 'http';

export interface IHandlerContext {
  success: boolean;
  timeToNextAllowedAttemptMs: number;
}

export type OnLimitReachedHandler = (req: IncomingMessage,
                                     res: ServerResponse,
                                     callback: (req: IncomingMessage, res: ServerResponse) => any,
                                     context: IHandlerContext) => void;
