import { takeLatest, all } from "redux-saga/effects";

/** Sagas */
import { fetchInstruments } from "./instrumentsSagas";
import { connectToBitstamp, sendCommand } from "./bitstampSagas";

/** Action types */
import { FETCH_INSTRUMENTS_REQUEST } from "../redux/reducers/instruments/constants";
import { CONNECT_REQUEST, SUBSCRIBE_TO_CHANNEL, UNSUBSCRIBE_FROM_CHANNEL } from "../redux/reducers/bitstampclient/constants";

import { fetchInstruments as instrumentsApi } from "../api";

export default function* root() {
  yield all([
    yield takeLatest(
      FETCH_INSTRUMENTS_REQUEST,
      fetchInstruments,
      instrumentsApi
    ),
    yield takeLatest(CONNECT_REQUEST, connectToBitstamp),
    // yield takeLatest(SUBSCRIBE_TO_CHANNEL, sendCommand),
    // yield takeLatest(UNSUBSCRIBE_FROM_CHANNEL, sendCommand),
  ]);
}
