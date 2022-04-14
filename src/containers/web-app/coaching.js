import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import ReactPlayer from 'react-player'
import Dialog from '@material-ui/core/Dialog'
import Rating from '@material-ui/lab/Rating'
import TextField from '@material-ui/core/TextField'

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
import { ReactComponent as Share } from '../../assets/svg/share.svg'
import { ReactComponent as Unmuted } from '../../assets/svg/unmuted.svg'
import { ReactComponent as Muted } from '../../assets/svg/muted.svg'

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
import { executeExploreSearch } from '../../actions/search-actions'
import {
	// fetchMpUserCredits,
	createMpTransfer,
	createMpCardDirectPayin
} from '../../services/mangopay'


const { REACT_APP_TEST_USERS } = process.env
const testUsers = REACT_APP_TEST_USERS.split(',')

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
			// credits: null,
			coachInfo: null,
			isChoosingPaymentMethod: false,
			isCoachingCheckoutOpen: null,
			errorMessage: null,
			selectedCoach: null,
			isRatingCoaching: false,
			ratingValue: null,
			coachComment: '',
			isSharingCoaching: false,
			isWatchingPreview: true,
			isPreviewMuted: true
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handlePayCoaching = this.handlePayCoaching.bind(this)
		this.renderButtonText = this.renderButtonText.bind(this)
		this.handleTransfer = this.handleTransfer.bind(this)
		this.handleCoachRating = this.handleCoachRating.bind(this)
		this.showVideoPreview = this.showVideoPreview.bind(this)
	}

	componentDidMount() {
		const { fetchUserInfo, user } = this.props
		const { coaching, timeToStart } = this.state
		fetchUserInfo(coaching.coachId)
		.then(res => this.setState({ coachInfo: res.payload }))
		// fetchMpUserCredits(user.MPUserId)
		// .then(credits => this.setState({ credits }))
		setTimeout(() => {
			this.setState({ isWatchingPreview: false })
		}, 30000);
	}

	showVideoPreview() {
		this.setState({ isWatchingPreview: true })
		setTimeout(() => {
			this.setState({ isWatchingPreview: false })
		}, 30000);
	}

	renderButtonText() {
		const { coaching, user, t } = this.props
		const { price, coachId } = coaching

		const hasBoughtCoaching = user.myReplays.find(training => training._id === coaching._id)

		if(user._id === coachId || hasBoughtCoaching || testUsers.includes(user.email)) {
			return capitalize(t('playVideo'))
		}
		if(price === 0) {
			return capitalize(t('watchForFree'))
		}
		// return `${capitalize(t('buyFor'))} ${price} ${price === 1 ? capitalize(t('credit')) : capitalize(t('credits'))}`
		return `${capitalize(t('buyFor'))} ${price} ${returnCurrency(moment.locale())}`
	}

	handleCoachRating() {
		const {
			coachComment,
			ratingValue,
			coachInfo
		} = this.state
		const {
			updateCoaching,
			updateUser,
			coaching,
			user,
			fetchUserReplays,
			onCancel,
			setNotification,
			t,
			executeExploreSearch
		} = this.props

		if(ratingValue === null) {
			return
		}

		this.setState({ isLoading: true })

		let { coachingRating } = coaching
		// update coaching rating with new rating
		if(!coachingRating) {
			coachingRating = {
				rating: null,
				numberOfRatings: 0
			}
		}
		const newNumberOfRatings = coachingRating.numberOfRatings + 1
		const newRating = ((coachingRating.rating * coachingRating.numberOfRatings) + ratingValue) / newNumberOfRatings
		updateCoaching({
			_id: coaching._id,
			coachingRating: {
				numberOfRatings: newNumberOfRatings,
				rating: newRating
			}
		})
		// update user replay to confirm he rated it
		const updatedReplays = user.myReplays
		for(let i=0; i<updatedReplays.length;i++) {
			if(updatedReplays[i]._id === coaching._id) {
				updatedReplays[i].myRating = ratingValue
				updatedReplays[i].coachingRating = {
					numberOfRatings: newNumberOfRatings,
					rating: newRating
				}
			}
		}
		updateUser({
			id: user._id,
			myReplays: updatedReplays
		}).then(() => {
			// update coach comments
			if(coachComment !== '') {
				updateUser({
					id: coaching.coachId,
					coachComments: [
						{
							coachComment,
							userName: user.userName,
							rating: ratingValue
						},
						...coachInfo.coachComments
					]
				})
			}
			fetchUserReplays(user._id)
			setNotification({ message: capitalize(t('thankYouForRatingThisCoaching')) })
			executeExploreSearch('all', user._id, 0, 5, user.sports)
			onCancel()
			this.setState({
				muxReplayPlaybackId: null,
				isRatingCoaching: false,
				isLoading: false
			})
		})
	}

	handleTransfer() {
		const {
			coaching,
			// credits,
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
			// credits,
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
		// ADD CREDITS TO COACH LIFETIME GAINS
		//
		// IF NO SUBSCRIPTION LAUNCH PAYMENT OF COACHING + 1
		// ELSE
		// LAUNCH PAYMENT OF COACHING
		// INITIATE THE TRANSFER FROM MP USER WALLET TO MP COACH WALLET
		//
		// LOAD USER AND FETCH USER REPLAYS
		// LAUNCH THE VIDEO PLAYER WITH THIS VIDEO

			// New user, no card registered, go to checkout
			if (!user.MPUserId) {
				this.setState({
					isLoading: false,
					isCoachingCheckoutOpen: 'aLaCarte'
				})
			} else {
				if(!user.subscription) {
					// user paying à la carte with fees
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
						if (res && res.Status === "SUCCEEDED") {
							return this.handleTransfer()
						}
						this.setState({
							isLoading: false,
							isPaymentConfirmationOpen: false,
							isCoachingCheckoutOpen: false,
							errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
						})
					})
				} else {
					// premium user paying without fees
					createMpCardDirectPayin(
						user.MPUserId,
						{
							"Amount": coaching.price * 100,
							"Currency": returnCurrencyCode(moment.locale())
						},
						{
							"Amount": 0,
							"Currency": returnCurrencyCode(moment.locale())
						}
					).then(res => {
						console.log('res form direct pay in : ', res)
						if (res && res.Status === "SUCCEEDED") {
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

		// if (credits >= coaching.price) {
		// 	this.handleTransfer()
		// } else {
		// 	// New user, no card registered, go to checkout
		// 	if(!user.MPUserId) {
		// 		this.setState({
		// 			isLoading: false,
		// 			isCoachingCheckoutOpen: 'aLaCarte'
		// 		})
		// 	} else {
		// 		// user paying à la carte
		// 		createMpCardDirectPayin(
		// 			user.MPUserId,
		// 			{
		// 				"Amount": (coaching.price + 1) * 100,
		// 				"Currency": returnCurrencyCode(moment.locale())
		// 			},
		// 			{
		// 				"Amount": 100,
		// 				"Currency": returnCurrencyCode(moment.locale())
		// 			}
		// 		).then(res => {
		// 			console.log('res form direct pay in : ', res)
		// 			if(res && res.Status === "SUCCEEDED") {
		// 				return this.handleTransfer()
		// 			}
		// 			this.setState({
		// 				isLoading: false,
		// 				isPaymentConfirmationOpen: false,
		// 				isCoachingCheckoutOpen: false,
		// 				errorMessage: capitalize(t('somethingWentWrongProcessingTheTransaction'))
		// 			})
		// 		})
		// 	}
		// }
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

		// Test users can watch videos for free

		if(testUsers.includes(user.email)) {
			return this.setState({
				isLoading: false,
				muxReplayPlaybackId: coaching.muxReplayPlaybackId
			})
		}

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
			fetchTrainerCoachings,
			isMyUnratedReplay
		} = this.props
		const {
			isLoading,
			isPaymentConfirmationOpen,
			accessDenied,
			muxReplayPlaybackId,
			isEditingCoaching,
			coaching,
			// credits,
			isCoachingCheckoutOpen,
			errorMessage,
			coachInfo,
			selectedCoach,
			isRatingCoaching,
			ratingValue,
			isSharingCoaching,
			isWatchingPreview,
			isPreviewMuted
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
			price,
			coachingRating
		} = coaching

		const currency = returnCurrency(moment.locale())

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
					{
						// (credits>0 || !user.subscription) &&
						<span
							className='small-text-bold citrusBlack'
							style={{ padding: '0 12px', textAlign: 'center' }}
						>
							{`${capitalize(t('confirmBuyingCoachingFor'))} ${price}${currency} ?`}
						</span>
					}
					{/* {
						!credits && user.subscription &&
						<span
							className='small-text-bold citrusBlack'
							style={{ padding: '0 12px', textAlign: 'center' }}
						>
							{capitalize(t('noCreditsLeftAvailableThisMonth'))}
						</span>
					} */}
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div
						className='flex-column flex-center'
						style={{ width: '90%', margin: '0 5%'}}
					>
						{/* {
							!credits && user.subscription && user.subscription !== 30 &&
							<>
								<div
									className='light-button full-width hover'
									onClick={() => this.setState({
										isPaymentConfirmationOpen: false,
										isCoachingCheckoutOpen: 'plan'
									})}
								>
									<span className='small-title citrusBlue'>
										{capitalize(t('upgradeYourPlan'))}
									</span>
								</div>
								<div className='medium-separator'></div>
							</>
						} */}
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
						{
							// credits>0 && credits >= coaching.price ?
							user.subscription ?
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
										{`${capitalize(t('yes'))} (${price}${currency} + 1${currency} ${t('aLaCarteFee')})`}
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
						currentPlan={user.subscription}
						// credits={credits}
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
							onClick={() => {
								isMyUnratedReplay ?
								this.setState({
									isRatingCoaching: true,
									muxReplayPlaybackId: null
								}) :
								this.setState({ muxReplayPlaybackId: null })
							}}
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

		if(isRatingCoaching) {
			return (
				<div
					className='full-width-and-height-dialog white'
					style={{
						height: '100%',
						minHeight: '600px',
						overflowY: 'auto'
					}}
				>
					<div
						className='flex-column flex-center'
						style={{ padding: '10%' }}
					>
						<div className='rating-container'>
							<span className='small-text-bold'>
								{capitalize(t('whatDidYouThinkAboutThisCoaching'))}
							</span>
							<Rating
								precision={0.5}
								size='large'
								value={ratingValue}
								onChange={(event, newValue) => {
									this.setState({ ratingValue: newValue })
								}}
							/>
						</div>
						<div className='big-separator'></div>
						<span className='small-text-bold' style={{ width: '100%' }}>
							{capitalize(t('tellUseMOreAboutThisCoach'))} :
						</span>
						<div className='medium-separator'></div>
						<div className='small-separator'></div>
						<TextField
							variant='outlined'
							className='small-text-bold citrusGrey'
							multiline
							rows={4}
							placeholder={capitalize(t('whatDidYouLikeTrainingWithThisCoach'))}
							onChange={(e) => this.setState({ coachComment: e.target.value })}
							style={{
								color: '#000000',
								width: '100%',
								backgroundColor: 'inherit'
							}}
						/>
						<div className='big-separator'></div>
						<div
							className='filled-button hover'
							onClick={this.handleCoachRating}
						>
							<span className='small-text-bold'>{capitalize(t('send'))}</span>
						</div>
						<div className='medium-separator'></div>
						<div
							className='hover'
							style={{
								borderBottom: '1px solid #C2C2C2',
								paddingBottom: 1
							}}
							onClick={() => {
								this.setState({
									isRatingCoaching: false,
									muxReplayPlaybackId: null
								})
							}}
						>
							<span className='smaller-text-bold citrusGrey'>
								{capitalize(t('illDoItLater'))}
							</span>
						</div>
					</div>
					<style jsx='true'>
						{`
						.rating-container {
							width: 50%;
							margin-right: 50%;
							display: flex;
							align-items: center;
							justify-content: space-between;
						}
						@media only screen and (max-width: 640px) {
							.rating-container {
								width: 100%;
								margin-right: 0;
								flex-direction: column;
								align-items: flex-start;
								justify-content: space-between;
								height: 70px;
							}
						}
					`}
					</style>
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
					{
						!isWatchingPreview ?
						<div
							onMouseOver={this.showVideoPreview}
							onMouseLeave={() => this.setState({ isWatchingPreview: false })}
							className='mobile-card-image'
							style={{
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
								backgroundImage: `url(${pictureUri})`,
								backgroundSize: 'cover'
							}}
						>
						</div> :
						<div
							onMouseLeave={() => this.setState({ isWatchingPreview: false })}
							className={
								isWatchingPreview ?
								'mobile-card-image-with-video-preview' :
								'mobile-card-image'
							}
						>
							<div className='preview-player-wrapper'>
								<ReactPlayer
								 	playsinline
									volume={1}
									className='react-player'
									width='100%'
									height='100%'
									playing={true}
									url={coaching.muxReplayPlaybackId}
									muted={isPreviewMuted}
								/>
								<div
									style={{
										width: '98%',
										position: 'relative',
										display: 'flex',
										justifyContent: 'flex-end',
										padding: '0 0 10px 0'
									}}
									onClick={() => this.setState({ isPreviewMuted: !isPreviewMuted })}
									className='hover'
								>
									{
										isPreviewMuted ?
										<Muted
											width={25}
											height={25}
											stroke={'#C2C2C2'}
											strokeWidth={2}
										/> :
										<Unmuted
											width={25}
											height={25}
											stroke={'#C2C2C2'}
											strokeWidth={2}
										/>
									}
								</div>
							</div>
						</div>
					}
					<div className='small-separator'></div>
					<div className='coaching-column'>
						<div className='flex-row-desktop-column-mobile'>
							<span className='small-title citrusBlack'>
								{capitalize(title)}
							</span>
							<span
								onClick={() => this.setState({ selectedCoach: coachInfo })}
								style={{ marginLeft: '3px' }}
								className='small-title citrusBlack username-hover'
							>
								{`${t('with')} ${titleCase(coaching.coachUserName)}`}
							</span>
						</div>
						{
							coaching.coachId === user._id ?
								<>
									<div className='small-separator'></div>
									<div style={{ display: 'flex' }}>
										<span
											className='small-text-bold citrusGrey hover'
											onClick={() => this.setState({ isEditingCoaching: true })}
										>
											{capitalize(t('edit'))}
										</span>
										<div style={{ margin: '0 10px', color: '#C2C2C2' }}>|</div>
										<div style={{ display: 'flex', alignItems: 'center' }}>
											<span
												className='small-text-bold citrusGrey hover'
												onClick={() => this.setState({ isSharingCoaching: true })}
												style={{ marginRight: '5px' }}
											>
												{capitalize(t('share'))}
											</span>
											<Share
												width={15}
												height={15}
												stroke={'#C2C2C2'}
												strokeWidth={2}
											/>
										</div>
									</div>
								</> :
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<span
										className='small-text-bold citrusGrey hover'
										onClick={() => this.setState({ isSharingCoaching: true })}
										style={{ marginRight: '5px' }}
									>
										{capitalize(t('share'))}
									</span>
									<Share
										width={15}
										height={15}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/>
								</div>
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
							coachingRating && coachingRating.rating ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('globalRating'))}
								</span>
									<Rating
										precision={0.5}
										size='small'
										value={coachingRating.rating}
										readOnly
									/>
							</div> : null
						}
						{
							duration ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('duration'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{`${duration} ${t('min')}`}
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
									{`${price} ${returnCurrency(moment.locale())}`}
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
									{capitalize(t('equipment'))}
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

						{!equipment || equipment && equipment.length === 0 ?
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('equipment'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{capitalize(t('none'))}
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
				{
					isSharingCoaching &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isSharingCoaching: false })}
					>
						<div className='share-coaching-container'>
							<div className='flex-column'>
								<div
									style={{
										width: '100%',
										height: '25px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'flex-end'
									}}
									onClick={() => this.setState({ isSharingCoaching: false })}
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
									className='flex-column'
									style={{ padding: '10px', minHeight: '150px', justifyContent: 'center' }}
								>
									<span className='small-text-bold citrusGrey'>
										{capitalize(t('clickOnThisLinkToCopyIt'))} :
									</span>
									<div className='small-separator'></div>
									<span
										className='small-title citrusBlack hover'
										onClick={() => {
											navigator.clipboard.writeText(
												`https://app.thecitrusapp.com/explore?coaching=${coaching._id}`
											)
											setNotification({ message: capitalize(t('copied')) })
											this.setState({ isSharingCoaching: false })
										}}
									>
										{`https://app.thecitrusapp.com/explore?coaching=${coaching._id}`}
									</span>
								</div>
							</div>
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
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	executeExploreSearch: (sport, userId, skipValue, limit, userFavoriteSports) =>
		dispatch(executeExploreSearch(sport, userId, skipValue, limit, userFavoriteSports)),
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Coaching))
