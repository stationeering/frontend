import React, { Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars } from '@fortawesome/free-solid-svg-icons';

library.add(faBars);

class ICStack extends Component {
    chunk(arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }

    render() {
        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3"><FontAwesomeIcon icon="bars" /> Stack</Panel.Title>
                </Panel.Heading>            
                <Table condensed>
                    <tbody>
                        {this.renderStackValues()}
                    </tbody>
                </Table>
                <Panel.Footer><small>Stack displayed here is truncated to 16 entries until it is used, maximum is still 512.</small></Panel.Footer>
            </Panel>
        );
    }

    renderStackValues() {
        if (!this.props.stack) {
            return null;
        }

        var maxValue = 0;

        for (var i = 0; i < this.props.stack.length; i++) {
            if (this.props.stack[i] !== 0) {
                maxValue = i;
            }
        }

        if (maxValue === 0) {
            maxValue = 16;
        } else {
            maxValue += (8 - (maxValue % 8));
        }

        var entries = this.props.stack.map((value, i) => <ICStackEntry key={i} i={i} value={value} current={(i === this.props.ptr)} />);

        entries = entries.slice(0, maxValue);

        var chunkedEntries = this.chunk(entries, 8);

        return chunkedEntries.map((entries) => <tr>{entries}</tr>)
    }
}

class ICStackEntry extends Component {
    render() {
        return (
            <td className={(this.props.current ? "bg-success" : "")}><small className="text-muted">{this.props.i}:</small> {this.props.value}</td>
        );
    }
}

export default ICStack;
