import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import ProgressBar from '@ramonak/react-progress-bar'
import Dialog from '@material-ui/core/Dialog'

import Coaching from './coaching'
import CoachProfile from './coach-profile'
import Card from '../../components/web-app/card'
import Tag from '../../components/web-app/tag'

import { setAppScreen } from '../../actions/navigation-actions'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { ReactComponent as PlusButton } from '../../assets/svg/plus-button.svg'
import { ReactComponent as WavyCheck } from '../../assets/svg/wavy-check.svg'

import {
	capitalize,
	returnTheHighestOccurrence,
	returnCurrency,
	returnUserStatus,
	returnUserStatusProgressBarColor,
	returnUserStatusProgressBar
} from '../../utils/various'

let tabs = []

class Home extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isLoading: false,
			selectedCoach: null,
			selectedCoaching: null,
			activeTabName: '',
			activeTabName: this.props.t('training'),
			activeTabIndex: 0,
			isMenuOpen: false,
			isCashingOut: false
		}

		tabs = [
			this.props.t('training'),
			this.props.t('coaching')
		]

		this.handleTabSelection = this.handleTabSelection.bind(this)
		// this.alertWithType = this.alertWithType.bind(this)
		this.returnTopActivities = this.returnTopActivities.bind(this)
		// this.handleScroll = this.handleScroll.bind(this)
		// this.scrollToPreviousPosition = this.scrollToPreviousPosition.bind(this)
	}

	handleTabSelection(tab, index) {
		this.setState({
			activeTabIndex: index,
			activeTabName: tab
		})
	}

	returnTopActivities() {
		const activitiesAttendedNames = this.props.user.activitiesIHaveAttended.map(activity => activity.coaching.sport)
		const topActivities = returnTheHighestOccurrence(activitiesAttendedNames)
		return capitalize(topActivities)
	}

	render() {
		const {
			user,
			fetchUserInfo,
			setAppScreen,
			myCoachings,
			userReplays,
			t
		} = this.props
		const {
			following,
			coachRating,
			totalLengthOfActivities,
			numberOfDailyActivitiesInARow,
			averageFeeling,
			activitiesIHaveAttended,
			currentGains,
			lifeTimeGains
		} = user
		const {
			isLoading,
			selectedCoach,
			activeTabIndex,
			selectedCoaching,
			isMenuOpen,
			isCashingOut
		} = this.state

		if (isLoading || !user) {
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

		if (isCashingOut) {
			return null
			// return (
			// 	<CashOut
			// 		onCancel={() => this.setState({ isCashingOut: false })}
			// 	/>
			// )
		}

		if (selectedCoach) {
			return (
				<CoachProfile
					coach={selectedCoach}
					onCancel={() => {
						this.setState({ selectedCoach: null })
					}}
				/>
			)
		}

		return (
			<div className='main-container'>
				<div className='tabs-bar'>
					{
						tabs.map((tab, i) => (
							<div
								key={i}
								onClick={() => this.handleTabSelection(tab, i)}
							>
								<div className={activeTabIndex === i ? 'active-tab hover' : 'tab hover'}>
									<span
										className={
											activeTabIndex === i ?
												'big-title citrusBlack' :
												'big-title citrusGrey'
										}
									>
										{capitalize(tab)}
									</span>
								</div>
							</div>
						))
					}
				</div>
				{activeTabIndex === 0 ?
					<div className='scroll-div-vertical'>
						{/* NOTIFICATIONS */}
							{/* notifications && notifications.length > 0 &&
							<div className='scroll-div-horizontal'>
								{
									notifications && notifications.length > 0 && notifications.map((notification, i) => (
										<NotificationCard
											key={i}
											onClose={() => {
												deleteNotification(user._id, notification._id)
													.then(() => fetchNotifications(user._id))
											}}
											span={notification.message}
										/>
									))
								}
							</div> */}

						{/* MY REPLAYS */}
						<div className='category-block'>
							<span className='small-title citrusBlack paddingHorizontal'>
								{capitalize(t('myTrainings'))}
							</span>
							<div className='small-separator'></div>
							{
								userReplays && userReplays.length > 0 ?
									<div className='scroll-div-horizontal'>
										{
											userReplays.map((activity, i) => (
												<Card
													onClick={() => this.setState({ selectedCoaching: activity.coaching })}
													size='medium'
													key={i}
													title={capitalize(activity.coaching.title)}
													subtitle={`${capitalize(t(activity.coaching.sport))} ${t('with')} ${capitalize(activity.coaching.coachUserName)}`}
													imgUri={activity.coaching.pictureUri}
												/>
											))
										}
									</div> :
									<div className='padding-horizontal'>
										<div
											onClick={() => setAppScreen(2)}
											className='plus-container'
										>
											<PlusButton
												width={90}
												height={90}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<div className='light-button plus-button'>
												<span className='small-text-bold citrusBlue'>
													{capitalize(t('common.checkoutTrainings'))}
												</span>
											</div>
										</div>
									</div>
							}
						</div>

						{/* YOUR FAVOURITE COACHES */}
						{
							following && following.length > 0 &&
							<div className='category-block'>
								<span className='small-title citrusBlack paddingHorizontal'>
									{capitalize(t('myCoaches'))}
								</span>
								<div className='small-separator'></div>
								<div className='scroll-div-horizontal'>
									{
										following.map((coach, i) => (
											<Card
												onClick={() => this.setState({ selectedCoach: coach })}
												size='medium'
												key={i}
												title={capitalize(coach.userName)}
												subtitle={`${coach.numberOfFollowers} ${coach.numberOfFollowers > 1 ? t('followers') : t('follower')}`}
												imgUri={coach.avatarUrl}
											/>
										))
									}
								</div>
							</div>
						}

						{/* ACHIEVEMENTS */}
						<div className='category-block stats-container'>
							<div className='stats'>
								<span className='small-title citrusBlack'>
									{capitalize(t('achievements'))}
								</span>
								<div className='small-separator'></div>
								<div
									className='stats-row'
									style={{
										justifyContent: 'space-between',
										height: '25px'
									}}
								>
									<div
										className='stats-row'
										style={{ width: '50%' }}
									>
										<div
											style={{
												backgroundColor: returnUserStatusProgressBarColor(activitiesIHaveAttended.length),
												borderRadius: 50,
												width: 19,
												height: 19,
												marginRight: 10
											}}
										>
										</div>
										<span className='smaller-text-bold'>
											{capitalize(t(returnUserStatus(activitiesIHaveAttended.length).status))}
										</span>
									</div>
									<div
										className='stats-row'
										style={{
											justifyContent: 'flex-end',
											width: '50%'
										}}
									>
										<span className='smaller-text-bold'>
											{`${activitiesIHaveAttended.length} / ${returnUserStatusProgressBar(activitiesIHaveAttended.length)}`}
										</span>
									</div>
								</div>
								<div className='small-separator'></div>
								<ProgressBar
									completed={
										activitiesIHaveAttended.length /
										returnUserStatusProgressBar(activitiesIHaveAttended.length)
									}
									completed={returnUserStatusProgressBar(activitiesIHaveAttended.length)}
									height='10px'
									bgColor='#B4B4B4'
									baseBgColor='#FFFFFF'
									isLabelVisible={false}
								/>
								<div className='medium-separator'></div>
								<div className='medium-separator'></div>
								<span className='small-title citrusBlack'>
									{capitalize(t('topActivities'))}
								</span>
								<div className='small-separator'></div>
								<div className='stats-row'>
									<Tag
										textValue={this.returnTopActivities()}
										defaultspanValue={t('noTopActivitiesYet')}
									/>
								</div>
								<div className='medium-separator'></div>
								<div className='medium-separator'></div>
								<span className='small-title citrusBlack'>
									{capitalize(t('statistics'))}
								</span>
								<div className='small-separator'></div>
								<div className='stats-row'>
									<div className='stats-column'>
										<span className='big-number'>
											{activitiesIHaveAttended.length}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('totalTrainings'))}
										</span>
									</div>
									<div className='stats-column'>
										<span className='big-number'>
											{totalLengthOfActivities}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('totalMinutes'))}
										</span>
									</div>
									<div className='stats-column'>
										<span className='big-number'>
											{averageFeeling}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('feelingAverage'))}
										</span>
									</div>
								</div>
								<div className='small-separator'></div>
								<div className='medium-separator'></div>
							</div>
						</div>
					</div> :
					<div className='scroll-div-vertical'>
						{/* COACH PAST ACTIVITIES */}
						<div className='category-block'>
							<span className='small-title citrusBlack'>
								{capitalize(t('myCoachings'))}
							</span>
							<div className='small-separator'></div>
							{
								myCoachings && myCoachings.length > 0 ?
									<div className='scroll-div-horizontal'>
										{
											myCoachings.map((activity, i) => (
												<Card
													onClick={() => this.setState({ selectedCoaching: activity })}
													size='medium'
													key={i}
													title={capitalize(activity.title)}
													subtitle={capitalize(t(activity.sport))}
													imgUri={activity.pictureUri}
												/>
											))
										}
									</div> :
									<div
										onClick={() => setAppScreen(3)}
										className='plus-container'
									>
										<PlusButton
											width={90}
											height={90}
											stroke={'#FFFFFF'}
											strokeWidth={2}
										/>
										<div className='light-button plus-button'>
											<span className='small-text-bold citrusBlue'>
												{capitalize(t('common.startNow'))}
											</span>
										</div>
									</div>
							}
						</div>

						{/* STATISTICS */}
						<div className='category-block stats-container'>
							<div className='stats'>
								<span className='small-title citrusBlack'>
									{capitalize(t('statistics'))}
								</span>
								<div className='small-separator'></div>
								<div className='stats-row'>
									<div className='stats-column'>
										<span className='big-number'>
											{myCoachings.length}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('totalCoachings'))}
										</span>
									</div>
									<div className='stats-column'>
										<div
											style={{
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'flex-end',
												justifyContent: 'flex-start'
											}}
										>
											<span className='big-number' style={{ marginRight: '5px' }}>
												{coachRating}
											</span>
											<WavyCheck
												width={25}
												height={25}
												stroke={'#000000'}
												strokeWidth={2}
											/>
										</div>
										<span className='small-title citrusGrey'>
											{capitalize(t('notation'))}
										</span>
									</div>
								</div>
								<div className='medium-separator'></div>
								<div className='small-separator'></div>
								<span className='small-title citrusBlack'>
									{capitalize(t('payments'))}
								</span>
								<div className='small-separator'></div>
								<div className='stats-row'>
									<div className='stats-column'>
										<span className='big-number'>
											{`${currentGains || 0} ${returnCurrency(moment.locale())}`}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('currentSold'))}
										</span>
									</div>
									<div className='stats-column'>
										<span className='big-number'>
											{`${lifeTimeGains || 0} ${returnCurrency(moment.locale())}`}
										</span>
										<span className='small-title citrusGrey'>
											{capitalize(t('totalEarnings'))}
										</span>
									</div>
								</div>
								<div className='medium-separator'></div>
								<div className='small-separator'></div>
								<div
									className='filled-button'
									style={{ width: '195px' }}
									onClick={() => this.setState({ isCashingOut: true })}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('withdrawNow'))}
									</span>
								</div>
								<div className='small-separator'></div>
							</div>
						</div>
					</div>
				}
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
								isMyCoaching={user._id === selectedCoaching.coachId}
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
	myCoachings: state.coachings.myCoachings,
	userReplays: state.auth.userReplays
})

const mapDispatchToProps = (dispatch) => ({
	setAppScreen: screen => dispatch(setAppScreen(screen))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Home))