import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import qs from 'query-string'
import { Link } from 'react-router-dom'

import { ReactComponent as Close } from '../../../assets/svg/close.svg'
import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'

import { updateUser } from '../../../actions/auth-actions'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import { capitalize } from '../../../utils/various'

import { fetchPayIn } from '../../../services/mangopay'

class PayInConfirmation extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: true,
			isFailure: null,
			errorMessage: ''
		}
	}

	componentDidMount() {
		const { location, updateUser, user, t } = this.props
		const transactionId = qs.parse(location.search, { ignoreQueryPrefix: true }).transactionId
		const isALaCarte = qs.parse(location.search, { ignoreQueryPrefix: true }).alacarte

		if(isALaCarte) {
			return this.setState({
				isLoading: false,
				isFailure: false,
				isALaCarte: true
			})
		}
		let credits = 10
		let billingDate = new Date().getUTCDate()

		if (billingDate > 27 && billingDate < 32) {
			billingDate = 28
		}

		if (user.pastTransactionsIds.includes(transactionId)) {
			return this.setState({
				isLoading: false,
				isFailure: true,
				errorMessage: capitalize(t('thisTransactionHasAlreadyBeenProcessed'))
			})
		}

		if (transactionId) {
			fetchPayIn(transactionId)
				.then(res => {
					if (res && res.Status === 'SUCCEEDED') {
						if (res.CreditedFunds.Amount == 2000) {
							credits = 20
						}
						if (res.CreditedFunds.Amount == 3000) {
							credits = 30
						}
						updateUser({
							id: user._id,
							subscription: res.CreditedFunds.Amount / 100,
							billingDate: user.billingDate ? user.billingDate : billingDate,
							credits: user.credits + credits,
							pastTransactionsIds: [...user.pastTransactionsIds, transactionId]
						})
							.then(() => {
								return this.setState({
									isLoading: false,
									isFailure: false
								})
							})
					} else {
						return this.setState({
							isLoading: false,
							isFailure: true,
							errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
						})
					}
				})
		}
	}

	render() {
		const {
			t,
			user
		} = this.props
		const {
			isLoading,
			isFailure,
			errorMessage,
			isALaCarte
		} = this.state

		if (isLoading) {
			return (
				<div
					className='flex-center my-plan-container'
					style={{ justifyContent: 'center' }}
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

		if(isFailure) {
			return (
				<div
					className='full-container flex-column flex-center my-plan-container'
					style={{ justifyContent: 'center' }}
				>
					<span className='small-title citrusBlack'>
						{capitalize(t('somethingWentWrong'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text citrusBlack'>
						{errorMessage}
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<Link to='/home' className='filled-button'>
						<span className='small-title citrusWhite'>
							{capitalize(t('goBackToHomePage'))}
						</span>
					</Link>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column flex-center my-plan-container'
				style={{ justifyContent: 'center' }}
			>
				<span className='small-title citrusBlack'>
					{capitalize(t('congratulations'))}
				</span>
				<div className='small-separator'></div>
				<span className='small-text citrusBlack'>
					{
						isALaCarte ?
						capitalize(t('youAreNowGoingALaCarte')) :
						capitalize(t('thisTransactionHasBeenProcessedSuccessfully'))
					}
				</span>
				<div className='small-separator'></div>
				<div className='medium-separator'></div>
				<Link to='/explore' className='filled-button'>
					<span className='small-title citrusWhite'>
						{capitalize(t('startTrainingNow'))}
					</span>
				</Link>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	updateUser: userInfo => dispatch(updateUser(userInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PayInConfirmation))