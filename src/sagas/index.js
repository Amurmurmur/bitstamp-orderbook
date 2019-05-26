import { takeLatest, all } from "redux-saga/effects";
import { FETCH_INSTRUMENTS_REQUEST } from "../redux/reducers/instruments/constants";
import { fetchInstruments } from "./instrumentsSagas";

import { fetchInstruments as instrumentsApi } from '../api';
// import bookSaga from './bookSaga'
// import tradesSaga from './tradesSaga'

export default function* root() {
  yield all([
      yield takeLatest(FETCH_INSTRUMENTS_REQUEST, fetchInstruments, instrumentsApi)
    
    ]);
  // yield takeLatest(types.BOOK_REQUEST, bookSaga)
  // yield takeEvery(types.TRADES_REQUEST, tradesSaga)
}
