import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import Kyc from '../../mangopay/kyc'
import BankAccount from '../../mangopay/bank-account'
import Payout from '../../mangopay/payout'

import {
	updateUser,
	loadUser
} from '../../../actions/auth-actions'

import {
	capitalize
} from '../../../utils/various'

import {
	fetchMpUserInfo,
	fetchMpBankAccount,
	fetchMpWalletInfo
} from '../../../services/mangopay'

class PaymentsMethods extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isUpdatingKyc: false,
			isUpdatingBankAccount: false,
			isProceedingToPayout: true,
			verified: false,
			bankAccount: null,
			funds: 0,
			kycRequiredMessage: false,
			bankAccountRequiredMessage: false
		}
		this.fetchMangoPayInfo = this.fetchMangoPayInfo.bind(this)
		this.handleWithdrawMissingProperties = this.handleWithdrawMissingProperties.bind(this)
	}

	componentDidMount() {
		this.fetchMangoPayInfo()
	}

	async fetchMangoPayInfo() {
		const { MPUserId } = this.props.user

		const mangoPayUser = await fetchMpUserInfo(MPUserId)
		this.setState({ verified: mangoPayUser.KYCLevel === 'REGULAR' ? true : false })

		const bankAccount = await fetchMpBankAccount(MPUserId)
		if(bankAccount) {
			this.setState({ bankAccount: bankAccount.IBAN })
		}


		const walletInfo = await fetchMpWalletInfo(MPUserId)
		if(walletInfo) {
			this.setState({ funds: walletInfo.Balance.Amount / 100 })
		}
	}

	handleWithdrawMissingProperties() {
		const {
			verified,
			bankAccount
		} = this.state

		if(!verified || !bankAccount) {
			if(!verified) {
				this.setState({ kycRequiredMessage: true })
			}
			if (!bankAccount) {
				this.setState({ bankAccountRequiredMessage: true })
			}
			setTimeout(
				() => this.setState({
					kycRequiredMessage: false,
					bankAccountRequiredMessage: false
				}),
				3000
			)
			return
		}
		this.setState({ isProceedingToPayout: true })
	}

	render() {

		const {
			isUpdatingKyc,
			isUpdatingBankAccount,
			isProceedingToPayout,
			verified,
			bankAccount,
			funds,
			bankAccountRequiredMessage,
			kycRequiredMessage
		} = this.state

		const {
			t,
			user,
		} = this.props
		const {
			firstName,
			lastName
		} = user

		if (isUpdatingKyc) {
			return (
				<Kyc
					onClose={() => {
						this.setState({ isUpdatingKyc: false })
						this.fetchMangoPayInfo()
					}}
				/>
			)
		}

		if (isUpdatingBankAccount) {
			return (
				<BankAccount
					onClose={() => {
						this.setState({ isUpdatingBankAccount: false })
						this.fetchMangoPayInfo()
					}}
				/>
			)
		}

		if(isProceedingToPayout) {
			return (
				<Payout
					onClose={() => {
						this.setState({ isProceedingToPayout: false })
						this.fetchMangoPayInfo()
					}}
				/>
			)
		}

		return (
			<div className='full-container flex-column flex-start payments-methods'>
				<span className='maxi-title title'>
					{capitalize(t('cashout'))}
				</span>
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
					<span className='small-text row-item citrusGrey'>{capitalize(t('accountVerified'))}</span>
					<span className='small-text row-item'>{verified ? capitalize(t('verified')) : capitalize(t('unverified'))}</span>
					<span
						className={
							kycRequiredMessage ?
								'small-text citrusRed mobile-warning' :
								'small-text row-item simple-link'
						}
						onClick={() => this.setState({ isUpdatingKyc: true })}
					>
						{
							kycRequiredMessage ?
								capitalize(t('kycRequired')) :
								t('addDocuments')
						}
					</span>
				</div>
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('bankAccount'))}</span>
					<span className='small-text row-item'>
							{bankAccount ? bankAccount : capitalize(t('no'))}
					</span>
					<span
						className={
							bankAccountRequiredMessage?
								'small-text citrusRed mobile-warning' :
								'small-text row-item simple-link'
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
				<div className='flex-row row-dashboard'>
					<span className='small-text row-item citrusGrey'>{capitalize(t('myGains'))}</span>
					<span className='small-text row-item'>{funds}</span>
					<span
						className='small-text row-item simple-link'
						onClick={this.handleWithdrawMissingProperties}
					>
						{t('withdraw')}
					</span>
				</div>
				<style jsx='true'>
					{`
					.title {
						margin-bottom: 30px;
					}
					@media only screen and (max-width: 640px) {
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PaymentsMethods))
