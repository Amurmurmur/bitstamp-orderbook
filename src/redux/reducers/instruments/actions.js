import {
  FETCH_INSTRUMENTS_REQUEST,
  FETCH_INSTRUMENTS_SUCCESS,
  FETCH_INSTRUMENTS_FAILURE
} from "./constants";

export const fetchInstrumentsRequest = () => ({
  type: FETCH_INSTRUMENTS_REQUEST
});

export const fetchInstrumentsSuccess = payload => ({
  type: FETCH_INSTRUMENTS_SUCCESS,
  payload
});

export const fetchInstrumentsFailure = error => ({
  type: FETCH_INSTRUMENTS_FAILURE,
  error
});
