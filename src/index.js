import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import loggerMiddleware from 'redux-logger'
import rootReducer from './reducers'
import './i18n'
import App from './App'

const { REACT_APP_ENV } = process.env

const initialState = {}
const enhancers = []
const middlewares = REACT_APP_ENV === 'production' ? [thunkMiddleware] : [thunkMiddleware, loggerMiddleware]
const composedEnhancers = compose(applyMiddleware(...middlewares), ...enhancers)

const store = createStore(rootReducer, initialState, composedEnhancers)

if (REACT_APP_ENV === 'production') {
  console.log = console.warn = console.error = () => { }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)