import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField } from '@material-ui/core'
import moment from 'moment'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { capitalize } from '../../utils/various'
import { checkDateValue } from '../../utils/validations'
import { createMpUser } from '../../services/mangopay'
import CountrySelector from '../../components/country-selector'

class CreateMangopayUser extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			FirstName: '',
			LastName: '',
			Birthday: '',
			Nationality: '',
			CountryOfResidence: '',
			isLoading: false,
			warningMessage: '',
			success: false
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleDateInputChange = this.handleDateInputChange.bind(this)
	}
	handleMissingParam() {
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

		this.setState({ isLoading: true })

		const {
			FirstName,
			LastName,
			Birthday,
			Nationality,
			CountryOfResidence
		} = this.state
		const {
			t,
			user,
			isPrepaying
		} = this.props

		e.preventDefault()
		if (this.handleMissingParam()) {
			this.setState({
				isLoading: false,
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		const birthday = parseInt(moment(Birthday).utc().format("X"))

		const mpUser = await createMpUser(
			FirstName,
			LastName,
			birthday,
			Nationality,
			CountryOfResidence,
			user.email
		)

		if(mpUser) {
			this.setState({
				isLoading: false,
				success: true
			})
		} else {
			this.setState({
				isLoading: false,
				warningMessage: capitalize(this.props.t('somethingWentWrongUploadingYourInfo'))
			})
		}
	}

	render() {

		const {
			isLoading,
			warningMessage,
			success,
			Birthday
		} = this.state
		const { t } = this.props

		if (success) {
			return (
				<div className='flex-column card success'>
					<div className='top-container'>
					</div>
					<div className='small-title success-feedback'>
						{capitalize(t('InformationSubmitedSuccessfully'))}
					</div>
					<span className='simple-link'>
						<Link to="/dashboard">{capitalize(t('goToDashboard'))}</Link>
					</span>
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
			<div className='full-container flex-column flex-center'>
				<div className='card billing-card flex-column padded'>
					<div className='medium-title'>Payment Information</div>
					<span className='small-text'>In order to withdraw your earnings, we need a little more info from you.</span>
					<div className='small-separator'></div>
					<span className='small-text'>Please enter the following :</span>
					<div className='small-separator'></div>
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
								placeholder={t('datePlaceHolder')}
								onChange={e => this.handleDateInputChange(e)}
								style={{ width: '45%', margin: '2% 2.5%' }}
								variant='standard'
								helperText={Birthday.length > 0 && capitalize(t('dateFormatMustBe'))}
								value={Birthday}
							/>
						</div>
					</div>
					<div className='medium-separator'></div>
					<div className='flex-center'>
						<button
							className='small-action-button'
							onClick={this.handleSubmit}
						>
							{capitalize(t('submit'))}
						</button>
					</div>
					<div className='small-separator'></div>
					<span className='small-text red flex-center'>{warningMessage}</span>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
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

const mapDispatchToProps = dispatch => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CreateMangopayUser))