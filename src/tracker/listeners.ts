import { isInputElement, isButtonElement } from './nodes'
import { createUserEvent } from './events'
import { EventData, HtmlEventData, InfoEventData } from './types'

type Listener = { send: (event: EventData) => void }

export const loadPageListener = ({ send }: Listener) => {
  send({ page_opened: window.location.href })
  send({ window_current_resolution: `${document.body.scrollWidth}x${document.body.scrollHeight}` })
  send({ screen_available_resolution: `${window.screen.availWidth}x${window.screen.availHeight}` })
  send({ platform: `${window.navigator.platform}` })
  send({ user_agent: `${window.navigator.userAgent}` })
}

export const unloadPageListener = ({ send }: Listener) => send({ page_closed: window.location.href })

export const createListener = ({ send }: Listener) => (event: Event) => {
  if (event.target && (isInputElement(event.target) || isButtonElement(event.target))) {
    const data = {
      eventType: event.type,
      tag: event.target.tagName.toLowerCase(),
      name: event.target.name,
      targetType: event.target.type,
      className: event.target.className,
      dataset: event.target.dataset,
    }

    if (event instanceof MouseEvent) {
      Object.assign(data, {
        coordinates: {
          x: event.clientX,
          y: event.clientY,
        },
      })
    }

    send(createUserEvent(data))
  }
}

type TCreateListeners = {
  sendInfo: (payload: InfoEventData) => void
  sendHtml: (payload: HtmlEventData) => void
}

export const createListeners = ({ sendInfo, sendHtml }: TCreateListeners) => {
  const loadPage = () => loadPageListener({ send: sendInfo })
  const unloadPage = () => unloadPageListener({ send: sendInfo })
  const listener = createListener({ send: sendHtml })

  window.addEventListener('load', loadPage)
  window.addEventListener('onbeforeunload', unloadPage)

  return { loadPage, unloadPage, listener }
}
