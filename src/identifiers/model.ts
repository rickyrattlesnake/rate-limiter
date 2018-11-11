import { IncomingMessage } from 'http';

export {
  IIdentifier,
};

type IIdentifier =
  (req: IncomingMessage) => string | null;
