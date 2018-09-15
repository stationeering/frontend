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
              <h4>Labelling Registers</h4>
              <p>
                To make the meaning of registers more obvious you can include a comment in your program as follows:
              </p>
              <pre>{`#:io:0:Inside Gas Sensor
#:io:1:Door
#:internal:0:If it's safe?`}</pre>
              <p><strong>Note</strong> These comments will still count as line numbers for the interpreter, so addresses for jumps needs to be adjusted.</p>
            </Panel.Body>
          </Panel>);
    }
}

export default ICInstructions;