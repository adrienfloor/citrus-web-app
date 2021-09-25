import React from 'react'

import '../../styling/headings.css'
import '../../styling/colors.css'
import '../../styling/buttons.css'
import '../../styling/spacings.css'
import '../../styling/App.css'
import '../../styling/web-app.css'

import { capitalize } from '../../utils/various'

const Tag = ({ onClick, textValue, defaultTextValue }) => {
	return (
		<div
			className={onClick ? 'tag-container hover' : 'tag-container'}
			onClick={onClick ? () => onClick() : () => {}}
		>
			<span className='small-text-bold'>
				{
					textValue && textValue.length > 0 ?
						capitalize(textValue) :
						capitalize(defaultTextValue)
				}
			</span>
			<style jsx='true'>
				{`
					.tag-container {
						display: flex;
						height: 30px;
						justify-content: center;
						align-items: center;
						padding: 0 10px;
						border: 1px solid #000000;
						margin-bottom: 10px;
						margin-right: 10px;
						background-color: #FFFFFF;
					}
				`}
			</style>
		</div>
	)
}

export default Tag

