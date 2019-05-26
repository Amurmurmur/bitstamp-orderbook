import { call, put, take, select, fork, cancel } from "redux-saga/effects";
import { eventChannel } from "redux-saga";

import {
  SOCKET_OPEN,
  SOCKET_CLOSE,
  SOCKET_ERROR,
  SOCKET_BOOK_MESSAGE,
  SOCKET_TRADES_MESSAGE,
  CONNECT_SUCCESS,
  SUBSCRIBE_TO_CHANNEL,
  UNSUBSCRIBE_FROM_CHANNEL
} from "../redux/reducers/bitstampclient/constants";

import { makeSelectBitstampClient } from "../selectors";
import { w3cwebsocket as W3CWebSocket } from "websocket";

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
    const { payload } = yield take([SUBSCRIBE_TO_CHANNEL, UNSUBSCRIBE_FROM_CHANNEL]);
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
    // socket.emit('login', { username: payload.username });

    socket.send(JSON.stringify(intital_order_book_subscription_payload));
    socket.send(JSON.stringify(intital_ticker_subscription_payload));

    const task = yield fork(handleIO, socket);

    let action = yield take(`LOGOUT`);
    yield cancel(task);
    // socket.emit('logout');
  }
}

// const connectToBistamp = action =>
//   eventChannel(emitter => {
//     const socketClient = new W3CWebSocket("wss://ws.bitstamp.net");
//     socketClient.onopen = e => {
//       emitter({
//         type: SOCKET_OPEN
//       });
//       socketClient.send(
//         JSON.stringify(intital_order_book_subscription_payload)
//       );
//       socketClient.send(JSON.stringify(intital_ticker_subscription_payload));
//       emitter({
//         type: CONNECT_SUCCESS,
//         payload: socketClient
//       });
//     };

//     socketClient.onclose = e =>
//       emitter({
//         type: SOCKET_CLOSE
//       });

//     socketClient.onerror = err =>
//       emitter({
//         type: SOCKET_ERROR,
//         payload: err
//       });

//     socketClient.onmessage = e => {
//       const response = JSON.parse(e.data);
//       switch (response.event) {
//         case "data":
//           emitter({
//             type: SOCKET_BOOK_MESSAGE,
//             payload: response.data
//           });
//           break;
//         case "trade":
//           emitter({
//             type: SOCKET_TRADES_MESSAGE,
//             payload: response.data
//           });
//           break;
//         default:
//           break;
//       }
//     };

//     return socketClient.close;
//   });

// export function* connectToBitstamp(action) {
//   const channel = yield call(connectToBistamp, action);

//   while (true) {
//     const action = yield take(channel);
//     yield put(action);
//   }
// }

// export function* connectToBitstamp(action) {
//   const channel = yield call(flow, action);

//   while (true) {
//     const action = yield take(channel);
//     yield put(action);
//   }
// }

export function* sendCommand(action) {
  const bistampClient = yield select(makeSelectBitstampClient()); // new W3CWebSocket("wss://ws.bitstamp.net");
  yield call(bistampClient.send, action.payload);
}
