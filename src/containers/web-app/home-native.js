// import 'react-native-gesture-handler'
// import React from 'react'
// import { connect } from 'react-redux'
// import {
// 	View,
// 	StyleSheet,
// 	Text,
// 	ScrollView,
// 	TouchableOpacity,
// 	Dimensions,
// 	Alert,
// 	Linking,
// 	RefreshControl,
// 	SafeAreaView
// } from 'react-native'
// import { Spinner, Icon } from 'native-base'
// import moment from 'moment'
// import 'moment/locale/fr'
// import 'moment/locale/en-gb'
// import { TouchableHighlight } from 'react-native-gesture-handler'
// import { withInAppNotification } from 'react-native-in-app-notification'
// import Video from 'react-native-video'
// import * as Progress from 'react-native-progress'

// import i18n from 'i18n-js'
// import io from 'socket.io-client'
// import NetInfo from '@react-native-community/netinfo'
// import { colorStyles } from '../../../assets/styles/colors'
// import { headingStyles } from '../../../assets/styles/headings'
// import { spacingStyles } from '../../../assets/styles/spacings'
// import { buttonStyles } from '../../../assets/styles/buttons'
// import PlusButton from '../../assets/icons/svg/plus.svg'

// import SetUpMyZone from './sub-my-zone/zone-set-up/set-up-my-zone'
// import Coaching from '../common/coaching'
// import CoachProfile from '../profile/coach-profile'
// import Tag from '../../components/tag'
// import Card from '../../components/card'
// import NotificationCard from '../../components/notification-card'
// import CashOut from './cash-out'

// import {
// 	capitalize,
// 	uppercase,
// 	titleCase,
// 	returnUserStatus,
// 	returnUserStatusProgressBar,
// 	returnUserStatusProgressBarColor,
// 	returnTheHighestOccurrence,
// 	returnCurrency
// } from '../../utils/various'

// import {
// 	loadUser,
// 	fetchUserInfo,
// 	fetchUpcomingActivities,
// 	fetchUserReplays
// } from '../../actions/auth-actions'
// import {
// 	fetchNotifications,
// 	updateNotification,
// 	createNotification,
// 	deleteNotification
// } from '../../actions/notifications-actions'
// import {
// 	removeCoachingFromMySchedule,
// 	// fetchTrainerPastCoachings
// 	fetchTrainerCoachings
// } from '../../actions/coachings-actions'
// import {
// 	selectScreen,
// 	setOverlayMode,
// 	setFooterNavMode,
// 	setHasInternetConnection
// } from '../../actions/navigation-actions'

// import WavyCheck from '../../../assets/icons/svg/circle-wavy-check.svg'

// import { SERVER_URL } from '../../../env.json'

// const deviceWidth = Dimensions.get("window").width
// const deviceHeight = Dimensions.get("window").height

// let tabs = []

// class MyZone extends React.Component {
// 	constructor(props) {
// 		super(props)
// 		this.state = {
// 			isLoading: false,
// 			selectedCoach: null,
// 			selectedCoaching: null,
// 			isSettingUpZone: false,
// 			activeTabName: i18n.t('trainee.myPath.myPath'),
// 			activeTabIndex: 0,
// 			isRefreshing: false,
// 			isMenuOpen: false,
// 			isCashingOut: false,
// 			scrollPosition1: 0,
// 			scrollPosition2: 0,
// 			scrollPosition3: 0,
// 			scrollPosition4: 0,
// 			scrollPosition5: 0,
// 			scrollPosition6: 0,
// 			scrollPosition7: 0,
// 			scrollPosition8: 0
// 		}
// 		const {
// 			user,
// 			createNotification,
// 			deleteNotification
// 		} = this.props

// 		tabs = [
// 			i18n.t('trainee.myZone.training'),
// 			i18n.t('trainee.myZone.coaching')
// 		]
// 		this.handleTabSelection = this.handleTabSelection.bind(this)
// 		this.alertWithType = this.alertWithType.bind(this)
// 		this.onRefresh = this.onRefresh.bind(this)
// 		this.returnTopActivities = this.returnTopActivities.bind(this)
// 		this.handleScroll = this.handleScroll.bind(this)
// 		this.scrollToPreviousPosition = this.scrollToPreviousPosition.bind(this)
// 	}

// 	componentDidMount() {
// 		const { user } = this.props
// 		this.socket = io(SERVER_URL)
// 		// LISTENER
// 		this.socket.on('new notification', notification => {
// 			if (user._id === notification.userId) {
// 				return fetchNotifications(user._id)
// 			}
// 		})

