const React = require('react');
const {Text} = require('ink');
const {resolveBaseDir} = require('../utils/config');

function App() {
  const baseDir = resolveBaseDir();

  return React.createElement(Text, null, `drill base dir: ${baseDir}`);
}

module.exports = App;
