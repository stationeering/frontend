import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import IC from 'stationeers-ic';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBook } from '@fortawesome/free-solid-svg-icons';

library.add(faBook);

class ICInstructionSet extends Component {
  constructor(props) {
    super(props);

    let ic = new IC();
    let instructions = ic.getInstructions();
    let instructionKeys = Object.keys(instructions);

    let instructionsByCategory = instructionKeys.reduce((acc, opcode) => {
      let category = instructions[opcode].category;

      if (!Object.keys(acc).includes(category)) {
        acc[category] = {};
      }

      acc[category][opcode] = instructions[opcode].fields;

      return acc;
    }, {});

    this.state = { instructions: instructionKeys, instructionsByCategory, extractedInstructions: { data: null, message: "Please wait loading instruction descriptions." } };
  }

  componentDidMount() {
    var instructionSet = this;

    axios({ url: 'https://data.stationeering.com/logic/beta/instructions.json', method: 'get', responseType: 'json' })
        .then(function (response) {
            instructionSet.setState({ extractedInstructions: { data: response.data, message: null } })
        })
        .catch(function (error) {
            instructionSet.setState({ extractedInstructions: { message: "Failed to load instruction descriptions! " + error } })
        });
  }

  render() {
    let categories = Object.keys(this.state.instructionsByCategory).map((category) => <ICInstructionSetCategory key={category} category={category} instructions={this.state.instructionsByCategory[category]} extractedInstructions={this.state.extractedInstructions.data || {}} />)

    return (<Panel>
      <Panel.Heading>
        <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book" /> Stationeers Instruction Set</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <p>
          Comments are made by using the <code>#</code> symbol, either at the start of a line or after an instruction.
        </p>
        {categories}
      </Panel.Body>
    </Panel>);
  }
}

class ICInstructionSetCategory extends Component {
  render() {
    let instructions = Object.keys(this.props.instructions).map((instruction) => <ICInstruction key={instruction} opcode={instruction} fields={this.props.instructions[instruction]} description={this.props.extractedInstructions[instruction]} />)

    let categoryName = this.props.category;

    switch(this.props.category) {
      case "device":
        categoryName = "Device IO";
        break;

      case "flow":
        categoryName = "Flow Control, Branches and Jumps";
        break;

      case "select":
        categoryName = "Variable Selection";
        break;

      case "math":
        categoryName = "Mathematical Operations";
        break;

      case "logic":
        categoryName = "Logic";
        break;

      case "stack":
        categoryName = "Stack";
        break;

      case "misc":
        categoryName = "Misc";
        break;
    }

    return (<div>
      <h4>{categoryName}</h4>
      <Table condensed>
          <thead>
            <tr>
              <th>Instruction</th>
              <th>a</th>
              <th>b</th>
              <th>c</th>
              <th>d</th>
            </tr>
          </thead>
          <tbody>
            {instructions}
          </tbody>
      </Table>
    </div>)
  }
}

class ICInstruction extends Component {
  render() {
    let fields = this.props.fields.map((field) => <td>{field.join(" ")}</td>);

    return (<React.Fragment>
        <tr>
          <td><code>{this.props.opcode}</code></td>
          {fields}
        </tr>
        <tr>
          <td colspan={5}>{this.props.description}</td>
        </tr> 
      </React.Fragment>)
  }
}

export default ICInstructionSet;