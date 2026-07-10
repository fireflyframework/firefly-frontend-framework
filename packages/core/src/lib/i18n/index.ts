export { I18nService } from './i18n.service';
export { provideI18n, I18N_CONFIG } from './provide-i18n';
export { FfTranslatePipe } from './ff-translate.pipe';
export { toI18nSegment } from './to-i18n-segment';
export type {
  SupportedLocale,
  LocaleDefinition,
  I18nConfig,
  I18nState,
  I18nRef,
} from './i18n.types';
export {
  FfCurrencyPipe,
  FfDatePipe,
  FfPercentagePipe,
  FfIbanPipe,
  FfNifPipe,
  FfElapsedPipe,
  FfRelativeDayPipe,
  FfFileExtensionPipe,
  FfShortIdPipe,
  FfFileSizePipe,
  FfInitialsPipe,
  FfDateTimePipe,
  FfRelativeTimePipe,
  FfDeviceLabelPipe,
  FfHumanizeLabelPipe,
  FfHumanizeColumnPipe,
} from './formatting';