// 		const locale = i18n.locale
// 		if (locale == 'fr') {
// 			moment.updateLocale(locale, {
// 				calendar: {
// 					sameDay: "[aujourd'hui]",
// 					nextDay: '[demain]',
// 					nextWeek: 'dddd',
// 					lastDay: '[hier]',
// 					lastWeek: 'dddd [dernier]',
// 					sameElse: 'dddd MM'
// 				}
// 			})
// 		} else {
// 			moment.updateLocale(locale, {
// 				calendar: {
// 					sameDay: '[today]',
// 					nextDay: '[tomorrow]',
// 					nextWeek: 'dddd',
// 					lastDay: '[yesterday]',
// 					lastWeek: '[Last] dddd',
// 					sameElse: 'dddd MM'
// 				}
// 			})
// 		}
// 	}

// 	componentWillUnmount() {
// 		const {
// 			notifications,
// 			user,
// 			updateNotification,
// 			fetchNotifications
// 		} = this.props
// 		const unSeenNotifications = notifications.length ? notifications.filter(
// 			notification => {
// 				if (notification.seen === false) {
// 					return notification
// 				}
// 			}
// 		) : []
// 		for (let i = 0; i < unSeenNotifications.length; i++) {
// 			const id = unSeenNotifications[i]._id
// 			if (i === unSeenNotifications.length - 1) {
// 				updateNotification(id)
// 					.then(res => {
// 						fetchNotifications(user.id || user._id)
// 					})
// 				return
// 			}
// 			updateNotification(id)
// 		}
// 	}

// 	handleScroll(e, key, horizontal) {
// 		this.setState({
// 			[`scrollPosition${key}`]: horizontal ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y
// 		})
// 	}

// 	scrollToPreviousPosition(scrollPositionRef, horizontal) {
// 		const xValue = horizontal ? this.state[`scrollPosition${scrollPositionRef}`] : 0
// 		const yValue = horizontal ? 0 : this.state[`scrollPosition${scrollPositionRef}`]
// 		return setTimeout(() => {
// 			this.refs[`_scrollView${scrollPositionRef}`].scrollTo({
// 				x: xValue,
// 				y: yValue,
// 				animated: false
// 			})
// 		}, 10)
// 	}

// 	async onRefresh() {

// 		const {
// 			user,
// 			fetchNotifications,
// 			fetchUpcomingActivities,
// 			// fetchTrainerPastCoachings,
// 			fetchTrainerCoachings,
// 			fetchUserReplays,
// 			loadUser,
// 			setHasInternetConnection
// 		} = this.props
// 		const userId = user._id

// 		this.setState({ isRefreshing: true })

// 		const userReponse = await loadUser()
// 		// const upcomingActivitiesResponse = await fetchUpcomingActivities(userId)
// 		const userReplays = await fetchUserReplays(userId)
// 		// const trainerPastCoachingsResponse = await fetchTrainerPastCoachings(userId)
// 		const myCoachingsResponse = await fetchTrainerCoachings(userId, true)
// 		const notificationsResponse = await fetchNotifications(userId)
// 		const hasInternetConnection = await NetInfo.fetch()

// 		if (hasInternetConnection.isConnected) {
// 			setHasInternetConnection(true)
// 		} else {
// 			setHasInternetConnection(false)
// 		}

// 		if (
// 			userReponse &&
// 			// upcomingActivitiesResponse &&
// 			userReplays &&
// 			// trainerPastCoachingsResponse &&
// 			myCoachingsResponse &&
// 			notificationsResponse ||
// 			!hasInternetConnection.isConnected
// 		) {
// 			this.setState({ isRefreshing: false })
// 		}
// 	}

// 	alertWithType(title, message) {
// 		this.props.showNotification({
// 			title,
// 			message,
// 			onPress: () => { }
// 		})
// 	}

// 	handleTabSelection(tab, index) {
// 		this.setState({
// 			activeTabIndex: index,
// 			activeTabName: tab
// 		})
// 	}

// 	returnTopActivities() {
// 		const activitiesAttendedNames = (this.props.user.activitiesIHaveAttended || []).map(activity => activity.coaching.sport)
// 		const topActivities = returnTheHighestOccurrence(activitiesAttendedNames)
// 		return capitalize(topActivities)
// 	}

// 	render() {
// 		const {
// 			notifications,
// 			user,
// 			upcomingActivities,
// 			fetchUserInfo,
// 			selectScreen,
// 			// trainerPastCoachings,
// 			myCoachings,
// 			userReplays,
// 			setOverlayMode,
// 			setFooterNavMode,
// 			deleteNotification,
// 			fetchNotifications
// 		} = this.props
// 		const {
// 			following,
// 			hasSetUpZone,
// 			coachRating,
// 			totalLengthOfActivities,
// 			numberOfDailyActivitiesInARow,
// 			averageFeeling,
// 			activitiesIHaveAttended,
// 			currentGains,
// 			lifeTimeGains
// 		} = user
// 		const {
// 			isLoading,
// 			isSettingUpZone,
// 			selectedCoach,
// 			activeTabIndex,
// 			selectedCoaching,
// 			isRefreshing,
// 			isMenuOpen,
// 			scrollPosition,
// 			isCashingOut
// 		} = this.state

