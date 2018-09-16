import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

class ICProgramErrors extends Component {
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
                return "The register is invalid, or the alias has not been created.";
            case "INVALID_FIELD_NOT_READABLE":
                return "Instruction requires a source which can be read from, either a register or a literal number."
            case "INVALID_FIELD_NOT_REGISTER":
                return "Instruction requires the field to be a register."
            case "INVALID_FIELD_NOT_DEVICE":
                return "Instruction requires the field to be a device."
            case "MISSING_FIELD":
                return "Instruction requires an additional field in this position.";
            case "UNKNOWN_INSTRUCTION":
                return "The instruction you have specified does not exist, check the spelling.";
            case "LINE_TOO_LONG":
                return "The line is more than 64 characters, reduce the length.";
            case "PROGRAM_TOO_LONG":
                return "The program is too long, only 128 instructions/lines are permitted.";
            default:
                return "Unknown error."
        }
    }
}

export default ICProgramErrors;