import React, { Component } from 'react';
import { Route, NavLink, Redirect } from 'react-router-dom';
import { Row, Col, Label, Panel, Table, Alert, ListGroup, ListGroupItem, FormGroup, HelpBlock, FormControl, ControlLabel, Nav, NavItem } from 'react-bootstrap';

import axios from 'axios';

import Scenarios from './scenarios/Scenarios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faSprayCan, faUtensils, faLeaf, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen, faLongArrowAltLeft, faHashtag, faSearch, faWind, faTerminal, faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';

import { GuideContext } from './Context';

import './Guide.css';

library.add(faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faLeaf, faSprayCan, faUtensils, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen, faLongArrowAltLeft, faHashtag, faSearch, faWind, faTerminal, faEye, faEyeSlash);

const MANUFACTORY_TO_THING = {
  "FabricatorRecipes": "StructureFabricator",
  "ElectronicsPrinterRecipes": "StructureElectronicsPrinter",
  "OrganicsPrinterRecipes": "StructureOrganicsPrinter",
  "ChemistryRecipes": "ApplianceChemistryStation",
  "MicrowaveRecipes": "ApplianceMicrowave",
  "ToolManufactoryRecipes": "StructureToolManufactory",
  "HydraulicPipeBenderRecipes": "StructureHydraulicPipeBender",
  "SecurityPrinterRecipes": "StructureSecurityPrinter",
  "FurnaceRecipes": "StructureFurnace",
  "ArcFurnaceRecipes": "StructureArcFurnace",
  "AutolatheRecipes": "StructureAutolathe",
  "CentrifugeRecipes": "StructureCentrifuge",
  "PaintMixRecipes": "AppliancePaintMixer"
}

class Guide extends Component {
  constructor(props) {
    super(props);

    this.state = {
      language: {
        desired: localStorage.getItem('guideLanguage') || "en",

        mapping: undefined
      },
      data: {
        desired: localStorage.getItem('guideBranch') || "public",

        things: undefined,
        recipies: undefined,
        scenarios: undefined
      },
      loading: {
        language: { state: "unloaded" },
        things: { state: "unloaded" },
        recipes: { state: "unloaded" },
        scenarios: { state: "unloaded" }
      }
    }
  }