// 		if (isLoading) {
// 			return (
// 				<View style={styles.spinnerContainer}>
// 					<Spinner color="#0075FF" />
// 				</View>
// 			)
// 		}

// 		if (isCashingOut) {
// 			return (
// 				<CashOut
// 					onCancel={() => this.setState({ isCashingOut: false })}
// 				/>
// 			)
// 		}

// 		if (selectedCoach) {
// 			return (
// 				<CoachProfile
// 					coach={selectedCoach}
// 					onCancel={() => {
// 						this.setState({ selectedCoach: null })
// 						this.scrollToPreviousPosition(1)
// 						{/* if(upcomingActivities && upcomingActivities.length > 0) {
// 							this.scrollToPreviousPosition(2, true)
// 						} */}
// 						if (userReplays && userReplays.length > 0) {
// 							this.scrollToPreviousPosition(4, true)
// 						}
// 						{/* if (activitiesIHaveAttended && activitiesIHaveAttended.length > 0) {
// 							this.scrollToPreviousPosition(5, true)
// 						} */}
// 						if (following && following.length > 0) {
// 							this.scrollToPreviousPosition(6, true)
// 						}
// 					}}
// 				/>
// 			)
// 		}

// 		if (selectedCoaching) {
// 			return (
// 				<Coaching
// 					coaching={selectedCoaching}
// 					onCancel={() => {
// 						this.setState({
// 							selectedCoaching: null
// 						})
// 						if (activeTabIndex === 0) {
// 							this.scrollToPreviousPosition(1)
// 							{/* if (upcomingActivities && upcomingActivities.length > 0) {
// 								this.scrollToPreviousPosition(2, true)
// 							} */}
// 							if (userReplays && userReplays.length > 0) {
// 								this.scrollToPreviousPosition(4, true)
// 							}
// 							{/* if (activitiesIHaveAttended && activitiesIHaveAttended.length > 0) {
// 								this.scrollToPreviousPosition(5, true)
// 							} */}
// 							if (following && following.length > 0) {
// 								this.scrollToPreviousPosition(6, true)
// 							}
// 						} else {
// 							this.scrollToPreviousPosition(7)
// 							{/* if (trainerPastCoachings && trainerPastCoachings.length > 0 ) {
// 								this.scrollToPreviousPosition(8, true)
// 							} */}
// 							if (myCoachings && myCoachings.length > 0) {
// 								this.scrollToPreviousPosition(8, true)
// 							}
// 						}
// 					}}
// 					isMyCoaching={user._id === selectedCoaching.coachId}
// 				/>
// 			)
// 		}

// 		return (
// 			<View style={styles.mainContainer}>
// 				<SafeAreaView>
// 					<View style={styles.tabsBar}>
// 						{
// 							tabs.map((tab, i) => (
// 								<TouchableOpacity
// 									key={i}
// 									onPress={() => this.handleTabSelection(tab, i)}
// 									style={i === 1 ? { marginLeft: 20 } : {}}
// 								>
// 									<View
// 										style={
// 											activeTabIndex === i ?
// 												styles.activeTab :
// 												styles.tab
// 										}
// 									>
// 										<Text
// 											style={
// 												activeTabIndex === i ?
// 													[
// 														headingStyles.bigHeader,
// 														colorStyles.citrusBlack
// 													] :
// 													[
// 														headingStyles.bigHeader,
// 														colorStyles.citrusGrey
// 													]
// 											}
// 										>
// 											{capitalize(tab)}
// 										</Text>
// 									</View>
// 								</TouchableOpacity>
// 							))
// 						}
// 					</View>
// 				</SafeAreaView>
// 				{activeTabIndex === 0 ?
// 					<ScrollView
// 						ref='_scrollView1'
// 						scrollEventThrottle={8}
// 						onScroll={e => this.handleScroll(e, 1)}
// 						refreshControl={
// 							<RefreshControl
// 								refreshing={isRefreshing}
// 								onRefresh={this.onRefresh}
// 								tintColor="#000000"
// 							/>
// 						}
// 						style={styles.scrollView}
// 						showsVerticalScrollIndicator={false}
// 					>

