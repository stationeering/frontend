import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col } from 'react-bootstrap';
import './ICSocket.css';

class ICSocket extends Component {
  constructor(props) {
    super(props);

    this.programChange = this.programChange.bind(this);
    this.step = this.step.bind(this);
    this.run = this.run.bind(this);
    this.restart = this.restart.bind(this);
    this.clearInternalRegisters = this.clearInternalRegisters.bind(this);
    this.setRegister = this.setRegister.bind(this);
    this.toggleRunAfterRegisterChange = this.toggleRunAfterRegisterChange.bind(this);
    this.hashChanged = this.hashChanged.bind(this);

    let defaultCode = "ADD 1 r0 r0 // Increment r0.";

    this.state = { ic: new IC(), program: defaultCode, errors: [], labels: { input: [], output: [], internal: [] }, runAfterRegisterChange: false, currentHash: "" };
    this.loadProgram(defaultCode);
  }

  componentDidMount() {
    this.loadStateFromHash();
    this.transferICState();

    window.addEventListener("hashchange", this.hashChanged, false);
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.hashChanged, false);
  }

  componentDidUpdate() {
    this.saveStateToHash();
  }

  hashChanged(event) {
    this.loadStateFromHash();
  }

  loadStateFromHash() {
    if (window.location.hash.length === 0) {
      return {};
    }

    let rawHash = window.location.hash.substring(1);

    if (rawHash === this.state.currentHash) {
      return {};
    }

    let json = atob(rawHash);
    let data = JSON.parse(json);

    let returnData = { currentHash: rawHash };

    if (data.hasOwnProperty("program")) {
      returnData["program"] = data.program;
      this.loadProgram(data.program);
    }

    if (data.hasOwnProperty("runAfterRegisterChange")) {
      returnData["runAfterRegisterChange"] = data.runAfterRegisterChange;
    }

    if (data.hasOwnProperty("registers")) {
      Object.keys(data.registers).forEach((key) => {
        data.registers[key].forEach((value, i) => {
          switch (key) {
            case "input":
              this.state.ic.setInputRegister(i, value);
              break;
            case "output":
              this.state.ic.setOutputRegister(i, value);
              break;
            case "internal":
              this.state.ic.setInternalRegister(i, value);
              break;
            default:
          }
        });
      });
    }

    this.setState(returnData);
  }

  saveStateToHash() {
    let data = { program: this.state.program, registers: { input: this.state.inputRegisters, output: this.state.outputRegisters, internal: this.state.internalRegisters }, runAfterRegisterChange: this.state.runAfterRegisterChange };
    let json = JSON.stringify(data);
    let base64 = btoa(json);

    if (this.state.currentHash !== base64) {
      window.location.hash = base64;
      this.setState({ currentHash: base64 })
    }
  }

  transferICState() {
    let ic = this.state.ic;

    this.setState({
      inputRegisters: ic.getInputRegisters(),
      outputRegisters: ic.getOutputRegisters(),
      internalRegisters: ic.getInternalRegisters(),
      programCounter: ic.programCounter(),
      instructions: ic.getInstructions(),
      instructionCount: ic.instructionCount()
    });
  }

  render() {
    var canRun = this.state.ic.programCounter() >= this.state.ic.instructionCount() || this.state.errors.length > 0;

    return (
      <div className="ICSocket">
        <Row>
          <Col md={4}>
            <h3>Input Registers</h3>
            <Registers registers={this.state.inputRegisters} type="input" setRegister={this.setRegister} labels={this.state.labels.input} />
          </Col>
          <Col md={4}>
            <h3>Output Registers</h3>
            <Registers registers={this.state.outputRegisters} type="output" setRegister={this.setRegister} labels={this.state.labels.output} />
          </Col>
          <Col md={4}>
            <h3>Internal Registers</h3>
            <Registers registers={this.state.internalRegisters} type="internal" setRegister={this.setRegister} labels={this.state.labels.internal} />
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <h3>Program</h3>
           <textarea rows="15" cols="80" value={this.state.program} onChange={this.programChange} />      
            <ProgramErrors errors={this.state.errors} />
          </Col>
          <Col md={4}>
            <h3>Instructions</h3>
            <Instructions instructions={this.state.instructions} programCounter={this.state.programCounter} />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <h3>Control</h3>
            <div>
              <button onClick={this.step} disabled={canRun}>Step</button>
              <button onClick={this.run} disabled={canRun}>Run</button>
              <button onClick={this.restart}>Restart</button>
              <button onClick={this.clearInternalRegisters}>Clear Internal Registers</button>
            </div>
            Auto Run After Register Change <input type="checkbox" checked={this.state.runAfterRegisterChange} onChange={this.toggleRunAfterRegisterChange} />
          </Col>
        </Row>
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
    switch (type) {
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

    this.transferICState();

    if (this.state.runAfterRegisterChange) {
      this.run();
    }
  }

  programChange(event) {
    this.setState({ program: event.target.value });
    this.loadProgram(event.target.value);
  }

  loadProgram(program) {
    let ic = this.state.ic;
    this.setState({ errors: ic.load(program) });
    this.setState({ instructionCount: ic.instructionCount() });
    this.parseLabels(program);
  }

  parseLabels(program) {
    let labels = { input: [], output: [], internal: [] };
    let lines = program.split("\n")

    lines.forEach((line, i) => {
      if (line.startsWith("//:")) {
        let tokens = line.split(":");

        if (tokens.length === 4) {
          if (labels.hasOwnProperty(tokens[1])) {
            let number = Number.parseInt(tokens[2], 10);
            labels[tokens[1]][number] = tokens[3];
          }
        }
      }
    });

    this.setState({ labels });
  }

  toggleRunAfterRegisterChange(event) {
    this.setState({ runAfterRegisterChange: event.target.checked });
  }
}

class ProgramErrors extends Component {
  render() {
    if (this.props.errors.length > 0) {
      return (
        <ul className="programErrors">
          {this.renderErrors(this.props.errors)}
        </ul>
      );
    } else {
      return null;
    }
  }

  renderErrors(errors) {
    return this.props.errors.map((error, i) => <ProgramError key={i} error={error} />)
  }
}

class ProgramError extends Component {
  render() {
    let line = this.props.error.line;
    let error = this.props.error.error;
    let field = this.props.error.field ? ` / Field ${this.props.error.field}` : "";
    let errorDescription = this.lookUpError(error);

    return (
      <li className="programError">Line {line}{field}: {errorDescription} ({error}) </li>
    );
  }

  lookUpError(error) {
    switch (error) {
      case "TOO_MANY_INSTRUCTIONS":
        return "There are too many instructions present in your program, there is a limit on the number which an IC can take.";
      case "FIELD_COUNT_MISMATCH":
        return "The instruction you are using requires a different number of fields then you have provided.";
      case "READ_ONLY_REGISTER":
        return "The register you are outputting a value to is read only (or a litteral), choose an output or internal register.";
      case "OUT_OF_BOUND_REGISTER":
        return "The register number you have specified does not exist.";
      case "UNKNOWN_REGISTER":
        return "The register prefix you have provided is unknown, use i, o or r."
      case "UNKNOWN_INSTRUCTION":
        return "The instruction you have specified does not exist, check the spelling."
      default:
        return "Unknown error."
    }
  }
}

class Instructions extends Component {
  render() {
    return (
      <div>
        <table className="instructions">
          <thead>
            <tr><th>Index</th><th>Instruction</th></tr>
          </thead>
          <tbody>
            {this.renderInstructions()}
          </tbody>
        </table>
      </div>
    );
  }

  renderInstructions() {
    if (this.props.instructions) {
      return this.props.instructions.map((value, i) => <Instruction key={i} index={i} value={value} current={i === this.props.programCounter }/>);
    }
  }
}

class Instruction extends Component {
  render() {
    let arrow = this.props.current ? <span className="fas fa-angle-double-right" /> : "";
    return (
      <tr className={"instruction" + (this.props.current ? " active" : "")}>
        <td>{this.props.index} {arrow}</td>
        <td>{this.props.value.join(" ")}</td>
      </tr>
    );
  }
}

class Registers extends Component {
  render() {
    return (
      <table className="registers">
        <thead>
          <tr><th>Index</th><th>Set</th><th>Value</th><th>Label</th></tr>
        </thead>
        <tbody>
          {this.renderRegisters()}
        </tbody>
      </table>
    );
  }

  renderRegisters() {
    if (this.props.registers) {
      return this.props.registers.map((value, i) => <Register key={i} index={i} value={value} label={this.props.labels[i]} type={this.props.type} setRegister={this.props.setRegister} />);
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

  render() {
    return (
      <tr className="register">
        <td>{this.props.index}</td>
        <td><input type="text" size="5" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}>-&gt;</button></td>
        <td>{this.props.value}</td>
        <td>{this.props.label}</td>
      </tr>
    );
  }

  onChange(event) {
    this.setState({ inputValue: event.target.value });
  }

  onClick() {
    var newVal = Number.parseFloat(this.state.inputValue);

    if (!Number.isNaN(newVal)) {
      this.props.setRegister(this.props.type, this.props.index, Number.parseFloat(this.state.inputValue));
      this.setState({ inputValue: "" });
    }
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      this.onClick();
    }
  }
}

export default ICSocket;
