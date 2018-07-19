import React, { Component } from 'react';
import { Row, Col, Panel, Badge } from 'react-bootstrap';

import axios from 'axios';
import Timestamp from 'react-timestamp';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';

import './Recent.css';
library.add(faCodeBranch);

class Recent extends Component {
    constructor(props) {
        super(props);

        this.state = { versions: { data: null, message: "Please wait loading recent versions!" } };
    }

    componentDidMount() {
        var versionList = this;

        axios({ url: 'https://data.stationeering.com/versions/recent.json', method: 'get', responseType: 'json' })
            .then(function (response) {
                versionList.setState({ versions: { data: response.data, message: null } })
            })
            .catch(function (error) {
                versionList.setState({ versions: { message: "Failed to load version list! " + error } })
            });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <h3>Recent Changes</h3>
                        <p>
                            These are the recent changes to Stationeers, extracted from the game once an hour.
                        </p>
                    </Col>
                </Row>
                {this.renderVersions()}
            </div>
        );
    }

    renderVersions() {
        if (this.state.versions.data === null) {
            return (
                <Row>
                    <Col md={12}>
                        <small>{this.state.versions.message}</small>
                    </Col>
                </Row>);
        } else {
            return this.state.versions.data.map(version => <Version key={version.version} version={version} />)
        }
    }
}

class Version extends Component {
    render() {
        var style = undefined;
        var badge = undefined;
        var builtDate = undefined;

        if (!this.props.version.public_date) {
            style = "danger";
            badge = <Badge className="pull-right">Beta Only</Badge>;
        } else {
            badge = <Badge className="pull-right">Public</Badge>;
        }       

        if (this.props.version.built_date) {
            var builtEpoch = Number.parseInt(this.props.version.built_date) / 1000;

            if (builtEpoch > 1) {
                builtDate = <span>(<Timestamp time={builtEpoch} />)</span>;
            }
        }

        return (
            <Row>
                <Col md={12}>
                    <Panel bsStyle={style}>
                        <Panel.Heading>
                            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> {this.props.version.version} {builtDate} {badge}</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div>
                                {this.renderItems()}
                            </div>
                        </Panel.Body>
                    </Panel>
                </Col>
            </Row>
        );
    }

    renderItems() {
        if (this.props.version.notes) {
            var notes = this.props.version.notes.map((note, i) => <li key={i}>{note}</li>);
            return <ul>{notes}</ul>
        } else {
            return (<small>No change log for this version.</small>);
        }
    }
}

export default Recent;
