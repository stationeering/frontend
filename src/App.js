import React, { Component } from 'react';
import ICSocket from './tools/ic/ICSocket';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem, Panel, Row, Col } from 'react-bootstrap';
import Timestamp from 'react-timestamp';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSteam } from '@fortawesome/free-brands-svg-icons';
import { faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch } from '@fortawesome/free-solid-svg-icons';

import './App.css';
library.add(faSteam, faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch);

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
            <h3><FontAwesomeIcon icon="hand-spock" /> Hello!</h3>
            <p>
              Welcome to <strong>Stationeering</strong>! This website is a continuation of "Melair's Version History", expanded with new features and info.
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <h3><FontAwesomeIcon icon="sitemap" /> What to do?</h3>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="microchip" /> <NavLink to='/tools/ic'>IC Simulator</NavLink></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  A simulation of the Integrated Circuit proposed by Recatek.
                </p>
                <p>
                  <NavLink to='/tools/ic'>Try It!</NavLink>
                </p>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={3}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> Version History</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  A list of the different versions Stationeers has had, what's on the beta and main branches.
                </p>
                <p>
                  <strong>Coming Soon</strong>
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <h3><FontAwesomeIcon icon="newspaper" /> Latest news from Stationeers!</h3>
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
                {text} <small><a href={news.url}>(read more)</a></small>
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
