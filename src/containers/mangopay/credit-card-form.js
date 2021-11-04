import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import CreditCardInput from 'react-credit-card-input'
import { TextField } from '@material-ui/core'
import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import frLocale from 'date-fns/locale/fr'
import enLocale from 'date-fns/locale/en-US'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import moment from 'moment'
import { cardRegistration } from 'mangopay-cardregistration-js-kit'

import {
	capitalize,
	returnCurrencyCode
} from '../../utils/various'
import { checkDateValue } from '../../utils/validations'

import '../../styling/spacings.css'
import '../../styling/buttons.css'
import '../../styling/colors.css'
import '../../styling/App.css'
import CountrySelector from '../../components/country-selector'
import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import {
	createMpUser,
	createMpUserWallet,
	createMpUserCardRegistration,
	updateMpUserCardRegistration
} from '../../services/mangopay'

import {
	updateUser
} from '../../actions/auth-actions'

const { REACT_APP_MANGOPAY_CLIENT_ID } = process.env

const locale = moment.locale() == 'fr' ? frLocale : enLocale

class CreditCardForm extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			cvc: '',
			expiry: '',
			number: '',
			FirstName: '',
			LastName: '',
			Birthday: new Date('1990-08-18'),
			Nationality: '',
			CountryOfResidence: '',
			isLoading: false,
			warningMessage: '',
			loadingMessage: '',
			success: false
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
		if(!newUser) {
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

		const createLoadingMessage = (msg) => {
			this.setState({
				loadingMessage: msg
			})
		}

		const endPaymentProcess = () => {
			this.setState({ success: true })
		}

		const endPaymentProcessWithError = res => {
			console.log(res, res.ResultCode, res.ResultMessage)
			this.setState({
				isLoading: false,
				warningMessage: `${capitalize(t('somethingWentWrongRegisteringYourCard'))} : ${res.ResultMessage}`
			})
		}

		const registerNewCard = (mpUserCardRegistration) => {

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
						.then(res => {
							endPaymentProcess()
						})
				},
				function (res) {
					endPaymentProcessWithError(res)
				}
			)
		}

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
		if (this.handleMissingParam(user.MPUserId)) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		if (expiry) {
			const expiryTrimmed = expiry.replace(/\s/g, "")
			const month = new Date().getMonth()
			const year = new Date().getFullYear()
			const expiryMonth = expiryTrimmed.split('/')[0]
			const expiryYear = `20${expiryTrimmed.split('/')[1]}`

			if (expiryYear < year) {
				this.setState({
					warningMessage: capitalize(this.props.t('invalidExpiryDate'))
				})
				setTimeout(function () {
					this.setState({
						warningMessage: ''
					})
				}.bind(this), 3000)
				return
			}
			if (expiryYear == year && expiryMonth < month) {
				this.setState({
					warningMessage: capitalize(this.props.t('invalidExpiryDate'))
				})
				setTimeout(function () {
					this.setState({
						warningMessage: ''
					})
				}.bind(this), 3000)
				return
			}
		}

		this.setState({ isLoading: true })

		if (user.MPUserId) {
			createLoadingMessage(capitalize(t('creatingCardRegistration')))
			const CardType = null
			mpUserCardRegistration = await createMpUserCardRegistration(
				user.MPUserId,
				CardType,
				returnCurrencyCode(moment.locale())
			)
			if (mpUserCardRegistration) {
				return registerNewCard(mpUserCardRegistration)
			}
		}

		const formattedDate = moment(Birthday).format('L')
		const splitDate = formattedDate.split('/')
		const updatedDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0])
		const birthday = updatedDate.setTime(updatedDate.getTime() + (2 * 60 * 60 * 1000)) / 1000
		console.log(birthday)

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
			await updateUser({ id: user._id, MPUserId: mpUser.Id }, true)
			createLoadingMessage(capitalize(t('creatingMangoUserWallet')))
			mpUserWallet = await createMpUserWallet(mpUser.Id)
		}
		if (mpUserWallet) {
			createLoadingMessage(capitalize(t('creatingCardRegistration')))
			const CardType = null
			mpUserCardRegistration = await createMpUserCardRegistration(
				mpUser.Id,
				CardType,
				returnCurrencyCode(moment.locale())
			)
		}

		if (mpUserCardRegistration) {
			registerNewCard(mpUserCardRegistration)
		}
	}

	render() {
		const {
			t,
			onClose,
			user
		} = this.props
		const {
			number,
			expiry,
			cvc,
			isLoading,
			error,
			Birthday,
			loadingMessage,
			warningMessage,
			success
		} = this.state

		if (success) {
			return (
				<div className='flex-column card success'>
					<div
						className='top-container hover'
						onClick={this.props.onSuccess}
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div className='small-title success-feedback'>
						{capitalize(t('CardSubmitedSuccessfully'))}
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
				<div className='flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type='Oval'
						color='#C2C2C2'
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
			<div className='full-container flex-column credit-card'>
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
						{capitalize(t('paymentsHistory'))}
					</span>
				</div>
				<span className='maxi-title title'>
					{capitalize(t('creditCardDetails'))}
				</span>
				<form
					id='credit-card-form'
					className='credit-card-form'
					onSubmit={this.handleSubmit}
				>
					<div style={{ width: '95%', margin: '5% 2.5% 2%' }}>
						<CreditCardInput
							cardNumberInputProps={{ value: number, onChange: e => this.handleInputChange(e, 'number') }}
							cardExpiryInputProps={{ value: expiry, onChange: e => this.handleInputChange(e, 'expiry') }}
							cardCVCInputProps={{ value: cvc, onChange: e => this.handleInputChange(e, 'cvc') }}
							fieldClassName="input"
						/>
					</div>
					{
						!user.MPUserId &&
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
								/>
								<CountrySelector
									style={{ width: '45%', margin: '2% 2.5%' }}
									name="Residence"
									onSelect={CountryOfResidence => this.setState({ CountryOfResidence })}
								/>
							</div>
							<div
								className='row flex-row medium-text flex-center'
								style={{ marginTop: '15px' }}
							>
								<span className='small-text citrusGrey' style={{ marginRight: '5px' }}>
									{capitalize(t('birthday'))} :
								</span>
								<MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
									<DatePicker
										format={locale === frLocale ? 'dd MM yyyy' : 'MM dd yyyy'}
										variant='dialog'
										openTo='year'
										views={['year', 'month', 'date']}
										value={Birthday}
										onChange={date => this.setState({ Birthday: date })}
									/>
								</MuiPickersUtilsProvider>
							</div>
						</div>
					}
					<div className='medium-separator'></div>
					{/* Show any error that happens when processing the payment */}
					{
						warningMessage &&
						<div style={{ textAlign: 'center' }} className='small-text red' role='alert'>
							{warningMessage}
							<div className='small-separator'></div>
						</div>
					}
					<div className='button-container flex-center'>
						<button
							className='filled-button'
							type='submit'
							form='credit-card-form'
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('submit'))}
							</span>
						</button>
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
						.credit-card-form {
							background-color: #FFFFFF;
						}
						.button-container {
							padding-top: 10px;
							padding-bottom: 20px;
						}
						input#card-number.credit-card-input::placeholder,
						input#cvc.credit-card-input::placeholder,
						input#card-expiry.credit-card-input::placeholder {
							color: #808080;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
							}
							.credit-card {
								width: 98%;
								margin: 0 1%;
							}
							.filled-button,
							.light-button {
								width: 98%;
								margin: 0 1%;
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CreditCardForm))