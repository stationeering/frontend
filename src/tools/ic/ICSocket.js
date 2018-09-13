import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col, Panel, Table, ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import ICPermalinkGenerator from './ICPermalinkGenerator';
import ICInternalRegisters from './ICInternalRegisters';
import ICIORegisters from './ICIORegisters';
import ICInstructions from './ICInstructions';
import ICInstructionSet from './ICInstructionSet';
import ICProgramErrors from './ICProgramErrors';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faFile, faMicrochip, faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { faReddit } from '@fortawesome/free-brands-svg-icons';

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/mips_assembler';
import 'brace/theme/github';

import './ICSocket.css';

library.add(faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faReddit, faFile, faMicrochip, faArrowsAltH);

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
    this.hashChanged = this.hashChanged.bind(this);  

    let defaultCode = "add r0 r0 1 // Increment r0.\nyield\nj 0";

    this.state = { ic: new IC(), program: defaultCode, errors: [], labels: { io: [], internal: [] }, runAfterRegisterChange: false, currentHash: "" };
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
            case "io":
              var deviceFields = Object.keys(value);

              for (let field of deviceFields) {
                this.state.ic.setIORegister(i, field, value[field]);
              }
              
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
    let data = { program: this.state.program, registers: { io: this.state.ioRegisters, internal: this.state.internalRegisters }, runAfterRegisterChange: this.state.runAfterRegisterChange };
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
      ioRegisters: ic.getIORegisters(),
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
          <Col md={8}>         
            <ICIORegisters registers={this.state.ioRegisters} setRegister={this.setRegister} labels={this.state.labels.io} /> 
          </Col>
          <Col md={4}>
            <ICInternalRegisters registers={this.state.internalRegisters} setRegister={this.setRegister} clearInternalRegisters={this.clearInternalRegisters} labels={this.state.labels.internal} />
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
                  height="400px"
                  width="100%"
                  fontSize={16}
                  ref="editor"
                  markers={markers}
                  annotations={annotations}
                />
                <ICProgramErrors errors={this.state.errors} />
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
            <ICInstructions />
          </Col>
          <Col md={7}>          
            <ICInstructionSet />
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

  setRegister(type, index, value, field) {
    switch (type) {
      case "io":
        this.state.ic.setIORegister(index, field, value);
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
    let labels = { io: [], internal: [] };
    let lines = program.split("\n")

    let jumpLabel = {}

    lines.forEach((line, i) => {
      var lineParts = line.split(/\/\/:|#:/);

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

    var newLines = lines.map((line, i) => {
      var matched = line.match(/^\s*([a-zA-Z0-9]+):\s*.*/);

      if (matched) {
        var labelName = matched[1];
        jumpLabel[labelName] = i;

        return line.replace(/^\s*[a-zA-Z0-9]+:\s*/, "");
      } else {
        return line;
      }     
    });

    var compiledProgram = newLines.join('\n');

    for (var jl of Object.keys(jumpLabel)) {
      compiledProgram = compiledProgram.replace(new RegExp("\\$" + jl, 'g'), jumpLabel[jl].toString());
    }

    return { labels: labels, program: compiledProgram };
  }

  toggleRunAfterRegisterChange(event) {
    this.setState({ runAfterRegisterChange: !this.state.runAfterRegisterChange });
  }
}

export default ICSocket;
