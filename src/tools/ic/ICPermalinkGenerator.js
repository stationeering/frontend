import React, { Component } from 'react';
import { FormGroup, InputGroup, Button, FormControl } from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faCog } from '@fortawesome/free-solid-svg-icons';

library.add(faCopy, faCog);

class ICPermalinkGenerator extends Component {
  constructor(props) {
    super(props);

    this.state = { lastGeneratedHash: undefined, lastGeneratedPermalink: undefined, requestState: "idle" };

    this.beginGeneration = this.beginGeneration.bind(this);
  }

  render() {
    var permalinkUpToDate = this.props.currentHash === this.state.lastGeneratedHash;
    var generationInProgress = this.state.requestState !== "idle";
    var feedback;
    
    if (this.state.requestMessage) {
      var lastSuccess = this.state.lastRequest === "success";

      feedback = <p><small class={lastSuccess ? "text-success" : "text-danger"}>{this.state.requestMessage}</small></p>
    }
    
    return (
      <FormGroup>
        <InputGroup>
          <FormControl type="text" value={this.state.lastGeneratedPermalink} readOnly />
          <InputGroup.Button>
            <Button onClick={this.beginGeneration} disabled={permalinkUpToDate} bsStyle={permalinkUpToDate ? undefined : "success"}><FontAwesomeIcon icon="cog" spin={generationInProgress} /></Button>
            <CopyToClipboard text={this.state.lastGeneratedPermalink}>
              <Button><FontAwesomeIcon icon="copy" /></Button>
            </CopyToClipboard>
          </InputGroup.Button>                  
        </InputGroup>        
        {feedback}
        <small>You can also share a program using the URL from the browser.</small>
      </FormGroup>
      );
  }

  beginGeneration() {
    if (this.state.requestState !== "idle" || this.props.currentHash === this.state.lastGeneratedHash) {
      return;
    }

    this.setState({ requestState: "requesting", lastRequest: undefined, requestMessage: undefined });

    var currentHash = this.props.currentHash;
    var body = { state: currentHash };

    var container = this;

    axios({ url: 'https://api.stationeering.com/live/permalink', method: 'post', responseType: 'json', data: body })
      .then(function (response) {
        if (response.data.id) {
          container.setState({ lastGeneratedPermalink: "https://stationeering.com/tools/ic/" + response.data.id, requestState: "idle", lastGeneratedHash: currentHash, lastRequest: "success", requestMessage: "Successfully generated permalink!" })
        } else {
          container.setState({ requestState: "idle", lastRequest: "failed", requestMessage: "Invalid response from API!" });
        }
      })
      .catch(function (error) {  
        if (error.response) {      
          container.setState({ requestState: "idle", lastRequest: "failed", requestMessage: "Invalid response from API! (" + error.response.status + ")" });
        } else {
          container.setState({ requestState: "idle", lastRequest: "failed", requestMessage: "Failed to query API! (" + error.message + ")" })
        }
      });
  }
}

export default ICPermalinkGenerator;