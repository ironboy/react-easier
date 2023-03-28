import React from 'react';
import { Outlet as RRDOutlet } from 'react-router-dom';

export function Outlet() {
  return React.createElement(RRDOutlet, { key: Math.random() });
}