// Types
export type {
  DomainEvent,
  EventHandler,
  EventFilter,
  EventBusOptions,
  EventBusConfig,
  FlushResult,
} from './event-bus.types';
export { EVENT_BUS_CONFIG } from './event-bus.types';
export type { QueueStatus } from './event-bus.types';

// Provider factory
export { provideEventBus } from './provide-event-bus';

// Services
export { EventBusService } from './event-bus.service';
export { EventQueueService } from './event-queue.service';
export { EventHistoryService } from './event-history.service';
