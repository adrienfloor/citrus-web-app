import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import ReactPlayer from 'react-player'

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
	renderCoachingButtonText
} from '../../utils/various'

import {
	fetchUserInfo,
	updateUser,
	loadUser,
	fetchUserReplays
} from '../../actions/auth-actions'

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
						type='Oval'
						color='#C2C2C2'
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
			return (
				<div className='player-wrapper'>
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
						// autoplay={true}
						controls
						url={muxReplayPlaybackId}
						// muted
					/>
				</div>
			)
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
						<span className='small-title citrusBlack'>
							{capitalize(title)}
						</span>
						<div className='small-separator'></div>
						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('activity'))}
							</span>
							<span className='small-text-bold citrusBlack ellipsis-mobile'>
								{capitalize(t(sport))}
							</span>
						</div>

						{
							duration.length > 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('duration'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
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
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
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
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{capitalize(t(level))}
								</span>
							</div>
						}

						<div className='thin-row'>
							<span className='small-text-bold citrusGrey'>
								{capitalize(t('language'))}
							</span>
							<span className='small-text-bold citrusBlack ellipsis-mobile'>
								{capitalize(t(coachingLanguage))}
							</span>
						</div>

						{focus.length > 0 &&
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
							</div>
						}

						{equipment.length > 0 &&
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
							</div>
						}
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
				<div className='small-separator'></div>
				<div
					disabled={
						!products ||
						(products && products.length < 0) ||
						isBuyingCoaching
					}
					className='filled-button button-mobile'
					onClick={this.handleSubmit}
				>
					<span className='small-title citrusWhite'>
						{this.renderButtonText()}
					</span>
				</div>
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	fetchUserInfo: (id) => dispatch(fetchUserInfo(id)),
	loadUser: () => dispatch(loadUser()),
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	updateCoaching: (coaching) => dispatch(updateCoaching(coaching)),
	fetchUserReplays: (id) => dispatch(fetchUserReplays(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Coaching))
