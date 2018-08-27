import React, { Component } from 'react';
import { Row, Col, Panel, Badge, Label, ListGroup, ListGroupItem, Nav, NavItem, Alert } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

import axios from 'axios';
import Timestamp from 'react-timestamp';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCodeBranch, faWrench, faFlask, faUsers, faRss, faFileCode } from '@fortawesome/free-solid-svg-icons';

import './VersionList.css';
library.add(faCodeBranch, faWrench, faFlask, faUsers, faRss, faFileCode);

class VersionList extends Component {
    render() {
        return (
            <div>
                <Row>
                    <Col md={10}>
                        <h3>Versions</h3>
                        <Panel bsStyle="warning">
                            <Panel.Heading>
                                <Panel.Title componentClass="h3"><FontAwesomeIcon icon={["fab", "discord"]} /> Version Announcements in <strong>your</strong> Discord!</Panel.Title>
                            </Panel.Heading>
                            <Panel.Body>
                                    Do you want version update information in your Discord? Well now you can with the Stationeering bot! <NavLink className='pull-right' to='/tools/discord'>Try the bot now!</NavLink>
                            </Panel.Body>
                        </Panel>
                        <p>
                            These are the recent changes to Stationeers, extracted from the game once an hour.
                        </p>
                        <Nav bsStyle="pills" activeKey={this.props.match.params.section}>
                            <NavItem eventKey="recent" componentClass={NavLink} to="/versions/recent" href="/versions/recent">
                                Recent Changes (Release)
                            </NavItem>
                            <NavItem eventKey="beta" componentClass={NavLink} to="/versions/beta" href="/versions/beta">
                                Recent Changes (Beta)
                            </NavItem>
                            <NavItem eventKey="all" componentClass={NavLink} to="/versions/all" href="/versions/all">
                                All Changes
                            </NavItem>
                        </Nav>
                        <p />
                    </Col>
                </Row>
                <Row>
                    <Col md={10}>
                        <VersionFilter view={this.props.match.params.section} />
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
}

class VersionFilter extends Component {
    constructor(props) {
        super(props);

        var earliestDate = Date.now() - (14*24*60*60*1000); 

        this.state = { versions: { data: [], message: "Please wait loading version data!", nextFile: "head.json", flattenedVersions: [] }, earliestDate, network: false };
    }

    componentDidMount() {
        this.checkDataHasEnough();
    }

    checkDataHasEnough() {
        var allBetaDates = this.state.versions.flattenedVersions.map((version) => version.beta_date);
        var oldestDate = Math.min(...allBetaDates);

        var targetDate = (this.props.view === "all" ? -2 : this.state.earliestDate);

        if (oldestDate > targetDate) {            
            return !this.fetchNextPage();
        } else {
            return true;
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.view !== prevProps.view && !this.state.network) {
            this.checkDataHasEnough();
        }
    }

    fetchNextPage() {
        if (!this.state.versions.nextFile) {
            return false;
        }

        var recent = this;

        if (!this.state.network) {
            this.setState({ network: true });
        }

        axios({ url: 'https://data.stationeering.com/versions/paginated/' + this.state.versions.nextFile, method: 'get', responseType: 'json' })
            .then(function (response) {
                var newData = recent.state.versions.data.slice(0);
                newData.push(response.data);
                
                var justVersions = recent.state.versions.data.map((versionDataWithHeader) => versionDataWithHeader.versions);
                var flatVersions = [].concat(...justVersions);

                var nextFile = response.data.previous;

                recent.setState({ versions: { data: newData, flattenedVersions: flatVersions, message: null, nextFile } })
                
                if (recent.checkDataHasEnough()) {
                    recent.setState({network: false});
                }
            })
            .catch(function (error) {                
                recent.setState({ versions: { message: "Failed to load version list! " + error }, network: false })
            });

        return true;
    }

    render() {
        var messages = [];
        var results = this.state.versions.flattenedVersions.filter(version => this.filterVersion(version)).map(version => <Version key={version.version} version={version} />);

        if (this.props.view === "all") {
            messages.push({message: "This page may be slow on old or mobile devices.", style: "danger"});
        }

        if (this.state.versions.message !== null) {
            messages.push({message: this.state.versions.message, style: "info"});
        }

        if (this.state.network) {
            messages.push({message: "Currently loading from server... (" + this.state.versions.nextFile + ")", style: "info"});
        } else {
            if (results.length === 0) {
                switch (this.props.view) {
                    case "recent":
                        messages.push({message: "There are no recent changes to the game.", style: "success"});
                        break;
                    case "beta":
                        messages.push({message: "There are currently no changes on the beta branch which are not present on release.", style: "success"});
                        break;
                    default:
                        messages.push({message: "Could not find any changes, please try again later.", style: "warning"});
                        break;
                }
            }
        }

        var alerts = messages.map((msg,i) => <Alert key={i} bsStyle={msg.style}>{msg.message}</Alert>);

        return <div>{[...alerts, ...results]}</div>;
    }

    filterVersion(version) {
        switch (this.props.view) {
            case "all":
                return true;
            case "recent":
                return (version.public_date && Number.parseInt(version.beta_date, 10) > this.state.earliestDate);
            case "beta":
                return (!version.public_date && Number.parseInt(version.beta_date, 10) > this.state.earliestDate);
            default:
                return false;
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

        if (this.props.value < 1) {
            return (<Label><FontAwesomeIcon icon={this.props.icon} /> <abbr title={this.props.name}>Unknown</abbr></Label>);        
        } else {
            return (<Label><FontAwesomeIcon icon={this.props.icon} /> <abbr title={this.props.name}><Timestamp time={this.props.value / 1000} format='full' twentyFourHour /></abbr></Label>);        
        }
    }
}

export default VersionList;
