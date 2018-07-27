import React, { Component } from 'react';
import axios from 'axios';
import { Row, Col, Panel, FormGroup, HelpBlock, FormControl, ControlLabel, ListGroup, ListGroupItem } from 'react-bootstrap';
import Pluralize from 'react-pluralize';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faList } from '@fortawesome/free-solid-svg-icons';

import './Items.css';
library.add(faSearch, faList);

class Items extends Component {
  constructor(props) {
    super(props);

    this.manufactoryMap = this.manufactoryMap.bind(this);

    this.state = { ...this.state, byItem: {}, byManufactory: {}, recipes: { message: "Please wait loading recipes!" } };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.branch !== prevState.branch) {
      return { branchChange: true, branch: nextProps.branch }
    }
    return null;
  }

  loadData() {
    this.setState({ branchChange: false });

    var recipes = this;

    axios({ url: 'https://data.stationeering.com/recipes/' + this.props.branch + '.json', method: 'get', responseType: 'json' })
      .then(function (response) {
        if (response.status === 200) {
          recipes.setState({ recipes: { message: null } });
          recipes.processRecipeList(response.data.recipes);
        } else {
          recipes.setState({ recipes: { message: "Could not load recipe list! (" + response.status + ")" } });
        }
      })
      .catch(function (error) {
        recipes.setState({ recipes: { message: "Failed to load recipe list! " + error } });
      });
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.branchChange) {
      this.loadData();
    }
  }

  processRecipeList(recipes) {
    var byItem = this.generateByItem(recipes);
    var byManufactory = this.generateByManufactory(recipes);

    this.setState({ byItem, byManufactory });
  }

  manufactoryMap(manufactory) {
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

    if (MANUFACTORY_TO_THING.hasOwnProperty(manufactory)) {
      return MANUFACTORY_TO_THING[manufactory];
    } else {
      return manufactory;
    }
  }

  generateByItem(recipes) {
    var items = {}

    for (let recipe of recipes) {
      if (recipe.manufactory === "IngotRecipes") {
        continue;
      }

      if (!items.hasOwnProperty(recipe.item)) {
        items[recipe.item] = {};
      }

      items[recipe.item][recipe.manufactory] = { ingredients: recipe.ingredients, cost: this.calculateCost(recipe.ingredients) };
    }

    return items;
  }

  generateByManufactory(recipes) {
    var items = {}

    for (let recipe of recipes) {
      if (recipe.manufactory === "IngotRecipes") {
        continue;
      }

      if (!items.hasOwnProperty(recipe.manufactory)) {
        items[recipe.manufactory] = {};
      }

      items[recipe.manufactory][recipe.item] = { ingredients: recipe.ingredients, cost: this.calculateCost(recipe.ingredients) };
    }

    return items;
  }

  calculateCost(ingredients) {
    // Based on ore rarity.
    const COST_FACTORS = {
      Energy: 0,
      Time: 0,
      Iron: 0.1,
      Gold: 0.7,
      Coal: 0.4,
      Copper: 0.6,
      Uranium: 0.95,
      Silver: 0.9,
      Nickle: 0.9,
      Lead: 0.9,
      Silicon: 0.6
    }

    return Object.keys(ingredients).reduce((acc, name) => {
      var factor = (COST_FACTORS.hasOwnProperty(name) ? COST_FACTORS[name] : 1.0);
      return acc + (ingredients[name] * factor);
    }, 0).toFixed(2);
  }

  render() {
    return (<Search items={this.state.byItem} branch={this.props.branch} languageMap={this.props.languageMap} manufactoryMap={this.manufactoryMap} />);
  }
}

class Search extends Component {
  constructor(props) {
    super(props);

    this.search = this.search.bind(this);
    this.state = { results: null };
  }

  render() {
    return (
      <div>
        <Row>
          <Col md={12}>
          <h3>Item Database {this.props.branch === "beta" ? "(Beta Branch)" : ""}</h3>
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            <Panel bsStyle="info">
              <Panel.Heading>
                <Panel.Title componentClass="h3"><FontAwesomeIcon icon="search" /> Search</Panel.Title>
              </Panel.Heading>
              <Panel.Body>
                <FormGroup controlId="searchForm">
                  <ControlLabel>Type a few letters that is in the items name:</ControlLabel>
                  <FormControl type="text" placeholder="Enter text" onChange={this.search} />
                  <HelpBlock><small>{Object.keys(this.props.items).length} items loaded for search.</small></HelpBlock>
                </FormGroup>
              </Panel.Body>
            </Panel>
            {this.renderResults()}
          </Col>
        </Row>
      </div>
    );
  }

  renderResults() {
    if (this.state.results === null) {
      return null;
    }

    return (
      <div>
        <Panel bsStyle="success">
          <Panel.Heading>
            <Panel.Title componentClass="h3"><FontAwesomeIcon icon="list" /> <Pluralize singular="Result" count={this.state.results.length} /></Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <Row>
            {this.state.results.map((item) => <SearchResult key={item} itemName={item} item={this.props.items[item]} languageMap={this.props.languageMap} manufactoryMap={this.props.manufactoryMap} />)}
            </Row>
          </Panel.Body>
        </Panel>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    this.search
  }

  initialSearch(event) {
    
  }

  search(event) {
    var searchTerm = event.target.value;
    var parts = searchTerm.split(" ").map((term) => term.trim().toLowerCase()).filter((term) => term.length > 0);

    var results = [];

    if (parts.length > 0) {
      results = Object.keys(this.props.items).filter((name) => {
        return parts.every((partName) => name.toLowerCase().includes(partName)) ||
          parts.every((partName) => this.props.languageMap("Things", name).toLowerCase().includes(partName));
      })
    }

    if (results.length > 0 && results.length < (Object.keys(this.props.items).length / 8)) {
      this.setState({ results });
    } else {
      this.setState({ results: null });
    }    
  }
}

class SearchResult extends Component {
  render() {
    return (
    <Col md={6}>
        <Panel>
          <Panel.Heading>
            <Panel.Title componentClass="h4">{this.props.languageMap("Things", this.props.itemName)}</Panel.Title>
          </Panel.Heading>
          <Panel.Body>
            <strong>Made In:</strong>
          </Panel.Body>
          <ListGroup>
            {Object.keys(this.props.item).map((manufactory) => <ListGroupItem key={manufactory}>{this.props.languageMap("Things", this.props.manufactoryMap(manufactory))}</ListGroupItem>)}
          </ListGroup>  
        </Panel>
    </Col>);
  }
}

export default Items;