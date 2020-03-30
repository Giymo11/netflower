/**
 * Created by cniederer on 21.04.17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import * as d3_save_svg from 'd3-save-svg';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';

class SankeyFeatures implements MAppViews {

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('sankey_features', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    this.build();
    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$node.html(`
      <div class='container-fluid'>
      	<div class='row'>
      	  <!--First section on the left with filters-->
      		<div class='col-md-5 sankey_features-filter-time'>
            <div class='row'>
              <div class='col-sm-2'>
                <h5>Filter</h5>
              </div>
              <div class='col-sm-4' style='margin-top: 7px;'>
                <button id='clearAllBtn' class='label'
                  style='background: #45B07C; font-weight: normal;'><i class='fa fa-times'></i> Clear All</button>
              </div>
              <div class='col-sm-4 sankey_features-tag-flow'>
                <h5>View Flow between:</h5>
              </div>
            </div>
      			<div class='row'>
              <div class='col-md-2'>
                <button id='btnTimeDialog' class='btn btn-default btn_design'>Time</button>
              </div>
              <div class='col-md-4'>
                  <div class='btn-group'>
                    <button id='btnAttributeDialog' class='btn btn-default btn_design'>Connection Filter</button>
                  </div>
                </div>
                <div class='col-md-4 sankey_features-tag-flow'>
                  <select class='form-control input-sm' id='tagFlowFilter'>
                     <option value='-1' selected>nodes</option>
                     <option value='1'>tags</option>
                  </select>
                </div>
      			</div>
      			<div class='row'>
      			<p>
      				<div class='col-md-3'>
      					 <span id='currentTimeInfo' class='label label-default' style='background: #45B07C'>Nothing</span>
      				</div>
      			</p>
      			</div>
      		</div>

      		<!--Second section with the sort options in hte middle-->
      		<div class='col-md-3 sankey_features-filter-sort'>
      		  <div class='row'>
      		    <div class='col-sm-5'>
      		      <h5>Sort & Order</h5>
              </div>
            </div>
      		  <div class='row' style='margin-bottom: 5px;'>
      		    <div class='col-sm-3'>
      		      <label style='margin-top: 5px;'>Sort by:</label>
      		    </div>
      		    <div class='col-sm-6' id='sortBySelector'></div>
            </div>
            <div class='row'>
              <div class='col-sm-3'>
      		      <label style='margin-top: 5px;'>Order:</label>
      		    </div>
      		    <div class='col-sm-6' id='orderBySelector'></div>
            </div>
          </div>

          <!--Export Settings-->
          <div class='col-md-2 sankey_features-filter-export'>
            <h5>Miscellaneous</h5>
            <button type='button' class='btn btn-default btn_design' id='exportData'>
              Export Data
            </button>
            <div class='custom-control custom-checkbox' style='margin-top: 4px;'>
              <input type='checkbox' class='custom-control-input' id='exportCheckbox'>
              <label class='custom-control-label' for='exportCheckbox'>Only Visible Elements</label>
            </div>
          </div>

          <!--Global Filters-->
          <div class='col-md-2 sankey_features-filter-export'>
            <h5>Download SVG</h5>
             <button id='getSVGBtn' type='button' class='btn btn-default btn_design'>Get SVG</button>
             <p><small>Note: Only visible flows will be exported.</small></p>
          </div>
      	</div>
      </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.$node.select('#clearAllBtn').on('click', (d) => {
      events.fire(AppConstants.EVENT_CLEAR_FILTERS, d, null);
    });

    this.$node.select('#getSVGBtn').on('click', (d) => {
      const chart = d3.select('#sankeyDiagram > svg');
      const date = new Date();
      const config = {
        filename: 'sankeyFlow ' + date.toDateString(),
      };
      d3_save_svg.save(chart.node(), config);
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
  return new SankeyFeatures(parent, options);
}
