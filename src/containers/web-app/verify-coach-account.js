import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { TextField } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import { MenuItem, InputLabel, FormControl } from '@material-ui/core'
import { ReactComponent as Check } from '../../assets/svg/check.svg'

import {
	capitalize,
	returnCurrencyCode,
    titleCase
} from '../../utils/various'

import '../../styling/spacings.css'
import '../../styling/buttons.css'
import '../../styling/colors.css'
import '../../styling/App.css'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import { updateUser } from '../../actions/auth-actions'

class VerifyCoachAccount extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			warningMessage: ''
		}

		this.handleInputChange = this.handleInputChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleInputChange(e, name) {
		const { value } = e.target
		this.setState({ [name]: value })
	}

	handleSubmit(e) {


		e.preventDefault()
		this.setState({ isLoading: true })

		if (this.handleMissingParam()) {
		}
	}

	render() {

		const {
			isLoading,
			warningMessage
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
						{capitalize(t('verifiedAccount'))}
					</span>
					<div className='small-separator'></div>
					<span className='smaller-text-bold citrusGrey'>
						{capitalize(t('verifiedCoachAccountDisclaimer'))}
					</span>
					<div className='medium-separator'></div>
						<div
							className='flex-column'
							style={{ width: '100%' }}
						>
							<div className='desktop-only-small-separator'></div>
                            <span className='small-text-bold citrusGrey titles-form-input'>
                                {capitalize(t('facebook'))}
                            </span>
							<TextField
								style={{ margin: '2% 0 2% 0' }}
								variant='outlined'
								label={capitalize(t('facebookUrl'))}
								value=''
								onChange={e => this.handleInputChange(e, 'Name')}
							/>
                            <div className='small-separator'></div>
                            <span className='small-text-bold citrusGrey titles-form-input'>
                                {capitalize(t('instagram'))}
                            </span>
							<TextField
								style={{ margin: '2% 0 2% 0' }}
								variant='outlined'
								label={capitalize(t('instagramUrl'))}
								value=''
								onChange={e => this.handleInputChange(e, 'Name')}
							/>
                            <div className='small-separator'></div>                        
                            <span className='small-text-bold citrusGrey titles-form-input'>
                                {titleCase(t('tiktok'))}
                            </span>
							<TextField
								style={{ margin: '2% 0 2% 0' }}
								variant='outlined'
								label={capitalize(t('tiktokUrl'))}
								value=''
								onChange={e => this.handleInputChange(e, 'Name')}
							/>
                            <div className='small-separator'></div>                            
                            <span className='small-text-bold citrusGrey titles-form-input'>
                                {capitalize(t('website'))}
                            </span>
							<TextField
								style={{ margin: '2% 0 2% 0' }}
								variant='outlined'
								label={capitalize(t('yourWebsiteUrl'))}
								value=''
								onChange={e => this.handleInputChange(e, 'Name')}
							/>
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
								{capitalize(t('send'))}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(VerifyCoachAccount))