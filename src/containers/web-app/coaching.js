import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import ReactPlayer from 'react-player'
import Dialog from '@material-ui/core/Dialog'

import CoachingCheckout from '../web-app/payments/coaching-checkout-flow'
import CoachingEdition from './coaching-edition'
import CoachProfile from './coach-profile'
import Tag from '../../components/web-app/tag'
import Card from '../../components/web-app/card'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import {
	uppercase,
	capitalize,
	titleCase,
	returnCurrency,
	returnCurrencyCode
} from '../../utils/various'

import {
	fetchUserInfo,
	updateUser,
	loadUser,
	fetchUserReplays
} from '../../actions/auth-actions'
import {
	updateCoaching,
	fetchTrainerCoachings
} from '../../actions/coachings-actions'
import { setNotification } from '../../actions/notifications-actions'
import {
	fetchMpUserCredits,
	createMpTransfer,
	createMpCardDirectPayin
} from '../../services/mangopay'

class Coaching extends React.Component {
	constructor(props) {
		super(props)
		const { coaching, isVideoPlaying } = this.props
		this.state = {
			isLoading: false,
			isPaymentConfirmationOpen: false,
			accessDenied: false,
			muxReplayPlaybackId: isVideoPlaying ? coaching.muxReplayPlaybackId : null,
			isEditingCoaching: false,
			coaching: this.props.coaching,
			credits: null,
			coachInfo: null,
			isChoosingPaymentMethod: false,
			isCoachingCheckoutOpen: null,
			errorMessage: null,
			selectedCoach: null
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handlePayCoaching = this.handlePayCoaching.bind(this)
		this.renderButtonText = this.renderButtonText.bind(this)
		this.handleTransfer = this.handleTransfer.bind(this)
	}

	componentDidMount() {
		const { fetchUserInfo, user } = this.props
		const { coaching, timeToStart } = this.state
		fetchUserInfo(coaching.coachId)
		.then(res => this.setState({ coachInfo: res.payload }))
		fetchMpUserCredits(user.MPUserId)
		.then(credits => this.setState({ credits }))
	}

	renderButtonText() {
		const { coaching, user, t } = this.props
		const { price, coachId } = coaching

		const hasBoughtCoaching = user.myReplays.find(training => training._id === coaching._id)

		if(user._id === coachId || hasBoughtCoaching) {
			return capitalize(t('playVideo'))
		}
		if(price === 0) {
			return capitalize(t('watchForFree'))
		}
		return `${capitalize(t('buyFor'))} ${price} ${price === 1 ? capitalize(t('credit')) : capitalize(t('credits'))}`
	}

	handleTransfer() {
		const {
			coaching,
			credits,
			coachInfo
		} = this.state
		const {
			loadUser,
			onCancel,
			user,
			updateUser,
			fetchUserReplays,
			updateCoaching,
			t
		} = this.props

		// Transfer amount from user wallet to coach wallet while handling Citrus fees
		createMpTransfer(
			coachInfo.MPLegalUserId,
			{
				"Amount": coaching.price,
				"Currency": returnCurrencyCode(moment.locale())
			},
			user.MPUserId
		)
			.then(res => {
				console.log('res from transfer : ', res)
				if(res && res.Status === 'SUCCEEDED') {
					// Update buyer profile
					updateUser({
						id: user._id,
						myReplays: [
							coaching,
							...user.myReplays
						]
					}, true)
					.then(res => {
						// Fetch updated replays of user
						fetchUserReplays(user._id)
						// Update coach profile
						updateUser({
							id: coaching.coachId,
							lifeTimeGains: user.lifeTimeGains + (coaching.price * 0.7)
						})
						// Update coaching
						updateCoaching({
							_id: coaching._id,
							numberOfViewers: coaching.numberOfViewers + 1
						})
						// Launch video
						this.setState({
							isLoading: false,
							isPaymentConfirmationOpen: false,
							isCoachingCheckoutOpen: false,
							muxReplayPlaybackId: coaching.muxReplayPlaybackId
						})
					})
				} else {
					this.setState({
						isLoading: false,
						isPaymentConfirmationOpen: false,
						isCoachingCheckoutOpen: false,
						errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
					})
				}
			})
	}

	handlePayCoaching() {
		const {
			coaching,
			credits,
			coachInfo
		} = this.state
		const {
			loadUser,
			onCancel,
			user,
			updateUser,
			fetchUserReplays,
			t
		} = this.props

		this.setState({
			isPaymentConfirmationOpen: false,
			isLoading: true
		})

		// THINGS TO HANDLE :
		// ADD TO MY VIDEO
		// ADD CREDITS TO COACH CURRENT GAINS AND LIFETIME GAINS
		//
		// IF NO SUBSCRIPTION LAUNCH PAYMENT OF NUMBER OF CREDITS + 1
		// ELSE
		// SUBSTRACT THE PRICE FROM USER CREDITS
		// INITIATE THE TRANSFER FROM MP USER WALLET TO MP COACH WALLET
		// OR JUST ADD CREDITS TO COACH CURRENT GAINS ?
		//
		// LOAD USER AND FETCH USER REPLAYS
		// LAUNCH THE VIDEO PLAYER WITH THIS VIDEO

		if (credits >= coaching.price) {
			this.handleTransfer()
		} else {
			// New user, no card registered, go to checkout
			if(!user.MPUserId) {
				this.setState({
					isLoading: false,
					isCoachingCheckoutOpen: 'aLaCarte'
				})
			} else {
				// user paying à la carte
				createMpCardDirectPayin(
					user.MPUserId,
					{
						"Amount": (coaching.price + 1) * 100,
						"Currency": returnCurrencyCode(moment.locale())
					},
					{
						"Amount": 100,
						"Currency": returnCurrencyCode(moment.locale())
					}
				).then(res => {
					console.log('res form direct pay in : ', res)
					if(res && res.Status === "SUCCEEDED") {
						return this.handleTransfer()
					}
					this.setState({
						isLoading: false,
						isPaymentConfirmationOpen: false,
						isCoachingCheckoutOpen: false,
						errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
					})
				})
			}
		}
	}

	handleSubmit() {
		const { coaching } = this.state
		const {
			loadUser,
			onCancel,
			user,
			updateUser,
			fetchUserReplays
		} = this.props

		this.setState({ isLoading: true })
		const hasBoughtCoaching = user.myReplays.find(training => training._id === coaching._id)

		// This is my coaching or my training
		if (user._id == coaching.coachId || hasBoughtCoaching) {
			return this.setState({
				isLoading: false,
				muxReplayPlaybackId: coaching.muxReplayPlaybackId,
			})
		}
		// This coaching is free
		if(coaching.price === 0) {
			updateUser({
				id: user._id,
				myReplays: [
					coaching,
					...user.myReplays
				]
			}, true).then(res => {
				if(res && res.payload && res.payload._id) {
					fetchUserReplays(user._id)
					return this.setState({
						isLoading: false,
						muxReplayPlaybackId: coaching.muxReplayPlaybackId
					})
				}
			})
		} else {
			// This coaching has to be payed for
			this.setState({
				isPaymentConfirmationOpen: true,
				isLoading: false
			})
		}
	}

	render() {
		const {
			isMyCoaching,
			user,
			onCancel,
			selectScreen,
			currentScreen,
			onCoachingDeleted,
			t,
			setNotification,
			fetchTrainerCoachings
		} = this.props
		const {
			isLoading,
			isPaymentConfirmationOpen,
			accessDenied,
			muxReplayPlaybackId,
			isEditingCoaching,
			coaching,
			credits,
			isCoachingCheckoutOpen,
			errorMessage,
			coachInfo,
			selectedCoach
		} = this.state
		const {
			coachUserName,
			title,
			sport,
			startingDate,
			duration,
			level,
			equipment,
			focus,
			repeat,
			coachingLanguage,
			freeAccess,
			pictureUri,
			ratio,
			price
		} = coaching

		if (isLoading) {
			return (
				<div className='flex-column flex-center coaching-loading white'>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={100}
						width={100}
					/>
				</div>
			)
		}

		if(errorMessage) {
			return (
				<div
					className='flex-column flex-center coaching-loading white'
					style={{ justifyContent: 'flex-start' }}
				>
					<div
						style={{
							width: '98.5%',
							height: '40px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-end'
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
					<div
						style={{
							padding: '0 12px',
							textAlign: 'center',
							justifyContent: 'center',
							display: 'flex',
							height: '600px',
							alignItems: 'center'
						}}
					>
						<span className='small-title citrusBlack'>
							{errorMessage}
						</span>
					</div>
				</div>
			)
		}

		if (isPaymentConfirmationOpen) {
			return (
				<div
					className='full-container flex-column flex-center coaching-loading white'
					style={{
						justifyContent: 'center',
						backgroundColor: '#FFFFFF'
					}}
				>
					<span
						className='small-text-bold citrusBlack'
						style={{ padding: '0 12px', textAlign: 'center' }}
					>
						{`${capitalize(t('confirmBuyingCoachingFor'))} ${price} ${price === 1 ? capitalize(t('credit')) : t('credits')} ?`}
					</span>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div
						className='flex-column flex-center'
						style={{ width: '90%', margin: '0 5%'}}
					>
					{
						credits && credits >= coaching.price ?
						<>
							<div
								className='filled-button full-width hover'
								onClick={this.handlePayCoaching}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('yes'))}
								</span>
							</div>
							<div className='medium-separator'></div>
						</> :
						<>
							<div
								className='filled-button full-width hover'
								onClick={this.handlePayCoaching}
							>
								<span className='small-title citrusWhite'>
									{`${capitalize(t('yesALaCarte'))} (1${returnCurrency(moment.locale())} ${t('ofFees')})`}
								</span>
							</div>
							<div className='medium-separator'></div>
						</>
					}
					{
						!user.subscription &&
						<>
							<div
								className='light-button full-width hover'
								onClick={() => this.setState({
									isPaymentConfirmationOpen: false,
									isCoachingCheckoutOpen: 'plan'
								})}
							>
								<span className='small-title citrusBlue'>
									{capitalize(t('chooseAPaymentPlan'))}
								</span>
							</div>
							<div className='medium-separator'></div>
						</>
					}
						<span
							className='small-text-bold citrusGrey hover'
							onClick={() => this.setState({ isPaymentConfirmationOpen: false })}
						>
							{capitalize(t('cancel'))}
						</span>
					</div>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
				</div>
			)
		}

		if (isCoachingCheckoutOpen) {
			return (
				<div
					className='full-width-and-height-dialog white'
					style={{
						height: '100%',
						overflowY: 'auto'
					}}
				>
					<CoachingCheckout
						type={isCoachingCheckoutOpen}
						amount={coaching.price}
						coachingId={coaching._id}
						onCancel={() => {
							this.setState({
								isCoachingCheckoutOpen: null,
								isPaymentConfirmationOpen: true
							})
						}}
						onSuccess={this.handleTransfer}
					/>
				</div>
			)
		}

		if (muxReplayPlaybackId) {
			return (
				<div className='player-wrapper'>
					<div
						style={{
							margin: '10px',
							zIndex: 1000,
							backgroundColor: 'transparent',
							position: 'absolute',
							top: 10,
							right: 10
						}}
					>
						<Close
							onClick={() => this.setState({ muxReplayPlaybackId: null })}
							className='hover'
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<ReactPlayer
						volume={1}
						className='react-player'
						width='100%'
						height='100%'
						autoPlay={false}
						controls
						url={muxReplayPlaybackId}
					/>
				</div>
			)
		}

		if (isEditingCoaching) {
			return (
				<div className='coaching-container white'>
					<CoachingEdition
						coaching={coaching}
						onCancel={() => this.setState({ isEditingCoaching: false })}
						onCoachingUpdated={coaching => {
							this.setState({
								coaching,
								isEditingCoaching: false
							})
						}}
						onCoachingDeleted={() => {
							this.setState({isLoading: true })
							fetchTrainerCoachings(user._id, true)
							.then(() => {
								setNotification({ message: capitalize(t('coachingSuccessfullyDeleted')) })
								onCancel()
							})
						}}
					/>
				</div>
			)
		}

		return (
			<div className='coaching-container white'>
				<div className='scroll-div-vertical'>
					<div
						style={{
							margin: '10px',
							zIndex: 1000,
							backgroundColor: 'transparent',
							position: 'absolute',
							top: 0,
							right: 0
						}}
					>
						<Close
							onClick={onCancel}
							className='hover'
							width={25}
							height={25}
							stroke={'#C2C2C2'}
							strokeWidth={2}
						/>
					</div>
					<div
						className='mobile-card-image'
						style={{
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundImage: `url(${pictureUri})`,
							backgroundSize: 'cover'
						}}
					>
					</div>
					<div className='small-separator'></div>
					<div className='coaching-column'>
						<div className='flex-row'>
							<span className='small-title citrusBlack'>
								{`${capitalize(title)} ${t('with')}`}
							</span>
							<span
								onClick={() => this.setState({ selectedCoach: coachInfo })}
								style={{ marginLeft: '3px' }}
								className='small-title citrusBlack username-hover'
							>
								{capitalize(coaching.coachUserName)}
							</span>
						</div>
						{
							coaching.coachId === user._id ?
								<span
									className='small-text-bold citrusGrey hover'
									onClick={() => this.setState({ isEditingCoaching: true })}
								>
									{t('edit')}
								</span> :
								<div className='small-separator'></div>
						}
						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('activity'))}
							</span>
							<span className='small-text-bold citrusBlack ellipsis-mobile'>
								{capitalize(t(sport))}
							</span>
						</div>

						{
							duration && t('duration') > 0 ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('duration'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{capitalize(t(duration))}
								</span>
							</div> : null
						}

						{
							price === 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('freeAccess'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{capitalize(t('yes'))}
								</span>
							</div>
						}

						{
							price !== 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('price'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{`${price} ${price === 0 ? t('credit') : t('credits')}`}
								</span>
							</div>
						}

						{level && level.length > 0 ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('level'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{capitalize(t(level))}
								</span>
							</div> : null
						}

						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('language'))}
							</span>
							<span className='small-text-bold citrusBlack ellipsis-mobile'>
								{capitalize(t(coachingLanguage))}
							</span>
						</div>

						{focus && focus.length > 0 ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('focus'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
								{
									focus
									.map((fc) => capitalize(t(fc)))
									.join(', ')
								}
								</span>
							</div> : null
						}

						{equipment && equipment.length > 0 ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('level'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{
										equipment
											.map((eq) => capitalize(t(eq)))
											.join(', ')
									}
								</span>
							</div> : null
						}
					</div>
				</div>
				<div className='small-separator'></div>
				<div
					className='filled-button button-mobile'
					onClick={this.handleSubmit}
				>
					<span className='small-title citrusWhite'>
						{this.renderButtonText()}
					</span>
				</div>
				{
					selectedCoach &&
					<Dialog
						open={true}
						onClose={() => this.setState({ selectedCoach: null })}
					>
						<div className='full-width-and-height-dialog'>
							<CoachProfile
								coach={selectedCoach}
								onCancel={() => {
									this.setState({ selectedCoach: null })
								}}
							/>
						</div>
					</Dialog>
				}
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
	userInfo: state.auth.userInfo,
	currentScreen: state.navigation.currentScreen,
})

const mapDispatchToProps = (dispatch) => ({
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	fetchUserInfo: (id) => dispatch(fetchUserInfo(id)),
	loadUser: () => dispatch(loadUser()),
	updateCoaching: (coaching) => dispatch(updateCoaching(coaching)),
	fetchUserReplays: (id) => dispatch(fetchUserReplays(id)),
	setNotification: notif => dispatch(setNotification(notif)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Coaching))
