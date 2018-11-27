import React, { Component } from 'react';
import { Route, NavLink } from 'react-router-dom';
import { Row, Col, Label, Panel, Table } from 'react-bootstrap';

import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faSprayCan, faUtensils, faLeaf, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner, faTimesCircle, faHandHolding, faWrench, faMicrochip, faLeaf, faSprayCan, faUtensils, faUserAstronaut, faBug, faIndustry, faChessBoard, faBoxOpen);

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

class GuideContent extends Component {
  render() {
    return(
      <div>
        <Route path="/guide" render={() => <ThingList things={this.props.states.data.things} recipes={this.props.states.data.recipes} language={this.props.states.language.mapping.sections.Things} />} exact />
        <Route path="/guide/thing/:prefab" render={(props) => <Thing {...props} things={this.props.states.data.things} recipes={this.props.states.data.recipes} language={this.props.states.language.mapping.sections.Things} />} />
      </div>
    );
  }
}

class ThingList extends Component {
  render() {
    var thingKeys = Object.keys(this.props.things);

    return (
      <Row>
        <Col md={12}>        
          <h4>Things</h4>        
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
              {thingKeys.map((key) => <ThingListItem key={key} prefab={key} thing={this.props.things[key]} recipes={this.props.recipes[key]} language={this.props.language} />)}
            </tbody>
          </Table>
        </Col>
      </Row>
    );
  }
}

class ThingLink extends Component {
  render() {
    let destination = `/guide/thing/${this.props.prefab}`;

    return (
      <NavLink to={destination} href={destination}>{this.props.title}</NavLink>
    );
  }
}

class Thing extends Component {
  render() {
    if (!Object.keys(this.props.things).includes(this.props.match.params.prefab)) {
      return (
        <Row>
          <Col md={12}>    
            Not Found
          </Col>
        </Row>
        );
    }
    
    let key = this.props.match.params.prefab;

    let title = this.props.language[key] || key;
    let thing = this.props.things[key];
    let recipes = this.props.recipes[key] || [];

    return (
      <Row>
        <Col md={12}>    
          <h4>{title}</h4>
        </Col>

        <Col md={4}>
          <Panel>
            <Panel.Heading>Made By</Panel.Heading>
            {Object.keys(recipes).map((manufactory) => {
              return (<div>
                <Panel.Body><h4>{manufactory}</h4></Panel.Body>
                <Table condensed>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(recipes[manufactory]).map((ingredient) => {
                      return (
                        <tr>
                          <td>{ingredient}</td>
                          <td>{recipes[manufactory][ingredient]}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>);
            })}
          </Panel>
        </Col>

        <Col md={4}>
          <Panel>
            <Panel.Heading>Makes</Panel.Heading>
            <ul>
            {Object.keys(this.props.recipes).filter((made) => Object.keys(this.props.recipes[made]).includes(key)).map((manu) => <li>{manu}</li>)}
            </ul>
          </Panel>
        </Col>

        <Col md={4}>
          <Panel>
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
              {Object.keys(thing.logicTypes || {}).map((logicType) => {
                return (
                  <tr>
                    <td>{logicType}</td>
                    <td>{thing.logicTypes[logicType].read ? "Yes" : "No"}</td>
                    <td>{thing.logicTypes[logicType].write ? "Yes" : "No"}</td>
                  </tr>
                )
              })}
            </tbody>
            </Table>
          </Panel>
        </Col>

        <Col md={4}>
          <Panel>
            <Panel.Heading>Constructed By</Panel.Heading>
            <ul>
              {(thing.constructedBy || []).map((thing) => {
                return (<li>{thing}</li>);
              })}
            </ul>            
          </Panel>
        </Col>

        <Col md={4}>
          <Panel>
            <Panel.Heading>Constructs</Panel.Heading>
            <ul>
              {(Object.keys(this.props.things).filter((rkey) => (this.props.things[rkey].constructedBy || []).includes(key)).map((thing) => {
                return (<li>{thing}</li>);
              }))}
            </ul>            
          </Panel>
        </Col>
      </Row>
      );
  }
}

class ThingListItem extends Component {
  render() {    
    var madeBy = Object.keys(this.props.recipes || {}).sort().map((manufactory) => this.props.language[manufactory]);
    var constructedBy = (this.props.thing.constructedBy || []).sort().map((kit) => this.props.language[kit]);

    var creationOptions = [].concat(madeBy);
    creationOptions = creationOptions.concat(constructedBy);

    return (
      <tr>
        <td><ThingLink prefab={this.props.prefab} title={this.props.language[this.props.prefab] || this.props.prefab} /></td>
        <td><small className="text-info">{this.props.prefab} ({this.props.thing.prefabHash})</small></td>
        <ThingFlag flag="item" icon="hand-holding" flags={this.props.thing.flags} title='Item' />
        <ThingFlag flag="tool" icon="wrench" flags={this.props.thing.flags} title='Tool' />
        <ThingFlag flag="constructor" icon="box-open" flags={this.props.thing.flags} title='Constructs A Structure' />
        <ThingFlag flag="structure" icon="industry" flags={this.props.thing.flags} title='Grid Structure'/>
        <ThingFlag flag="smallGrid" icon="chess-board" flags={this.props.thing.flags} title='Small Grid Structure' />
        <ThingFlag flag="logicable" icon="microchip" flags={this.props.thing.flags} title='Has Logic Data'/>
        <ThingFlag flag="plant" icon="leaf" flags={this.props.thing.flags} title='Plant' />
        <ThingFlag flag="edible" icon="utensils" flags={this.props.thing.flags} title='Edible' />
        <ThingFlag flag="paintable" icon="spray-can" flags={this.props.thing.flags} title='Paintable' />
        <ThingFlag flag="entity" icon="bug" flags={this.props.thing.flags} title='Entity' />
        <ThingFlag flag="npc" icon="user-astronaut" flags={this.props.thing.flags} title='NPC Entity with AI' />
        <td>{creationOptions.join(", ")}</td>
      </tr>
    );
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