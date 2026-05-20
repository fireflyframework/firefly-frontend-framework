import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  Renderer2,
  inject,
} from '@angular/core';

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
 * Attribute directive that displays PII data in masked form
 * and allows toggling to reveal the real value.
 *
 * @example
 * ```html
 * <span
 *   [ffPiiMask]="'nif'"
 *   [ffPiiMaskValue]="user.nif"
 *   (ffPiiMaskToggled)="onToggle($event)">
 * </span>
 * ```
 */
@Directive({ selector: '[ffPiiMask]', standalone: true })
export class FfPiiMaskDirective implements OnChanges {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);

  /** The PII field type used to select the masking function. */
  @Input({ required: true }) ffPiiMask!: PiiFieldType;

  /** The raw (unmasked) value. */
  @Input({ required: true }) ffPiiMaskValue!: string;

  /** Emits `'visible'` or `'hidden'` when the masked state changes. */
  @Output() ffPiiMaskToggled = new EventEmitter<'visible' | 'hidden'>();

  private masked = true;

  ngOnChanges(): void {
    this.render();
  }

  /** Toggles between masked and unmasked display. */
  toggle(): void {
    this.masked = !this.masked;
    this.render();
    this.ffPiiMaskToggled.emit(this.masked ? 'hidden' : 'visible');
  }

  /** Whether the value is currently masked. */
  get isMasked(): boolean {
    return this.masked;
  }

  private render(): void {
    const text = this.masked
      ? MASK_FN[this.ffPiiMask](this.ffPiiMaskValue ?? '')
      : (this.ffPiiMaskValue ?? '');
    this.renderer.setProperty(this.el.nativeElement, 'textContent', text);
  }
}
