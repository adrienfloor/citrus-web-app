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
		const { mangoPayUserId } = user
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
			mangoPayUserId,
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
				<div className='full-container flex-column flex-center'>
					<div
						style={{
							width: '100%',
							height: '10%',
							display: 'flex',
							justifyContent: 'flex-end',
							padding: '10px'
						}}
					>
						<CloseIcon
							className='action-icon'
							fontSize='large'
							onClick={onClose}
						/>
					</div>
					<div
						className='big-text'
						style={{
							width: '60%',
							height: '90%',
							marginTop: '100px'
						}}
					>
						{capitalize(t('InformationSubmitedSuccessfully'))}...
					</div>
				</div>
			)
		}

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center'>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
					<div className='big-separator'></div>
				</div>
			)
		}

		return (
			<div
				className='full-container flex-column bank-account-registration'
				style={{ alignItems: 'center'}}
			>
				<div
					style={{
						width: '100%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
				>
					<KeyboardBackspaceIcon
						className='action-icon'
						fontSize='large'
						onClick={onClose}
					/>
				</div>
				<div className='billing-card flex-column padded'>
					<div className='medium-title'>Bank account registration</div>
					<span className='small-text'>In order to withdraw your earnings, we need to get your banking information.</span>
					<div className='small-separator'></div>
					<span className='small-text'>Please enter the following :</span>
					<div className='small-separator'></div>
					<TextField
						label="Full Name"
						onChange={e => this.handleInputChange(e, 'OwnerName')}
						style={{ margin: '1% 0' }}
						variant='outlined'
					/>
					<TextField
						label="Address"
						onChange={e => this.handleInputChange(e, 'AddressLine1')}
						style={{ margin: '1% 0' }}
						variant='outlined'
					/>
					<div className='row flex-row'>
						<TextField
							label="Postal Code"
							onChange={e => this.handleInputChange(e, 'PostalCode')}
							style={{ width: '48%', margin: '1% 2% 1% 0' }}
							variant='outlined'
						/>
						<TextField
							label="City"
							onChange={e => this.handleInputChange(e, 'City')}
							style={{ width: '48%', margin: '1% 0 1% 2%' }}
							variant='outlined'
						/>
					</div>
					<CountrySelector
						style={{ margin: '1% 0' }}
						name="Country"
						onSelect={Country => this.setState({ Country })}
					/>
					<TextField
						label="Iban"
						placeholder='FR** **** **** **** **** **** ***'
						onChange={e => this.handleInputChange(e, 'Iban')}
						style={{ margin: '1% 0' }}
						variant='outlined'
						error={Iban.length>0 && !iban.isValid(Iban)}
					/>
					<div className='small-separator'></div>
					<button
						className='small-action-button'
						onClick={this.handleSubmit}
					>
						{capitalize(t('submit'))}
					</button>
					<div className='small-separator'></div>
					<span className='small-text red'>{warningMessage}</span>
				</div>
				<style jsx='true'>
					{`
					.padded {
						padding: 0 10px;
					}
					@media only screen and (max-width: 640px) {
						.bank-account-registration {
							height: 100%;
							overflow: auto;
							width: 96%;
							margin: 0 2%;
    					padding-bottom: 60px;
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