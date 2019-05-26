import { createSelector } from "reselect";
// import { getInstrument } from "../utils/helpers"

const selectInstruments = () => (state, props) => state.get("instruments");

const makeSelectInstruments = () =>
  createSelector(
    selectInstruments(),
    substate => substate && substate.payload
  );

const makeSelectInstrumentsFetching = () =>
  createSelector(
    selectInstruments(),
    substate => substate && substate.fetching
  );

const makeSelectSelectedInstrument = () =>
  createSelector(
    selectInstruments(),
    substate => (substate && substate.selectedInstrument) || ""
  );

const makeSelectInstrument = () =>
  createSelector(
    makeSelectInstruments(),
    makeSelectSelectedInstrument(),
    (instruments, selectedInstrument) => {} //getInstrument(instruments, selectedInstrument)
  );

export {
  makeSelectInstruments,
  makeSelectInstrumentsFetching,
  makeSelectInstrument
};
