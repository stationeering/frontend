import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import UpdateManager from './UpdateManager';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';

var updateManager = <UpdateManager />
ReactDOM.render(<BrowserRouter><App updateManager={updateManager} /></BrowserRouter>, document.getElementById('root'));
registerServiceWorker(updateManager.notify);
