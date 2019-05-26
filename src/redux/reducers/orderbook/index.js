import {
  SOCKET_BOOK_MESSAGE,
} from "../bitstampclient/constants";

import Immutable from 'seamless-immutable'

const defaultState = Immutable({
  fetching: false,
  payload: null,
  error: null
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case SOCKET_BOOK_MESSAGE:
      return state.merge({ fetching: false, payload: action.payload, error: null })

    default:
      return state;
  }
};
