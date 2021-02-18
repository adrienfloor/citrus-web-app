import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
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
	createMpCardDirectPayin
} from '../../services/mangopay'

class Subscription extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			warningMessage: '',
			success: false
		}
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	async handleSubmit(e) {

		const createLoadingMessage = (msg) => {
			this.setState({
				loadingMessage: msg
			})
		}

		const endPaymentProcess = () => {
			this.setState({ success: true })
		}

		const {
			t,
			updateUser,
			user,
			isPrepaying,
			cardId,
			walletId,
			onSuccess
		} = this.props

		e.preventDefault()
		this.setState({ isLoading: true })

		createLoadingMessage(capitalize(t('processingPayment')))

		createMpCardDirectPayin(
			user.mangoPayUserId,
			user.mangoPayUserId,
			walletId,
			{
				"Currency": "EUR",
				"Amount": (20 * 100)
			},
			{
				"Currency": "EUR",
				"Amount": 0
			},
			'http://localhost:3000/dashboard',
			cardId,
			user.email,
			"Subscriber"
		).then(res => {
			onSuccess()
			createLoadingMessage(capitalize(t('paymentComplete')))
			if (res.SecureModeRedirectURL) {
				window.location.href = res.SecureModeRedirectURL
			} else {
				endPaymentProcess()
			}
		})

	}

	render() {

		const {
			isLoading,
			warningMessage,
			success,
		} = this.state
		const {
			t,
			onClose,
			onSuccess
		} = this.props

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
							onClick={onSuccess}
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
						{capitalize(t('InformationSubmitedSuccessfully'))}...
					</div>
				</div>
			)
		}

		if (isLoading) {
			const { loadingMessage } = this.state
			return (
				<div className='full-container flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#FF8832"
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
					<span className='small-text'>{loadingMessage}</span>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column bank-account-registration'
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
					<h2 className='medium-title'>Subscription plan</h2>
					<span className='small-text'>Select our monthly subscription and get unlimited content for only 20euros a month</span>
					<div className='big-separator'></div>
					<span className='small-text'>Click to subscribe </span>
					<div className='big-separator'></div>
					<div
					className='flex-center'
						style={{ width: '100%' }}
					>
						<button
							className='action-button'
							onClick={this.handleSubmit}
						>
							{capitalize(t('submit'))}
						</button>
					</div>
					<div className='small-separator'></div>
					<span className='small-text red'>{warningMessage}</span>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					@media only screen and (max-width: 640px) {
						.bank-account-registration {
							height: 100%;
							overflow: auto;
    					padding-bottom: 20px;
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Subscription))