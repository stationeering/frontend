import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col, Panel, Table, Alert, ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ICPermalinkGenerator from './ICPermalinkGenerator';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faFile, faMicrochip } from '@fortawesome/free-solid-svg-icons';
import { faReddit } from '@fortawesome/free-brands-svg-icons';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/mips_assembler';
import 'brace/theme/github';

import './ICSocket.css';

library.add(faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faReddit, faFile, faMicrochip);

class ICSocket extends Component {
  constructor(props) {
    super(props);

    this.programChange = this.programChange.bind(this);
    this.step = this.step.bind(this);
    this.runSingle = this.runSingle.bind(this);
    this.run = this.run.bind(this);
    this.restart = this.restart.bind(this);
    this.clearInternalRegisters = this.clearInternalRegisters.bind(this);
    this.setRegister = this.setRegister.bind(this);
    this.toggleRunAfterRegisterChange = this.toggleRunAfterRegisterChange.bind(this);
    this.toggleInputsAreWritable = this.toggleInputsAreWritable.bind(this);
    this.hashChanged = this.hashChanged.bind(this);  

    let defaultCode = "add r0 r0 1 // Increment r0.\nyield\nj 0";

    this.state = { ic: new IC(), program: defaultCode, errors: [], labels: { input: [], output: [], internal: [] }, runAfterRegisterChange: false, inputsAreWritable: true, currentHash: "" };
    this.state.ic.setInputRegistersWriteable(this.state.inputsAreWritable);
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

    if (data.hasOwnProperty("inputsAreWritable")) {
      returnData["inputsAreWritable"] = data.inputsAreWritable;      
    } else {
      returnData["inputsAreWritable"] = true;
    }

    this.state.ic.setInputRegistersWriteable(returnData["inputsAreWritable"]);

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
    let data = { program: this.state.program, registers: { input: this.state.inputRegisters, output: this.state.outputRegisters, internal: this.state.internalRegisters }, runAfterRegisterChange: this.state.runAfterRegisterChange, inputsAreWritable: this.state.inputsAreWritable };
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
      instructionCount: ic.getInstructionCount(),
      lastRunCount: 0,
      lastStepState: "",
      lastExecuteTime: "Not Run"
    });
  }

  canRun() {
    return !(this.state.ic.programCounter() >= this.state.ic.getInstructionCount()) || (this.state.errors.length > 0);
  }

  formatCodeForDiscord() {
    return "```mips\n" + this.state.program + "\n```";
  }

  formatCodeForReddit() {
    return this.state.program.trim().split("\n").map((line) => "    " + line).join("\n");
  }

  render() {
    var inactive = !this.canRun() ? "interactive inactive" : "interactive";    

    var markers = [{startRow: this.state.ic.programCounter(), endRow: this.state.ic.programCounter(), endCol: 20000, type: "line", className: 'currentLine'}];
    var annotations = this.state.errors.map((error) => { return { row: error.line, column: 0, type: "error", "text": error.error }});

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
                <AceEditor
                  mode="mips_assembler"
                  theme="github"
                  onChange={this.programChange}
                  value={this.state.program}
                  name="AceEditorMips"
                  setOptions={{firstLineNumber: 0}}
                  debounceChangePeriod={500}
                  height="500px"
                  width="100%"
                  fontSize={16}
                  ref="editor"
                  markers={markers}
                  annotations={annotations}
                />
                <ProgramErrors errors={this.state.errors} />
                </Panel.Body>
                <Panel.Footer>             
                  <Row>
                    <Col md={5}>
                      <h5>Copy to Clipboard</h5>
                      <ButtonToolbar>                  
                        <ButtonGroup>
                          <CopyToClipboard text={this.state.program}>
                            <Button><FontAwesomeIcon icon="file" /> Plain</Button>
                          </CopyToClipboard>
                          <CopyToClipboard text={this.formatCodeForDiscord()}>
                            <Button><FontAwesomeIcon icon={["fab", "discord"]} /> Discord</Button>
                          </CopyToClipboard>
                          <CopyToClipboard text={this.formatCodeForReddit()}>
                            <Button><FontAwesomeIcon icon={["fab", "reddit"]} /> reddit</Button>
                          </CopyToClipboard>
                        </ButtonGroup>
                        <ButtonGroup>                      
                          <CopyToClipboard text={this.parseLabels(this.state.program).program}>
                            <Button><FontAwesomeIcon icon="microchip" /> Stationeers (Resolved Labels)</Button>
                          </CopyToClipboard>
                        </ButtonGroup>
                      </ButtonToolbar>                     
                    </Col>
                    <Col md={7}>
                      <h5>Share Program</h5>
                      <ICPermalinkGenerator currentHash={this.state.currentHash} />
                    </Col>
                  </Row>
                </Panel.Footer>             
            </Panel>
          </Col>
          <Col md={4}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="gamepad" /> Control</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <ButtonToolbar>
                  <Button className={inactive} onClick={this.runSingle} ><FontAwesomeIcon icon="step-forward" /> Step</Button>
                  <Button className={inactive} onClick={this.run} ><FontAwesomeIcon icon="play" /> Run</Button>
                  <Button className="interactive" onClick={this.restart} ><FontAwesomeIcon icon="redo" /> Reset PC</Button>
                  <Button className={"interactive" + (this.state.runAfterRegisterChange ? "" : " inactive") } onClick={this.toggleRunAfterRegisterChange} ><FontAwesomeIcon icon="eye" /> Watch Registers</Button>                               
                  <Button className={"interactive" + (this.state.inputsAreWritable ? "" : " inactive") } onClick={this.toggleInputsAreWritable} ><FontAwesomeIcon icon="pen" /> Inputs Are Writable</Button>                               
                </ButtonToolbar>
              </Panel.Body>
            </Panel>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="list-ul" /> Status</Panel.Title>
              </Panel.Heading>
              <Table>
                <tbody>
                  <tr>
                    <th>Program Counter</th><td>{this.state.programCounter}</td>
                  </tr>                    
                  <tr>
                    <th>Last Run Operations</th><td>{this.state.lastRunCount} ({this.state.lastExecuteTime})</td>
                  </tr>                
                  <tr>
                    <th>Last State</th><td>{this.decodeStepState(this.state.lastStepState)}</td>
                  </tr>
                </tbody>
              </Table>
            </Panel>            
          </Col>
        </Row>
        <Row>
          <Col md={5}>          
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
                  <FontAwesomeIcon icon="eye" /> can be toggled, if solid then when a register at the top is changed the program will be automatically rerun.
                </p>
                <p>
                  Finally <FontAwesomeIcon icon="pen" /> can be toggled, if solid then input registers can be written to.
                </p>
                <h4>Jump Labels</h4>
                <p>
                  To assist the creation of larger and more complex programs, the simulator can handle jump labels. This means where you would put a jump destination you may put a label.
                </p>
                <p>
                  For example:                  
                </p>
                <pre>{`move o 1 //:label:start
yield
j $start`}</pre>
                <p>
                  Use the "Stationeers (Resolve Labels)" clipboard button to copy a version which resolved labels which can be pasted into Stationeers.
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
          <Col md={7}>          
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book" /> Stationeers Instruction Set</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
              <pre>{`// Text after a // will be ignored to the end of the line. The amount of white
// space between arguments isn't important, but new lines start a new command.

// In the instructions fields can only take certain types, these are:
// - d is a register or output
// - s and t are registers, inputs, or floats
// - a is a non-negative integer value              

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

  decodeStepState(step) {
    switch(step) {
    case "INVALID_PROGRAM":
      return "Program is invalid, solve errors first.";
    case "OUT_OF_OPERATIONS":
      return "IC has executed 128 operations, execution will resume on next tick.";
    case "END_OF_PROGRAM":
      return "IC has run out of instructions, this is will result in an IC error.";
    case "YIELD":
      return "IC has yielded control, execution will resume on next tick.";
    default:
      return "";
    }
  }

  step() {
    if(this.canRun()) {
      var result = this.state.ic.step();    
      this.transferICState(this.state.ic.programCounter());      
      return result;
    } else {
      if (this.state.ic.programCounter() >= this.state.ic.getInstructionCount()) {
          return "END_OF_PROGRAM";
      } else {
          return "INVALID_PROGRAM";
      }
    }
  }

  runSingle() {
    var result = this.step();
    this.setState((prevState, props) => {
      return { lastStepState: result, lastRunCount: 1, lastExecuteTime: (new Date().toUTCString()) };
    });
  }

  run() {
    var total = 1;

    var lastResult = this.step();

    while(!lastResult && total < 128) {
      total++;       
      lastResult = this.step(); 
    }

    this.setState((prevState, props) => {
      return { lastRunCount: total, lastStepState: lastResult, lastExecuteTime: (new Date().toUTCString()) };
    });

    if (total === 128) {
      this.setState((prevState, props) => {
        return { lastStepState: "OUT_OF_OPERATIONS" };
      });
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

  programChange(text) {
    this.setState({ program: text });
    this.loadProgram(text);
  }

  loadProgram(program) {
    let ic = this.state.ic;
    var parsed = this.parseLabels(program);
    ic.load(parsed.program);
    this.setState({ labels: parsed.labels });
    this.setState({ errors: ic.getProgramErrors() });
    this.setState({ instructionCount: ic.getInstructionCount() });
    this.transferICState();
  }

  parseLabels(program) {
    let labels = { input: [], output: [], internal: [] };
    let lines = program.split("\n")

    let jumpLabel = {}

    lines.forEach((line, i) => {
      var lineParts = line.split("//:");

      if (lineParts.length === 1) {
        return;
      }

      let tokens = lineParts[1].split(":");

      if (tokens.length === 3) {
        if (labels.hasOwnProperty(tokens[0])) {
          let number = Number.parseInt(tokens[1], 10);
          labels[tokens[0]][number] = tokens[2];
        }
      }

      if (tokens[0] === "label") {
        jumpLabel[tokens[1]] = i;
      }
    });

    var compiledProgram = program;

    for (var jl of Object.keys(jumpLabel)) {
      compiledProgram = compiledProgram.replace(new RegExp("\\$" + jl, 'g'), jumpLabel[jl].toString());
    }

    return { labels: labels, program: compiledProgram };
  }

  toggleRunAfterRegisterChange(event) {
    this.setState({ runAfterRegisterChange: !this.state.runAfterRegisterChange });
  }

  toggleInputsAreWritable(event) {
    this.state.ic.setInputRegistersWriteable(!this.state.inputsAreWritable);
    this.setState({ inputsAreWritable: !this.state.inputsAreWritable });    
    this.setState({ errors: this.state.ic.getProgramErrors() });
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

  roundTo(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

  render() {
    return (
      <tr className="register">
        <td>{this.props.index}</td>
        <td><input type="text" size="5" onChange={this.onChange} onKeyPress={this.onKeyPress} value={this.state.inputValue} /> <button onClick={this.onClick}>-&gt;</button></td>
        <td>{this.roundTo(this.props.value, 5)}</td>
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
