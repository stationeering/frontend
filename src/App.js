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

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSteam, faTwitter, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

import './App.css';

library.add(faSteam, faTwitter, faGlobe, faDiscord);

class App extends Component {
  constructor(props) {
    super(props);

    this.toggleBeta = this.toggleBeta.bind(this);
    this.languageMap = this.languageMap.bind(this);

    this.state = { beta: false, language: { mapping: {}, message: "" } };
  }

  componentDidMount() {
      var recent = this;

      recent.setState( { language: { mapping: {}, message: "Loading language..." } } );

      axios({ url: 'https://data.stationeering.com/languages/en/' + (this.state.beta ? "beta" : "public") + '.json', method: 'get', responseType: 'json' })
          .then(function (response) {
              recent.setState({ language: { mapping: recent.languageMapToLower(response.data), message: null } })
          })
          .catch(function (error) {
              recent.setState({ language: { mapping: {}, message: "Failed to load language file! " + error } })
          });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.beta !== this.state.beta) {
      this.componentDidMount();
    }
  }

  languageMapToLower(data) {
    data.sections = Object.keys(data.sections).reduce((acc, type) => {
      acc[type.toLowerCase()] = Object.keys(data.sections[type]).reduce((acc2, key) => {
        acc2[key.toLowerCase()] = data.sections[type][key];
        return acc2;
      }, {});
      return acc;
    }, {});

    return data;
  }

  languageMap(type, key) {
    var lowerType = type.toLowerCase();
    var lowerKey = key.toLowerCase();

    if (this.state.language.mapping.sections && this.state.language.mapping.sections.hasOwnProperty(lowerType) && this.state.language.mapping.sections[lowerType].hasOwnProperty(lowerKey)) {
      var mapping = this.state.language.mapping.sections[lowerType][lowerKey];

      if (typeof mapping === 'object') {
        return mapping.name;
      } else {
        return mapping;
      }
    }

    return key;
  }

  toggleBeta(event) {
    this.setState({ beta: !this.state.beta })
  }

  render() {
    return (
      <div className="App">
        <Navbar>
          <Header />
          <Navigation betaBranch={this.state.beta} onChange={this.toggleBeta} languageLoadState={this.state.language.message} />
        </Navbar>
        <Main beta={this.state.beta} languageMap={this.languageMap} updateProxy={this.props.updateProxy} />
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
    <NavDropdown eventKey={3} title={[<FontAwesomeIcon icon="gamepad" />," Game Info"]} id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={3.1} to="/info/items" href="/info/items">Items and Manufactory</MenuItem>
          <MenuItem componentClass={NavLink} eventKey={3.2} to="/info/scenarios" href="/info/scenarios">Scenarios (Worlds)</MenuItem>
        </NavDropdown>
        <NavDropdown eventKey={4} title={[<FontAwesomeIcon icon="wrench" />," Tools"]} id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={4.2} to="/tools/discord" href="/tools/discord">Discord Bot</MenuItem>
          <MenuItem componentClass={NavLink} eventKey={4.3} to="/tools/data" href="/tools/data">Data and Webhooks</MenuItem>
        </NavDropdown>
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
