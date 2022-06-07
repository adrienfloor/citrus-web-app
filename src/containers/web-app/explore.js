import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import { Link } from 'react-router-dom'
import qs from 'query-string'
import TextField from '@material-ui/core/TextField'
import Rating from '@material-ui/lab/Rating'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as Search } from '../../assets/svg/search.svg'
import { ReactComponent as PlusButton } from '../../assets/svg/plus-button.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import SignupFromRedirect from '../auth/signup-from-redirect'
import SigninFromRedirect from '../auth/signin-from-redirect'
import Coaching from './coaching'
import CoachProfile from './coach-profile'
import Card from '../../components/web-app/card'

import {
	capitalize,
	titleCase
} from '../../utils/various'

import {
	fetchUserInfo,
	updateUser,
	fetchUserReplays
} from '../../actions/auth-actions'
import {
	executeExploreSearch,
	executeSearch,
	resetSearch,
	resetSpecificSportSearch,
	resetExploreSearch,
} from '../../actions/search-actions'
import {
	fetchCoaching,
	updateCoaching
} from '../../actions/coachings-actions'
import { setNotification } from '../../actions/notifications-actions'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
let sportsItems = Object.keys(translations.default.sportsAvailable)

let tabs = []

class Explore extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			activeTabIndex: 'all',
			activeSportType: 'all',
			selectedCoaching: null,
			isFilterOpen: false,
			filters: {},
			searchInputText: '',
			searchingSessions: true,
			searchingAccounts: false,
			selectedCoach: null,
			isMenuOpen: false,
			skip: 0,
			showLoadMore: true,
			isLoading: false,
			isSigninUp: false,
			coachComment : '',
			ratingValue: null,
			coachingToRate: null,
			isNewPurchase: false
		}

		const { user } = this.props
		if (user && user.sports && user.sports.length > 0) {
			sportsItems = this.props.user.sports.map((sport) => sport.type)
		}

		this.handleSearch = this.handleSearch.bind(this)
		this.handleResetSearch = this.handleResetSearch.bind(this)
		this.handleSportSelection = this.handleSportSelection.bind(this)
		this.handleShowCoachOrCoaching = this.handleShowCoachOrCoaching.bind(this)
		this.handleCoachRating = this.handleCoachRating.bind(this)
	}

	componentDidMount() {
		const {
			user,
			executeExploreSearch
		} = this.props
		this.handleShowCoachOrCoaching()
		if(!user) {
			executeExploreSearch('all', null, 0, 10, null)
		}
	}

	handleShowCoachOrCoaching() {
		const {
			location,
			user,
			fetchCoaching,
			fetchUserInfo
		} = this.props

		const coachingId = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
		const coachId = qs.parse(location.search, { ignoreQueryPrefix: true }).coach

		if (coachingId) {
			this.setState({ isLoading: true })
			setTimeout(() => {
				if (this.props.exploreSearch && this.props.exploreSearch.length > 0) {
					let selectedCoaching = this.props.exploreSearch.find(coaching => coaching._id == coachingId)
					if (selectedCoaching) {
						this.setState({
							selectedCoaching,
							isLoading: false
						})
					} else {
						fetchCoaching(coachingId)
							.then(res => {
								const { coaching } = res.payload
								this.setState({
									selectedCoaching: coaching,
									isLoading: false
								})
							})
					}
				}
			}, 1000)
		}

		if (coachId) {
			this.setState({ isLoading: true })
			setTimeout(() => {
				fetchUserInfo(coachId)
				.then(res => {
					const coach = res.payload
					this.setState({
						selectedCoach: coach,
						isLoading: false
					})
				})
			}, 1000)
		}
	}

	handleSearch(query) {
		const { executeSearch, user } = this.props
		const { searchingSessions } = this.state
		const type = searchingSessions ? 'sessions' : 'accounts'

		this.setState({
			searchInputText: query
		})

		// const asyncFunction = query => executeSearch(query, type, user._id)
		// const asyncFunctionDebounced = AwesomeDebouncePromise(asyncFunction, 1000)

		if (query && query.length && query.length >= 3) {
			// asyncFunctionDebounced()
			executeSearch(query, type, user._id)
		}
	}

	handleResetSearch() {
		this.props.resetSearch()
		this.setState({
			searchingSessions: true,
			searchingAccounts: false
		})
	}

	handleSportSelection(sport, index) {
		const {
			executeExploreSearch,
			resetSpecificSportSearch,
			resetExploreSearch,
			user,
		} = this.props

		this.setState({
			activeSportType: sport,
			activeTabIndex: index,
			skip: 0
		})

		const userId = user ? user._id : null
		const userSports = user ? user.sports : null

		if(sport === 'all') {
			resetExploreSearch()
			executeExploreSearch(sport, userId, 0, 10, userSports)
				.then(res => {
					// if (res && res.payload && res.payload.length < 10) {
					// 	this.setState({ showLoadMore: false })
					// } else {
						this.setState({ showLoadMore: true })
					// }
				})
		} else {
			resetSpecificSportSearch()
			executeExploreSearch(sport, userId, 0, 10, userSports)
				.then(res => {
					if (res && res.payload && res.payload.length < 10) {
						this.setState({ showLoadMore: false })
					} else {
						this.setState({ showLoadMore: true })
					}
				})
		}
	}

	handleCoachRating() {
		const {
			coachComment,
			ratingValue,
			coachingToRate
		} = this.state
		const {
			updateCoaching,
			updateUser,
			user,
			fetchUserReplays,
			setNotification,
			t,
			executeExploreSearch,
			fetchUserInfo
		} = this.props

		if(ratingValue === null) {
			return
		}
		
		this.setState({ isLoading: true })

		let { coachingRating } = coachingToRate
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
			_id: coachingToRate._id,
			coachingRating: {
				numberOfRatings: newNumberOfRatings,
				rating: newRating
			}
		})
		// update user replay to confirm he rated it
		const updatedReplays = user.myReplays
		for(let i=0; i<updatedReplays.length;i++) {
			if(updatedReplays[i]._id === coachingToRate._id) {
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
				fetchUserInfo(coachingToRate.coachId)
				.then(res => {
					const coachInfo = res.payload
					console.log(coachInfo)
					updateUser({
						id: coachingToRate.coachId,
						coachComments: [
							{
								coachComment,
								userName: user.userName,
								rating: ratingValue
							},
							...coachInfo.coachComments
						]
					})
				})
			}
			fetchUserReplays(user._id)
			setNotification({ message: capitalize(t('thankYouForRatingThisCoaching')) })
			executeExploreSearch('all', user._id, 0, 10, user.sports)
			this.setState({
				isRatingCoaching: false,
				isLoading: false
			})
		})
	}

	render() {
		const {
			activeTabIndex,
			selectedCoaching,
			isFilterOpen,
			searchInputText,
			searchingAccounts,
			searchingSessions,
			selectedCoach,
			isMenuOpen,
			skip,
			isFetchingCoachings,
			activeSportType,
			showLoadMore,
			isLoading,
			isSigninUp,
			isRatingCoaching,
			ratingValue,
			isNewPurchase
		} = this.state
		const {
			executeExploreSearch,
			exploreSpecificSportSearch,
			resetSpecificSportSearch,
			user,
			exploreSearch,
			sessionsSearch,
			accountsSearch,
			executeSearch,
			t,
			history,
			location
		} = this.props
		const { sports } = user || {}

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

		// if (!user) {
		// 	if(isSigninUp) {
		// 		return (
		// 			<SignupFromRedirect
		// 				onSignupSuccess={this.handleShowCoachOrCoaching}
		// 				title={capitalize(t('createAnAccountToAccessThisCoaching'))}
		// 				location={location}
		// 				onGoToSignIn={() => this.setState({ isSigninUp: false })}
		// 			/>
		// 		)
		// 	}
		// 	return (
		// 		<SigninFromRedirect
		// 			onSigninSuccess={this.handleShowCoachOrCoaching}
		// 			title={capitalize(t('signinToAccessThisCoaching'))}
		// 			location={location}
		// 			onGoToSignUp={() => this.setState({ isSigninUp: true })}
		// 		/>
		// 	)
		// }

		if (selectedCoach) {
			return (
				<Dialog
					open={true}
					onClose={() => this.setState({ selectedCoach: null })}
				>
					<div className='full-width-and-height-dialog'>
						<CoachProfile
							coach={selectedCoach}
							onCancel={() => this.setState({ selectedCoach: null })}
						/>
					</div>
				</Dialog>
			)
		}

		return (
			<div className='main-container'>
				<span className='big-title citrusBlack responsive-title' style={{ display: 'block' }}>
					{capitalize(t('explore'))}
				</span>
				<div className='upload-form card scroll-div-vertical explore-container'>
					<div
						style={
							searchInputText.length ?
								{ display: 'flex', width: '100%', alignItems: 'flex-end', paddingBottom: '30px' } :
								{ display: 'flex', width: '100%', alignItems: 'flex-end' }
						}
						className={searchInputText.length ? 'search-input-text-mobile search-bar-container' : 'search-bar-container'}
					>
						<div className={searchInputText.length ? 'explore-search-bar-long' : 'explore-search-bar'}>
							<input
								className='text-input small-text-bold citrusGrey input search-input'
								style={{ width: '100%', height: '35px' }}
								placeholder={capitalize(t('search'))}
								value={searchInputText}
								onChange={e => this.handleSearch(e.target.value)}
							/>
							{
								searchInputText.length > 0 &&
								<div
									style={{
										marginTop: '20px',
										width: '10%',
										display: 'flex',
										justifyContent: 'flex-end'
									}}
									className='hover mobile-only'
									onClick={() => {
										this.setState({ searchInputText: '' })
										this.handleResetSearch()
									}}>
									<Close
										width={20}
										height={20}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/>
								</div>
							}
						</div>
						{searchInputText.length ? (
							<div
								style={{ width: '350px' }}
								className='thin-row mobile-thin-row'
							>
								<div
									style={{ marginLeft: '20px' }}
									className='hover desktop-only'
									onClick={() => {
										this.setState({ searchInputText: '' })
										this.handleResetSearch()
									}}>
									<Close
										width={20}
										height={20}
										stroke={'#C2C2C2'}
										strokeWidth={2}
									/>
								</div>
								<div
									className='hover'
									onClick={() => {
										this.setState({
											searchingSessions: true,
											searchingAccounts: false
										})
										executeSearch(searchInputText, 'sessions', user._id)
									}}>
									<span
										className='small-text-bold'
										style={
											!searchingSessions ?
												{ color: '#A9A9A9' } :
												{ color: '#000000' }
										}>
										{t('trainings')}
									</span>
								</div>
								<span>|</span>
								<div
									className='hover'
									onClick={() => {
										this.setState({
											searchingSessions: false,
											searchingAccounts: true
										})
										executeSearch(searchInputText, 'accounts', user._id)
									}}>
									<span
										className='small-text-bold'
										style={
											!searchingAccounts ?
												{ color: '#A9A9A9' } :
												{ color: '#000000' }
										}>
										{t('accounts')}
									</span>
								</div>
							</div>
						) :
							<div style={{ marginLeft: '10px' }}>
								<Search
									width={25}
									height={25}
									stroke={'#000000'}
									strokeWidth={2}
								/>
							</div>
						}
					</div>
					{
						searchInputText === '' &&
						<>
							<div className='small-separator'></div>
							<div className='medium-separator desktop-only'></div>
							<div className='scroll-div-horizontal sports-scroll'>
								<div onClick={() => this.handleSportSelection('all', 'all')}>
									<div
										className={activeTabIndex === 'all' ? 'small-active-tab hover' : 'small-tab hover'}
										style={{ paddingLeft: 0 }}
									>
										<span
											className={
												activeTabIndex === 'all' ?
													'small-title citrusBlack' :
													'small-title citrusGrey'
											}
										>
											{capitalize(t('all'))}
										</span>
									</div>
								</div>
								{
									sportsItems && sportsItems.length && sportsItems.map((sport, i) => (
										<div
											key={i}
											onClick={() => this.handleSportSelection(sport, i)}
										>
											<div className={activeTabIndex === i ? 'small-active-tab hover' : 'small-tab hover'}>
												<span
													className={
														activeTabIndex === i ?
															'small-title citrusBlack' :
															'small-title citrusGrey'
													}
												>
													{capitalize(t(sport))}
												</span>
											</div>
										</div>
									))
								}
							</div>
							<div className='small-separator'></div>
							<div className='medium-separator desktop-only'></div>
						</>
					}
					{
						exploreSearch && exploreSearch.length > 0 && searchInputText === '' && (
							<div className='search-container scroll-div-vertical'>
								{
									searchInputText === '' &&
										activeSportType === 'all' ?
										exploreSearch.map((coaching, i) => (
											<div className='explore-cards-container' key={i}>
												<Card
													onClick={() => {
														console.log(coaching)
														this.setState({
															selectedCoaching: coaching,
															currentScrollIndex: i
														})
													}}
													fullWidth
													title={titleCase(coaching.title)}
													rating={coaching.coachingRating}
													subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${titleCase(coaching.coachUserName)}`}
													imgUri={coaching.pictureUri}
													hasCheckSign={coaching.isMine}
												/>
											</div>
										))
										: exploreSpecificSportSearch.map((coaching, i) => (
											<div className='explore-cards-container' key={i}>
												<Card
													onClick={() =>
														this.setState({
															selectedCoaching: coaching,
															currentScrollIndex: i
														})
													}
													fullWidth
													title={titleCase(coaching.title)}
													rating={coaching.coachingRating}
													subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${titleCase(coaching.coachUserName)}`}
													imgUri={coaching.pictureUri}
													hasCheckSign={coaching.isMine}
												/>
											</div>
										))
								}
								{
									showLoadMore &&
									<div className='full-width-on-mobile'>
										{
											activeSportType !== 'all' &&
												searchInputText === '' &&
												!exploreSpecificSportSearch.length ? null : (
												<div
													style={{
														height: exploreSearch.length % 3 === 0 ? '10px' : '200px',
														display: 'flex',
														alignItems: 'flex-end',
														marginBottom: exploreSearch.length % 3 === 0 && '30px'
													}}
													className='hover button-load-more-mobile'
													onClick={() => {
														this.setState({
															skip: skip + 10,
															isFetchingCoachings: true
														})
														executeExploreSearch(
															activeSportType,
															user ? user._id : null,
															skip + 10,
															10,
															user ? user.sports : null
														).then((res) => {
															if (res && res.payload && res.payload.length < 5) {
																this.setState({ showLoadMore: false })
															} else {
																this.setState({ showLoadMore: true })
															}
															this.setState({ isFetchingCoachings: false })
														})
													}}
												>
													{isFetchingCoachings ?
														<Loader
															type="ThreeDots"
															color="#C2C2C2"
															height={25}
															width={25}
														/> :
														<span
															className='small-text-bold citrusGrey hover'
															style={{
																borderBottom: '1px solid #C2C2C2',
																paddingBottom: '2px'
															}}
														>
															{capitalize(t('loadMore'))}
														</span>
														// <span className='small-title citrusBlue'>
														// 	{capitalize(t('loadMore'))}
														// 	...
														// </span>
													}
												</div>
											)}
									</div>
								}
								{
									exploreSpecificSportSearch &&
									exploreSpecificSportSearch.length === 0 &&
									activeTabIndex !== 'all' && searchInputText === '' && (
										<Link to='/post' className='empty-coaching-card hover'>
											<PlusButton
												width={90}
												height={90}
												stroke={'#FFFFFF'}
												strokeWidth={2}
											/>
											<span className='small-title citrusBlack'>
												{capitalize(t('noSessionsInThatCategory'))}
											</span>
											<div className='small-separator'></div>
											<div className='light-button plus-button'>
												<span className='small-title citrusBlue'>
													{capitalize(t('createOne'))}
												</span>
											</div>
											<div className='medium-separator'></div>
										</Link>
									)}
							</div>
						)
					}
					{
						exploreSearch && exploreSearch.length === 0 &&
						exploreSpecificSportSearch && exploreSpecificSportSearch.length === 0 &&
						searchInputText === '' && (
						<div style={{ width: '100%' }}>
							<Link to='/post' className='empty-coaching-card hover'>
								<PlusButton
									width={90}
									height={90}
									stroke={'#FFFFFF'}
									strokeWidth={2}
								/>
								<span className='small-title citrusBlack'>
									{capitalize(t('noSessionsInThatCategory'))}
								</span>
								<div className='small-separator'></div>
								<div className='light-button plus-button'>
									<span className='small-title citrusBlue'>
										{capitalize(t('createOne'))}
									</span>
								</div>
								<div className='medium-separator'></div>
							</Link>
						</div>
					)}
					{
						searchInputText !== '' &&
						<div className='search-container scroll-div-vertical'>
							{
								searchingSessions &&
									searchInputText &&
									sessionsSearch.length ?
									sessionsSearch.map((coaching, i) => (
										<div className='explore-cards-container' key={i}>
											<Card
												onClick={() => this.setState({ selectedCoaching: coaching })}
												fullWidth
												title={titleCase(coaching.title)}
												rating={coaching.coachingRating}
												subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${titleCase(coaching.coachUserName)}`}
												imgUri={coaching.pictureUri}
												hasCheckSign={coaching.isMine}
											/>
										</div>)) :
									null
							}
							{
								searchingAccounts &&
									searchInputText &&
									accountsSearch.length ?
									accountsSearch.map((coach, i) => (
										<div className='explore-cards-container' key={i}>
											<Card
												onClick={() => this.setState({ selectedCoach: coach })}
												size='medium'
												title={titleCase(coach.userName)}
												subtitle={`${coach.followers.length} ${coach.followers.length > 1 ? t('followers') : t('follower')}`}
												imgUri={coach.avatarUrl}
												fullWidth
											/>
										</div>)) :
									null
							}
						</div>
					}
				</div>
				{
					selectedCoaching &&
					<Dialog
						open={selectedCoaching ? true : false}
						onClose={() => {
							if(selectedCoaching.isMine || isNewPurchase) {
								const myCoaching = user.myReplays.find(replay => (
									replay._id === selectedCoaching._id
								))
								if(!myCoaching.myRating) {
									this.setState({
										coachingToRate: selectedCoaching,
										selectedCoaching: null,
										isRatingCoaching: true
									})
								} else {
									this.setState({
										coachingToRate: null,
										selectedCoaching: null,
										isRatingCoaching: false
									})
									const coachingQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
									if (coachingQuery) {
										history.push('/explore')
									}
								}
							} else {
								const coachingQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
								if (coachingQuery) {
									history.push('/explore')
								}
								this.setState({ selectedCoaching: null })
							}
						}}
					>
						<div
							className='dialog-modal'
							style={{ overflowY: 'auto' }}
						>
							<Coaching
								coaching={selectedCoaching}
								onCancel={() => {
									if(selectedCoaching.isMine || isNewPurchase) {
										const myCoaching = user.myReplays.find(replay => (
											replay._id === selectedCoaching._id
										))
										if(!myCoaching.myRating) {
											this.setState({
												coachingToRate: selectedCoaching,
												selectedCoaching: null,
												isRatingCoaching: true
											})
										} else {
											this.setState({
												coachingToRate: null,
												selectedCoaching: null,
												isRatingCoaching: false
											})
											const coachingQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
											if (coachingQuery) {
												history.push('/explore')
											}
										}
									} else {
										const coachingQuery = qs.parse(location.search, { ignoreQueryPrefix: true }).coaching
										if (coachingQuery) {
											history.push('/explore')
										}
										this.setState({ selectedCoaching: null })
									}
								}}
								isMyCoaching={false}
								onNewCoachingPurchase={() => this.setState({ isNewPurchase: true })}
							/>
						</div>
					</Dialog>
				}
				{
					isRatingCoaching &&
					<Dialog
						open={isRatingCoaching ? true : false}
						onClose={() => this.setState({ isRatingCoaching: false })}
					>
						<div className='coaching-rating-container'>
							<div className='rating-container'>
								<span className='small-text-bold' style={{ marginRight: '10px' }}>
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
								className='small-text-bold citrusGrey text-field-rating'
								multiline
								rows={4}
								placeholder={capitalize(t('whatDidYouLikeTrainingWithThisCoach'))}
								onChange={(e) => this.setState({ coachComment: e.target.value })}
							/>
							<div className='big-separator'></div>
							<div className='rating-buttons-container'>
								<div
									className='filled-button hover cta'
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
						</div>
						<style jsx='true'>
							{`
							.coaching-rating-container {
								padding: 40px;
								min-height: 380px;
								min-width: 620px;
							}
							.rating-container {
								width: 100%;
								display: flex;
								align-items: center;
							}
							.rating-buttons-container {
								width: 100%;
								display: flex;
								flex-direction: column;
								justify-content: center;
								align-items: center;
								margin-top: 20px;
							}
							.text-field-rating {
								color: #000000;
								width: 100%;
								background-color: inherit;
							}
							@media only screen and (max-width: 640px) {
								.coaching-rating-container {
									padding: 10px;
									height: 100%;
									width: calc(100% - 10px);
									min-width: 0;
									min-height: 0;
								}
								.rating-container {
									flex-direction: column;
									align-items: flex-start;
									justify-content: space-between;
									height: 60px;
								}
								.rating-buttons-container {
									margin-top: 10px;
								}
								.text-field-rating {
									width: 95%;
								}
								.cta {
									width: 190px !important;
								}
							}
						`}
						</style>
					</Dialog>
				}
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	user: state.auth.user,
	exploreSearch: state.searches.exploreSearch,
	exploreSpecificSportSearch: state.searches.exploreSpecificSportSearch,
	sessionsSearch: state.searches.sessionsSearch,
	accountsSearch: state.searches.accountsSearch
})

const mapDispatchToProps = (dispatch) => ({
	resetSpecificSportSearch: () => dispatch(resetSpecificSportSearch()),
	executeExploreSearch: (sport, userId, skipValue, limit, userFavoriteSports) =>
		dispatch(executeExploreSearch(sport, userId, skipValue, limit, userFavoriteSports)),
	executeSearch: (query, type, userId) =>
		dispatch(executeSearch(query, type, userId)),
	resetSearch: () => dispatch(resetSearch()),
	resetExploreSearch: () => dispatch(resetExploreSearch()),
	resetSpecificSportSearch: () => dispatch(resetSpecificSportSearch()),
	fetchCoaching: id => dispatch(fetchCoaching(id)),
	fetchUserInfo: id => dispatch(fetchUserInfo(id)),
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	updateCoaching: (coaching) => dispatch(updateCoaching(coaching)),
	fetchUserReplays: (id) => dispatch(fetchUserReplays(id)),
	setNotification: notif => dispatch(setNotification(notif))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Explore))