// 						{/* UPCOMING TRAININGS */}
// 						{/* <View
// 							style={{
// 								...styles.categoryBlock,
// 								paddingTop: 0
// 							}}
// 						>
// 							<Text
// 								style={[
// 									headingStyles.mediumHeader,
// 									colorStyles.citrusBlack,
// 									styles.paddingHorizontal
// 								]}
// 							>
// 								{capitalize(i18n.t('trainee.myZone.upcomingTrainings'))}
// 							</Text>
// 							<View style={spacingStyles.smallSeparator}></View>
// 							{
// 								upcomingActivities && upcomingActivities.length > 0 ?
// 								<ScrollView
// 									ref='_scrollView2'
// 									scrollEventThrottle={8}
// 									onScroll={e => this.handleScroll(e, 2, true)}
// 									showsHorizontalScrollIndicator={false}
// 									horizontal
// 									contentContainerStyle={styles.paddingHorizontal}
// 								>
// 									{
// 										upcomingActivities.map((training, i) => (
// 											<Card
// 												onClick={() => this.setState({ selectedCoaching: training})}
// 												size='medium'
// 												key={i}
// 												title={capitalize(training.title)}
// 												subtitle={`${capitalize(moment(training.startingDate).calendar())} | ${moment(training.startingDate).format(moment.locale() == 'fr' ? 'HH:mm' : 'LT')}`}
// 												imgUri={training.pictureUri}
// 											/>
// 										))
// 									}
// 								</ScrollView> :
// 								<View style={styles.paddingHorizontal}>
// 									<TouchableOpacity
// 										onPress={() => selectScreen(2)}
// 										style={styles.plusContainer}
// 									>
// 										<PlusButton
// 											width={90}
// 											height={90}
// 											stroke={'#FFFFFF'}
// 											strokeWidth={2}
// 										/>
// 										<View
// 											style={[
// 												buttonStyles.lightButton,
// 												styles.plusButton
// 											]}
// 										>
// 											<Text
// 												style={{
// 													...headingStyles.bbigText,
// 													...colorStyles.citrusBlue,
// 													fontWeight: '700'
// 												}}
// 											>
// 												{capitalize(i18n.t('common.checkoutTrainings'))}
// 											</Text>
// 										</View>
// 									</TouchableOpacity>
// 								</View>
// 							}
// 						</View> */}

// 						{/* NOTIFICATIONS */}
// 						{
// 							notifications && notifications.length > 0 &&
// 							<ScrollView
// 								ref='_scrollView3'
// 								scrollEventThrottle={8}
// 								onScroll={e => this.handleScroll(e, 3, true)}
// 								showsHorizontalScrollIndicator={false}
// 								horizontal
// 								contentContainerStyle={styles.paddingHorizontal}
// 							>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								{
// 									notifications && notifications.length > 0 && notifications.map((notification, i) => (
// 										<NotificationCard
// 											key={i}
// 											onClose={() => {
// 												deleteNotification(user._id, notification._id)
// 													.then(() => fetchNotifications(user._id))
// 											}}
// 											text={notification.message}
// 										/>
// 									))
// 								}
// 							</ScrollView>
// 						}

// 						{/* MY REPLAYS */}
// 						<View style={styles.categoryBlock}>
// 							<Text
// 								style={[
// 									headingStyles.mediumHeader,
// 									colorStyles.citrusBlack,
// 									styles.paddingHorizontal
// 								]}
// 							>
// 								{/* {capitalize(i18n.t('trainee.myZone.myReplays'))} */}
// 								{capitalize(i18n.t('trainee.myZone.myTrainings'))}
// 							</Text>
// 							<View style={spacingStyles.smallSeparator}></View>
// 							{
// 								userReplays && userReplays.length > 0 ?
// 									<ScrollView
// 										ref='_scrollView4'
// 										scrollEventThrottle={8}
// 										onScroll={e => this.handleScroll(e, 4, true)}
// 										showsHorizontalScrollIndicator={false}
// 										horizontal
// 										contentContainerStyle={styles.paddingHorizontal}
// 									>
// 										{
// 											userReplays.map((activity, i) => (
// 												<Card
// 													onClick={() => this.setState({ selectedCoaching: activity.coaching })}
// 													size='large'
// 													key={i}
// 													title={capitalize(activity.coaching.title)}
// 													// subtitle={`${capitalize(moment(activity.coaching.startingDate).format('l'))} | ${moment(activity.coaching.startingDate).format(moment.locale() == 'fr' ? 'HH:mm' : 'LT')}`}
// 													subtitle={`${capitalize(i18n.t(`common.sportsAvailable.${activity.coaching.sport}`))} ${i18n.t('common.with')} ${capitalize(activity.coaching.coachUserName)}`}
// 													imgUri={activity.coaching.pictureUri}
// 												/>
// 											))
// 										}
// 									</ScrollView> :
// 									<View style={styles.paddingHorizontal}>
// 										<TouchableOpacity
// 											onPress={() => selectScreen(2)}
// 											style={styles.plusContainer}
// 										>
// 											<PlusButton
// 												width={90}
// 												height={90}
// 												stroke={'#FFFFFF'}
// 												strokeWidth={2}
// 											/>
// 											<View
// 												style={[
// 													buttonStyles.lightButton,
// 													styles.plusButton
// 												]}
// 											>
// 												<Text
// 													style={{
// 														...headingStyles.bbigText,
// 														...colorStyles.citrusBlue,
// 														fontWeight: '700'
// 													}}
// 												>
// 													{capitalize(i18n.t('common.checkoutTrainings'))}
// 												</Text>
// 											</View>
// 										</TouchableOpacity>
// 									</View>
// 							}
// 						</View>

