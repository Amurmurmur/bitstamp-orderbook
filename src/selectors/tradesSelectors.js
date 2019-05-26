import { createSelector } from "reselect";

const selectTrades = () => (state, props) => state.get("trades");

const makeSelectTrades = () =>
  createSelector(
    selectTrades(),
    substate => substate && substate.payload
  );

const makeSelectTicker = () =>
  createSelector(
    selectTrades(),
    substate => substate && substate.ticker
  );

export { makeSelectTrades, makeSelectTicker };
