import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import queryString from 'query-string'

import {
	Checkbox,
	TextField
} from '@material-ui/core'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import {
	capitalize,
	uppercase
} from '../../utils/various'
import PaymentForm from './payment-form'

import {
	updateUser,
	loadUser
} from '../../actions/auth-actions'

class InitialPayment extends React.Component {
	constructor(props) {
		super(props)

		const { sub } = queryString.parse((this.props.location || {}).search)
		const payingValue = (sub != 1 && sub != 2) ? 10 : (sub == 1 ? 15 : 20)

		this.state = {
			isPrepaying: payingValue,
			automaticTopUp: false,
			isProcessingPayment: false,
			errorMessage: ''
		}

		this.updateUserVideos = this.updateUserVideos.bind(this)
	}

	componentDidMount() {
		const { user, history } = this.props
		if (user.MPUserId) {
			history.push('/dashboard')
		}
	}

	updateUserVideos() {
		const { sub } = queryString.parse(this.props.location.search)
		const {
			user,
			updateUser,
			loadUser
		} = this.props
		const {
			_id,
			myVideos
		} = user
		const {
			isPrepaying,
			automaticTopUp
		} = this.state
		const updatedVideos = myVideos + parseInt(isPrepaying)
		updateUser({
			id: _id,
			myVideos: updatedVideos,
			automaticTopUp,
			subscription: sub != 1 && sub != 2 ? null : (sub == 1 ? 15 : 20)
		}, true)
			.then(() => {
				loadUser()
				this.props.history.push('/dashboard')
			})
	}
	render() {
		const {
			t,
			user
		} = this.props
		const {
			email,
		} = user
		const {
			isPrepaying,
			automaticTopUp,
			isProcessingPayment,
			errorMessage
		} = this.state
		const { sub } = queryString.parse(this.props.location.search)
		return (
			<div className='full-container flex-column flex-center initial-payment'>
				<div className='card billing-card'>
					<div className='small-title' style={{ textAlign: 'center', marginTop: '5px' }}>
						{
						sub == 2 ?
							`${uppercase(t('unlimited'))}` :
							`${uppercase(t('aLaCarte'))}`
						}
					</div>
					<PaymentForm
						customer={user}
						t={t}
						isPrepaying={isPrepaying}
						onSuccess={this.updateUserVideos}
						isProcessingPayment={bool => this.setState({ isProcessingPayment: bool})}
						onError={err => this.setState({
							isProcessingPayment: false,
							errorMessage: err
						})}
					/>
					{
						errorMessage &&
						<div className='medium-text-high red' style={{textAlign: 'center', marginTop: '3px' }}>
							{errorMessage}
						</div>
					}
					{
						(isPrepaying == 15 || isPrepaying == 20) && !isProcessingPayment &&
						<div className='flex-column flex-center'>
							<div className='medium-separator'></div>
							<span className='small-text padded'>{capitalize(t('youCanCancelYourSubscriptionAnytime'))}</span>
						</div>
					}
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					.payment-selection {
						justify-content: space-between;
						align-items: center;
						padding: 0 10px;
						margin-bottom: 10px;
					}
					.payment-type {
						width: 48%;
						height: 93px;
						justify-content: center;
						align-items: center;
						border-radius: 1px;
					}
					.payment-type:hover {
						cursor: pointer;
					}
					@media only screen and (max-width: 640px) {
						.disclaimer {
							padding-bottom: 100px;
						}
					}
				`}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(InitialPayment))