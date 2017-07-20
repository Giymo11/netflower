/**
 * Created by cniederer on 21.04.17.
 */
/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
// import * as nouislider from 'nouislider/distribute/nouislider.js';
// import 'style-loader!css-loader!nouislider/distribute/nouislider.css';
// import 'bootstrap-slider';
// import 'style-loader!css-loader!bootstrap-slider/dist/css/bootstrap-slider.css';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import FilterPipeline from './filters/filterpipeline';
import QuarterFilter from './filters/quarterFilter';
import TopFilter from './filters/topFilter';
import ParagraphFilter from './filters/ParagraphFilter';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';

class FilterData implements MAppViews {

  private $node: d3.Selection<any>;
  private pipeline: FilterPipeline;
  private quarterFilter: QuarterFilter;
  private topFilter: TopFilter;
  private paragraphFilter: ParagraphFilter;

  constructor(parent: Element, private options: any)
  {
    //Get FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    //Create Filters
    this.quarterFilter = new QuarterFilter();
    this.topFilter = new TopFilter();
    this.paragraphFilter = new ParagraphFilter();
    //Add Filters to Pipeline
    this.pipeline.changeTopFilter(this.topFilter); //must be first filter
    this.pipeline.addFilter(this.quarterFilter);
    this.pipeline.addFilter(this.paragraphFilter);

    this.$node = d3.select(parent)
      .append('div')
      .classed('filter', true)
      .classed('invisibleClass', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    localforage.getItem('data').then((value) => {
      this.build(value);
      this.attachListener(value);
    });

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build(json) {
    this.$node.html(`
      <div class='container'>
        <div class='row'>
          <div class='col-md-2'>
          </div>
          <div class='col-md-2'>
            <h4>Top Filter</h4>
          </div>
          <div class='col-md-2'>
            <h4>Paragraph Filter</h4>
          </div>
          <div class='col-md-4'>
            <h4>Quartal Filter</h4>
          </div>
        </div>

        <div class='row'>
        <div class='col-md-2'>
          <button type='button' id='backBtn' class='btn btn-sm btn-secondary'>
            <i class='fa fa-hand-o-left'>&nbsp;</i>Back</button>
        </div>
          <div class='col-md-2'>
            <select class='form-control' id='topFilter'>
              <option value='-1' selected>disabled</option>
              <option value='0'>Bottom 10</option>
              <option value='1'>Top 10</option>
            </select>
          </div>
          <div class='col-md-2'>
            <select class='form-control' id='paragraph'>
              <option value='-1' selected>disabled</option>
            </select>
          </div>
          <div class='col-md-2 col-md-offset-1'>
          <div style="width: 100px;">
            <input id='timeSlider'/>
          </div>
          </div>
        </div>
    `);

    this.setQuarterFilterRange(json);
    this.setParagraphFilterElements(json);
  }

  /**
   * Attach the event listeners
   */
  private attachListener(json) {
    //Listener for the Back Button
    this.$node.select('#backBtn')
      .on('click', (e) => {
        bootbox.confirm({
          className: 'dialogBox',
          title: 'Information',
          message: `Upon hitting the <strong>OK</strong> button, you will be redirected to the data upload page.<br/>
          <strong>NOTE:</strong> This will reload the page and the previous data will be lost!!<br/><br/>
          Be sure you don't lose anything important or save your progress before you proceed.`,
          callback: function(result) {
            if (result) {
              //Clear both storage facilities
              localStorage.clear();
              localforage.clear();
              //Force reload and loose all data
              location.reload(true);
            } else {
              return;
            }
          }
        });

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    events.on(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, (evt, data) => {
      this.topFilter.active = false;
      $('#topFilter').val(-1);
    });


    this.$node.select('#topFilter').on('change', (d) => {
      let value:number = $('#topFilter').val() as number;

      if(value == 0)
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(false);
      }
      else if(value == 1)
      {
        this.topFilter.active = true;
        this.topFilter.changeFilterTop(true);
      }
      else {
        this.topFilter.active = false;
      }
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });

    this.$node.select('#paragraph').on('change', (d) => {
      let value:number = $('#paragraph').val() as number;
      if(value < 0)
      {
        this.paragraphFilter.active = false;
      }

      else {
        this.paragraphFilter.active = true;
        this.paragraphFilter.value = value;
      }
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, json);
    });
  }

  private setParagraphFilterElements(json)
  {
    let paragraphs:Array<number> = [];

    for(let entry of json)
    {
      let val:number = entry.attribute1;
      if(paragraphs.indexOf(val) === -1)
      {
        paragraphs.push(val);
        this.$node.select('#paragraph').append('option').attr('value',val).text(val);
      }
    }
  }

  private setQuarterFilterRange(json)
  {
    const splitAt = index => it =>
      [it.slice(0, index), it.slice(index)];
    let min:number = json[0].timeNode;
    let max:number = json[0].timeNode;
    for(let entry of json)
    {
      if(entry.timeNode < min)
        min = entry.timeNode;

      if(entry.timeNode > max)
        max = entry.timeNode;
    }

    this.quarterFilter.changeRange(min, min);

    $('#timeSlider').bootstrapSlider({
      min: Number(min),
      max: Number(max),
      range: true,
      tooltip_split: true,
      tooltip_position: 'bottom',
      value: [Number(min), Number(min)],
    }).on('slideStop', (d) => {
      let newMin: number = d.value[0];     //First value is left slider handle;
      let newMax: number = d.value[1];     //Second value is right slider handle;
      this.quarterFilter.minValue = newMin;
      this.quarterFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, json);
    });
  }
}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new FilterData(parent, options);
}
