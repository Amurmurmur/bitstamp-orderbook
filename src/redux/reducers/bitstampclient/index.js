import { CONNECT_REQUEST, CONNECT_SUCCESS, CONNECT_FAILURE } from "./constants";

import Immutable from "seamless-immutable";

const defaultState = Immutable({
  fetching: false,
  client: null,
  error: null
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case CONNECT_REQUEST:
      return state.merge({ fetching: true, client: null, error: null });

    case CONNECT_SUCCESS:
      const { payload } = action;
      return state.merge({ fetching: false, client: payload, error: null });

    case CONNECT_FAILURE:
      const { error } = action;
      return state.merge({ fetching: false, error });

    default:
      return state;
  }
};
