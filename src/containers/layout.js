import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Link, withRouter } from 'react-router-dom'

import MobileDrawer from '../components/mobile-drawer'
import { logout } from '../actions/auth-actions'
import {
	setDashboardFocus,
	setIsRedirectingHome
} from '../actions/navigation-actions'
import { capitalize } from '../utils/various'
import { ReactComponent as BluePlus } from '../assets/svg/blue-plus-button.svg'

import '../styling/headings.css'
import '../styling/colors.css'
import '../styling/buttons.css'

const logoUri = 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1620220417/VonageApp/logos/CITRUS_1_yetxqf.png'

const Layout = ({
	logout,
	isAuthenticated,
	children,
	setDashboardFocus,
	isDashboard,
	t,
	location,
	history,
	setIsRedirectingHome
}) => {

	const isActiveTab = tab => {
		if (tab === location.pathname) {
			return 'active-nav small-text-bold citrusGrey hover'
		}
		return 'small-text-bold citrusGrey hover'
	}

	const isWebview = location && location.pathname === '/post-webview'
	const isExploreAndUserNotLoggedIn = location && location.pathname === '/explore' && !isAuthenticated

	if(isWebview) {
		return <div className='webview'>{children}</div>
	}

	return (
		<div
			className='full-container flex-column'
			style={{ justifyContent: 'space-between' }}
		>
			<header className='header flex-row'>
				<div className='header-left-box'>
					{
						// isDashboard &&
						(isAuthenticated || isExploreAndUserNotLoggedIn) &&
						<div className='mobile-drawer'>
							<MobileDrawer
								logout={() => {
									logout()
									setIsRedirectingHome(true)
								}}
								currentFocus={focus => setDashboardFocus(focus)}
								isExploreAndUserNotLoggedIn={isExploreAndUserNotLoggedIn}
							/>
						</div>
					}
					<a>
						<img
							className={isDashboard ? 'logo' : 'logo margin-logo'}
							src={logoUri}
							alt='citrus-logo'
						/>
					</a>
				</div>
				{
					isAuthenticated &&
					<>
						<div className='navigation'>
							<div
								style={{
									width: '90%',
									display: 'flex',
									justifyContent: 'space-between'
								}}
							>
								<Link to='/home' className='desktop-only'>
									<span className={isActiveTab('/home')}>
										{capitalize(t('home'))}
									</span>
								</Link>
								<Link to='/explore' className='desktop-only'>
									<span className={isActiveTab('/explore')}>
										{capitalize(t('explore'))}
									</span>
								</Link>
								<Link to='/post' className='desktop-only'>
									<span className={isActiveTab('/post')}>
										{capitalize(t('post'))}
									</span>
								</Link>
								<Link to='/profile' className='desktop-only'>
									<span className={isActiveTab('/profile')}>
										{capitalize(t('profile'))}
									</span>
								</Link>
								<Link to='/settings' className='desktop-only'>
									<span className={isActiveTab('/settings')}>
										{capitalize(t('settings'))}
									</span>
								</Link>
							</div>
						</div>
						<div
							onClick={() => {
								logout()
								setIsRedirectingHome(true)
							}}
							className='medium-text hover logout desktop-only'
						>
							<a href='https://thecitrusapp.com'>
								<div
									className='small-button'
									style={{
									minWidth: '100px',
									height: '35px'
									}}
								>
									<span className='small-text-bold citrusWhite'>
										{capitalize(t('logOut'))}
									</span>
								</div>
							</a>
						</div>
					</>
				}
				{
					isExploreAndUserNotLoggedIn &&
					<div
						className='flex-row'
						style={{
							width: '500px',
							justifyContent: 'space-between',
							marginRight: '50px'
						}}
					>
						<Link to='/signin'
							className='medium-text hover desktop-only'
						>
							<div
								className='light-button button'
								style={{
									width: '150px',
									minWidth: '100px',
									height: '35px',
									marginRight: '100px'
								}}
							>
								<span
									className='small-text-bold citrusBlue'
									style={{ display: 'flex', alignItems: 'center' }}
								>
									<BluePlus style={{ marginRight: '5px' }} />
									{capitalize(t('postYourVideo'))}
								</span>
							</div>
						</Link>
						<Link to='/signin'
							className='medium-text hover desktop-only'
						>
							<div
								className='light-button button'
								style={{
									width: '100px',
									minWidth: '100px',
									height: '35px'
								}}
							>
								<span className='small-text-bold citrusBlue'>
									{capitalize(t('logInNow'))}
								</span>
							</div>
						</Link>
						<Link to='/signup'
							className='medium-text hover desktop-only'
						>
							<div
								className='small-button'
								style={{
									minWidth: '100px',
									height: '39px'
								}}
							>
								<span className='small-text-bold citrusWhite'>
									{capitalize(t('signUpNow'))}
								</span>
							</div>
						</Link>
					</div>
				}
			</header>
			<div className='children'>{children}</div>
			<footer className='footer flex-row desktop-only not-on-tablet'>
				<div className='flex-row flex-center contact-row'>
					{/* <a target='_blank' className='small-text' href='https://thecitrusapp.com'>Legals</a> */}
					<div className='footer-links'>
						<a target='_blank' className='footer-link simple-link' href='https://thecitrusapp.com'>{capitalize(t('howItWorks'))}</a>
						<a target='_blank' className='footer-link simple-link' href='https://thecitrusapp.com/privacy-policy/'>{capitalize(t('privacy'))}</a>
						<a target='_blank' className='footer-link simple-link' href='https://thecitrusapp.com/cgu-cgv/'>{capitalize(t('terms'))}</a>
						<a href="mailto:contact@thecitrusapp.com" className='footer-link simple-link'>Contact</a>
					</div>
					<div className='small-text copyright'>© 2021 All rights Reserved. Design by The Citrus Company</div>
				</div>
			</footer>
			<style jsx='true'>
				{`
					.webview {
						height: 100vh;
					}
					.logo {
						// height: 30px;
						// width: 197px;
						height: 20px;
						width: 131.5px;
					}
					.contact-row {
						justify-content: space-between;
    				width: 100%;
						padding: 20px;
					}
					.children {
						flex: 1;
						// margin-top: 80px;
						margin-top: 60px;
						margin-bottom: 40px;
						background-color: #F8F8F8;
					}
					.footer {
						background-color: #FFFFFF;
						position: fixed;
						bottom: 0;
						height: 40px;
						justify-content: space-between;
						width: 100%;
						z-index: 13;
					}
					.footer-link {
						margin-right: 20px;
					}
					.hover:hover {
						cursor: pointer;
					}
					.active-nav {
						border-bottom: 2px solid #C2C2C2;
						padding-bottom: 2px;
					}
					@media only screen and (max-width: 640px) {
						.header {
							height: 60px;
						}
						.footer {
							padding: 0 !important;
							background-color: #FFFFFF !important;
							z-index: 666;
							position: fixed;
							min-width: 100%;
						}
						.logo {
							height: 20px;
							width: 124px;
							margin-left: 5px;
						}
						.copyright {
							font-size: 12px;
							margin-top: 10px;
							text-align: center;
							min-width: 100%;
						}
						.footer-links {
							min-width: 100%;
							text-align: center;
						}
						.header-left-box {
							display: flex;
							flex-direction: row;
							align-items: center;
							height: 60px;
						}
						.contact-row {
							flex-direction: column;
							justify-content: center;
							align-items: center;
							margin: 0;
							padding: 0;
							min-width: 100%;
						}
						.margin-logo {
							margin-left: 10px;
						}
						.footer-link {
							margin-right: 5px;
							font-size: 14px !important;
						}
						.children {
							margin-top: 60px;
							margin-bottom: 0;
						}
					}
					@media only screen and (min-width: 640px) {
						.mobile-drawer {
							display: none;
						}
					}
				`}
			</style>
		</div>
	)
}
const mapStateToProps = state => ({
	isAuthenticated: state.auth.isAuthenticated,
	user: state.auth.user,
	error: state.error,
	isDashboard: state.navigation.isDashboard
})

const mapDispatchToProps = dispatch => ({
	logout: () => dispatch(logout()),
	setDashboardFocus: focus => dispatch(setDashboardFocus(focus)),
	setIsRedirectingHome: bool => dispatch(setIsRedirectingHome(bool))
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter((withTranslation()(Layout))))
