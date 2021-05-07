import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

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
		const { mangoPayUserId } = user
		bankAccountId = await fetchMpBankAccountId(mangoPayUserId)
		walletInfo = await fetchMpWalletInfo(mangoPayUserId)
		this.setState({ funds: walletInfo.Balance.Amount / 100 })

		if(!bankAccountId) {
			this.setState({
				warningMessage: capitalize(t('noBankAccountAssociatedToThisUser'))
			})
		}
	}

	async handleSubmit(e) {
		const { user, t } = this.props
		const { mangoPayUserId } = user
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

		const payout = await createMpPayout(mangoPayUserId, bankAccountId, amountToWithdraw)

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
				<div className='full-container flex-column flex-center'>
					<div
						style={{
							width: '100%',
							height: '10%',
							display: 'flex',
							justifyContent: 'flex-end',
							padding: '10px'
						}}
					>
						<CloseIcon
							className='action-icon'
							fontSize='large'
							onClick={onClose}
						/>
					</div>
					<div
						className='big-text'
						style={{
							width: '60%',
							height: '90%',
							marginTop: '100px'
						}}
					>
						{capitalize(t('PayoutSubmitedSuccessfully'))}...
					</div>
				</div>
			)
		}

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column payout'
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
						onClick={onClose}
					/>
				</div>
				<div className='billing-card flex-column padded'>
					<div className='medium-title'>Payout</div>
					<span className='small-text'>In order to withdraw your earnings, we need to get confirmation from you. Note that a payout can take a few days to appear on your bank account.</span>
					<div className='small-separator'></div>
					<span className='small-text'>Current funds : {funds}</span>
					<div className='small-separator'></div>
					<span className='small-text'>Amount to cash out : </span>
					<div className='small-separator'></div>
					<TextField
						style={{ width: '30%' }}
						label="Amount"
						onChange={e => this.setState({ amountToWithdraw: e.target.value })}
						variant='outlined'
					/>
					<div className='small-separator'></div>
					<button
						className='small-action-button'
						onClick={this.handleSubmit}
					>
						{capitalize(t('withdraw'))}
					</button>
					<div className='small-separator'></div>
					<span className='small-text red'>{warningMessage}</span>
					{
						warningMessage === capitalize(t('noBankAccountAssociatedToThisUser')) &&
						<span
							className='medium-text simple-link'
						>
							<Link to="/bank-account-registration">{capitalize(t('registerABankAccount'))}</Link>
						</span>
					}
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					@media only screen and (max-width: 640px) {
						.payout {
							width: 96%;
							margin: 0 2%;
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
	// updateUser: userInfo => dispatch(updateUser(userInfo)),
	// loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Payout))