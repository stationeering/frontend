import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Panel, Row, Col } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch, faGlobeAsia, faBookOpen } from '@fortawesome/free-solid-svg-icons';

import SteamNews from './SteamNews';

import './Home.css';

library.add(faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch, faGlobeAsia, faBookOpen );

class Home extends Component { 
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
              <Panel bsStyle="success">
                <Panel.Heading>
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book-open" /> <NavLink to='/guide'>Guide</NavLink></Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <p>
                    Similar to the in game Stationpedia, but with some more information in places. 
                  </p>
                  <p>
                  <NavLink to='/guide'>Check out the guide!</NavLink>
                  </p>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={3}>
              <Panel bsStyle="success">
                <Panel.Heading>
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="microchip" /> <NavLink to='/tools/ic'>IC Simulator</NavLink></Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <p>
                    Simulator for the Logic Programmable Chip now in Stationeers!
                  </p>
                  <p>
                    <NavLink to='/tools/ic'>Try It!</NavLink>
                  </p>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={3}>
              <Panel bsStyle="success">
                <Panel.Heading>
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> <NavLink to='/versions/recent'>Version History</NavLink></Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <p>
                    A list of the different versions Stationeers has had, what's on the beta and main branches.
                  </p>
                  <p>
                  <NavLink to='/versions/recent'>See what's changed!</NavLink>
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
        </div>
      );
    }
  }

  export default Home;