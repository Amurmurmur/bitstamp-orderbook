import { createSelector } from 'reselect'

const selectInstruments = state => state.instruments

const makeSelectInstruments = () => createSelector(
    selectInstruments,
    (substate) => substate && substate.payload
)

const makeSelectInstrumentsFetching = () => createSelector(
    selectInstruments,
    (substate) => substate && substate.fetching
)

export {
    makeSelectInstruments,
    makeSelectInstrumentsFetching
}