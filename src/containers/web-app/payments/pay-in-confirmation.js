import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import qs from 'query-string'
import { Link } from 'react-router-dom'

import Card from '../../../components/web-app/card'
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

import {
	capitalize,
	returnCurrencyCode,
	returnCurrency,
	returnNextBillingDate,
	titleCase
} from '../../../utils/various'

import {
	fetchPayIn,
	createMpTransfer,
	createPayinRefund,
	createMpCardDirectPayin
} from '../../../services/mangopay'

class PayInConfirmation extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: true,
			isFailure: null,
			errorMessage: '',
			coachingId: null,
			coaching: null,
			coachInfo: null,
			subscription: null,
			// hasUpdatedPlan: false,
			hasUpdatedCard: false
		}
		this.handleBuyCoaching = this.handleBuyCoaching.bind(this)
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
		// const hasUpdatedPlan = qs.parse(location.search, { ignoreQueryPrefix: true }).updateplan
		const hasUpdatedCard = qs.parse(location.search, { ignoreQueryPrefix: true }).updatecard
		// const payinId = qs.parse(location.search, { ignoreQueryPrefix: true }).payin

		let billingDate = new Date().getDate()
		const lastBillingMonth = new Date().getMonth()
		const lastBillingYear = new Date().getFullYear()
		if (billingDate > 27 && billingDate < 32) {
			billingDate = 28
		}

		if(hasUpdatedCard && transactionId) {
			return fetchPayIn(transactionId)
				.then(payin => {
					console.log('::: pay in :::', payin)
					if(payin && payin.Id && payin.Status == 'SUCCEEDED') {
						createPayinRefund(payin.Id, user.MPUserId)
							.then(refund => {
								console.log('refund response : ', refund)
								if (refund && (refund.Status == 'CREATED' || refund.Status == 'SUCCEEDED')) {
									return this.setState({
										isLoading: false,
										hasUpdatedCard: true
									})
								} else {
									return this.setState({
										isLoading: false,
										isFailure: true,
										errorMessage: refund.ResultMessage
									})
								}
							})
					} else {
						return this.setState({
							isLoading: false,
							isFailure: true,
							errorMessage: payin.ResultMessage
						})
					}
				})
		}

		// if (hasUpdatedPlan) {
		// 	this.setState({ hasUpdatedPlan })
		// }
		if(coachingId) {
			this.setState({ coachingId })
		}
		if(isALaCarte) {
			this.setState({ isALaCarte: true })
		}

		if(isALaCarte && !coachingId) {
			return this.setState({
				isLoading: false,
				isFailure: false
			})
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
					console.log('pay-in-confirmation ::: fetch paying response : ', res)
					if (res && res.Status === 'SUCCEEDED' && res.CreditedFunds) {
						this.setState({ subscription: res.CreditedFunds.Amount / 100 })
						createMpTransfer(
							null,
							{
								"Amount": res.CreditedFunds.Amount / 100,
								"Currency": returnCurrencyCode(moment.locale())
							},
							user.MPUserId,
							true
						)
						.then(res => {
							console.log('res from transfer : ', res)
							if (res && res.Status === 'SUCCEEDED') {
								if (coachingId) {
									// Fetch coaching to get info
									fetchCoaching(coachingId)
										.then(res => {
											console.log('pay-in-confirmation ::: fetch coaching response : ', res)
											const { coaching } = res.payload
											const { coachId, numberOfViewers, price } = coaching
											this.setState({ coaching })
											// Fetch coach info
											fetchUserInfo(coachId)
												.then(res => {
													console.log('pay-in-confirmation ::: fetch coach info response : ', res)
													const coachInfo = res.payload
													this.setState({ coachInfo })
													updateUser({
														id: user._id,
														subscription: this.state.subscription,
														billingDate,
														lastBillingMonth,
														lastBillingYear,
														pastTransactionsIds: [...user.pastTransactionsIds, transactionId],
														hasCreditCardFailed: false
													}, true)
														.then(() => {
															if (isALaCarte) {
																this.handleBuyCoaching()
															} else {
																this.setState({ isLoading: false })
															}
														})
												})
												.catch(e => console.log('catchhhh : ', e))
										})
										.catch(e => console.log('catchhhh : ', e))
								} else {
									updateUser({
										id: user._id,
										subscription: res.CreditedFunds.Amount / 100,
										billingDate,
										lastBillingMonth,
										lastBillingYear,
										pastTransactionsIds: [...user.pastTransactionsIds, transactionId],
										hasCreditCardFailed: false
									}, true)
										.then(res => {
											return this.setState({
												isLoading: false,
												isFailure: false
											})
										})
								}
							}
						})
					} else {
						return this.setState({
							isLoading: false,
							isFailure: true
						})
					}
				})
		} else {
			// if (hasUpdatedPlan) {
			// 	return this.setState({
			// 		isLoading: false,
			// 		isFailure: false
			// 	})
			// } else {
				return this.setState({
					isLoading: false,
					isFailure: true,
					errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
				})
			// }
		}
	}


	handleBuyCoaching() {
		const {
			coaching,
			coachInfo,
			subscription,
			isALaCarte
		} = this.state
		const {
			location,
			updateUser,
			user,
			t,
			fetchUserReplays,
			fetchUserInfo,
			fetchCoaching,
			updateCoaching,
			history
		} = this.props

		this.setState({ isLoading: true })

		createMpCardDirectPayin(
			user.MPUserId,
			{
				"Amount": user.subscription ? coaching.price * 100 : (coaching.price + 1) * 100,
				"Currency": returnCurrencyCode(moment.locale())
			},
			{
				"Amount": user.subscription ? 0 : 100,
				"Currency": returnCurrencyCode(moment.locale())
			}
		)
		.then(res => {
			console.log('res form direct pay in : ', res)
			if (res && res.Status === "SUCCEEDED") {
				// Transfer amount from user wallet to coach wallet while handling Citrus fees
				createMpTransfer(
					coachInfo.MPLegalUserId,
					{
						"Amount": coaching.price,
						"Currency": returnCurrencyCode(moment.locale())
					},
					user.MPUserId
				)
				.then(res => {
					console.log('res from transfer : ', res)
					if (res && res.Status === 'SUCCEEDED') {
						// Update buyer profile
						updateUser({
							id: user._id,
							myReplays: [
								coaching,
								...user.myReplays
							]
						}, true)
							.then(res => {
								// Fetch updated replays of user
								fetchUserReplays(user._id)
									.then(() => {
										// Launch video
										this.setState({
											isLoading: false
										})
										history.push(`/home?coaching=${coaching._id}&play=true`)
									})
								// Update coaching
								updateCoaching({
									_id: coaching._id,
									numberOfViewers: coaching.numberOfViewers + 1
								})
								// Update coach profile
								updateUser({
									id: coaching.coachId,
									lifeTimeGains: coachInfo.lifeTimeGains + ((Math.round(((coaching.price * 0.7) + Number.EPSILON) * 100)) / 100)
								})
							})
					} else {
						this.setState({
							isLoading: false,
							isFailure: true,
							errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
						})
					}
				})
			}
		})
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
			coachingId,
			coaching,
			hasUpdatedCard
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
					<div
						className='flex-column flex-center'
						style={{ maxWidth: '454px' }}
					>
						<span className='small-title citrusBlack'>
							{capitalize(t('somethingWentWrongProcessingTheTransaction'))}
						</span>
						<div className='medium-separator'></div>
						<span
							style={{ width: '100%' }}
							className='small-text citrusBlack'
						>
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
				</div>
			)
		}


		if (hasUpdatedCard) {
			return (
				<div
					className='full-container flex-column flex-center my-plan-container'
					style={{ justifyContent: 'center' }}
				>
					<div
						className='flex-column flex-center'
						style={{ maxWidth: '454px' }}
					>
						<span
							className='big-title citrusBlack'
							style={{ width: '100%' }}
						>
							{capitalize(t('congratulations'))}
						</span>
						<div className='medium-separator'></div>
						<span
							style={{ width: '100%' }}
							className='small-text citrusBlack'
						>
							{capitalize(t('yourCardHasBeenUpdatedSuccessfully'))}
						</span>
						<div className='small-separator'></div>
						<div className='medium-separator'></div>
						<Link to='/home' className='filled-button'>
							<span className='small-title citrusWhite'>
								{capitalize(t('goBackToHomePage'))}
							</span>
						</Link>
					</div>
				</div>
			)
		}

		const currency = returnCurrency(moment.locale())

		return (
			<div
				className='full-container flex-column flex-center pay-in-confirmation-container'
				style={{ justifyContent: 'center' }}
			>
				<div
					className='flex-column'
					style={{ maxWidth: '454px' }}
				>
					<span
						className='big-title citrusBlack'
						style={{ marginTop: '80px' }}
						style={{ width: '100%' }}
					>
						{capitalize(t('congratulations'))}
					</span>
					<span className='small-text citrusBlack'>
						{
							isALaCarte && !coachingId &&
							capitalize(t('youAreNowGoingALaCarte'))
						}
						{
							coachingId &&
							capitalize(t('thisTransactionHasBeenProcessedSuccessfully'))
						}
					</span>
					<div className='small-separator'></div>
					{
						!isALaCarte && user && user.subscription &&
						<>
							<span className='small-text citrusBlack'>
								{`${capitalize(t('youReNowAPremiumMember'))} - ${user.subscription}${currency} / ${user.subscription === 4.99 ? t('month') : t('year')}`}
							</span>
							<div className='small-separator'></div>
							<span className='small-text citrusBlack'>
								{
									user.subscription === 4.99 ?
										`${capitalize(t('renewOn'))} ${returnNextBillingDate(user.billingDate, moment.locale())}` :
										`${capitalize(t('renewOn'))} ${returnNextBillingDate(user.billingDate, moment.locale(), user.lastBillingMonth, user.lastBillingYear)}`
								}
							</span>
						</>
					}
					{
						!isALaCarte && coachingId &&
						<div className='flex-column'>
							<div className='big-separator'></div>
							<div style={{ height: '2px', maxWidth: '454px', width: '100%', backgroundColor: '#C2C2C2' }}></div>
							<div className='big-separator'></div>
							<span className='medium-title citrusBlack'>
								{`${capitalize(t('doYouWantToPurchaseTheCoaching'))}`}
							</span>
							<div className='medium-separator'></div>
							<Card
								size='large'
								title={titleCase(coaching.title)}
								subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${capitalize(coaching.coachUserName)}`}
								imgUri={coaching.pictureUri}
							/>
							<div className='small-separator'></div>
						</div>
					}
					<div className='medium-separator'></div>
					{
						coachingId && isALaCarte &&
						<Link to={`/home?coaching=${coachingId}`} className='filled-button'>
							<span className='small-title citrusWhite'>
								{capitalize(t('startMyTrainingNow'))}
							</span>
						</Link>
					}
					{
						coachingId && !isALaCarte &&
						<>
							<div
								className='filled-button'
								onClick={this.handleBuyCoaching}
							>
								<span className='small-title citrusWhite'>
									{`${capitalize(t('purchaseCoachingFor'))} ${coaching.price}${currency}`}
								</span>
							</div>
							<div className='small-separator'></div>
							<div style={{ width: '100%', marginBottom: '20px' }} className='flex-center'>
								<Link
									to='/home'
									className='extra-small-text-bold hover citrusGrey'
									style={{
										width: 'max-content',
										textDecoration: 'underline'
									}}
								>
									{capitalize(t('noTakeMeHome'))}
								</Link>
								<div className='medium-separator'></div>
								<div className='mobile-only-medium-separator'></div>
								<div className='mobile-only-medium-separator'></div>
							</div>
						</>
					}
					{ !coachingId &&
						<Link to='/explore' className='filled-button'>
							<span className='small-title citrusWhite'>
								{capitalize(t('startTrainingNow'))}
							</span>
						</Link>
					}
				</div>
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