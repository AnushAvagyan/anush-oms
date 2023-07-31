import React from 'react';
import Image from 'next/image';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import {
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Link from 'next/link';

export default function NavDrawer(props: any) {
  return (
    <div id="side-navigation" className={'drawer-open'}>
      <div id="menu">
        <header>
          <Link href="/">
            <Image
              className="logo"
              alt="logo"
              src={'/images/logo.png'}
              height={100}
              width={100}
              priority
            />
          </Link>
        </header>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <LocalGroceryStoreIcon />
          </ListItemIcon>
          <ListItemText primary="OMS Administration" />
        </ListItem>
        <ListItemButton className="sub-item" href="/admin/products">
          <ListItemText inset primary="Products" />
        </ListItemButton>
        <ListItemButton className="sub-item" href="/admin/orders">
          <ListItemText inset primary="Orders" />
        </ListItemButton>
        <Divider />
      </div>
    </div>
  );
}
