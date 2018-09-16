import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faMemory, faTimes, faWrench } from '@fortawesome/free-solid-svg-icons';

library.add(faTimes, faMemory, faWrench);

class ICInternalRegisters extends Component {
    render() {
      return (
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="memory" /> Internal Registers <FontAwesomeIcon icon="times" className="pull-right interactive" onClick={this.props.clearInternalRegisters} title="Clear registers." /></Panel.Title>
          </Panel.Heading>
          <Table condensed>
            <thead>
              <tr><th /><th>Set</th><th>Value</th><th>Label</th></tr>
            </thead>
            <tbody>
              {this.renderRegisters()}
            </tbody>
          </Table>
        </Panel>
      );
    }
  
    renderRegisters() {
      if (this.props.registers) {
        return this.props.registers.map((value, i) => <Register key={i} index={i} value={value} label={this.props.labels[i]} alias={this.props.aliases[i]} setRegister={this.props.setRegister} />);
      }
    }
  }
  
  class Register extends Component {
    constructor(props) {
      super(props);
  
      this.state = { inputValue: "" };
  
      this.onClick = this.onClick.bind(this);
      this.onChange = this.onChange.bind(this);
      this.onKeyPress = this.onKeyPress.bind(this);
    }
  
    roundTo(value, decimals) {
      return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
  
    render() {
      var alias = [ this.props.alias, this.props.label ].filter((a) => a).join(" / ");

      return (
        <tr className="register">
          <td>{this.props.index}</td>
          <td><input type="text" size="6" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}><FontAwesomeIcon icon="wrench" /></button></td>
          <td>{this.roundTo(this.props.value, 5)}</td>
          <td>{alias}</td>
        </tr>
      );
    }
  
    onChange(event) {
      this.setState({ inputValue: event.target.value });
    }
  
    onClick() {
      var newVal = Number.parseFloat(this.state.inputValue);
  
      if (!Number.isNaN(newVal)) {
        this.props.setRegister("internal", this.props.index, Number.parseFloat(this.state.inputValue));
        this.setState({ inputValue: "" });
      }
    }
  
    onKeyPress(event) {
      if (event.key === "Enter") {
        this.onClick();
      }
    }
  }

  export default ICInternalRegisters;
