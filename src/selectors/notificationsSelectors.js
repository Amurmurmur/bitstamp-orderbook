import { createSelector } from "reselect";

const selectNotifications = () => (state, props) => state.get("notifications");

const makeSelectNotifications = () =>
  createSelector(
    selectNotifications(),
    substate => substate
  );

export { makeSelectNotifications };
