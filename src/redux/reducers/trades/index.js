import {
    SOCKET_TRADES_MESSAGE,
  } from "../bitstampclient/constants";
  
  import Immutable from 'seamless-immutable'
  
  const defaultState = Immutable({
    fetching: false,
    payload: null,
    ticker: { price_str: "..." },
    error: null
  });
  
  export default (state = defaultState, action) => {
    switch (action.type) {
      case SOCKET_TRADES_MESSAGE:
            const trades = state.payload || [];
            if (trades.length > 30) {
                trades.pop();
            }
        return state.merge({ fetching: false, payload: [action.payload, ...trades], ticker: action.payload, error: null })
      default:
        return state;
    }
  };
  