import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

class ICProgramErrors extends Component {
    render() {
        if (this.props.errors.length > 0) {
            var style = this.props.errorType === "error" ? "danger" : "warning";

            return (
                <Alert bsStyle={style}>
                    <strong>Parsing {this.props.errorTitle}</strong>
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
        let validTypes = this.props.error.validTypes;
        let errorDescription = this.lookUpError(error, validTypes);

        return (
            <li className="programError">Line {line}{field}: {errorDescription} ({error}) </li>
        );
    }

    lookUpError(error, validTypes) {
        switch (error) {
            case "INVALID_FIELD_NO_SUCH_REGISTER":
                return "The register number you have specified does not exist.";
            case "INVALID_FIELD_INVALID_TYPE":
                return "Field provided for instruction is invalid, it requires one of these: " + this.resolveValidTypes(validTypes)
            case "MISSING_FIELD":
                return "Instruction requires an additional field in this position.";
            case "UNKNOWN_INSTRUCTION":
                return "The instruction you have specified does not exist, check the spelling.";
            case "LINE_TOO_LONG":
                return "The line is more than 52 characters, reduce the length.";
            case "PROGRAM_TOO_LONG":
                return "The program is too long, only 128 instructions/lines are permitted.";
            case "INVALID_JUMP_TAG_DUPLICATE":
                return "The jump tag has already been used above this tag in the program.";
            case "INVALID_JUMP_TAG_CONTENT_AFTER":
                return "There is content after the jump tag, currently not permitted.";
            default:
                return "Unknown error."
        }
    }

    resolveValidTypes(validTypes) {
        const TYPES = { r: "register", d: "device", a: "alias", j: "jump tag", i: "integer", f: "float", s: "string" };
        return validTypes.map((type) => TYPES[type] ? TYPES[type] : type).join(", ");
    }
}

export default ICProgramErrors;