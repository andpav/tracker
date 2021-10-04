import { v4 as generateUuidV4 } from 'uuid'

export type UUID = string

export const getLocalStorageUuid = () => {
  const currentUuid = localStorage.getItem('__uuid')
  if (currentUuid) {
    return currentUuid
  }

  const newUuid = generateUuidV4()

  localStorage.setItem('__uuid', newUuid)

  return newUuid
}

export const getSessionStorageUuid = () => {
  const currentUuid = sessionStorage.getItem('__uuid')
  if (currentUuid) {
    return currentUuid
  }

  const newUuid = generateUuidV4()

  sessionStorage.setItem('__uuid', newUuid)

  return newUuid
}

export const getRuntimeUuid = () => generateUuidV4()
