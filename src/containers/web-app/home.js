import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import ProgressBar from '@ramonak/react-progress-bar'
import Dialog from '@material-ui/core/Dialog'
import { Link } from 'react-router-dom'

import Coaching from './coaching'
import CoachProfile from './coach-profile'
import Card from '../../components/web-app/card'
import Tag from '../../components/web-app/tag'


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
		const { t, location } = this.props
		this.state = {
			isLoading: false,
			selectedCoach: null,
			selectedCoaching: null,
			activeTabName: location.search === '?tab=coaching' ? t('coaching') : t('training'),
			activeTabIndex: location.search === '?tab=coaching' ? 1 : 0,
			isMenuOpen: false,
			isCashingOut: false,
			userReplaysSkip: 3,
			followingsSkip: 3,
			myCoachingsSkip: 3
		}

		tabs = [
			this.props.t('training'),
			this.props.t('coaching')
		]

		this.handleTabSelection = this.handleTabSelection.bind(this)
		this.returnTopActivities = this.returnTopActivities.bind(this)
	}

	handleTabSelection(tab, index) {
		const { history, location } = this.props
		if(index === 0 && location.search === '?tab=coaching') {
			history.push('/home')
		}
		if (index === 1 && location.search !== '?tab=coaching') {
			history.push('/home?tab=coaching')
		}
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
			myCoachings,
			userReplays,
			t,
			history,
			location
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
			isCashingOut,
			userReplaysSkip,
			followingsSkip,
			myCoachingsSkip
		} = this.state

		if (isLoading || !user) {
			return (
				<div
					className='flex-column flex-center'
					style={{ height: '100%'}}
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

		if (isCashingOut) {
			return null
			// return (
			// 	<CashOut
			// 		onCancel={() => this.setState({ isCashingOut: false })}
			// 	/>
			// )
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
				<div className='upload-form card scroll-div-vertical home-container'>
					{activeTabIndex === 0 ?
						<div className='scroll-div-vertical'>
							{/* MY REPLAYS */}
							<div className='category-block'>
								<span className='small-title citrusBlack paddingHorizontal'>
									{capitalize(t('myTrainings'))}
								</span>
								<div className='small-separator'></div>
								{
									userReplays && userReplays.length > 0 ?
										<>
											<div className='flex-row-cards'>
												{
													userReplays.slice(0, userReplaysSkip).map((activity, i) => (
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
												{
													!(userReplaysSkip >= userReplays.length) &&
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
																this.setState({ userReplaysSkip: userReplaysSkip + 3 })
															}}
														>
															{capitalize(t('moreTrainings'))}
														</span>
													</div>
												}
											</div>
											{
												!(userReplaysSkip >= userReplays.length) &&
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
																this.setState({ userReplaysSkip: userReplaysSkip + 3 })
															}}
														>
															{capitalize(t('moreTrainings'))}
														</span>
													</div>
												</div>
											}
										</> :
										<Link to='/explore' className='empty-coaching-card hover'>
											<PlusButton
												width={180}
												height={180}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<div className='small-separator'></div>
											<span className='small-title citrusBlack'>
												{capitalize(t('noTrainingsYet'))}
											</span>
											<div className='small-separator'></div>
											<div className='light-button plus-button'>
												<span className='small-title citrusBlue'>
													{capitalize(t('checkoutTrainings'))}
												</span>
											</div>
											<div className='small-separator'></div>
										</Link>
								}
							</div>

							{/* YOUR FAVOURITE COACHES */}
							{
								following && following.length &&
								<div className='category-block'>
									<span className='small-title citrusBlack paddingHorizontal'>
										{capitalize(t('myCoaches'))}
									</span>
									<div className='small-separator'></div>
									<div className='flex-row-cards'>
										{
											following.slice(0, followingsSkip).map((coach, i) => (
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
										{
											!(followingsSkip >= following.length) &&
											<div
												className='mobile-only'
												style={{
													height: '100%',
													minWidth: '105px',
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
														this.setState({ followingsSkip: followingsSkip + 3 })
													}}
												>
													{capitalize(t('moreCoachs'))}
												</span>
											</div>
										}
									</div>
									{
										!(followingsSkip >= following.length) &&
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
														this.setState({ followingsSkip: followingsSkip + 3 })
													}}
												>
													{capitalize(t('moreCoachs'))}
												</span>
											</div>
										</div>
									}
								</div>
							}

							{/* ACHIEVEMENTS */}
							<div className='category-block stats-container'>
								<div className='stats'>
									<span className='small-title citrusBlack'>
										{capitalize(t('achievements'))}
									</span>
									<div className='small-separator'></div>
									<div className='progress-row'>
										<div
											className='stats-row'
											style={{
												justifyContent: 'space-between',
												height: '25px'
											}}
										>
											<div className='stats-row'>
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
											completed={(activitiesIHaveAttended.length / returnUserStatusProgressBar(activitiesIHaveAttended.length)) * 100}
											height='10px'
											bgColor='#B4B4B4'
											baseBgColor='#FFFFFF'
											isLabelVisible={false}
										/>
									</div>
									<div className='medium-separator'></div>
									<div className='medium-separator'></div>
									<span className='small-title citrusBlack'>
										{capitalize(t('topActivities'))}
									</span>
									<div className='small-separator'></div>
									<div className='stats-row'>
										<Tag
											textValue={this.returnTopActivities()}
											defaultTextValue={t('noTopActivitiesYet')}
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
							<div className='medium-separator'></div>
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
										<>
											<div className='flex-row-cards'>
												{
													myCoachings.slice(0, myCoachingsSkip).map((activity, i) => (
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
												{
													!(myCoachingsSkip >= myCoachings.length) &&
													<div
														className='mobile-only'
														style={{
															height: '100%',
															minWidth: '125px',
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
																this.setState({ myCoachingsSkip: myCoachingsSkip + 3 })
															}}
														>
															{capitalize(t('moreCoachings'))}
														</span>
													</div>
												}
											</div>
											{
												!(myCoachingsSkip >= myCoachings.length) &&
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
																this.setState({ myCoachingsSkip: myCoachingsSkip + 3 })
															}}
														>
															{capitalize(t('moreCoachings'))}
														</span>
													</div>
												</div>
											}
										</> :
										<Link to='/schedule' className='empty-coaching-card hover'>
											<PlusButton
												width={180}
												height={180}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<div className='small-separator'></div>
											<span className='small-title citrusBlack'>
												{capitalize(t('noCoachingsYet'))}
											</span>
											<div className='small-separator'></div>
											<div className='light-button plus-button'>
												<span className='small-title citrusBlue'>
													{capitalize(t('startNow'))}
												</span>
											</div>
											<div className='small-separator'></div>
										</Link>
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
										className='filled-button cashout-button'
										onClick={() => this.setState({ isCashingOut: true })}
									>
										<span className='small-title citrusWhite'>
											{capitalize(t('withdrawNow'))}
										</span>
									</div>
									<div className='small-separator'></div>
								</div>
							</div>
							<div className='medium-separator'></div>
						</div>
					}
				</div>
				{
					selectedCoaching &&
					<Dialog
						open={selectedCoaching ? true : false}
						onClose={() => this.setState({ selectedCoaching: null })}
					>
						<div className='dialog-modal'>
							<Coaching
								coaching={selectedCoaching}
								onCancel={() => this.setState({ selectedCoaching: null })}
								isMyCoaching={user._id === selectedCoaching.coachId}
							/>
						</div>
					</Dialog>
				}
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
	myCoachings: state.coachings.myCoachings,
	userReplays: state.auth.userReplays
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Home))