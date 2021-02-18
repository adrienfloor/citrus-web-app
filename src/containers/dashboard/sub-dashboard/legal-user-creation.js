import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import moment from 'moment'
import { TextField } from '@material-ui/core'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import GenericSelector from '../../../components/generic-selector'
import CountrySelector from '../../../components/country-selector'

import {
	updateUser,
	loadUser
} from '../../../actions/auth-actions'

import {
	capitalize,
	uppercase
} from '../../../utils/various'
import { isValidEmailInput } from '../../../utils/validations'

import {
	createMpLegalUser
} from '../../../services/mangopay'

class LegalUserCreation extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			LegalPersonType: '',
			Name: '',
			LegalRepresentativeFirstName: '',
			LegalRepresentativeLastName: '',
			LegalRepresentativeBirthday: '2000-05-24',
			LegalRepresentativeNationality: '',
			LegalRepresentativeCountryOfResidence: '',
			LegalRepresentativeEmail: '',
			AddressLine1: '',
			City: '',
			Region: '',
			PostalCode: '',
			Country: '',
			CompanyNumber: '',
			isLoading: false,
			warningMessage: ''
		}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateChange = this.handleDateChange.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleDateChange(e) {
		this.setState({ LegalRepresentativeBirthday: e.target.value })
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}


	handleMissingParam() {
		if(this.state.CompanyNumber.length !== 9 && this.state.CompanyNumber.length !== 14) {
			this.setState({
				warningMessage: 'Wrong company number format'
			})
			return true
		}
		if (
			!this.state.LegalPersonType ||
			!this.state.Name ||
			!this.state.LegalRepresentativeFirstName ||
			!this.state.LegalRepresentativeLastName ||
			!this.state.LegalRepresentativeBirthday ||
			!this.state.LegalRepresentativeNationality ||
			!this.state.LegalRepresentativeCountryOfResidence ||
			!this.state.LegalRepresentativeEmail ||
			!this.state.AddressLine1 ||
			!this.state.City ||
			!this.state.PostalCode ||
			!this.state.Country ||
			!this.state.CompanyNumber
		) {
			this.setState({
				warningMessage: 'Please enter all fields'
			})
			return true
		}
	}

	async handleSubmit(e) {

		e.preventDefault()
		const {
			user,
			updateUser,
			loadUser
		} = this.props

		if(this.handleMissingParam()) {
			return
		}

		const birthday = parseInt(
			moment(this.state.LegalRepresentativeBirthday).utc().format("X")
		)

		const mpLegalUser = await createMpLegalUser(
			this.state.LegalPersonType,
			this.state.Name,
			this.state.LegalRepresentativeFirstName,
			this.state.LegalRepresentativeLastName,
			birthday,
			this.state.LegalRepresentativeNationality,
			this.state.LegalRepresentativeCountryOfResidence,
			this.state.LegalRepresentativeEmail,
			user.email,
			{
				AddressLine1: this.state.AddressLine1,
				City: this.state.City,
				Region: this.state.Region,
				PostalCode: this.state.PostalCode,
				Country: this.state.Country
			},
			this.state.CompanyNumber
		)
		if (mpLegalUser) {
			updateUser({
				id: user._id,
				mangoPayLegalUserId: mpLegalUser.Id,
				firstName: user.firstName || this.state.LegalRepresentativeFirstName,
				lastName: user.lastName || this.state.LegalRepresentativeLastName,
			})
			.then(() => loadUser())
		}
	}

	render() {

		const {
			LegalRepresentativeBirthday,
			LegalRepresentativeEmail,
			isLoading,
			warningMessage
		} = this.state

		const {
			t,
			user,
		} = this.props

		return (
			<div className='full-container flex-column flex-start legal-user-creation'>
				<span
					className='medium-text'
					style={{ padding: '2.5%' }}
				>
					{capitalize(t('toCashOutYouFirstNeed'))}
				</span>
				<form
					onSubmit={this.handleSubmit}
				>
					<div>
						<span
							className='small-text grey'
							style={{ padding: '2.5%' }}
						>
							{uppercase(t('generalInformation'))} :
						</span>
						<div className='row flex-row'>
							<GenericSelector
								items={[
									'soletrader',
									'business',
									'organization'
								]}
								style={{ width: '95%', margin: '2% 2.5%' }}
								name="Legal Person Type"
								onSelect={LegalPersonType => this.setState({ LegalPersonType })}
								t={t}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Company Name"
								onChange={e => this.handleInputChange(e, 'Name')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Company Number"
								onChange={e => this.handleInputChange(e, 'CompanyNumber')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='medium-separator'></div>
						<span
							className='small-text grey'
							style={{ padding: '2.5%' }}
						>
							{uppercase(t('companyAddress'))} :
						</span>
						<div className='row flex-row'>
							<TextField
								label="Company Adress Line"
								onChange={e => this.handleInputChange(e, 'AddressLine1')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Postal Code"
								onChange={e => this.handleInputChange(e, 'PostalCode')}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
							<TextField
								label="City"
								onChange={e => this.handleInputChange(e, 'City')}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Region"
								onChange={e => this.handleInputChange(e, 'Region')}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
							<CountrySelector
								style={{ width: '45%', margin: '2% 2.5%' }}
								name="Country"
								onSelect={Country => this.setState({ Country })}
							/>
						</div>
						<div className='medium-separator'></div>
						<span
							className='small-text grey'
							style={{ padding: '2.5%' }}
						>
							{uppercase(t('legalRepresentative'))} :
						</span>
						<div className='row flex-row'>
							<TextField
								label="Legal Representative Firstname"
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeFirstName')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Legal Representative Lastname"
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeLastName')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '95%', margin: '2% 2.5%' }}
								name="Legal Representative Nationality"
								onSelect={LegalRepresentativeNationality => this.setState({ LegalRepresentativeNationality })}
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '95%', margin: '2% 2.5%' }}
								name="Legal Representative Residence"
								onSelect={LegalRepresentativeCountryOfResidence => this.setState({ LegalRepresentativeCountryOfResidence })}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Legal Representative Email"
								onChange={e => this.handleInputChange(e, 'LegalRepresentativeEmail')}
								style={{ width: '95%', margin: '2% 2.5%' }}
								variant='outlined'
								error={LegalRepresentativeEmail.length && !isValidEmailInput(LegalRepresentativeEmail)}
								helperText={
									LegalRepresentativeEmail.length && !isValidEmailInput(LegalRepresentativeEmail) ?
									'wrong format' : ''
								}
							/>
						</div>
						<div
							className='row flex-row medium-text flex-center'
							style={{
								marginTop: '15px',
								padding: '0 2.5%',
								width: '95%'
							}}
						>
							<span style={{ marginRight: '5px' }}>Legal Representative Birthday : </span>
							<TextField
								onChange={this.handleDateChange}
								type="date"
								defaultValue={LegalRepresentativeBirthday}
								InputLabelProps={{
									shrink: true
								}}
							/>
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
					<button
						className='full-width-action-button'
						id='submit'
						style={{ marginBottom: '20px' }}
					>
						<span id='button-text' className='big-text'>
							{capitalize(t('submit'))}
						</span>
					</button>
				</form>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
						}
						.legal-user-creation {
							align-items: center;
							overflow-y: auto;
							margin-bottom: 20px;
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LegalUserCreation))
