import 'material-design-icons/iconfont/material-icons.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as WebFont from 'webfontloader';
import './main.css';
import './main.scss';
import { Page } from './Page';

WebFont.load({
  active: () => {
    document.documentElement.className += ' fonts-loaded';
  },
  fontinactive: () => {
    throw new Error('Fonts could not be loaded!');
  },
  google: {
    families: ['Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i'],
  },
});

ReactDOM.render(
    <Page />,
    document.getElementById('__ROOT__'),
);
