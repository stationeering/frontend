import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { Row, Col, Label, Panel, Table, Alert, ListGroup, ListGroupItem, FormGroup, HelpBlock, FormControl, ControlLabel } from 'react-bootstrap';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faSprayCan, faUtensils, faLeaf, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen, faLongArrowAltLeft, faHashtag, faSearch} from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faLeaf, faSprayCan, faUtensils, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen, faLongArrowAltLeft, faHashtag, faSearch);

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
            <h3>Stationeering's Guide to Stationeers ({this.state.data.desired} branch)</h3>
            {isLoading && <LoadingNotice states={this.state.loading} />}
            {!isLoading && <GuideContent states={this.state} />}
          </Col>
        </Row>
      </div>
    );
  }
}

class LoadingNotice extends Component {
  render() {
    return (
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

const GuideContext = React.createContext({});

class GuideContent extends Component {
  render() {
    return(
      <GuideContext.Provider value={{
        things: this.props.states.data.things,
        recipes: this.props.states.data.recipes,
        scenarios: this.props.states.data.scenarios,
        language: this.props.states.language.mapping.sections
      }}>
        <Route path="/guide" component={ThingIndex} exact />
        <Route path="/guide/thing/:prefab" component={Thing} />
      </GuideContext.Provider>
    );
  }
}

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
          <h4>Things</h4>    
          <Panel bsStyle="info">
            <Panel.Heading>
              <Panel.Title componentClass="h3"><FontAwesomeIcon icon="search" /> Search</Panel.Title>
            </Panel.Heading>
            <Panel.Body>
              <FormGroup controlId="searchForm">
                <ControlLabel>Type a few letters that is in the items name:</ControlLabel>
                <FormControl type="text" placeholder="Enter text" onChange={(e) => this.changeSearchTerm(e.target.value)} />
                <HelpBlock><small>You will need to type three or more characters, list limited to {limit} results.</small></HelpBlock>
              </FormGroup>
            </Panel.Body>
          </Panel>
          <ThingList filter={this.filter.bind(this)} limit={limit} />
        </Col>
      </Row>
    );
  }

  filter(context, key) {
    if (this.state.search.term.length >= 3) {
      let term = this.state.search.term.toLowerCase();

      return (key.toLowerCase().includes(term) || (context.language.Things[key] || key).toLowerCase().includes(term))
    } else {
      return false;
    }
  }

  changeSearchTerm = this.debounce(searchTerm => {
    this.setState({ search: { ...this.state.search, term: searchTerm }})
  }, 500)

  debounce(a,b,c){var d,e;return function(){function h(){d=null,c||(e=a.apply(f,g))}var f=this,g=arguments;return clearTimeout(d),d=setTimeout(h,b),c&&!d&&(e=a.apply(f,g)),e}}
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
              <th colSpan={11}>Attributes</th>
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
        <ThingFlag flag="item" icon="hand-holding" flags={thing.flags} title='Item' />
        <ThingFlag flag="tool" icon="wrench" flags={thing.flags} title='Tool' />
        <ThingFlag flag="constructor" icon="box-open" flags={thing.flags} title='Constructs A Structure' />
        <ThingFlag flag="structure" icon="industry" flags={thing.flags} title='Grid Structure'/>
        <ThingFlag flag="smallGrid" icon="chess-board" flags={thing.flags} title='Small Grid Structure' />
        <ThingFlag flag="logicable" icon="microchip" flags={thing.flags} title='Has Logic Data'/>
        <ThingFlag flag="plant" icon="leaf" flags={thing.flags} title='Plant' />
        <ThingFlag flag="edible" icon="utensils" flags={thing.flags} title='Edible' />
        <ThingFlag flag="paintable" icon="spray-can" flags={thing.flags} title='Paintable' />
        <ThingFlag flag="entity" icon="bug" flags={thing.flags} title='Entity' />
        <ThingFlag flag="npc" icon="user-astronaut" flags={thing.flags} title='NPC Entity with AI' />
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
          <ThingTemperatures thing={thing} />
          <ThingProperties thing={thing} />
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
      <Table condensed>
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
      <Table condensed>
      <tbody>
        <tr><th><FontAwesomeIcon icon="hashtag" /></th><th>Hash</th><td>{thing.prefabHash}</td></tr>
        <ThingPropertyFlag flag="item" icon="hand-holding" flags={thing.flags} title='Item' />
        <ThingPropertyFlag flag="tool" icon="wrench" flags={thing.flags} title='Tool' />
        <ThingPropertyFlag flag="constructor" icon="box-open" flags={thing.flags} title='Constructs A Structure' />
        <ThingPropertyFlag flag="structure" icon="industry" flags={thing.flags} title='Grid Structure'/>
        <ThingPropertyFlag flag="smallGrid" icon="chess-board" flags={thing.flags} title='Small Grid Structure' />
        <ThingPropertyFlag flag="logicable" icon="microchip" flags={thing.flags} title='Has Logic Data'/>
        <ThingPropertyFlag flag="plant" icon="leaf" flags={thing.flags} title='Plant' />
        <ThingPropertyFlag flag="edible" icon="utensils" flags={thing.flags} title='Edible' />
        <ThingPropertyFlag flag="paintable" icon="spray-can" flags={thing.flags} title='Paintable' />
        <ThingPropertyFlag flag="entity" icon="bug" flags={thing.flags} title='Entity' />
        <ThingPropertyFlag flag="npc" icon="user-astronaut" flags={thing.flags} title='NPC Entity with AI' />
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
      <Table condensed>
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

export default Guide;