import React, { Component } from 'react';
import { Row, Col, Panel, Badge, Label, ListGroup, ListGroupItem } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import axios from 'axios';
import Timestamp from 'react-timestamp';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCodeBranch, faWrench, faFlask, faUsers, faRss, faFileCode } from '@fortawesome/free-solid-svg-icons';

import './Recent.css';
library.add(faCodeBranch, faWrench, faFlask, faUsers, faRss, faFileCode);

class Recent extends Component {
    constructor(props) {
        super(props);

        this.state = { versions: { data: null, message: "Please wait loading recent versions!" } };
    }

    componentDidMount() {
        var recent = this;

        axios({ url: 'https://data.stationeering.com/versions/recent.json', method: 'get', responseType: 'json' })
            .then(function (response) {
                recent.setState({ versions: { data: response.data, message: null } })
            })
            .catch(function (error) {
                recent.setState({ versions: { message: "Failed to load version list! " + error } })
            });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={10}>
                        <h3>Recent Changes</h3>
                        <Panel bsStyle="warning">
                            <Panel.Heading>
                                <Panel.Title componentClass="h3"><FontAwesomeIcon icon={["fab", "discord"]} /> Version Announcements in <strong>your</strong> Discord!</Panel.Title>
                            </Panel.Heading>
                            <Panel.Body>
                                    Do you want version update information in your Discord? Well now you can with the Stationeering bot! <NavLink className='pull-right' to='/tools/discord'>Try the bot now!</NavLink>
                            </Panel.Body>
                        </Panel>
                    </Col>
                </Row>   
                <Row>
                    <Col md={10}>                                 
                        <p>
                            These are the recent changes to Stationeers, extracted from the game once an hour.
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col md={10}>
                        {this.renderVersions()}
                    </Col>
                    <Col md={2}>
                    <Panel bsStyle="info">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="rss" /> ATOM Feeds</Panel.Title>
                        </Panel.Heading>
                        <ListGroup>
                            <ListGroupItem><a href="https://data.stationeering.com/versions/public.atom">Public Branch</a></ListGroupItem>
                            <ListGroupItem><a href="https://data.stationeering.com/versions/beta.atom">Beta Branch</a></ListGroupItem>
                        </ListGroup>
                    </Panel>
                    <Panel bsStyle="info">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-code" /> JSON Feed</Panel.Title>
                        </Panel.Heading>
                        <ListGroup>
                            <ListGroupItem><NavLink to='/tools/data'>Recent Versions</NavLink></ListGroupItem>
                        </ListGroup>
                    </Panel>
                    </Col>
                </Row>
            </div>
        );
    }

    renderVersions() {
        if (this.state.versions.data === null) {
            return (
                <small>{this.state.versions.message}</small>
            );
        } else {
            return this.state.versions.data.map(version => <Version key={version.version} version={version} />);
        }
    }
}

class Version extends Component {
    render() {
        var style = "success";
        var branchBadge = undefined;
        var builtDate = undefined;

        if (!this.props.version.public_date) {
            style = "danger";
            branchBadge = <Badge className="pull-right">Beta</Badge>;
        } else {
            branchBadge = <Badge className="pull-right">Public</Badge>;
        }       

        if (this.props.version.built_date) {
            var builtEpoch = Number.parseInt(this.props.version.built_date, 10) / 1000;

            if (builtEpoch > 1) {
                builtDate = <span>(<Timestamp time={builtEpoch} />)</span>;
            }
        }

        return (
            <Panel bsStyle={style}>
                <Panel.Heading>
                    <Panel.Title componentClass="h3"><FontAwesomeIcon icon="code-branch" /> {this.props.version.version} {builtDate} {branchBadge}</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div>
                        {this.renderItems()}
                    </div>
                </Panel.Body>
                <Panel.Footer className="text-muted">
                    <DateLabel icon="wrench" name="Build Time" value={this.props.version.built_date} />
                    <DateLabel icon="flask" name="Beta Branch" value={this.props.version.beta_date} />
                    <DateLabel icon="users" name="Public Branch" value={this.props.version.public_date} />
                    <SteamLabel value={this.props.version.build_id} />
                </Panel.Footer>
            </Panel>
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

class SteamLabel extends Component {
    render() {
        if (!this.props.value) {
            return null;
        }

        return (<Label><FontAwesomeIcon icon={["fab", "steam"]} /> <abbr title="Steam Build ID">{this.props.value}</abbr></Label>);        
    }
}

class DateLabel extends Component {
    render() {
        if (!this.props.value) {
            return null;
        }

        return (<Label><FontAwesomeIcon icon={this.props.icon} /> <abbr title={this.props.name}><Timestamp time={this.props.value / 1000} format='full' twentyFourHour /></abbr></Label>);        
    }
}

export default Recent;
