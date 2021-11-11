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
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import moment from 'moment'
import { cardRegistration } from 'mangopay-cardregistration-js-kit'
import Cards from 'react-credit-cards'
import 'react-credit-cards/es/styles-compiled.css'
import { PaymentInputsContainer } from 'react-payment-inputs'
import Select from '@material-ui/core/Select'
import { MenuItem, InputLabel, FormControl } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { ReactComponent as Check } from '../../assets/svg/check.svg'

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
	createMpLegalUser,
	createMpUserWallet
} from '../../services/mangopay'

import { updateUser } from '../../actions/auth-actions'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const legalPersonTypeItems = Object.keys(translations.default.legalPersonTypesAvailable)
const { REACT_APP_MANGOPAY_CLIENT_ID } = process.env

const locale = moment.locale() == 'fr' ? frLocale : enLocale

class CreateLegalUser extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			LegalPersonType: '',
			Name: '',
			LegalRepresentativeFirstName: '',
			LegalRepresentativeLastName: '',
			LegalRepresentativeBirthday: new Date('1990-08-18'),
			LegalRepresentativeNationality: '',
			LegalRepresentativeCountryOfResidence: '',
			isLoading: false,
			warningMessage: '',
			isFailure: false
		}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.returnSimpleSelectItem = this.returnSimpleSelectItem.bind(this)
	}

	returnSimpleSelectItem(item) {
		const { t, user } = this.props
		return (
			<div
				className='flex-row'
				style={{
					alignItems: 'center',
					justifyContent: 'space-between',
					width: '100%'
				}}
			>
				<div>{capitalize(t(item))}</div>
				<Check
					width={20}
					height={20}
					strokeWidth={2}
				/>
			</div>
		)
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
		return this.setState({ LegalRepresentativeBirthday: output.join('').substr(0, 14) })
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	handleMissingParam() {
		const {
			LegalPersonType,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeBirthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence
		} = this.state

			if (
				!LegalPersonType ||
				!LegalRepresentativeFirstName ||
				!LegalRepresentativeLastName ||
				!LegalRepresentativeBirthday ||
				!LegalRepresentativeNationality ||
				!LegalRepresentativeCountryOfResidence
			) {
				return true
			}
	}

	async handleSubmit(e) {

		const {
			LegalPersonType,
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeBirthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence
		} = this.state
		const {
			user,
			updateUser,
			loadUser,
			onUserCreated,
			t
		} = this.props

		e.preventDefault()
		this.setState({ isLoading: true })

		if (this.handleMissingParam()) {
			this.setState({
				warningMessage: capitalize(t('pleaseEnterAllFields'))
			})
			return
		}

		const formattedDate = moment(LegalRepresentativeBirthday).format('L')
		const splitDate = formattedDate.split('/')
		const updatedDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0])
		const birthday = updatedDate.setTime(updatedDate.getTime() + (2 * 60 * 60 * 1000)) / 1000
		console.log(birthday)
		const name = Name ? Name : `${LegalRepresentativeFirstName} ${LegalRepresentativeLastName}`

		const mpLegalUser = await createMpLegalUser(
			LegalPersonType,
			name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			birthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			user.email,
			user.email
		)
		if (mpLegalUser && mpLegalUser.PersonType === 'LEGAL') {
			createMpUserWallet(mpLegalUser.Id, returnCurrencyCode(moment.locale()))
			.then(res => {
				if(res && res.Balance) {
					updateUser({
						id: user._id,
						MPLegalUserId: mpLegalUser.Id,
						firstName: user.firstName || LegalRepresentativeFirstName,
						lastName: user.lastName || LegalRepresentativeLastName
					}, true)
					.then(res => {
						onUserCreated()
						this.setState({ isLoading: false })
					})
				} else {
					this.setState({
						isLoading: false,
						isFailure: true,
						warningMessage: capitalize(t('errorDuringInfoRegistration'))
					})
				}
			})
			.catch(e => {
				this.setState({
					isLoading: false,
					isFailure: true,
					warningMessage: capitalize(t('errorDuringInfoRegistration'))
				})
			})
		}
	}

	render() {

		const {
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalPersonType,
			LegalRepresentativeBirthday,
			LegalRepresentativeEmail,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			isLoading,
			warningMessage,
			isFailure
		} = this.state
		const {
			user,
			onCancel,
			t
		} = this.props

		if (isLoading) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '100vh' }}
				>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
				</div>
			)
		}

		if (isFailure) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '100vh' }}
				>
					<span className='small-title citrusBlack'>
						{capitalize(t('somethingWentWrong'))}
					</span>
					<div className='small-separator'></div>
					<span className='small-text citrusBlack'>
						{warningMessage}
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<Link to='/schedule' className='filled-button'>
						<span className='small-title citrusWhite'>
							{capitalize(t('tryAgain'))}
						</span>
					</Link>
				</div>
			)
		}

		return (
			<div className='full-container flex-column credit-card-container'>
				<div className='small-separator'></div>
				<div
					style={{
						width: '100%',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center'
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
				<form
					id='legal-user-form'
					className='card create-legal-user-form'
					onSubmit={this.handleSubmit}
				>
					<div className='small-separator'></div>
					<span className='medium-title citrusBlack'>
						{capitalize(t('legalInformation'))}
					</span>
					<div className='small-separator'></div>
					<span className='smaller-text-bold citrusGrey'>
						{capitalize(t('legalUserCreationDisclaimer'))}
					</span>
					<div className='medium-separator'></div>
						<div
							className='flex-column'
							style={{ width: '100%' }}
						>
							<div className='desktop-only-small-separator'></div>
							<FormControl variant='outlined' style={{ margin: '2% 0 2% 0' }}>
								<InputLabel id='select-outlined-label'>
									{capitalize(t('legalPersonType'))}
								</InputLabel>
								<Select
									label={capitalize(t('legalPersonType'))}
									labelId='select-outlined-label'
									value={LegalPersonType}
									onChange={e => this.handleInputChange(e, 'LegalPersonType')}
								>
									{
										legalPersonTypeItems.map((type, i) => (
											<MenuItem value={type} key={i}>
												{
													type === LegalPersonType ?
														this.returnSimpleSelectItem(type) :
														capitalize(t(type))
												}
											</MenuItem>
										))
									}
								</Select>
							</FormControl>
							<TextField
								style={{ margin: '2% 0 2% 0' }}
								variant='outlined'
								label={capitalize(t('legalPersonName'))}
								value={Name}
								onChange={e => this.handleInputChange(e, 'Name')}
							/>
							<div className='row flex-row-desktop-column-mobile'>
								<TextField
									className='form-left-row'
									variant='outlined'
									label={capitalize(t('legalRepresentativeFirstName'))}
									value={LegalRepresentativeFirstName}
									onChange={e => this.handleInputChange(e, 'LegalRepresentativeFirstName')}
								/>
								<TextField
									className='form-right-row'
									variant='outlined'
									label={capitalize(t('legalRepresentativeLastName'))}
									value={LegalRepresentativeLastName}
									onChange={e => this.handleInputChange(e, 'LegalRepresentativeLastName')}
								/>
							</div>
							<div className='row flex-row-desktop-column-mobile'>
								<div className='form-left-row'>
									<CountrySelector
										style={{ width: '100%' }}
										name={capitalize(t('legalRepresentativeNationality'))}
										onSelect={LegalRepresentativeNationality  => this.setState({ LegalRepresentativeNationality  })}
									/>
								</div>
								<div className='form-right-row'>
									<CountrySelector
										style={{ width: '100%' }}
										name={capitalize(t('legalRepresentativeCountryOfResidence'))}
										onSelect={LegalRepresentativeCountryOfResidence => this.setState({ LegalRepresentativeCountryOfResidence })}
									/>
								</div>
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
										value={LegalRepresentativeBirthday}
										onChange={date => this.setState({ LegalRepresentativeBirthday: date })}
									/>
								</MuiPickersUtilsProvider>
							</div>
						</div>
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
							form='legal-user-form'
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('save'))}
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
						.form-left-row {
							 width: 49%;
							 margin: 2% 1% 2% 0;
						}
						.form-right-row {
							 width: 49%;
							 margin: 2% 0% 2% 1%;
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
							.form-left-row {
								 width: 100%;
								 margin: 2% 0 2% 0;
							}
							.form-right-row {
								 width: 100%;
								 margin: 2% 0% 2% 0;
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CreateLegalUser))