import React, { Component } from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import Scenarios from './info/scenarios/Scenarios';
import Items from './info/items/Items';
import ICSocket from './tools/ic/ICSocket';
import Recent from './versions/recent/Recent';
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
    console.log(JSON.stringify(prevProps));
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
        <Main beta={this.state.beta} languageMap={this.languageMap} />
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
          Change Log
        </NavItem>
        <NavDropdown eventKey={2} title="Info" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={2.1} to="/info/items" href="/info/items">Items and Manufactory</MenuItem>
          <MenuItem componentClass={NavLink} eventKey={2.2} to="/info/scenarios" href="/info/scenarios">Scenarios (Worlds)</MenuItem>
        </NavDropdown>
        <NavDropdown eventKey={3} title="Tools" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={3.1} to="/tools/ic" href="/tools/ic">IC Simulator</MenuItem>
        </NavDropdown>
        <Navbar.Text>
            Show Beta?{' '}
            <input type="checkbox" checked={this.props.betaBranch} onChange={this.props.onChange} />
        </Navbar.Text>
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
        <Switch>
          <Route path="/info/items" render={() => <Items branch={branch} languageMap={this.props.languageMap} />} />
          <Route path="/info/scenarios" render={() => <Scenarios branch={branch} />} />
          <Route path="/versions/recent" component={Recent} />
          <Route path="/tools/ic" component={ICSocket} />
          <Route path="/" component={Home} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
