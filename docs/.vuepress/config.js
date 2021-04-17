const { resolve } = require('path');

module.exports = {
  title: 'RIE',
  description: 'Render it easily - 让页面渲染更容易',
  dest: resolve(__dirname, '../dist'),
  cache: resolve(__dirname, '../cache'),
  head: [
    ['link', { rel: 'icon', href: '/img/rie.ico' }],
  ],
};
