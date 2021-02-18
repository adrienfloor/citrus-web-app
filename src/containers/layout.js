import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import { logout } from '../actions/auth-actions'
import { setDashboardFocus } from '../actions/navigation-actions'
import MobileDrawer from '../components/mobile-drawer'

const logoUri = 'https://res.cloudinary.com/dho1rqbwk/image/upload/v1606236962/VonageApp/logos/citrus_logo_small.png'

const Layout = ({ logout, isAuthenticated, children, setDashboardFocus, isDashboard }) => {
	return (
		<div
			className='full-container flex-column'
			style={{ justifyContent: 'space-between' }}
		>
			<header className='header flex-row'>
				<div className='header-left-box'>
					{
						isDashboard &&
						<div className='mobile-drawer'>
							<MobileDrawer
								currentFocus={focus => setDashboardFocus(focus)}
							/>
						</div>
					}
					<a href='http://localhost:3000/dashboard'>
						<img
							className={isDashboard ? 'logo' : 'logo margin-logo'}
							src={logoUri}
							alt='citrus-logo'
						/>
					</a>
					{/* <div className='small-text slogan'>
						Boost your body
					</div>
					<div className='small-text slogan'>
						and your wallet
					</div> */}
				</div>
				{
					isAuthenticated &&
					<div
						onClick={logout}
						className='medium-text hover logout'
					>
						Log out
					</div>
				}
			</header>
			<div className='children'>{children}</div>
			<footer className='footer flex-row flex-center'>
				<div className='flex-row flex-center contact-row white'>
					{/* <a target='_blank' className='small-text' href='https://thecitrusapp.com'>Legals</a> */}
					<a target='_blank' className='small-text' href='https://thecitrusapp.com'>Terms</a>
					<a target='_blank' className='small-text' href='https://thecitrusapp.com'>CGU/GGV</a>
					<a href="mailto:contact@thecitrusapp.com" className='small-text'>Contact</a>
					<a target='_blank' className='small-text' href='https://thecitrusapp.com'>FAQ</a>
				</div>
			</footer>
			<style jsx='true'>
				{`
					.header {
						justify-content: space-between;
						position: sticky;
						top: 0;
						background-color: #FFF;
						z-index: 12;
					}
					.logo {
						height: 58px;
						width: 161px;
						margin-bottom: 5px;
					}
					.header-left-box {
						padding: 1% 0 0 1%;
					}
					.logout {
						padding: 1% 1% 0 0;
					}
					.footer {
						background-color: #FF8832;
						position: sticky;
						bottom: 0;
					}
					.contact-row {
						width: 300px;
						height: 70px;
						justify-content: space-around;
					}
					.children {
						min-height: 80%;
					}
					.hover:hover {
						cursor: pointer;
					}
					@media only screen and (max-width: 640px) {
						.header {
							padding: 10px 10px 10px 0;
						}
						.footer {
							height: 5%;
							padding: 20px;
							background-color: #FF8832;
							z-index: 666;
							margin-top: 5%;
							position: fixed;
							width: 100%;
						}
						.logo {
							width: 80px;
							height: 30px;
						}
						.slogan {
							display: none;
						}
						.header-left-box {
							display: flex;
							flex-direction: row;
						}
						.contact-row {
							flex-direction: row;
						}
						.children {
							height: 100%;
						}
						.margin-logo {
							margin-left: 10px;
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Layout))
