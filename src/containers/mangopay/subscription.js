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

		if(success) {
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

		if(isLoading) {
			const { loadingMessage } = this.state
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