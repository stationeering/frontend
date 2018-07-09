import React, { Component } from 'react';
import ICSocket from './tools/ic/ICSocket';
import { NavLink, Switch, Route } from 'react-router-dom';
import { Grid, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Navbar>
          <Header />
          <Navigation />
        </Navbar>
        <Main />
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
      </Nav>
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
      <Grid>
        <Switch>
          <Route exact path="/" Component={Home} />
          <Route exact path="/tools/ic" component={ICSocket} />
        </Switch>
      </Grid>
    );
  }
}

export default App;
