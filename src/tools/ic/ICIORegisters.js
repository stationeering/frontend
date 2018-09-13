import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';

library.add(faArrowsAltH);

class ICIORegisters extends Component {
    render() {  
      return (
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="arrows-alt-h" /> Device (IO) Registers</Panel.Title>
          </Panel.Heading>
          <Table>
            <thead>
              <tr><th /><th>Set</th><th>Value</th><th>Label</th></tr>
            </thead>
            <tbody>
            </tbody>
          </Table>
        </Panel>
      );
    }
  
    renderRegisters() {
      if (this.props.registers) {
      }
    }
  }
  
  export default ICIORegisters;
  