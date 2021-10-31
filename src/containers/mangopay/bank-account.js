import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { Link } from 'react-router-dom'
import { TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import iban from 'iban'

import CountrySelector from '../../components/country-selector'

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
	createMpBankAccount
} from '../../services/mangopay'
import { setNotification } from '../../actions/notifications-actions'

class BankAccount extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			OwnerName: '',
			AddressLine1: '',
			City: '',
			PostalCode: '',
			Country: '',
			Iban: '',
			isLoading: false,
			warningMessage: ''
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
	}

	handleMissingParam() {
		if (
			!this.state.OwnerName ||
			!this.state.AddressLine1 ||
			!this.state.City ||
			!this.state.PostalCode ||
			!this.state.Country ||
			!this.state.Iban
		) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
			return true
		}
		if (!iban.isValid(this.state.Iban)) {
			this.setState({ warningMessage: capitalize(this.props.t('invalidIban')) })
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
			return true
		}
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	async handleSubmit(e) {
		const {
			user,
			t,
			onSuccess,
			setNotification
		} = this.props
		const { MPLegalUserId } = user
		const {
			OwnerName,
			AddressLine1,
			City,
			PostalCode,
			Country,
			Iban
		} = this.state

		e.preventDefault()
		if (this.handleMissingParam()) {
			return
		}

		this.setState({ isLoading: true })

		const bankAccount = await createMpBankAccount(
			MPLegalUserId,
			OwnerName,
			{
				AddressLine1,
				City,
				PostalCode,
				Country
			},
			Iban
		)

		if(bankAccount.Active) {
			this.setState({ isLoading: false })
			setNotification({ message: capitalize(t('updatedSuccessfully')) })
			onSuccess()
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
			Iban
		} = this.state
		const {
			t,
			onClose,
			onSuccess
		} = this.props

		if (isLoading) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '70vh' }}
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

		return (
			<div className='full-container flex-column bank-account-registration'>
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
						{capitalize(t('cashout'))}
					</span>
				</div>
				<span className='small-title'>
					{capitalize(t('bankAccountRegistration'))}
				</span>
				<div className='flex-column bank-account-form'>
					<div className='flex-column flex-center'>
						<div className='medium-separator'></div>
						<div className='small-separator'></div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('fullName'))}
								onChange={e => this.handleInputChange(e, 'OwnerName')}
								style={{ width: '100%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('addressLine'))}
								onChange={e => this.handleInputChange(e, 'AddressLine1')}
								style={{ width: '100%' }}
								variant='outlined'
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
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '100%' }}
								name={capitalize(t('country'))}
								onSelect={Country => this.setState({ Country })}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label={capitalize(t('iban'))}
								placeholder='FR** **** **** **** **** **** ***'
								onChange={e => this.handleInputChange(e, 'Iban')}
								style={{ width: '100%' }}
								variant='outlined'
								error={Iban.length > 0 && !iban.isValid(Iban)}
							/>
						</div>
						<div className='small-separator'></div>
						<div className='button-container flex-center'>
							<button
								className='filled-button'
								onClick={this.handleSubmit}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('submit'))}
								</span>
							</button>
						</div>
						<div className='small-separator'></div>
						<span className='smaller-text-bold citrusRed'>{warningMessage}</span>
					</div>
				</div>
				<style jsx='true'>
					{`
					.bank-account-registration {
						width: 454px;
						padding: 10px;
						margin-top: 10px;
					}
					.bank-account-form {
						width: 454px;
					}
					.row {
						width: 454px;
						margin-bottom: 10px;
						margin-top: 10px;
					}
					.button-container {
						padding-top: 10px;
						padding-bottom: 20px;
						width: 100%;
					}
					@media only screen and (max-width: 640px) {
						.bank-account-registration {
							width: 100%;
							padding: 10px;
							margin-top: 0;
						}
						.bank-account-form {
							width: 100%;
						}
						.row {
							width: 98%;
							margin: 0 1%;
							margin-bottom: 10px;
							margin-top: 10px;
						}
						.button-container {
							width: 98%;
							margin: 0 1%;
							padding-bottom: 50px;
						}
						.mobile-margin {
							width: 98%;
							margin-left: 2%;
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
	setNotification: notif => dispatch(setNotification(notif))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BankAccount))