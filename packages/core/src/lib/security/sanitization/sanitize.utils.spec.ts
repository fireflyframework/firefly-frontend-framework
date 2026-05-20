import { sanitizeHtml, escapeXss, stripTags } from './sanitize.utils';

describe('sanitize.utils', () => {
  // -------------------------------------------------------------------
  // sanitizeHtml
  // -------------------------------------------------------------------
  describe('sanitizeHtml', () => {
    it('should preserve safe HTML tags', () => {
      expect(sanitizeHtml('<p>Hello <strong>world</strong></p>'))
        .toBe('<p>Hello <strong>world</strong></p>');
    });

    it('should remove <script> tags and content', () => {
      expect(sanitizeHtml('<p>Hi</p><script>alert(1)</script>'))
        .toBe('<p>Hi</p>');
    });

    it('should remove <script> with attributes', () => {
      expect(sanitizeHtml('<script type="text/javascript">evil()</script>'))
        .toBe('');
    });

    it('should remove <iframe> tags', () => {
      expect(sanitizeHtml('<iframe src="evil.com"></iframe>'))
        .toBe('');
    });

    it('should remove self-closing dangerous tags', () => {
      expect(sanitizeHtml('<embed src="evil.swf"/>'))
        .toBe('');
    });

    it('should remove <object> tags', () => {
      expect(sanitizeHtml('<object data="evil.swf"><param name="x"/></object>'))
        .toBe('');
    });

    it('should remove <style> tags and content', () => {
      expect(sanitizeHtml('<style>body{display:none}</style><p>Hi</p>'))
        .toBe('<p>Hi</p>');
    });

    it('should remove <form> tags and content', () => {
      expect(sanitizeHtml('<form action="/steal"><input type="text"/></form>'))
        .toBe('');
    });

    it('should remove event handler attributes', () => {
      expect(sanitizeHtml('<p onclick="alert(1)">Click</p>'))
        .toBe('<p>Click</p>');
    });

    it('should remove onerror attribute', () => {
      expect(sanitizeHtml('<img src="x" onerror="alert(1)">'))
        .toBe('<img src="x">');
    });

    it('should remove onload attribute', () => {
      expect(sanitizeHtml('<body onload="evil()">Hi</body>'))
        .toBe('<body>Hi</body>');
    });

    it('should remove javascript: URIs in href', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
      expect(result).not.toContain('javascript:');
    });

    it('should remove data: URIs in src', () => {
      const result = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>">');
      expect(result).not.toContain('data:');
    });

    it('should handle multiple dangerous elements', () => {
      const input = '<p>Safe</p><script>bad()</script><iframe src="x"></iframe><p>Also safe</p>';
      expect(sanitizeHtml(input)).toBe('<p>Safe</p><p>Also safe</p>');
    });

    it('should return empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle null gracefully', () => {
      expect(sanitizeHtml(null as unknown as string)).toBe('');
    });

    it('should handle undefined gracefully', () => {
      expect(sanitizeHtml(undefined as unknown as string)).toBe('');
    });
  });

  // -------------------------------------------------------------------
  // escapeXss
  // -------------------------------------------------------------------
  describe('escapeXss', () => {
    it('should escape < and >', () => {
      expect(escapeXss('<script>')).toBe('&lt;script&gt;');
    });

    it('should escape &', () => {
      expect(escapeXss('a & b')).toBe('a &amp; b');
    });

    it('should escape double quotes', () => {
      expect(escapeXss('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeXss("it's")).toBe('it&#x27;s');
    });

    it('should escape a full XSS payload', () => {
      expect(escapeXss('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should leave safe text unchanged', () => {
      expect(escapeXss('Hello world 123')).toBe('Hello world 123');
    });

    it('should return empty string for empty input', () => {
      expect(escapeXss('')).toBe('');
    });

    it('should handle null gracefully', () => {
      expect(escapeXss(null as unknown as string)).toBe('');
    });
  });

  // -------------------------------------------------------------------
  // stripTags
  // -------------------------------------------------------------------
  describe('stripTags', () => {
    it('should strip all HTML tags', () => {
      expect(stripTags('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });

    it('should handle self-closing tags', () => {
      expect(stripTags('Line 1<br/>Line 2')).toBe('Line 1Line 2');
    });

    it('should strip nested tags', () => {
      expect(stripTags('<div><span><a href="x">link</a></span></div>')).toBe('link');
    });

    it('should handle tags with attributes', () => {
      expect(stripTags('<p class="info" id="main">Text</p>')).toBe('Text');
    });

    it('should return plain text unchanged', () => {
      expect(stripTags('No tags here')).toBe('No tags here');
    });

    it('should return empty string for empty input', () => {
      expect(stripTags('')).toBe('');
    });

    it('should handle null gracefully', () => {
      expect(stripTags(null as unknown as string)).toBe('');
    });
  });
});
