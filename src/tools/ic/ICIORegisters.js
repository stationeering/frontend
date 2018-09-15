import React, { Component } from 'react';
import { Panel, Table, Col, Clearfix } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowsAltH, faTrashAlt, faPlus, faWrench } from '@fortawesome/free-solid-svg-icons';

library.add(faArrowsAltH, faTrashAlt, faPlus, faWrench);

class ICIORegisters extends Component {
  chunk(arr, len) {
    var chunks = [],
        i = 0,
        n = arr.length;
  
    while (i < n) {
      chunks.push(arr.slice(i, i += len));
    }
  
    return chunks;
  }
  
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3"><FontAwesomeIcon icon="arrows-alt-h" /> Device (IO) Registers</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {this.renderRegisters()}
        </Panel.Body>
      </Panel>
    );
  }

  renderRegisters() {
    if (this.props.registers) {
      var registers = this.props.registers.map((register, i) => <ICIORegister key={i} index={i} values={register} label={this.props.labels[i]} setRegister={this.props.setRegister} />);

      var chunkedRegisters = this.chunk(registers, 2);
      
      return chunkedRegisters.map((chunk) => <Clearfix>{chunk}</Clearfix>)
    } else {
      return null;
    }
  }
}

class ICIORegister extends Component {
  render() {
    var labelWithSeperator = (this.props.label ? "(" + this.props.label + ")" : "");

    return (
      <Col md={6}>
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h5">d{this.props.index} {labelWithSeperator}</Panel.Title>
          </Panel.Heading>
          <Table condensed>
            <thead>
              <tr><th>Field</th><th>Set</th><th>Value</th></tr>
            </thead>
            <tbody>
              {this.renderFields()}
              <ICNewIOField registerIndex={this.props.index} setRegister={this.props.setRegister} />
            </tbody>
          </Table>
        </Panel>
      </Col>
    );
  }

  renderFields() {
    return Object.keys(this.props.values).map((fieldName) => <ICIOField key={fieldName} registerIndex={this.props.index} field={fieldName} value={this.props.values[fieldName]} setRegister={this.props.setRegister} />)
  }
}

class ICNewIOField extends Component {
  constructor(props) {
    super(props);

    this.state = { inputField: "", inputValue: "" };

    this.onClick = this.onClick.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  render() {
    return (<tr>
      <td><input type="text" size="10" onChange={this.onChangeField} value={this.state.inputField} /></td>
      <td><input type="text" size="6" onChange={this.onChangeValue} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}><FontAwesomeIcon icon="plus" /></button></td>
      <td />
    </tr>
    );
  }

  onChangeField(event) {
    this.setState({ inputField: event.target.value });
  }

  onChangeValue(event) {
    this.setState({ inputValue: event.target.value });
  }

  onClick() {
    var newVal = Number.parseFloat(this.state.inputValue);

    if (!Number.isNaN(newVal) && this.state.inputField !== "") {
      this.props.setRegister("io", this.props.registerIndex, Number.parseFloat(this.state.inputValue), this.state.inputField );
      this.setState({ inputValue: "", inputField: "" });
    }
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClick();
    }
  }
}

class ICIOField extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: "" };

    this.onClickUpdate = this.onClickUpdate.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  roundTo(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  render() {
    return (<tr>
      <td>{this.props.field}</td>
      <td><input type="text" size="6" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClickUpdate}><FontAwesomeIcon icon="wrench" /></button> <button onClick={this.onClickRemove}><FontAwesomeIcon icon="trash-alt" /></button></td>
      <td>{this.roundTo(this.props.value, 5)}</td>
    </tr>
    );
  }

  onChange(event) {
    this.setState({ inputValue: event.target.value });
  }

  onClickUpdate() {
    var newVal = Number.parseFloat(this.state.inputValue);

    if (!Number.isNaN(newVal)) {
      this.props.setRegister("io", this.props.registerIndex, Number.parseFloat(this.state.inputValue), this.props.field);
      this.setState({ inputValue: "" });
    }
  }

  onClickRemove() {
    this.props.setRegister("io", this.props.registerIndex, undefined, this.props.field);
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClickUpdate();
    }
  }
}

export default ICIORegisters;
