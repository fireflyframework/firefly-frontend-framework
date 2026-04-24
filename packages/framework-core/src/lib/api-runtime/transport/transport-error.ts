import { TransportProtocol } from './transport-request';

/**
 * Typed error that encapsulates Transport Layer failures.
 *
 * Normalizes errors from all protocols to a consistent format
 * that ErrorInterceptor and LoggerService can process uniformly.
 */
export class TransportError extends Error {
  override readonly name = 'TransportError';

  constructor(
    message: string,
    /** Protocol that originated the error */
    public readonly protocol: TransportProtocol,
    /** Name of the adapter that failed */
    public readonly adapterName: string,
    /** Target service of the failed request */
    public readonly service: string,
    /** Operation that failed */
    public readonly operation: string,
    /** Error status code (HTTP status, mapped gRPC code, etc.) */
    public readonly statusCode?: number,
    /** Original protocol error (HttpErrorResponse, gRPC error, etc.) */
    public readonly originalError?: unknown,
  ) {
    super(message);
  }
}
