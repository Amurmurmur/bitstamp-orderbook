import { combineReducers } from 'redux-immutable'

import orderbook from './orderbook/'
import trades from './trades/'
import bitstamp from './bitstampclient/'
import instruments from './instruments/'

export default combineReducers({
  trades,
  orderbook,
  bitstamp,
  instruments,
})