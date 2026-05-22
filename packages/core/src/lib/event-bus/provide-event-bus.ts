import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import {
  EVENT_BUS_CONFIG,
  EventBusConfig,
  EventBusOptions,
} from './event-bus.types';
import { EventBusService } from './event-bus.service';
import { EventQueueService } from './event-queue.service';
import { EventHistoryService } from './event-history.service';

/** Default configuration values. */
const DEFAULTS: EventBusConfig = {
  enableQueue: true,
  maxQueueSize: 1000,
  enableHistory: false,
  historySize: 100,
};

/**
 * Configure the EventBus module.
 *
 * Registers `EventBusService`, `EventQueueService`, and
 * `EventHistoryService` with the resolved configuration.
 *
 * This is a **CORE** module — call `provideEventBus()` in your
 * `appConfig` providers to enable internal event-driven communication.
 *
 * @example
 * ```ts
 * import { provideEventBus } from '@fireflyframework/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideEventBus({
 *       enableQueue: true,
 *       enableHistory: true,
 *       historySize: 200,
 *     }),
 *   ],
 * };
 * ```
 *
 * @param options - Optional configuration. Defaults: enableQueue=true, maxQueueSize=1000, enableHistory=false, historySize=100
 * @returns EnvironmentProviders to register in the application config
 */
export function provideEventBus(
  options?: EventBusOptions,
): EnvironmentProviders {
  const config: EventBusConfig = {
    enableQueue: options?.enableQueue ?? DEFAULTS.enableQueue,
    maxQueueSize: options?.maxQueueSize ?? DEFAULTS.maxQueueSize,
    enableHistory: options?.enableHistory ?? DEFAULTS.enableHistory,
    historySize: options?.historySize ?? DEFAULTS.historySize,
  };

  return makeEnvironmentProviders([
    { provide: EVENT_BUS_CONFIG, useValue: config },
    EventBusService,
    EventQueueService,
    EventHistoryService,
  ]);
}
