import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField, Checkbox } from '@material-ui/core'

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
	createMpCardDirectPayin,
	fetchMpWalletInfo,
	fetchMpCardInfo
} from '../../services/mangopay'

import {
	updateUser,
	loadUser
} from '../../actions/auth-actions'

const { REACT_APP_CITRUS_WALLET_ID } = process.env

class TopUp extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			value: null,
			warningMessage: '',
			isLoading: false,
			success: false,
			automaticTopUp: false
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
		this.updateUserVideos = this.updateUserVideos.bind(this)
	}

	updateUserVideos() {
		const {
			user,
			updateUser,
			loadUser
		} = this.props
		const {
			_id,
			myVideos
		} = user
		const {
			value,
			automaticTopUp
		} = this.state
		const updatedVideos = myVideos + parseInt(value)
		updateUser({
			id: _id,
			myVideos: updatedVideos,
			automaticTopUp
		}, true)
			.then(() => {
				this.setState({
					isLoading: false,
					success: true
				})
				loadUser()
			})
	}

	handleMissingParam() {
		if (!this.state.value || this.state.value < 10) {
			return true
		}
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	async handleSubmit(e) {
		const { user, t } = this.props
		const { MPUserId} = user
		const {
			value
		} = this.state

		e.preventDefault()
		if (this.handleMissingParam()) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		this.setState({ isLoading: true })

		const wallet = await fetchMpWalletInfo(MPUserId)
		const card = await fetchMpCardInfo(MPUserId)

		const payment = await createMpCardDirectPayin(
			MPUserId,
			MPUserId,
			wallet.Id,
			{
				"Currency": "EUR",
				"Amount": (value * 100)
			},
			{
				"Currency": "EUR",
				"Amount": 0
			},
			'http://localhost:3000/dashboard',
			card.Id,
			user.email,
			"A la carte"
		)

		if (payment && payment.Status === "SUCCEEDED") {
			this.updateUserVideos()
		} else {
			this.setState({
				isLoading: false,
				warningMessage: capitalize(this.props.t('somethingWentProcessingYourPayment'))
			})
		}

	}

	render() {

		const {
			value,
			warningMessage,
			isLoading,
			success,
			automaticTopUp
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
						{capitalize(t('PaymentSubmitedSuccessfully'))}
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
			<div className='full-container flex-column top-up'>
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
					{capitalize(t('topUpYourAccount'))}
				</span>
				<span className='small-text-high topup-disclaimer'>
					{capitalize(t('topUpDisclaimer'))}
				</span>
				<div className='flex-column flex-center top-up-card'>
					<div className='input-container'>
						<input
							placeholder='10'
							className='text-input small-text citrusGrey input left-input'
							onChange={e => this.handleInputChange(e, 'value')}
						/>
						<div className='right-input hover citrusGrey'>
							€
						</div>
					</div>
					<span className='small-text citrusGrey minimum-topup'>
						{capitalize(t('minimumTopUpValue'))} €
					</span>
					<div className='flex-row checkbox-row'>
						<Checkbox
							checked={automaticTopUp}
							onChange={() => this.setState({ automaticTopUp: !automaticTopUp })}
							inputProps={{ 'aria-label': 'topup checkbox' }}
							color='primary'
						/>
						<span className='small-text'>{capitalize(t('automaticTopUp'))}</span>
					</div>
					<div className='small-separator'></div>
					<div className='button-container flex-center'>
						<button
							className='filled-button'
							onClick={this.handleSubmit}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('topUp'))}
							</span>
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
					.title {
						margin-bottom: 30px;
					}
					.top-up-card {
						background-color: #FFFFFF;
						height: 321px;
					}
					.topup-disclaimer {
						margin-bottom: 30px;
					}
					.checkbox-row {
						display: flex;
						flex-direction: row;
						justify-content: flex-start;
						align-items: center;
						background-color: #F8F8F8;
						width: 454px;
						margin-bottom: 30px;
					}
					.minimum-topup {
						width: 454px;
						margin-bottom: 30px;
					}
					.left-input {
						width: 80%;
						color: #000000
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
						width: 100%;
					}
					@media only screen and (max-width: 640px) {
						.top-up {
							width: 96%;
							margin: 0 2%;
						}
						.top-up-card {
							width: 98%;
							padding: 0 1%;
						}
						.title {
							margin-bottom: 10px;
							margin-top: 0;
							font-size: 36px !important;
							line-height: 40px !important;
						}
						.minimum-topup {
							width: 100%;
							margin-top: 20px;
							height: 52px;
							margin-bottom: 0;
						}
						.checkbox-row {
							width: 100%;
							margin-top: 10px;
						}
						.input-container,
						.topup-disclaimer {
							width: 100%;
							margin-bottom: 20px;
						}
						.left-input {
							width: 80% !important;
							margin: 0 !important;
						}
						.right-input {
							width: 20% !important;
							margin: 0 !important;
						}
						.button-container {
							padding-bottom: 70px;
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TopUp))