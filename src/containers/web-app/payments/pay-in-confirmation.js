import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import qs from 'query-string'
import { Link } from 'react-router-dom'

import { ReactComponent as Close } from '../../../assets/svg/close.svg'
import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'

import {
	updateUser,
	fetchUserReplays,
	fetchUserInfo
} from '../../../actions/auth-actions'
import {
	fetchCoaching,
	updateCoaching
} from '../../../actions/coachings-actions'

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
			errorMessage: '',
			coachingId: null
		}
	}

	componentDidMount() {
		const {
			location,
			updateUser,
			user,
			t,
			fetchUserReplays,
			fetchUserInfo,
			fetchCoaching,
			updateCoaching
		} = this.props
		const transactionId = qs.parse(location.search, { ignoreQueryPrefix: true }).transactionId
		const isALaCarte = qs.parse(location.search, { ignoreQueryPrefix: true }).alacarte
		const coachingId = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching

		if(coachingId) {
			this.setState({ coachingId })
		}

		if(isALaCarte) {
			return this.setState({
				isLoading: false,
				isFailure: false,
				isALaCarte: true
			})
		}

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
						if(coachingId) {
							// Fetch coaching to get info
							fetchCoaching(coachingId)
							.then(res => {
								console.log('fetch coaching res : ', res)
								const { coaching } = res.payload
								const { coachId, numberOfViewers, price } = coaching
								// Fetch coach info
								fetchUserInfo(coachId)
								.then(res => {
									console.log('fetch user inf res : ', res)
									const gains = res.payload.lifeTimeGains
									// Update coach profile
									updateUser({
										id: coachId,
										lifeTimeGains: gains + (price * 0.7)
									})
									// Update coaching
									updateCoaching({
										_id: coachingId,
										numberOfViewers: numberOfViewers + 1
									})
								})
								.catch(e => console.log('catchhhh : ', e))
								// Update buyer profile
								updateUser({
									id: user._id,
									myReplays: [
										coaching,
										...user.myReplays
									]
								}, true).then(() => {
									// Fetch buyer new replay
									fetchUserReplays(user._id)
								})
								.catch(e => console.log('catchhhh : ', e))
							})
							.catch(e => console.log('catchhhh : ', e))
						}

						if(isALaCarte) {
							updateUser({
								id: user._id,
								pastTransactionsIds: [...user.pastTransactionsIds, transactionId]
							}, true)
							.then(() => {
								return this.setState({
									isLoading: false,
									isFailure: false
								})
							})
						} else {
							updateUser({
								id: user._id,
								subscription: res.CreditedFunds.Amount / 100,
								billingDate: user.billingDate ? user.billingDate : billingDate,
								pastTransactionsIds: [...user.pastTransactionsIds, transactionId]
							}, true)
							.then(() => {
								return this.setState({
									isLoading: false,
									isFailure: false
								})
							})
						}
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
			isALaCarte,
			coachingId
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
				{
					coachingId ?
					<Link to={`/home?coaching=${coachingId}`} className='filled-button'>
						<span className='small-title citrusWhite'>
							{capitalize(t('startMyTrainingNow'))}
						</span>
					</Link> :
					<Link to='/explore' className='filled-button'>
						<span className='small-title citrusWhite'>
							{capitalize(t('startTrainingNow'))}
						</span>
					</Link>
				}
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	fetchCoaching: id => dispatch(fetchCoaching(id)),
	updateCoaching: coaching => dispatch(updateCoaching(coaching)),
	fetchUserInfo: id => dispatch(fetchUserInfo(id)),
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	fetchUserReplays: id => dispatch(fetchUserReplays(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PayInConfirmation))