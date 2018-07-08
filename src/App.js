import React, { Component } from 'react';
import ICSocket from './tools/ic/ICSocket';
import { Link, Switch, Route } from 'react-router-dom';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Navigation />
        <Main />
      </div>
    );
  }
}

class Header extends Component {
  render() {
    return (
    <div className="header">
      <h1>Stationeering</h1>
      <p>An unoffical fan site for <a href="https://store.steampowered.com/app/544550/Stationeers/">Stationeers</a>!</p>
    </div>
    );
  }
}

class Navigation extends Component {
  render() {
    return (
    <div className="navigation">
      <ul>
        <li><Link to='/'>Homepage</Link></li>
        <li><Link to='/tools/ic'>IC Simulation</Link></li>
      </ul>
    </div>
    );
  }
}

class Home extends Component {
  render() {
    return (
      <div className="home">
        <p>Hello!</p>
      </div>
    )
  }
}

class Main extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" Component={Home} />
        <Route exact path="/tools/ic" component={ICSocket} />
      </Switch>
    );
  }
}

export default App;
