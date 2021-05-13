import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import CloseIcon from '@material-ui/icons/Close'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import CreditCardForm from '../../mangopay/credit-card-form'
import TopUp from '../../mangopay/top-up'
import PaymentForm from '../../mangopay/payment-form'
import Subscription from '../../mangopay/subscription'

import {
	updateUser,
	loadUser
} from '../../../actions/auth-actions'

import {
	capitalize
} from '../../../utils/various'

import {
	fetchMpCardInfo,
	fetchMpWalletInfo
} from '../../../services/mangopay'

class ManagePayments extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			cardInfo: {},
			walletInfo: {},
			isUpdatingCard: false,
			isCancelingSubscription: false,
			isSubscribing: false,
			isUpdatingAutomaticTopUp: false,
			isTopingUpAccount: false,
			creditCardRequiredMessage: false
		}
		this.updateUserSubscription = this.updateUserSubscription.bind(this)
		this.updateUserAutomaticTopUp = this.updateUserAutomaticTopUp.bind(this)
		this.fetchMangoPayInfo = this.fetchMangoPayInfo.bind(this)
	}

	componentDidMount() {
		this.fetchMangoPayInfo()
	}

	async fetchMangoPayInfo() {
		const { MPUserId } = this.props.user
		const mangoPayUserCard = await fetchMpCardInfo(MPUserId)
		if (mangoPayUserCard) {
			this.setState({ cardInfo: mangoPayUserCard })
		}

		const walletInfo = await fetchMpWalletInfo(MPUserId)
		if(walletInfo) {
			this.setState({
				walletInfo: walletInfo
			})
		}
	}

	updateUserSubscription(subscription) {
		const {
			user,
			updateUser,
			loadUser
		} = this.props

		let billingDate = new Date().getUTCDate()
		if(27<billingDate<32) {
			billingDate = 28
		}

		updateUser({
			id: user._id,
			subscription,
			myVideos: subscription ? (user.myVideos + 20) : user.myVideos,
			billingDate
		})
			.then(() => {
				loadUser()
				this.setState({
					isCancelingSubscription: false,
					isSubscribing: false
				})
			})


	}

	updateUserAutomaticTopUp() {
		const {
			user,
			updateUser,
			loadUser
		} = this.props

		updateUser({ id: user._id, automaticTopUp: !user.automaticTopUp })
			.then(() => {
				loadUser()
				this.setState({ isUpdatingAutomaticTopUp: false })
			})
	}

	subscribe() {
		const { cardInfo } = this.state
		if(!cardInfo.Alias) {
			return this.setState({
				creditCardRequiredMessage: true
			})
		}
		this.setState({
			isSubscribing: true
		})
	}

	render() {

		const {
			cardInfo,
			isUpdatingCard,
			isCancelingSubscription,
			isSubscribing,
			isUpdatingAutomaticTopUp,
			isTopingUpAccount,
			creditCardRequiredMessage
		} = this.state

		const {
			t,
			user,
			updateUser
		} = this.props
		const {
			firstName,
			lastName,
			automaticTopUp,
			subscription,
			MPUserId,
			myVideos
		} = user

		if(isUpdatingCard) {
			return(
				<CreditCardForm
					onSuccess={() => {
						fetchMpCardInfo(MPUserId)
							.then((mangoPayUserCard) => {
								this.setState({
									cardInfo: mangoPayUserCard,
									isUpdatingCard: false
								})
						})
					}}
					onClose={() => this.setState({ isUpdatingCard: false })}
				/>
			)
		}

		if(isSubscribing) {
			const {
				cardInfo,
				walletInfo
			} = this.state
			return (
				<div className='full-container flex-column flex-center payments'>
					<Subscription
						onClose={() => this.setState({ isSubscribing: false })}
						onSuccess={() => {
							this.updateUserSubscription(true)
						}}
						cardId={cardInfo.Id}
						walletId={walletInfo.Id}
					/>
				</div>
			)
		}

		if(isCancelingSubscription) {
			return (
				<div className='full-container flex-column payments'>
					<div
						style={{
							width: '100%',
							height: '50px',
							display: 'flex',
							justifyContent: 'flex-start',
							alignItems: 'center'
						}}
						onClick={() => this.setState({ isCancelingSubscription: false })}
						className='hover'
					>
						<CaretBack
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
						<span className='small-text citrusGrey'>
							{capitalize(t('payments'))}
						</span>
					</div>
					<span className='maxi-title title'>
						{capitalize(t('subscriptionPlan'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text-high'>
						{capitalize(t('areYouSureCancelSubscription'))} ?
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div className='flex-column flex-center'>
						<button
							className='filled-button'
							onClick={() => this.updateUserSubscription(false)}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('yes'))}
							</span>
						</button>
						<div className='small-separator'></div>
						<button
							className='light-button'
							onClick={() => this.setState({ isCancelingSubscription: false })}
						>
							<span className='small-title citrusBlue'>
								{capitalize(t('no'))}
							</span>
						</button>
					</div>
					<style jsx='true'>
						{`
						.title {
							margin-bottom: 30px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
								font-size: 36px !important;
							}
							.payments {
								width: 96%;
								margin: 0 2%;
							}
							.filled-button,
							.light-button {
								width: 98%;
								margin: 0 1%;
							}
						}
					`}
					</style>
				</div>
			)
		}

		if(isUpdatingAutomaticTopUp) {
			return (
				<div className='full-container flex-column payments'>
					<div
						style={{
							width: '100%',
							height: '50px',
							display: 'flex',
							justifyContent: 'flex-start',
							alignItems: 'center'
						}}
						onClick={() => this.setState({ isUpdatingAutomaticTopUp: false })}
						className='hover'
					>
						<CaretBack
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
						<span className='small-text citrusGrey'>
							{capitalize(t('payments'))}
						</span>
					</div>
					<span className='maxi-title title'>
						{capitalize(t('allowAutomaticTopUp'))}
					</span>
					<span className='small-text-high'>
						{capitalize(t('whyItIseasier'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text-high'>
						{capitalize(t('topUpDisclaimer'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text'>
						{capitalize(t('allowAutomaticTopUp'))} ?
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div className='flex-column flex-center'>
						<button
							className='filled-button'
							onClick={this.updateUserAutomaticTopUp}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('yes'))}
							</span>
						</button>
						<div className='small-separator'></div>
						<button
							className='light-button'
							onClick={this.updateUserAutomaticTopUp}
						>
							<span className='small-title citrusBlue'>
								{capitalize(t('no'))}
							</span>
						</button>
					</div>
					<style jsx='true'>
						{`
						.title {
							margin-bottom: 30px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
								font-size: 36px !important;
							}
							.payments {
								width: 96%;
								margin: 0 2%;
							}
							.filled-button,
							.light-button {
								width: 98%;
								margin: 0 1%;
							}
						}
					`}
					</style>
				</div>
			)
		}

		if (isTopingUpAccount) {
			if (MPUserId) {
				return (
					<TopUp
						onClose={() => {
							this.setState({ isTopingUpAccount: false })
							this.fetchMangoPayInfo()
						}}
					/>
				)
			} else {
				this.setState({
					creditCardRequiredMessage: true,
					isTopingUpAccount: false
				})
				setTimeout(
					() => this.setState({ creditCardRequiredMessage: false }),
					3000
				)
			}
		}


		return (
			<div className='full-container flex-column flex-start payments'>
				<span className='maxi-title'>
					{capitalize(t('payments'))}
				</span>
				<div className='medium-separator'></div>
				<div className='small-separator'></div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('firstName'))}</span>
					<span className='small-text row-item'>{firstName}</span>
					<span className='small-text row-item'></span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('lastName'))}</span>
					<span className='small-text row-item'>{lastName}</span>
					<span className='small-text row-item'></span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('paymentCard'))}</span>
					<span className='small-text row-item'>{cardInfo.Alias || capitalize(t('none'))}</span>
					<span
						className={
							creditCardRequiredMessage ?
							'small-text citrusRed mobile-warning' :
							'small-text row-item simple-link'
						}
						onClick={() => this.setState({ isUpdatingCard: true })}
					>
						{
							creditCardRequiredMessage ?
							capitalize(t('creditCardRequired')) :
							cardInfo.Alias ?
								capitalize(t('switch')) :
								capitalize(t('add'))
						}
					</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('automaticTopUp'))}</span>
					<span className='small-text row-item'>
						{
							automaticTopUp ?
								capitalize(t('activated')) :
								capitalize(t('deactivated'))
						}
					</span>
					<span
						className='small-text row-item simple-link'
						onClick={() => this.setState({ isUpdatingAutomaticTopUp: true })}
						>
						{capitalize(t('change'))}
					</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('subscription'))}</span>
					<span className='small-text row-item'>
						{
							subscription ?
								capitalize(t('unlimited')) :
								capitalize(t('prepaid'))
						}
					</span>
					<span
						className='small-text row-item simple-link'
						onClick={() => {
							if(!MPUserId) {
								this.setState({
									creditCardRequiredMessage: true
								})
								setTimeout(
									() => this.setState({ creditCardRequiredMessage: false }),
									3000
								)
								return
							} else {
								!subscription ?
									this.subscribe() :
									this.setState({ isCancelingSubscription: true })
							}
						}}
					>
						{
							subscription ?
								capitalize(t('cancel')) :
								capitalize(t('subscribe'))
						}
					</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('videos'))}</span>
					<span className='small-text row-item'>
						{`${myVideos} ${t('videosAvailable')}`}
					</span>
					<span
						className='small-text row-item simple-link mobile'
						onClick={() => {
							this.setState({ isTopingUpAccount: true })
						}}
					>
						{capitalize(t('topUp'))}
					</span>
					<span
						className='small-text row-item simple-link desktop'
						onClick={() => {
							this.setState({ isTopingUpAccount: true })
						}}
					>
						{capitalize(t('topUp'))}
					</span>
				</div>
				<style jsx='true'>
					{`
					.title {
						margin-bottom: 30px;
					}
					@media only screen and (min-width: 640px) {
						.mobile {
							display: none;
						}
					}
					@media only screen and (max-width: 640px) {
						.payments {
							padding: 0 !important;
						}
						.desktop {
							display: none;
						}
						.row-item {
							text-overflow: ellipsis;
							overflow: hidden;
							margin: 0 5px;
							display: flex;
    					align-items: center;
						}
						.title {
							margin-bottom: 10px;
							font-size: 36px !important;
							line-height: 40px !important;
						}
						.mobile-warning {
							line-height: 13px !important;
							text-overflow: ellipsis;
							overflow: hidden;
							max-width: 100px;
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ManagePayments))
