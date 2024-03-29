import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import Dialog from '@material-ui/core/Dialog'
import Rating from '@material-ui/lab/Rating'

import Coaching from './coaching'
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

import {
	capitalize,
	titleCase
} from '../../utils/various'

import { fetchTrainerCoachings } from '../../actions/coachings-actions'
import { setNotification } from '../../actions/notifications-actions'
import {
	fetchUserInfo,
	createFollower,
	deleteFollower,
	loadUser
} from '../../actions/auth-actions'
import { createNotification } from '../../actions/notifications-actions'

const { REACT_APP_SERVER_URL } = process.env

const randomAvaterUri = 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1593257031/VonageApp/random-user_zsirit.png'

class CoachProfile extends React.Component {
	constructor(props) {
		super(props)
		const {
			coach,
			fetchTrainerCoachings
		} = this.props
		const {
			userName,
			sports,
			bio,
			avatarUrl,
			_id,
			coachComments
		} = coach

		this.state = {
			isLoading: false,
			isRefreshing: false,
			coachings: [],
			coachingsSkip: 3,
			coachComments: coachComments || [],
			isSharingCoachProfile: false
		}

		this.loadCoachInfo()

		this.loadCoachInfo = this.loadCoachInfo.bind(this)
		this.handleFollowCoach = this.handleFollowCoach.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	componentDidMount() {
		const {
			coach,
			fetchNotifications,
			fetchTrainerCoachings,
			user
		} = this.props

		this.socket = io(REACT_APP_SERVER_URL)
		// LISTENER
		this.socket.on('new notification', notification => {
			if (user._id === notification.userId) {
				return fetchNotifications(user._id)
			}
		})
	}

	async loadCoachInfo() {
		const {
			coach,
			fetchTrainerCoachings,
			fetchUserInfo
		} = this.props
		try {
			const trainingsResponse = await fetchTrainerCoachings(coach._id)
			const userResponse = await fetchUserInfo(coach._id)
				this.setState({
					isLoading: true
				})
				if (trainingsResponse && userResponse) {
					this.setState({
						coachings: trainingsResponse.payload,
						coachComments: userResponse.payload.coachComments,
						isLoading: false
					})
				}
		} catch (e) {
			console.log(e)
		}
	}

	handleFollowCoach(followedId, followerId) {
		const {
			user,
			loadUser,
			createFollower,
			deleteFollower,
			createNotification,
			setNotification,
			coach,
			t,
			onCancel
		} = this.props

		if (!followedId || !followerId) {
			return createFollower({
				follower: user,
				followee: coach
			})
				.then(res => {
					if (res.payload.msg === 'New follower') {
						setNotification({ message: capitalize(`${t('youreNowFollowing')} ${coach.userName}`)})
						loadUser()
						createNotification({
							message: `${user.userName} ${t('followedYou')}`,
							userId: coach._id,
						})
							.then(res => {
								return this.socket.emit('new notification', {
									userId: coach._id,
									message: `${user.userName} ${t('followedYou')}`
								})
							})
					}
				})
		} else {
			return deleteFollower(followedId, followerId)
				.then(res => {
					setNotification({ message: capitalize(`${t('youveUnfollowed')} ${coach.userName}`) })
					onCancel()
					loadUser()
				})
		}
	}

	handleSubmit() {
		const {
			coach,
			user
		} = this.props

		const isFollowingCoach = coach && user.following.find(
			followedCoach => followedCoach._id === coach._id
		)
		if (isFollowingCoach) {
			return this.handleFollowCoach(coach._id, user._id)
		}
		return this.handleFollowCoach()
	}

	render() {
		const {
			user,
			coach,
			fetchSpecificTrainerFutureCoachings,
			onCancel,
			loadUser,
			t
		} = this.props
		const {
			userName,
			sports,
			bio,
			avatarUrl,
			_id,
			// coachComments
		} = coach
		const {
			selectedCoaching,
			isLoading,
			isRefreshing,
			coachings,
			coachingsSkip,
			coachComments,
			isSharingCoachProfile
		} = this.state

		const isFollowingCoach = coach && user.following.find(
			followedCoach => followedCoach._id === coach._id
		)
		const isFollowingCoachWording = isFollowingCoach ? capitalize(t('unfollow')) : capitalize(t('follow'))

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

		const isDefaultProfilePic = avatarUrl === 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1623317757/VonageApp/avatar/noun_avatar_2309777_jhlofy.png'

		return (
			<div className='coach-profile-container'>
				<div
					style={{
						width: '98.5%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-end',
						alignItems: 'center'
					}}
					onClick={onCancel}
					className='hover desktop-only'
				>
					<Close
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
				</div>
				<div className='scroll-div-vertical'>
					<div className='coach-profile-row'>
						<div
							className='mobile-coach-image'
							style={{
								position: 'relative',
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
								backgroundImage: `url(${avatarUrl})`,
								backgroundSize: 'cover'
							}}>
							<div
								style={{
									margin: '10px',
									zIndex: 1000,
									backgroundColor: 'transparent',
									position: 'absolute',
									top: 0,
									right: 0
								}}
								className='mobile-only'
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
						</div>
						<div className='coach-profile-column'>
							<div className='profile-title-row'>
								<span className='small-title citrusBlack'>
									{capitalize(userName)}
								</span>
								<div
									className='filled-button hover desktop-only'
									style={{ width: '90px', height: '25px', marginLeft: '10px' }}
									onClick={this.handleSubmit}
								>
									<span className='smaller-text-bold citrusWhite'>
										{isFollowingCoachWording}
									</span>
								</div>
								<div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
									<span
										className='small-text-bold citrusGrey hover'
										onClick={() => this.setState({ isSharingCoachProfile: true })}
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
							<div className='small-separator'></div>
							{bio && bio.length > 0 &&
								<span className='small-text citrusBlack'>
									{capitalize(bio)}
								</span>
							}
							<div className='small-separator'></div>
							{
								sports && sports.length > 0 &&
								<div style={{ display: 'flex', width: '100%', flexWrap: 'wrap' }}>
									{
										sports.map((sport, i) => (
											<Tag
												key={i}
												textValue={capitalize(t(sport.type))}
												defaultTextValue={t('noneYet')}
											/>
										))
									}
								</div>
							}
						</div>
					</div>
					<div className='category-block coaching-block-mobile'>
						<span className='small-title citrusBlack'>
							{capitalize(t('coachings'))}
						</span>
						<div className='small-separator'></div>
						{
							coachings && coachings.length > 0 ?
								<>
									<div className='flex-row-cards'>
										{
											coachings.slice(0, coachingsSkip).map((coaching, i) => (
												<Card
													onClick={() => this.setState({ selectedCoaching: coaching })}
													size='medium'
													key={i}
													title={titleCase(coaching.title)}
													subtitle={capitalize(t(coaching.sport))}
													imgUri={coaching.pictureUri}
												/>
											))
										}
										{
											!(coachingsSkip >= coachings.length) &&
											<div
												className='mobile-only'
												style={{
													height: '100%',
													minWidth: '115px',
													marginRight: '15px',
													paddingBottom: '50px'
												}}
											>
												<span
													className='small-text-bold citrusGrey hover'
													style={{
														borderBottom: '1px solid #C2C2C2',
														paddingBottom: '2px',
														width: '100%',
														display: 'block'
													}}
													onClick={() => {
														this.setState({ coachingsSkip: coachingsSkip + 3 })
													}}
												>
													{capitalize(t('moreCoachings'))}
												</span>
											</div>
										}
									</div>
									{
										!(coachingsSkip >= coachings.length) &&
										<div
											className='desktop-only'
											style={{ width: '100%' }}
										>
											<div className='medium-separator'></div>
											<div className='desktop-load-more'>
												<span
													className='small-text-bold citrusGrey hover'
													style={{
														borderBottom: '1px solid #C2C2C2',
														paddingBottom: '2px'
													}}
													onClick={() => {
														this.setState({ coachingsSkip: coachingsSkip + 3 })
													}}
												>
													{capitalize(t('moreCoachings'))}
												</span>
											</div>
										</div>
									}
								</> :
								<span className='small-text citrusBlack'>
									{capitalize(t('noneYet'))}
								</span>
						}
					</div>
					{
						coachComments && coachComments.length > 0 ?
						<>
							<div
								className='category-block coaching-block-mobile'
								style={{ minHeight: '150px' }}
							>
								<div className='small-separator'></div>
								<div className='medium-separator'></div>
									<span className='small-title citrusBlack'>
										{capitalize(t('coachingRatingsOfThisCoach'))}
									</span>
									<div className='medium-separator'></div>
								{
									coachComments.map((com, i) => (
										<div className='flex-column' key={i}>
											<div
												className='flex-row'
												style={{ alignItems: 'center' }}
											>
												<span
													className='smaller-text-bold citrusGrey'
													style={{ margin: '0 10px 0 0' }}
												>
													{capitalize(com.userName)}
												</span>
												<Rating
													precision={0.5}
													size='small'
													value={com.rating}
													readOnly
												/>
											</div>
											<div className='small-separator'></div>
											<div className='flex-row'>
												{/* <span
													className='smaller-text-bold citrusGrey'
													style={{ marginRight: '5px' }}
												>
													{capitalize(t('comment'))} :
												</span> */}
												<span className='small-text-bold citrusBlack'>
													{capitalize(com.coachComment)}
												</span>
											</div>
											{
												coachComments.length > 1 ?
												<>
													<div className='medium-separator'></div>
													<div style={{ height: '1px', maxWidth: '454px', width: '100%', backgroundColor: '#C2C2C2' }}></div>
													<div className='medium-separator'></div>
												</> : null
											}
										</div>
									))
								}
							</div>
						</> : null
					}
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div
						className='filled-button button-mobile mobile-only-flex'
						onClick={this.handleSubmit}
					>
						<span className='small-title citrusWhite'>
							{isFollowingCoachWording}
						</span>
					</div>
				</div>
				{
					selectedCoaching &&
					<Dialog
						open={selectedCoaching ? true : false}
						onClose={() => this.setState({ selectedCoaching: null })}
					>
						<div
							className='dialog-modal'
							style={{ overflowY: 'auto' }}
						>
							<Coaching
								coaching={selectedCoaching}
								onCancel={() => this.setState({ selectedCoaching: null })}
								isMyCoaching={false}
								onCoachingDeleted={() => { }}
							/>
						</div>
					</Dialog>
				}
				{
					isSharingCoachProfile &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isSharingCoachProfile: false })}
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
									onClick={() => this.setState({ isSharingCoachProfile: false })}
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
												`https://app.thecitrusapp.com/explore?coach=${coach._id}`
											)
											setNotification({ message: capitalize(t('copied')) })
											this.setState({ isSharingCoaching: false })
										}}
									>
										{`https://app.thecitrusapp.com/explore?coach=${coach._id}`}
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

const mapStateToProps = state => ({
	user: state.auth.user,
	userInfo: state.auth.userInfo,
	trainerCoachings: state.coachings.trainerCoachings
})

const mapDispatchToProps = dispatch => ({
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	fetchUserInfo: id => dispatch(fetchUserInfo(id)),
	createFollower: properties => dispatch(createFollower(properties)),
	deleteFollower: (followedId, followerId) => dispatch(deleteFollower(followedId, followerId)),
	createNotification: notification => dispatch(createNotification(notification)),
	loadUser: () => dispatch(loadUser()),
	setNotification: notification => dispatch(setNotification(notification))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CoachProfile))