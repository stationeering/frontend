import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col, Panel, Table, Alert } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb } from '@fortawesome/free-solid-svg-icons';

import './ICSocket.css';

library.add(faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb);

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
      instructionCount: ic.getInstructionCount()
    });
  }

  canRun() {
    return !(this.state.ic.programCounter() >= this.state.ic.getInstructionCount()) || (this.state.errors.length > 0);
  }

  render() {
    var inactive = !this.canRun() ? "interactive inactive" : "interactive";

    return (
      <div className="ICSocket">
        <Row>
          <Col md={4}>
            <Registers registers={this.state.inputRegisters} type="input" name="Input" setRegister={this.setRegister} labels={this.state.labels.input} />
          </Col>
          <Col md={4}>
            <Registers registers={this.state.outputRegisters} type="output" name="Output" setRegister={this.setRegister} labels={this.state.labels.output} />
          </Col>
          <Col md={4}>
            <Registers registers={this.state.internalRegisters} type="internal" name="Internal" setRegister={this.setRegister} clearInternalRegisters={this.clearInternalRegisters} labels={this.state.labels.internal} />
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="terminal" /> Program</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <textarea rows="15" cols="80" value={this.state.program} onChange={this.programChange} />      
                <ProgramErrors errors={this.state.errors} />
                <div>
                  <small>You can share a program simply by sharing the URL in your browser.</small>
                </div>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={4}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="gamepad" /> Control</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <div className="control">
                  <FontAwesomeIcon className={inactive} icon="step-forward" size="2x" onClick={this.step} aria-label="Step through program." />&nbsp;
                  <FontAwesomeIcon className={inactive} icon="play" size="2x" onClick={this.run} aria-label="Play program." />&nbsp;
                  <FontAwesomeIcon className="interactive" icon="redo" size="2x" onClick={this.restart} aria-label="Reset program counter." />
                  <FontAwesomeIcon className={"interactive" + (this.state.runAfterRegisterChange ? "" : " inactive") } icon="eye" size="2x" onClick={this.toggleRunAfterRegisterChange} aria-label="Auto run after register change." />
                </div>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
        <Row>
          <Col md={6}>          
           <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="lightbulb" /> Instructions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h4>Introduction</h4>
                <p>
                  This is a clean room implementation of the Stationeers Programable Chip. It should implement the MIPS instructions set as detailed by <a href="https://steamcommunity.com/games/544550/announcements/detail/2903022560766254057">Heightmare</a>.
                </p>                
                <h4>Writing A Program</h4>
                <p>
                  Write the program code in the Program text box, it will be read and parsed automatically. Any errors will appear below the text box, once corrected the program can be run.
                </p>
                <h4>Running A Program</h4>
                <p>
                  Pressing <FontAwesomeIcon icon="step-forward" /> will step the program through one instruction at a time. Pressing <FontAwesomeIcon icon="play" /> will run it through. If you use step then <FontAwesomeIcon icon="redo" /> will reset the program to the first instruction.
                </p>                                
                <p>
                  Finally <FontAwesomeIcon icon="eye" /> can be toggled, if solid then when a register at the top is changed the program will be automatically rerun.
                </p>
                <h4>Labelling Registers</h4>
                <p>
                  To make make the meaning of registers more obvious you can include a comment in your program as follows:
                </p>
                <pre>{`//:input:0:Base Pressure
//:output:0:Door Open
//:internal:0:If it's safe?`}</pre>
                <p><strong>Note</strong> These comments will still count as line numbers for the interpreter, so addresses for jumps needs to be adjusted.</p>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>          
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book" /> Stationeers Instruction Set</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
              <pre>{`// Text after a // will be ignored to the end of the line. The amount of white
// space between arguments isn't important, but new lines start a new command.

move    d s     // stores the value of s in d

add     d s t   // calculates s + t and stores the result in d
sub     d s t   // calculates s - t and stores the result in d
mul     d s t   // calculates s * t and stores the result in d
div     d s t   // calculates s / t and stores the result in d
mod     d s t   // calculates s mod t and stores the result in d. Note this
                // doesn't behave like the % operator - the result will be
                // positive even if the either of the operands are negative

slt     d s t   // stores 1 in d if s < t, 0 otherwise

sqrt    d s     // calculates sqrt(s) and stores the result in d
round   d s     // finds the rounded value of s and stores the result in d
trunc   d s     // finds the truncated value of s and stores the result in d
ceil    d s     // calculates the ceiling of s and stores the result in d
floor   d s     // calculates the floor of s and stores the result in d

max     d s t   // calculates the maximum of s and t and stores the result in d
min     d s t   // calculates the minimum of s and t and stores the result in d
abs     d s     // calculates the absolute value of s and stores the result in d
log     d s     // calculates the natural logarithm of s and stores the result
                // in d
exp     d s     // calculates the exponential of s and stores the result in d
rand    d       // selects a random number uniformly at random between 0 and 1
                // inclusive and stores the result in d

// boolean arithmetic uses the C convention that 0 is false and any non-zero
// value is true.
and     d s t   // stores 1 in d if both s and t have non-zero values,
                // 0 otherwise
or      d s t   // stores 1 in d if either s or t have non-zero values,
                // 0 otherwise
xor     d s t   // stores 1 in d if exactly one of s and t are non-zero,
                // 0 otherwise
nor     d s t   // stores 1 in d if both s and t equal zero, 0 otherwise


// Lines are numbered starting at zero
j             a // jumps to line a.
bltz      s   a // jumps to line a if s <  0
blez      s   a // jumps to line a if s <= 0
bgez      s   a // jumps to line a if s >= 0
bgtz      s   a // jumps to line a if s >  0
beq       s t a // jumps to line a if s == t
bne       s t a // jumps to line a if s != t

yield           // ceases code execution for this power tick`}</pre>
              </Panel.Body>
            </Panel>
          </Col>  
        </Row>
      </div>
    );
  }

  step() {
    if(this.canRun()) {
      var result = this.state.ic.step();
      this.setState(this.transferICState());
      return result;
    } else {
      return false;
    }
  }

  run() {
    if(this.canRun()) {
      var total = 0;

      while(this.step() && total < 128) {
        total++;        
      }
    }
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
    ic.load(program);
    this.setState({ errors: ic.getProgramErrors() });
    this.setState({ instructionCount: ic.getInstructionCount() });
    this.transferICState();
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
    this.setState({ runAfterRegisterChange: !this.state.runAfterRegisterChange });
  }
}