// 						{/* PAST TRAININGS */}
// 						{/* <View style={styles.categoryBlock}>
// 							<Text
// 								style={[
// 									headingStyles.mediumHeader,
// 									colorStyles.citrusBlack,
// 									styles.paddingHorizontal
// 								]}
// 							>
// 								{capitalize(i18n.t('trainee.myZone.pastTrainings'))}
// 							</Text>
// 							<View style={spacingStyles.smallSeparator}></View>
// 							{
// 								activitiesIHaveAttended && activitiesIHaveAttended.length > 0 ?
// 									<ScrollView
// 										ref='_scrollView5'
// 										scrollEventThrottle={8}
// 										onScroll={e => this.handleScroll(e, 5, true)}
// 										showsHorizontalScrollIndicator={false}
// 										horizontal
// 										contentContainerStyle={styles.paddingHorizontal}
// 									>
// 										{
// 											activitiesIHaveAttended.map((activity, i) => (
// 												<Card
// 													onClick={() => this.setState({ selectedCoaching: activity.coaching })}
// 													size='medium'
// 													key={i}
// 													title={capitalize(activity.coaching.title)}
// 													subtitle={`${capitalize(moment(activity.coaching.startingDate).format('l'))} | ${moment(activity.coaching.startingDate).format(moment.locale() == 'fr' ? 'HH:mm' : 'LT')}`}
// 													imgUri={activity.coaching.pictureUri}
// 												/>
// 											))
// 										}
// 									</ScrollView> :
// 									<View style={styles.paddingHorizontal}>
// 										<View style={spacingStyles.smallSeparator}></View>
// 										<Tag defaultTextValue={i18n.t('trainee.myZone.noneYet')} />
// 									</View>
// 							}
// 						</View> */}

// 						{/* YOUR FAVOURITE COACHES */}
// 						{
// 							following && following.length > 0 &&
// 							<View style={styles.categoryBlock}>
// 								<Text
// 									style={[
// 										headingStyles.mediumHeader,
// 										colorStyles.citrusBlack,
// 										styles.paddingHorizontal
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.myZone.myCoaches'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<ScrollView
// 									ref='_scrollView6'
// 									scrollEventThrottle={8}
// 									onScroll={e => this.handleScroll(e, 6, true)}
// 									showsHorizontalScrollIndicator={false}
// 									horizontal
// 									contentContainerStyle={styles.paddingHorizontal}
// 								>
// 									{
// 										following.map((coach, i) => (
// 											<Card
// 												onClick={() => this.setState({ selectedCoach: coach })}
// 												size='medium'
// 												key={i}
// 												title={capitalize(coach.userName)}
// 												subtitle={`${coach.numberOfFollowers} ${coach.numberOfFollowers > 1 ? i18n.t('trainee.myZone.followers') : i18n.t('trainee.myZone.follower')}`}
// 												imgUri={coach.avatarUrl}
// 											/>
// 										))
// 									}
// 								</ScrollView>
// 							</View>
// 						}

