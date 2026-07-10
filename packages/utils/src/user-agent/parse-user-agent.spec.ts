import { describe, it, expect } from 'vitest';
import { parseUserAgent } from './parse-user-agent';

const CHROME_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const EDGE_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0';

describe('parseUserAgent', () => {
  it('reads browser, OS and device type off a desktop Chrome string', () => {
    expect(parseUserAgent(CHROME_MAC)).toEqual({
      browser: 'Chrome',
      os: 'macOS',
      deviceType: 'desktop',
    });
  });

  it('classifies an iPhone as mobile', () => {
    expect(parseUserAgent(SAFARI_IPHONE)).toEqual({
      browser: 'Safari',
      os: 'iOS',
      deviceType: 'mobile',
    });
  });

  it('prefers Edge over the Chrome token it also carries', () => {
    expect(parseUserAgent(EDGE_WINDOWS).browser).toBe('Edge');
    expect(parseUserAgent(EDGE_WINDOWS).os).toBe('Windows');
  });

  it('degrades to Unknown rather than throwing', () => {
    expect(parseUserAgent('some-crawler/1.0')).toEqual({
      browser: 'Unknown',
      os: 'Unknown',
      deviceType: 'desktop',
    });
    expect(parseUserAgent(null).browser).toBe('Unknown');
    expect(parseUserAgent(undefined).os).toBe('Unknown');
  });
});
