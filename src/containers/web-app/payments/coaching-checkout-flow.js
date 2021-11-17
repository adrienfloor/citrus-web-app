import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'

import CreditCardForm from './credit-card-form'
import PlanCard from '../../../components/web-app/plan-card'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'
import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'

import { updateUser } from '../../../actions/auth-actions'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import {
	capitalize,
	returnCurrency,
	returnCurrencyCode
} from '../../../utils/various'

import {
	fetchMpCardInfo,
	createRecurringPayinRegistration,
	createRecurringPayinCIT,
	fetchPayIn,
	updateRecurringPayinRegistration,
	createMpCardDirectPayin
} from '../../../services/mangopay'

let plansTypes = [10, 20, 30]

class CoachingCheckout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			planType: 10,
			loadingMessage: '',
			cardId: '',
			isCheckingOut: this.props.type === 'aLaCarte',
			errorMessage: null
		}

		if (this.props.currentPlan === 10) {
			plansTypes = [20, 30]
		}
		if (this.props.currentPlan === 20) {
			plansTypes = [30]
		}

		this.returnPlanTypeTitle = this.returnPlanTypeTitle.bind(this)
		this.handleSubscribe = this.handleSubscribe.bind(this)
	}

	async componentDidMount() {
		const { user, t } = this.props
		const { MPUserId } = user

		const cardInfo = await fetchMpCardInfo(MPUserId)
		if (cardInfo) {
			this.setState({ cardId: cardInfo.Id })
		}
	}

	handleALaCartePayment(cardId) {
		const {
			amount,
			coachingId,
			t,
			onSuccess,
			user
		} = this.props

		this.setState({
			cardId,
			isLoading: true,
			loadingMessage: capitalize(t('redirectedToYourBank'))
		})

		setTimeout(function () {
			// create card direct pay in and redirect to 3Ds if necessary
			const query = `?alacarte=true&coaching=${coachingId}`
			createMpCardDirectPayin(
				user.MPUserId,
				{
					"Amount": (amount + 1) * 100,
					"Currency": returnCurrencyCode(moment.locale())
				},
				{
					"Amount": 100,
					"Currency": returnCurrencyCode(moment.locale())
				},
				query
			).then(res => {
				console.log('res from direct pay in : ', res)
				if(res) {
					if (res.SecureModeRedirectURL) {
						window.location.href = res.SecureModeRedirectURL
					} else {
						onSuccess()
					}
				}
			})
		}.bind(this), 3000)

	}

	handleSubscribe(cardId) {
		const {
			user,
			updateUser,
			t,
			coachingId,
			history,
			credits,
			amount
		} = this.props
		const {
			planType
		} = this.state

		this.setState({
			cardId,
			isLoading: true,
			loadingMessage: capitalize(t('redirectedToYourBank'))
		})

		if (user.subscription !== null) {
			if(credits < amount) {
				updateRecurringPayinRegistration(
					user.MPRecurringPayinRegistrationId,
					null,
					'ENDED'
				)
			} else {
				return updateUser({
					id: user._id,
					subscription: planType
				}, true)
					.then(() => {
						this.setState({ isLoading: false })
						history.push('/pay-in-confirmation?updateplan=true')
					})
			}
		}

		setTimeout(function () {
			createRecurringPayinRegistration(
				user.MPUserId,
				cardId,
				planType,
				returnCurrencyCode(moment.locale())
			)
				.then(res => {
					console.log('createRecurringPayinRegistration : ', res)
					if (res && res.Id) {
						updateUser({
							id: user._id,
							MPRecurringPayinRegistrationId: res.Id
						}, true)
						const MPRecurringPayinRegistrationId = res.Id
						const query = `?coaching=${coachingId}`
						createRecurringPayinCIT(
							MPRecurringPayinRegistrationId,
							false,
							returnCurrencyCode(moment.locale()),
							query
						)
							.then(res => {
								console.log('createRecurringPayinCIT : ', res)
								if (res && res.SecureModeRedirectURL) {
									window.location.href = res.SecureModeRedirectURL
								}
							})
					}
				})
				.catch(err => {
					console.log(err)
				})
		}.bind(this), 3000)
	}

	returnPlanTypeTitle(planType) {
		let title = ''
		let text = ''
		let subtext = ''

		const { t } = this.props

		if (planType === 20) {
			title = `20${returnCurrency(moment.locale())} / ${t('month')}`
			text = capitalize(t('youGet20CreditsAmonth'))
			subtext = capitalize(t('rollOverUpTo5Credits'))
		} else if (planType === 30) {
			title = `30${returnCurrency(moment.locale())} / ${t('month')}`
			text = capitalize(t('youGet30CreditsAmonth'))
			subtext = capitalize(t('rollOverUpTo10Credits'))
		} else if (planType === 10) {
			title = `10${returnCurrency(moment.locale())} / ${t('month')}`
			text = capitalize(t('youGet10CreditsAmonth'))
			subtext = capitalize(t('noRollOverOnCredits'))
		}
		return { title, text, subtext }
	}

	render() {
		const {
			t,
			history,
			user,
			onCancel,
			type,
			amount,
			currentPlan
		} = this.props
		const {
			isLoading,
			planType,
			loadingMessage,
			cardId,
			isCancelingSubscription,
			isCheckingOut,
			errorMessage
		} = this.state

		if (isLoading) {
			return (
				<div
					className='flex-center cancel-subscription-container'
					style={{ justifyContent: 'center' }}
				>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey small-responsive-title-plan'
						style={{ textAlign: 'center' }}
					>
						{loadingMessage}
					</span>
				</div>
			)
		}

		if (errorMessage) {
			return (
				<div
					className='flex-column flex-center coaching-loading white'
					style={{ justifyContent: 'flex-start' }}
				>
					<div
						style={{
							width: '98.5%',
							height: '40px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end'
						}}
						onClick={onCancel}
						className='hover'
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div
						style={{
							padding: '0 12px',
							textAlign: 'center',
							justifyContent: 'center',
							display: 'flex',
							height: '600px',
							alignItems: 'center'
						}}
					>
						<span className='small-title citrusBlack'>
							{errorMessage}
						</span>
					</div>
				</div>
			)
		}

		if (isCheckingOut) {
			return (
				<div className='full-container flex-column flex-center plan-container scroll-div-vertical'>
					<div className='medium-separator'></div>
					<div
						style={{
							width: '98.5%',
							height: '40px',
							display: 'flex',
							alignItems: 'center'
						}}
						onClick={
							type === 'plan' ?
								() => this.setState({ isCheckingOut: false }) :
								onCancel
						}
						className='hover'
					>
						<CaretBack
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
						<span className='small-text-bold citrusGrey'>
							{capitalize(t('back'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div>
						<div
							style={{
								width: '100%',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center'
							}}
						>
							{
								type === 'plan' ?
									<>
										<span className='small-title citrusBlack'>
											{this.returnPlanTypeTitle(planType).title}
										</span>
										<div className='small-separator'></div>
										<span className='small-text citrusBlack'>
											{this.returnPlanTypeTitle(planType).text}
										</span>
										<div className='small-separator'></div>
										<span className='small-text citrusBlack'>
											{this.returnPlanTypeTitle(planType).subtext}
										</span>
									</> :
									<>
										<span className='small-title citrusBlack'>
											{capitalize(t('purchaseConfirmation'))}
										</span>
										<div className='small-separator'></div>
										<span className='small-text-bold citrusGrey'>
											{`${capitalize(t('total'))} = ${amount+1}${returnCurrency(moment.locale())} (${amount} ${t('credits')} + 1${returnCurrency(moment.locale())} ${t('aLaCarteFee')})`}
										</span>
									</>
							}
						</div>
						<div className='small-separator'></div>
						{
							!cardId ?
							<CreditCardForm
								onCancel={() => console.log('cancel')}
								title={
									type === 'plan' ?
										`${capitalize(t('startWith'))} ${planType}${returnCurrency(moment.locale())} / ${t('month')}` :
										`${capitalize(t('buyFor'))} ${amount + 1}${returnCurrency(moment.locale())}`
								}
								onSuccess={mpUserId => {
									this.setState({
										isLoading: true,
										loadingMessage: capitalize(t('proceedingToPayment')),
									})
									fetchMpCardInfo(mpUserId)
										.then(res => {
											console.log('fetchMpCardInfo res : ', res)
											if (res && res.Id) {
												if (type === 'plan') {
													console.log('handleSubscribe condition OK : ')
													return this.handleSubscribe(res.Id)
												}
												this.handleALaCartePayment(res.Id)
											}
										})
										.catch(err => {
											console.log(err)
											this.setState({
												isLoading: false,
												errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
											})
										})
								}}
							/> :
							<div
								className='filled-button'
								style={{ marginTop: '30px', width: '300px' }}
								onClick={
									type === 'plan' ?
									() => this.handleSubscribe(cardId) :
									() => this.handleALaCartePayment(cardId)
								}
							>
								<span className='small-title citrusWhite'>
										{
											type === 'plan' ?
												`${capitalize(t('startWith'))} ${planType}${returnCurrency(moment.locale())} / ${t('month')}` :
												`${capitalize(t('buyFor'))} ${amount + 1}${returnCurrency(moment.locale())}`
										}
								</span>
							</div>
						}
					</div>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column plan-container'
				style={{ justifyContent: 'flex-start'}}
			>
				<div className='medium-separator'></div>
				<div
					style={{
						width: '95%',
						marginLeft: '5%',
						height: '40px',
						display: 'flex',
						alignItems: 'center'
					}}
					onClick={onCancel}
					className='hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
					<span className='small-text-bold citrusGrey'>
						{capitalize(t('back'))}
					</span>
				</div>
				<div className='medium-separator'></div>
				<div className='my-plan-container'>
					<span className='small-text citrusBlack small-responsive-title-plan'>
						{capitalize(t('youCanChangeYouPlanAnytimeOr'))}
					</span>
					<div className='medium-separator'></div>
					<div className='medium-separator'></div>
					<span className='small-title citrusBlack small-responsive-title-plan'>
						{capitalize(t('availablePlans'))}
					</span>
					<div className='medium-separator'></div>
					<div className='flex-row available-plans'>
						{
							plansTypes
								.map(
									plan => (
										<div key={plan} className='plan-card-desktop-margin'>
											<PlanCard
												t={t}
												planType={plan}
												onClick={() => {
													this.setState({
														isCheckingOut: true,
														planType: plan
													})
												}}
												isCurrent={false}
												isAvailablePlan={true}
											/>
											<div className='mobile-only-medium-separator'></div>
										</div>
									)
								)
						}
					</div>
					<div className='medium-separator'></div>
				</div>
				<style jsx='true'>
					{`
					.plan-card-desktop-margin {
						margin-right: 15px;
					}
					.available-plans {
						width: 97.5%;
						justify-content: flex-start;
					}
					.small-responsive-title-plan {
						width: 97.5%;
					}
					@media only screen and (max-width: 640px) {
						.plan-card-desktop-margin {
							margin-right: 0;
						}
						.available-plans {
							flex-direction: column;
						}
						.small-responsive-title-plan {
							width: 95%;
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CoachingCheckout))