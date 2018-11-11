import { expect } from 'chai';
import { ipAddressIdentifier } from './ip-address-identifier';

describe('IpAddressIdentifier', () => {
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      connection: {
        remoteAddress: undefined,
      },
      headers: {},
      socket: {
        connection: {
          remoteAddress: undefined,
        },
      },
    };
  });

  describe('when a singe proxy forwarded the remote client connection', () => {
    beforeEach(() => {
      mockRequest.headers = {
        'x-forwarded-for': '1.2.3.4',
      };
    });

    it('should parse the X-Forwarded-For header for the remote client ip', () => {
      expect(ipAddressIdentifier(mockRequest)).to.equal('1.2.3.4');
    });
  });

  describe('when multiple proxy servers mediated the http connection', () => {
    beforeEach(() => {
      mockRequest.headers = {
        'x-forwarded-for': '1.2.3.4,2.2.2.2,3.3.3.3',
      };
    });

    it('should only parse the remote client ip-address', () => {
      expect(ipAddressIdentifier(mockRequest)).to.equal('1.2.3.4');
    });
  });

  describe('when the socket connection reports the remote ip address', () => {
    beforeEach(() => {
      mockRequest.connection.remoteAddress = '1.2.3.4' as any;
    });

    it('should get the remote ip from the socket connection', () => {
      expect(ipAddressIdentifier(mockRequest)).to.equal('1.2.3.4');
    });
  });

  it('should use the net socket remote address if proxy did not forward the remote ip-address', () => {
    beforeEach(() => {
      mockRequest.socket.connection.remoteAddress = '1.2.3.4' as any;
    });

    it('should get the remote ip from the socket connection', () => {
      expect(ipAddressIdentifier(mockRequest)).to.equal('1.2.3.4');
    });
  });
});
