import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'

// creates the store
export default (rootReducer, rootSaga) => {
  /* ------------- Redux Configuration ------------- */

  const middleware = []
  const enhancers = []

  /* ------------- Saga Middleware ------------- */

  const sagaMonitor = null
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor })
  middleware.push(sagaMiddleware)

  /* ------------- Assemble Middleware ------------- */

  const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

  enhancers.push(applyMiddleware(...middleware))

  const store = createStore(rootReducer, composeEnhancers(...enhancers))

  // kick off root saga
  let sagasManager = sagaMiddleware.run(rootSaga)

  return {
    store,
    sagasManager,
    sagaMiddleware
  }
}
