import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'

import {
	capitalize
} from '../utils/various'

const useStyles = makeStyles({
	option: {
		fontSize: 15,
		'& > span': {
			marginRight: 10,
			fontSize: 18
		},
	},
})

export default function GenericSelector({ items, onSelect, name, style, t }) {
	const classes = useStyles()

	return (
		<Autocomplete
			onChange={(e, item) => item ? onSelect(item) : onSelect('')}
			style={style}
			options={items}
			classes={{ option: classes.option }}
			autoHighlight
			getOptionLabel={option => capitalize(t(option))}
			renderOption={option => (
				<React.Fragment>
					<span>{capitalize(t(option))}</span>
				</React.Fragment>
			)}
			renderInput={params => (
				<TextField
					{...params}
					variant='outlined'
					label={capitalize(name)}
					inputProps={{
						...params.inputProps
					}}
				/>
			)}
		/>
	)
}