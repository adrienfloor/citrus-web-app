import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import { TextField } from '@material-ui/core'
import 'date-fns'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import frLocale from 'date-fns/locale/fr'
import enLocale from 'date-fns/locale/en-US'
import { Link } from 'react-router-dom'
import Loader from 'react-loader-spinner'
import Select from '@material-ui/core/Select'
import { MenuItem, InputLabel, FormControl } from '@material-ui/core'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import CountrySelector from '../../../components/country-selector'

import {
	updateUser,
	loadUser
} from '../../../actions/auth-actions'

import {
	capitalize,
	uppercase,
	returnCurrencyCode
} from '../../../utils/various'
import {
	isValidEmailInput,
	checkDateValue
} from '../../../utils/validations'

import {
	updateMpLegalUser,
	createMpUserWallet
} from '../../../services/mangopay'

import * as frCommonTranslations from '../../../fixtures/fr'
import * as enCommonTranslations from '../../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const legalPersonTypeItems = Object.keys(translations.default.legalPersonTypesAvailable)

const locale = moment.locale() == 'fr' ? frLocale : enLocale

class LegalUserCreation extends React.Component {
	constructor(props) {
		super(props)
		const { user, mpLegalUserInfo } = this.props
		const { HeadquartersAddress } = mpLegalUserInfo
		this.state = {
			LegalPersonType: mpLegalUserInfo.LegalPersonType || '',
			Name: mpLegalUserInfo.Name || '',
			LegalRepresentativeFirstName: mpLegalUserInfo.LegalRepresentativeFirstName || '',
			LegalRepresentativeLastName: mpLegalUserInfo.LegalRepresentativeLastName || '',
			LegalRepresentativeBirthday: this.returnFormattedDate(mpLegalUserInfo.LegalRepresentativeBirthday) || '',
			LegalRepresentativeNationality: mpLegalUserInfo.LegalRepresentativeNationality || '',
			LegalRepresentativeCountryOfResidence: mpLegalUserInfo.LegalRepresentativeCountryOfResidence || '',
			LegalRepresentativeEmail: mpLegalUserInfo.LegalRepresentativeEmail || '',
			AddressLine1: (HeadquartersAddress || {}).AddressLine1 || '',
			City: (HeadquartersAddress || {}).City || '',
			Region: (HeadquartersAddress || {}).Region || '',
			PostalCode: (HeadquartersAddress || {}).PostalCode || '',
			Country: (HeadquartersAddress || {}).Country|| '',
			CompanyNumber: mpLegalUserInfo.CompanyNumber || '',
			isLoading: false,
			isFailure: false,
			warningMessage: ''
		}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateInputChange = this.handleDateInputChange.bind(this)
		this.returnFormattedDate = this.returnFormattedDate.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
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

	returnFormattedDate(input) {
		if(!input) return ''
		const birthday = moment(new Date(input * 1000)).format('MM/DD/YYYY')
		return birthday
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}


	handleMissingParam() {
		const {
			LegalPersonType,
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeBirthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			LegalRepresentativeEmail,
			AddressLine1,
			City,
			PostalCode,
			Country,
			CompanyNumber
		} = this.state
		const { t } = this.props

		if (CompanyNumber.length !== 9 && CompanyNumber.length !== 14) {
			this.setState({
				warningMessage: capitalize(t('wrongCompanyNumberFormat')),
				isLoading: false
			})
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
			return true
		}
		if (
			!LegalPersonType ||
			!Name ||
			!LegalRepresentativeFirstName ||
			!LegalRepresentativeLastName ||
			!LegalRepresentativeBirthday ||
			!LegalRepresentativeNationality ||
			!LegalRepresentativeCountryOfResidence ||
			!LegalRepresentativeEmail ||
			!AddressLine1 ||
			!City ||
			!PostalCode ||
			!Country ||
			!CompanyNumber
		) {
			this.setState({
				warningMessage: capitalize(t('pleaseEnterAllFields')),
				isLoading: false
			})
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
			return true
		}
	}

	async handleSubmit(e) {
		const {
			user,
			updateUser,
			loadUser,
			t,
			onUserCreated
		} = this.props
		const {
			LegalPersonType,
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeBirthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			LegalRepresentativeEmail,
			AddressLine1,
			City,
			PostalCode,
			Country,
			CompanyNumber,
			Region
		} = this.state
		e.preventDefault()
		this.setState({ isLoading: true })

		if (this.handleMissingParam()) {
			return
		}

		const formattedDate = moment(LegalRepresentativeBirthday).format('L')
		const splitDate = formattedDate.split('/')
		const updatedDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0])
		const birthday = updatedDate.setTime(updatedDate.getTime() + (2 * 60 * 60 * 1000)) / 1000
		console.log(birthday)

		const mpLegalUser = await updateMpLegalUser(
			user.MPLegalUserId,
			LegalPersonType,
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			birthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			LegalRepresentativeEmail,
			user.email,
			{
				AddressLine1: AddressLine1,
				City: City,
				Region: Region,
				PostalCode: PostalCode,
				Country: Country
			},
			CompanyNumber
		)

