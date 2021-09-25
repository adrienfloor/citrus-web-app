import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core'
import { withTranslation } from 'react-i18next'

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
import AdminCashout from './containers/admin/cash-out-dashboard'
import ResetPassword from './containers/auth/reset-password'
import AdminDashboard from './containers/admin/admin-dashboard'
import AdminAccountsLedger from './containers/admin/accounts-ledger'
import AdminStoreTransfer from './containers/admin/store-transfer'
import WebApp from './containers/web-app/web-app-layout'

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
    const {
      isAuthenticated,
      notification,
      user
    } = this.props
    let isAdmin = false
    if(user) {
      isAdmin = user.email === 'adrien@thecitrusapp.com' || user.email === 'quentin@thecitrusapp.com'
    }
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
                <Route exact path='/signup' component={Signup} />
                <Route exact path='/reset_password' component={ResetPassword} />
                <PrivateRoute auth={isAuthenticated} path='/app' component={WebApp} />
                <PrivateRoute auth={isAuthenticated} path='/choose-plan' component={ChoosePlan} />
                <PrivateRoute auth={isAuthenticated} path='/download-app' component={DownloadApp} />
                <PrivateRoute auth={isAuthenticated} path='/initial-payment' component={InitialPayment} />
                <PrivateRoute auth={isAuthenticated} path='/dashboard' component={Dashboard} />
                <PrivateRoute auth={isAdmin} path='/admin/dashboard' component={AdminDashboard} />
                <PrivateRoute auth={isAdmin} path='/admin/cashout' component={AdminCashout} />
                <PrivateRoute auth={isAdmin} path='/admin/store_transfer' component={AdminStoreTransfer} />
                <PrivateRoute auth={isAdmin} path='/admin/accounts_ledger' component={AdminAccountsLedger} />
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
