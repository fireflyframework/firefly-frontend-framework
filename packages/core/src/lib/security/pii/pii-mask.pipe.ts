import { Pipe, PipeTransform } from '@angular/core';

import { PiiFieldType } from '../security.types';
import { maskNif, maskCard, maskPhone, maskEmail, maskIban } from './pii.utils';

const MASK_FN: Record<PiiFieldType, (value: string) => string> = {
  nif: maskNif,
  card: maskCard,
  phone: maskPhone,
  email: maskEmail,
  iban: maskIban,
};

/**
 * Masks a PII value according to its field type.
 *
 * @example
 * ```html
 * {{ nifValue | ffPiiMask:'nif' }}
 * {{ cardNumber | ffPiiMask:'card' }}
 * {{ userEmail | ffPiiMask:'email' }}
 * ```
 */
@Pipe({ name: 'ffPiiMask', standalone: true })
export class FfPiiMaskPipe implements PipeTransform {
  transform(value: string | null | undefined, type: PiiFieldType): string {
    if (!value) return '';
    return MASK_FN[type](value);
  }
}
