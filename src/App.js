import React, { Component } from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import Guide from './guide/Guide';
import Scenarios from './info/scenarios/Scenarios';
import Items from './info/items/Items';
import ICSimulator from './tools/ic/ICSimulator';
import ICPermalink from './tools/ic/ICPermalink';
import UpdateManager from './UpdateManager';

import Data from './tools/data/Data';
import Discord from './tools/discord/Discord';
import VersionList from './versions/VersionList';
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
        <Main updateProxy={this.props.updateProxy} />
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
    var languageLoading = (this.props.languageLoadState ? <Nav pullRight><Navbar.Text>{this.props.languageLoadState}</Navbar.Text></Nav> : null);

    return (
      <div>
      <Nav>
        <NavItem componentClass={NavLink} eventKey={1} to="/versions/recent" href="/versions/recent">
          <FontAwesomeIcon icon="code-branch"/> Change Log
        </NavItem>
        <NavItem componentClass={NavLink} eventKey={2} to="/tools/ic" href="/tools/ic">
          <FontAwesomeIcon icon="microchip" /> IC Simulator
        </NavItem>
      </Nav>
      <Nav pullRight>
        <Navbar.Text>
          Offical Stationeers:
        </Navbar.Text>
        <NavItem eventKey={4} href="https://store.steampowered.com/app/544550/Stationeers/">
          <FontAwesomeIcon icon={["fab", "steam"]} />
        </NavItem>
        <NavItem eventKey={5} href="https://stationeers.com/">
          <FontAwesomeIcon icon={["fa", "globe"]} />
        </NavItem>
        <NavItem eventKey={6} href="https://twitter.com/stationeers">
          <FontAwesomeIcon icon={["fab", "twitter"]} />
        </NavItem>
        <NavItem eventKey={7} href="https://discordapp.com/invite/CxR3mRy">
          <FontAwesomeIcon icon={["fab", "discord"]} />
        </NavItem>
      </Nav>
      {languageLoading}
      </div>
    );
  }
}

class Main extends Component {
  render() {
    var branch = this.props.beta ? "beta" : "public";

    return (
      <Grid>
        <UpdateManager updateProxy={this.props.updateProxy} />
        <Switch>
          <Route path="/guide" component={Guide} />
          <Route path="/info/items" render={() => <Items branch={branch} languageMap={this.props.languageMap} />} />
          <Route path="/info/scenarios" render={() => <Scenarios branch={branch} />} />
          <Route path="/versions/:section" component={VersionList} />
          <Route path="/tools/ic/:permalink" component={ICPermalink} />
          <Route path="/tools/ic" component={ICSimulator} />          
          <Route path="/tools/data" component={Data} />
          <Route path="/tools/discord" component={Discord} />
          <Route path="/" component={Home} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
