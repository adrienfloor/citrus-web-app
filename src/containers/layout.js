import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Link, withRouter } from 'react-router-dom'

import MobileDrawer from '../components/mobile-drawer'
import { logout } from '../actions/auth-actions'
import { setDashboardFocus } from '../actions/navigation-actions'
import { capitalize } from '../utils/various'

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
	history
}) => {

	const isActiveTab = tab => {
		if (tab === location.pathname) {
			return 'active-nav smaller-text-bold citrusGrey hover'
		}
		return 'smaller-text-bold citrusGrey hover'
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
						<div className='mobile-drawer'>
							<MobileDrawer
								history={history}
								currentFocus={focus => setDashboardFocus(focus)}
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
						<Link to='/home'>
							<span className={isActiveTab('/home')}>
								{capitalize(t('home'))}
							</span>
						</Link>
						<Link to='/explore'>
							<span className={isActiveTab('/explore')}>
								{capitalize(t('explore'))}
							</span>
						</Link>
						<Link to='/schedule'>
							<span className={isActiveTab('/schedule')}>
								{capitalize(t('post'))}
							</span>
						</Link>
						<Link to='/profile'>
							<span className={isActiveTab('/profile')}>
								{capitalize(t('profile'))}
							</span>
						</Link>
						<Link to='/settings'>
							<span className={isActiveTab('/settings')}>
								{capitalize(t('settings'))}
							</span>
						</Link>
						<div
							onClick={logout}
							className='medium-text hover logout small-button'
						>
							<span className='small-text-bold citrusWhite'>
								{capitalize(t('logOut'))}
							</span>
						</div>
					</>
				}
			</header>
			<div className='children'>{children}</div>
			<footer className='footer flex-row'>
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
					.header {
						justify-content: space-between;
						align-items: center;
						position: fixed;
						top: 0;
						background-color: #FFF;
						z-index: 13;
						height: 80px;
						width: 95%;
						margin: 0 2.5%;
					}
					.header-left-box {
						height: 80px;
						justify-content: center;
						align-items: center;
						display: flex;
					}
					.logo {
						height: 30px;
						width: 197px;
					}
					.contact-row {
						justify-content: space-between;
    				width: 100%;
						padding: 20px;
					}
					.children {
						flex: 1;
						margin-top: 80px;
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
	setDashboardFocus: focus => dispatch(setDashboardFocus(focus))
})

export default connect(mapStateToProps, mapDispatchToProps)(withRouter((withTranslation()(Layout))))
