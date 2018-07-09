import React, { Component } from 'react';
import ICSocket from './tools/ic/ICSocket';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem, Panel, Row, Col } from 'react-bootstrap';
import Timestamp from 'react-timestamp';
import axios from 'axios';

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
        <footer class="footer">
          <small>
            stationeering.com is a fan run website about <a href="https://store.steampowered.com/app/544550/Stationeers/">Stationeers</a> run by Melair.
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
        <NavItem componentClass={NavLink} eventKey={1} to="/" href="/">
          Homepage
        </NavItem>
        <NavDropdown eventKey={2} title="Tools" id="basic-nav-dropdown">
          <MenuItem componentClass={NavLink} eventKey={2.1} to="/tools/ic" href="/tools/ic">IC Simulator</MenuItem>
        </NavDropdown>
        <NavItem eventKey={3} href="https://store.steampowered.com/app/544550/Stationeers/">
          <FontAwesomeIcon icon={["fab", "steam"]} />
        </NavItem>
      </Nav>
    );
  }
}

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = { news: { data: null, message: "Please wait loading news from Steam!" } };
  }

  componentDidMount() {
    var versionList = this;

    axios({url: 'http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=544550&count=3&maxlength=400&format=json', method: 'get', responseType: 'json'})
      .then(function(response) {
        versionList.setState({ news: { data: response.data.appnews.newsitems, message: null } })
      })
      .catch(function(error) {
        versionList.setState({ news: { message: "Failed to load version list! " + error } })
      });
  }

  render() {
    return (
      <div>
        <Row>
          <Col md={12}>
            <h3>Latest news from Stationeers!</h3>
            <p>
              <small>News is retrieved from Steam, stationeering.com is not responsible for the content.</small>
            </p>
          </Col>
        </Row>
        <Row>
          {this.renderNews()}
        </Row>
      </div>
    );
  }

  renderNews() {
    if (this.state.news.data === null) {
      return (<Col md={12}>
        <small>{this.state.news.message}</small>
      </Col>);
    } else {
      return this.state.news.data.map((news) => {
        var image = news.contents.split(" ", 1);
        var text = news.contents.replace(image + " ", "");

        return (
        <Col md={4}>
          <Panel>
            <Panel.Heading>
              <Panel.Title componentClass="h3"><a href={news.url}>{news.title}</a></Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <img src={image} width="100%" alt="Generic news article." />
              <p>
                <small><Timestamp time={news.date} /> by {news.author}</small>
              </p>
              <p>
                {text}
              </p>
            </Panel.Body>
          </Panel>
        </Col>
      )
      })
    }
  }
}

class Main extends Component {
  render() {
    return (
      <Grid>
        <Switch>
          <Route exact path="/tools/ic" component={ICSocket} />
          <Route path="/" component={Home} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
