import React, { Component } from 'react';
import IC from 'stationeers-ic';
import { Row, Col, Panel, Table, ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';

import ICPermalinkGenerator from './ICPermalinkGenerator';
import ICInternalRegisters from './ICInternalRegisters';
import ICIODevices from './ICIODevices';
import ICStack from './ICStack';
import ICProgramErrors from './ICProgramErrors';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faFile, faMicrochip, faArrowsAltH, faBug } from '@fortawesome/free-solid-svg-icons';
import { faReddit } from '@fortawesome/free-brands-svg-icons';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

import './SISAssembler';
import 'brace/theme/github';
import 'brace/ext/searchbox';

import './ICSocket.css';

library.add(faTerminal, faGamepad, faCogs, faMemory, faLongArrowAltLeft, faLongArrowAltRight, faTimes, faStepForward, faPlay, faRedo, faEye, faAngleDoubleRight, faBook, faLightbulb, faListUl, faPen, faReddit, faFile, faMicrochip, faArrowsAltH, faBug);

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
    this.toggleRunWithErrors = this.toggleRunWithErrors.bind(this);
    this.hashChanged = this.hashChanged.bind(this);  
    this.toggleLink = this.toggleLink.bind(this);
    this.setIOSlot = this.setIOSlot.bind(this);
    this.setIOReagent = this.setIOReagent.bind(this);

    let defaultCode = "start:\nadd r0 r0 1 # Increment r0.\nyield\nj start";

    this.state = { ic: new IC(), program: defaultCode, errors: [], labels: { internal: [] }, runAfterRegisterChange: false, runWithErrors: false, currentHash: "", channel: null, channelName: null };
    this.loadProgram(defaultCode);    
  }

  getRandomChannel(length) {
    var text = "";

    while (text.length < length) {
      text = text + Math.random().toString(36);
    }

    return text.substring(0, length);
  }

  receiveMessage(message) {
    console.log(message);

    switch(message.data.command) {
      case "content-request":
        this.state.channel.postMessage({ command: "content-update", content: this.state.program })
        break;
      case "content-update":
          this.programChange(message.data.content);
        break;
      default:
        break;
    }
  }

  componentDidMount() {
    this.loadStateFromHash();
    this.transferICState();
    
    window.addEventListener("hashchange", this.hashChanged, false);

    let channelName = "stationeering-editor-" + this.getRandomChannel(16);
    let channel = new BroadcastChannel(channelName);

    channel.onmessage = this.receiveMessage.bind(this);

    this.setState({ channel, channelName });
  }

  componentWillUnmount() {
    window.removeEventListener("hashchange", this.hashChanged, false);

    if (this.state.channel !== null) {
      this.state.channel.close();
      this.setState({ channel: null });
    }
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

    if (data.hasOwnProperty("runWithErrors")) {
      returnData["runWithErrors"] = data.runWithErrors;
      this.state.ic.setIgnoreErrors(data.runWithErrors);
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
            case "ioConnected": 
              this.state.ic.setIOConnected(i, value);
              break;
            case "ioSlot":
              for (var slot of Object.keys(value)) {
                for (var logicType of Object.keys(value[slot])) {
                  this.state.ic.setIOSlot(i, slot, logicType, value[slot][logicType]);
                }
              }              
              break;
            case "ioReagent":
              for (var reagent of Object.keys(value)) {
                for (var mode of Object.keys(value[reagent])) {
                  this.state.ic.setIOReagent(i, reagent, mode, value[reagent][mode]);
                }
              }
              break;
            default:            
          }
        });
      });
    }

    this.setState(returnData);
  }

  saveStateToHash() {
    let data = { program: this.state.program, registers: { io: this.state.ioRegisters, ioConnected: this.state.ioConnected, internal: this.state.internalRegisters, ioSlot: this.state.ioSlots, ioReagent: this.state.ioReagents }, runAfterRegisterChange: this.state.runAfterRegisterChange, runWithErrors: this.state.runWithErrors };
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
      ioNames: ic.getIONames(),
      ioLabels: ic.getIOLabels(),
      ioRegisters: ic.getIORegisters(),
      ioSlots: ic.getIOSlots(),
      ioReagents: ic.getIOReagents(),
      ioConnected: ic.getIOConnected(),
      internalLabels: ic.getInternalLabels(),
      internalRegisters: ic.getInternalRegisters(),
      programCounter: ic.programCounter(),
      instructionCount: ic.getInstructionCount(),
      stack: ic.getStack(),
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

  toggleLink(index) {
    this.state.ic.setIOConnected(index, !this.state.ioConnected[index]);
    this.transferICState();
  }

  render() {
    var inactive = !this.canRun() ? "interactive inactive" : "interactive";    

    var markers = [{startRow: this.state.ic.programCounter(), endRow: this.state.ic.programCounter(), endCol: 20000, type: "line", className: 'currentLine'}];
    var annotations = this.state.errors.map((error) => { return { row: error.line, column: 0, type: error.type, "text": error.error }});

    return (
      <div className="ICSocket">
        <Row>
          <Col md={8}>         
            <ICIODevices registers={this.state.ioRegisters} slots={this.state.ioSlots} reagents={this.state.ioReagents} setRegister={this.setRegister} setIOSlot={this.setIOSlot} setIOReagent={this.setIOReagent} labels={this.state.ioLabels} names={this.state.ioNames} connected={this.state.ioConnected} toggleLink={this.toggleLink} /> 
            <ICStack stack={this.state.stack} ptr={(this.state.internalRegisters ? this.state.internalRegisters[16] : 0)} />
          </Col>
          <Col md={4}>
            <ICInternalRegisters registers={this.state.internalRegisters} setRegister={this.setRegister} clearInternalRegisters={this.clearInternalRegisters} labels={this.state.labels.internal} aliases={this.state.internalLabels} />
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="gamepad" /> Control {this.state.channelName}</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <ButtonToolbar>
                  <Button className={inactive} onClick={this.runSingle} ><FontAwesomeIcon icon="step-forward" /> Step</Button>
                  <Button className={inactive} onClick={this.run} ><FontAwesomeIcon icon="play" /> Run</Button>
                  <Button className="interactive" onClick={this.restart} ><FontAwesomeIcon icon="redo" /> Reset IC</Button>
                  <Button className={"interactive" + (this.state.runAfterRegisterChange ? "" : " inactive") } onClick={this.toggleRunAfterRegisterChange} ><FontAwesomeIcon icon="eye" /> Watch Registers</Button>                               
                  <Button className={"interactive" + (this.state.runWithErrors ? "" : " inactive") } onClick={this.toggleRunWithErrors} ><FontAwesomeIcon icon="bug" /> Run With Errors</Button>                               
                </ButtonToolbar>
              </Panel.Body>
            </Panel>
            <Panel bsStyle={this.state.lastStepState === "HALT_AND_CATCH_FIRE" ? "danger" : "default"}>
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
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="terminal" /> Program</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <p>
                <AceEditor
                  mode="sis_assembler"
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
                </p>
                <div>
                  <ICProgramErrors key="errors" errors={this.state.errors.filter((e) => e["type"] === "error")} errorType="error" errorTitle="Errors" />
                  <ICProgramErrors key="warnings" errors={this.state.errors.filter((e) => e["type"] !== "error")} errorType="warning" errorTitle="Warnings" />
                </div>
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
    case "INVALID_PROGRAM_COUNTER":
      return "IC has executed an instruction which has placed the program counter to an invalid location, probably negative.";
    case "INVALID_REGISTER_LOCATION":
      return "IC has attempted to access a register which does not exist (usually due to indirect register access).";
    case "STACK_OVERFLOW":
      return "IC has attempted to push data into the stack beyond the limit.";
    case "STACK_UNDERFLOW":
      return "IC has attempted to pop or peek data from an empty stack.";
    case "INTERNAL_ERROR":
      return "An error has occured in the simulator, please contact Melair with a permalink.";
    case "HALT_AND_CATCH_FIRE":
      return "IC has executed the halt and catch fire instruction.";
    case "YIELD":
      return "IC has yielded control, execution will resume on next tick.";
    case "SLEEP":
      return "IC is sleeping, execution will resume after sleep has expired (0.5 seconds/tick).";
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

  setIOSlot(index, slot, logicType, value) {
    this.state.ic.setIOSlot(index, slot, logicType, value);
    
    this.transferICState();
    
    if (this.state.runAfterRegisterChange) {
      this.run();
    }
  }

  setIOReagent(index, reagent, reagentMode, value) {
    this.state.ic.setIOReagent(index, reagent, reagentMode, value);

    this.transferICState();
    
    if (this.state.runAfterRegisterChange) {
      this.run();
    }
  }

  programChange(text) {
    var filteredText = text.split('').filter((c) => c.charCodeAt(0) < 128).join('');
    this.setState({ program: filteredText });
    this.loadProgram(text);
    this.state.channel.postMessage({ command: "content-update", content: this.state.program })
  }

  loadProgram(program) {
    let ic = this.state.ic;
    ic.load(program);
    this.setState({ labels: this.parseLabels(program) });
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

    return labels;
  }

  toggleRunAfterRegisterChange(event) {
    this.setState({ runAfterRegisterChange: !this.state.runAfterRegisterChange });
  }

  toggleRunWithErrors(event) {
    this.setState({ runWithErrors: !this.state.runWithErrors });
    this.state.ic.setIgnoreErrors(!this.state.runWithErrors);
  }
}

export default ICSocket;
