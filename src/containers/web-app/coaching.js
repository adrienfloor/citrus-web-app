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
	returnCurrency
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

		if(user._id === coaching.coachId) {
			return capitalize(t('playVideo'))
		}

		return capitalize(t('playVideo'))
		return `${capitalize(t('buyFor'))} ${coaching.price}`
		return capitalize(t('loading'))
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

		////////////////

		this.setState({ isLoading: true })

		// THIS IS MY COACHING AS A COACH
		if (user._id == coaching.coachId) {
			return this.setState({
				muxReplayPlaybackId: coaching.muxReplayPlaybackId,
			})
		}

		if(coaching.price === 0) {
			updateUser({
				id: user._id,
				myReplays: [
					...user.replays,
					coaching
				]
			}).then(res => {
				if(res) {
					// shoud test the response
					console.log('coaching is actually free and added to my replays', res)
					fetchUserReplays(user._id)
					// loadUser() do we have to do this ?
					return this.setState({
						isLoading: false,
						muxReplayPlaybackId: coaching.muxReplayPlaybackId
					})
				}
			})
		} else {
			if(user.credits >= coaching.price) {
				// Update buyer profile
				updateUser({
					id: user._id,
					credits: user.credits - coaching.price,
					myReplays: [
						...user.replays,
						coaching
					]
				})
				// Update coach profile
				updateUser({
					id: coaching.coachId,
					currentGains: user.currentGains + (coaching.price * 0.7),
					lifeTimeGains: user.lifeTimeGains + (coaching.price * 0.7)
				})
				// Update coaching
				updateCoaching({
					_id: coaching._id,
					numberOfViewers: coaching.numberOfViewers + 1
				})
				//
				//transfer from mangopay user userWallet to coach coachWallet
				// with 30% fees for Citrus
			} else {
				// Should subscribe or buy credits
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
			price
		} = coaching

		if (isLoading) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '100%' }}
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
						controls
						url={muxReplayPlaybackId}
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
							freeAccess && price === 0 &&
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
							price && price !== 0 &&
							<div className='thin-row'>
								<span className='small-text-bold citrusGrey'>
									{capitalize(t('price'))}
								</span>
								<span className='small-text-bold citrusBlack ellipsis-mobile'>
									{`${price} ${price === 0 ? t('credit') : t('credits')}`}
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