// 						{/* ACHIEVEMENTS */}
// 						<View style={[
// 							styles.categoryBlock,
// 							styles.statsContainer
// 						]}>
// 							<View style={styles.stats}>
// 								<Text
// 									style={[
// 										headingStyles.smallHeader,
// 										colorStyles.citrusBlack
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.rightNow.achievements'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View
// 									style={{
// 										...styles.statsRow,
// 										justifyContent: 'space-between',
// 										height: 25
// 									}}
// 								>
// 									<View
// 										style={{
// 											...styles.statsRow,
// 											width: '50%'
// 										}}
// 									>
// 										<View
// 											style={{
// 												backgroundColor: returnUserStatusProgressBarColor(activitiesIHaveAttended.length),
// 												borderRadius: 50,
// 												width: 19,
// 												height: 19,
// 												marginRight: 10
// 											}}
// 										>
// 										</View>
// 										<Text>
// 											{capitalize(i18n.t(`common.status.${returnUserStatus(activitiesIHaveAttended.length).status}`))}
// 										</Text>
// 									</View>
// 									<View
// 										style={{
// 											...styles.statsRow,
// 											justifyContent: 'flex-end',
// 											width: '50%'
// 										}}
// 									>
// 										<Text
// 											style={{ color: returnUserStatusProgressBarColor(activitiesIHaveAttended.length) }}
// 										>
// 											{`${activitiesIHaveAttended.length} `}
// 										</Text>
// 										<Text>{`/ ${returnUserStatusProgressBar(activitiesIHaveAttended.length)}`}</Text>
// 									</View>
// 								</View>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<Progress.Bar
// 									progress={
// 										activitiesIHaveAttended.length /
// 										returnUserStatusProgressBar(activitiesIHaveAttended.length)
// 									}
// 									width={deviceWidth - 40}
// 									color={returnUserStatusProgressBarColor(activitiesIHaveAttended.length)}
// 									unfilledColor='#FFFFFF'
// 									borderWidth={0}
// 								/>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View style={spacingStyles.mediumSeparator}></View>
// 								<Text
// 									style={[
// 										headingStyles.smallHeader,
// 										colorStyles.citrusBlack
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.myZone.topActivities'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View
// 									style={{
// 										...styles.statsRow,
// 										flexWrap: 'wrap'
// 									}}
// 								>
// 									<Tag
// 										textValue={this.returnTopActivities()}
// 										defaultTextValue={i18n.t('trainee.myZone.noTopActivitiesYet')}
// 									/>
// 								</View>
// 								<Text
// 									style={[
// 										headingStyles.smallHeader,
// 										colorStyles.citrusBlack
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.myZone.statistics'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View style={styles.statsRow}>
// 									<View
// 										style={{
// 											...styles.statsColumn,
// 											maxWidth: '20%',
// 											marginRight: '13.3%'
// 										}}
// 									>
// 										<Text style={headingStyles.bigNumbers}>
// 											{activitiesIHaveAttended.length}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigtext,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.totalTrainings'))}
// 										</Text>
// 									</View>
// 									<View
// 										style={{
// 											...styles.statsColumn,
// 											maxWidth: '20%',
// 											marginRight: '13.3%'
// 										}}
// 									>
// 										<Text style={headingStyles.bigNumbers}>
// 											{totalLengthOfActivities}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigtext,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.totalMinutes'))}
// 										</Text>
// 									</View>
// 									<View
// 										style={{
// 											...styles.statsColumn,
// 											maxWidth: '20%',
// 											marginRight: '13.3%'
// 										}}
// 									>
// 										<Text style={headingStyles.bigNumbers}>
// 											{averageFeeling}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigtext,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.feelingAverage'))}
// 										</Text>
// 									</View>
// 								</View>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View style={spacingStyles.mediumSeparator}></View>
// 							</View>
// 						</View>

// 						<View style={spacingStyles.bigSeparator}></View>
// 						<View style={spacingStyles.bigSeparator}></View>
// 					</ScrollView> :
// 					<ScrollView
// 						ref='_scrollView7'
// 						scrollEventThrottle={8}
// 						onScroll={e => this.handleScroll(e, 7)}
// 						refreshControl={
// 							<RefreshControl
// 								refreshing={isRefreshing}
// 								onRefresh={this.onRefresh}
// 								tintColor="000000"
// 							/>
// 						}
// 						style={styles.scrollView}
// 						showsVerticalScrollIndicator={false}
// 					>
// 						{/* COACH PAST ACTIVITIES */}
// 						<View
// 							style={{
// 								...styles.categoryBlock,
// 								paddingTop: 0
// 							}}
// 						>
// 							<Text
// 								style={[
// 									headingStyles.mediumHeader,
// 									colorStyles.citrusBlack,
// 									styles.paddingHorizontal
// 								]}
// 							>
// 								{capitalize(i18n.t('trainee.myZone.myCoachings'))}
// 							</Text>
// 							<View style={spacingStyles.smallSeparator}></View>
// 							{
// 								// trainerPastCoachings && trainerPastCoachings.length > 0 ?
// 								myCoachings && myCoachings.length > 0 ?
// 									<ScrollView
// 										ref='_scrollView8'
// 										scrollEventThrottle={8}
// 										onScroll={e => this.handleScroll(e, 8, true)}
// 										showsHorizontalScrollIndicator={false}
// 										horizontal
// 										contentContainerStyle={styles.paddingHorizontal}
// 									>
// 										{
// 											myCoachings.map((activity, i) => (
// 												<Card
// 													onClick={() => this.setState({ selectedCoaching: activity })}
// 													size='medium'
// 													key={i}
// 													title={capitalize(activity.title)}
// 													// subtitle={`${capitalize(moment(activity.startingDate).format('l'))} | ${moment(activity.startingDate).format(moment.locale() == 'fr' ? 'HH:mm' : 'LT')}`}
// 													subtitle={capitalize(i18n.t(`common.sportsAvailable.${activity.sport}`))}
// 													imgUri={activity.pictureUri}
// 												/>
// 											))
// 										}
// 									</ScrollView> :
// 									<View style={styles.paddingHorizontal}>
// 										<TouchableOpacity
// 											onPress={() => selectScreen(3)}
// 											style={styles.plusContainer}
// 										>
// 											<PlusButton
// 												width={90}
// 												height={90}
// 												stroke={'#FFFFFF'}
// 												strokeWidth={2}
// 											/>
// 											<View
// 												style={[
// 													buttonStyles.lightButton,
// 													styles.plusButton
// 												]}
// 											>
// 												<Text
// 													style={{
// 														...headingStyles.bbigText,
// 														...colorStyles.citrusBlue,
// 														fontWeight: '700'
// 													}}
// 												>
// 													{capitalize(i18n.t('common.startNow'))}
// 												</Text>
// 											</View>
// 										</TouchableOpacity>
// 									</View>
// 							}
// 						</View>