		if (mpLegalUser && mpLegalUser.PersonType === 'LEGAL') {
			updateUser({
				id: user._id,
				firstName: user.firstName || LegalRepresentativeFirstName,
				lastName: user.lastName || LegalRepresentativeLastName,
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

	}

	render() {

		const {
			LegalPersonType,
			Name,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeBirthday,
			LegalRepresentativeNationality,
			LegalRepresentativeCountryOfResidence,
			LegalRepresentativeEmail,
			AddressLine1,
			City,
			Region,
			PostalCode,
			Country,
			CompanyNumber,
			isLoading,
			warningMessage,
			isFailure
		} = this.state

		const {
			t,
			user,
			onCancel
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
					<div className='filled-button' onClick={() => this.props.setState({ isFailure: false })}>
						<span className='small-title citrusWhite'>
							{capitalize(t('tryAgain'))}
						</span>
					</div>
				</div>
			)
		}

		return (
			<div className='flex-column flex-center legal-user-creation'>
				<div className='medium-separator'></div>
				<span
					style={{ maxWidth: '454px'}}
					className='small-text-bold citrusGrey'
				>
					{capitalize(t('legalUserCreationDisclaimerCashout'))}
				</span>
				<form
					id='legal-user-form'
					onSubmit={this.handleSubmit}
				>
					<div className='flex-column flex-center'>
						<div className='medium-separator'></div>
						<span className='small-text citrusGrey row'>
							{uppercase(t('generalInformation'))} :
						</span>
						<div className='row flex-row'>
							<FormControl variant='outlined' style={{ width: '100%' }}>
								<InputLabel id='select-outlined-label'>
									{capitalize(t('legalPersonType'))}
								</InputLabel>
								<Select
									label={capitalize(t('legalPersonType'))}
									labelId='select-outlined-label'
									value={LegalPersonType.toLowerCase()}
									onChange={e => this.handleInputChange(e, 'LegalPersonType')}
								>
									{
										legalPersonTypeItems.map((type, i) => (
											<MenuItem value={type} key={i}>
												{capitalize(t(type))}
											</MenuItem>
										))
									}
								</Select>
							</FormControl>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('companyName'))}
								onChange={e => this.handleInputChange(e, 'Name')}
								style={{ width: '100%' }}
								variant='outlined'
								value={Name}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('companyNumber'))}
								onChange={e => this.handleInputChange(e, 'CompanyNumber')}
								style={{ width: '100%' }}
								variant='outlined'
								value={CompanyNumber}
							/>
						</div>
						<div className='medium-separator'></div>
						<span className='small-text citrusGrey row'>
							{uppercase(t('companyAddress'))} :
						</span>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('addressLine'))}
								onChange={e => this.handleInputChange(e, 'AddressLine1')}
								style={{ width: '100%' }}
								variant='outlined'
								value={AddressLine1}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('zipCode'))}
								onChange={e => this.handleInputChange(e, 'PostalCode')}
								style={{ width: '47.5%', margin: '0 2.5% 0 0' }}
								variant='outlined'
							/>
							<TextField
								label={capitalize(t('city'))}
								onChange={e => this.handleInputChange(e, 'City')}
								style={{ width: '47.5%', margin: '0 0 0 2.5%' }}
								variant='outlined'
								value={City}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('region'))}
								onChange={e => this.handleInputChange(e, 'Region')}
								style={{ width: '47.5%', margin: '0 2.5% 0 0' }}
								variant='outlined'
								value={Region}
							/>
							<CountrySelector
								style={{ width: '47.5%', margin: '0 0 0 2.5%' }}
								name={capitalize(t('country'))}
								onSelect={Country => this.setState({ Country })}
								value={Country}
							/>
						</div>
						<div className='medium-separator'></div>
						<span className='small-text citrusGrey row'>
							{uppercase(t('legalRepresentative'))} :
						</span>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('legalRepresentativeFirstName'))}
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeFirstName')}
								style={{ width: '100%' }}
								variant='outlined'
								value={LegalRepresentativeFirstName}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('legalRepresentativeLastName'))}
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeLastName')}
								style={{ width: '100%' }}
								variant='outlined'
								value={LegalRepresentativeLastName}
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '100%' }}
								name={capitalize(t('legalRepresentativeNationality'))}
								onSelect={LegalRepresentativeNationality => this.setState({ LegalRepresentativeNationality })}
								value={LegalRepresentativeNationality}
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '100%' }}
								name={capitalize(t('legalRepresentativeCountryOfResidence'))}
								onSelect={LegalRepresentativeCountryOfResidence => this.setState({ LegalRepresentativeCountryOfResidence })}
								value={LegalRepresentativeCountryOfResidence}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('legalRepresentativeEmail'))}
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeEmail')}
								style={{ width: '100%' }}
								variant='outlined'
								error={LegalRepresentativeEmail.length>0 && !isValidEmailInput(LegalRepresentativeEmail)}
								helperText={
									LegalRepresentativeEmail.length && !isValidEmailInput(LegalRepresentativeEmail) ?
										'wrong format' : ''
								}
								value={LegalRepresentativeEmail}
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
						<div style={{ textAlign: 'center' }} className='small-text citrusRed' role='alert'>
							{warningMessage}
							<div className='small-separator'></div>
						</div>
					}
					<div className='button-container flex-center'>
						<button
							className='filled-button'
							type='submit'
							form='legal-user-form'
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
							margin-bottom: 10px;
							margin-top: 10px;
						}
						.title {
							margin-left: 2px;
							margin-bottom: 30px;
						}
						.legal-user-creation-form {
							background-color: #FFFFFF;
							width: 690px;
							margin-bottom: 200px;
							overflow-y: auto;
						}
						.button-container {
							padding-top: 10px;
							padding-bottom: 20px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								margin-bottom: 10px;
							}
							.legal-user-creation-form,
							.row {
								width: 100%;
							}
							.legal-user-creation {
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
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LegalUserCreation))
