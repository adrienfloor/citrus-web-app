import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { TextField } from '@material-ui/core'
import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import frLocale from 'date-fns/locale/fr'
import enLocale from 'date-fns/locale/en-US'
import CloseIcon from '@material-ui/icons/Close'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import moment from 'moment'
import { cardRegistration } from 'mangopay-cardregistration-js-kit'
import Cards from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'
import { PaymentInputsContainer } from 'react-payment-inputs'
import { Link } from 'react-router-dom'

import {
	capitalize,
	returnCurrencyCode,
	returnCurrency
} from '../../../utils/various'
import { checkDateValue } from '../../../utils/validations'

import '../../../styling/spacings.css'
import '../../../styling/buttons.css'
import '../../../styling/colors.css'
import '../../../styling/App.css'

import Signin from '../../auth/signin-from-redirect'
import CountrySelector from '../../../components/country-selector'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'
import { ReactComponent as Logo } from '../../../assets/svg/logo.svg'

import {
	createMpUser,
	createMpUserWallet,
	createMpUserCardRegistration,
	updateMpUserCardRegistration,
	fetchMpUserInfo,
	fetchMpWalletInfo,
	fetchMpCardInfo,
	createRecurringPayinRegistration,
	createRecurringPayinCIT,
	updateRecurringPayinRegistration
} from '../../../services/mangopay'

import {
	updateUser,
	loadUser,
	signin
} from '../../../actions/auth-actions'

const {
	REACT_APP_MANGOPAY_CLIENT_ID,
	REACT_APP_MANGOPAY_CARD_REGISTRATION_BASE_URL
} = process.env
const locale = moment.locale() == 'fr' ? frLocale : enLocale

