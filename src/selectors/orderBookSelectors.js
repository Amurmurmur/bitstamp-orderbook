import { createSelector } from 'reselect'

const selectOrderBook = () => (state, props) => state.get("orderbook")

const makeSelectOrderBook = () => createSelector(
    selectOrderBook(),
    (substate) => substate && substate.payload
)

export {
    makeSelectOrderBook,
}