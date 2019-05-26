import { call, put } from "redux-saga/effects";

import { fetchInstrumentsSuccess, fetchInstrumentsFailure } from "../redux/reducers/instruments/actions"

export function* fetchInstruments(api, { instrument }) {
  const response = yield call(api, instrument);

  if (response) {
    yield put(fetchInstrumentsSuccess(response));
  } else {
    yield put(fetchInstrumentsFailure({ error: "Error fetching instruments from Bitstamp" }));
  }
}
