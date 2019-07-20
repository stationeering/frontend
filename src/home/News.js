import React, { Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';

import Timestamp from 'react-timestamp';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

import './News.css';
library.add(faFileAlt);

class News extends Component {
    constructor(props) {
        super(props);

        this.state = { news: { data: null, message: "Please wait loading news!" } };
    }

    componentDidMount() {
        var versionList = this;

        axios({ url: 'https://data.stationeering.com/news/' + this.props.source + '.json', method: 'get', responseType: 'json' })
            .then(function (response) {
                versionList.setState({ news: { data: response.data, message: null } })
            })
            .catch(function (error) {
                versionList.setState({ news: { message: "Failed to load news list! " + error } })
            });
    }

    render() {
        return (
            <Row>
                {this.renderNews()}
            </Row>);
    }

    renderNews() {
        if (this.state.news.data === null) {
            return (<Col md={12}>
                <small>{this.state.news.message}</small>
            </Col>);
        } else {
            return this.state.news.data.slice(0, this.props.count).map((news) => <NewsItem news={news} />);
        }
    }
}

class NewsItem extends Component {
    render() {
        let image = undefined;

        if (this.props.news.has_image) {
            // eslint-disable-next-line 
            image = <img src={"https://data.stationeering.com/news/steam/" + this.props.news.id + ".webp"} width="100%" />;
        }

        return (
            <Col md={4}>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-alt" /> <a href={this.props.news.url}>{this.props.news.title}</a></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {image}
                        <p>
                            <small><Timestamp time={this.props.news.date} /> by {this.props.news.author}</small>
                        </p>
                        <p>
                            {this.props.news.contents.slice(0, 300)}…
                        </p>
                        <p>
                            <small><a href={this.props.news.url}>(read more)</a></small>
                        </p>
                    </Panel.Body>
                </Panel>
            </Col>
        )
    }
}

export default News;