import React, { Component } from 'react';
import { Panel, Table, Col, Clearfix } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowsAltH, faTrashAlt, faPlus, faWrench, faLink, faUnlink } from '@fortawesome/free-solid-svg-icons';

library.add(faArrowsAltH, faTrashAlt, faPlus, faWrench, faLink, faUnlink);

class ICIODevices extends Component {
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
          <Panel.Title componentClass="h3"><FontAwesomeIcon icon="arrows-alt-h" /> Device (IO)</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {this.renderRegisters()}
        </Panel.Body>
      </Panel>
    );
  }

  renderRegisters() {
    if (this.props.registers) {

      var registers = this.props.registers.map((register, i) => <ICIODevice key={i} index={i} name={this.props.names[i]} values={register} slots={this.props.slots[i]} reagents={this.props.reagents[i]} label={this.props.labels[i]} connected={this.props.connected[i]} setRegister={this.props.setRegister} setIOSlot={this.props.setIOSlot} setIOReagent={this.props.setIOReagent}  toggleLink={this.props.toggleLink} />);

      var chunkedRegisters = this.chunk(registers, 2);
      
      return chunkedRegisters.map((chunk) => <Clearfix>{chunk}</Clearfix>)
    } else {
      return null;
    }
  }
}

class ICIODevice extends Component {
  constructor(props) {
    super(props);

    this.toggleLink = this.toggleLink.bind(this);
  }

  toggleLink() {
    this.props.toggleLink(this.props.index);
  }

  render() {
    var labelWithSeperator = (this.props.label ? "(" + this.props.label + ")" : "");

    return (
      <Col md={6}>
        <Panel bsStyle={this.props.connected ? "default" : "danger"}>
          <Panel.Heading>
            <Panel.Title componentClass="h5">{this.props.name} {labelWithSeperator} <FontAwesomeIcon onClick={this.toggleLink} className="pull-right" icon={this.props.connected ? "link" : "unlink"} /></Panel.Title>
          </Panel.Heading>
          <ICIORegisters index={this.props.index} setRegister={this.props.setRegister} values={this.props.values} />
          <ICIOSlots index={this.props.index} setIOSlot={this.props.setIOSlot} slots={this.props.slots} />
          <ICIOReagents index={this.props.index} setIOReagent={this.props.setIOReagent} reagents={this.props.reagents} />
        </Panel>
      </Col>
    );
  }
}

class ICIORegisters extends Component {
  render() {
    return (
      <Table condensed>
      <thead>
        <tr><th>Field</th><th>Set</th><th>Value</th></tr>
      </thead>
      <tbody>
        {this.renderFields()}
        <ICNewIORegister registerIndex={this.props.index} setRegister={this.props.setRegister} />
      </tbody>
    </Table>
    );
  }

  renderFields() {
    return Object.keys(this.props.values).map((fieldName) => <ICIORegister key={fieldName} registerIndex={this.props.index} field={fieldName} value={this.props.values[fieldName]} setRegister={this.props.setRegister} />)
  }
}

class ICIOSlots extends Component {
  render() {
    return (
      <Table condensed>
      <thead>
        <tr><th>Slot</th><th>Logic Type</th><th>Set</th><th>Value</th></tr>
      </thead>
      <tbody>
        {this.renderFields()}
        <ICNewIOSlot registerIndex={this.props.index} setIOSlot={this.props.setIOSlot} />
      </tbody>
    </Table>
    );
  }

  renderFields() {
    var slots = [];

    for (var slot of Object.keys(this.props.slots)) {
      var slotData = this.props.slots[slot];

      for (var logicType of Object.keys(slotData)) {
        slots.push(<ICIOSlot key={slot+logicType} registerIndex={this.props.index} slot={slot} value={slotData[logicType]} logicType={logicType} setIOSlot={this.props.setIOSlot} />);
      }
    }

    return slots;
  }
}

class ICIOReagents extends Component {
  render() {
    return (
      <Table condensed>
      <thead>
        <tr><th>Reagent</th><th>Mode</th><th>Set</th><th>Value</th></tr>
      </thead>
      <tbody>
        {this.renderFields()}
        <ICNewIOReagent registerIndex={this.props.index} setIOReagent={this.props.setIOReagent} />
      </tbody>
    </Table>
    );
  }

  renderFields() {
    var reagents = [];

    for (var reagent of Object.keys(this.props.reagents)) {
      var reagentData = this.props.reagents[reagent];

      for (var reagentMode of Object.keys(reagentData)) {
        reagents.push(<ICIOReagent key={reagent+reagentMode} registerIndex={this.props.index} reagent={reagent} value={reagentData[reagentMode]} reagentMode={reagentMode} setIOReagent={this.props.setIOReagent} />);
      }
    }

    return reagents;
  }
}

