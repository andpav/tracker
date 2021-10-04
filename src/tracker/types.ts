import { UUID } from '../common/uuids'
import { PAYLOAD_TYPES } from './constants'

export type Endpoint = string | undefined

export const AVAILABLE_EVENTS = ['click', 'focus', 'hover', 'blur'] as const
export const AVAILABLE_TARGETS = ['button', 'input', 'textarea'] as const
export const AVAILABLE_PAYLOADS = Object.values(PAYLOAD_TYPES)

export type AvailableEvents = typeof AVAILABLE_EVENTS extends ReadonlyArray<infer X> ? X : never
export type AvailableTargets = typeof AVAILABLE_TARGETS extends ReadonlyArray<infer X> ? X : never
export type AvailablePayloads = typeof AVAILABLE_PAYLOADS extends ReadonlyArray<infer X> ? X : never

export type SubscribedNode = {
  node: Element
  event: AvailableEvents
  listener: (e: Event) => void
}

type BaseEventData = Record<string, string>

type ChangeEventData = BaseEventData
type FocusEventData = BaseEventData
type BlurEventData = BaseEventData

type ClickEventData = BaseEventData & {
  screenResolution: { x: number; y: number }
  coordinates: { x: number; y: number }
}

export type CustomEventData = Record<string, string>
export type InfoEventData = Record<string, string>
export type HtmlEventData = ChangeEventData | FocusEventData | BlurEventData | ClickEventData

export type EventData = HtmlEventData | InfoEventData | CustomEventData

export type EventInfo = {
  timestamp: number
  incrementalId: number
  eventType: AvailablePayloads
  data: EventData
}

export type AdditionalData = BaseEventData

export type EventsInfo = {
  runtimeUUID: UUID
  sessionStorageUUID: UUID
  localStorageUUID: UUID
  timestamp: number
  additionalData?: AdditionalData
}

export type AnalyticsPayload = EventsInfo & {
  events: EventInfo[]
}
