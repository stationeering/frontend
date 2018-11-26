import React, { Component } from 'react';
import { Row, Col, Label, Panel } from 'react-bootstrap';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTimesCircle);

class Guide extends Component {
  constructor(props) {
    super(props);

    this.state = {
      language: {
        desired: localStorage.getItem('guideLanguage') || "en",

        mapping: undefined
      },
      data: {
        desired: localStorage.getItem('guideBranch') || "public",

        things: undefined,
        recipies: undefined,
        scenarios: undefined
      },
      loading: {
        language: { state: "unloaded" },
        things: { state: "unloaded" },
        recipes: { state: "unloaded" },
        scenarios: { state: "unloaded" }
      }
    }
  }

  componentDidMount() {
    let language = this.state.language.desired;
    let branch = this.state.data.desired;

    this.loadData(`https://data.stationeering.com/languages/${language}/${branch}.json`,
    (t, data) => {
      t.setState({ language: { ...this.state.language, mapping: data }, loading: { ...this.state.loading, language: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, language: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/things/${branch}/things.json`,
    (t, data) => {
      t.setState({ data: { ...this.state.data, things: data }, loading: { ...this.state.loading, things: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, things: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/recipes/${branch}.json`,
    (t, data) => {
      t.setState({ data: { ...this.state.data, recipes: data }, loading: { ...this.state.loading, recipes: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, recipes: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/scenarios/${branch}.json`,
    (t, data) => {
      t.setState({ data: { ...this.state.data, scenarios: data }, loading: { ...this.state.loading, scenarios: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, scenarios: { state: "failed", message: msg } }});
    },
    this);
  }

  loadData(url, success, failure, t) {
    axios({ url: url, method: 'get', responseType: 'json' })
    .then(function (response) {
      success(t, response.data);
    })
    .catch(function (error) {                
      failure(t, error);
    });
  }

  render() {
    var allStates = [];

    for (var key of Object.keys(this.state.loading)) {
      allStates.push(this.state.loading[key].state);
    }
    
    let isLoading = !(allStates.every((state) => state === "success"));
    
    return (
      <div>
        <Row>
          <Col md={12}>
            <h3>Stationeering's Guide to Stationeers</h3>
            {isLoading && <LoadingNotice states={this.state.loading} />}
            {!isLoading && <GuideContent states={this.state} />}
          </Col>
        </Row>
      </div>
    );
  }
}

class LoadingNotice extends Component {
  render() {
    return (
      <Panel>
        <Panel.Heading>
            <Panel.Title componentClass="h3">Loading resources for guide...</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <LoadState state={this.props.states.language} title="Language" />
          <LoadState state={this.props.states.things} title="Things" />
          <LoadState state={this.props.states.recipes} title="Recipes" />
          <LoadState state={this.props.states.scenarios} title="Scenarios" />
        </Panel.Body>
      </Panel>
    )
  }
}

class LoadState extends Component {
  render() {
    if (this.props.state.state === "success") {
      return null;
    }

    let icon = (this.props.state.state === "unloaded" || this.props.state.state === "loading") ? "spinner" : "times-circle";
    let iconSpin = (this.props.state.state === "unloaded" || this.props.state.state === "loading");

    let bsStyle = (this.props.state.state === "unloaded" || this.props.state.state === "loading") ? "info" : "danger";

    return (
      <Label bsStyle={bsStyle}><FontAwesomeIcon icon={icon} spin={iconSpin} /> {this.props.title}</Label>
    )
  }
}

class GuideContent extends Component {
  render() {
    var items = Object.keys(this.props.states.data.things).map((t) => <li>{t}</li>)

    return(
      <Row>
        <Col md={6}>
          <h3>Things</h3>
          <ul>
            {items}
          </ul>
        </Col>
      </Row>
    );
  }
}

export default Guide;