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

import { ReactComponent as User } from '../assets/svg/user.svg'
import { ReactComponent as Card } from '../assets/svg/card.svg'
import { ReactComponent as Stats } from '../assets/svg/stats.svg'
import { ReactComponent as Invoice } from '../assets/svg/invoice.svg'
import { ReactComponent as History} from '../assets/svg/history.svg'
import { ReactComponent as Receipt } from '../assets/svg/receipt.svg'
import { ReactComponent as Money } from '../assets/svg/money.svg'
import { ReactComponent as Burger } from '../assets/svg/burger.svg'


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
			<div className={`${classes.padded} small-title drawer-title`}>
				{capitalize(t('account'))}
			</div>
			<List>
				<ListItem
					button
					onClick={() => currentFocus('profile')}
				>
					<ListItemIcon>
						<User />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('profile'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('managePayments')}
				>
					<ListItemIcon>
						<Card />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('managePayments'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('invoices')}
				>
					<ListItemIcon>
						<Invoice />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('invoices'))} />
				</ListItem>
			</List>
			<div className={`${classes.padded} small-title drawer-title`}>
				{capitalize(t('videos'))}
			</div>
			<List>
				<ListItem
					button
					onClick={() => currentFocus('stats')}
				>
					<ListItemIcon>
						<Stats />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('stats'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('paymentsReceipts')}
				>
					<ListItemIcon>
						<Receipt />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('paymentsReceipts'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('paymentsHistory')}
				>
					<ListItemIcon>
						<History />
					</ListItemIcon>
					<ListItemText primary={capitalize(t('paymentsHistory'))} />
				</ListItem>
				<ListItem
					button
					onClick={() => currentFocus('cashOut')}
				>
					<ListItemIcon>
						<Money />
					</ListItemIcon>
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
						<Burger />
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