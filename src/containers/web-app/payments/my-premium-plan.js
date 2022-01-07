import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'

import CreditCardForm from './credit-card-form'
import PremiumPlanCard from '../../../components/web-app/premium-plan-card'
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
	uppercase,
	returnCurrency,
	returnCurrencyCode
} from '../../../utils/various'

import {
	fetchMpCardInfo,
	createRecurringPayinRegistration,
	createRecurringPayinCIT,
	fetchPayIn,
	updateRecurringPayinRegistration
} from '../../../services/mangopay'

const plansTypes = [4.99, 49.99]

class MyPremiumPlan extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			isSubscribing: false,
			planType: null,
			loadingMessage: '',
			cardId: null,
			isCancelingSubscription: false,
			isConfirmingCancelation: false
		}
		this.returnPlanTypeTitle = this.returnPlanTypeTitle.bind(this)
		this.handlePlanSelection = this.handlePlanSelection.bind(this)
		this.handleSubscribe = this.handleSubscribe.bind(this)
		this.handleALaCarteSelection = this.handleALaCarteSelection.bind(this)
	}

	componentDidMount() {
		this.fetchMangoPayInfo()
	}

	async fetchMangoPayInfo() {
		const { MPUserId } = this.props.user
		if(MPUserId) {
			const mangoPayUserCard = await fetchMpCardInfo(MPUserId)
			if (mangoPayUserCard) {
				this.setState({ cardId: mangoPayUserCard.Id })
			}
		}
	}

	handlePlanSelection(planType) {
		const {user } = this.props
		this.setState({
			isLoading: true,
			planType
		})

		if(!user.creditCard?.alias) {
			return this.setState({
				isLoading: false,
				isSubscribing: true
			})
		}

		this.setState({
			isSubscribing: true,
			isLoading: false
		})
	}

	handleALaCarteSelection() {
		const {
			user,
			updateUser,
			history,
			t
		} = this.props

		this.setState({
			isLoading: true,
			loadingMessage: capitalize(t('cancelingYourPlan'))
		})

		if (user.subscription !== null) {
			updateRecurringPayinRegistration(
				user.MPRecurringPayinRegistrationId,
				null,
				'ENDED'
			)
		}

		setTimeout(function () {
			updateUser({
				id: user._id,
				subscription: null,
				MPRecurringPayinRegistrationId: null
			}, true)
			.then(() => {
				this.setState({ isLoading: false })
				history.push('/pay-in-confirmation?alacarte=true')
			})
		}.bind(this), 3000)
	}

	handleSubscribe(cardId) {
		const {
			user,
			updateUser,
			t,
			history
		} = this.props
		const {
			planType
		} = this.state

		this.setState({
			cardId,
			isLoading: true,
			loadingMessage: capitalize(t('redirectedToYourBank'))
		})

		// if (user.subscription !== null) {
		// 	return updateUser({
		// 		id: user._id,
		// 		subscription: planType
		// 	}, true)
		// 		.then(() => {
		// 			this.setState({ isLoading: false })
		// 			history.push('/pay-in-confirmation?updateplan=true')
		// 		})
		// }

		if(user.subscription) {
			updateRecurringPayinRegistration(
				user.MPRecurringPayinRegistrationId,
				null,
				'ENDED'
			)
		}

		setTimeout(function () {
			createRecurringPayinRegistration(
				user.MPUserId,
				cardId,
				planType,
				returnCurrencyCode(moment.locale())
			)
				.then(res => {
					if (res && res.Id) {
						updateUser({
							id: user._id,
							MPRecurringPayinRegistrationId: res.Id
						}, true)
						const MPRecurringPayinRegistrationId = res.Id
						createRecurringPayinCIT(
							MPRecurringPayinRegistrationId,
							false,
							returnCurrencyCode(moment.locale()),
							null,
							user.email
						)
							.then(res => {
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

		if (planType === 4.99) {
			title = `${capitalize(t('premiumMonthly'))}`
			text = `4.99${returnCurrency(moment.locale())}/${t('month')}`
			subtext = capitalize(t('noAdditionnalFeePerTraining'))
		} else if (planType === 49.99) {
			title = `${capitalize(t('premiumAnnually'))}`
			text = `49.99${returnCurrency(moment.locale())}/${t('year')}`
			subtext = `${capitalize(t('noAdditionnalFeePerTraining'))}`
		} else {
			title = capitalize(t('aLaCarte'))
			text = `${capitalize(t('youPayTheClassCost'))}${returnCurrency(moment.locale())})`
			subtext = `${capitalize(t('+1'))}${returnCurrency(moment.locale())} ${t('feePerClass')}`
		}
		return { title, text, subtext }
	}

	render() {
		const {
			t,
			history,
			user,
			onCancel
		} = this.props
		const {
			isLoading,
			isSubscribing,
			planType,
			loadingMessage,
			cardId,
			isCancelingSubscription,
			isConfirmingCancelation
		} = this.state

		if(isLoading) {
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


		if(isCancelingSubscription) {
			if(isConfirmingCancelation) {
				return (
					<div
						className='full-container flex-column flex-center cancel-subscription-container'
						style={{ justifyContent: 'center' }}
					>
						<span className='small-title citrusBlack cancel-plan-container'>
							{capitalize(t('areYouSureYouWantToGoALaCarte'))}
						</span>
						<div className='small-separator'></div>
						<div className='medium-separator'></div>
						<div
							className='flex-row'
							style={{
								width: '200px',
								justifyContent: 'space-between'
							}}
						>
							<div
								className='filled-button hover small-no-color-button'
								onClick={() => this.setState({ isCancelingSubscription: false })}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('no'))}
								</span>
							</div>
							<div
								className='light-button hover small-no-color-light-button'
								onClick={this.handleALaCarteSelection}
							>
								<span className='small-title citrusBlue'>
									{capitalize(t('yes'))}
								</span>
							</div>
						</div>
					</div>
				)
			}
			return (
				<div
					className='full-container flex-column flex-center cancel-subscription-container'
					style={{ justifyContent: 'center' }}
				>
					<span className='small-title citrusBlack cancel-plan-container'>
						{capitalize(t('areYouSureYouWantToCancelThisPlan'))}
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div
						className='flex-row'
						style={{
							width: '200px',
							justifyContent: 'space-between'
						}}
					>
						<div
							className='filled-button hover small-no-color-button'
							onClick={() => this.setState({ isCancelingSubscription: false })}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('no'))}
							</span>
						</div>
						<div
							className='light-button hover small-no-color-light-button'
							onClick={() => this.setState({ isConfirmingCancelation: true })}
						>
							<span className='small-title citrusBlue'>
								{capitalize(t('yes'))}
							</span>
						</div>
					</div>
				</div>
			)
		}

		if(isSubscribing) {
			return (
				<div className='full-container flex-column flex-center subscription-container'>
					<div className='medium-separator'></div>
					<div
						style={{
							width: '99%',
							height: '30px',
							display: 'flex',
							alignItems: 'center'
						}}
						onClick={() => this.setState({
							isSubscribing: false,
							planType: null
						})}
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
					<div className='mobile-only-medium-separator'></div>
					<div className='mobile-only-medium-separator'></div>
					<div className='mobile-only-medium-separator'></div>
					<div>
						<div
							style={
								cardId ?
									{
										height: '250px',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'flex-end',
										width: '300px'
									} :
									{
										width: '97.5%',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										margin: '0 2.5%'
									}
							}
						>
							<div
								style={
									cardId ?
									{ maxWidth: '350px', width: '100%', padding: '0' } :
									{ maxWidth: '350px', width: '100%', padding: '0 20px' }
								}
							>
								<span className='medium-title citrusBlack'>
									{this.returnPlanTypeTitle(planType).title}
								</span>
								<div className='small-separator'></div>
								<span className='smaller-text-bold citrusBlack'>
									{this.returnPlanTypeTitle(planType).text}
								</span>
								<div className='small-separator'></div>
								<span className='smaller-text-bold citrusBlack'>
									{this.returnPlanTypeTitle(planType).subtext}
								</span>
							</div>
						</div>
						<div className='small-separator'></div>
						{
							!cardId &&
							<CreditCardForm
								onCancel={() => this.setState({
									isSubscribing: false,
									planType: null,
									cardId: ''
								})}
								title={
									planType === null ?
										capitalize(t('startALaCarte')) :
										capitalize(t('purchaseThisPlan'))
								}
								onSuccess={mpUserId => {
									this.setState({
										isLoading: true,
										loadingMessage: capitalize(t('proceedingToPayment'))
									})
									fetchMpCardInfo(mpUserId)
										.then(res => {
											if (res && res.Id) {
												this.handleSubscribe(res.Id)
											}
										})
										.catch(err => {
											console.log(err)
											// SET UP SOME KIND OF ERROR MESSAGE
										})
								}}
							/>
						}
						{
							cardId && !isLoading &&
							<button
								style={{ marginTop: '20px'}}
								onClick={() => this.handleSubscribe(cardId)}
								className='filled-button full-width'
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('purchaseThisPlan'))}
								</span>
							</button>
						}
					</div>
				</div>
			)
		}

		return (
			<div className='full-container flex-column plan-container'>
				<div className='small-separator'></div>
				<div
					style={{
						width: '99%',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center'
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
				<div className='medium-separator'></div>
				<div className='my-plan-container'>
					<span className='big-title citrusBlack small-responsive-title-plan'>
						{capitalize(t('yourPlan'))}
					</span>
					<div className='medium-separator'></div>
					<div className='flex-row available-plans'>
						<div className='flex-column'>
							<PremiumPlanCard
								t={t}
								planType={user.subscription}
								onClick={
									user.subscription == null ?
									() => {} :
									() => this.setState({ isCancelingSubscription: true })
								}
								isAvailablePlan={false}
								isCurrent={true}
								billingDate={user.billingDate}
								lastBillingMonth={user.lastBillingMonth}
								lastBillingYear={user.lastBillingYear}
							/>
							{
								user.subscription &&
								<>
									<div className='small-separator'></div>
									<span
										onClick={() => this.setState({ isCancelingSubscription: true })}
										className='extra-small-text-bold hover citrusGrey'
										style={{
											width: 'max-content',
											marginLeft: '20px',
											textDecoration: 'underline'
										}}
									>
										{capitalize(t('cancelMySubscription'))}
									</span>
								</>
							}
						</div>
					</div>
					<div className='medium-separator'></div>
					<div className='medium-separator'></div>
					<span className='big-title citrusBlack small-responsive-title-plan'>
						{capitalize(t('availablePlans'))}
					</span>
					<div className='medium-separator'></div>
					<div className='flex-row available-plans'>
						{
							plansTypes
							.map(
								plan => (
									<div key={plan} style={{ marginRight: '30px' }}>
										<PremiumPlanCard
											t={t}
											planType={plan}
											onClick={
												plan == user.subscription ?
												() => {} :
												() => this.handlePlanSelection(plan)
											}
											isAvailablePlan={true}
											isCurrent={plan == user.subscription}
											billingDate={user.billingDate}
											lastBillingMonth={user.lastBillingMonth}
											lastBillingYear={user.lastBillingYear}
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
						.available-plans {
							width: 97.5%;
							justify-content: flex-start;
							flex-wrap: wrap;
						}
						.small-responsive-title-plan {
							width: 97.5%;
						}
						@media only screen and (max-width: 640px) {
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MyPremiumPlan))