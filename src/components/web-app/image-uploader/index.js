import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom'
import Cropper from 'react-easy-crop'
import Slider from '@material-ui/core/Slider'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import ImgDialog from './ImgDialog'
import getCroppedImg from './cropImage'
import { styles } from './styles'

import { capitalize } from '../../../utils/various'

// const imgToCrop =
// 	'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg?cache=sih0jwle4e&ops=1910_1000'

const ImageCropper = ({ classes, imgToCrop, onComplete, t }) => {
	const [crop, setCrop] = useState({ x: 0, y: 0 })
	const [rotation, setRotation] = useState(0)
	const [zoom, setZoom] = useState(1)
	const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
	const [croppedImage, setCroppedImage] = useState(null)

	const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
		setCroppedAreaPixels(croppedAreaPixels)
	}, [])

	const submitCroppedImage = useCallback(async () => {
		try {
			const croppedImage = await getCroppedImg(
				imgToCrop,
				croppedAreaPixels,
				rotation
			)
			console.log('donee', { croppedImage })
			onComplete(croppedImage)
			// setCroppedImage(croppedImage)
		} catch (e) {
			console.error(e)
		}
	}, [croppedAreaPixels, rotation])

	const onClose = useCallback(() => {
		setCroppedImage(null)
	}, [])

	return (
		<div>
			<div className={classes.cropContainer}>
				<Cropper
					image={imgToCrop}
					crop={crop}
					rotation={rotation}
					zoom={zoom}
					aspect={3 / 2}
					onCropChange={setCrop}
					onRotationChange={setRotation}
					onCropComplete={onCropComplete}
					onZoomChange={setZoom}
				/>
			</div>
			<div className={classes.controls}>
				<div className={classes.sliderContainer}>
					<Typography
						variant="overline"
						classes={{ root: classes.sliderLabel }}
					>
						Zoom
					</Typography>
					<Slider
						value={zoom}
						min={1}
						max={3}
						step={0.1}
						aria-labelledby="Zoom"
						classes={{ root: classes.slider }}
						onChange={(e, zoom) => setZoom(zoom)}
					/>
				</div>
				<div className={classes.sliderContainer}>
					<Typography
						variant="overline"
						classes={{ root: classes.sliderLabel }}
					>
						Rotation
					</Typography>
					<Slider
						value={rotation}
						min={0}
						max={360}
						step={1}
						aria-labelledby="Rotation"
						classes={{ root: classes.slider }}
						onChange={(e, rotation) => setRotation(rotation)}
					/>
				</div>
				<Button
					onClick={submitCroppedImage}
					variant="contained"
					color="primary"
					classes={{ root: classes.cropButton }}
				>
					{capitalize(t('submit'))}
				</Button>
			</div>
			<ImgDialog img={croppedImage} onClose={onClose} />
		</div>
	)
}

const StyledImageCropper = withStyles(styles)(ImageCropper)

export default StyledImageCropper
