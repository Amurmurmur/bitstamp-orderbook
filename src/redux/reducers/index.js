import { combineReducers } from 'redux-immutable'

import orderbook from './orderbook/'
import trades from './trades/'
import bitstamp from './bitstampclient/'
import instruments from './instruments/'
import {reducer as notifications} from 'react-notification-system-redux';


export default combineReducers({
  trades,
  orderbook,
  bitstamp,
  instruments,
  notifications,
})