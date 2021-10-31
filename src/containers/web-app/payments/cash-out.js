import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import Loader from 'react-loader-spinner'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import Kyc from './kyc'
import BankAccount from '../../mangopay/bank-account'
import Payout from '../../mangopay/payout'

import { loadUser, updateUser } from '../../../actions/auth-actions'
import { setNotification } from '../../../actions/notifications-actions'

import {
	capitalize,
	returnCurrency,
	returnCurrencyCode
} from '../../../utils/various'

import {
	fetchMpUserInfo,
	fetchMpBankAccount,
	fetchMpWalletInfo,
	fetchMpUserCredits,
	fetchPayOut,
	fetchKycsOfAUser,
	createMpPayout
} from '../../../services/mangopay'

class Cashout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isUpdatingBankAccount: false,
			verified: this.props.mpLegalUserInfo.KYCLevel === 'REGULAR',
			bankAccount: null,
			funds: 0,
			payout: null,
			kycs: null,
			bankAccountRequiredMessage: false,
			warningMessage: null,
			isLoading: false
		}
		this.fetchMangoPayInfo = this.fetchMangoPayInfo.bind(this)
		this.handleWithdrawMissingProperties = this.handleWithdrawMissingProperties.bind(this)
		this.handlePayout = this.handlePayout.bind(this)
	}

	componentDidMount() {
		this.fetchMangoPayInfo()
	}

	async fetchMangoPayInfo() {
		const { user, t } = this.props
		const { MPLegalUserId, MPPayoutId } = user

		const bankAccount = await fetchMpBankAccount(MPLegalUserId)
		if(bankAccount) {
			this.setState({ bankAccount: bankAccount })
		}
		const gains = await fetchMpUserCredits(user.MPLegalUserId)
		if(gains) {
			this.setState({ funds: gains })
		}
		const payout = await fetchPayOut(MPPayoutId)
		if (payout) {
			this.setState({ payout })
			// TO BE TESTED
			if (payout && payout.Status === 'CREATED') {
				this.setState({
					warningMessage: capitalize(t('cantCashOutBecauseBeingProcessed'))
				})
				setTimeout(
					() => this.setState({
						warningMessage: null
					}),
					5000
				)
				return false
			}
		}
		const userKycs = await fetchKycsOfAUser(MPLegalUserId)
		if(userKycs) {
			this.setState({ kycs: userKycs })
		}
	}

	isAbleToCashOut() {
		const { user, t } = this.props
		const { lastCashOutDate }  = user
		const { funds, payout, verified } = this.state

		const monthOfLastCashOut = lastCashOutDate ? (new Date(lastCashOutDate)).getMonth() : null
		const currentMonth = (new Date()).getMonth()

		if(!verified) {
			this.setState({
				warningMessage: capitalize(t('yourKycsAreNotYetValidated'))
			})
			setTimeout(
				() => this.setState({
					warningMessage: null
				}),
				5000
			)
			return false
		}

		// TO BE TESTED
		if(payout && payout.Status === 'CREATED') {
			this.setState({
				warningMessage: capitalize(t('cantCashOutBecauseBeingProcessed'))
			})
			setTimeout(
				() => this.setState({
					warningMessage: null
				}),
				5000
			)
			return false
		}

		if (funds < 100) {
			this.setState({
				warningMessage: `${capitalize(t('cantCashOutBecauseYouDidntReachMinimum'))}${returnCurrency(moment.locale())}`
			})
			setTimeout(
				() => this.setState({
					warningMessage: null
				}),
				5000
			)
			return false
		}

		if (monthOfLastCashOut == currentMonth) {
			this.setState({
				warningMessage: capitalize(t('cantCashOutBecauseYouAleadyDidItThisMonth'))
			})
			setTimeout(
				() => this.setState({
					warningMessage: null
				}),
				5000
			)
			return false
		}
		return true
	}

	handleWithdrawMissingProperties(e) {
		const {
			verified,
			bankAccount
		} = this.state
		const { t } = this.props
		e.preventDefault()

		if(!this.isAbleToCashOut()) {
			return
		}

		if(!bankAccount) {
			if (!bankAccount) {
				this.setState({ bankAccountRequiredMessage: true })
			}
			setTimeout(
				() => this.setState({
					bankAccountRequiredMessage: false
				}),
				3000
			)
			return
		}

		this.handlePayout()
	}

	async handlePayout() {
		const {
			setNotification,
			user,
			updateUser,
			t
		} = this.props
		const { bankAccount } = this.state

		this.setState({ isLoading: true })

		const payout = await createMpPayout(
			user.MPLegalUserId,
			bankAccount.Id,
			returnCurrencyCode(moment.locale())
		)
		if(payout) {
			if(payout.Status === 'FAILED') {
				this.setState({
					warningMessage: payout.ResultMessage,
					isLoading: false
				})
				setNotification({ message: capitalize(payout.ResultMessage) })
				setTimeout(
					() => this.setState({
						warningMessage: null
					}),
					5000
				)
				return
			} else {
				updateUser({
					id: user._id,
					MPPayoutId: payout.Id
				}, true)
				.then(() => this.setState({ isLoading: false }))
				setNotification({ message: capitalize(t('congratulationsPayout')) })
			}
		} else {
			this.setState({
				warningMessage: capitalize(t('somethingWentWrongWithThePayout')),
				isLoading: false
			})
			setNotification({ message: capitalize(t('somethingWentWrongWithThePayout')) })
			setTimeout(
				() => this.setState({
					warningMessage: null
				}),
				5000
			)
			return
		}
	}

	render() {

		const {
			isUpdatingBankAccount,
			verified,
			bankAccount,
			funds,
			bankAccountRequiredMessage,
			warningMessage,
			kycs,
			isLoading
		} = this.state

		const {
			t,
			user,
			onCancel,
			mpLegalUserInfo
		} = this.props
		const {
			firstName,
			lastName
		} = user

		if (isLoading) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '70vh' }}
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

		if (isUpdatingBankAccount) {
			return (
				<div className='flex-column flex-start cash-out-container'>
					<div className='desktop-only-medium-separator'></div>
					<div className='desktop-only-medium-separator'></div>
					<BankAccount
						onClose={() => {
							this.setState({ isUpdatingBankAccount: false })
						}}
						onSuccess={() => {
							this.setState({ isUpdatingBankAccount: false })
							this.fetchMangoPayInfo()
						}}
					/>
				</div>
			)
		}

		return (
			<div className='flex-column flex-start cash-out-container'>
				<div
					style={{
						width: '98.5%',
						height: '50px',
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
				<span
					className='small-text-bold citrusGrey'
					style={{ maxWidth: '600px' }}
				>
					{capitalize(t('cashOutDisclaimer'))}
				</span>
				<div className='medium-separator'></div>
				<div
					className='flex-column card-like cash-out-card'
					style={{ justifyContent: 'space-between'}}
				>
					<div>
						<span className='small-title citrusBlack'>{capitalize(t('verifyYourKyc'))}</span>
						<div className='small-separator'></div>
						<Kyc userKycs={kycs} mpLegalUserInfo={mpLegalUserInfo} />
						<div className='small-separator'></div>
						<span className='small-title citrusBlack'>{capitalize(t('addYourBankAccount'))}</span>
						<div className='small-separator'></div>
						<div className='flex-row' style={{ justifyContent: 'space-between' }}>
							<span className='smaller-text row-item citrusGrey'>{capitalize(t('bankAccount'))}</span>
							<span className='smaller-text row-item'>
								{bankAccount ? bankAccount.IBAN : capitalize(t('no'))}
							</span>
							<span
								className={
									bankAccountRequiredMessage ?
										'small-text-bold citrusRed row-item' :
										'small-text-bold row-item simple-link'
								}
								onClick={() => this.setState({ isUpdatingBankAccount: true })}
							>
								{
									bankAccountRequiredMessage ?
										capitalize(t('bankAccountRequired')) :
										bankAccount ?
											t('change') :
											t('add')
								}
							</span>
						</div>
					</div>
					<span className='smaller-text-bold citrusGrey'>
						{capitalize(t('cashOutWelcomeMessage'))}
					</span>
					<div className='flex-column flex-center'>
						{
							warningMessage &&
							<>
								<span className='smaller-text-bold citrusRed' style={{ textAlign: 'center' }}>
									{warningMessage}
								</span>
								<div className='small-separator'></div>
							</>
						}
						<div className='filled-button full-width' onClick={this.handleWithdrawMissingProperties}>
							<span className='small-title citrusWhite'>
								{capitalize(t('withdrawNow'))}
							</span>
						</div>
					</div>
				</div>
				<style jsx='true'>
					{`
					.title {
						margin-bottom: 30px;
					}
					.row-item {
						width: 30%;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					@media only screen and (max-width: 640px) {
						.desktop {
							display: none;
						}
						.row-item {
							display: flex;
    					align-items: flex-start;
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
	loadUser: () => dispatch(loadUser()),
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	setNotification: notif => dispatch(setNotification(notif))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Cashout))
