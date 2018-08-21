import React, { Component } from 'react';
import { Row, Col, Panel } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faQuestionCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import './Discord.css';

library.add(faQuestionCircle, faExclamationTriangle);

class Discord extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={9}>
            <Panel bsStyle="success">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon={["fab", "discord"]} /> Stationeering Discord Bot</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  We've worked with a few different people to help them get our version feeds into their Discord servers, it was a more common request than we had anticipated.
                </p>
                <p>
                  So it's time for us to provide that service.
                </p>
              </Panel.Body>
            </Panel>

            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="list-ul" /> Instructions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>You must have administrative permissions on your server to request our bot joins your server, and to configure it.</p>
                <ol>
                  <li>Request the bot joins your server. <a href="https://discordapp.com/oauth2/authorize?client_id=481360973215694850&permissions=3072&scope=bot">Summon Stationeering Bot!</a></li>
                  <li>Ensure that the bot role has access to read and send messages in the channel you want the Version messages to appear in.</li>
                  <li>Type <code>@Stationeering set_channel VERSIONS</code> in the channel.</li>
                  <li>If it responds, you're all done. Any problems, talk to us!</li>
                </ol>
              </Panel.Body>
            </Panel>

            <Panel bsStyle="warning">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="exclamation-triangle" /> Notes</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  This is the first version of the bot, we will be adding more functionality in the future. However, don't worry, you'll have to enable each new features as it comes. We wont push new features on your server.
                </p>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={3}>
          <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="question-circle" /> Questions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  If you've got questions, come just us in our own Discord.                
                </p>
                <p>
                  <a href="https://discord.gg/5WynpfX">Stationeering Discord</a>
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>

      </div>
    );
  }
}

export default Discord;
