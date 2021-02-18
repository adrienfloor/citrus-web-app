import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField, Checkbox } from '@material-ui/core'
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
		})
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
		const { mangoPayUserId } = user
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

		const wallet = await fetchMpWalletInfo(mangoPayUserId)
		const card = await fetchMpCardInfo(mangoPayUserId)

		const payment = await createMpCardDirectPayin(
			mangoPayUserId,
			mangoPayUserId,
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
				<div className='full-container flex-column'>
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
					<div className='big-separator'></div>
					<div
						className='big-text'
						style={{ padding: '0 15%' }}
					>
						{capitalize(t('PaymentSubmitedSuccessfully'))}...
					</div>
					<div className='big-separator'></div>
				</div>
			)
		}

		if (isLoading) {
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
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column top-up'
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
					<h2 className='medium-title'>Top up your account</h2>
					<div className='small-separator'></div>
					<div className='row flex-row flex-center'>
						<span
							className='small-text'
							style={{ width: '45%', margin: '1% 2% 1% 0' }}
						>
						Amount to top up (min 10)
						</span>
						<TextField
							onChange={e => this.handleInputChange(e, 'value')}
							style={{ width: '30%', margin: '1% 0 1% 2%' }}
							variant='outlined'
						/>
					</div>
					<div className='small-separator'></div>
					<div className='flex-center'>
						<button
							className='small-action-button'
							onClick={this.handleSubmit}
						>
							{capitalize(t('submit'))}
						</button>
					</div>
					<div className='small-separator'></div>
					<span className='small-text red'>{warningMessage}</span>
					<div className='flex-column flex-center'>
						<div className='flex-row flex-center'>
							<Checkbox
								checked={automaticTopUp}
								onChange={() => this.setState({ automaticTopUp: !automaticTopUp })}
								inputProps={{ 'aria-label': 'topup checkbox' }}
								color='primary'
							/>
							<span className='small-text'>{capitalize(t('automaticTopUp'))}</span>
						</div>
						<span className='small-text padded'>{t('topUpDisclaimer')}</span>
					</div>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					@media only screen and (max-width: 640px) {
						.top-up {
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
	updateUser: userInfo => dispatch(updateUser(userInfo)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TopUp))