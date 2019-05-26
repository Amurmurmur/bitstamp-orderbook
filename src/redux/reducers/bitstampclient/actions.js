import {
  CONNECT_REQUEST,
  CONNECT_SUCCESS,
  CONNECT_FAILURE,
  RECONNECT,
  SUBSCRIBE_TO_CHANNEL,
  UNSUBSCRIBE_FROM_CHANNEL
} from "./constants";

export const connectBitstampRequest = () => ({
  type: CONNECT_REQUEST
});

export const connectBitstampSuccess = payload => ({
  type: CONNECT_SUCCESS,
  payload
});

export const connectBitstampFailure = error => ({
  type: CONNECT_FAILURE,
  error
});

export const reconnectBitstamp = () => ({
  type: RECONNECT
});

export const subscribeToChannel = (channel, instrument) => {
  return {
    type: SUBSCRIBE_TO_CHANNEL,
    payload: JSON.stringify({
      event: "bts:subscribe",
      data: {
        channel: `${channel}_${instrument}`
      }
    })
  };
};

export const unsubscribeFromChannel = (channel, instrument) => ({
  type: UNSUBSCRIBE_FROM_CHANNEL,
  payload: JSON.stringify({
    event: "bts:unsubscribe",
    data: {
      channel: `${channel}_${instrument}`
    }
  })
});
