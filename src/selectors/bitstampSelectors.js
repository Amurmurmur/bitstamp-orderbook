import { createSelector } from "reselect";

const selectBistamp = () => (state, props) => state.get("bitstamp");

const makeSelectBitstampClient = () =>
  createSelector(
    selectBistamp(),
    substate => substate && substate.client
  );

export { makeSelectBitstampClient };
