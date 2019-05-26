import {
  FETCH_INSTRUMENTS_REQUEST,
  FETCH_INSTRUMENTS_SUCCESS,
  FETCH_INSTRUMENTS_FAILURE
} from "./constants";

import Immutable from "seamless-immutable";

const defaultState = Immutable({
  fetching: false,
  payload: null,
  error: null
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_INSTRUMENTS_REQUEST:
      return state.merge({ fetching: true, payload: null, error: null });

    case FETCH_INSTRUMENTS_SUCCESS:
      const { payload } = action;
      return state.merge({ fetching: false, payload, error: null });

    case FETCH_INSTRUMENTS_FAILURE:
      const { error } = action;
      return state.merge({ fetching: false, error });

    default:
      return state;
  }
};
