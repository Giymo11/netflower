/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import 'ion-rangeslider';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.css';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.skinFlat.css';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {d3TextWrap, roundToFull} from './utilities';
import {setEntityFilterRange, updateEntityRange, setMediaFilterRange,
        updateMediaRange, setEuroFilterRange, updateEuroRange} from './filters/filterMethods';
import FilterPipeline from './filters/filterpipeline';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';
import EntitySearchFilter from './filters/entitySearchFilter';
import MediaSearchFilter from './filters/mediaSearchFilter';
import PaymentEuroFilter from './filters/paymentEuroFilter';
import SparklineBarChart from './sparklineBarChart';


class SankeyDiagram implements MAppViews {

  private $node;
  private nodesToShow: number = 20;

  //Filters
  private pipeline: FilterPipeline;
  private entityEuroFilter: EntityEuroFilter;
  private mediaEuroFilter: MediaEuroFilter;
  private entitySearchFilter: EntitySearchFilter;
  private mediaSearchFilter: MediaSearchFilter;
  private euroFilter: PaymentEuroFilter;

  //Sliders
  private entitySlider;
  private mediaSlider;
  private valueSlider;

  constructor(parent: Element, private options: any)
  {
    //Get FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    //Create Filters
    this.entityEuroFilter = new EntityEuroFilter();
    this.mediaEuroFilter = new MediaEuroFilter();
    this.euroFilter = new PaymentEuroFilter();
    this.entitySearchFilter = new EntitySearchFilter();
    this.mediaSearchFilter = new MediaSearchFilter();
    //Add Filters to pipeline
    this.pipeline.addFilter(this.entityEuroFilter);
    this.pipeline.addFilter(this.mediaEuroFilter);
    this.pipeline.addFilter(this.euroFilter);
    this.pipeline.changeEntitySearchFilter(this.entitySearchFilter);
    this.pipeline.changeMediaSearchFilter(this.mediaSearchFilter);

    this.$node = d3.select(parent)
      .append('div')
      .classed('sankey_diagram', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    let left = this.$node.append('div').attr('class', 'left_bars');
    let sankeyVis = this.$node.append('div').attr('class', 'sankey_vis');
    let middle = sankeyVis.append('div').attr('class', 'middle_bars');
    let sankeyDiagram = sankeyVis.append('div').attr('id', 'sankeyDiagram');
    let loadMore = sankeyVis.append('div').attr('class', 'load_more');
    let right = this.$node.append('div').attr('class', 'right_bars');

    // check if column meta data is in storage
    let columnLabels : any = JSON.parse(localStorage.getItem('columnLabels'));
    // provide some default values
    if (columnLabels == null) {
      columnLabels = {};
      columnLabels.sourceNode = 'Source';
      columnLabels.targetNode = 'Target';
      columnLabels.valueNode = 'Amount';
    }

    left.html(`
    <div class='controlBox'>
        <div class='left_bar_heading'><p>${columnLabels.sourceNode}</p></div>
        <div class='input-group input-group-sm' style='width: 90%; margin: auto;'>
          <input id='entityFilter'/>
        </div>
        <div class='input-group input-group-xs'>
          <input type='text' id='entitySearchFilter' class='form-control' placeholder='Search for Source Nodes...'/>
          <span class='input-group-btn'>
            <button type='button' id='entitySearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
          </span>
        </div>
      </div>
    `);

    middle.html(`
    <div class='controlBox'>
      <div class='sankey_heading'><p>Flow</p></div>
      <div style='width: 40%; margin: auto;'>
        <input id='valueSlider'/>
      </div>
    </div>
    `);

    loadMore.html(`
      <button type='button' class='btn btn-secondary btn-xs btn-block'>
      <span style='font-size:smaller;'>Load More ...</span></button>
    `);

    right.html(`
    <div class='controlBox'>
      <div class='right_bar_heading'><p>${columnLabels.targetNode}</p></div>
      <div class='input-group input-group-sm' style='width: 90%; margin: auto;'>
        <input id='mediaFilter'/>
      </div>
      <div class='input-group input-group-xs'>
        <input type='text' id='mediaSearchFilter' class='form-control' placeholder='Search for Target Nodes...'/>
        <span class='input-group-btn'>
          <button type='button' id='mediaSearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
      </div>
    </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    //This redraws if new data is available
    let dataAvailable = localStorage.getItem('dataLoaded') == 'loaded' ? true : false;
    if(dataAvailable) {
      this.getStorageData(false);
    }

    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      //Draw Sankey Diagram
      this.getStorageData(false);
    });

    events.on(AppConstants.EVENT_FILTER_CHANGED, (evt, data) => {
      this.$node.select('#sankeyDiagram').html('');
      //Redraw Sankey Diagram
      this.getStorageData(true);
    });

    this.$node.select('#entitySearchButton').on('click', (d) => {
      let value: string = $('#entitySearchFilter').val();
      this.entitySearchFilter.term = value;

      events.fire(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, d, null);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });

    this.$node.select('#mediaSearchButton').on('click', (d) => {
      let value: string = $('#mediaSearchFilter').val();
      this.mediaSearchFilter.term = value;

      events.fire(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, d, null);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });

    events.on(AppConstants.EVENT_RESIZE_WINDOW, () => this.resize());

    events.on(AppConstants.EVENT_SLIDER_CHANGE, (e, d) => {
      updateEntityRange(this.entityEuroFilter, d);
      updateMediaRange(this.mediaEuroFilter, d);
      updateEuroRange(this.euroFilter, d);
    });
  }

  /**
   * This method gets called whenever the page is resized.
   */
  private resize() {
    d3.select('#sankeyDiagram').html('');
    this.getStorageData(true);
  }

  /**
   * Just a handy method that can be called whenever the page is reloaded or when the data is ready.
   */
  private getStorageData(redraw: boolean)
  {
    localforage.getItem('data').then((value) => {
      //Store the unfiltered data too
      let originalData = value;
      if(!redraw)
      {
        setEntityFilterRange(this.entityEuroFilter, '#entityFilter', originalData);
        setMediaFilterRange(this.mediaEuroFilter, '#mediaFilter', originalData);
        setEuroFilterRange(this.euroFilter, '#valueSlider', originalData);
      }

      //Filter the data before and then pass it to the draw function.
      let filteredData = this.pipeline.performFilters(value);
      this.buildSankey(filteredData, originalData);
    });
  }

  /**
   * This function draws the whole sankey visualization by using the data which is passed from the storage.
   * @param json data from the read functionality
   */
  private buildSankey(json, origJson) {
    const that = this;
    const sankey = (<any>d3).sankey();
    const units = '€';

    let headingOffset = this.$node.select('.controlBox').node().getBoundingClientRect().height;  //10 from padding of p tag
    let footerOffset = this.$node.select('.load_more').node().getBoundingClientRect().height + 15;
    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;

    const margin = { top: 10, right: 120, bottom: 10, left: 120 };
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom - headingOffset - footerOffset;
    const widthOffset = 80;

    //The '0' option enables zero-padding. The comma (',') option enables the use of a comma for a thousands separator.
    const formatNumber = d3.format(',.0f'),    // zero decimal places
      format = function(d) { return formatNumber(d); }; //Display number with unit sign

    //Append the svg canvas to the page
    const svg = d3.select('#sankeyDiagram').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform','translate(' + (margin.left + widthOffset/2) + ',' + margin.top + ')');

    //Set the diagram properties
    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width - widthOffset, height]);

    const path = sankey.link();

    // Group Data (by quartal)
    let nest =(<any>d3).nest()
      .key((d) => {return d.sourceNode;})
      .key(function (d) {return d.targetNode;})
      .rollup(function (v) {return {
        target: v[0].targetNode,
        source: v[0].sourceNode,
        time: v[0].timeNode,
        sum: d3.sum(v, function (d :any){ return d.valueNode;})
      }})
      .entries(json);

    let graph = {'nodes' : [], 'links' : []};
    that.nodesToShow = Math.ceil((heightNode / 25));    //Trying to make nodes length dependent on space in window
    console.log('changed', that.nodesToShow);

    let counter = 0;
    for(let d of nest) {
      counter += d.values.length;
      if(counter >= 26) break;
      for (var v = 0; v <= d.values.length - 1; v++) {
        graph.nodes.push({ 'name': d.key });//all Nodes source
        graph.nodes.push({ 'name': d.values[v].key });//all Nodes target
        graph.links.push({ 'source': d.key,
          'target': d.values[v].key,
          'value': +d.values[v].values.sum,
          'time': d.values[v].values.time});
      }
    }

    //d3.keys - returns array of keys from the nest function
    //d3.nest - groups the values of an array by the given key
    //d3.map - constructs a new map and copies all enumerable properties from the specified object into this map.
    graph.nodes = (<any>d3).keys((<any>d3).nest()
      .key((d) => {return d.name;})
      .map(graph.nodes));

    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //This makes out of the array of strings a array of objects with the key 'name'
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { 'name': d };
    });

    //Basic parameters for the diagram
    sankey
      .nodes(graph.nodes)
      //.links(linksorted)
      .links(graph.links)
      .layout(10); //Difference only by 0, 1 and otherwise always the same

    let link = svg.append('g').selectAll('.link')
      .data(graph.links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d) { return Math.max(1, d.dy); })
      //reduce edges crossing
      .sort(function(a, b) { return b.dy - a.dy; });

    //Add the link titles - Hover Path
    link.append('title')
      .text(function(d) { return d.source.name + ' → ' +  d.target.name + '\n' + format(d.value); });

    //Add the on 'click' listener for the links
    link.on('click', function(d) {
      events.fire(AppConstants.EVENT_CLICKED_PATH, d, origJson);
    });

    //Add in the nodes
    let node = svg.append('g').selectAll('.node')
      .data(graph.nodes)
      .enter().append('g')
      .attr('class', function(d: any, i: number) {
        //Save type of node in DOM
        if (d.sourceLinks.length > 0) {
          return 'node source';
        } else {
          return 'node target';
        }
      })
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    //Add the rectangles for the nodes
    node.append('rect')
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', '#DA5A6B')
      //Title rectangle
      .append('title')
      .text(function(d) { return d.name + '\n' + format(d.value); });

    //Create sparkline barcharts for newly enter-ing g.node elements
    node.call(SparklineBarChart.createSparklines);

    // //This is how the overlays for the rects can be done after they have been added
    // node.append('rect')
    //   .attr('height', function(d) {
    //     console.log(d.name, d.dy);
    //     return 10;
    //   })
    //   .attr('width', sankey.nodeWidth())
    //   .style('fill', '#FAB847');

    //Add in the title for the nodes
    let heading = node.append('g').append('text')
      .attr('x', 45)
      .attr('y', function(d) { return (d.dy / 2) - 10;})
      .attr('dy', '1.0em')
      .attr('text-anchor', 'start')
      .attr('class', 'rightText')
      .text(function(d) {return `${d.name}`;})
      .filter(function(d, i) { return d.x < width / 2})
      .attr('x', -45 + sankey.nodeWidth())
      .attr('text-anchor', 'end')
      .attr('class', 'leftText');

    // The strange word wrapping. Resizes based on the svg size the sankey diagram size and the words and text size.
    const leftWrap = this.$node.selectAll('.leftText');
    const rightWrap = this.$node.selectAll('.rightText');
    const leftTextWidth = leftWrap.node().getBoundingClientRect().width;
    const rightTextWidth = rightWrap.node().getBoundingClientRect().width;
    const svgBox = {
      'width': width + margin.left + margin.right,
      'height': height + margin.top + margin.bottom
    };
    const wordWrapBorder = (svgBox.width - width) / 2;

    if(leftTextWidth > wordWrapBorder) {
      d3TextWrap(leftWrap, wordWrapBorder);
      leftWrap.attr('transform', 'translate(' + (wordWrapBorder + 5) * (-1) + ', 0)');
    }
    if(rightTextWidth > wordWrapBorder) {
      d3TextWrap(rightWrap, wordWrapBorder + 10);
      rightWrap.attr('transform', 'translate(' + ((wordWrapBorder - 45) / 2) + ', 0)');
    }
  }
}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new SankeyDiagram(parent, options);
}
