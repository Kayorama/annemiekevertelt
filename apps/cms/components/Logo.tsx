'use client';

import React from 'react';

export const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#C4A77D"/>
      <path d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V24C24 25.1046 23.1046 26 22 26H10C8.89543 26 8 25.1046 8 24V12Z" fill="#FDF6E9"/>
      <path d="M10 6C10 4.89543 10.8954 4 12 4H20C21.1046 4 22 4.89543 22 6V10H10V6Z" fill="#8B7355"/>
      <line x1="11" y1="14" x2="21" y2="14" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="18" x2="19" y2="18" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="22" x2="17" y2="22" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span style={{ 
      fontFamily: 'Georgia, serif', 
      fontSize: '18px', 
      fontWeight: 500,
      color: '#4A4036'
    }}>
      Annemieke Vertelt
    </span>
  </div>
);

export const Icon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#C4A77D"/>
    <path d="M8 12C8 10.8954 8.89543 10 10 10H22C23.1046 10 24 10.8954 24 12V24C24 25.1046 23.1046 26 22 26H10C8.89543 26 8 25.1046 8 24V12Z" fill="#FDF6E9"/>
    <path d="M10 6C10 4.89543 10.8954 4 12 4H20C21.1046 4 22 4.89543 22 6V10H10V6Z" fill="#8B7355"/>
    <line x1="11" y1="14" x2="21" y2="14" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11" y1="18" x2="19" y2="18" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="11" y1="22" x2="17" y2="22" stroke="#C4A77D" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
