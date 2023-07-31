import NavDrawer from './navigation-drawer';
import React from 'react';

export default function Layout({ children, session }) {
  return (
    <>
      <div className="cc-wrapper">
        <NavDrawer />
        <main id="main-window" className="slide-left">
          {children}
        </main>
      </div>
    </>
  );
}
