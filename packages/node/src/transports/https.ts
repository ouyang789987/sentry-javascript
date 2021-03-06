import { SentryError } from '@sentry/core';
import { SentryEvent, SentryResponse, TransportOptions } from '@sentry/types';
import * as https from 'https';
import * as HttpsProxyAgent from 'https-proxy-agent';
import { BaseTransport } from './base';

/** Node https module transport */
export class HTTPSTransport extends BaseTransport {
  /** Create a new instance and set this.agent */
  public constructor(public options: TransportOptions) {
    super(options);
    this.module = https;
    const proxy = options.httpsProxy || options.httpProxy || process.env.https_proxy || process.env.http_proxy;
    this.client = proxy
      ? // tslint:disable-next-line:no-unsafe-any
        (new HttpsProxyAgent(proxy) as https.Agent)
      : new https.Agent({ keepAlive: true, maxSockets: 100 });
  }

  /**
   * @inheritDoc
   */
  public async captureEvent(event: SentryEvent): Promise<SentryResponse> {
    if (!this.module) {
      throw new SentryError('No module available in HTTPSTransport');
    }

    return this.sendWithModule(this.module, event);
  }
}