class ProgramErrors extends Component {
  render() {
    if (this.props.errors.length > 0) {
      return (
        <Alert bsStyle="danger">
          <strong>Parsing Errors</strong>
          <ul className="programErrors">
            {this.renderErrors(this.props.errors)}        
          </ul>
        </Alert>
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
    let field = Number.isInteger(this.props.error.field) ? ` / Field ${this.props.error.field}` : "";
    let errorDescription = this.lookUpError(error);

    return (
      <li className="programError">Line {line}{field}: {errorDescription} ({error}) </li>
    );
  }

  lookUpError(error) {
    switch (error) {
      case "INVALID_FIELD_NO_SUCH_REGISTER":
        return "The register number you have specified does not exist.";      
      case "INVALID_FIELD_UNKNOWN_TYPE":
        return "The register prefix you have provided is unknown, use i, o or r.";
      case "INVALID_FIELD_WRITEONLY":
        return "Instruction requires a source which can be read from, you can not read from an output."
      case "INVALID_FIELD_READONLY":
         return "Instruction requires a destination which can be written to, change to a register or an output."
      case "MISSING_FIELD":
        return "Instruction requires an additional field in this position.";
      case "UNKNOWN_INSTRUCTION":
        return "The instruction you have specified does not exist, check the spelling.";
      default:
        return "Unknown error."
    }
  }
}

class Registers extends Component {
  render() {
    var icon;

    switch(this.props.name) {
    case "Input":
      icon = <FontAwesomeIcon icon="long-arrow-alt-right" />;
      break;
    case "Output":
      icon = <FontAwesomeIcon icon="long-arrow-alt-left" />;
      break;
    case "Internal":
      icon = <FontAwesomeIcon icon="memory" />;
      break;
      default:
      icon = "default";
    }

    var clearRegisters = (this.props.name === "Internal" ? <FontAwesomeIcon icon="times" className="pull-right interactive" onClick={this.props.clearInternalRegisters} title="Clear registers." /> : "")

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3">{icon} {this.props.name} Registers {clearRegisters}</Panel.Title>
        </Panel.Heading>
        <Table>
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
