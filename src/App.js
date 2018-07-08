import React, { Component } from 'react';
import ICSocket from './tools/ic/ICSocket';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <ICSocket />
      </div>
    );
  }
}

export default App;
