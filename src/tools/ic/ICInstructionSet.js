import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import IC from 'stationeers-ic';
import axios from 'axios';

import sanitize from 'sanitize-html';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBook } from '@fortawesome/free-solid-svg-icons';

import './ICInstructionSet.css';

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

const SECTIONS = {
  "device": "Device IO",
  "flow": "Flow Control, Branches and Jumps",
  "select": "Variable Selection",
  "math": "Mathematical Operations",
  "logic": "Logic",
  "stack": "Stack",
  "misc": "Misc"
};

class ICInstructionSetCategory extends Component {
  render() {
    let instructions = Object.keys(this.props.instructions).sort().map((instruction) => {
      let data = this.props.extractedInstructions[instruction] || { description: "", example: "" };

      return <ICInstruction key={instruction} opcode={instruction} fields={this.props.instructions[instruction]} description={data.description} example={data.example} />;
    });

    let categoryName = SECTIONS[this.props.category] || this.props.category;

    return (<div>
      <h4>{categoryName}</h4>
      <Table condensed>
        <thead>
          <tr>
            <th>Instruction</th>
            <th colSpan={4}>Fields</th>
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
    let fields = this.props.example.split(" ").splice(1).map((field, i) => <ICField field={field} key={i} />);

    for (let i = fields.length; i <= 3; i++) {
      fields.push(<td className="field">&nbsp;</td>)
    }

    return (<React.Fragment>
        <tr>
          <td><code>{this.props.opcode}</code></td>
          {fields}
        </tr>
        <tr>
          <td colSpan={5}>» {this.props.description}</td>
        </tr> 
      </React.Fragment>)
  }
}

class ICField extends Component {
  render() {
    return <td className="field"><code>{sanitize(this.props.field)}</code></td>;
  }
}

export default ICInstructionSet;