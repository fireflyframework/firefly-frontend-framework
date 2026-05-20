// Types
export type { PiiFieldType, PiiMaskingMode, CsrfConfig, SecurityConfig } from './security.types';

// Provider factory
export { provideSecurity } from './provide-security';

// Service + token
export { SecurityService, SECURITY_CONFIG } from './security.service';

// CSRF interceptor
export { csrfInterceptor } from './csrf/csrf.interceptor';

// PII masking
export { maskNif, maskCard, maskPhone, maskEmail, maskIban } from './pii/pii.utils';
export { FfPiiMaskPipe } from './pii/pii-mask.pipe';
export { FfPiiMaskDirective } from './pii/pii-mask.directive';

// Sanitization
export { sanitizeHtml, escapeXss, stripTags } from './sanitization/sanitize.utils';
