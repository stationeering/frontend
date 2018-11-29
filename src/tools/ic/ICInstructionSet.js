import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBook } from '@fortawesome/free-solid-svg-icons';

library.add(faBook);

class ICInstructionSet extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>
        <Panel.Title componentClass="h3"><FontAwesomeIcon icon="book" /> Stationeers Instruction Set</Panel.Title>
      </Panel.Heading>
      <Panel.Body>
        <p>
          Comments are made by using the <code>#</code> symbol, either at the start of a line or after an instruction.
                </p>
        <Table condensed>
          <thead>
            <tr>
              <th>Instruction</th>
              <th>1</th>
              <th>2</th>
              <th>3</th>
              <th>4</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>move</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Store the value of <code>s</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>add</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Add <code>s</code> and <code>t</code> together, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sub</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Subtract <code>t</code> from <code>s</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>mul</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Multiply <code>s</code> and <code>t</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>div</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Divide <code>s</code> by <code>t</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>mod</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Modulus <code>s</code> by <code>t</code>, store in <code>d</code>.<br /><strong>Always positive value.</strong></td>
            </tr>
            <tr>
              <td>slt</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> &lt; <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sgt</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> &gt; <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sle</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> &lt;= <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sge</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> &gt;= <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>seq</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> == <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sne</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code> if <code>s</code> != <code>t</code>, if not store <code>0</code> in <code>d</code>.</td>
            </tr>
            <tr>
              <td>sap</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td>Store <code>1</code> in <code>d</code> if <code>abs(s - t) &lt;= c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>sna</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td>Store <code>1</code> in <code>d</code> if <code>abs(s - t) &gt; c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>select</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td>Store <code>t</code> in <code>d</code> if <code>s</code> is non zero, otherwise <code>c</code>.</td>
            </tr>
            <tr>
              <td>sqrt</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Square root <code>s</code> and store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>round</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Rounds <code>s</code> and store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>trunc</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Truncate <code>s</code> and store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>ceil</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Ceiling of <code>s</code> and store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>floor</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Floor of <code>s</code> and store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>max</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Find the higher value of <code>s</code> and <code>t</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>min</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Find the lower value of <code>s</code> and <code>t</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>abs</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Calculate absolute value of <code>s</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>log</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Calculate natural log of <code>s</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>exp</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Calculate exponential of <code>s</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>rand</td>
              <td><code>d</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Random number between <code>0.0</code> - <code>1.0</code>, store in <code>d</code>.</td>
            </tr>
            <tr>
              <td>and</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code>, if both <code>s</code> and <code>t</code> are non zero.</td>
            </tr>
            <tr>
              <td>or</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code>, if either <code>s</code> or <code>t</code> are non zero.</td>
            </tr>
            <tr>
              <td>xor</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code>, if only one of <code>s</code> or <code>t</code> is non zero.</td>
            </tr>
            <tr>
              <td>nor</td>
              <td><code>d</code></td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td>&nbsp;</td>
              <td>Store <code>1</code> in <code>d</code>, if both <code>s</code> and <code>t</code> are both zero.</td>
            </tr>
            <tr>
              <td>j</td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>.</td>
            </tr>
            <tr>
              <td>bltz</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &lt; 0.</td>
            </tr>
            <tr>
              <td>blez</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &lt;= 0.</td>
            </tr>
            <tr>
              <td>bgez</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &gt;= 0.</td>
            </tr>
            <tr>
              <td>bgtz</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &gt; 0.</td>
            </tr>
            <tr>
              <td>beq</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> == <code>t</code>.</td>
            </tr>
            <tr>
              <td>bne</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> != <code>t</code>.</td>
            </tr>
            <tr>
              <td>bap</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td><code>a</code></td>
              <td>Jump program to <code>a</code>, if <code>abs(s - t) &lt;= c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>bna</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td><code>a</code></td>
              <td>Jump program to <code>a</code>, if <code>abs(s - t) &gt; c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>jr</td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to the <code>a + pc</code>.</td>
            </tr>
            <tr>
              <td>brltz</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> is &lt; 0.</td>
            </tr>
            <tr>
              <td>brlez</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> is &lt;= 0.</td>
            </tr>
            <tr>
              <td>brgez</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> is &gt;= 0.</td>
            </tr>
            <tr>
              <td>brgtz</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> is &gt; 0.</td>
            </tr>
            <tr>
              <td>breq</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> == <code>t</code>.</td>
            </tr>
            <tr>
              <td>brne</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>a + pc</code>, if <code>s</code> != <code>t</code>.</td>
            </tr>
            <tr>
              <td>brap</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td><code>a</code></td>
              <td>Jump program relative to <code>a + pc</code>, if <code>abs(s - t) &lt;= c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>brna</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>c</code></td>
              <td><code>a</code></td>
              <td>Jump program relative to <code>a + pc</code>, if <code>abs(s - t) &gt; c * max(abs(s), abs(t))</code>.</td>
            </tr>
            <tr>
              <td>jal</td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>bltzal</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &lt; 0, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>blezal</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &lt;= 0, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>bgezal</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &gt;= 0, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>bgtzal</td>
              <td><code>s</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> is &gt; 0, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>beqal</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> == <code>t</code>, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>bneal</td>
              <td><code>s</code></td>
              <td><code>t</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if <code>s</code> != <code>t</code>, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>yield</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Yield processor for this power tick.</td>
            </tr>
            <tr>
              <td>s</td>
              <td><code>i</code></td>
              <td><code>f</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>Save <code>s</code> into IO port <code>i</code>, variable <code>f</code> (from device).</td>
            </tr>
            <tr>
              <td>l</td>
              <td><code>d</code></td>
              <td><code>i</code></td>
              <td><code>f</code></td>
              <td>&nbsp;</td>
              <td>Load IO port <code>i</code>, variable <code>f</code> into <code>d</code>.</td>
            </tr>
            <tr>
              <td>ls</td>
              <td><code>d</code></td>
              <td><code>i</code></td>
              <td><code>s</code></td>
              <td><code>f</code></td>
              <td>Load the logic value <code>f</code> from slot <code>s</code> from device <code>i</code> into <code>d</code>.</td>
            </tr>
            <tr>
              <td>lr</td>
              <td><code>d</code></td>
              <td><code>i</code></td>
              <td><code>f1</code></td>
              <td><code>f2</code></td>
              <td>Load the reagent mode <code>f1</code> from the reagent <code>f2</code> from device <code>i</code> into <code>d</code>.</td>
            </tr>
            <tr>
              <td>alias</td>
              <td><code>f</code></td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Define a register alias so that <code>f</code> can be used in place of <code>s</code>.</td>
            </tr>
            <tr>
              <td>push</td>
              <td><code>s</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Push <code>s</code> onto the stack, increasing <code>sp</code>.</td>
            </tr>
            <tr>
              <td>pop</td>
              <td><code>d</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Pop the top stack value into <code>d</code>, decreasing <code>sp</code>.</td>
            </tr>
            <tr>
              <td>peek</td>
              <td><code>d</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Copy the current top stack value into <code>d</code>, does not alter <code>sp</code>.</td>
            </tr>
            <tr>
              <td>hcf</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Halt and catch fire.</td>
            </tr>
            <tr>
              <td>sdse</td>
              <td><code>d</code></td>
              <td><code>i</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Set <code>d</code> to <code>1</code>, if device <code>i</code> is set/connected.</td>
            </tr>
            <tr>
              <td>sdns</td>
              <td><code>d</code></td>
              <td><code>i</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Set <code>d</code> to <code>1</code>, if device <code>i</code> is not set/connected.</td>
            </tr>
            <tr>
              <td>bdse</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if device <code>i</code> is set/connected.</td>
            </tr>
            <tr>
              <td>bdns</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if device <code>i</code> is not set/connected.</td>
            </tr>
            <tr>
              <td>brdse</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>pc + a</code>, if device <code>i</code> is set/connected.</td>
            </tr>
            <tr>
              <td>brdns</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program relative to <code>pc + a</code>, if device <code>i</code> is not set/connected.</td>
            </tr>
            <tr>
              <td>bdseal</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if device <code>i</code> is set/connected, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
            <tr>
              <td>bdnsal</td>
              <td><code>i</code></td>
              <td><code>a</code></td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>Jump program to <code>a</code>, if device <code>i</code> is not set/connected, update <code>ra</code> to contain <code>pc + 1</code>.</td>
            </tr>
          </tbody>
        </Table>
        <h4>Key</h4>
        <ul>
          <li><code>d</code> - An internal register (r0 - r15)</li>
          <li><code>s</code> - An internal register (r0 - r15), a constant integer or a constant float.</li>
          <li><code>t</code> - An internal register (r0 - r15), a constant integer or a constant float.</li>
          <li><code>a</code> - An address (may be negative if relative jump) or a register with a location.</li>
          <li><code>i</code> - Device register (d0 - d5).</li>
          <li><code>f</code> - String variable name.</li>
          <li><code>pc</code> - Program counter, current line being executed.</li>
        </ul>
      </Panel.Body>
    </Panel>);
  }
}

export default ICInstructionSet;