// 						{/* STATISTICS */}
// 						<View style={[
// 							styles.categoryBlock,
// 							styles.statsContainer
// 						]}>
// 							<View style={styles.stats}>
// 								<Text
// 									style={[
// 										headingStyles.smallHeader,
// 										colorStyles.citrusBlack
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.myZone.statistics'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View style={styles.statsRow}>
// 									<View style={styles.statsColumn}>
// 										<Text
// 											style={[
// 												headingStyles.bigNumbers,
// 												colorStyles.citrusBlack
// 											]}
// 										>
// 											{/* {trainerPastCoachings.length} */}
// 											{myCoachings.length}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigText,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.totalCoachings'))}
// 										</Text>
// 									</View>
// 									<View style={styles.statsColumn}>
// 										<View
// 											style={{
// 												flex: 0,
// 												flexDirection: 'row',
// 												alignItems: 'center'
// 											}}
// 										>
// 											<Text
// 												style={{
// 													...headingStyles.bigNumbers,
// 													...colorStyles.citrusBlack,
// 													marginRight: 5
// 												}}
// 											>
// 												{coachRating}
// 											</Text>
// 											<WavyCheck
// 												width={25}
// 												height={25}
// 												stroke={'#000000'}
// 												strokeWidth={2}
// 											/>
// 										</View>
// 										<Text
// 											style={[
// 												headingStyles.bbigText,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.notation'))}
// 										</Text>
// 									</View>
// 								</View>
// 								<View style={spacingStyles.mediumSeparator}></View>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<Text
// 									style={[
// 										headingStyles.smallHeader,
// 										colorStyles.citrusBlack
// 									]}
// 								>
// 									{capitalize(i18n.t('trainee.myZone.payments'))}
// 								</Text>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<View style={styles.statsRow}>
// 									<View style={styles.statsColumn}>
// 										<Text
// 											style={[
// 												headingStyles.bigNumbers,
// 												colorStyles.citrusBlack
// 											]}
// 										>
// 											{`${currentGains || 0} ${returnCurrency(moment.locale())}`}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigText,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.currentSold'))}
// 										</Text>
// 									</View>
// 									<View style={styles.statsColumn}>
// 										<Text
// 											style={{
// 												...headingStyles.bigNumbers,
// 												...colorStyles.citrusBlack,
// 												marginRight: 5
// 											}}
// 										>
// 											{`${lifeTimeGains || 0} ${returnCurrency(moment.locale())}`}
// 										</Text>
// 										<Text
// 											style={[
// 												headingStyles.bbigText,
// 												colorStyles.citrusGrey
// 											]}
// 										>
// 											{capitalize(i18n.t('trainee.myZone.totalEarnings'))}
// 										</Text>
// 									</View>
// 								</View>
// 								<View style={spacingStyles.mediumSeparator}></View>
// 								<View style={spacingStyles.smallSeparator}></View>
// 								<TouchableOpacity
// 									style={buttonStyles.filledButton}
// 									onPress={() => this.setState({ isCashingOut: true })}
// 								>
// 									<Text
// 										style={[
// 											headingStyles.smallHeader,
// 											colorStyles.white
// 										]}
// 									>
// 										{capitalize(i18n.t('trainee.myZone.cashOutNow'))}
// 									</Text>
// 								</TouchableOpacity>
// 								<View style={spacingStyles.smallSeparator}></View>
// 							</View>
// 						</View>
// 						<View style={spacingStyles.bigSeparator}></View>
// 						<View style={spacingStyles.bigSeparator}></View>
// 					</ScrollView>
// 				}
// 			</View>
// 		)
// 	}
// }

