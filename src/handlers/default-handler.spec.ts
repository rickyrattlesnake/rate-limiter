import { expect } from 'chai';
import * as sinon from 'sinon';
import { defaultHandler } from './default-handler';
import { IHandlerContext } from './model';

describe('DefaultHandler', () => {
  const sandbox = sinon.createSandbox();
  let mockRequest: any;
  let mockResponse: any;
  let mockCallback: any;
  let context: IHandlerContext;

  beforeEach(() => {
    mockRequest = {};
    mockCallback = () => { };
    mockResponse = {
      end: () => { },
      writeHead: () => { },
    };
    context = {
      success: false,
      timeToNextAllowedAttemptMs: 3000,
    };

    sandbox.stub(mockResponse, 'writeHead');
    sandbox.stub(mockResponse, 'end');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('when request exceeds the limit', () => {
    beforeEach(() => {
      defaultHandler(mockRequest, mockResponse, mockCallback, context);
    });

    it('should have called the writeHead with 429 and correct headers', () => {
      expect(mockResponse.writeHead.calledOnce).to.equal(true);
      expect(mockResponse.writeHead.args[0][0]).to.equal(429);
      expect(mockResponse.writeHead.args[0][1]).to.deep.equal({
        'Content-Type': 'text/plain',
        'Retry-After': '3',
      });
    });

    it('should have called the end with the correct body', () => {
      expect(mockResponse.end.calledOnce).to.equal(true);
      expect(mockResponse.end.args[0][0]).to.equal('Rate limit exceeded. Try again in 3 seconds');
    });
  });
});
