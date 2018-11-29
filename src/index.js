import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import UpdateProxy from './UpdateProxy';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';

var updateProxy = new UpdateProxy();
ReactDOM.render(<BrowserRouter><App updateProxy={updateProxy} /></BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register({ onUpdate: function(registration) {
  registration.skipWaiting();
  updateProxy.notify();
}});
