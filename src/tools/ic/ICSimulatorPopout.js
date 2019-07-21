import React, { Component } from 'react';

import { Grid, Col, Row, Panel } from 'react-bootstrap';

// eslint-disable-next-line
import brace from 'brace';
import AceEditor from 'react-ace';

import './SISAssembler';
import 'brace/theme/github';
import 'brace/ext/searchbox';

class ICSimulatorPopout extends Component {
  constructor(props) {
    super(props);

    this.state = { channel: null, channelName: null, program: "" }
  }

  componentDidMount() {
    let channelName = "stationeering-editor-" + this.props.match.params.channel;
    let channel = new BroadcastChannel(channelName);

    channel.onmessage = this.receiveMessage.bind(this);

    this.setState({ channel, channelName });

    channel.postMessage({ command: "content-request" });
  }

  componentWillUnmount() {
    if (this.state.channel !== null) {
      this.state.channel.postMessage({ command: "popout-closed" });
      this.state.channel.close();
      this.setState({ channel: null });
    }
  }

  receiveMessage(message) {
    console.log(message); 

    switch(message.data.command) {
      case "content-update":
        this.setState({ program: message.data.content });
        break;
      default:
        break;
    }
  }

  programChange(text) {
    var filteredText = text.split('').filter((c) => c.charCodeAt(0) < 128).join('');
    this.setState({ program: filteredText });
    this.state.channel.postMessage({ command: "content-update", content: this.state.program })
  }

  render() {
    let markers = [];
    let annotations = [];

    return (
      <div height="100vh">
          <AceEditor
                  mode="sis_assembler"
                  theme="github"
                  onChange={this.programChange.bind(this)}
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
        </div>
    );
  }
}

export default ICSimulatorPopout;