import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faLightbulb, faStepForward, faEye, faPlay } from '@fortawesome/free-solid-svg-icons';

library.add(faLightbulb, faStepForward, faEye, faPlay);

class ICInstructions extends Component {
    render() {
        return (<Panel>
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
                Write the program code in the Program text box, it will be read and parsed automatically. Any errors will appear below the text box and marked along side your code, once corrected the program can be run.
              </p>
              <h4>Running A Program</h4>
              <p>
                Pressing <FontAwesomeIcon icon="step-forward" /> will step the program through one instruction at a time. Pressing <FontAwesomeIcon icon="play" /> will run it through. If you use step then <FontAwesomeIcon icon="redo" /> will reset the program to the first instruction.
              </p>                                
              <p>
                <FontAwesomeIcon icon="eye" /> can be toggled, if solid then when a register at the top is changed the program will be automatically rerun.
              </p>
              <p>
                <FontAwesomeIcon icon="bug" /> can be toggled, if solid then the simulator will allow you to run an invalid program. When it encounters an error, the instruction will be ignored and treated as a noop.
              </p>
              <h4>Jump Labels</h4>
              <p>
                To assist the creation of larger and more complex programs, the simulator can handle jump labels. This means where you would put a jump destination you may put a label.
              </p>
              <p>
                For example:                  
              </p>
              <pre>{`start: move o 1  # Label may also be on it's own line.
yield
j $start`}</pre>
              <p>
                Use the "Stationeers (Resolve Labels)" clipboard button to copy a version with resolved labels which can be pasted into Stationeers.
              </p>
              <h4>Labelling Devices</h4>
              <p>
                To label a device (in simulator and in game), use the follow instruction:
              </p>
              <pre>{`label d1 GasSensor`}</pre>
              <p><strong>Note</strong> Stationeering.com's labels will no longer work for devices, use the <code>label</code> instruction.</p>
              <h4>Labelling Registers</h4>
              <p>
                To label a register, use the following instruction:
              </p>
              <p>
                <pre>{`alias CurrentPressure r1`}</pre>
              </p>
              <p>You will then be able to refer to the label name rather than the register in code.</p>
              <p><strong>Note</strong> The aliases will not appear on the registers until the instruction has been executed.</p>
              <p>
                You can also still use Stationeering.com's legacy method of labeling registers.
              </p>
              <pre>{`#:internal:0:If it's safe?`}</pre>
              <p><strong>Note</strong> These comments will still count as line numbers for the interpreter, so addresses for jumps needs to be adjusted.</p>
            </Panel.Body>
          </Panel>);
    }
}

export default ICInstructions;