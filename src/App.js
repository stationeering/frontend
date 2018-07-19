import React, { Component } from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import Scenarios from './info/scenarios/Scenarios';
import ICSocket from './tools/ic/ICSocket';
import Recent from './versions/recent/Recent';
import Home from './home/Home';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSteam, faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';


import './App.css';
library.add(faSteam, faTwitter, faGlobe, faDiscord);

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
        <NavItem componentClass={NavLink} eventKey={1} to="/versions/recent" href="/versions/recent">
          Change Log
        </NavItem>
        <NavDropdown eventKey={2} title="Info" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={2.1} to="/info/scenarios" href="/info/scenarios">Scenarios (Worlds)</MenuItem>
        </NavDropdown>
        <NavDropdown eventKey={3} title="Tools" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={3.1} to="/tools/ic" href="/tools/ic">IC Simulator</MenuItem>
        </NavDropdown>
        <NavItem>
          Stationeers:
        </NavItem>
        <NavItem eventKey={4} href="https://store.steampowered.com/app/544550/Stationeers/">
          <FontAwesomeIcon icon={["fab", "steam"]} /> Steam
        </NavItem>
        <NavItem eventKey={5} href="https://stationeers.com/">
          <FontAwesomeIcon icon={["fa", "globe"]} /> Web
        </NavItem>
        <NavItem eventKey={6} href="https://twitter.com/stationeers">
          <FontAwesomeIcon icon={["fab", "twitter"]} /> Twitter
        </NavItem>
        <NavItem eventKey={7} href="https://discordapp.com/invite/CxR3mRy">
          <FontAwesomeIcon icon={["fab", "discord"]} /> Discord
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
          <Route path="/info/scenarios" component={Scenarios} />
          <Route path="/info/scenarios/:branch" component={Scenarios} />
          <Route path="/versions/recent" component={Recent} />
          <Route path="/tools/ic" component={ICSocket} />
          <Route path="/" component={Home} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
