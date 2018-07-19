import React, { Component } from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import ICSocket from './tools/ic/ICSocket';
import Recent from './versions/Recent';
import Home from './home/Home';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSteam } from '@fortawesome/free-brands-svg-icons';

import './App.css';
library.add(faSteam);

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar>
          <Header />
          <Navigation />
        </Navbar>
        <Main />
        <footer className="footer">
          <small>
              stationeering.com is a fan website about <a href="https://store.steampowered.com/app/544550/Stationeers/">Stationeers</a> run by Melair.
              The source code and infrastructure configuration is available for this website at <a href="https://github.com/stationeering">GitHub</a>.
              <br />
              Stationeers content and materials are trademarks and copyrights of RocketWerkz Ltd and its licensors.
          </small>
        </footer>
      </div>
    );
  }
}

class Header extends Component {
  render() {
    return (
      <Navbar.Header>
        <Navbar.Brand>
          <NavLink to='/'>Stationeering</NavLink>
        </Navbar.Brand>
      </Navbar.Header>
    );
  }
}

class Navigation extends Component {
  render() {
    return (
      <Nav>
        <NavItem componentClass={NavLink} eventKey={2} to="/versions/recent" href="/versions/recent">
          Recent Changes
        </NavItem>
        <NavDropdown eventKey={3} title="Tools" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={3.1} to="/tools/ic" href="/tools/ic">IC Simulator</MenuItem>
        </NavDropdown>
        <NavItem eventKey={4} href="https://store.steampowered.com/app/544550/Stationeers/">
          <FontAwesomeIcon icon={["fab", "steam"]} />
        </NavItem>
      </Nav>
    );
  }
}
  
class Main extends Component {
  render() {
    return (
      <Grid>
        <Switch>
          <Route exact path="/versions/recent" component={Recent} />
          <Route exact path="/tools/ic" component={ICSocket} />
          <Route path="/" component={Home} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
