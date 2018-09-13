import React, { Component } from 'react';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class UpdateManager extends Component {
    constructor(props) {
        super(props);

        this.notify = this.notify.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);

        this.state = { updateAvailable: false, show: true };

        this.props.updateProxy.subscribe(this.notify);
    }

    notify() {
        this.setState({ updateAvailable: true });
    }

    handleDismiss() {
        this.setState({ show: false });
    }

    handleReload() {
        window.location.reload(true);
    }

    render() {
        if (this.state.updateAvailable && this.state.show) {
            return (
                <Row>
                    <Col md={12}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="spinner" spin /> Website Updated</Panel.Title>                                
                            </Panel.Heading>
                            <Panel.Body>
                                <div>
                                    This website has been updated and you can get a new version by reloading the page. You might not see an immediate difference, but something will have been changed behind the scenes that's important.
                                </div>
                            </Panel.Body>
                            <Panel.Footer>
                                <Button bsStyle="success" onClick={this.handleReload}>Reload Site</Button>
                                <span> or </span>
                                <Button bsStyle="danger" onClick={this.handleDismiss}>Hide Alert</Button>
                            </Panel.Footer>
                        </Panel>
                    </Col>
                </Row>
            )
        } else {
            return null;
        }
    }
}

export default UpdateManager;