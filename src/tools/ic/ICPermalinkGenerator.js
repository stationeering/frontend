import React, { Component } from 'react';
import { FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faCogs } from '@fortawesome/free-solid-svg-icons';

library.add(faCopy, faCogs);


class ICPermalinkGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = { lastGeneratedHash: undefined, lastGeneratedPermalink: undefined };
  }

  render() {
    var permalinkUpToDate = this.props.currentHash === this.state.lastGeneratedHash;

    return (
      <FormGroup>
        <InputGroup>
          <FormControl type="text" readOnly />
          <InputGroup.Button>
            <Button><FontAwesomeIcon icon="cogs" /></Button>
            <Button><FontAwesomeIcon icon="copy" /></Button>
          </InputGroup.Button>          
        </InputGroup>
        <small>You can also share a program using the URL from the browser.</small>
      </FormGroup>
      );
  }
}

export default ICPermalinkGenerator;