  componentDidMount() {
    let language = this.state.language.desired;
    let branch = this.state.data.desired;

    this.loadData(`https://data.stationeering.com/languages/${language}/${branch}.json`,
    (t, data) => {
      t.setState({ language: { ...this.state.language, mapping: data }, loading: { ...this.state.loading, language: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, language: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/things/${branch}/things.json`,
    (t, data) => {
      t.setState({ data: { ...this.state.data, things: data }, loading: { ...this.state.loading, things: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, things: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/recipes/${branch}.json`,
    (t, data) => {
      var transformedData = t.transformRecipeData(data.recipes);
      t.setState({ data: { ...this.state.data, recipes: transformedData }, loading: { ...this.state.loading, recipes: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, recipes: { state: "failed", message: msg } }});
    },
    this);

    this.loadData(`https://data.stationeering.com/scenarios/${branch}.json`,
    (t, data) => {
      t.setState({ data: { ...this.state.data, scenarios: data }, loading: { ...this.state.loading, scenarios: { state: "success" } }});
    },
    (t, msg) => {
      t.setState({ loading: { ...this.state.loading, scenarios: { state: "failed", message: msg } }});
    },
    this);
  }

  transformRecipeData(recipes) {
    var transformed = {};

    for (var recipe of recipes) {
      if (recipe.manufactory === "IngotRecipes") {
        continue;
      }

      if (!Object.keys(transformed).includes(recipe.item)) {
        transformed[recipe.item] = {};
      }

      var remappedManufactory = MANUFACTORY_TO_THING[recipe.manufactory] || recipe.manufactory;

      transformed[recipe.item][remappedManufactory] = recipe.ingredients;
    }

    return transformed;
  }

  loadData(url, success, failure, t) {
    axios({ url: url, method: 'get', responseType: 'json' })
    .then(function (response) {
      success(t, response.data);
    })
    .catch(function (error) {                
      failure(t, error);
    });
  }

  render() {
    var allStates = [];

    for (var key of Object.keys(this.state.loading)) {
      allStates.push(this.state.loading[key].state);
    }
    
    let isLoading = !(allStates.every((state) => state === "success"));
    
    return (
      <div>
        <Row>
          <Col md={12}>
            <h3>Stationeers Reference ({this.state.data.desired} branch)</h3>
          </Col>
        </Row>

        {isLoading && <LoadingNotice states={this.state.loading} />}
        {!isLoading && <GuideContent states={this.state} />}
      </div>
    );
  }
}

class LoadingNotice extends Component {
  render() {
    return (
      <Row>
        <Col md={12}>
          <Panel>
            <Panel.Heading>
                <Panel.Title componentClass="h3">Loading resources for guide...</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <LoadState state={this.props.states.language} title="Language" />
              <LoadState state={this.props.states.things} title="Things" />
              <LoadState state={this.props.states.recipes} title="Recipes" />
              <LoadState state={this.props.states.scenarios} title="Scenarios" />
            </Panel.Body>
          </Panel>
        </Col>
      </Row>
    )
  }
}

class LoadState extends Component {
  render() {
    if (this.props.state.state === "success") {
      return null;
    }

    let icon = (this.props.state.state === "unloaded" || this.props.state.state === "loading") ? "spinner" : "times-circle";
    let iconSpin = (this.props.state.state === "unloaded" || this.props.state.state === "loading");

    let bsStyle = (this.props.state.state === "unloaded" || this.props.state.state === "loading") ? "info" : "danger";

    return (
      <Label bsStyle={bsStyle}><FontAwesomeIcon icon={icon} spin={iconSpin} /> {this.props.title}</Label>
    )
  }
}

class GuideContent extends Component {
  render() {
    var currentKey;

    if (window.location.pathname.startsWith('/guide/thing')) {
      currentKey = 'things';
    } else if (window.location.pathname.startsWith('/guide/scenarios')) {
      currentKey = 'scenarios';
    }

    return(
      <GuideContext.Provider value={{
        things: this.props.states.data.things,
        recipes: this.props.states.data.recipes,
        scenarios: this.props.states.data.scenarios,
        language: this.props.states.language.mapping.sections
      }}>      
        <Row>
            <Col md={12}>
                <Nav bsStyle="pills" activeKey={currentKey}>
                    <NavItem eventKey="things" componentClass={NavLink} to="/guide/thing" href="/guide/thing">
                        Things
                    </NavItem>
                    <NavItem eventKey="scenarios" componentClass={NavLink} to="/guide/scenarios" href="/guide/scenarios">
                        Scenarios
                    </NavItem>
                </Nav>
            </Col>
        </Row>

        <Route path="/guide" render={() => <Redirect to='/guide/thing' />} exact />
        <Route path="/guide/thing" component={ThingIndex} exact />
        <Route path="/guide/thing/:prefab" component={Thing} />
        <Route path="/guide/scenarios" component={Scenarios} />
      </GuideContext.Provider>
    );
  }
}

const FLAGS = [
  { flag: "item", icon: "hand-holding", title: "Item" },
  { flag: "tool", icon: "wrench", title: "Tool" },
  { flag: "constructor", icon: "box-open", title: "Places Structure" },
  { flag: "structure", icon: "industry", title: "Grid Structure" },
  { flag: "smallGrid", icon: "chess-board", title: "Small Grid Structure" },
  { flag: "logicable", icon: "microchip", title: "Has Logic Data" },
  { flag: "atmospherics", icon: "wind", title: "Atmospherics" },
  { flag: "plant", icon: "leaf", title: "Plant" },
  { flag: "edible", icon: "utensils", title: "Edible" },
  { flag: "paintable", icon: "spray-can", title: "Paintable" },
  { flag: "entity", icon: "bug", title: "Entity" },
  { flag: "npc", icon: "user-astronaut", title: "NPC Entity with AI" },  
]

class ThingIndex extends Component {
  constructor(props) {
    super(props);

    this.state = { search: { term: "", flags: [] } }
  }

  render() {
    let limit = 25;

    return (
      <Row>
        <Col md={12}>        
          <p />    
          <Panel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3"><FontAwesomeIcon icon="search" /> Search</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <Row>
                <Col md={6}>
                  <FormGroup controlId="term">
                    <ControlLabel>Type a few letters that is in the items name:</ControlLabel>
                    <FormControl type="text" placeholder="Enter text" onChange={(e) => this.changeSearchTerm(e.target.value)} />
                    <HelpBlock><small>You will need to type three or more characters, list limited to {limit} results.</small></HelpBlock>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup controlId="flags">
                    <ControlLabel>Select categories to list:</ControlLabel>
                    <p>
                      {FLAGS.map(flag => <SearchFlag flag={flag.flag} icon={flag.icon} flags={this.state.search.flags} title={flag.title} onClick={this.changeSearchFlag.bind(this)} />)}
                    </p>
                    <HelpBlock><small>Selecting categories requires that things have <strong>all</strong> categories selected.</small></HelpBlock>
                  </FormGroup>
                </Col>
              </Row>
            </Panel.Body>
          </Panel>
          <ThingList filter={this.filter.bind(this)} limit={limit} />
        </Col>
      </Row>
    );
  }

  filter(context, key) {
    var result = true;
    var hasFiltered = false;

    if (this.state.search.term.length >= 3) {
      let term = this.state.search.term.toLowerCase();

      result = result && (key.toLowerCase().includes(term) || (context.language.Things[key] || key).toLowerCase().includes(term))
      hasFiltered = true;
    }

    if (this.state.search.flags.length > 0) {
      for (var flag of this.state.search.flags) {
        result = result && context.things[key].flags[flag];
      }

      hasFiltered = true;
    }

    return result && hasFiltered;
  }

  changeSearchTerm = this.debounce(searchTerm => {
    this.setState({ search: { ...this.state.search, term: searchTerm }})
  }, 500)

  changeSearchFlag(flag, state) {
    var currentFlags = this.state.search.flags;

    if (state) {
      currentFlags.push(flag);
    } else {
      currentFlags = currentFlags.filter((f) => f !== flag);
    }

    this.setState({ search: { ...this.state.search, flags: currentFlags }})
  }

  // eslint-disable-next-line
  debounce(a,b,c){var d,e;return function(){function h(){d=null,c||(e=a.apply(f,g))}var f=this,g=arguments;return clearTimeout(d),d=setTimeout(h,b),c&&!d&&(e=a.apply(f,g)),e}}
}

class SearchFlag extends Component {
  render() {
    return (<abbr title={this.props.title} className="flag-toggle"><FontAwesomeIcon size='2x' icon={this.props.icon} onClick={this.toggle.bind(this)} className={this.props.flags.includes(this.props.flag) ? "" : "inactive"} /></abbr>)
  }

  toggle(e) {
    var newState = !this.props.flags.includes(this.props.flag);
    this.props.onClick(this.props.flag, newState);
  }
}

class ThingList extends Component {
  static contextType = GuideContext;

  render() {
    var thingKeys = Object.keys(this.context.things);

    if (this.props.filter) {
      thingKeys = thingKeys.filter((key) => this.props.filter(this.context, key));
    }
    
    var limited = false;

    if (this.props.limit && this.props.limit < thingKeys.length) {
      thingKeys = thingKeys.slice(0, this.props.limit);
      limited = true;
    }

    return (    
      <div>
        {limited && <Alert bsStyle='danger'><strong>List truncated as there are more than {this.props.limit} results.</strong></Alert>}
        <Table condensed>
          <thead>
            <tr>
              <th>Name</th>
              <th>Prefab (Hash)</th>
              <th colSpan={FLAGS.length}>Attributes</th>
              <th>Made/Constructed By</th>
            </tr>
          </thead>
          <tbody>
            {thingKeys.map((key) => <ThingListItem key={key} prefab={key} />)}
          </tbody>
        </Table>
      </div>
    );
  }
}

class ThingListItem extends Component {
  static contextType = GuideContext;

  render() {    
    var prefab = this.props.prefab;
    var thing = this.context.things[prefab];

    var madeBy = Object.keys(this.context.recipes[prefab] || {}).sort();
    var constructedBy = (thing.constructedBy || []).sort();

    var creationOptions = [].concat(madeBy);
    creationOptions = creationOptions.concat(constructedBy);

    return (
      <tr>
        <td><ThingLink prefab={prefab} /></td>
        <td><small className="text-info">{prefab} ({thing.prefabHash})</small></td>
        {FLAGS.map(flag => <ThingFlag flag={flag.flag} icon={flag.icon} flags={thing.flags} title={flag.title} />)}
        <td>{creationOptions.map((thing) => <ThingLink prefab={thing} />).reduce((accu, elem) => {
            return accu === null ? [elem] : [...accu, ', ', elem]
        }, null)}</td>
      </tr>
    );
  }
}

class ThingLink extends Component {
  static contextType = GuideContext;

  render() {
    let destination = `/guide/thing/${this.props.prefab}`;
    let title = this.context.language.Things[this.props.prefab] || this.props.prefab;

    return (
      <NavLink to={destination} href={destination}>{title}</NavLink>
    );
  }
}

class Thing extends Component {
  static contextType = GuideContext;

  render() {
    if (!Object.keys(this.context.things).includes(this.props.match.params.prefab)) {
      return (
        <Row>
          <Col md={12}>    
            Not Found
          </Col>
        </Row>
        );
    }
    
    let key = this.props.match.params.prefab;

    let title = this.context.language.Things[key] || key;
    let thing = this.context.things[key];

    let makes = Object.keys(this.context.recipes).filter((made) => Object.keys(this.context.recipes[made]).includes(key));
    let constructs = Object.keys(this.context.things).filter((rkey) => (this.context.things[rkey].constructedBy || []).includes(key));

    return (
      <Row>
        <Col md={12}>    
          <h4>{title}</h4>
          <p>
            <NavLink to='/guide' href='/guide'><FontAwesomeIcon icon='long-arrow-alt-left' /> Return to index</NavLink>
          </p>
        </Col>

        <Col md={4}>
          <ThingProperties thing={thing} name={key} />
          <ThingTemperatures thing={thing} />
        </Col>

        {thing.logicTypes && <Col md={4}>
          <ThingLogicTypes logicTypes={thing.logicTypes} />
        </Col>}

        {Object.keys(this.context.recipes[key] || {}).length > 0 && <Col md={4}>
          <ThingMadeBy prefab={key} />
        </Col>}

        <Col md={4}>
          {(thing.constructedBy || []).length > 0 && <ThingConstructedBy constructedBy={thing.constructedBy} />}

          {constructs.length > 0 && <ThingConstructs constructs={constructs} />}

          <ThingObjectHeirachy objectHeirachy={thing.objectHeirachy} />
        </Col>

        {makes.length > 0 && <Col md={12}>
          <ThingMakes makes={makes} />
        </Col>}
      </Row>
      );
  }
}

class ThingTemperatures extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>Temperatures</Panel.Heading>
      <Table>
      <tbody>
        {this.props.thing.temperatures.shatter && <tr><th>Shatter</th><td>{this.props.thing.temperatures.shatter}K</td></tr>}
        {this.props.thing.temperatures.flashpoint && <tr><th>Flash Point</th><td>{this.props.thing.temperatures.flashpoint}K</td></tr>}
        {this.props.thing.temperatures.autoignition && <tr><th>Autoignition</th><td>{this.props.thing.temperatures.autoignition}K</td></tr>}
      </tbody>
      </Table>
    </Panel>)
  }
}

class ThingProperties extends Component {
  render() {
    let thing = this.props.thing;

    return (<Panel>
      <Panel.Heading>Properties</Panel.Heading>
      <Table>
      <tbody>
        <tr><th><FontAwesomeIcon icon="terminal" /></th><th>Internal Name</th><td>{this.props.name}</td></tr>
        <tr><th><FontAwesomeIcon icon="hashtag" /></th><th>Hash</th><td>{thing.prefabHash}</td></tr>
        {FLAGS.map(flag => <ThingPropertyFlag flag={flag.flag} icon={flag.icon} flags={thing.flags} title={flag.title} />)}
      </tbody>
      </Table>
    </Panel>)
  }
}

class ThingPropertyFlag extends Component {
  render() {
    return (<tr><th><FontAwesomeIcon icon={this.props.icon} /></th><th>{this.props.title}</th><td>{this.props.flags[this.props.flag] ? "Yes" : "No"}</td></tr>);
  }
}

class ThingMakes extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>Makes</Panel.Heading>
      <ThingList filter={(context, key) => this.props.makes.includes(key)} />         
    </Panel>);
  }
}

