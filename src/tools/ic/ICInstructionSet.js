import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';

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
            <pre>{`# Text after a # will be ignored to the end of the line. The amount of white
# space between arguments isn't important, but new lines start a new command.

# In the instructions fields can only take certain types, these are:
# - d is a register
# - s and t are registers, or floats
# - a is a non-negative integer value              
# - i is an IO register
# - f is a setting on an external device

move    d s     # stores the value of s in d

add     d s t   # calculates s + t and stores the result in d
sub     d s t   # calculates s - t and stores the result in d
mul     d s t   # calculates s * t and stores the result in d
div     d s t   # calculates s / t and stores the result in d
mod     d s t   # calculates s mod t and stores the result in d. Note this
              # doesn't behave like the % operator - the result will be
              # positive even if the either of the operands are negative

slt     d s t   # stores 1 in d if s < t, 0 otherwise

sqrt    d s     # calculates sqrt(s) and stores the result in d
round   d s     # finds the rounded value of s and stores the result in d
trunc   d s     # finds the truncated value of s and stores the result in d
ceil    d s     # calculates the ceiling of s and stores the result in d
floor   d s     # calculates the floor of s and stores the result in d

max     d s t   # calculates the maximum of s and t and stores the result in d
min     d s t   # calculates the minimum of s and t and stores the result in d
abs     d s     # calculates the absolute value of s and stores the result in d
log     d s     # calculates the natural logarithm of s and stores the result
              # in d
exp     d s     # calculates the exponential of s and stores the result in d
rand    d       # selects a random number uniformly at random between 0 and 1
              # inclusive and stores the result in d

# boolean arithmetic uses the C convention that 0 is false and any non-zero
# value is true.
and     d s t   # stores 1 in d if both s and t have non-zero values,
              # 0 otherwise
or      d s t   # stores 1 in d if either s or t have non-zero values,
              # 0 otherwise
xor     d s t   # stores 1 in d if exactly one of s and t are non-zero,
              # 0 otherwise
nor     d s t   # stores 1 in d if both s and t equal zero, 0 otherwise

# Lines are numbered starting at zero
j             a # jumps to line a.
bltz      s   a # jumps to line a if s <  0
blez      s   a # jumps to line a if s <= 0
bgez      s   a # jumps to line a if s >= 0
bgtz      s   a # jumps to line a if s >  0
beq       s t a # jumps to line a if s == t
bne       s t a # jumps to line a if s != t

# Interacting with external devices

s         i f s # Save the contents of s to the device on IO i, variable f.
l         d i f # Load the contents of device on IO i, variable f, and write to register d.

# For example, if d0 and d1 are LEDs, copying a color from d0 to d1.
#
# l r0 d0 Color # Load the current color of d0 into register 0.
# s d1 Color r0 # Save value from register 0 into d0 color.

yield           # ceases code execution for this power tick`}</pre>
            </Panel.Body>
          </Panel>);
    }
}

export default ICInstructionSet;