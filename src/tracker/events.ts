import { PAYLOAD_TYPES } from './constants'
import { post } from '../common/transport'
import { getRuntimeUuid, getSessionStorageUuid, getLocalStorageUuid } from '../common/uuids'
import {
  AVAILABLE_EVENTS,
  AvailableEvents,
  AnalyticsPayload,
  AdditionalData,
  AvailablePayloads,
  EventData,
  Endpoint,
  InfoEventData,
  HtmlEventData,
  CustomEventData,
} from './types'

export const isEventAvailable = (templateString: string): templateString is AvailableEvents =>
  (AVAILABLE_EVENTS as ReadonlyArray<string>).includes(templateString)

type CreateUserEvent = {
  eventType: AvailablePayloads
  tag: string
  name: string
  targetType: string
  className: string
  dataset: DOMStringMap
  coordinates?: { x: number; y: number }
}

export const createUserEvent = ({
  eventType,
  tag,
  className,
  name,
  targetType,
  dataset,
  coordinates,
}: CreateUserEvent) => {
  const targetClassName = className ? `.${className}` : ''

  const parsedDataset = Object.keys(dataset).reduce(
    (acc, current) => (acc += `[data-${current}="${dataset[current]}"]`),
    '',
  )

  const result = {
    [eventType]: `${tag}${targetClassName}[type="${targetType}"][name="${name}"]${parsedDataset}`,
  }

  if (coordinates) {
    Object.assign(result, { coordinates })
  }

  return result
}

export const createEventCreator = (additionalData?: AdditionalData) => ({
  event,
  eventType,
}: {
  event: EventData
  eventType: AvailablePayloads
}) => ({
  runtimeUUID: getRuntimeUuid(),
  sessionStorageUUID: getSessionStorageUuid(),
  localStorageUUID: getLocalStorageUuid(),
  timestamp: Date.now(),
  additionalData,
  events: [
    {
      incrementalId: 1,
      timestamp: Date.now(),
      eventType: eventType,
      data: event,
    },
  ],
})

export const sendEvent = (apiUrl?: string) => (payload: AnalyticsPayload) => {
  if (localStorage.getItem('logging')) {
    console.log(payload)
  }

  if (apiUrl) {
    post(apiUrl, { json: payload })
  }
}

export const createSenders = ({
  additionalData,
  endpoint,
}: {
  additionalData?: AdditionalData
  endpoint: Endpoint
}) => {
  const createEvent = createEventCreator(additionalData)
  const send = sendEvent(endpoint)

  const sendInfo = (payload: InfoEventData) => send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.INFO }))
  const sendHtml = (payload: HtmlEventData) => send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.HTML }))
  const sendCustom = (payload: CustomEventData) =>
    send(createEvent({ event: payload, eventType: PAYLOAD_TYPES.CUSTOM }))

  return { sendInfo, sendHtml, sendCustom }
}
