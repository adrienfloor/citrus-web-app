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

import CountrySelector from '../../components/country-selector'

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
			warningMessage: '',
			success: false
		}
		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleMissingParam = this.handleMissingParam.bind(this)
	}

	handleMissingParam() {
		if(!iban.isValid(this.state.Iban)) {
			this.setState({ warningMessage: capitalize(this.props.t('invalidIban')) })
			return true
		}
		if (
			!this.state.OwnerName ||
			!this.state.AddressLine1 ||
			!this.state.City ||
			!this.state.PostalCode ||
			!this.state.Country ||
			!this.state.Iban
		) {
			return true
		}
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	async handleSubmit(e) {
		const { user, t } = this.props
		const { MPUserId } = user
		const {
			OwnerName,
			AddressLine1,
			City,
			PostalCode,
			Country,
			Iban
		} = this.state

		e.preventDefault()
		this.setState({ isLoading: true })
		if (this.handleMissingParam()) {
			this.setState({
				warningMessage: capitalize(this.props.t('pleaseEnterAllFields'))
			})
			return
		}

		const bankAccount = await createMpBankAccount(
			MPUserId,
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
			Iban
		} = this.state
		const { t, onClose } = this.props


		if (success) {
			return (
				<div className='flex-column card success'>
					<div
						className='top-container hover'
						onClick={onClose}
					>
						<Close
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div className='small-title success-feedback'>
						{capitalize(t('InformationSubmitedSuccessfully'))}
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
				<span className='maxi-title title mobile-margin'>
					{capitalize(t('bankAccountRegistration'))}
				</span>
				<span className='small-text-high mobile-margin'>
					{capitalize(t('weNeedYourBankingInfo'))}.
				</span>
				<div className='small-separator'></div>
				<div className='flex-column bank-account-form'>
					<div className='form flex-column flex-center'>
						<div className='medium-separator'></div>
						<div className='small-separator'></div>
						<div className='row flex-row'>
							<TextField
								label="Full Name"
								onChange={e => this.handleInputChange(e, 'OwnerName')}
								style={{ width: '100%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Address"
								onChange={e => this.handleInputChange(e, 'AddressLine1')}
								style={{ width: '100%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Postal Code"
								onChange={e => this.handleInputChange(e, 'PostalCode')}
								style={{ width: '47.5%', margin: '0 2.5% 0 0' }}
								variant='outlined'
							/>
							<TextField
								label="City"
								onChange={e => this.handleInputChange(e, 'City')}
								style={{ width: '47.5%', margin: '0 0 0 2.5%' }}
								variant='outlined'
							/>
						</div>
						<div className='row flex-row'>
							<CountrySelector
								style={{ width: '100%' }}
								name="Country"
								onSelect={Country => this.setState({ Country })}
							/>
						</div>
						<div className='row flex-row'>
							<TextField
								label="Iban"
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
						<span className='small-text citrusRed'>{warningMessage}</span>
					</div>
				</div>
				<style jsx='true'>
					{`
					.title {
						margin-bottom: 30px;
					}
					.form {
						width: 690px;
						background-color: #FFFFFF;
						height: 400px;
						overflow-y: auto;
						margin-bottom: 20px;
						padding-top: 30px;
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
						.title {
							margin-bottom: 10px;
							font-size: 36px !important;
							line-height: 40px !important;
						}
						.row {
							width: 100%;
						}
						.form {
							width: 100%;
							height: 300px;
							overflow-y: auto;
							margin-bottom: 20px;
							padding-top: 80px;
						}
						.bank-account-form {
							width: 98%;
							margin: 0 1%;
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
	// updateUser: userInfo => dispatch(updateUser(userInfo)),
	// loadUser: () => dispatch(loadUser())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(BankAccount))