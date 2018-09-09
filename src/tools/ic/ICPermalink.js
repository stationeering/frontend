import React, { Component } from 'react';
import { Row, Col, Panel } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner);

class ICPermalink extends Component {
  constructor(props) {
    super(props);

    this.state = { link: this.props.match.params.permalink, process: { status: "loading", statusCode: undefined, error: undefined, state: undefined } };
  }

  componentDidMount() {
    var container = this;

    axios({ url: 'https://api.stationeering.com/live/permalink/' + this.state.link, method: 'get', responseType: 'json' })
      .then(function (response) {
        if (!response.data.state) {
          container.setState({ process: { status: "failed", error: "No state included in response from API!" }});
        } else {
          container.setState({ process: { status: "success", state: response.data.state }});
        }
      })
      .catch(function (error) {                
        if (error.response) {
          if (error.response.status === 404) {
            container.setState({ process: { status: "failed", error: "Could not find permalinked IC!", statusCode: error.response.status }});
          } else {
            container.setState({ process: { status: "failed", error: "Unexpected error, failed to load from API.", statusCode: error.response.status }});
          }     
        } else {
          container.setState({ process: { status: "failed", error: error.message }});
        }
      });
  }

  render() {
    var output;
    
    switch(this.state.process.status) {
    case "loading":
      output = <Loading />;
      break;
    case "failed":
      output = <FailedLoading error={this.state.process.error} statusCode={this.state.process.statusCode} />;
      break;
    case "success":
      output = <Redirect to={"/tools/ic#" + this.state.process.state} />;
      break;
    default:
      break;
    }
    
    return output;
  }
}

class Loading extends Component {
  render() {
    return (<Row>
      <Col md={12}>
        <Panel bsStyle="success">
          <Panel.Heading>
            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="spinner" pulse /> Loading, please wait...</Panel.Title>            
          </Panel.Heading>
          <Panel.Body>
            Finding your permalink now...
          </Panel.Body>
        </Panel>
      </Col>
    </Row>);
  }
}

class FailedLoading extends Component {
  render() {
    var notFound = this.props.statusCode === 404;
    
    return (<Row>
      <Col md={12}>
        <Panel bsStyle={notFound ? "warning" : "danger"}>
          <Panel.Heading>
            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> Failed to load permalink!</Panel.Title>            
          </Panel.Heading>
          <Panel.Body>
            {this.props.error} ({this.props.statusCode})
          </Panel.Body>
        </Panel>
      </Col>
    </Row>);
  }
}

export default ICPermalink;
