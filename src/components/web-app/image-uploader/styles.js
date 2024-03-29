export const styles = (theme) => ({
	cropContainer: {
		position: 'relative',
		width: '100%',
		height: 200,
		background: '#333',
		[theme.breakpoints.up('sm')]: {
			height: 400,
		},
	},
	cropButton: {
		flexShrink: 0,
		marginLeft: 16,
		[theme.breakpoints.down('sm')]: {
			marginLeft: 0
		}
	},
	controls: {
		padding: 16,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		[theme.breakpoints.up('md')]: {
			flexDirection: 'row',
			alignItems: 'center',
		},
	},
	sliderContainer: {
		display: 'flex',
		flex: '1',
		alignItems: 'center',
	},
	sliderLabel: {
		[theme.breakpoints.down('xs')]: {
			minWidth: 65,
		},
	},
	slider: {
		padding: '22px 0px',
		marginLeft: 32,
		[theme.breakpoints.up('sm')]: {
			flexDirection: 'row',
			alignItems: 'center',
			margin: '0 16px',
		},
	},
	buttonsContainer: {
		width: '30%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		[theme.breakpoints.down('sm')]: {
			flexDirection: 'column-reverse',
			width: '100%',
			height: '80px',
			justifyContent: 'space-around'
		}
	}
})
