import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import UpdateProxy from './UpdateProxy';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

var updateProxy = new UpdateProxy();
ReactDOM.render(<BrowserRouter><App updateProxy={updateProxy} /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker(updateProxy.notify);
