import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Dialog from '@material-ui/core/Dialog'
import Loader from 'react-loader-spinner'
import moment from 'moment'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { Link } from 'react-router-dom'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'
import { ReactComponent as Search } from '../../assets/svg/search.svg'
import { ReactComponent as PlusButton } from '../../assets/svg/plus-button.svg'
import { ReactComponent as Close } from '../../assets/svg/close.svg'

import Coaching from './coaching'
import CoachProfile from './coach-profile'
import Card from '../../components/web-app/card'
import Tag from '../../components/web-app/tag'

import {
	capitalize
} from '../../utils/various'

import { loadUser } from '../../actions/auth-actions'
import {
	executeExploreSearch,
	executeSearch,
	resetSearch,
	resetSpecificSportSearch,
	resetExploreSearch,
} from '../../actions/search-actions'

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
			skip: 5
		}

		const {
			executeExploreSearch,
			exploreSearch,
			user
		} = this.props

		if (this.props.user.sports.length > 0) {
			sportsItems = this.props.user.sports.map((sport) => sport.type)
		}

		this.handleSearch = this.handleSearch.bind(this)
		this.handleResetSearch = this.handleResetSearch.bind(this)
		this.handleSportSelection = this.handleSportSelection.bind(this)
	}

	handleSearch(query) {
		const { executeSearch, user } = this.props
		const { searchingSessions } = this.state
		const type = searchingSessions ? 'sessions' : 'accounts'

		this.setState({
			searchInputText: query
		})

		const asyncFunction = query => executeSearch(query, type, user._id)
		const asyncFunctionDebounced = AwesomeDebouncePromise(asyncFunction, 1000)

		if (query.length && query.length >= 3) {
			asyncFunctionDebounced()
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
			user,
		} = this.props
		const { activeTitleTabName } = this.state
		this.setState({
			activeTabIndex: index,
			activeSportType: sport,
		})

		resetSpecificSportSearch()
		if (sport === 'all') {
			return
		}
		executeExploreSearch(sport, user._id, 0)
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
			activeSportType
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
			t
		} = this.props
		const { sports } = user

		if (selectedCoach) {
			return (
				<Dialog
					open={true}
					onClose={() => this.setState({ selectedCoach: null })}
				>
					<CoachProfile
						coach={selectedCoach}
						onCancel={() => this.setState({ selectedCoach: null })}
					/>
				</Dialog>
			)
		}

		return (
			<div className='explore-container'>
				<span className='big-title citrusBlack' style={{ width: '100%', display: 'block' }}>
					{capitalize(t('explore'))}
				</span>
				<div
					style={
						searchInputText.length ?
							{ display: 'flex', width: '100%', alignItems: 'flex-end', paddingBottom: '30px' } :
							{ display: 'flex', width: '100%', alignItems: 'flex-end' }
					}
					className={searchInputText.length ?'search-input-text-mobile' : ''}
				>
					<div className={searchInputText.length ? 'explore-search-bar-long' : 'explore-search-bar'}>
						<input
							className='text-input small-text-bold citrusGrey input search-input'
							style={{ backgroundColor: '#F8F8F8', width: '100%' }}
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
							style={{ width: '350px'}}
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
									});
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
						<div style={{ marginLeft: '10px'}}>
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
									<div className='explore-cards-container'key={i}>
										<Card
											onClick={() =>
												this.setState({
													selectedCoaching: coaching,
													currentScrollIndex: i
												})
											}
											fullWidth
											title={capitalize(coaching.title)}
											subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${capitalize(coaching.coachUserName)}`}
											imgUri={coaching.pictureUri}
										/>
									</div>
									))
									: exploreSpecificSportSearch.map((coaching, i) => (
										<div className='explore-cards-container'key={i}>
											<Card
												onClick={() =>
													this.setState({
														selectedCoaching: coaching,
														currentScrollIndex: i
													})
												}
												fullWidth
												title={capitalize(coaching.title)}
												subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${capitalize(coaching.coachUserName)}`}
												imgUri={coaching.pictureUri}
											/>
										</div>
									))
							}
							<div className='full-width-on-mobile'>
								{
									activeSportType !== 'all' &&
									searchInputText === '' &&
									!exploreSpecificSportSearch.length ? null : (
									<div
										className='light-button hover cashout-button button-load-more-mobile'
										onClick={() => {
											this.setState({
												skip: skip + 5,
												isFetchingCoachings: true
											})
											executeExploreSearch(
												activeSportType,
												user._id,
												skip + 5,
											).then((res) =>
												this.setState({ isFetchingCoachings: false }),
											)
										}}
									>
										{isFetchingCoachings ? (
											<Loader
												type="ThreeDots"
												color="#0075FF"
												height={25}
												width={25}
											/>
										) : (
											<span className='small-title citrusBlue'>
												{capitalize(t('loadMore'))}
												...
											</span>
										)}
									</div>
								)}
							</div>
							{
								exploreSpecificSportSearch &&
								exploreSpecificSportSearch.length === 0 &&
								activeTabIndex !== 'all' && searchInputText === '' && (
								<Link to='/schedule' className='empty-coaching-card hover'>
									<PlusButton
										width={180}
										height={180}
										stroke={'#FFFFFF'}
										strokeWidth={2}
									/>
									<div className='small-separator'></div>
									<span className='small-title citrusBlack'>
										{capitalize(t('noSessionsInThatCategory'))}
									</span>
									<div className='small-separator'></div>
									<div className='light-button plus-button'>
										<span className='small-title citrusBlue'>
											{capitalize(t('createOne'))}
										</span>
									</div>
									<div className='small-separator'></div>
								</Link>
							)}
						</div>
					)
				}
				{
					searchInputText !== '' &&
					<div className='search-container scroll-div-vertical'>
						{
							searchingSessions &&
							searchInputText &&
							sessionsSearch.length ?
							sessionsSearch.map((coaching, i) => (
								<div className='explore-cards-container'key={i}>
									<Card
										onClick={() => this.setState({ selectedCoaching: coaching })}
										fullWidth
										title={capitalize(coaching.title)}
										subtitle={`${capitalize(t(coaching.sport))} ${t('with')} ${capitalize(coaching.coachUserName)}`}
										imgUri={coaching.pictureUri}
									/>
								</div> )) :
							null
						}
						{
							searchingAccounts &&
							searchInputText &&
							accountsSearch.length ?
							accountsSearch.map((coach, i) => (
								<div className='explore-cards-container'key={i}>
									<Card
										onClick={() => this.setState({ selectedCoach: coach })}
										size='medium'
										title={capitalize(coach.userName)}
										subtitle={`${coach.followers.length} ${coach.followers.length > 1 ? t('followers') : t('follower')}`}
										imgUri={coach.avatarUrl}
										fullWidth
									/>
								</div>)) :
							null
						}
					</div>
				}
				{
					selectedCoaching &&
					<Dialog
						open={selectedCoaching ? true : false}
						onClose={() => this.setState({ selectedCoaching: null })}
					>
						<div style={{ maxWidth: '800px' }}>
							<Coaching
								coaching={selectedCoaching}
								onCancel={() => this.setState({ selectedCoaching: null })}
								isMyCoaching={false}
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
	exploreSearch: state.searches.exploreSearch,
	exploreSpecificSportSearch: state.searches.exploreSpecificSportSearch,
	sessionsSearch: state.searches.sessionsSearch,
	accountsSearch: state.searches.accountsSearch
})

const mapDispatchToProps = (dispatch) => ({
	loadUser: () => dispatch(loadUser()),
	resetSpecificSportSearch: () => dispatch(resetSpecificSportSearch()),
	executeExploreSearch: (sport, userId, skipValue) =>
		dispatch(executeExploreSearch(sport, userId, skipValue)),
	executeSearch: (query, type, userId) =>
		dispatch(executeSearch(query, type, userId)),
	resetSearch: () => dispatch(resetSearch()),
	resetExploreSearch: () => dispatch(resetExploreSearch()),
	resetSpecificSportSearch: () => dispatch(resetSpecificSportSearch())
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Explore))