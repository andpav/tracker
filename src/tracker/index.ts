import { createListeners } from './listeners'
import { createObserver, unsubscribeObserver } from './observers'
import { isEventAvailable, createSenders } from './events'
import { isTargetAvailable } from './nodes'
import { AdditionalData, Endpoint } from './types'

export type TrackerConfig = {
  targets?: string[]
  events?: string[]
  additionalData?: AdditionalData
  endpoint?: Endpoint
}

export const tracker = ({
  targets = ['button'],
  events = ['click'],
  additionalData = undefined,
  endpoint = undefined,
}: TrackerConfig) => {
  const configTargets = targets.filter(isTargetAvailable)
  const configEvents = events.filter(isEventAvailable)

  const { sendInfo, sendHtml, sendCustom } = createSenders({ additionalData, endpoint })
  const { loadPage, unloadPage, listener } = createListeners({ sendInfo, sendHtml })
  const { observer, subscribed } = createObserver({ targets: configTargets, events: configEvents, listener })

  const unsubscribe = () => unsubscribeObserver({ observer, subscribed, loadPage, unloadPage, listener })

  return { send: sendCustom, unsubscribe }
}
