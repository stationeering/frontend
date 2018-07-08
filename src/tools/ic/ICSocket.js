import React, { Component } from 'react';
import IC from 'stationeers-ic';
import './ICSocket.css';

class ICSocket extends Component {
  constructor(props) {
    super(props);
    let defaultCode = "GT i0 75 r0     // Specify constants inline in code\nLT i1 353 r1    // Check temperature\nMAX r0 r1 r2    // Is temp too high or pressure too low?\nSEL r2 0 1 o0   // Set the door status\nSEL r2 0 4 o1   // Set the LED light (white/red)";

    this.state = { ic: new IC(), program: defaultCode, errors: [] };    
    this.state = Object.assign(this.transferICState(), this.state);

    this.programChange = this.programChange.bind(this);
    this.step = this.step.bind(this);
    this.run = this.run.bind(this);
    this.restart = this.restart.bind(this);
    this.clearInternalRegisters = this.clearInternalRegisters.bind(this);
    this.setRegister = this.setRegister.bind(this);
  }

  componentDidMount() {
    this.loadProgram(this.state.program);
  }

  transferICState() {
    let ic = this.state.ic;

    return {
      inputRegisters: ic.getInputRegisters(),
      outputRegisters: ic.getOutputRegisters(),
      internalRegisters: ic.getInternalRegisters(),
      programCounter: ic.programCounter(),
      instructionCount: ic.instructionCount()
    };
  }

  render() {
    var outOfSteps = this.state.ic.programCounter() >= this.state.ic.instructionCount() || this.state.errors.length > 0;

    return (    
      <div className="ICSocket">
        <h3>Input Registers</h3>
        <Registers registers={this.state.inputRegisters} type="input" setRegister={this.setRegister} />
        <h3>Output Registers</h3>
        <Registers registers={this.state.outputRegisters} type="output" setRegister={this.setRegister} />
        <h3>Internal Registers</h3>
        <Registers registers={this.state.internalRegisters} type="internal" setRegister={this.setRegister} />
        <h3>Program</h3>
        <textarea rows="15" cols="80" defaultValue={this.state.program} onChange={this.programChange}/>
        <ProgramErrors errors={this.state.errors} />
        <h3>Control</h3>
        <div>Program Counter: {this.state.programCounter} Total Instructions: {this.state.instructionCount}</div>
        <button onClick={this.step} disabled={outOfSteps}>Step</button>
        <button onClick={this.run} disabled={outOfSteps}>Run</button>
        <button onClick={this.restart}>Restart</button>
        <button onClick={this.clearInternalRegisters}>Clear Internal Registers</button>
      </div>
    );
  }

  step() {
    this.state.ic.step();
    this.setState(this.transferICState());
  }

  run() {
    var i;

    for (i = this.state.ic.programCounter(); i < this.state.ic.instructionCount(); i++) {
      this.step();
    }

    this.restart();
  }

  restart() {
    this.state.ic.restart();
    this.setState(this.transferICState());
  }

  clearInternalRegisters() {
    let internalCount = this.state.ic.getInternalRegisters().length;

    for (var i = 0; i < internalCount; i++) {
      this.state.ic.setInternalRegister(i, 0);
    }

    this.setState(this.transferICState());
  }

  setRegister(type, index, value) {
    switch(type) {
      case "input":
      this.state.ic.setInputRegister(index, value);
      break;
      case "output":
      this.state.ic.setOutputRegister(index, value);
      break;
      case "internal":
      this.state.ic.setInternalRegister(index, value);
      break;
      default:
    }
    this.setState(this.transferICState());
  }

  programChange(event) {
    this.loadProgram(event.target.value);
  }

  loadProgram(program) {
    let ic = this.state.ic;    
    this.setState({ errors: ic.load(program) });  
    this.setState({ instructionCount: ic.instructionCount() });
  }
}

class ProgramErrors extends Component {
  render() {
    return (
      <div className="programErrors">
        {this.renderErrors(this.props.errors)}
      </div>
    );
  }

  renderErrors(errors) {
    return this.props.errors.map((error, i) => <ProgramError key={i} error={error} />)
  }
}

class ProgramError extends Component {
  render() {
    let line = this.props.error.line;
    let error = this.props.error.error;
    let field = this.props.error.field ? `(Field ${this.props.error.field})` : "";

    return (
      <div className="programError">Line {line}: {error} {field}</div>
    );
  }
}

class Registers extends Component {
  render() {
    return (
      <div className="registers">
        {this.renderRegisters()}
      </div>
    );
  }

  renderRegisters() {
      return this.props.registers.map((value, i) => <Register key={i} index={i} value={value} type={this.props.type} setRegister={this.props.setRegister} />);
  }
}

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = { inputValue: "0" };

    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div className="register">
        {this.props.index}: New: <input value={this.state.inputValue} type="text" size="5" onChange={this.onChange} /> <button onClick={this.onClick}>-></button> Current: {this.props.value}
      </div>
    );
  }

  onChange(event) {
    this.setState({ inputValue: Number.parseFloat(event.target.value) });
  }

  onClick(event) {
    this.props.setRegister(this.props.type, this.props.index, this.state.inputValue);
  }
}

export default ICSocket;
