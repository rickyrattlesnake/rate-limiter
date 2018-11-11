import { IncomingMessage } from 'http';
import { IIdentifier } from './model';

export {
  ipAddressIdentifier,
};

const ipAddressIdentifier: IIdentifier = (req: IncomingMessage) => {
  const xForwardedHeader = req.headers['x-forwarded-for'] || '';
  let remoteIpFromHeader;

  if (Array.isArray(xForwardedHeader)) {
    remoteIpFromHeader = xForwardedHeader[0].trim();
  } else {
    remoteIpFromHeader = xForwardedHeader.split(',')[0].trim();
  }

  return remoteIpFromHeader ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress || null;
};
