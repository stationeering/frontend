import React, { Component } from 'react';
import MetaTags from 'react-meta-tags';

import { Row, Col } from 'react-bootstrap';

import ICSocket from './ICSocket';
import ICInstructions from './ICInstructions';
import ICInstructionSet from './ICInstructionSet';

class ICSimulator extends Component {
  render() {
    return (
      <div className="ICSimulator">
          <MetaTags>
            <meta name="description" content="Stationeering provides a simulation of the IC10 chip inside Stationeers. IDE with error checking, full visibility of stack and registers." />
          </MetaTags>
        <ICSocket />
        <Row>
          <Col md={5}>
            <ICInstructions />
          </Col>
          <Col md={7}>
            <ICInstructionSet />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ICSimulator;