import React, { useState } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import MenuIcon from '@material-ui/icons/Menu'
import PersonIcon from '@material-ui/icons/Person'
import PaymentIcon from '@material-ui/icons/Payment'
import DescriptionIcon from '@material-ui/icons/Description'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import ReceiptIcon from '@material-ui/icons/Receipt'
import HistoryIcon from '@material-ui/icons/History'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'

import { withTranslation } from 'react-i18next'

import { capitalize } from '../utils/various'

const useStyles = makeStyles({
	list: {
		width: 250,
	},
	fullList: {
		width: 'auto'
	},
	padded: {
		padding: '0 10px'
	},
	menuButton: {
		minWidth: '40px'
	}
})

function MobileDrawer({ t, currentFocus }) {
	const classes = useStyles()
	const [open, setOpen] = useState(false)

	const toggleDrawer = (isOpen) => (event) => {
		if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
			return
		}
		setOpen(isOpen)
	}

	const list = (anchor) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === 'top' || anchor === 'bottom',
			})}
			role="presentation"
			onClick={toggleDrawer(false)}
			onKeyDown={toggleDrawer(false)}
		>
			<div className={`${classes.padded} big-text`}>
				{capitalize(t('myAccount'))}
			</div>
			<List>
				<ListItem
					button
					onClick={() => currentFocus('profile')}
				>
					<ListItemIcon>{<PersonIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('profile'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('managePayments')}
				>
					<ListItemIcon>{<PaymentIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('managePayments'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('invoices')}
				>
					<ListItemIcon>{<DescriptionIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('invoices'))} />
				</ListItem>
			</List>
			<Divider />
			<div className={`${classes.padded} big-text`}>
				{capitalize(t('myVideos'))}
			</div>
			<List>
				<ListItem
					button
					onClick={() => currentFocus('stats')}
				>
					<ListItemIcon>{<EqualizerIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('stats'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('paymentsReceipts')}
				>
					<ListItemIcon>{<ReceiptIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('paymentsReceipts'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('paymentsHistory')}
				>
					<ListItemIcon>{<HistoryIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('paymentsHistory'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('cashOut')}
				>
					<ListItemIcon>{<AttachMoneyIcon />}</ListItemIcon>
					<ListItemText primary={capitalize(t('cashOut'))} />
				</ListItem>
			</List>
		</div>
	)

	return (
		<div>
			{['left'].map((anchor) => (
				<React.Fragment key={anchor}>
					<Button
						className={classes.menuButton}
						onClick={toggleDrawer(!open)}
					>
						<MenuIcon />
					</Button>
					<Drawer
						anchor={anchor}
						open={open}
						onClose={toggleDrawer(false)}
					>
						{list(anchor)}
					</Drawer>
				</React.Fragment>
			))}
		</div>
	)
}

export default withTranslation()(MobileDrawer)