import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Panel, Row, Col } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch, faGlobeAsia } from '@fortawesome/free-solid-svg-icons';

import SteamNews from './SteamNews';

import './Home.css';

library.add(faNewspaper, faHandSpock, faSitemap, faMicrochip, faCodeBranch, faGlobeAsia );

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
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> Version History</Panel.Title>
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
            <Col md={3}>
              <Panel bsStyle="success">
                <Panel.Heading>
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="globe-asia" /> Scenario Info</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <p>
                    A display of all scenarios you can start a play in, including information on their planets and atmospheres.
                  </p>
                  <p>
                  <NavLink to='/info/scenarios'>Check out the environments!</NavLink>
                  </p>
                </Panel.Body>
              </Panel>
            </Col>
            <Col md={3}>
              <Panel bsStyle="danger">
                <Panel.Heading>
                  <Panel.Title componentClass="h3"><FontAwesomeIcon icon="microchip" /> <NavLink to='/tools/ic'>IC Simulator</NavLink></Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <p>
                    A simulation of the Integrated Circuit proposed by Recatek.
                  </p>
                  <p className="text-danger">
                    <small><strong>Note: Does not exist in game yet!</strong></small>
                  </p>
                  <p>
                    <NavLink to='/tools/ic'>Try It!</NavLink>
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
          <SteamNews />
        </div>
      );
    }
  }

  export default Home;