// const styles = StyleSheet.create({
// 	spinnerContainer: {
// 		height: '80%',
// 		width: '100%',
// 		alignItems: 'center',
// 		justifyContent: 'center'
// 	},
// 	mainContainer: {
// 		height: '100%',
// 		width: deviceWidth,
// 		flex: 1,
// 		alignItems: 'center',
// 		justifyContent: 'flex-start',
// 		paddingTop: 50
// 	},
// 	tabsBar: {
// 		flex: 0,
// 		alignItems: 'flex-start',
// 		flexDirection: 'row',
// 		width: deviceWidth,
// 		height: 40,
// 		paddingHorizontal: 20,
// 		marginBottom: 10
// 	},
// 	activeTab: {
// 		borderBottomWidth: 3,
// 		borderBottomColor: '#000000',
// 		flex: 0,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		paddingBottom: 5
// 	},
// 	tab: {
// 		flex: 0,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		paddingBottom: 5
// 	},
// 	scrollView: {
// 		paddingVertical: 5,
// 		width: '100%'
// 	},
// 	categoryBlock: {
// 		flex: 0,
// 		justifyContent: 'flex-start',
// 		alignItems: 'flex-start',
// 		width: deviceWidth,
// 		paddingVertical: 30
// 	},
// 	statsContainer: {
// 		backgroundColor: '#F8F8F8',
// 		alignItems: 'center',
// 		justifyContent: 'flex-start'
// 	},
// 	stats: {
// 		width: '100%',
// 		paddingHorizontal: 20
// 	},
// 	statsRow: {
// 		flex: 0,
// 		flexDirection: 'row',
// 		width: '100%',
// 		height: 60
// 	},
// 	statsColumn: {
// 		flex: 0,
// 		width: '50%'
// 	},
// 	paddingHorizontal: {
// 		paddingHorizontal: 20
// 	},
// 	column: {
// 		flex: 0,
// 		justifyContent: 'flex-start',
// 		alignItems: 'center'
// 	},
// 	row: {
// 		flex: 0,
// 		width: '100%',
// 		flexDirection: 'row',
// 		justifyContent: 'flex-start',
// 		alignItems: 'center',
// 		flexWrap: 'wrap'
// 	},
// 	largeRow: {
// 		flex: 0,
// 		flexDirection: 'row',
// 		width: '100%',
// 		justifyContent: 'space-between',
// 		alignItems: 'center'
// 	},
// 	leftRow: {
// 		width: '50%'
// 	},
// 	rightRow: {
// 		width: '30%'
// 	},
// 	avatar: {
// 		borderRadius: 50,
// 		overflow: 'hidden',
// 		height: 80,
// 		width: 80,
// 		marginBottom: 5
// 	},
// 	coachsBox: {
// 		width: 80,
// 		flex: 0,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		marginRight: 15
// 	},
// 	plusContainer: {
// 		flex: 0,
// 		justifyContent: 'center',
// 		alignItems: 'center',
// 		height: 200,
// 		width: 200,
// 		backgroundColor: '#F8F8F8'
// 	},
// 	plusButton: {
// 		width: 160,
// 		height: 30,
// 		marginTop: 10
// 	}
// })

// const mapStateToProps = state => ({
// 	user: state.auth.user,
// 	notifications: state.notifications,
// 	upcomingActivities: state.auth.upcomingActivities,
// 	// trainerPastCoachings: state.coachings.trainerPastCoachings,
// 	myCoachings: state.coachings.myCoachings,
// 	userReplays: state.auth.userReplays
// })

// const mapDispatchToProps = dispatch => ({
// 	loadUser: () => dispatch(loadUser()),
// 	fetchNotifications: id => dispatch(fetchNotifications(id)),
// 	updateNotification: id => dispatch(updateNotification(id)),
// 	createNotification: notification => dispatch(createNotification(notification)),
// 	deleteNotification: (userId, id) => dispatch(deleteNotification(userId, id)),
// 	fetchUpcomingActivities: id => dispatch(fetchUpcomingActivities(id)),
// 	// fetchTrainerPastCoachings: id => dispatch(fetchTrainerPastCoachings(id)),
// 	fetchTrainerCoachings: (id, isMe) => dispatch(fetchTrainerCoachings(id, isMe)),
// 	fetchUserReplays: id => dispatch(fetchUserReplays(id)),
// 	fetchUserInfo: id => dispatch(fetchUserInfo(id)),
// 	removeCoachingFromMySchedule: (userId, coachingId) => dispatch(removeCoachingFromMySchedule(userId, coachingId)),
// 	selectScreen: screen => dispatch(selectScreen(screen)),
// 	setOverlayMode: bool => dispatch(setOverlayMode(bool)),
// 	setFooterNavMode: bool => dispatch(setFooterNavMode(bool)),
// 	setHasInternetConnection: bool => dispatch(setHasInternetConnection(bool))
// })

// export default connect(mapStateToProps, mapDispatchToProps)(withInAppNotification(MyZone))
