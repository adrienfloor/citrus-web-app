import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import queryString from 'query-string'
import Loader from 'react-loader-spinner'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'

import { ReactComponent as EyeClosed } from '../../assets/svg/eye-closed.svg'
import { ReactComponent as EyeOpen } from '../../assets/svg/eye-open.svg'

import {
	isValidPassword,
	isValidEmailInput
} from '../../utils/validations'

import {
	capitalize,
	uppercase,
	titleCase
} from '../../utils/various'

import { sendResetPasswordLink } from '../../actions/auth-actions'
import { setNotification } from '../../actions/notifications-actions'

class ForgetPassword extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			email: '',
			errorMessage: '',
			isLoading: false,
			isButtonDisabled: false
		}
		this.onTextInputChange = this.onTextInputChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.checkErrors = this.checkErrors.bind(this)
	}

	checkErrors() {
		const { email, password } = this.state
		const { t } = this.props


		if (!email.length > 0) {
			this.setState({
				errorMessage: capitalize(t('pleaseEnterAllFields'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		if (!isValidEmailInput(email)) {
			this.setState({
				errorMessage: capitalize(t('wrongEmailFormat'))
			})
			setTimeout(function () {
				this.setState({
					errorMessage: ''
				})
			}.bind(this), 3000)
			return true
		}

		return false
	}

	onTextInputChange(e, name) {
		this.setState({ [name]: e.target.value })
	}

	onSubmit(e) {
		e.preventDefault()
		const { email } = this.state
		const {
			t,
			sendResetPasswordLink,
			onDone,
			setNotification
		} = this.props

		this.setState({
			isbuttonDisabled: true,
			isLoading: true
		})

		if (this.checkErrors()) {
			this.setState({
				isButtonDisabled: false,
				isLoading: false
			})
			return
		}

		sendResetPasswordLink(email.toLowerCase())
			.then(res => {
				if (res && res.type === 'RESET_PASSWORD') {
					this.setState({
						isLoading: false
					})
					setNotification({ message: capitalize(t('successFullySentResetLink')) })
					return onDone()
				}
				if (res && res.type == 'RESET_PASSWORD_FAIL') {
					this.setState({
						errorMessage: capitalize(t('unknownEmail')),
						isLoading: false
					})
					setTimeout(function () {
						this.setState({
							errorMessage: ''
						})
					}.bind(this), 3000)
					return
				} else {
					this.setState({
						errorMessage: capitalize(t('somethingWentWrong')),
						isLoading: false
					})
					setTimeout(function () {
						this.setState({
							errorMessage: ''
						})
					}.bind(this), 3000)
				}
			})
	}

	render() {

		const {
			email,
			errorMessage,
			isLoading,
			isButtonDisabled
		} = this.state
		const {
			t,
			onDone
		} = this.props

		if (isLoading) {
			return (
				<div className='full-container flex-column flex-center main'>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={150}
						width={150}
					/>
				</div>
			)
		}

		return (
			<div className='full-container flex-column flex-center main'>
				<form
					style={{
						justifyContent: 'flex-start',
						paddingTop: '30px'
					}}
					id='forget-password-form'
					onSubmit={this.onSubmit}
					className='flex-column flex-start card auth-card form'
				>
					<div
						style={{
							maxWidth: '453px'
						}}
					>
						<span className='small-title citrusGrey'>
							{capitalize(t('youWillReceiveAResetLink'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<input
						className='text-input small-text citrusGrey input'
						placeholder={capitalize(t('email'))}
						type='email'
						autoComplete='email'
						onChange={e => this.onTextInputChange(e, 'email')}
						name='email'
					/>
					<div className='medium-separator'></div>
					{
						errorMessage.length > 0 &&
						<span
							className='small-text citrusRed'
							style={{ marginTop: 2 }}
						>
							{errorMessage}
							<div className='medium-separator'></div>
						</span>
					}
					<div className='button-container flex-column flex-center'>
						<button
							className={!isButtonDisabled ? 'filled-button button' : 'filled-button disabled-button button'}
							type='submit'
							form='forget-password-form'
							disabled={isButtonDisabled}
						>
							<span className='small-title citrusWhite'>
								{capitalize(t('submit'))}
							</span>
						</button>
						<div className='small-separator'></div>
						<div
							className='hover'
							style={{
								borderBottom: '1px solid #C2C2C2',
								paddingBottom: 2
							}}
							onClick={onDone}
						>
							<span className='smaller-text-bold citrusGrey'>
								{capitalize(t('cancel'))}
							</span>
						</div>
					</div>
				</form>
				<style jsx='true'>
					{`
						.form {
							align-items: center;
							justify-content: center;
						}
						.input {
							margin-bottom: 20px;
						}
						.button-container {
							width: 100%;
						}
						.button {
							margin-bottom: 10px;
						}
						.password-container {
							height: 52px;
							width: 453px;
							display: flex;
							flex-direction: row !important;
							margin-bottom: 20px;
						}
						.password-input {
							width: 80%;
						}
						.password-eye {
							width: 20%;
							border-bottom: 1px solid #C2C2C2;
							height: 52px !important;
							display: flex;
							flex-direction: column;
							justify-content: center;
							align-items: center;
						}
						.title {
							width: 690px;
						}
						@media only screen and (max-width: 640px) {
							.title {
								max-width: 95% !important;
								margin: 0 0 10px 2.5% !important;
							}
							.main {
								justify-content: flex-start !important;
							}
							.password-container {
								width: 98%;
								margin: 0 1%;
								margin-bottom: 20px;
							}
							.password-input {
								margin: 0;
							}
							.button-container {
								width: 98%;
								padding: 0 1%;
							}
							.button {
								width: 100%;
							}
						}
        `}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	isAuthenticated: state.auth.isAuthenticated,
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	sendResetPasswordLink: email => dispatch(sendResetPasswordLink(email)),
	setNotification: notification => dispatch(setNotification(notification))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ForgetPassword))
