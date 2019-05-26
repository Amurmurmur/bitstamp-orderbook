import { createSelector } from 'reselect'

const selectOrderBook = state => state.orderbook

const makeSelectOrderBook = () => createSelector(
    selectOrderBook,
    (substate) => substate && substate.payload
)

export default {
    makeSelectOrderBook
}