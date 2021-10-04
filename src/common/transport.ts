import ky, { Options } from 'ky'

export const post = <T = {}>(url: string, options?: Options) => ky.post(url, options).json()
