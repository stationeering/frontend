import React, { Component } from 'react';
import { Row, Col, Panel, Alert } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDatabase, faEnvelope, faFileExport, faListUl } from '@fortawesome/free-solid-svg-icons';

import './Data.css';

library.add(faDatabase, faListUl, faEnvelope, faFileExport);

class Data extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col md={12}>
            <Panel bsStyle="success">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="database" /> Introduction</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                  Stationeering is a continuation of Melair's "Stationeers Version History" site, we regularily poll Steam to find out the latest version history and data from Stationeers. This is actually a bit of a pain to do, so given we are already doing it, we want to open that data up for anyone to use.
                </p>
                <p>
                  As we say, we're happy for you to use the data we describe below. However, please be kind to us, follow any guidance and we'll be fine.
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel bsStyle="danger">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="list-ul" /> Rules</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h4>Polling</h4>
                <ul>
                  <li>Poll only <strong>once</strong> per hour per file - we only update once per hour. Best time is around twenty past the hour.</li>
                  <li>Ideally, if you can, use <a href="https://en.wikipedia.org/wiki/HTTP_ETag#Typical_usage">ETags and perform conditional web requests</a>.</li>
                </ul>
                <h4>Commercial Use</h4>
                <ul>
                  <li>Do not use these feeds for commercial purposes without speaking to Melair, permission will be granted if you're willing to cover the cost of your access - likely less than $1/month.</li>
                </ul>
                <h4>Hot Linking, Single Page Applications or Pass Through</h4>
                <ul>
                  <li>Do not link to a data feed directly, link to this page.</li>
                  <li>Do not use the feeds in single page applications, or client rendered sites - CORS will prevent you anyway.</li>
                  <li>Do not use an proxy to bypass CORS, or simply proxy requests to these feeds.</li>
                </ul>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="envelope" /> WebHook: Versions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h4>About</h4>
                <p>
                  Rather than polling our data set, we have the ability to make a HTTP request against your web service. This means you will get the update as soon as we know about it.
                </p>
                <p>
                  Contact Melair to arrange the set up of a webhook.
                </p>
                <h4>Set Up</h4>
                <p>
                  We use Amazon Web Services to provide this website, once you have given us your notification URL we will set up a subscription to an SNS topic. During which it will make a HTTP POST to your end point. It will contain a JSON blob.
                </p>
                <pre>
                {`{
  "Type" : "SubscriptionConfirmation",
  "SubscribeURL" : "https://sns.us-west-2.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-west-2:123456789012:MyTopic&Token=2336412f37fb687f5d51e6e241d09c805a5a57b30d712f794cc5f6a988666d92768dd60a747ba6f3beb71854e285d6ad02428b09ceece29417f1f02d609c582afbacc99c583a916b9981dd2728f4ae6fdb82efd087cc3b7849e05798d2d2785c03b0879594eeac82c01f235d0e717736"
}`}
                </pre>
                <p>
                  Your endpoint should decode this message as JSON, check the <code>Type</code> field, if it is <code>SubscriptionConfirmation</code>, you should then make a HTTP GET request to the value included in the <code>SubscribeURL</code>.
                </p>
                <p>
                  If we rearchitect our internal systems we may need to change SNS topic, as such <strong>we recommend you leave the code in to power this</strong>. This means will can make the change without breaking you.
                </p>
                <h4>Notifications</h4>
                <p>
                  Once you have confirmed the subscription, you will receive POSTs when there are new Stationeers version updates. These messages are also JSON and will have a type of <code>Notification</code>. You should then proceed to extract the <code>Message</code> field and then once again parse that field as JSON.
                </p>
                <pre>
                {`{
  "Type": "Notification",
  "Message": "{ \\"field\\": \\"value\\" }"
}`}
                </pre>
                <p>
                </p>
                <h4>Message</h4>
                <p>
                  Once you have extracted and parsed the <code>Message</code>, you will have an object that you can now process.
                </p>
                <pre>
                {`{
  "operation": "create"|"update", // If this is a new version, or if we're updating an old version (beta -> public).
  "type": "version", // The object type being updated, you may wish to filter on this to be sure, or you can duck type by checking for the version field.
  "version": {
    "version_number": "100156407373", // An always increasing numerical representation of the version number, don't decode this, but it is safe to assume a higher number than one you already have is a new version.
    "version": "0.1.1564.7373", // Always present.
    "build_id": "2985053", // Steam build ID, may be missing.
    "built_date": "1532755962000", // Steam build date, may be missing. Number of milliseconds since unix epoch.
    "beta_date": "1532755962000", // Date the version appeared on the beta branch. Number of milliseconds since unix epoch.
    "public_date": "1532757857000", // Date the version appeared on the public branch, missing if not yet on public. Number of milliseconds since unix epoch.
    "updated_date": "1532758092378", // Date the last time Stationeering updated this record. Number of milliseconds since unix epoch.
    "server_build_id": "2985053", // Dedicated server Steam build ID, may be missing.
    "server_beta_date": "1532755962000", // Date the dedicated server version appeared on the beta branch. Number of milliseconds since unix epoch.
    "server_public_date": "1532757857000", // Date the version dedicated server appeared on the public branch, missing if not yet on public. Number of milliseconds since unix epoch.    
    "notes": [
      "A change log." // One entry per change log line for this version.
    ]
  }
}`}
                </pre>
                <p>
                  We may also regularily send a message with a <code>operation</code> of <code>ping</code>. It will contain no version, you can use this to verify we are still sending data to you, or you may ignore it.
                </p>
                <pre>
                {`{
  "operation" : "ping"
}`}
                </pre>                
                <h4>More Information about SNS</h4>
                <p>
                  You can refer to <a href="https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html#SendMessageToHttp.prepare">Amazon's documentation</a> on notifications. If you are also in Amazon Web Service, we can also subscribe your own SQS queue instead. Again, contact Melair.
                </p>
              </Panel.Body>
            </Panel>
          </Col>
          </Row>
          <Row>
          <Col md={12}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-export" /> Data: Versions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>                
                <Alert bsStyle="danger">
                  <strong>DO NOT</strong> poll this file more than once an hour, see "Update Schedule" above. Consider using the "WebHook" above!
                </Alert>
                <p>
                  We make all recent changes available in a JSON formatted file, this will contain <strong>all</strong> unreleased changes on the beta branch and then changes on the public branch until there are at least <strong>15</strong> total versions.
                </p>
                <pre>
                  https://data.stationeering.com/versions/recent.json
                </pre>
                <p>
                  The JSON file structure is as follows:
                </p>
                <pre>
                {`[
  {
    "version_number": "100156407373", // An always increasing numerical representation of the version number, don't decode this, but it is safe to assume a higher number is newer.
    "version": "0.1.1564.7373", // Always present.
    "build_id": "2985053", // Steam build ID, may be missing.
    "built_date": "1532755962000", // Steam build date, may be missing. Number of milliseconds since unix epoch.
    "beta_date": "1532755962000", // Date the version appeared on the beta branch. Number of milliseconds since unix epoch.
    "public_date": "1532757857000", // Date the version appeared on the public branch, missing if not yet on public. Number of milliseconds since unix epoch.
    "updated_date": "1532758092378", // Date the last time Stationeering updated this record. Number of milliseconds since unix epoch.
    "server_build_id": "2985053", // Dedicated server Steam build ID, may be missing.
    "server_beta_date": "1532755962000", // Date the dedicated server version appeared on the beta branch. Number of milliseconds since unix epoch.
    "server_public_date": "1532757857000", // Date the version dedicated server appeared on the public branch, missing if not yet on public. Number of milliseconds since unix epoch.    
    "notes": [
      "A change log." // One entry per change log line for this version.
    ]
  }
]`}
                </pre>
                <p>
                  The array will contain the most recent version first.
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-export" /> Data: Scenarios</Panel.Title>
              </Panel.Heading>
              <Panel.Body>                
                <Alert bsStyle="danger">
                  <strong>DO NOT</strong> poll this file more than once an hour, see "Update Schedule" above.
                </Alert>
                <p>
                  We parse the scenarios which players can start in, including information about gravity, day length and atmosphere.
                </p>
                <pre>
{`https://data.stationeering.com/scenarios/beta.json
https://data.stationeering.com/scenarios/public.json`}
                </pre>
                <p>
                  The JSON file structure is as follows:
                </p>
                <pre>
                {`[
  {
    "name": "Mars", // Name of scenario.
    "description": "A desolate dusty red ball, Mars features more varied terrain that can reach into the sky, and a chilly atmosphere that's no good for breathing, but maybe it can be used for something...", // Description of scenario, as appears in menu.
    "game_mode": "Survival", // Gamemode the player is in, survival or creative.
    "planet": { // Information about the planetary body.
      "gravity": -3.7, // Acceleration of a player, meters per second per second. Negative is towards the ground.
      "day_length": 0.91 // Length of the delay relative to that of the Moon scenario (20 minutes).
    },
    "atmosphere": { // Atomosphere information
      "temperature": { // Temperature information
        "min": 197.15, // Minimum temperature in Kelvin as listed in key frames.
        "max": 293.15, // Maximum temperature in Kelvin as listed in key frames.
        "avg": 264.91999999999996 // Average temperature in Kelvin of key frames, this is currently not very useful.
      },
      "composition": [  // What the atmosphere is made of.
        {
          "type": "CarbonDioxide", // Gas identifier.
          "quantity": 8.656 // Number of moles in one large grid cube.
        },
        {
          "type": "Nitrogen",
          "quantity": 0.27
        },
        {
          "type": "Oxygen",
          "quantity": 0.131
        },
        {
          "type": "Pollutant",
          "quantity": 0.05839586
        }
      ]
    }
  }
]`}
                </pre>
                <p>
                  It is possible to work out the pressure of the atmosphere with the information presented above using the ideal gas law.
                </p>
                <pre>
                  {`General:
pressure = ((moles * gas constant * temperature) / volume)                                    

For Stationeers:
pressure in kPa = ((moles * 8.3144 * temperature) / 8000)                                    

Notes:
1. Gas constant of 8.3144 is taken from Stationeers source and derivation is beyond the scope of this document.
2. Volume of 8000 is 20³, a Stationeers large grid is a 2m cube. Stationeers seems an order of magnitude off, but this works just fine.`}
                </pre>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-export" /> Data: Recipes</Panel.Title>
              </Panel.Heading>
              <Panel.Body>                
                <Alert bsStyle="danger">
                  <strong>DO NOT</strong> poll this file more than once an hour, see "Update Schedule" above.
                </Alert>
                <p>
                  We parse all recipes and present them in a list.
                </p>
                <pre>
{`https://data.stationeering.com/recipes/beta.json
https://data.stationeering.com/recipes/public.json`}
                </pre>
                <p>
                  The JSON file structure is as follows:
                </p>
                <pre>
                {`{
  "branch": "public", // Branch the file is regarding.
  "updated_time": "1532758424039", // Last time the file was updated by our backend.
  "recipes": [ // List of Recipes.
    {
      "item": "ApplianceChemistryStation", // Item that is made by the recipe.
      "manufactory": "FabricatorRecipes", // Which kind of recipe it is.
      "ingredients": { // Ingredients
        "Gold": "1", // The amount of each material, see the languages file to find out the units for each of these.
        "Time": "90",
        "Iron": "50",
        "Energy": "500",
        "Copper": "2"
      }
    }
  ]
}`}
                </pre>
                <p>
                  At current furnace temperature and pressure requirements are not represented in the data.
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="file-export" /> Data: Languages</Panel.Title>
              </Panel.Heading>
              <Panel.Body>                
                <Alert bsStyle="danger">
                  <strong>DO NOT</strong> poll this file more than once an hour, see "Update Schedule" above.
                </Alert>
                <p>
                  We parse all language files and present them in a JSON structured object.
                </p>
                <pre>
{`https://data.stationeering.com/languages/<code>/<branch>.json

For example:
https://data.stationeering.com/languages/en/beta.json
https://data.stationeering.com/languages/ru/public.json
`}
                </pre>
                <p>
                  The JSON file structure is as follows:
                </p>
                <pre>
                {`{
  "code": "en", // ISO code for language.
  "name": "English", // The name of the langage *in English*.
  "sections": { // Different sections of the language file.
    "Reagents": { // Reagents, raw components used by manufactories.
      "Flour": { // Name of reagent.
        "name": "Flour", // Name in language.
        "unit": "g" // Unit in language, if empty it's a countable word, as approrpiate for that language.
      }
    },
    "Gases": { // Gases used by atmosphereics, straight mapping.
      "CarbonDioxide": "Carbon Dioxide"
    },
    "Things": { // Items, Structures, Kits, etc. Straight mapping.
      "ApplianceMicrowave": "Microwave"
    },
    "Mineables": { // Mineable material ores. Straight mapping.
      "Iron": "Iron"
    }
  }
}`}
                </pre>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Data;
