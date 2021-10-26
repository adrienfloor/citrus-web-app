import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import {
	capitalize
} from '../../utils/various'
import {
	fetchMpBankAccountId,
	fetchMpWalletInfo,
	createMpPayout
} from '../../services/mangopay'

let walletInfo = ''
let bankAccountId = ''

class Payout extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			warningMessage: '',
			success: false,
			funds: 0,
			amountToWithdraw: 0
		}
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	async componentDidMount() {
		const { user, t } = this.props
		const { MPUserId } = user
		bankAccountId = await fetchMpBankAccountId(MPUserId)
		walletInfo = await fetchMpWalletInfo(MPUserId)
		this.setState({ funds: walletInfo.Balance.Amount / 100 })

		if(!bankAccountId) {
			this.setState({
				warningMessage: capitalize(t('noBankAccountAssociatedToThisUser'))
			})
		}
	}

	async handleSubmit(e) {
		const { user, t } = this.props
		const { MPUserId} = user
		const { funds, amountToWithdraw } = this.state

		e.preventDefault()
		if (funds < 150) {
			this.setState({
				warningMessage: capitalize(this.props.t('youCantWithdrawLessThan150Credits'))
			})
			return
		}

		if (funds < 150 && amountToWithdraw < funds) {
			this.setState({
				warningMessage: capitalize(this.props.t('youCantWithdrawThisAmount'))
			})
			return
		}

		this.setState({ isLoading: true })

		const payout = await createMpPayout(MPUserId, bankAccountId, amountToWithdraw)

		if (payout.Status === 'CREATED' && payout.Type === 'PAYOUT') {
			this.setState({
				isLoading: false,
				success: true
			})
		} else {
			this.setState({
				isLoading: false,
				warningMessage: capitalize(this.props.t('somethingWentWrongUploadingYourInfo'))
			})
		}

	}

	render() {

		const {
			isLoading,
			warningMessage,
			success,
			funds
		} = this.state
		const { t, onClose } = this.props

		if (success) {
			return (
				<div className='flex-column card success'>
					<div
						className='top-container hover'
						onClick={onClose}
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div className='small-title success-feedback'>
						{capitalize(t('PayoutSubmitedSuccessfully'))}
					</div>
					<style jsx='true'>
						{`
						.success {
							width: 690px;
							height: 431px;
							justify-content: flex-start;
							align-items: center;
						}
						.top-container {
							width: 95%;
							height: 40%;
							padding: 2.5%;
							display:flex;
							align-items: flex-start;
							justify-content: flex-end;
						}
						@media only screen and (max-width: 640px) {
							.success {
								width: 98%;
								height: 85%;
								margin: 0 1%;
							}
							.success-feedback {
								margin-left: 5px;
							}
						}
					`}
					</style>
				</div>
			)
		}

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
				</div>
			)
		}

		return (
			<div className='full-container flex-column payout'>
				<div
					style={{
						width: '100%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
					onClick={onClose}
					className='hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('cashout'))}
					</span>
				</div>
				<span className='maxi-title title mobile-margin'>
					{capitalize(t('cashYourEarnings'))}
				</span>
				<span className='small-text-high mobile-margin'>
					{capitalize(t('weNeedYourConfirmation'))}.
				</span>
				<div className='small-separator'></div>
				<div className='flex-column flex-center payout-form'>
					<div className='form'>
						<div className='flex-row' style={{ justifyContent: 'space-between' }}>
							<span className='small-text citrusGrey'>{capitalize(t('currentFunds'))}</span>
							<span className='small-text'>{funds}</span>
						</div>
						<div className='small-separator'></div>
						<div className='input-container'>
							<input
								placeholder={capitalize(t('amoutToCashOut'))}
								className='text-input small-text citrusGrey input left-input'
								onChange={e => this.setState({ amountToWithdraw: e.target.value })}
							/>
							<div className='right-input hover citrusGrey'>
								€
							</div>
						</div>
						<div className='button-container flex-center'>
							<button
								className='filled-button'
								onClick={this.handleSubmit}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('withdraw'))}
								</span>
							</button>
						</div>
						<div className='small-separator'></div>
						<span className='small-text citrusRed flex-center'>{warningMessage}</span>
						{
							warningMessage === capitalize(t('noBankAccountAssociatedToThisUser')) &&
							<span className='medium-text simple-link'>
								<Link to="/bank-account-registration">{capitalize(t('registerABankAccount'))}</Link>
							</span>
						}
					</div>
				</div>
				<style jsx='true'>
					{`
					.payout-form {
						width: 690px;
						height: 321px;
						background-color: #FFFFFF;
					}
					.form {
						width: 454px;
					}
					.left-input {
						width: 80%;
					}
					.right-input {
						width: 20%;
						border-bottom: 1px solid #C2C2C2;
						height: 52px !important;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					.input-container {
						height: 52px;
						width: 454px;
						display: flex;
						flex-direction: row !important;
						margin-bottom: 10px;
					}
					.button-container {
						padding-top: 20px;
					}
					@media only screen and (max-width: 640px) {
						.payout-form {
							width: 98%;
							margin: 0 1%;
						}
						.form {
							width: 98%;
							margin: 0 1%;
						}
						.input-container {
							width: 100%;
						}
						.left-input {
							width: 80% !important;
							margin: 0 !important;
						}
						.right-input {
							width: 20% !important;
							margin: 0 !important;
						}
						.mobile-margin {
							width: 98%;
							margin-left: 2%;
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

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Payout))