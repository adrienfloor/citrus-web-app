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
import Loader from 'react-loader-spinner'
import HttpsRedirect from 'react-https-redirect'

import './styling/App.css'
import PrivateRoute from './containers/privateRoute'
import Signin from './containers/auth/signin'
import Signup from './containers/auth/signup'
import NotFound from './components/notFound'
import Dashboard from './containers/dashboard/dashboard'
import AdminCashout from './containers/admin/cash-out-dashboard'
import ResetPassword from './containers/auth/reset-password'
import AdminDashboard from './containers/admin/admin-dashboard'
import AdminAccountsLedger from './containers/admin/accounts-ledger'
import AdminStoreTransfer from './containers/admin/store-transfer'
import PayInConfirmation from './containers/web-app/payments/pay-in-confirmation'

import Home from './containers/web-app/home'
import Explore from './containers/web-app/explore'
import Schedule from './containers/web-app/schedule'
import Profile from './containers/web-app/profile'
import Settings from './containers/web-app/settings'
import BillingFailure from './containers/web-app/payments/billing-failure'

import Layout from './containers/layout'

import { loadUser } from './actions/auth-actions'
import { fetchUserReplays } from './actions/auth-actions'
import { fetchTrainerCoachings } from './actions/coachings-actions'
import { executeExploreSearch } from './actions/search-actions'

const theme = createMuiTheme({
  palette: {
    primary: { main: '#0075FF' }
  }
})

const { REACT_APP_ADMINS } = process.env
const admins = REACT_APP_ADMINS.split(',')

class App extends React.Component {
  constructor(props){
    super(props)
    this.props.loadUser()
    .then(res => {
      const user = res.payload
      if(user) {
        this.props.fetchUserReplays(user._id)
        this.props.fetchTrainerCoachings(user._id, true)
        this.props.executeExploreSearch('all', user._id, 0, 5, user.sports)
      }
    })
    this.notify = this.notify.bind(this)
  }

  notify(notification) {
   return toast(notification)
  }

  render() {
    const {
      isAuthenticated,
      notification,
      user,
      isRedirectingHome
    } = this.props
    let isAdmin = false

    if(user) {
      isAdmin = admins.includes(user.email)
    }

    if (isRedirectingHome) {
      return (
        <div
          className='flex-column flex-center'
          style={{ height: '100%' }}
        >
          <Loader
            type='Oval'
            color='#C2C2C2'
            height={100}
            width={100}
          />
        </div>
      )
    }

    if (isAuthenticated === null) {
      return null
    } else {
      return (
        <HttpsRedirect>
          <BrowserRouter>
            <Layout>
              <MuiThemeProvider theme={theme}>
                <Switch>
                  <Route exact path='/' component={Signin} />
                  <Route exact path='/signin' component={Signin} />
                  <Route exact path='/signup' component={Signup} />
                  <Route exact path='/reset_password' component={ResetPassword} />
                  <Route exact path='/billing_plan' component={BillingFailure} />
                  <Route exact path='/explore' component={Explore} />
                  <PrivateRoute auth={isAuthenticated} path='/home' component={Home} />
                  <PrivateRoute auth={isAuthenticated} path='/schedule' component={Schedule} />
                  <PrivateRoute auth={isAuthenticated} path='/profile' component={Profile} />
                  <PrivateRoute auth={isAuthenticated} path='/settings' component={Settings} />
                  <PrivateRoute auth={isAuthenticated} path='/pay-in-confirmation' component={PayInConfirmation} />
                  <PrivateRoute auth={isAuthenticated} path='/dashboard' component={Dashboard} />
                  <PrivateRoute auth={isAdmin} path='/admin/dashboard' component={AdminDashboard} />
                  <PrivateRoute auth={isAdmin} path='/admin/cashout' component={AdminCashout} />
                  <PrivateRoute auth={isAdmin} path='/admin/store_transfer' component={AdminStoreTransfer} />
                  <PrivateRoute auth={isAdmin} path='/admin/accounts_ledger' component={AdminAccountsLedger} />
                  <Route component={NotFound} />
                </Switch>
              </MuiThemeProvider>
              {
                notification && notification.message &&
                <div onClick={this.notify(notification.message)}>
                </div>
              }
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
              />
            </Layout>
          </BrowserRouter>
        </HttpsRedirect>
      )
    }
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user,
  notification: state.notifications.notification,
  isRedirectingHome: state.navigation.isRedirectingHome
})

const mapDispatchToProps = dispatch => ({
  loadUser: () => dispatch(loadUser()),
  fetchUserReplays: id => dispatch(fetchUserReplays(id)),
  fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
  executeExploreSearch: (sport, userId, skipValue, limit, userFavoriteSports) =>
    dispatch(executeExploreSearch(sport, userId, skipValue, limit, userFavoriteSports))
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
