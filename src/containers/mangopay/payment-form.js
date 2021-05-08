import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import CreditCardInput from 'react-credit-card-input'
import { TextField } from '@material-ui/core'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import moment from 'moment'
import { cardRegistration } from 'mangopay-cardregistration-js-kit'

import {
	capitalize
} from '../../utils/various'
import '../../styling/spacings.css'
import '../../styling/buttons.css'
import '../../styling/colors.css'
import '../../styling/App.css'
import CountrySelector from '../../components/country-selector'

import {
	createMpUser,
	createMpUserWallet,
	createMpUserCardRegistration,
	updateMpUserCardRegistration,
	createMpCardDirectPayin
} from '../../services/mangopay'

import {
	updateUser
} from '../../actions/auth-actions'

const {
	REACT_APP_MANGOPAY_CLIENT_ID
} = process.env

class PaymentForm extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			cvc: '',
			expiry: '',
			number: '',
			FirstName: '',
			LastName: '',
			Birthday: '2000-05-24',
			Nationality: '',
			CountryOfResidence: '',
			isProcessing: false,
			error: '',
			loadingMessage: ''
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateChange = this.handleDateChange.bind(this)
	}

	handleMissingParam() {
		if(
			!this.state.cvc ||
			!this.state.expiry ||
			!this.state.number ||
			!this.state.FirstName ||
			!this.state.LastName ||
			!this.state.Birthday ||
			!this.state.Nationality ||
			!this.state.CountryOfResidence
		) {
			return true
		}
	}

	handleDateChange(e) {
		this.setState({ Birthday: e.target.value })
	}


	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	async handleSubmit(e) {

		const { onSuccess } = this.props

		let mpUser = null
		let mpUserWallet = null
		let mpUserCardRegistration = null

		const createLoadingMessage = (msg) => {
			this.setState({
				loadingMessage: msg
			})
		}

		const endPaymentProcess = () => {
			this.setState({ isProcessing: false})
			this.props.onSuccess()
		}

		const endPaymentProcessWithError = err => {
			this.setState({ isProcessing: false })
			this.props.isProcessingPayment(false)
			this.props.onError(err)
		}

		const {
			cvc,
			expiry,
			number,
			FirstName,
			LastName,
			Birthday,
			Nationality,
			CountryOfResidence
		} = this.state
		const {
			t,
			updateUser,
			user,
			isPrepaying
		} = this.props

		e.preventDefault()
		if(this.handleMissingParam()) {
			this.setState({
				error: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		this.props.isProcessingPayment(true)
		this.setState({ isProcessing: true })

		const birthday = parseInt(moment(Birthday).utc().format("X"))

		createLoadingMessage(capitalize(t('creatingMangoUser')))
		mpUser = await createMpUser(
			FirstName,
			LastName,
			birthday,
			Nationality,
			CountryOfResidence,
			this.props.customer.email
		)
		if(mpUser) {
			await updateUser({ id: user._id, MPUserId: mpUser.Id })
			createLoadingMessage(capitalize(t('creatingMangoUserWallet')))
			mpUserWallet = await createMpUserWallet(mpUser.Id)
		}
		if(mpUserWallet) {
			createLoadingMessage(capitalize(t('creatingCardRegistration')))
			const CardType = null
			mpUserCardRegistration = await createMpUserCardRegistration(mpUser.Id, CardType)
		}

		if(mpUserCardRegistration) {
			createLoadingMessage(capitalize(t('registeringCard')))
			cardRegistration.baseURL = 'https://api.sandbox.mangopay.com'
			cardRegistration.clientId = REACT_APP_MANGOPAY_CLIENT_ID
		}

		const cardRegistrationURL = mpUserCardRegistration.CardRegistrationURL
		const preregistrationData = mpUserCardRegistration.PreregistrationData
		const Id = mpUserCardRegistration.Id
		const accessKey = mpUserCardRegistration.AccessKey

		cardRegistration.init({
			cardRegistrationURL,
			preregistrationData,
			accessKey,
			Id
		})
		const trimmedCardNumber = [...number].filter(char => char !== ' ').join('')
		const cardData = {
			cardNumber: trimmedCardNumber,
			cardExpirationDate: expiry.split('/').map(e => e.trim()).join(''),
			cardCvx: cvc,
			cardType: 'CB_VISA_MASTERCARD'
		}

		createLoadingMessage(capitalize(t('processingPayment')))

		cardRegistration.registerCard(
			cardData,
			function (res) {
				updateMpUserCardRegistration(res.RegistrationData, res.Id)
				createMpCardDirectPayin(
					mpUser.Id,
					mpUser.Id,
					mpUserWallet.Id,
					{
						"Currency": "EUR",
						"Amount": (isPrepaying * 100)
					},
					{
						"Currency": "EUR",
						"Amount": 0
					},
					'http://localhost:3000/dashboard',
					res.CardId,
					user.email,
					isPrepaying == 20 ? 'Subscriber' : 'A la carte'
				).then(res => {
					createLoadingMessage(capitalize(t('paymentComplete')))
					if(res.SecureModeRedirectURL) {
						window.location.href = res.SecureModeRedirectURL
					} else {
						endPaymentProcess()
					}
				})
			},
			function (res) {
				endPaymentProcessWithError(res.ResultMessage)
			}
		)
	}

	render() {
		const {
			t,
			isPrepaying,
			customer
		} = this.props
		const {
			number,
			expiry,
			cvc,
			isProcessing,
			error,
			Birthday,
			loadingMessage
		} = this.state

		if(isProcessing) {
			return (
				<div className='flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
					<div className='medium-separator'></div>
					<span className='big-text'>
						{loadingMessage}
					</span>
				</div>
			)
		}
		return (
			<div id="PaymentForm">
				{/* <button onClick={() => this.setState({
					cvc: '123',
					expiry: '09 / 23',
					// number: '4972485830400049',
					number: '4972485830400056',
					FirstName: 'Jean',
					LastName: 'Michel',
					Birthday: '2000-05-24',
					Nationality: 'FR',
					CountryOfResidence: 'FR'
				})}>CLICK</button> */}
				<form
					onSubmit={this.handleSubmit}
					style={isPrepaying ? null : { opacity: 0.4 }}
				>
					<div style={{ width: '95%', margin: '5% 2.5% 2%' }}>
						{/* <div
							className='medium-text padded'
							style={{ width: 270, marginBottom: 5 }}
						>
							{capitalize(t('cardInformation'))}
						</div> */}
						<CreditCardInput
							cardNumberInputProps={{ value: number, onChange: e => this.handleInputChange(e, 'number') }}
							cardExpiryInputProps={{ value: expiry, onChange: e => this.handleInputChange(e, 'expiry') }}
							cardCVCInputProps={{ value: cvc, onChange: e => this.handleInputChange(e, 'cvc') }}
							fieldClassName="input"
						/>
					</div>
					<div>
						<div className='row flex-row'>
						  <TextField
								label="Firstname"
								onChange={e => this.handleInputChange(e, 'FirstName')}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
							<TextField
								label="Lastname"
								onChange={e => this.handleInputChange(e, 'LastName')}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '45%', margin: '2% 2.5%' }}
								name="Nationality"
								onSelect={Nationality => this.setState({ Nationality })}
								style={{ width: '95%', margin: '2.5%', border: 'none !important' }}
							/>
							<CountrySelector
								style={{ width: '45%', margin: '2% 2.5%' }}
								name="Residence"
								onSelect={CountryOfResidence => this.setState({ CountryOfResidence })}
								style={{ width: '95%', margin: '2.5%', border: 'none !important' }}
							/>
						</div>
						<div
							className='row flex-row medium-text flex-center'
							style={{ marginTop: '15px' }}
						>
							<span style={{ marginRight: '5px' }}>Birthday : </span>
							<TextField
								onChange={this.handleDateChange}
								type="date"
								defaultValue={Birthday}
								InputLabelProps={{
									shrink: true
								}}
							/>
						</div>
					</div>
					<div className='medium-separator'></div>
					<span
						className='medium-text flex-center'
						style={{
							fontWeight: 500
						}}
					>
						{`${capitalize(t('totalBilledToday'))} : ${isPrepaying || 0}€`}
					</span>
					<div className='small-separator'></div>
					<span
						className='small-text flex-center'
						style={{ padding: '0 10px' }}
					>
						{capitalize(t('iAgreeToCardRegistration'))}
					</span>
					<div className='medium-separator'></div>
					{/* Show any error that happens when processing the payment */}
					{
						error &&
						<div style={{ textAlign: 'center' }} className='small-text red' role='alert'>
							{error}
							<div className='small-separator'></div>
						</div>
					}
					<button
						className={
							isPrepaying ?
								'full-width-action-button' :
								'full-width-action-button disabled-button'
						}
						disabled={!isPrepaying}
						id='submit'
					>
						<span id='button-text' className='big-text'>
							{capitalize(t('payNow'))}
						</span>
					</button>
        </form>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
						}
						input#card-number.credit-card-input::placeholder,
						input#cvc.credit-card-input::placeholder,
						input#card-expiry.credit-card-input::placeholder {
							color: #808080;
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
	updateUser: userInfo => dispatch(updateUser(userInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PaymentForm))