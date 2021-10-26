import React from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import Dialog from '@material-ui/core/Dialog'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import moment from 'moment'
import { Link } from 'react-router-dom'

import {
	updateUser,
	loadUser
} from '../../actions/auth-actions'
import { setNotification } from '../../actions/notifications-actions'

import Coaching from './coaching'
import Tag from '../../components/web-app/tag'
import Card from '../../components/web-app/card'
import ImageUploader from '../../components/web-app/image-uploader'
import { ReactComponent as PlusButton } from '../../assets/svg/plus-button.svg'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize
} from '../../utils/various'

import * as frCommonTranslations from '../../fixtures/fr'
import * as enCommonTranslations from '../../fixtures/en'

const translations = moment.locale() == 'fr' ? frCommonTranslations : enCommonTranslations
const sportsItems = Object.keys(translations.default.sportsAvailable)

class Profile extends React.Component {
	constructor(props) {
		super(props)
		const {
			userName,
			sports,
			bio,
			avatarUrl,
			_id
		} = this.props.user
		this.state = {
			isLoading: false,
			isEditing: false,
			warning: '',
			userName,
			sports: sports.length ? sports : [],
			bio,
			avatarUrl,
			myCoachingsSkip: 3
		}
		this.handleSportChange = this.handleSportChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	handleSubmit(e) {
		e.preventDefault()
		const {
			userName,
			sports,
			bio,
			avatarUrl
		} = this.state
		const {
			setNotification,
			updateUser,
			t,
			user
		} = this.props

		if(userName.length === 0) {
			return
		}

		const userInfo = {
			id: user._id,
			avatarUrl,
			bio,
			userName
		}

		this.setState({ isLoading: true })
		updateUser(userInfo, true)
			.then(res => {
				if (res.payload.status >= 400) {
					this.setState({
						isLoading: false,
						warning: res.payload.msg.response.data.msg
					})
					setTimeout(function () {
						this.setState({ warning: null })
					}.bind(this), 5000)
					return
				} else {
					this.setState({
						isLoading: false,
						isEditing: false
					})
					setNotification({ message: capitalize(t('successFullyUpdatedProfile')) })
				}
			})
	}

	handleSportChange(e) {
		const sports = e.target.value.map(sport => {
			return {
				type: sport,
				level: ''
			}
		})
		this.setState({ sports })
	}

	render() {
		const {
			user,
			t,
			myCoachings
		} = this.props
		const {
			selectedCoaching,
			isLoading,
			isEditing,
			userName,
			sports,
			bio,
			avatarUrl,
			warning,
			myCoachingsSkip
		} = this.state

		if (isLoading) {
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

		const isDefaultProfilePic = avatarUrl === 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1623317757/VonageApp/avatar/noun_avatar_2309777_jhlofy.png'

		return (
			<div className='main-container'>
				<span className='big-title citrusBlack responsive-title'>
					{capitalize(t('profile'))}
				</span>
				<div className='upload-form card scroll-div-vertical profile-container'>
					<div className='desktop-only-medium-separator'></div>
					<div className='profile-row'>
						{
							isEditing ?
							<ImageUploader
								t={t}
								onSetPictureUri={avatarUrl => {
									this.setState({ avatarUrl })
								}}
								pictureUri={avatarUrl ? avatarUrl : null}
								isAvatar={true}
								isProfile
							/> :
							<div
								className='mobile-coach-image'
								style={{
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
									backgroundImage: `url(${avatarUrl})`,
									backgroundSize: 'cover',
								}}>
							</div>
						}
						<div
							style={{
								paddingLeft: '30px',
								width: '100%',
								maxWidth: '600px',
								height: '200px',
								justifyContent: 'space-between'
							}}
							className='profile-column'
						>
							<div className='profile-title-row'>
								{
									isEditing ?
										<input
											className='text-input smaller-text-bold citrusGrey edit-profile-input-mobile'
											placeholder={capitalize(t('userName'))}
											onChange={(e) => this.setState({ userName: e.target.value })}
											style={{ color: '#000000', width: '100%', backgroundColor: 'inherit' }}
											value={userName}
										/> :
									<>
										<span className='small-title citrusBlack'>
											{capitalize(userName)}
										</span>
										<span
											className='smaller-text-bold citrusGrey hover'
											style={{ marginLeft: '10px' }}
											onClick={() => this.setState({ isEditing: true })}
										>
											{t('edit')}
										</span>
									</>
								}
							</div>
							<div className='mobile-only-small-separator'></div>
							{bio && bio.length > 0 && !isEditing &&
								<span className='small-text citrusBlack'>
									{capitalize(bio)}
								</span>
							}
							{
								(!bio || bio.length === 0 )&& !isEditing &&
								<span className='small-text citrusBlack'>
									{capitalize(t('tellUsMoreAboutYou'))}
								</span>
							}
							{ isEditing &&
								<>
									<div className='medium-separator'></div>
									<textarea
										className='smaller-text-bold citrusGrey'
										rows='3'
										placeholder={capitalize(t('tellUsMoreAboutYou'))}
										onChange={(e) => this.setState({ bio: e.target.value })}
										style={{
											color: '#000000',
											width: '100%',
											backgroundColor: 'inherit',
											border: 'none',
											borderBottom: '1px solid #BEBEBE',
											paddingBottom: '10px'
										}}
										value={bio}
									/>
								</>
							}
							<div className='small-separator'></div>
							<div className='mobile-only-small-separator'></div>
							{
								sports && sports.length > 0 && !isEditing &&
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
							{
								isEditing &&
								<div style={{ display: 'flex', width: '100%' }}>
									<div className='medium-separator'></div>
									<div className='small-separator'></div>
									<Select
										style={{ width: '100%' }}
										multiple
										value={sports.map(sport => sport.type)}
										onChange={this.handleSportChange}
										displayEmpty
										renderValue={(selected) => {
											if (selected.length === 0) {
												return (
													<em className='smaller-text-bold citrusGrey'>
														{t('sportsPlaceholder')}
													</em>
												)
											}
											return selected.map(el => t(el)).join(', ')
										}}
									>
									{
										sportsItems.map((sport, i) => (
											<MenuItem key={i} value={sport}>
												{capitalize(t(sport))}
											</MenuItem>
										))
									}
									</Select>
								</div>
							}
						</div>
					</div>
					{
						isEditing &&
						<>
						<div className='medium-separator'></div>
							<div
								className='flex-row edit-submit-row-mobile'
								style={{
									width: '100%',
									justifyContent: 'flex-end',
									alignItems: 'center',
									maxWidth: '930px'
								}}
							>
								{
									userName.length === 0 &&
									<span
										style={{ marginRight: '50px' }}
										className='smaller-text citrusRed edit-profile-input-mobile'
									>
										{t('userNameRequired')}
									</span>
								}
								{
									warning.length === 0 &&
									<span
										style={{ marginRight: '50px' }}
										className='smaller-text citrusRed edit-profile-input-mobile'
									>
										{warning}
									</span>
								}
								<span
									className='smaller-text-bold citrusGrey hover'
									style={{ marginRight: '10px' }}
									onClick={() => this.setState({ isEditing: false })}
								>
									{t('cancel')}
								</span>
								<div
									className='filled-button hover'
									style={{ width: '90px', height: '25px' }}
									onClick={this.handleSubmit}
								>
									<span className='smaller-text-bold citrusWhite'>
										{capitalize(t('submit'))}
									</span>
								</div>
							</div>
						</>
					}
					{
						!isEditing &&
						<div className='category-block'>
							<span className='small-title citrusBlack'>
								{capitalize(t('coachings'))}
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
												<div
													className='desktop-load-more'
													style={{ marginBottom: '20px' }}
												>
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
					}
					<div className='small-separator'></div>
				</div>
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
								onCoachingDeleted={() => { }}
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
	myCoachings: state.coachings.myCoachings
})

const mapDispatchToProps = (dispatch) => ({
	updateUser: (userInfo, isMe) => dispatch(updateUser(userInfo, isMe)),
	loadUser: () => dispatch(loadUser()),
	setNotification: notification => dispatch(setNotification(notification))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Profile))