import { AvailableTargets, AvailableEvents, SubscribedNode } from './types'
import { getNodes, subscribeNodes, unsubscribeNodes } from './nodes'

type TCreateObserver = {
  targets: AvailableTargets[]
  events: AvailableEvents[]
  listener: (e: Event) => void
}

export const createObserver = ({ targets, events, listener }: TCreateObserver) => {
  const subscribed: SubscribedNode[] = []

  const observer = new MutationObserver((mutationsList) => {
    mutationsList
      .filter((mutation) => mutation.type === 'childList')
      .flatMap((mutation) => Array.from(mutation.addedNodes))
      .filter((node): node is Element => node instanceof Element)
      .forEach((node: Element) => {
        const nodes = getNodes({ node, targets })

        const subscribedNodes = subscribeNodes({ nodes, events, listener })

        subscribed.push(...subscribedNodes)
      })
  })

  observer.observe(document, { childList: true, subtree: true })

  return { observer, subscribed }
}

type TUnsubscribeObserver = {
  observer: MutationObserver
  subscribed: SubscribedNode[]
  loadPage: () => void
  unloadPage: () => void
  listener: (e: Event) => void
}

export const unsubscribeObserver = ({ observer, subscribed, loadPage, unloadPage }: TUnsubscribeObserver) => {
  window.removeEventListener('load', loadPage)
  window.removeEventListener('onbeforeunload', unloadPage)

  unsubscribeNodes(subscribed)

  observer.disconnect()
}
