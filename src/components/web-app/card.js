import React from 'react'
import Rating from '@material-ui/lab/Rating'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { capitalize } from '../../utils/various'
import { Height } from '@material-ui/icons'

const Card = ({ onClick, title, subtitle, imgUri, size, fullWidth, rating, hasCheckSign }) => {

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
							minHeight: fullWidth ? '100%' : '200px',
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'flex-end'
						}}>
						{
							hasCheckSign &&
							<img
								src='https://res.cloudinary.com/dho1rqbwk/image/upload/v1651153384/VonageApp/check-one.2048x2048_plpbkv.png'
								width={25}
								height={25}
								style={{ margin: '0 5px 5px 0' }}
							/>
						}
					</div>
				</div>
				<div className='small-separator'></div>
				<div className='textContainer'>
					{
						title && title.length > 0 &&
						<span
							className='small-title citrusBlack title-row'
							style={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
						>
							{title}
							{
								rating && rating.rating &&
								<Rating
									precision={0.5}
									size='small'
									value={rating.rating}
									readOnly
									style={{ marginLeft: '5px', marginTop: '2px' }}
								/>
							}
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
					.title-row {
						display: flex;
						align-items: center;
					}
					@media only screen and (max-width: 640px) {
						.full-width-image {
							min-height: 235px;
						}
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
					'fullWidthContainer' :
					'card-container'
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
