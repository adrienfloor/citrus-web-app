import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import ProgressBar from '@ramonak/react-progress-bar'
import { Dialog, Tooltip } from '@material-ui/core'
import { Link } from 'react-router-dom'
import qs from 'query-string'

import Coaching from './coaching'
import CoachProfile from './coach-profile'
import Cashout from '../web-app/payments/cash-out'
import LegalUserCreation from '../web-app/payments/cash-out-legal-user-form'
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
	fetchMpUserCredits,
	fetchMpUserInfo
} from '../../services/mangopay'

import {
	capitalize,
	returnTheHighestOccurrence,
	returnCurrency,
	returnUserStatus,
	returnUserStatusProgressBarColor,
	returnUserStatusProgressBar,
	returnTotalLengthOfActivities
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
			myCoachingsSkip: 3,
			currentGains: null,
			credits: null,
			mpLegalUserInfo: null,
			isLegalUserFullyCreated: false,
			isVideoPlaying: false
		}

		tabs = [
			this.props.t('training'),
			this.props.t('coaching')
		]

		this.handleTabSelection = this.handleTabSelection.bind(this)
		this.returnTopActivities = this.returnTopActivities.bind(this)
		this.legalUserFullyCreated = this.legalUserFullyCreated.bind(this)
	}

	componentDidMount() {
		const {
			location,
			user,
			userReplays
		} = this.props

		const coachingId = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
		const play = qs.parse(location.search, { ignoreQueryPrefix: true }).play

		if(coachingId) {
			this.setState({
				selectedCoaching: user.myReplays.find(coaching => coaching._id === coachingId)
			})
		}

		if(play) {
			this.setState({ isVideoPlaying: true })
		}

		if(user.MPUserId) {
			fetchMpUserCredits(user.MPUserId)
			.then(credits => this.setState({ credits }))
		}

		if(user.MPLegalUserId) {
			fetchMpUserCredits(user.MPLegalUserId)
			.then(currentGains => this.setState({ currentGains }))
			fetchMpUserInfo(user.MPLegalUserId)
			.then(mpLegalUserInfo => {
				this.legalUserFullyCreated(mpLegalUserInfo)
				this.setState({ mpLegalUserInfo })
			})
		}
	}

	handleTabSelection(tab, index) {
		const { history, location } = this.props

		const tabQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).tab
		const coachingQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching

		if(index === 0 && (tabQuery === 'coaching' || coachingQuery )) {
			history.push('/home')
		}
		if (index === 1 && tabQuery !== 'coaching') {
			history.push('/home?tab=coaching')
		}
		this.setState({
			activeTabIndex: index,
			activeTabName: tab
		})
	}

	returnTopActivities() {
		const { user, t } = this.props
		const activitiesAttendedNames = user.myReplays.map(activity => activity.sport)
		const topActivities = returnTheHighestOccurrence(activitiesAttendedNames)
		return capitalize(t(topActivities))
	}

	legalUserFullyCreated(mpLegalUserInfo) {
		const {
			Name,
			CompanyNumber,
			Email,
			PersonType,
			LegalRepresentativeBirthday,
			LegalRepresentativeCountryOfResidence,
			LegalRepresentativeEmail,
			LegalRepresentativeFirstName,
			LegalRepresentativeLastName,
			LegalRepresentativeNationality,
			HeadquartersAddress,
			LegalRepresentativeAddress
		} = mpLegalUserInfo

		if(
			!Name ||
			!CompanyNumber ||
			!Email ||
			!PersonType ||
			!LegalRepresentativeBirthday ||
			!LegalRepresentativeCountryOfResidence ||
			!LegalRepresentativeEmail ||
			!LegalRepresentativeFirstName ||
			!LegalRepresentativeLastName ||
			!LegalRepresentativeNationality ||
			!HeadquartersAddress ||
			!HeadquartersAddress.AddressLine1 ||
			!HeadquartersAddress.City ||
			!HeadquartersAddress.Country ||
			!HeadquartersAddress.PostalCode ||
			!LegalRepresentativeAddress ||
			!LegalRepresentativeAddress.AddressLine1 ||
			!LegalRepresentativeAddress.City ||
			!LegalRepresentativeAddress.Country ||
			!LegalRepresentativeAddress.PostalCode
		) {
			return this.setState({ isLegalUserFullyCreated: false})
		}
		this.setState({ isLegalUserFullyCreated: true })
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
			// totalLengthOfActivities,
			// numberOfDailyActivitiesInARow,
			// averageFeeling,
			myReplays,
			lifeTimeGains,
			MPLegalUserId,
			subscription
		} = user
		const {
			isLoading,
			selectedCoach,
			activeTabIndex,
			activeTabName,
			selectedCoaching,
			isMenuOpen,
			isCashingOut,
			userReplaysSkip,
			followingsSkip,
			myCoachingsSkip,
			credits,
			currentGains,
			mpLegalUserInfo,
			isLegalUserFullyCreated,
			isVideoPlaying
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
															onClick={() => this.setState({ selectedCoaching: activity })}
															size='medium'
															key={i}
															title={capitalize(activity.title)}
															subtitle={`${capitalize(t(activity.sport))} ${t('with')} ${capitalize(activity.coachUserName)}`}
															imgUri={activity.pictureUri}
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
											<div className='small-separator'></div>
											<PlusButton
												width={90}
												height={90}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<span className='small-title citrusBlack'>
												{capitalize(t('noTrainingsYet'))}
											</span>
											<div className='small-separator'></div>
											<div className='light-button plus-button'>
												<span className='small-title citrusBlue'>
													{capitalize(t('checkoutTrainings'))}
												</span>
											</div>
											<div className='medium-separator'></div>
										</Link>
								}
							</div>

							{/* YOUR FAVOURITE COACHES */}
							{
								following && following.length > 0 ?
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
								</div> :
								<div className='small-separator'></div>
							}

							{/* ACHIEVEMENTS */}
							<div className='category-block stats-container'>
								<div className='stats'>
									{
										subscription &&
										<>
											<span className='small-title citrusBlack'>
												{capitalize(t('currentBalance'))}
											</span>
											<div className='small-separator'></div>
											<div className='stats-row'>
												<div className='stats-column'>
													<span className='big-number'>
														{credits || 0}
													</span>
													<span className='small-title citrusGrey'>
														{capitalize(t('remainingCredits'))}
													</span>
												</div>
											</div>
											<div className='medium-separator'></div>
											<div className='medium-separator'></div>
										</>
									}
									{
										!subscription && credits > 0 &&
										<>
											<span className='small-title citrusBlack'>
												{capitalize(t('plan'))}
											</span>
											<div className='small-separator'></div>
											<div className='stats-row'>
												<div className='stats-column'>
													<span className='big-number'>
														{credits}
													</span>
													<span className='small-title citrusGrey'>
														{capitalize(t('remainingCredits'))}
													</span>
												</div>
											</div>
											<div className='medium-separator'></div>
											<div className='medium-separator'></div>
										</>
									}
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
														backgroundColor: returnUserStatusProgressBarColor(myReplays.length),
														borderRadius: 50,
														width: 19,
														height: 19,
														marginRight: 10
													}}
												>
												</div>
												<span className='smaller-text-bold'>
													{capitalize(t(returnUserStatus(myReplays.length).status))}
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
													{`${myReplays.length} / ${returnUserStatusProgressBar(myReplays.length)}`}
												</span>
											</div>
										</div>
										<div className='small-separator'></div>
										<ProgressBar
											completed={(myReplays.length / returnUserStatusProgressBar(myReplays.length)) * 100}
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
												{myReplays.length}
											</span>
											<span className='small-title citrusGrey'>
												{capitalize(t('totalTrainings'))}
											</span>
										</div>
										<div className='stats-column'>
											<span className='big-number'>
												{/* {totalLengthOfActivities} */}
												{returnTotalLengthOfActivities(user.myReplays)}
											</span>
											<span className='small-title citrusGrey'>
												{capitalize(t('totalMinutes'))}
											</span>
										</div>
										<div className='stats-column'></div>
										{/* <div className='stats-column'>
											<span className='big-number'>
												{averageFeeling}
											</span>
											<span className='small-title citrusGrey'>
												{capitalize(t('feelingAverage'))}
											</span>
										</div> */}
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
											<div className='small-separator'></div>
											<PlusButton
												width={90}
												height={90}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<span className='small-title citrusBlack'>
												{capitalize(t('noCoachingsYet'))}
											</span>
											<div className='small-separator'></div>
											<div className='light-button plus-button'>
												<span className='small-title citrusBlue'>
													{capitalize(t('uploadFile'))}
												</span>
											</div>
											<div className='medium-separator'></div>
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
										{/* <div className='stats-column'>
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
										</div> */}
										<div className='stats-column'>
											<span className='big-number'>
												{returnTotalLengthOfActivities(myCoachings)}
											</span>
											<span className='small-title citrusGrey'>
												{capitalize(t('totalMinutes'))}
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

									{ /* TAKE IT FROM HERE */ }

									{
										user.isCoach && currentGains >= 100 ?
											<div
												className='filled-button cashout-button'
												onClick={() => this.setState({ isCashingOut: true })}
											>
												<span className='small-title citrusWhite'>
													{capitalize(t('withdrawNow'))}
												</span>
											</div> :
											<Tooltip
												title={capitalize(t('withdrawTooltipDisclaimer'))}
											>
												<div
													className='disabled-button cashout-button'
													onClick={() => {}}
												>
													<span className='small-title' style={{ color: '#D8D8D7' }}>
														{capitalize(t('withdrawNow'))}
													</span>
												</div>
											</Tooltip>
									}

									{ /* END HERE */}

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
						onClose={() => {
							this.handleTabSelection(activeTabName, activeTabIndex)
							this.setState({ selectedCoaching: null })
						}}
					>
						<div
							className='dialog-modal'
							style={{ overflowY: 'auto' }}
						>
							<Coaching
								isVideoPlaying={isVideoPlaying}
								coaching={selectedCoaching}
								onCancel={() => {
									this.handleTabSelection(activeTabName, activeTabIndex)
									this.setState({ selectedCoaching: null })
								}}
								isMyCoaching={user._id === selectedCoaching.coachId}
								isMyUnratedReplay={ selectedCoaching && !selectedCoaching.myRating}
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
				{
					isCashingOut &&
					<Dialog
						open={true}
						onClose={() => this.setState({ isCashingOut: false })}
					>
						<div className='full-width-and-height-dialog'>
							{
								MPLegalUserId && isLegalUserFullyCreated ?
								<Cashout
									mpLegalUserInfo={mpLegalUserInfo || {}}
									onCancel={() => this.setState({ isCashingOut: false })}
								/> :
								<LegalUserCreation
									onUserCreated={mpLegalUserId => {
										fetchMpUserInfo(mpLegalUserId)
										.then(mpLegalUserInfo => {
											this.setState({
												isLegalUserFullyCreated: true,
												isCashingOut: true,
												mpLegalUserInfo
											})
										})
									}}
									mpLegalUserInfo={mpLegalUserInfo || {}}
									onCancel={() => this.setState({ isCashingOut: false })}
								/>
							}
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