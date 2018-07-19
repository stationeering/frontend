import React, { Component } from 'react';
import axios from 'axios';
import { Panel, Row, Col, Badge, ListGroup, ListGroupItem } from 'react-bootstrap';

class Scenarios extends Component {
  constructor(props) {
    super(props);

    if (this.props.match.params.branch) {
      this.state = { branch: this.props.match.params.branch };
    } else {
      this.state = { branch: "public" };
    }

    this.state = { ...this.state, scenarios: { data: null, message: "Please wait loading scenarios!" } };
  }

  componentDidMount() {
    var scenarios = this;

    axios({ url: 'https://data.stationeering.com/scenarios/' + this.state.branch + '.json', method: 'get', responseType: 'json' })
      .then(function (response) {
        scenarios.setState({ scenarios: { data: response.data, message: null } })
      })
      .catch(function (error) {
        scenarios.setState({ scenarios: { message: "Failed to load scenario list! " + error } })
      });
  }

  render() {
    return (
      <div>
        <Row>
          <Col md={12}>
            <h3>Scenarios</h3>
            <p>
              These are the current starting scenarios which you can start a new game on.
            </p>
          </Col>
        </Row>
        {this.renderScenarios()}
      </div>);
  }

  renderScenarios() {
    if (this.state.scenarios.data === null) {
      return (<Col md={12}>
        <small>{this.state.scenarios.message}</small>
      </Col>);
    } else {
      return this.state.scenarios.data.map((scenario, i) => <Scenario key={i} scenario={scenario} />);
    }
  }
}

class Scenario extends Component {
  render() {
    return (<Col md={6}>
      <Panel bsStyle="primary">
        <Panel.Heading>
          <Panel.Title componentClass="h3">{this.props.scenario.name} <Badge className="pull-right">{this.props.scenario.game_mode}</Badge></Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <p>{this.props.scenario.description}</p>
          <PlanetProperties scenario={this.props.scenario} />
          <h5>Atmosphere</h5>
          <Atmosphere scenario={this.props.scenario} />
        </Panel.Body>
      </Panel>
    </Col>);
  }
}

class PlanetProperties extends Component {
  render() {
    return (<ListGroup>
      <ListGroupItem><strong>Gravity:</strong> {this.formatGravity(this.props.scenario.planet.gravity)}</ListGroupItem>
      <ListGroupItem><strong>Day Length:</strong> {this.formatDayLength(this.props.scenario.planet.day_length)}</ListGroupItem>
    </ListGroup>);
  }

  formatGravity(value) {
    var acceleration = Math.abs(value)
    var g = (acceleration / 9.8).toFixed(2);

    return acceleration + " m/s² / " + g + "g";
  }

  formatDayLength(value) {
    var length = ((1 / value) * 24).toFixed(1);

    return length + " hours";
  }
}

class Atmosphere extends Component {
  render() {
    if (this.props.scenario.atmosphere.composition.length === 0) {
      return (<ListGroup>
        <ListGroupItem bsStyle="danger">No Atmosphere</ListGroupItem>
      </ListGroup>);
    }

    return (<div>
      <AtmosphereProperties scenario={this.props.scenario} />
      <h6>Contents</h6>
      <AtmosphereContents scenario={this.props.scenario} />
    </div>);
  }
}

class AtmosphereProperties extends Component {
  render() {
    var totalMoles = this.props.scenario.atmosphere.composition.reduce((acc, cur) => acc + cur.quantity, 0);
    var averageTemp = this.props.scenario.atmosphere.temperature.avg;
    var pressure = ((totalMoles * 8.3144 * averageTemp) / 8000);

    return (<ListGroup>
      <ListGroupItem><strong>Pressure:</strong> {pressure.toFixed(2)}kPa @ {this.renderTemperature(averageTemp)}</ListGroupItem>
      <ListGroupItem><strong>Temperature Range:</strong> {this.renderTemperature(this.props.scenario.atmosphere.temperature.min)} to {this.renderTemperature(this.props.scenario.atmosphere.temperature.max)}</ListGroupItem>
    </ListGroup>);
  }

  renderTemperature(temp) {
    return (temp - 273.15).toFixed(1) + "C (" + temp.toFixed(1) + "K)";
  }
}

class AtmosphereContents extends Component {
  render() {
    return (<ListGroup>
      {this.renderContents()}
    </ListGroup>);
  }

  renderContents() {
    var totalMoles = this.props.scenario.atmosphere.composition.reduce((acc, cur) => acc + cur.quantity, 0);

    return this.props.scenario.atmosphere.composition.map((gas) => {
      var percent = (gas.quantity / totalMoles) * 100;

      return (<ListGroupItem><strong>{gas.type}:</strong> {percent.toFixed(1)}% ({gas.quantity.toFixed(2)} moles)</ListGroupItem>);
    })
  }
}

export default Scenarios;