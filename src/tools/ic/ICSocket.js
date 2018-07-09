import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col, Panel, Table, Badge, Alert } from 'react-bootstrap';

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
      instructions: ic.getInstructions(),
      instructionCount: ic.instructionCount()
    });
  }

  canRun() {
    return !(this.state.ic.programCounter() >= this.state.ic.instructionCount()) || (this.state.errors.length > 0);
  }

  render() {
    var inactive = !this.canRun() ? "interactive inactive" : "interactive";

    return (
      <div className="ICSocket">
        <Row>
          <Col md={12}>
            <Panel bsStyle="danger">
              <Panel.Heading>
                <Panel.Title componentClass="h3">Warning</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                This is an implementation of a community suggestion, it is not yet in the game.
              </Panel.Body>
            </Panel> 
          </Col>
        </Row>
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
            <Instructions instructions={this.state.instructions} programCounter={this.state.programCounter} />
          </Col>
        </Row>
        <Row>
          <Col md={8}>          
           <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="lightbulb" /> Instructions</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <h4>Introduction</h4>
                <p>
                  This is an simulation of an integrated circuit suggestion by <a href="https://www.reddit.com/r/Stationeers/comments/8wfi98/the_pain_of_logic_and_the_potential_of_integrated/">Recatek</a>. See the instruction set for all options.
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
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={4}>          
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book" /> Stationeers Instruction Set</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
              <pre>{`---Select Unit---
SEL A B C Out    // A ? B : C -> Out

---Min/Max Unit---
MAX A B Out      // max(A, B) -> Out
MIN A B Out      // min(A, B) -> Out

---Math Unit---
ADD A B Out      // A + B -> Out
SUB A B Out      // A - B -> Out
MUL A B Out      // A * B -> Out
DIV A B Out      // A / B -> Out
MOD A B Out      // A % B -> Out

---Compare Unit---
EQ A B Out       // A == B -> Out
NEQ A B Out      // A != B -> Out
GT A B Out       // A > B  -> Out
LT A B Out       // A < B  -> Out

---Unary Math Unit---
CEIL A Out       // ceil(A)  -> Out
FLOR A Out       // floor(A) -> Out
ABS A Out        // abs(A)   -> Out
LOG A Out        // log(A)   -> Out
EXP A Out        // exp(A)   -> Out
ROU A Out        // round(A) -> Out
RAND A Out       // rand(A)  -> Out 

---New IC Specific---
STOR A Out       // A        -> Out`}</pre>
              </Panel.Body>
            </Panel>
          </Col>  
        </Row>
      </div>
    );
  }

  step() {
    if(this.canRun()) {
      this.state.ic.step();
      this.setState(this.transferICState());
    }
  }

  run() {
    if(this.canRun()) {
      var i;

      for (i = this.state.ic.programCounter(); i < this.state.ic.instructionCount(); i++) {
        this.step();
      }

      this.restart();
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
    this.setState({ errors: ic.load(program) });
    this.setState({ instructionCount: ic.instructionCount() });
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
    var badge = (this.props.instructions ? <Badge>{this.props.instructions.length}</Badge> : "");

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title componentClass="h3"><FontAwesomeIcon icon="cogs" /> Instructions {badge}</Panel.Title>
        </Panel.Heading>
        <Table>
        <thead>
            <tr><th colSpan="2">Index</th><th>Instruction</th></tr>
          </thead>
          <tbody>
            {this.renderInstructions()}
          </tbody>
        </Table>
      </Panel>
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
    let arrow = this.props.current ? <FontAwesomeIcon icon="angle-double-right" /> : "";
    return (
      <tr className={"instruction" + (this.props.current ? " active" : "")}>
        <td>{this.props.index}</td>
        <td>{arrow}</td>
        <td>{this.props.value.join(" ")}</td>
      </tr>
    );
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
