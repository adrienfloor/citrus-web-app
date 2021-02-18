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
			<div className='full-container flex-column download-app'>
				<div className='big-title-light-weight wording'>{uppercase(t('welcome'))}</div>
				<div className='small-separator'></div>
				<div className='medium-text wording'>{capitalize(t('youCanNowDownloadTheApp'))}.</div>
				<div className='small-separator'></div>
				<div className='medium-text wording'>{capitalize(t('onceTheAppDownloaded'))}.</div>
				{/* TO BE REPLACED WITH THE APPSTORE LINK ONCE THE APP IS IN PRODUCTION */}
				<a className='mobile' href='#'>
					<img className='app-store-logo' src='data:image/png;base64,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' />
				</a>
				{/* TO BE REPLACED WITH THE APPSTORE QRCODE ONCE THE APP IS IN PRODUCTION */}
				<a className='desktop' href='#'>
					<img className='qr-code' src='https://thierry-leriche-dessirier.developpez.com/tutoriels/java/creer-qrcode-zxing-java2d-5-min/images/qrcode-08.png' />
				</a>
				<div className='medium-separator'></div>
				<div style={{ width: '100%' }} className='flex-center'>
					<button className='next-action-button' onClick={() => history.push('/choose-plan')}>
						{capitalize(t('next'))}
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
						max-width: 250px;
					}
					.app-store-logo {
						max-width: 250px;
					}
					.mobile {
						text-align: center;
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
					}
				`}
				</style>
			</div>
		)
	}
}

export default withTranslation()(DownloadApp)