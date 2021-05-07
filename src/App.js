import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './styling/App.css'
import PrivateRoute from './containers/privateRoute'
import Signin from './containers/auth/signin'
import Signup from './containers/auth/signup'
import NotFound from './components/notFound'
import ChoosePlan from './containers/choose-plan'
import DownloadApp from './containers/download-app'
import InitialPayment from './containers/mangopay/initial-payment'
import Dashboard from './containers/dashboard/dashboard'

import Layout from './containers/layout'

import { loadUser } from './actions/auth-actions'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#0075FF' }
  }
})

class App extends React.Component {
  constructor(props){
    super(props)
    this.props.loadUser()
    this.notify = this.notify.bind(this)
  }

  notify(notification) {
   return toast(notification)
  }

  render() {
    const { isAuthenticated, notification } = this.props
    if (isAuthenticated === null) {
      return null
    } else {
      return (
        <Layout>
          <MuiThemeProvider theme={theme}>
            <BrowserRouter>
              <Switch>
                <Route exact path='/' component={Signin} />
                <Route exact path='/signin' component={Signin} />
                <Route path='/signup' component={Signup} />
                <PrivateRoute auth={isAuthenticated} path='/choose-plan' component={ChoosePlan} />
                <PrivateRoute auth={isAuthenticated} path='/download-app' component={DownloadApp} />
                <PrivateRoute auth={isAuthenticated} path='/initial-payment' component={InitialPayment} />
                <PrivateRoute auth={isAuthenticated} path='/dashboard' component={Dashboard} />
                <Route component={NotFound} />
              </Switch>
            </BrowserRouter>
          </MuiThemeProvider>
          {
            notification && notification.message &&
            <div onClick={this.notify(notification.message)}>
              <ToastContainer />
            </div>
          }
        </Layout>
      )
    }
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
  notification: state.notifications.notification
})

const mapDispatchToProps = dispatch => ({
  loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
