import { api } from '../api'

export function releaseFeed(openTimeMs) {
  return api.releaseFeed(openTimeMs)
}

export function getFeedLogs() {
  return api.getFeedLogs()
}
