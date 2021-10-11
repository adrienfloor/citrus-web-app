import React from 'react'
import { connect } from 'react-redux'
import {
	SafeAreaView,
	StyleSheet,
	ScrollView,
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	Linking,
	Image,
	TextInput,
	StatusBar
} from 'react-native'
import PropTypes from 'prop-types'
import {
	Item,
	Form,
	Input,
	Label,
	CheckBox,
	ListItem,
	Icon,
	Spinner
} from 'native-base'
import i18n from 'i18n-js'

import { sendResetPasswordLink } from '../../actions/auth-actions'

import { isValidEmailInput } from '../../utils/validations'
import { colorStyles } from '../../../assets/styles/colors'
import { headingStyles } from '../../../assets/styles/headings'
import { buttonStyles } from '../../../assets/styles/buttons'

import Logo from '../../../assets/icons/svg/logo.svg'
import LoginLogo from '../../../assets/icons/svg/login-logo.svg'

import { capitalize } from '../../utils/various'

const deviceWidth = Dimensions.get("window").width
const deviceHeight = Dimensions.get("window").height

class ForgotPassword extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			email: '',
			onFocus: false,
			errorMessage: '',
			isLoading: false,
			isSuccess: false
		}
		this.onChange = this.onChange.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
		this.checkErrors = this.checkErrors.bind(this)
	}

	checkErrors() {
		const { email, password } = this.state

		if (!email.length > 0) {
			this.setState({
				errorMessage: capitalize(i18n.t('auth.pleaseEnterAllFields'))
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
				errorMessage: capitalize(i18n.t('auth.wrongEmailFormat'))
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

	onChange(name) {
		return (text) => {
			this.setState({ [name]: text })
		}
	}

	onSubmit(e) {
		e.preventDefault()
		this.setState({
			isLoading: true,
			onFocus: false
		})
		if (this.checkErrors()) {
			this.setState({ isLoading: false })
			return
		}
		const { email } = this.state

		const { sendResetPasswordLink } = this.props

		sendResetPasswordLink(email.toLowerCase())
			.then(res => {
				if (res && res.type === 'RESET_PASSWORD') {
					this.setState({
						isLoading: false,
						onFocus: false,
						isSuccess: true
					})
					return
				}
				if (res && res.type == 'RESET_PASSWORD_FAIL') {
					this.setState({
						errorMessage: capitalize(i18n.t('auth.unknownEmail')),
						isLoading: false,
						onFocus: false
					})
					setTimeout(function () {
						this.setState({
							errorMessage: ''
						})
					}.bind(this), 3000)
					return
				} else {
					this.setState({
						errorMessage: capitalize(i18n.t('auth.somethingWentWrong')),
						isLoading: false,
						onFocus: false
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
			onFocus,
			signinDisabled,
			isLoading,
			isSuccess
		} = this.state
		const { onDone } = this.props

		return (
			<View style={{ height: deviceHeight, width: deviceWidth }}>
				<StatusBar hidden={true} />
				<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
					<SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
						<View
							style={
								onFocus ?
									[
										styles.logoContainer,
										styles.logoContainerOnFocus
									] :
									styles.logoContainer
							}
						>
							{
								!onFocus &&
								<View style={styles.logo}>
									<LoginLogo />
								</View>
							}
						</View>
						{
							!isLoading ?
								<View
									style={
										onFocus ?
											[
												styles.form,
												styles.formOnFocus
											] :
											styles.form
									}
								>
									<Text
										style={{
											...headingStyles.bigHeader,
											width: '100%',
											marginBottom: 5
										}}
									>
										{capitalize(i18n.t('auth.resetPassword'))}
									</Text>
									{
										isSuccess ?
											<View style={styles.inputsContainer}>
												<Text
													style={[
														headingStyles.bigText,
														colorStyles.citrusBlack
													]}
												>
													{capitalize(i18n.t('auth.resetPasswordEmailSent'))}
												</Text>
											</View> :
											<View style={styles.inputsContainer}>
												<TextInput
													placeholder={capitalize(i18n.t('auth.email'))}
													style={[
														headingStyles.bbigText,
														colorStyles.black,
														styles.textInput
													]}
													onChangeText={this.onChange('email')}
													onFocus={() => this.setState({ onFocus: true })}
													onBlur={() => this.setState({ onFocus: false })}
													returnKeyType="done"
												/>
											</View>
									}
									{
										errorMessage.length > 0 &&
										<Text
											style={{
												...headingStyles.mmediumText,
												...colorStyles.citrusRed,
												marginTop: 10
											}}
										>
											{errorMessage}
										</Text>
									}
									<View style={styles.buttonsContainer}>
										<TouchableOpacity
											disabled={signinDisabled}
											style={
												{
													...buttonStyles.filledButton,
													...styles.button,
													marginTop: 50
												}
											}
											onPress={
												isSuccess ?
													onDone :
													this.onSubmit
											}
										>
											<Text
												style={[
													headingStyles.smallHeader,
													colorStyles.white
												]}
											>
												{
													isSuccess ?
														capitalize(i18n.t('auth.returnToSignIn')) :
														capitalize(i18n.t('auth.getMyResetLink'))
												}
											</Text>
										</TouchableOpacity>
									</View>
									{
										!isSuccess &&
										<TouchableOpacity
											style={{
												borderBottomWidth: 1,
												borderBottomColor: '#C2C2C2',
												marginBottom: 20,
												marginTop: 10,
												paddingBottom: 1
											}}
											onPress={() => {
												this.setState({ email: '' })
												onDone()
											}}
										>
											<Text
												style={{
													...headingStyles.mmediumText,
													...colorStyles.citrusGrey
												}}
											>
												{capitalize(i18n.t('common.cancel'))}
											</Text>
										</TouchableOpacity>
									}
								</View> :
								<View style={styles.spinnerContainer}>
									<Spinner color="#0075FF" />
								</View>
						}
					</SafeAreaView>
				</TouchableWithoutFeedback>
			</View>
		)
	}
	static propTypes = {
		isAuthenticated: PropTypes.bool,
		error: PropTypes.object,
		signin: PropTypes.func
	}
}

const styles = StyleSheet.create({
	spinnerContainer: {
		flex: 1,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	logoContainer: {
		flex: 0,
		justifyContent: 'flex-end',
		alignItems: 'flex-end',
		height: deviceHeight - 341
	},
	logo: {
		position: 'absolute',
		bottom: 120,
		right: 60
	},
	logoContainerOnFocus: {
		backgroundColor: '#F8F8F8'
	},
	form: {
		position: 'absolute',
		bottom: 0,
		backgroundColor: '#F8F8F8',
		width: deviceWidth,
		flex: 0,
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 40
	},
	formOnFocus: {
		top: 0,
		height: 441,
		marginTop: 60,
		paddingHorizontal: 40
	},
	input: {
		borderBottomWidth: 1,
		borderColor: '#C2C2C2',
		borderStyle: 'solid',
		height: 40,
		width: '100%'
	},
	textInput: {
		borderBottomWidth: 1,
		borderColor: '#C2C2C2',
		borderStyle: 'solid',
		height: 55,
		marginTop: 10,
		width: '100%'
	},
	inputsContainer: {
		width: '100%'
	},
	item: {
		height: 40,
		borderBottomWidth: 0,
		marginBottom: 20,
		marginTop: 5,
		width: '100%'
	},
	label: {
		width: '100%'
	},
	button: {
		marginBottom: 10
	},
	buttonsContainer: {
		width: '100%'
	}
})

const mapStateToProps = state => ({
	user: state.auth.user,
	isAuthenticated: state.auth.isAuthenticated,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	sendResetPasswordLink: email => dispatch(sendResetPasswordLink(email))
})

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)
