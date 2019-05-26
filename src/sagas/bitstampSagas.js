import { call, put, take, fork, cancel } from "redux-saga/effects";
import { eventChannel } from "redux-saga";

import {
  SOCKET_CLOSE,
  SOCKET_ERROR,
  SOCKET_BOOK_MESSAGE,
  SOCKET_TRADES_MESSAGE,
  SUBSCRIBE_TO_CHANNEL,
  UNSUBSCRIBE_FROM_CHANNEL
} from "../redux/reducers/bitstampclient/constants";

/**
 * Websocket lib
 */
import { w3cwebsocket as W3CWebSocket } from "websocket";

import { success } from "react-notification-system-redux";

const notificationOpts = {
  title: "Success",
  message: "",
  position: "tr",
  autoDismiss: 3000,
  action: {
    label: "Close",
    callback: () => {}
  }
};

const intital_order_book_subscription_payload = {
  event: "bts:subscribe",
  data: {
    channel: `order_book_btcusd`
  }
};

const intital_ticker_subscription_payload = {
  event: "bts:subscribe",
  data: {
    channel: `live_trades_btcusd`
  }
};

function connect() {
  const socket = new W3CWebSocket("wss://ws.bitstamp.net");
  return new Promise(resolve => {
    socket.onopen = e => {
      resolve(socket);
    };
  });
}

function subscribe(socketClient) {
  return eventChannel(emitter => {
    socketClient.onclose = e =>
      emitter({
        type: SOCKET_CLOSE
      });

    socketClient.onerror = err =>
      emitter({
        type: SOCKET_ERROR,
        payload: err
      });

    socketClient.onmessage = e => {
      const response = JSON.parse(e.data);
      switch (response.event) {
        case "data":
          emitter({
            type: SOCKET_BOOK_MESSAGE,
            payload: response.data
          });
          break;
        case "trade":
          emitter({
            type: SOCKET_TRADES_MESSAGE,
            payload: response.data
          });
          break;
        default:
          break;
      }
    };

    return socketClient.close;
  });
}

function* read(socket) {
  const channel = yield call(subscribe, socket);
  while (true) {
    let action = yield take(channel);
    yield put(action);
  }
}

function* write(socket) {
  while (true) {
    const { payload } = yield take([
      SUBSCRIBE_TO_CHANNEL,
      UNSUBSCRIBE_FROM_CHANNEL
    ]);
    socket.send(payload);
  }
}

function* handleIO(socket) {
  yield fork(read, socket);
  yield fork(write, socket);
}

export function* connectToBitstamp() {
  while (true) {
    // let { payload } = yield take(CONNECT_R);
    const socket = yield call(connect);

    socket.send(JSON.stringify(intital_order_book_subscription_payload));
    socket.send(JSON.stringify(intital_ticker_subscription_payload));
    notificationOpts.message = "Successfully connected to Bitstamp!";
    yield put(success(notificationOpts));

    const task = yield fork(handleIO, socket);

    yield take(`END_SESSION_OR_SOMETHING`);
    yield cancel(task);
    // socket.send('END');
  }
}
