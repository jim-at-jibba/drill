#!/usr/bin/env node
'use strict';

const React = require('react');
const {render, Text} = require('ink');
const App = require('./ui/App');

const app = React.createElement(App, {});

render(app);
