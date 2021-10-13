import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../styling/headings.css'
import '../styling/colors.css'
import '../styling/buttons.css'
import '../styling/spacings.css'
import '../styling/App.css'

import {
	capitalize,
	uppercase
} from '../utils/various'


class DownloadApp extends React.Component {
	render() {
		const {
			t,
			history
		} = this.props
		return (
			<div className='full-container flex-center flex-column download-app'>
				<div className='small-title wording'>{uppercase(t('welcome'))}</div>
				<div className='small-separator'></div>
				<div className='small-text wording'>{capitalize(t('youCanNowDownloadTheApp'))}.</div>
				<div className='small-separator'></div>
				<div className='small-text wording'>{capitalize(t('onceTheAppDownloaded'))}.</div>
				{/* TO BE REPLACED WITH THE APPSTORE LINK ONCE THE APP IS IN PRODUCTION */}
				<a className='mobile' href='itms-apps://?action=discover&referrer=app-store'>
					<img className='app-store-logo' src='https://www.petitprof.fr/wp-content/uploads/2019/11/App-Store-Logo_0.png' />
				</a>
				{/* TO BE REPLACED WITH THE APPSTORE QRCODE ONCE THE APP IS IN PRODUCTION */}
				<a className='desktop' href='#'>
					<img className='qr-code' src='https://res.cloudinary.com/dho1rqbwk/image/upload/v1620915909/VonageApp/logos/frame_1_ibso3p.png' />
				</a>
				<div className='medium-separator'></div>
				<div className='flex-center button-container'>
					<button className='filled-button' onClick={() => history.push('/choose-plan')}>
						<span className='small-title citrusWhite'>
							{capitalize(t('next'))}
						</span>
					</button>
				</div>
				<style jsx='true'>
					{`
					.wording {
						width: 96%;
						margin: 0 2%;
					}
					.qr-code {
						margin-top: 30px;
						max-width: 300px;
					}
					.app-store-logo {
						max-width: 300px;
					}
					.mobile {
						text-align: center;
					}
					.button-container {
						width: 100%;
					}
					@media only screen and (min-width: 640px) {
						.mobile {
							display: none;
						}
						.download-app {
							align-items: center;
						}
						.wording {
							text-align: center;
						}
					}
					@media only screen and (max-width: 640px) {
						.desktop {
							display: none;
						}
						.button-container {
							width: 96%;
							margin: 0 2%;
						}
					}
				`}
				</style>
			</div>
		)
	}
}

export default withTranslation()(DownloadApp)