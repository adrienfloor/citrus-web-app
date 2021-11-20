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
			<div className='flex-column flex-start'>
				<div
					style={{
						width: '99.5%',
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
				<div className='cash-out-container'>
					<div
						className='flex-column card-like cash-out-card'
						style={{ justifyContent: 'space-between'}}
					>
						<div>
							<div className='flex-row' style={{ alignItems: 'baseline' }}>
								<span className='medium-title citrusBlack' style={{ marginRight: '5px' }}>{capitalize(t('verifyYourKyc'))} </span>
									<a
										className='smaller-text' target='_blank' href='https://docs.mangopay.com/guide/kyc-further-information'
										style={{ textDecoration: 'underline', color: '#C2C2C2' }}> {t('moreInfo')}</a>
							</div>
							<span
								className='smaller-text citrusGrey'
								style={{ maxWidth: '600px' }}
							>
								{capitalize(t('cashOutDisclaimerIntro'))}
							</span>
							<div className='small-separator'></div>
							<Kyc userKycs={kycs} mpLegalUserInfo={mpLegalUserInfo} />
							<div className='medium-separator'></div>
						</div>
						<div>
							<div style={{ height: '2px', maxWidth: '454px', width: '100%', backgroundColor: '#C2C2C2' }}></div>
							<div className='small-separator'></div>
							<div className='mobile-only-medium-separator'></div>
							<div className='mobile-only-medium-separator'></div>
							<span className='medium-title citrusBlack'>{capitalize(t('addYourBankAccount'))}</span>
							<div className='flex-row column-on-mobile' style={{ justifyContent: 'flex-start' }}>
								{
									bankAccount &&
									<span className='smaller-text row-item citrusGrey'>{capitalize(t('bankAccount'))}</span>
								}
								{
									bankAccount && bankAccount.IBAN &&
									<span
										className='smaller-text row-item 	iban-mobile '
										style={{ width: '40%' }}
									>
										{bankAccount.IBAN}
									</span>
								}
								<span
									className={
										bankAccountRequiredMessage ?
											'small-text-bold citrusRed row-item' :
											'small-text-bold row-item simple-link'
									}
									style={
										bankAccount ?
											{ textAlign: 'center' } :
											{ textAlign: 'start' }
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
							<div className='medium-separator'></div>
						</div>
						<div className='flex-column'>
							<div className='small-separator'></div>
							{
								warningMessage &&
								<>
									<span className='smaller-text-bold citrusRed' style={{ textAlign: 'center' }}>
										{warningMessage}
									</span>
									<div className='small-separator'></div>
								</>
							}
							<div style={{ width: '100%' }}>
								<div className='filled-button' onClick={this.handleWithdrawMissingProperties}>
									<span className='small-title citrusWhite'>
										{capitalize(t('withdrawNow'))}
									</span>
								</div>
								<div className='small-separator'></div>
								<span
									className='smaller-text citrusGrey'
									style={{ maxWidth: '454px' }}
								>
									{capitalize(t('cashOutWelcomeMessage'))}
								</span>
							</div>
						</div>
					</div>
					<div className='medium-separator'></div>
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