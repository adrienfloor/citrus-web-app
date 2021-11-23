import React from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import Loader from 'react-loader-spinner'
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css'
import FileBase64 from 'react-file-base64'
import { Link } from 'react-router-dom'
import Tooltip from '@material-ui/core/Tooltip'

import '../../../styling/headings.css'
import '../../../styling/colors.css'
import '../../../styling/buttons.css'
import '../../../styling/spacings.css'
import '../../../styling/App.css'

import { ReactComponent as CaretBack } from '../../../assets/svg/caret-left.svg'
import { ReactComponent as Close } from '../../../assets/svg/close.svg'

import {
	capitalize
} from '../../../utils/various'
import {
	createMpKycDocument,
	createMpKycPage,
	submitMpKycDocument,
	fetchKycsOfAUser,
	fetchMpUserInfo
} from '../../../services/mangopay'

import { setNotification } from '../../../actions/notifications-actions'

let mpUserKycs

class Kyc extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			identityProof: '',
			identityProofFileName: '',
			articlesOfAssociation: '',
			articlesOfAssociationFileName: '',
			registrationProof: '',
			registrationProofFileName: '',
			isLoading: true,
			warningMessage: '',
			success: false,
			loadingMessage: ''
		}

		fetchKycsOfAUser(this.props.user.MPLegalUserId)
			.then(res => {
				mpUserKycs = res
				this.setState({ isLoading: false })
			})

		this.handleSubmit = this.handleSubmit.bind(this)
		this.getFiles = this.getFiles.bind(this)
		this.returnKycDocStatus = this.returnKycDocStatus.bind(this)
		this.handleSubmitDocuments = this.handleSubmitDocuments.bind(this)
		this.returnSubmitButtonState = this.returnSubmitButtonState.bind(this)
	}

	returnKycDocStatus(type) {
		const kycDoc = mpUserKycs.filter(kyc => kyc.Type === type)
		if (kycDoc.length === 0) {
			return 'NOT_SUBMITTED'
		}
		if (kycDoc.length === 1) {
			const isValidated = kycDoc[0].Status === 'VALIDATED'
			const isInProgress = kycDoc[0].Status === 'VALIDATION_ASKED'
			const isBeingCreated = kycDoc[0].Status === 'CREATED'
			const isRefused = kycDoc[0].Status === 'REFUSED'
			if (isValidated) { return 'VALIDATED' }
			if (isInProgress) { return 'VALIDATION_ASKED' }
			if (isBeingCreated) { return null }
			return 'REFUSED'
		}
		if (kycDoc.length > 1) {
			const isValidated = kycDoc.find(doc => doc.Status === 'VALIDATED')
			const isInProgress = kycDoc.find(doc => doc.Status === 'VALIDATION_ASKED')
			const isRefused = kycDoc.find(doc => doc.Status === 'REFUSED')
			if (isRefused) {
				if (isValidated) { return 'VALIDATED' }
				if (isInProgress) { return 'VALIDATION_ASKED' }
				return 'REFUSED'
			} else {
				if (isValidated) { return 'VALIDATED' }
				if (isInProgress) { return 'VALIDATION_ASKED' }
			}
		}
	}

	returnTrueIfValidatedOrAskedForValidation(type1, type2) {
		if(type1 === 'VALIDATION_ASKED' && type2 === 'VALIDATION_ASKED') {
			return true
		}
		if (type1 === 'VALIDATED' && type2 === 'VALIDATED') {
			return true
		}
		if(type1 === 'VALIDATED' && type2 === 'VALIDATION_ASKED') {
			return true
		}
		if(type1 === 'VALIDATION_ASKED' && type2 === 'VALIDATED') {
			return true
		}
		return false
	}

	returnSubmitButtonState() {
		const { mpLegalUserInfo } = this.props
		const isSoletrader = mpLegalUserInfo && mpLegalUserInfo.LegalPersonType == 'SOLETRADER'

		if (isSoletrader) {
			// Soletrader type only need these two KYC documents
			if (
				this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATED' &&
				this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATED'
			) {
				return 'VALIDATED'
			}
			if (
				(this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATION_ASKED' &&
				this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATION_ASKED') ||
				(this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATED' &&
				this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATION_ASKED') ||
				(this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATION_ASKED' &&
				this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATED')
			) {
				return 'VALIDATION_ASKED'
			}
		} else {
			if (
				this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATED' &&
				this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'VALIDATED' &&
				this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATED'
			) {
				return 'VALIDATED'
			}
			if (
				(this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATION_ASKED' &&
				this.returnTrueIfValidatedOrAskedForValidation(
					this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION'),
					this.returnKycDocStatus('REGISTRATION_PROOF')
				)) ||
				(this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'VALIDATION_ASKED' &&
				this.returnTrueIfValidatedOrAskedForValidation(
					this.returnKycDocStatus('IDENTITY_PROOF'),
					this.returnKycDocStatus('REGISTRATION_PROOF')
				)) ||
				(this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATION_ASKED' &&
				this.returnTrueIfValidatedOrAskedForValidation(
					this.returnKycDocStatus('IDENTITY_PROOF'),
					this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION')
				))
			) {
				return 'VALIDATION_ASKED'
			}
		}
		return 'NOT_SUBMITTED'
	}

	getFiles(file, fileName) {
		const statePropertyOfFile = `${fileName}FileName`
		this.setState({ [statePropertyOfFile]: file.name })
		const data = file.base64
		const arr = data.split((','))
		arr.shift()
		const cleanedFile = arr.join('')
		this.setState({ [fileName]: cleanedFile })
	}

	async handleSubmitDocuments(e, isSoletrader) {

		const {
			identityProof,
			articlesOfAssociation,
			registrationProof
		} = this.state
		const { t, setNotification } = this.props

		e.preventDefault()

		if (
			!identityProof &&
			!registrationProof &&
			!articlesOfAssociation
		) {
			this.setState({
				isLoading: false,
				warningMessage: capitalize(t('pleaseSelectADocument'))
			})
			setTimeout(function () {
				this.setState({
					warningMessage: ''
				})
			}.bind(this), 3000)
			return
		}

		// if(isSoletrader) {
		// 	if (
		// 		!identityProof ||
		// 		!registrationProof
		// 	) {
		// 		return this.setState({
		// 			isLoading: false,
		// 			warningMessage: capitalize(t('pleaseSelectAllDocuments'))
		// 		})
		// 	}
		// } else {
		// 	if (
		// 		!identityProof ||
		// 		!articlesOfAssociation ||
		// 		!registrationProof
		// 	) {
		// 		return this.setState({
		// 			isLoading: false,
		// 			warningMessage: capitalize(t('pleaseSelectAllDocuments'))
		// 		})
		// 	}
		// }

		if(identityProof) {
			this.handleSubmit('IDENTITY_PROOF', identityProof, isSoletrader)
		}
		if(articlesOfAssociation) {
			this.handleSubmit('ARTICLES_OF_ASSOCIATION', articlesOfAssociation, isSoletrader)
		}
		if(registrationProof) {
			this.handleSubmit('REGISTRATION_PROOF', registrationProof, isSoletrader)
		}
	}

	async handleSubmit(typeOfDocument, file, isSoletrader) {
		const { user, t, setNotification } = this.props
		const { MPLegalUserId } = user

		if (!file) return

		this.setState({ isLoading: true })

		if(typeOfDocument === 'IDENTITY_PROOF') {
			this.setState({
				loadingMessage: capitalize(t('sendingInProcess'))
			})
		}
		if (typeOfDocument === 'ARTICLES_OF_ASSOCIATION') {
			this.setState({
				loadingMessage: capitalize(t('sendingInProcess'))
			})
		}
		if (typeOfDocument === 'REGISTRATION_PROOF') {
			this.setState({
				loadingMessage: capitalize(t('sendingInProcess'))
			})
		}

		const { KYCDocumentId } = await createMpKycDocument(MPLegalUserId, typeOfDocument)
		const kycPage = await createMpKycPage(MPLegalUserId, KYCDocumentId, file)
		if (kycPage == 204) {
			submitMpKycDocument(MPLegalUserId, KYCDocumentId)
				.then(res => {
					if (res.Status == 'VALIDATION_ASKED') {
						fetchKycsOfAUser(MPLegalUserId)
							.then(res => {
								mpUserKycs = res
								this.setState({
									isLoading: false,
									loadingMessage: ''
								})
								setNotification({
									message: `${capitalize(t(typeOfDocument))} ${t('uploadedSuccessfully')}`
								})
							})
					}
				})
		} else {
			this.setState({
				warningMessage: capitalize(t('somethingWentWrongUploadingYourFile'))
			})
			return null
		}
	}

	render() {
		const {
			isLoading,
			warningMessage,
			success,
			identityProof,
			identityProofFileName,
			articlesOfAssociation,
			articlesOfAssociationFileName,
			registrationProof,
			registrationProofFileName,
			loadingMessage
		} = this.state

		const {
			t,
			onClose,
			mpLegalUserInfo
		} = this.props

		if (isLoading) {
			return (
				<div className='flex-column flex-center'>
					<Loader
						type='Oval'
						color='#C2C2C2'
						height={50}
						width={50}
					/>
					<div className='small-separator'></div>
					<span class='small-text-bold citrusGrey'>
						{loadingMessage}
					</span>
				</div>
			)
		}

		return (
			<div className='flex-column'>
				<div className='flex-column'>
					{/*  IDENTITY PROOF */}
					<div className='small-separator'></div>
					<span className='small-text-bold'>{capitalize(t('identityProof'))}</span>
					{
						this.returnKycDocStatus('IDENTITY_PROOF') === 'REFUSED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusRed'>{capitalize(t('kycRefused'))}</span>
						</div>
					}
					{
						this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATION_ASKED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusGrey'>{capitalize(t('validationInProgress'))}</span>
						</div>
					}
					{
						this.returnKycDocStatus('IDENTITY_PROOF') === 'VALIDATED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusGrey'>{capitalize(t('validationSucceeded'))}</span>
						</div>
					}
					<div className='row flex-row upload-row'>
						{
							(this.returnKycDocStatus('IDENTITY_PROOF') === 'REFUSED' ||
							this.returnKycDocStatus('IDENTITY_PROOF') === 'NOT_SUBMITTED') &&
							<>
								{
									!identityProof &&
									<label className="custom-empty-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'identityProof')}
										/>
										<span className='smaller-text-bold citrusBlue'>{t('selectAFile')}</span>
									</label>
								}
								{
									identityProofFileName &&
									<div style={{ maxWidth: '454px' }}>
										<span
											className='small-text file-name'
											style={{ marginRight: '10px' }}
										>
											{identityProofFileName}
										</span>
										<label className="custom-file-upload">
											<FileBase64
												multiple={false}
												onDone={file => this.getFiles(file, 'identityProof')}
											/>
											<span className='smaller-text-bold citrusBlue'>{t('change')}</span>
										</label>
									</div>
								}
							</>
						}
					</div>

					{/*  ARTICLES OF ASSOCIATION PROOF */}
					<div className='medium-separator'></div>
					{
						mpLegalUserInfo && mpLegalUserInfo.LegalPersonType !== 'SOLETRADER' &&
						<>
							<span className='small-text-bold'>{capitalize(t('articlesOfAssociation'))}</span>
							{
								this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'REFUSED' &&
								<div>
									<div className='small-separator'></div>
									<span className='smaller-text citrusRed'>{capitalize(t('kycRefused'))}</span>
								</div>
							}
							{
								this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'VALIDATION_ASKED' &&
								<div>
									<div className='small-separator'></div>
									<span className='smaller-text citrusGrey'>{capitalize(t('validationInProgress'))}</span>
								</div>
							}
							{
								this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'VALIDATED' &&
								<div>
									<div className='small-separator'></div>
									<span className='smaller-text citrusGrey'>{capitalize(t('validationSucceeded'))}</span>
								</div>
							}
							<div className='row flex-row upload-row'>
								{
									(this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'REFUSED' ||
									this.returnKycDocStatus('ARTICLES_OF_ASSOCIATION') === 'NOT_SUBMITTED') &&
									<>
										{
											!articlesOfAssociation &&
											<label className="custom-empty-file-upload">
												<FileBase64
													multiple={false}
													onDone={file => this.getFiles(file, 'articlesOfAssociation')}
												/>
												<span className='smaller-text-bold citrusBlue'>{t('selectAFile')}</span>
											</label>
										}
										{
											articlesOfAssociationFileName &&
											<div style={{ maxWidth: '454px' }}>
												<span
													className='small-text file-name'
													style={{ marginRight: '10px' }}
												>
													{articlesOfAssociationFileName}
												</span>
												<label className="custom-file-upload">
													<FileBase64
														multiple={false}
														onDone={file => this.getFiles(file, 'articlesOfAssociation')}
													/>
													<span className='smaller-text-bold citrusBlue'>{t('change')}</span>
												</label>
											</div>
										}
									</>
								}
							</div>
						</>
					}

					{/*  REGISTRATION PROOF */}
					<div className='medium-separator'></div>
					<span className='small-text-bold'>{capitalize(t('registrationProof'))}</span>
					{
						this.returnKycDocStatus('REGISTRATION_PROOF') === 'REFUSED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusRed'>{capitalize(t('kycRefused'))}</span>
						</div>
					}
					{
						this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATION_ASKED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusGrey'>{capitalize(t('validationInProgress'))}</span>
						</div>
					}
					{
						this.returnKycDocStatus('REGISTRATION_PROOF') === 'VALIDATED' &&
						<div>
							<div className='small-separator'></div>
							<span className='smaller-text citrusGrey'>{capitalize(t('validationSucceeded'))}</span>
						</div>
					}
						<div className='row flex-row upload-row'>
						{
							(this.returnKycDocStatus('REGISTRATION_PROOF') === 'REFUSED' ||
							this.returnKycDocStatus('REGISTRATION_PROOF') === 'NOT_SUBMITTED') &&
							<>
								{
									!registrationProof &&
									<label className="custom-empty-file-upload">
										<FileBase64
											multiple={false}
											onDone={file => this.getFiles(file, 'registrationProof')}
										/>
										<span className='smaller-text-bold citrusBlue'>{t('selectAFile')}</span>
									</label>
								}
								{
									registrationProofFileName &&
									<div style={{ maxWidth: '454px' }}>
										<span
											className='small-text file-name'
											style={{ marginRight: '10px' }}
										>
											{registrationProofFileName}
										</span>
										<label className="custom-file-upload">
											<FileBase64
												multiple={false}
												onDone={file => this.getFiles(file, 'registrationProof')}
											/>
											<span className='smaller-text-bold citrusBlue'>{t('change')}</span>
										</label>
									</div>
								}
							</>
						}
					</div>
					<div className='small-separator'></div>
					<div className='medium-separator'></div>
					<div style={{ width: '100%' }}>
						{
							this.returnSubmitButtonState() === 'VALIDATED' &&
							<Tooltip title={capitalize(t('kycValidated'))}>
								<div
									className='disabled-button'
									onClick={() => {}}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('kycValidated'))}
									</span>
								</div>
							</Tooltip>
						}
						{
							this.returnSubmitButtonState() === 'VALIDATION_ASKED' &&
							<Tooltip title={capitalize(t('kycInValidation'))}>
								<div
									className='disabled-button'
									onClick={() => { }}
								>
									<span className='small-title citrusWhite'>
										{capitalize(t('kycInValidation'))}
									</span>
								</div>
							</Tooltip>
						}
						{
							this.returnSubmitButtonState() === 'NOT_SUBMITTED' &&
							<div
								className='filled-button'
								onClick={e => this.handleSubmitDocuments(e, mpLegalUserInfo.LegalPersonType == 'SOLETRADER')}
							>
								<span className='small-title citrusWhite'>
									{capitalize(t('submitKycDocuments'))}
								</span>
							</div>
						}
					</div>
					<div className='small-separator'></div>
					<span
						className='smaller-text-bold citrusRed'
						style={{ textAlign: 'center' }}
					>
						{warningMessage}
					</span>
				</div>
				<style jsx='true'>
					{`
						.row {
							width: 100%;
						}
						.upload-row {
							justify-content: space-between;
							align-items: center;
							margin-top: 10px;
						}
						input[type="file"] {
							display: none;
						}
						.custom-empty-file-upload {
							display: inline-block;
							cursor: pointer;
							background-color: #FFFFFF;
							display: flex;
							justify-content: center;
							align-items: center;
							color: #0075FF;
						}
						.custom-file-upload {
							display: inline-block;
							cursor: pointer;
							font-family: Raleway-Bold;
							font-style: normal;
							font-weight: bold !important;
							font-size: 20px;
							line-height: 23px;
							color: #0075FF;
						}
						.file-name {
							max-width: 150px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					`}
				</style>
			</div>
		)
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
	error: state.error
})

const mapDispatchToProps = dispatch => ({
	setNotification: notif => dispatch(setNotification(notif))
})

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Kyc))