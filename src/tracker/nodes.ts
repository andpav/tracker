import { AVAILABLE_TARGETS, AvailableEvents, AvailableTargets, SubscribedNode } from './types'

export const isTargetAvailable = (templateString: string): templateString is AvailableTargets =>
  (AVAILABLE_TARGETS as ReadonlyArray<string>).includes(templateString)

export const isInputElement = (t: EventTarget): t is HTMLInputElement => t instanceof HTMLInputElement
export const isButtonElement = (t: EventTarget): t is HTMLButtonElement => t instanceof HTMLButtonElement

type GetNodes = {
  node: Element
  targets: AvailableTargets[]
}

export const getNodes = ({ node, targets }: GetNodes) =>
  targets.flatMap((target) => Array.from(node.querySelectorAll(target)))

type SubscribeNodes = {
  nodes: Element[]
  events: AvailableEvents[]
  listener: (e: Event) => void
}

export const subscribeNodes = ({ nodes, events, listener }: SubscribeNodes) => {
  const subscribed: SubscribedNode[] = []

  nodes.forEach((node) => {
    events.forEach((event) => {
      const eventListener = (e: Event) => listener(e)

      node.addEventListener(event, eventListener)

      subscribed.push({
        node,
        event,
        listener: eventListener,
      })
    })
  })

  return subscribed
}

export const unsubscribeNodes = (subscribed: SubscribedNode[]) => {
  subscribed.forEach(({ node, event, listener }) => node.removeEventListener(event, listener))
}
