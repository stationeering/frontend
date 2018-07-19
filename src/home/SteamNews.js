import React, { Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';

import Timestamp from 'react-timestamp';
import axios from 'axios';

class SteamNews extends Component {
    constructor(props) {
        super(props);

        this.state = { news: { data: null, message: "Please wait loading news from Steam!" } };
    }

    componentDidMount() {
        var versionList = this;

        axios({ url: 'https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=544550&count=3&maxlength=400&format=json', method: 'get', responseType: 'json' })
            .then(function (response) {
                versionList.setState({ news: { data: response.data.appnews.newsitems, message: null } })
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
            return this.state.news.data.map((news) => <SteamNewsItem news={news} />);
        }
    }
}

class SteamNewsItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var image = "";
        var text = this.props.news.contents;

        if (this.props.news.contents.startsWith("http")) {
            var imageURL = this.props.news.contents.split(" ", 1);
            // eslint-disable-next-line 
            image = <img src={imageURL} width="100%" />;
            text = this.props.news.contents.replace(imageURL + " ", "");
        }

        return (
            <Col md={4}>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3"><a href={this.props.news.url}>{this.props.news.title}</a></Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        {image}
                        <p>
                            <small><Timestamp time={this.props.news.date} /> by {this.props.news.author}</small>
                        </p>
                        <p>
                            {text} <small><a href={this.props.news.url}>(read more)</a></small>
                        </p>
                    </Panel.Body>
                </Panel>
            </Col>
        )
    }
}

export default SteamNews;