class ThingConstructedBy extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>Constructed By</Panel.Heading>
      <ListGroup>
        {(this.props.constructedBy || []).map((thing) => {
          return (<ListGroupItem><ThingLink prefab={thing} /></ListGroupItem>);
        })}
      </ListGroup>            
    </Panel>);
  }
}

class ThingConstructs extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>Constructs</Panel.Heading>
      <ListGroup>
        {this.props.constructs.map((thing) => {
          return (<ListGroupItem><ThingLink prefab={thing} /></ListGroupItem>);
        })}
      </ListGroup>            
    </Panel>);
  }
}

class ThingLogicTypes extends Component {
  render() {
    return (<Panel>
      <Panel.Heading>Logic Types</Panel.Heading>
      <Table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Read</th>
          <th>Write</th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(this.props.logicTypes || {}).map((logicType) => {
          return (
            <tr>
              <td>{logicType}</td>
              <td>{this.props.logicTypes[logicType].read ? "Yes" : "No"}</td>
              <td>{this.props.logicTypes[logicType].write ? "Yes" : "No"}</td>
            </tr>
          )
        })}
      </tbody>
      </Table>
    </Panel>);
  }
}

class ThingMadeBy extends Component {
  static contextType = GuideContext;

  render() {
    let recipes = this.context.recipes[this.props.prefab] || [];

    return (<Panel>
      <Panel.Heading>Made By</Panel.Heading>
      <Panel.Body>

      {Object.keys(recipes).map((manufactory) => {
        return (
          <div>
            <h5><ThingLink prefab={manufactory} /></h5>
            <Table condensed>
              <thead>
                <tr>
                  <th>Reagent</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(recipes[manufactory]).sort().map((ingredient) => {
                  var name = this.context.language.Reagents[ingredient] ? this.context.language.Reagents[ingredient].name : ingredient;
                  var unit = this.context.language.Reagents[ingredient] ? this.context.language.Reagents[ingredient].unit : "";
                  return (
                    <tr>
                      <td>{name}</td>
                      <td>{recipes[manufactory][ingredient]}{unit}</td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            </div>
        );
      })}
      </Panel.Body>
    </Panel>);
  }
}

class ThingFlag extends Component {
  render() {
    if (!this.props.flags[this.props.flag]) {
      return (<td />);
    }

    return (<td>
      <abbr title={this.props.title}><FontAwesomeIcon icon={this.props.icon} /></abbr>
    </td>)
  }
}

class ThingObjectHeirachy extends Component {
  constructor(props) {
    super(props);

    this.state = { show: (sessionStorage.getItem('showCSharpHeirachy') || false) };
  }

  render() {
    return (<Panel>
      <Panel.Heading>C# Heirachy <FontAwesomeIcon className='pull-right' icon={this.state.show ? 'eye-slash' : 'eye'} onClick={this.onClick.bind(this)} /></Panel.Heading>
      {this.state.show && <ListGroup>
        {this.props.objectHeirachy.reverse().filter((el, i, a) => i === a.indexOf(el)).reverse().map((thing) => {
          return (<ListGroupItem>{thing}</ListGroupItem>);
        })}
      </ListGroup>}    
    </Panel>);
  }

  onClick(e) {
    this.setState({ show: !this.state.show }, () => {
      sessionStorage.setItem('showCSharpHeirachy', this.state.show);
    });
  }
}

export default Guide;