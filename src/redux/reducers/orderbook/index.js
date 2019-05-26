import {
  SOCKET_BOOK_MESSAGE,
  UNSUBSCRIBE_FROM_CHANNEL
} from "../bitstampclient/constants";

import Immutable from "seamless-immutable";

const defaultState = Immutable({
  fetching: false,
  payload: null,
  error: null
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case SOCKET_BOOK_MESSAGE:
      return state.merge({
        fetching: false,
        payload: action.payload,
        error: null
      });
    case UNSUBSCRIBE_FROM_CHANNEL:
      return state.merge(defaultState);
    default:
      return state;
  }
};
