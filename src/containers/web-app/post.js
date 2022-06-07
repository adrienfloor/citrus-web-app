import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import {
	capitalize,
	countryCodeToLanguage,
	returnCurrency
} from '../../utils/various'

import { loadWebviewUser } from '../../actions/auth-actions'
import Schedule from './schedule'
import Program from './program'

class Post extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			activeTabIndex: 1
		}
	}

	render() {
		const { activeTabIndex } = this.state
        const { location, t } = this.props
        const isWebview = location && location.pathname === '/post-webview'

		return (
			<div className='main-container'>
				{
					!isWebview &&
					<span className='big-title citrusBlack responsive-title'>
						{capitalize(t('post'))}
					</span>
				}
				<div className='scroll-div-vertical card upload-form schedule'>
					{
						!isWebview &&
						<>
							<div className='medium-separator'></div>
							<div className='small-separator'></div>
						</>
					}
					<div className='small-responsive-title-settings' style={{ display: 'flex' }}>
						<div
                            className={activeTabIndex === 0 ?  'active-tab hover' : 'tab hover'}
                            onClick={() => this.setState({ activeTabIndex: 0 })}
                        >
							<span className={activeTabIndex === 0 ? 'small-title citrusBlack' : 'small-title citrusGrey'}>
								{capitalize(t('newTraining'))}
							</span>
						</div>
						<div
                            className={activeTabIndex === 1 ?  'active-tab hover' : 'tab hover'}
                            onClick={() => this.setState({ activeTabIndex: 1 })}
                        >
							<span className={activeTabIndex === 1 ? 'small-title citrusBlack' : 'small-title citrusGrey'}>
								{capitalize(t('newTrainingProgram'))}
							</span>
						</div>
					</div>
                    {
                        activeTabIndex === 0 ?
                        <Schedule location={location} /> :
                        <Program location={location} />
                    }
					{ isWebview && <div className='medium-separator'></div> }
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Post))