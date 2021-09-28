import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import io from 'socket.io-client'
import Loader from 'react-loader-spinner'
import Dialog from '@material-ui/core/Dialog'

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

import {
	capitalize
} from '../../utils/various'

import { fetchTrainerCoachings } from '../../actions/coachings-actions'
import {
	fetchUserInfo,
	updateUser,
	createFollower,
	deleteFollower,
	loadUser
} from '../../actions/auth-actions'
// import { createNotification } from '../../actions/notifications-actions'
import { setAppScreen } from '../../actions/navigation-actions'

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
			_id
		} = coach

		this.state = {
			isLoading: false,
			isRefreshing: false,
			coachings: []
		}

		this.loadCoachInfo()

		this.loadCoachInfo = this.loadCoachInfo.bind(this)
		// this.alertWithType = this.alertWithType.bind(this)
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
			coach,
			t
		} = this.props

		if (!followedId || !followerId) {
			return createFollower({
				follower: user,
				followee: coach
			})
				.then(res => {
					if (res.payload.msg === 'New follower') {
						this.alertWithType(
							capitalize(t('myCoachs')),
							capitalize(`${t('youreNowFollowing')} ${coach.userName}`)
						)
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
					this.alertWithType(
						capitalize(t('myCoachs')),
						capitalize(`${t('youveUnfollowed')} ${coach.userName}`)
					)
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
			updateUser,
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
			_id
		} = coach
		const {
			selectedCoaching,
			isLoading,
			isRefreshing,
			coachings
		} = this.state

		const isFollowingCoach = coach && user.following.find(
			followedCoach => followedCoach._id === coach._id
		)
		const isFollowingCoachWording = isFollowingCoach ? capitalize(t('unfollow')) : capitalize(t('follow'))

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

		const isDefaultProfilePic = avatarUrl === 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1623317757/VonageApp/avatar/noun_avatar_2309777_jhlofy.png'

		return (
			<div className='main-container'>
				<div
					style={{
						width: '100%',
						height: '50px',
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center'
					}}
					onClick={onCancel}
					className='hover'
				>
					<CaretBack
						width={25}
						height={25}
						stroke={'#C2C2C2'}
						strokeWidth={2}
					/>
					<span className='small-text citrusGrey'>
						{capitalize(t('back'))}
					</span>
				</div>
				<div className='scroll-div-vertical'>
					<div className='profile-row'>
						<div
							style={{
								backgroundPosition: 'center',
								backgroundRepeat: 'no-repeat',
								backgroundImage: `url(${avatarUrl})`,
								backgroundSize: 'cover',
								width: '300px',
								height: '300px'
							}}>
						</div>
						<div
							style={{ paddingLeft: '30px', maxWidth: '600px' }}
							className='profile-column'
						>
							<div className='profile-title-row'>
								<span className='small-title citrusBlack'>
									{capitalize(userName)}
								</span>
								<div
									className='filled-button hover'
									style={{ width: '90px', height: '25px', marginLeft: '10px' }}
									onClick={this.handleSubmit}
								>
									<span className='smaller-text-bold citrusWhite'>
										{isFollowingCoachWording}
									</span>
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
					<div className='category-block'>
						<span className='small-title citrusBlack'>
							{capitalize(t('coachings'))}
						</span>
						<div className='small-separator'></div>
						{
							coachings && coachings.length > 0 ?
								<div className='scroll-div-horizontal'>
									{
										coachings.map((coaching, i) => (
											<Card
												onClick={() => this.setState({ selectedCoaching: coaching })}
												size='medium'
												key={i}
												title={capitalize(coaching.title)}
												subtitle={capitalize(t(coaching.sport))}
												imgUri={coaching.pictureUri}
											/>
										))
									}
								</div> :
								<span className='small-text citrusBlack'>
									{capitalize(t('noneYet'))}
								</span>
						}
					</div>
					<div className='small-separator'></div>
				</div>
				{
					selectedCoaching &&
					<Dialog
						open={selectedCoaching}
						onClose={() => this.setState({ selectedCoaching: null })}
					>
						<div style={{ maxWidth: '800px' }}>
							<Coaching
								coaching={selectedCoaching}
								onCancel={() => this.setState({ selectedCoaching: null })}
								isMyCoaching={false}
								onCoachingDeleted={() => { }}
							/>
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
	updateUser: (userInfo) => dispatch(updateUser(userInfo)),
	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
	fetchUserInfo: id => dispatch(fetchUserInfo(id)),
	createFollower: properties => dispatch(createFollower(properties)),
	deleteFollower: (followedId, followerId) => dispatch(deleteFollower(followedId, followerId)),
	// createNotification: notification => dispatch(createNotification(notification)),
	loadUser: () => dispatch(loadUser()),
	setAppScreen: screen => dispatch(setAppScreen(screen))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CoachProfile))