class BillingFailure extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			cvc: '',
			expiry: '',
			number: '',
			isLoading: false,
			warningMessage: '',
			loadingMessage: ''
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateInputChange = this.handleDateInputChange.bind(this)
	}

	handleMissingParam() {
		if (
			!this.state.cvc ||
			!this.state.expiry ||
			!this.state.number
		) {
			return true
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

		let mpUserCardRegistration = null

		const {
			cvc,
			expiry,
			number,
			warningMessage
		} = this.state

		const {
			t,
			updateUser,
			user
		} = this.props
		const {
			MPUserId,
			MPRecurringPayinRegistrationId,
			subscription,
			email
		} = user

		e.preventDefault()

		const createLoadingMessage = (msg) => {
			this.setState({
				loadingMessage: msg
			})
		}

		const endPaymentProcess = (cardId) => {
			this.setState({
				isLoading: true,
				loadingMessage: capitalize(t('redirectedToYourBank'))
			})
			updateRecurringPayinRegistration(
				MPRecurringPayinRegistrationId,
				null,
				'ENDED'
			)
			// Handle re-subscription
			setTimeout(function () {
				createRecurringPayinRegistration(
					MPUserId,
					cardId,
					subscription,
					returnCurrencyCode(moment.locale())
				)
					.then(res => {
						if (res && res.Id) {
							updateUser({
								id: user._id,
								MPRecurringPayinRegistrationId: res.Id
							}, true)
							const MPRecurringPayinRegistrationId = res.Id
							createRecurringPayinCIT(
								MPRecurringPayinRegistrationId,
								false,
								returnCurrencyCode(moment.locale()),
								null,
								email
							)
								.then(res => {
									if (res && res.SecureModeRedirectURL) {
										window.location.href = res.SecureModeRedirectURL
									}
								})
						}
					})
					.catch(err => {
						console.log(err)
					})
			}.bind(this), 3000)
		}

		const endPaymentProcessWithError = res => {
			console.log(res, res.ResultCode, res.ResultMessage)
			this.setState({
				isLoading: false,
				warningMessage: `${capitalize(t('somethingWentWrongRegisteringYourCard'))} ${res.ResultMessage == undefined ? '' : `: ${res.ResultMessage}`}`
			})
		}

		const registerNewCard = (mpUserCardRegistration) => {

			console.log(mpUserCardRegistration)

			createLoadingMessage(capitalize(t('registeringCard')))
			cardRegistration.baseURL = REACT_APP_MANGOPAY_CARD_REGISTRATION_BASE_URL
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
							const cardInfo = await fetchMpCardInfo(MPUserId)
							if (cardInfo && cardInfo.Alias && cardInfo.ExpirationDate && MPUserId) {
								updateUser({
									id: user._id,
									creditCard: {
										alias: cardInfo.Alias,
										expirationDate: cardInfo.ExpirationDate
									}
								}, true)
									.then(res => endPaymentProcess(cardInfo.Id))
							}
						})
				},
				function (res) {
					endPaymentProcessWithError(res)
				}
			)
		}

		if (this.handleMissingParam()) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
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

		createLoadingMessage(capitalize(t('creatingCardRegistration')))
		const CardType = null
		mpUserCardRegistration = await createMpUserCardRegistration(MPUserId, CardType)
		console.log(mpUserCardRegistration)
		if (mpUserCardRegistration && mpUserCardRegistration.PreregistrationData) {
			const info = { mpUserId: MPUserId }
			registerNewCard(mpUserCardRegistration, info)
		} else {
			endPaymentProcessWithError({
				ResultMessage: t('errorRegisteringMangoPayUserCard')
			})
			return
		}
	}

	render() {
		const {
			t,
			onCancel,
			user,
			title,
			isAuthenticated,
			location
		} = this.props
		const {
			number,
			expiry,
			cvc,
			isLoading,
			error,
			loadingMessage,
			warningMessage
		} = this.state

		const isOnRedirectPage = this.props.location.pathname === '/billing_plan'

		if(!user) {
			return (
				<Signin
					onSigninSuccess={() => console.log('Signed in')}
					title={capitalize(t('confirmYourIdentity'))}
					location={location}
				/>
			)
		}

		if(user && (!user.MPUserId || !user.subscription)) {
			return (
				<div
					className='flex-center cancel-subscription-container'
					style={{ justifyContent: 'center' }}
				>
					<Logo
						width={100}
						height={100}
					/>
					<div className='medium-separator'></div>
					<span
						className='small-text-bold citrusGrey small-responsive-title'
						style={{ textAlign: 'center' }}
					>
						{capitalize(t('somethingWentWrongYouSHouldntBeHere'))}
					</span>
					<div className='medium-separator'></div>
					<Link
						to='/home'
						className='extra-small-text-bold hover citrusGrey'
						style={{
							width: 'max-content',
							textDecoration: 'underline'
						}}
					>
						{capitalize(t('goBackToHomePage'))}
					</Link>
				</div>
			)
		}

		if(isLoading) {
			return (
				<div
					className='flex-center cancel-subscription-container'
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
				<div className='desktop-only-small-separator'></div>
				{
					isOnRedirectPage ?
					<div className='max-separator'></div> :
					<div
						style={{
							width: '100%',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							marginTop: '5px'
						}}
						onClick={onCancel}
						className='hover'
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
				}
				<form
					id='credit-card-form'
					className='credit-card-form card card-like'
					onSubmit={this.handleSubmit}
				>
					<div className='small-separator'></div>
					<span className='small-title citrusBlack small-responsive-title'>
						{`${capitalize(t('planBillingFailure'))} : ${user.subscription}${returnCurrency(moment.locale())} / ${t('month')}`}
					</span>
					<div className='medium-separator'></div>
					<span className='smaller-text-bold citrusGrey small-responsive-title'>
						{capitalize(t('planBillingFailureDisclaimer'))}
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
								{capitalize(t('purchaseThisPlan'))}
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
	error: state.error,
	isAuthenticated: state.auth.isAuthenticated
})

const mapDispatchToProps = dispatch => ({
	loadUser: () => dispatch(loadUser()),
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	signin: (email, password) => dispatch(signin(email, password))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BillingFailure))