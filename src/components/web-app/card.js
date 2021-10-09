import React from 'react'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { capitalize } from '../../utils/various'

const Card = ({ onClick, title, subtitle, imgUri, size, fullWidth }) => {

	const imageType = `image${capitalize(size)}`
	if (onClick) {
		return (
			<div
				onClick={onClick}
				className={
					fullWidth ?
						'full-width-container hover' :
						'card-container hover'
				}
			>
				<div className={fullWidth ? 'full-width-image loadingImage' : `${imageType} loadingImage`}>
					<div
						style={{
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
							backgroundImage: `url(${imgUri})`,
							backgroundSize: 'cover',
							width: fullWidth ? '100%' : '300px',
							height: fullWidth ? '100%' : '200px'
						}}>
					</div>
				</div>
				<div className='small-separator'></div>
				<div className='textContainer'>
					{
						title && title.length > 0 &&
						<span className='small-title citrusBlack'>
							{title}
						</span>
					}
					{
						subtitle && subtitle.length > 0 &&
						<span className='smaller-text-bold citrusGrey'>
							{subtitle}
						</span>
					}
				</div>
				<style jsx='true'>
					{`
					.card-container {
						flex: 0;
						justify-content: center;
						align-items: flex-start;
						margin-right: 30px;
						min-width: 300px;
					}
					.imageSmall {
						height: 130px;
						width: 150px;
					}
					.imageMedium {
						max-height: 200px;
						max-width: 300px;
					}
					.imageLarge {
						height: 300px;
						width: 400px;
					}
					.textContainer {
						display: flex;
						flex-direction: column;
					}
					.loadingImage {
						background-color: #EFEFEF;
					}
				`}
				</style>
			</div>
		)
	}
	return (
		<div
			className={
				fullWidth ?
					'fullWidthContainer hover' :
					'card-container hover'
			}
		>
			<div
				className={fullWidth ? 'fullWidthImage loadingImage' : `${imageType} loadingImage`}
			>
				<img
					className={fullWidth ? 'fullWidthImage' : imageType}
					src={imgUri}
				/>
			</div>
			<div className='small-separator'></div>
			<div className='textContainer'>
				{
					title && title.length > 0 &&
					<span className='small-title citrusBlack'>
						{title}
					</span>
				}
				{
					subtitle && subtitle.length > 0 &&
					<span className='smaller-text-bold citrusGrey'>
						{subtitle}
					</span>
				}
			</div>
			<style jsx='true'>
				{`
					.card-container {
						flex: 0;
						justify-content: center;
						align-items: flex-start;
						margin-right: 30px;
						min-width: 300px;
					}
					.fullWidthContainer {
						flex: 0;
						justify-content: center;
						align-items: flex-start;
						width: 100%;
						max-height: 100px;
						max-width: 100px;
						margin-bottom: 30px;
					}
					.imageSmall {
						max-height: 130px;
						max-width: 150px;
					}
					.imageMedium {
						max-height: 200px;
						max-width: 200px;
					}
					.imageLarge {
						max-height: 200px;
						max-width: 300px;
					}
					.fullWidthImage {
						height: 335px;
						width: 335px;
					}
					.textContainer {
						display: flex;
						flex-direction: column;
					}
					.loadingImage {
						background-color: #F8F8F8;
					}
				`}
			</style>
		</div>
	)
}

export default Card
