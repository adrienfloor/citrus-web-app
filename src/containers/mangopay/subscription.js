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

import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

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
			user.MPUserId,
			user.MPUserId,
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
				<div className='flex-column card success'>
					<div
						className='top-container hover'
						onClick={onSuccess}
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div className='small-title success-feedback'>
						{capitalize(t('InformationSubmitedSuccessfully'))}
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

		if(isLoading) {
			const { loadingMessage } = this.state
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
					<span className='small-text'>{loadingMessage}</span>
				</div>
			)
		}

		return (
			<div className='full-container flex-column'>
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
						{capitalize(t('payments'))}
					</span>
				</div>
				<span className='maxi-title title'>
					{capitalize(t('subscription'))}
				</span>
				<span className='small-text-high'>{capitalize(t('bySubscribing'))}.</span>
				<div className='medium-separator'></div>
				<div className='small-separator'></div>
				<div className='medium-separator'></div>
				<div className='small-separator'></div>
				<div
					className='flex-center'
					style={{ width: '100%' }}
				>
					<button
						className='filled-button'
						onClick={this.handleSubmit}
					>
						<span className='small-title citrusWhite'>
							{capitalize(t('subscribe'))}
						</span>
					</button>
				</div>
				<div className='small-separator'></div>
				<span className='small-text red'>{warningMessage}</span>
				<style jsx='true'>
					{`
					.title {
						margin-left: 2px;
						margin-bottom: 30px;
					}
					@media only screen and (max-width: 640px) {
						.title {
							margin-bottom: 10px;
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