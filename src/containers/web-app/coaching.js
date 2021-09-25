import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import ReactPlayer from 'react-player'

import Tag from '../../components/web-app/tag'
import Card from '../../components/web-app/card'


// import OverlayConfirmation from '../../components/overlay-confirmation'
// import NotAvailableCard from '../../components/not-available-card'
// import OverlayBottomMenu from '../../components/overlay-bottom-menu'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { ReactComponent as CaretBack } from '../../assets/svg/caret-left.svg'

import {
	uppercase,
	capitalize,
	titleCase,
	renderCoachingButtonText
} from '../../utils/various'

import {
	fetchUserInfo,
	updateUser,
	loadUser,
	fetchUserReplays
} from '../../actions/auth-actions'
import { setAppScreen } from '../../actions/navigation-actions'

import { updateCoaching } from '../../actions/coachings-actions'

class Coaching extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			isConfirmationOpen: false,
			accessDenied: false,
			muxReplayPlaybackId: null,
			isEditingCoaching: false,
			coaching: this.props.coaching,
			isMenuOpen: false,
			isBuffering: false,
			products: [],
			showPlayPauseButton: true,
			isBuyingCoaching: false,
			isVideoPaused: false,
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.renderButtonText = this.renderButtonText.bind(this)
	}

	componentDidMount() {
		const { fetchUserInfo } = this.props
		const { coaching, timeToStart } = this.state
		const { coachId } = coaching
		fetchUserInfo(coachId)
	}

	renderButtonText() {
		const { coaching, user, t } = this.props
		const { products } = this.state

		const hasAttendedActivity = user.activitiesIHaveAttended.find(
			(activity) => activity._id === coaching._id,
		)

		if (user._id == coaching.coachId || coaching.freeAccess) {
			const str = renderCoachingButtonText(coaching, user)
			return titleCase(t(str))
		}

		const replayProduct = products.find(
			(product) => product.productId === 'replay_coaching',
		)

		if (hasAttendedActivity && hasAttendedActivity.boughtReplay) {
			return capitalize(t('playVideo'))
		}
		if (products && products.length) {
			return `${capitalize(t('buyFor'))} ${replayProduct.localizedPrice
				}`
		}
		return capitalize(t('loading'))
	}

	handleSubmit() {
		const { coaching } = this.state
		const {
			loadUser,
			onCancel,
			user,
			selectScreen,
			updateUser,
			fetchUserReplays,
			updateCoaching,
			userInfo,
		} = this.props

		////////////////

		if (coaching.muxReplayPlaybackId) {
			return this.setState({
				muxReplayPlaybackId: coaching.muxReplayPlaybackId,
			})
		}

		///////////////

		const { products } = this.state

		const replayProduct = products.find(
			(product) => product.productId === 'replay_coaching',
		)

		const hasAttendedActivity = user.activitiesIHaveAttended.find(
			(activity) => activity._id === coaching._id,
		)

		const isReplay = coaching.muxReplayPlaybackId

		let userUpdatedInfo = {
			id: user._id,
		}

		// THIS IS MY COACHING AS A COACH
		if (user._id == coaching.coachId) {
			// TIME OF COACHING IS IN LESS THAN 5MIN SO I CAN GO LIVE IF I WANT TO

			// I'M WATCHING MY OWN REPLAY
			if (coaching.muxReplayPlaybackId) {
				return this.setState({
					muxReplayPlaybackId: coaching.muxReplayPlaybackId,
				})
			}
			// I'M CLOSING THE COACHING CARD
			return onCancel()
		}

		if (
			(hasAttendedActivity && coaching.freeAccess) ||
			(hasAttendedActivity && hasAttendedActivity.boughtReplay)
		) {
			if (isReplay) {
				return this.setState({
					muxReplayPlaybackId: coaching.muxReplayPlaybackId,
				})
			}
		} else {
			if (isReplay) {
				if (coaching.freeAccess) {
					userUpdatedInfo.activitiesIHaveAttended = [
						...user.activitiesIHaveAttended,
						{
							_id: coaching._id,
							coaching,
							freeAccess: true,
						},
					]
					return updateUser(userUpdatedInfo).then(() => {
						loadUser()
						fetchUserReplays(user._id)
						this.setState({
							muxReplayPlaybackId: coaching.muxReplayPlaybackId,
						})
					})
				} else {
					this.setState({ isBuyingCoaching: true })
					setTimeout(
						function () {
							this.setState({
								isLoading: true,
							})
						}.bind(this),
						500,
					)


						// WEB PAYMENT ==> TODO /!\

					// Iap.requestPurchase(replayProduct.productId)
					// 	.then((res) => {
					// 		this.setState({
					// 			isLoading: true,
					// 			isBuyingCoaching: false,
					// 		})
					// 		const transactionId = res.transactionId
					// 		purchaseUpdatedListener = Iap.purchaseUpdatedListener(
					// 			(purchase) => {
					// 				const receipt = purchase.transactionReceipt
					// 				verifyReceipt(receipt).then((verifyResponse) => {
					// 					if (verifyResponse.status !== 21002) {
					// 						Iap.finishTransactionIOS(transactionId)
					// 						Iap.clearTransactionIOS()
					// 						purchaseUpdatedListener.remove()
					// 						purchaseUpdatedListener = null
					// 						userUpdatedInfo.activitiesIHaveAttended = [
					// 							...user.activitiesIHaveAttended,
					// 							{
					// 								_id: coaching._id,
					// 								coaching,
					// 								freeAccess: false,
					// 								boughtReplay: true,
					// 							},
					// 						]
					// 						this.setState({
					// 							muxReplayPlaybackId: coaching.muxReplayPlaybackId,
					// 							isLoading: false,
					// 						})
					// 						return updateUser(userUpdatedInfo).then(() => {
					// 							createTransaction({
					// 								platform: Platform.OS,
					// 								coachingId: coaching._id,
					// 								buyerId: user._id,
					// 								coachId: coaching.coachId
					// 							})
					// 							updateCoaching({
					// 								_id: coaching._id,
					// 								replayPayers: coaching.replayPayers
					// 									? coaching.replayPayers + 1
					// 									: 1,
					// 							})
					// 							updateUser({
					// 								id: userInfo._id,
					// 								// currentGains: userInfo.currentGains ? userInfo.currentGains + (0.7 * replayProduct.price) : 0.7 * replayProduct.price,
					// 								// lifeTimeGains: userInfo.lifeTimeGains ? userInfo.lifeTimeGains + (0.7 * replayProduct.price) : 0.7 * replayProduct.price
					// 								currentGains: userInfo.currentGains
					// 									? userInfo.currentGains + 1.6
					// 									: 1.6,
					// 								lifeTimeGains: userInfo.lifeTimeGains
					// 									? userInfo.lifeTimeGains + 1.6
					// 									: 1.6,
					// 							})
					// 							loadUser()
					// 							fetchUserReplays(user._id)
					// 						})
					// 					}
					// 				})
					// 			},
					// 		)
					// 	})
					// 	.catch((err) => {
					// 		this.setState({
					// 			isBuyingCoaching: false,
					// 			isLoading: false,
					// 		})
					// 		return console.log('Error buying replay', err)
					// 	})
				}
			}
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
			t
		} = this.props
		const {
			isLoading,
			isConfirmationOpen,
			accessDenied,
			muxReplayPlaybackId,
			isEditingCoaching,
			coaching,
			isMenuOpen,
			isBuffering,
			products,
			showPlayPauseButton,
			isBuyingCoaching,
			isVideoPaused,
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
		} = coaching

		if (isLoading) {
			return (
				<div className='flex-column flex-center'>
					<div className='big-separator'></div>
					<div className='big-separator'></div>
					<Loader
						type="Grid"
						color="#0075FF"
						height={100}
						width={100}
					/>
				</div>
			)
		}

		if (accessDenied) {
			return null
			// return (
			// 	<NotAvailableCard
			// 		onClose={() => {
			// 			this.setState({
			// 				accessDenied: false,
			// 				isConfirmationOpen: false,
			// 			})
			// 		}}
			// 	/>
			// )
		}

		if (muxReplayPlaybackId) {
			return <ReactPlayer controls width='400px' url={muxReplayPlaybackId}/>
			// return (
			// 	<Modal
			// 		visible={true}
			// 		contentContainerStyle={{
			// 			...styles.mainVideoContainer,
			// 			backgroundColor: '#000000',
			// 		}}
			// 		supportedOrientations={[
			// 			'portrait',
			// 			'portrait-upside-down',
			// 			'landscape',
			// 		]}>
			// 		<View style={styles.videoTopContainer}>
			// 			<TouchableOpacity
			// 				onPress={() => {
			// 					this.setState({
			// 						isMenuOpen: true,
			// 						isVideoPaused: true,
			// 					})
			// 				}}>
			// 				<Close
			// 					width={35}
			// 					height={35}
			// 					stroke={'#FFFFFF'}
			// 					strokeWidth={5}
			// 				/>
			// 			</TouchableOpacity>
			// 		</View>
			// 		{isBuffering && (
			// 			<View style={styles.bufferContainer}>
			// 				<Spinner color="#FFFFFF" />
			// 			</View>
			// 		)}
			// 		<VideoPlayer
			// 			paused={isVideoPaused}
			// 			fullscreen={true}
			// 			ref={(ref) => {
			// 				this.player = ref
			// 			}}
			// 			resizeMode={ratio && ratio === 'landscape' ? 'contain' : 'cover'}
			// 			ignoreSilentSwitch="ignore"
			// 			source={{ uri: muxReplayPlaybackId }}
			// 			fullscreenOrientation="portrait"
			// 			onBuffer={() => console.log('buffering replay ...')}
			// 			onError={(e) => console.log('error playing video : ', e)}
			// 			onLoadStart={() => this.setState({ isBuffering: true })}
			// 			onReadyForDisplay={() => this.setState({ isBuffering: false })}
			// 			style={styles.videoContainer}
			// 			disableVolume
			// 			disableBack
			// 			disableFullscreen
			// 			disablePlayPause
			// 			onHideControls={() => this.setState({ showPlayPauseButton: false })}
			// 			onShowControls={() => this.setState({ showPlayPauseButton: true })}
			// 			controlTimeout={5000}
			// 		/>
			// 		{showPlayPauseButton && (
			// 			<TouchableOpacity
			// 				style={styles.pauseButtonContainer}
			// 				onPress={() => this.setState({ isVideoPaused: !isVideoPaused })}>
			// 				{isVideoPaused ? (
			// 					<Play
			// 						width={30}
			// 						height={30}
			// 						stroke={'#FFFFFF'}
			// 						strokeWidth={2}
			// 					/>
			// 				) : (
			// 					<Pause
			// 						width={30}
			// 						height={30}
			// 						stroke={'#FFFFFF'}
			// 						strokeWidth={2}
			// 					/>
			// 				)}
			// 			</TouchableOpacity>
			// 		)}
			// 		{isMenuOpen && (
			// 			<OverlayBottomMenu
			// 				secondItemText={t('coach.goLive.endVideo')}
			// 				thirdItemText={t('common.cancel')}
			// 				onSecondItemAction={() => {
			// 					this.setState({
			// 						isMenuOpen: false,
			// 						muxReplayPlaybackId: null,
			// 						coaching: this.state.coaching,
			// 					})
			// 				}}
			// 				onThirdItemAction={() => {
			// 					this.setState({
			// 						isMenuOpen: false,
			// 						isVideoPaused: false,
			// 					})
			// 				}}
			// 			/>
			// 		)}
			// 	</Modal>
			// )
		}

		if (isEditingCoaching) {
			return null
			// return (
			// 	<Schedule
			// 		coaching={coaching}
			// 		onCancel={() => this.setState({ isEditingCoaching: false })}
			// 		onCoachingCreated={(coaching) => {
			// 			this.setState({
			// 				isEditingCoaching: false,
			// 				coaching,
			// 			})
			// 			this.alertWithType(
			// 				capitalize(t('coach.schedule.coachingUpdated')),
			// 				`${capitalize(
			// 					t('coach.schedule.coaching'),
			// 				)} ${title} ${t('coach.schedule.updated')}`,
			// 			)
			// 		}}
			// 		onCoachingDeleted={() => {
			// 			this.setState({ isEditingCoaching: false })
			// 			onCoachingDeleted()
			// 		}}
			// 	/>
			// )
		}

		return (
			<div className='coaching-container'>
				<div className='scroll-div-vertical'>
					<div className='small-separator'></div>
					<div
						style={{
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundImage: `url(${pictureUri})`,
							backgroundSize: 'cover',
							width: '100%',
							height: '300px'
						}}>
					</div>
					<div className='small-separator'></div>
					<div className='coaching-column'>
						<span className='small-title citrusBlack'>
							{capitalize(title)}
						</span>
						<div className='small-separator'></div>
						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('activity'))}
							</span>
							<span className='small-text-bold citrusBlack'>
								{capitalize(t(sport))}
							</span>
						</div>

						{
							duration.length > 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('duration'))}
								</span>
								<span className='small-text-bold citrusBlack'>
									{capitalize(t(duration))}
								</span>
							</div>
						}

						{
							freeAccess !== undefined &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('freeAccess'))}
								</span>
								<span className='small-text-bold citrusBlack'>
									{freeAccess
										? capitalize(t('yes'))
										: capitalize(t('no'))
									}
								</span>
							</div>
						}

						{level.length > 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('level'))}
								</span>
								<span className='small-text-bold citrusBlack'>
									{capitalize(t(level))}
								</span>
							</div>
						}


						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('lamguage'))}
							</span>
							<span className='small-text-bold citrusBlack'>
								{capitalize(t(coachingLanguage))}
							</span>
						</div>

						{focus.length > 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('level'))}
								</span>
								<span className='small-text-bold citrusBlack'>
								{
									focus
									.map((fc) => capitalize(t(fc)))
									.join(', ')
								}
								</span>
							</div>
						}

						{equipment.length > 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('level'))}
								</span>
								<span className='small-text-bold citrusBlack'>
									{
										equipment
											.map((eq) => capitalize(t(eq)))
											.join(', ')
									}
								</span>
							</div>
						}
						<div className='medium-separator'></div>
						<div className='small-separator'></div>
						<div
							disabled={
								!products ||
								(products && products.length < 0) ||
								isBuyingCoaching
							}
							className='filled-button'
							onClick={this.handleSubmit}
						>
							<span className='small-title citrusWhite'>
								{this.renderButtonText()}
							</span>
						</div>
						<div className='small-separator'></div>
					</div>
					{/* {isConfirmationOpen && (
						<OverlayConfirmation
							itemText={t('common.confirmAccess')}
							itemAction={this.handleConfirmAccess}
							cancelText={t('common.cancel')}
							onCancel={() => this.setState({ isConfirmationOpen: false })}
						/>
					)} */}
				</div>
			</div>
		)
	}
}

