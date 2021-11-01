import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import moment from 'moment'
import { cardRegistration } from 'mangopay-cardregistration-js-kit'
import Cards from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'
import { PaymentInputsContainer } from 'react-payment-inputs'

import {
	capitalize,
	returnCurrencyCode
} from '../../../utils/various'
import { checkDateValue } from '../../../utils/validations'

import '../../../styling/spacings.css'
import '../../../styling/buttons.css'
import '../../../styling/colors.css'
import '../../../styling/App.css'
import CountrySelector from '../../../components/country-selector'
import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import {
	createMpUser,
	createMpUserWallet,
	createMpUserCardRegistration,
	updateMpUserCardRegistration,
	fetchMpUserInfo,
	fetchMpWalletInfo,
	fetchMpCardInfo
} from '../../../services/mangopay'

import {
	updateUser,
	loadUser
} from '../../../actions/auth-actions'

const { REACT_APP_MANGOPAY_CLIENT_ID } = process.env

class CreditCardForm extends React.Component {
	constructor(props) {
		super(props)
		const { user } = this.props
		const initialExpirationDate =
			user?.creditCard?.expirationDate.slice(0, 2) + '/' + user?.creditCard?.expirationDate.slice(2)
		this.state = {
			cvc: '',
			expiry: '',
			number: '',
			FirstName: '',
			LastName: '',
			Birthday: '',
			Nationality: '',
			CountryOfResidence: '',
			isLoading: false,
			warningMessage: '',
			loadingMessage: ''
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateInputChange = this.handleDateInputChange.bind(this)
	}

	handleMissingParam(newUser) {
		if (
			!this.state.cvc ||
			!this.state.expiry ||
			!this.state.number
		) {
			return true
		}
		if (!newUser) {
			if (
				!this.state.FirstName ||
				!this.state.LastName ||
				!this.state.Birthday ||
				!this.state.Nationality ||
				!this.state.CountryOfResidence
			) {
				return true
			}
		}
	}

	handleDateInputChange(e) {
		let input = e.target.value
		if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3)
		const values = input.split('/').map(function (v) {
			return v.replace(/\D/g, '')
		})
		if (values[0]) values[0] = checkDateValue(values[0], 12)
		if (values[1]) values[1] = checkDateValue(values[1], 31)
		const output = values.map(function (v, i) {
			return v.length == 2 && i < 2 ? v + ' / ' : v
		})
		return this.setState({ Birthday: output.join('').substr(0, 14) })
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	async handleSubmit(e) {

		let mpUser = null
		let mpUserWallet = null
		let mpUserCardRegistration = null

		const {
			cvc,
			expiry,
			number,
			FirstName,
			LastName,
			Birthday,
			Nationality,
			CountryOfResidence,
			warningMessage
		} = this.state

		const {
			t,
			updateUser,
			user
		} = this.props

		e.preventDefault()

		const createLoadingMessage = (msg) => {
			this.setState({
				loadingMessage: msg
			})
		}

		const endPaymentProcess = (mpUserId) => {
			const { onSuccess } = this.props
			onSuccess(mpUserId)
		}

		const endPaymentProcessWithError = res => {
			console.log(res, res.ResultCode, res.ResultMessage)
			this.setState({
				isLoading: false,
				warningMessage: `${capitalize(t('somethingWentWrongRegisteringYourCard'))} : ${res.ResultMessage}`
			})
		}

		const registerNewCard = (mpUserCardRegistration, mpUserInfo) => {

			const {
				mpUserId,
				mpUserLastName,
				mpUserFirstName
			} = mpUserInfo

			createLoadingMessage(capitalize(t('registeringCard')))
			cardRegistration.baseURL = 'https://api.sandbox.mangopay.com'
			cardRegistration.clientId = REACT_APP_MANGOPAY_CLIENT_ID

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

			cardRegistration.registerCard(
				cardData,
				function (res) {
					updateMpUserCardRegistration(res.RegistrationData, res.Id)
						.then(async (res) => {
							const cardInfo = await fetchMpCardInfo(mpUserId)
							if (cardInfo && mpUserId) {
								updateUser({
									id: user._id,
									creditCard: {
										alias: cardInfo.Alias,
										expirationDate: cardInfo.ExpirationDate
									},
									MPUserId: mpUserId,
									firstName: user.firstName.length > 0 ? user.firstName : mpUserFirstName,
									lastName: user.lastName.length > 0 ? user.LastName : mpUserLastName
								}, true)
							}
							endPaymentProcess(mpUserId)
						})
				},
				function (res) {
					endPaymentProcessWithError(res)
				}
			)
		}

		if (this.handleMissingParam(user.MPUserId)) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		this.setState({ isLoading: true })

		const birthday = (new Date(Birthday).getTime() / 1000)

		createLoadingMessage(capitalize(t('creatingMangoUser')))
		mpUser = await createMpUser(
			FirstName,
			LastName,
			birthday,
			Nationality,
			CountryOfResidence,
			user.email
		)
		if (mpUser) {
			createLoadingMessage(capitalize(t('creatingMangoUserWallet')))
			mpUserWallet = await createMpUserWallet(mpUser.Id, returnCurrencyCode(moment.locale()))
		}
		if (mpUserWallet) {
			createLoadingMessage(capitalize(t('creatingCardRegistration')))
			const CardType = null
			mpUserCardRegistration = await createMpUserCardRegistration(mpUser.Id, CardType)
		}

		if (mpUserCardRegistration) {
			const info = {
				mpUserId: mpUser.Id,
				mpUserFirstName: FirstName,
				mpUserLastName: LastName
			}
			registerNewCard(mpUserCardRegistration, info)
		}
	}

	render() {
		const {
			t,
			onClose,
			onCancel,
			user,
			title
		} = this.props
		const {
			number,
			expiry,
			cvc,
			isLoading,
			error,
			Birthday,
			loadingMessage,
			warningMessage
		} = this.state

		if (isLoading) {
			return (
				<div
					className='flex-center my-plan-container'
					style={{ justifyContent: 'center' }}
				>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey small-responsive-title'
						style={{ textAlign: 'center' }}
					>
						{loadingMessage}
					</span>
				</div>
			)
		}

		return (
			<div className='full-container flex-column credit-card-container'>
				<div className='desktop-only-medium-separator'></div>
				<div className='small-separator'></div>
				<form
					id='credit-card-form'
					className='credit-card-form card card-like'
					onSubmit={this.handleSubmit}
				>
					<div className='small-separator'></div>
					<span className='small-title citrusBlack small-responsive-title'>
						{capitalize(t('saveYourBillingInfo'))}
					</span>
					<div className='medium-separator'></div>
					<PaymentInputsContainer>
						{({ meta, getCardNumberProps, getExpiryDateProps, getCVCProps }) => (
							<div
								className='flex-column'
								style={{ width: '100%' }}
							>
								<TextField
									style={{ margin: '2% 0 2% 0' }}
									variant='outlined'
									label={capitalize(t('cardNumber'))}
									inputProps={getCardNumberProps({ onChange: e => this.handleInputChange(e, 'number') })}
									value={number}
								/>
								<div
									className='flex-row'
									style={{ justifyContent: 'space-between' }}
								>
									<TextField
										style={{ width: '50%', margin: '2% 2.5% 2% 0' }}
										variant='outlined'
										label={capitalize(t('expiry'))}
										inputProps={getExpiryDateProps({ onChange: e => this.handleInputChange(e, 'expiry') })}
										value={expiry}
									/>
									<TextField
										style={{ width: '50%', margin: '2% 0 2% 2.5%' }}
										variant='outlined'
										label={capitalize(t('cvc'))}
										inputProps={getCVCProps({ onChange: e => this.handleInputChange(e, 'cvc') })}
										value={cvc}
									/>
								</div>
								{
									meta.isTouched && meta.error &&
									<>
										<div className='small-separator'></div>
										<span className='small-text-bold citrusRed'>
											{meta.error}
										</span>
									</>
								}
								<div className='flex-row'>
									<TextField
										label={capitalize(t('firstName'))}
										onChange={e => this.handleInputChange(e, 'FirstName')}
										style={{ width: '47.5%', margin: '2% 2.5% 2% 0' }}
										variant='outlined'
									/>
									<TextField
										label={capitalize(t('lastName'))}
										onChange={e => this.handleInputChange(e, 'LastName')}
										style={{ width: '47.5%', margin: '2% 0 2% 2.5%' }}
										variant='outlined'
									/>
								</div>
								<div className='row flex-row'>
									<CountrySelector
										style={{ width: '47.5%', margin: '2% 2.5% 0 0' }}
										name={capitalize(t('nationality'))}
										onSelect={Nationality => this.setState({ Nationality })}
									/>
									<CountrySelector
										style={{ width: '47.5%', margin: '2% 0 0 2.5%' }}
										name={capitalize(t('countryOfResidence'))}
										onSelect={CountryOfResidence => this.setState({ CountryOfResidence })}
									/>
								</div>
								<div
									className='row flex-row medium-text flex-center'
									style={{ marginTop: '15px' }}
								>
									<span className='small-text citrusGrey' style={{ marginRight: '5px' }}>Birthday : </span>
									<TextField
										placeholder={t('datePlaceHolder')}
										onChange={e => this.handleDateInputChange(e)}
										style={{ width: '45%', margin: '2% 2.5%' }}
										variant='standard'
										helperText={Birthday.length > 0 && capitalize(t('dateFormatMustBe'))}
										value={Birthday}
									/>
								</div>
							</div>
						)}
					</PaymentInputsContainer>
					<div className='medium-separator'></div>
					{/* Show any error that happens when processing the payment */}
					{
						warningMessage &&
						<div style={{ textAlign: 'center' }} className='small-text red' role='alert'>
							{warningMessage}
							<div className='small-separator'></div>
						</div>
					}
					<div className='button-container flex-center flex-column'>
						<button
							className='filled-button full-width'
							type='submit'
							form='credit-card-form'
						>
							<span className='small-title citrusWhite'>
								{title}
							</span>
						</button>
						<div className='medium-separator'></div>
					</div>
				</form>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
						}
						.title {
							margin-left: 2px;
							margin-bottom: 30px;
						}
						.button-container {
							padding-top: 10px;
							padding-bottom: 20px;
						}
						.MuiInputBase-input {
							color: #C2C2C2;
						}
						input#card-number.credit-card-input::placeholder,
						input#cvc.credit-card-input::placeholder,
						input#card-expiry.credit-card-input::placeholder {
							color: #808080;
						}
						.credit-card-row {
							width: 97.5%;
							justify-content: flex-start;
							flex-wrap: wrap;
						}
						.rccs {
							margin: unset;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
							}
							.filled-button,
							.light-button {
								width: 98%;
								margin: 0 1%;
							}
							.credit-card-row {
								flex-direction: column;
								justify-content: center;
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CreditCardForm))