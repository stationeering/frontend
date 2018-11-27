import React, { Component } from 'react';
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
      <Row>
        <Col md={12}>
          <h4>Things</h4>
          <ThingList things={this.props.states.data.things} recipes={this.props.states.data.recipes} language={this.props.states.language.mapping.sections.Things} />
        </Col>
      </Row>
    );
  }
}

class ThingList extends Component {
  render() {
    var thingKeys = Object.keys(this.props.things);

    return (
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
    );
  }
}

class ThingListItem extends Component {
  render() {    
    var madeBy = Object.keys(this.props.recipes || {}).sort().map((manufactory) => this.props.language[manufactory]);
    var constructedBy = (this.props.thing.constructedBy || []).sort().map((kit) => this.props.language[kit]);

    var output = [].concat(madeBy);
    output = output.concat(constructedBy);

    return (
      <tr>
        <td>{this.props.language[this.props.prefab] || this.props.prefab}</td>
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
        <td>{output.join(", ")}</td>
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