// const styles = StyleSheet.create({
// 	main: {
// 		height: '100%',
// 		width: '100%',
// 		flex: 0,
// 	},
// 	coachingPicture: {
// 		flex: 0,
// 		width: '100%',
// 		height: '30%',
// 	},
// 	pictureView: {
// 		width: '100%',
// 		height: '100%',
// 		backgroundColor: 'rgba(0,0,0,0.2)',
// 		paddingHorizontal: 20,
// 		paddingTop: 30,
// 	},
// 	bottomContainer: {
// 		flex: 0,
// 		width: '100%',
// 		height: '70%',
// 		paddingBottom: 20,
// 		justifyContent: 'space-around',
// 		alignItems: 'flex-start',
// 		backgroundColor: '#FFF',
// 	},
// 	titleRow: {
// 		width: '100%',
// 		flex: 0,
// 		flexDirection: 'row',
// 		justifyContent: 'space-between',
// 		alignItems: 'flex-start',
// 	},
// 	row: {
// 		width: '100%',
// 		flex: 0,
// 		flexDirection: 'row',
// 		justifyContent: 'flex-start',
// 	},

// 	mainVideoContainer: {
// 		height: '100%',
// 		width: '100%',
// 		flex: 1,
// 		alignItems: 'center',
// 		justifyContent: 'flex-start',
// 	},
// 	bufferContainer: {
// 		position: 'absolute',
// 		zIndex: 2000,
// 		top: '45%',
// 		left: '45%',
// 	},
// 	videoTopContainer: {
// 		position: 'absolute',
// 		height: '12%',
// 		width: '100%',
// 		paddingRight: 15,
// 		paddingTop: 25,
// 		flex: 0,
// 		justifyContent: 'center',
// 		alignItems: 'flex-end',
// 		zIndex: 1000,
// 		backgroundColor: 'transparent',
// 	},
// 	videoContainer: {
// 		width: '100%',
// 		height: '100%',
// 		backgroundColor: '#000000',
// 	},
// 	pauseButtonContainer: {
// 		position: 'absolute',
// 		width: '100%',
// 		flex: 0,
// 		zIndex: 1000,
// 		backgroundColor: 'transparent',
// 		// bottom: '100%' <= 667 ? '2%' : '5.5%',
// 		left: 15,
// 	},
// 	category: {
// 		flex: 0,
// 		flexDirection: 'row',
// 		justifyContent: 'space-between',
// 		alignItems: 'center',
// 		height: 41,
// 		width: '100%',
// 		borderBottomWidth: 1,
// 		borderBottomColor: '#F8F8F8',
// 		paddingLeft: 20,
// 	},
// 	leftRow: {
// 		maxWidth: '55%',
// 		fontWeight: '500',
// 	},
// 	rightRow: {
// 		maxWidth: '45%',
// 	},
// })

const mapStateToProps = (state) => ({
	user: state.auth.user,
	userInfo: state.auth.userInfo,
	currentScreen: state.navigation.currentScreen,
})

const mapDispatchToProps = (dispatch) => ({
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	fetchUserInfo: (id) => dispatch(fetchUserInfo(id)),
	loadUser: () => dispatch(loadUser()),
	setAppScreen: screen => dispatch(setAppScreen(screen)),
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	updateCoaching: (coaching) => dispatch(updateCoaching(coaching)),
	fetchUserReplays: (id) => dispatch(fetchUserReplays(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Coaching))
