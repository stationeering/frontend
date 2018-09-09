import React, { Component } from 'react';
import { FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faCogs } from '@fortawesome/free-solid-svg-icons';

library.add(faCopy, faCogs);


class ICPermalinkGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = { lastGeneratedHash: undefined, lastGeneratedPermalink: undefined };

    this.beginGeneration = this.beginGeneration.bind(this);
  }

  render() {
    var permalinkUpToDate = this.props.currentHash === this.state.lastGeneratedHash;

    return (
      <FormGroup>
        <InputGroup>
          <FormControl type="text" value={this.state.lastGeneratedPermalink} readOnly />
          <InputGroup.Button>
            <Button onClick={this.beginGeneration}><FontAwesomeIcon icon="cogs" /></Button>
            <CopyToClipboard text={this.state.lastGeneratedPermalink}>
              <Button><FontAwesomeIcon icon="copy" /></Button>
            </CopyToClipboard>
          </InputGroup.Button>          
        </InputGroup>
        <small>You can also share a program using the URL from the browser.</small>
      </FormGroup>
      );
  }

  beginGeneration() {
    
  }
}

export default ICPermalinkGenerator;