class ICIORegister extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: "" };

    this.onClickUpdate = this.onClickUpdate.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  roundTo(value, decimals) {
    return Number(value.toFixed(decimals));
  }

  render() {
    return (<tr>
      <td>{this.props.field}</td>
      <td><input type="text" size="4" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClickUpdate}><FontAwesomeIcon icon="wrench" /></button> <button onClick={this.onClickRemove}><FontAwesomeIcon icon="trash-alt" /></button></td>
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

class ICNewIORegister extends Component {
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
      <td><input type="text" size="6" onChange={this.onChangeField} value={this.state.inputField} /></td>
      <td><input type="text" size="4" onChange={this.onChangeValue} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}><FontAwesomeIcon icon="plus" size="sm" /></button></td>
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

class ICIOSlot extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: "" };

    this.onClickUpdate = this.onClickUpdate.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  roundTo(value, decimals) {
    return Number(value.toFixed(decimals));
  }

  render() {
    return (<tr>
      <td>{this.props.slot}</td>
      <td>{this.props.logicType}</td>
      <td><input type="text" size="4" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClickUpdate}><FontAwesomeIcon icon="wrench" size="sm" /></button> <button onClick={this.onClickRemove}><FontAwesomeIcon icon="trash-alt" /></button></td>
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
      this.props.setIOSlot(this.props.registerIndex, this.props.slot, this.props.logicType, newVal);
      this.setState({ inputValue: "" });
    }
  }

  onClickRemove() {
    this.props.setIOSlot(this.props.registerIndex, this.props.slot, this.props.logicType, undefined);
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClickUpdate();
    }
  }
}

class ICNewIOSlot extends Component {
  constructor(props) {
    super(props);

    this.state = { inputSlot: "", inputLogicType: "", inputValue: "" };

    this.onClick = this.onClick.bind(this);
    this.onChangeSlot = this.onChangeSlot.bind(this);
    this.onChangeLogicType = this.onChangeLogicType.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  render() {
    return (<tr>
      <td><input type="text" size="6" onChange={this.onChangeSlot} onKeyPress={this.onKeyPress} value={this.state.inputSlot} /></td>
      <td><input type="text" size="6" onChange={this.onChangeLogicType} value={this.state.inputLogicType} /></td>
      <td><input type="text" size="4" onChange={this.onChangeValue} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}><FontAwesomeIcon icon="plus" size="sm" /></button></td>
      <td />
    </tr>
    );
  }

  onChangeSlot(event) {
    this.setState({ inputSlot: event.target.value });
  }

  onChangeLogicType(event) {
    this.setState({ inputLogicType: event.target.value });
  }

  onChangeValue(event) {
    this.setState({ inputValue: event.target.value });
  }

  onClick() {
    var value = Number.parseFloat(this.state.inputValue);    
    var slot = Number.parseInt(this.state.inputSlot, 10);

    if (!Number.isNaN(value) && !Number.isNaN(slot) && this.state.inputLogicType !== "") {
      this.props.setIOSlot(this.props.registerIndex, slot, this.state.inputLogicType, value);
      this.setState({ inputValue: "", inputSlot: "", inputLogicType: "" });
    }
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClick();
    }
  }
}

class ICIOReagent extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: "" };

    this.onClickUpdate = this.onClickUpdate.bind(this);
    this.onClickRemove = this.onClickRemove.bind(this);

    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  roundTo(value, decimals) {
    return Number(value.toFixed(decimals));
  }

  render() {
    return (<tr>
      <td>{this.props.reagent}</td>
      <td>{this.props.reagentMode}</td>
      <td><input type="text" size="4" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClickUpdate}><FontAwesomeIcon icon="wrench" size="sm" /></button> <button onClick={this.onClickRemove}><FontAwesomeIcon icon="trash-alt" /></button></td>
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
      this.props.setIOReagent(this.props.registerIndex, this.props.reagent, this.props.reagentMode, newVal);
      this.setState({ inputValue: "" });
    }
  }

  onClickRemove() {
    this.props.setIOReagent(this.props.registerIndex, this.props.reagent, this.props.reagentMode, undefined);
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClickUpdate();
    }
  }
}

class ICNewIOReagent extends Component {
  constructor(props) {
    super(props);

    this.state = { inputReagent: "", inputReagentMode: "", inputValue: "" };

    this.onClick = this.onClick.bind(this);
    this.onChangeReagent = this.onChangeReagent.bind(this);
    this.onChangeReagentMode = this.onChangeReagentMode.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }  
  
  render() {
    return (<tr>
      <td><input type="text" size="6" onChange={this.onChangeReagent} onKeyPress={this.onKeyPress} value={this.state.inputReagent} /></td>
      <td><input type="text" size="6" onChange={this.onChangeReagentMode} value={this.state.inputReagentMode} /></td>
      <td><input type="text" size="4" onChange={this.onChangeValue} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}><FontAwesomeIcon icon="plus" size="sm" /></button></td>
      <td />
    </tr>
    );
  }

  onChangeReagent(event) {
    this.setState({ inputReagent: event.target.value });
  }

  onChangeReagentMode(event) {
    this.setState({ inputReagentMode: event.target.value });
  }

  onChangeValue(event) {
    this.setState({ inputValue: event.target.value });
  }

  onClick() {
    var value = Number.parseFloat(this.state.inputValue);    

    if (!Number.isNaN(value) && this.state.inputReagent !== "" && this.state.inputReagentMode !== "") {
      this.props.setIOReagent(this.props.registerIndex, this.state.inputReagent, this.state.inputReagentMode, value);
      this.setState({ inputReagent: "", inputReagentMode: "", inputValue: "" });
    }
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClick();
    }
  }
}

export default ICIODevices;
