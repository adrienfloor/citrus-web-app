import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import loggerMiddleware from 'redux-logger'
import rootReducer from './reducers'
import './i18n'
import App from './App'

const initialState = {}
const enhancers = []
const middlewares = [thunkMiddleware, loggerMiddleware]
const composedEnhancers = compose(applyMiddleware(...middlewares), ...enhancers)

const store = createStore(rootReducer, initialState, composedEnhancers)

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)