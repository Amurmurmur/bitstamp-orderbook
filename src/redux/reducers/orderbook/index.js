import {  } from './constants'

import { fromJS } from 'immutable'
import * as messages from '../utils/messages'
import { Map, List, SortedMap } from 'immutable-sorted'

const comparePrice = (currKey, nextKey) => {
  const currPrice = Number(currKey)
  const nextPrice = Number(nextKey)
  if (currPrice < nextPrice) return -1
  else if (currPrice > nextPrice) return 1
  else return 0
}

const defaultState = fromJS({
  book: Map({
    asks: SortedMap([], comparePrice),
    bids: SortedMap([], comparePrice),
    hasReceivedSnapshot: false,
    queuedMessages: List([])
  }),
})

/* Book Balancing Logic:
 * https://docs.gdax.com/#real-time-order-book
 */
export default (state = defaultState, action) => {
  switch (action.type) {
    case types.BOOK_SUCCESS :
      return messages.applyQueuedMessages(state, action.payload)

    case types.SOCKET_MESSAGE :
      return state.get('hasReceivedSnapshot')
        ? messages.applyMessage(state, action.payload)
        : messages.queueMessage(state, action.payload)

    default:
      return state
  }
}