import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

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
		const { mangoPayUserId } = this.props.user
		const mangoPayUserCard = await fetchMpCardInfo(mangoPayUserId)
		if (mangoPayUserCard) {
			this.setState({ cardInfo: mangoPayUserCard })
		}

		const walletInfo = await fetchMpWalletInfo(mangoPayUserId)
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
			updateUserm
		} = this.props
		const {
			firstName,
			lastName,
			automaticTopUp,
			subscription,
			mangoPayUserId,
			myVideos
		} = user

		if(isUpdatingCard) {
			return(
				<CreditCardForm
					onSuccess={() => {
						fetchMpCardInfo(user.mangoPayUserId)
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
				<div className='full-container flex-column flex-center payments'>
					<span className='small-text'>
						{capitalize(t('areYouSureCancelSubscription'))} ?
					</span>
					<div
					style={{
						width: '180px',
						height: '100px',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
						className='flex-row flex-center'
					>
						<button
							className='small-action-white-button'
							onClick={() => this.updateUserSubscription(false)}
						>
							{capitalize(t('yes'))}
						</button>
						<button
							className='small-action-button'
							onClick={() => this.setState({ isCancelingSubscription: false })}
						>
							{capitalize(t('no'))}
						</button>
					</div>
				</div>
			)
		}

		if (isUpdatingAutomaticTopUp) {
			return (
				<div
					className='full-container flex-column payments'
					style={{ alignItems: 'center' }}
				>
					<div
						style={{
							width: '100%',
							height: '50px',
							display: 'flex',
							justifyContent: 'flex-start',
							alignItems: 'center'
						}}
					>
						<KeyboardBackspaceIcon
							className='action-icon'
							fontSize='large'
							onClick={() => this.setState({ isUpdatingAutomaticTopUp: false })}
						/>
					</div>
					<span
						className='small-text'
						style={{ width: '80%' }}
					>
						{capitalize(t('topUpDisclaimer'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text'>
						{capitalize(t('allowAutomaticTopUp'))} ?
					</span>
					<div
						style={{
							width: '180px',
							height: '100px',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}
						className='flex-row flex-center'
					>
						<button
							className='small-action-white-button'
							onClick={this.updateUserAutomaticTopUp}
						>
							{capitalize(t('no'))}
						</button>
						<button
							className='small-action-button'
							onClick={this.updateUserAutomaticTopUp}
						>
							{capitalize(t('yes'))}
						</button>
					</div>
				</div>
			)
		}

		if (isTopingUpAccount) {
			if (mangoPayUserId) {
				return (<TopUp
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
				<div className='flex-row'>
					<span className='small-text row-item'>{capitalize(t('firstName'))} : </span>
					<span className='small-text row-item'>{firstName}</span>
				</div>
				<div className='flex-row'>
					<span className='small-text row-item'>{capitalize(t('lastName'))} : </span>
					<span className='small-text row-item'>{lastName}</span>
				</div>
				<div className='flex-row flex-row-mobile'>
					<span className='small-text row-item'>{capitalize(t('creditCardDetails'))} : </span>
					<span className='small-text row-item'>{cardInfo.Alias || capitalize(t('none'))}</span>
					<span
						className='small-text row-item simple-link'
						onClick={() => this.setState({ isUpdatingCard: true })}
					>
						{
							cardInfo.Alias ?
							t('switch') :
							t('add')
						}
					</span>
					{
						creditCardRequiredMessage &&
						<span className='small-text red desktop'>{capitalize(t('creditCardRequired'))}</span>
					}
				</div>
				{
					creditCardRequiredMessage &&
					<span className='small-text red mobile'>{capitalize(t('creditCardRequired'))}</span>
				}
				<div className='flex-row flex-row-mobile'>
					<span className='small-text row-item'>{capitalize(t('automaticTopUp'))} : </span>
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
						{t('change')}
					</span>
				</div>
				<div className='flex-row flex-row-mobile'>
					<span className='small-text row-item'>{capitalize(t('subscriptionPlan'))} : </span>
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
							if(!mangoPayUserId) {
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
								t('cancel') :
								t('subscribe')
						}
					</span>
				</div>
				<div className='flex-row flex-row-mobile'>
					<span className='small-text row-item'>{capitalize(t('myVideos'))} : </span>
					<span className='small-text row-item'>
						{`${myVideos} ${t('videosAvailable')}`}
					</span>
					<span
						className='small-text row-item simple-link mobile'
						onClick={() => {
							this.setState({ isTopingUpAccount: true })
						}}
					>
						{t('topUp')}
					</span>
					<span
						className='small-text row-item simple-link desktop'
						onClick={() => {
							this.setState({ isTopingUpAccount: true })
						}}
					>
						{t('topUpYourAccount')}
					</span>
				</div>
				<style jsx='true'>
					{`
					.payments {
						padding: 10px 0;
					}
					.row-item {
						width: 150px;
						height: 35px;
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
							width: 100px;
							margin: 10px 5px;
						}
						.flex-row-mobile {
							width: 100%;
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
