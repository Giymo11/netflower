/**
 * Created by Benjamin Potzmann on 07.03.20.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import * as d3_save_svg from 'd3-save-svg';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';

import 'waypoints/lib/noframework.waypoints.js';

import {debounce} from 'ts-debounce';

export class ScrollytellingConstants {
  static ABOUT = 'scrollytelling_waypoint-about';
  static VIS_MAIN = 'scrollytelling_waypoint-vis-main';
  static VIS_CHART = 'scrollytelling_waypoint-vis-chart';
  static VIS_LOAD = 'scrollytelling-waypoint-vis-load';
  static VIS_DETAIL = 'scrollytelling_waypoint-vis-detail';
  static VIS_ENCODING = 'scrollytelling_waypoint-vis-encoding';
  static FILTER_TIME = 'scrollytelling_waypoint-filter-time';
  static FILTER_SORT = 'scrollytelling_waypoint-filter-sort';
  static FILTER_EXPORT = 'scrollytelling_waypoint-filter-export';
  static FILTER_LIMIT = 'scrollytelling_waypoint-filter-limit';
  static FILTER_SEARCH = 'scrollytelling_waypoint-filter-search';
  static TAG_DATA = 'scrollytelling_waypoint-tag-data';
  static TAG_ADD = 'scrollytelling_waypoint-tag-add';
  static TAG_FILTER = 'scrollytelling_waypoint-tag-filter';
  static TAG_FLOW = 'scrollytelling_waypoint-tag-flow';
  static VIS_SIDES = 'scrollytelling_waypoint-vis-sides';
  static VIS_HOVER = 'scrollytelling_waypoint-vis-hover';
  static TAGS = 'scrollytelling_waypoint-tags';
}

class ScrollytellingTutorial implements MAppViews {

  private $node;
  private waypoints: Array<Element>;
  private indicator;
  private currentOverlap;
  private viewsToHide = [
    '',
    '',
    '.left_bars, .right_bars',
    '.barchart',
    '',
    '.load_more',
    '.tooltip2',
    '',
    '.sankey_features-filter-time',
    '.sankey_features-filter-sort',
    '.sankey_features-filter-export',
    '.sankey_diagram-slider, .middle_bars',
    '.sankey_diagram-search',
    //'.manageEntityTag, .manageMediaTag',
    //'.sankey_diagram-tagfilter',
    //'.sankey_features-tag-flow',
    '.manageEntityTag, .manageMediaTag, .sankey_diagram-tagfilter, .sankey_features-tag-flow',
  ];
  private breakpoints = [
    ScrollytellingConstants.ABOUT,
    ScrollytellingConstants.VIS_MAIN,
    ScrollytellingConstants.VIS_SIDES,
    ScrollytellingConstants.VIS_CHART,
    ScrollytellingConstants.VIS_ENCODING,
    ScrollytellingConstants.VIS_LOAD,
    ScrollytellingConstants.VIS_HOVER,
    ScrollytellingConstants.VIS_DETAIL,
    ScrollytellingConstants.FILTER_TIME,
    ScrollytellingConstants.FILTER_SORT,
    ScrollytellingConstants.FILTER_EXPORT,
    ScrollytellingConstants.FILTER_LIMIT,
    ScrollytellingConstants.FILTER_SEARCH,
    //ScrollytellingConstants.TAG_ADD,
    //ScrollytellingConstants.TAG_FILTER,
    //ScrollytellingConstants.TAG_FLOW,
    ScrollytellingConstants.TAGS,
  ];

  private exitedTutorial: Boolean = false;


  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('scrollytelling_tutorial', true);
  }

  init(): Promise<MAppViews> {
    const that = this;
    localforage.getItem('scrollytelling_exited-tutorial').then((exitedTutorial) => {

      $(document).on('scroll', function () {
        debounce(that.updateViewForCurrentProgress.bind(that), 80)();
      });

      this.exitedTutorial = exitedTutorial as Boolean;
      this.updateTutorialEnabled();
      this.hideAllViews();

      this.updateViewForCurrentProgress();
    });

    events.on(AppConstants.EVENT_EXIT_TURORIAL, (evt, data) => {
      this.exitedTutorial = !this.exitedTutorial;
      this.updateTutorialEnabled();
      window.scroll({
        top: 0,
        left: 0
      });
      localforage.setItem('scrollytelling_exited-tutorial', this.exitedTutorial);
    });

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  private updateTutorialEnabled() {
    this.build();

    if (this.exitedTutorial) {
      $('.scrollytelling-tutorial').removeClass('scrollytelling-tutorial');
      $('.scrollytelling_tutorial').addClass('scrollytelling-disabled');
      $('.scrollytelling_tutorial-hider').addClass('scrollytelling-disabled');
      $('#scrollytelling_indicator').addClass('scrollytelling-disabled');
      $('#loadMoreBtn').attr('disabled', null);
      // $('.sankey_features').addClass('scrollytelling-tutorial');

      (<any>$('.scrollytelling_tutorial')).BootSideMenu({
        side: 'right',
        autoClose: false
      });

      $(document).on('click', '.scrollytelling_tutorial .toggler', function () {
        const toggler = $(this);
        const container = toggler.parent();
        let status = container.attr('data-status');
        if (!status) {
          status = 'opened';
        }
        if (status === 'opened') {
          $('.sankey_diagram').removeClass('fullscreen');
          events.fire(AppConstants.EVENT_RESIZE_WINDOW);
        } else {
          $('.sankey_diagram').addClass('fullscreen');
          events.fire(AppConstants.EVENT_RESIZE_WINDOW);
        }
      });

    } else {
      $('.sankey_features').addClass('scrollytelling-tutorial');
      $('.sankey_diagram').addClass('scrollytelling-tutorial');
      $('.sankey_details').addClass('scrollytelling-tutorial');
      $('.sankey_details2').addClass('scrollytelling-tutorial');
      $('.scrollytelling_tutorial').addClass('scrollytelling-tutorial');
      $('.scrollytelling-disabled').removeClass('scrollytelling-disabled');
      $('#loadMoreBtn').attr('disabled', 'disabled');
    }

    this.attachListener();
    this.waypoints = Array.from(document.querySelectorAll('.scrollytelling_waypoint'));
    this.indicator = document.querySelector('#scrollytelling_indicator');

    this.updateViewForCurrentProgress();
  }

  private overlap(elem1: Element, elem2: Element): boolean {
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();

    return !(rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom);
  }

  private hideAllViews() {
    for (const selector of this.viewsToHide) {
      $(selector).addClass('scrollytelling-hidden');
    }
  }

  private showViewsUntil(waypoint: Element) {
    for (let i = 0; i < this.viewsToHide.length; ++i) {
      $(this.viewsToHide[i]).removeClass('scrollytelling-hidden');
      if (this.breakpoints[i] === waypoint.id) {
        $(this.viewsToHide[i]).addClass('scrollytelling-highlighted');
        this.handleSpecialCasesFor(waypoint);
        break;
      }
    }
  }

  private handleSpecialCasesFor(waypoint: Element) {
    if (waypoint.id === ScrollytellingConstants.VIS_MAIN) {
      $('#sankeyDiagram').addClass('scrollytelling-highlighted');
    }
    if (waypoint.id === ScrollytellingConstants.VIS_HOVER && this.currentOverlap === ScrollytellingConstants.VIS_DETAIL) {
      events.fire(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, {});
    }
    if (waypoint.id === ScrollytellingConstants.VIS_DETAIL && this.currentOverlap === ScrollytellingConstants.VIS_HOVER) {
      document.querySelector('#sankeyDiagram path.link')
        .dispatchEvent(new MouseEvent('show', {clientX: 200, clientY: 200}));
    }
    if (waypoint.id === ScrollytellingConstants.FILTER_TIME && this.currentOverlap === ScrollytellingConstants.VIS_DETAIL) {
      events.fire(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, {});
    }

    //TODO: Auto-hide
    if (waypoint.id === ScrollytellingConstants.VIS_ENCODING) {
      events.fire(AppConstants.EVENT_REQUEST_CURRENT_DATA);
      $('.encodingView').removeClass('encoding-disabled');
    } else {
      $('.encodingView').addClass('encoding-disabled');
    }
  }

  private updateViewForCurrentProgress() {

    $('.scrollytelling-highlighted').removeClass('scrollytelling-highlighted');

    if (this.exitedTutorial) {
      for (const view of this.viewsToHide) {
        $(view).removeClass('scrollytelling-hidden');
      }
    } else if (this.waypoints) {
      for (const waypoint of this.waypoints) {

        if (this.overlap(this.indicator, waypoint)) {
          waypoint.classList.add('scrollytelling-highlighted');
          this.hideAllViews();
          this.showViewsUntil(waypoint);

          this.currentOverlap = waypoint.id;
          break;
        }
      }
    }
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    const that = this;
    this.$node.select('#btnExitTutorial').on('click', (d) => {
      events.fire(AppConstants.EVENT_EXIT_TURORIAL, d, null);
    });
  }


  private build() {
    this.$node.html(`
      <div class="scrollytelling_container">
      <div class="scrollytelling_tutorial-hider"></div>
      <div id="scrollytelling_indicator">
        <svg class="bi bi-chevron-compact-right" width="4em" height="4em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M6.776 1.553a.5.5 0 01.671.223l3 6a.5.5 0 010 .448l-3 6a.5.5 0 11-.894-.448L9.44 8 6.553 2.224a.5.5 0 01.223-.671z" clip-rule="evenodd"/>
        </svg>
      </div>

      <div class="scrollytelling_spacer"></div>

      <div id="scrollytelling-introduction" class="scrollytelling-tutorial">
        <p>
          This tutorial uses scrollytelling, meaning that new things appear when you scroll.
          The visualisation itself will not be scrollable until you arrive at the bottom of the tutorial and switch to normal scrolling via the button "Toggle Tutorial".
        </p>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.ABOUT}">
        <h3>About</h3>
        <p>
          Netflower is developed to explore <b>large bipartite network data</b>.
          The tool supports you <b>finding interesting aspects</b> in the data.
          You cannot directly create visualizations out of it, but you can <b>export the data based on your exploration state</b>.
        </p>
        <p>
          Netflower is a tool for <b>visual exploration</b> of flows in <b>dynamic networks</b>, such as money flows between organizations or migration flows between countries.
          It is a highly interactive web application particularly developed for <b>investigative data journalism</b>.
        </p>
      </div>


      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_MAIN}">
        <h3>Read the Visualization</h3>
        <p>The main visualization is a <b>Sankey diagram</b>.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_SIDES}">
        <p>You read the Sankey diagram from <b>left to right</b>. The <b>left side</b> shows the <b>origin</b> and on the <b>right</b> are the <b>destinations</b>.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_CHART}">
        <p>The small <b>bar charts</b> left and right show the <b>amount over time</b>, from the point of view of the source and the target.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_ENCODING}">
        <p>The picture shows the <b>visual encoding</b>. The lines from the table to the Sankey diagram show the encoding from the data to the visual element - in this case a Sankey diagram.</p>
      </div>


      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_LOAD}">
        <h3>Interact with the visualization</h3>
        <p>You can use the buttons 'Show Less' and 'Show More' to load more or less nodes.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_HOVER}">
        <p>When you hover over the nodes (rectangles) in the visualization you get the information of the number of outgoing data.</p>
        <p>You also see that maybe not all data is visible by the hatching rectangle.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_DETAIL}">
        <p>By clicking on one connection line in the Sankey diagram, you get a detail view showing the amount between the two nodes (origin and destination).</p>
      </div>


      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_TIME}">
        <h3 id="filtering">Filtering, Sorting, Ordering</h3>
        <p>You can filter the data in <b>time</b> and <b>connection</b>.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_SORT}">
        <p>You can <b>sort</b> the <b>data</b> by <b>source</b>, <b>target</b> and <b>flow</b> and order it, <b>ascending</b> and <b>descending</b>.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_EXPORT}">
        <p><b>Exporting</b> the data from the current view. You get a .csv file with the data of the current visualization, including all sorting and filtering operations.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_LIMIT}">
        <p>You can set limits by using the <b>sliders</b> on both sides.</p>
      </div>
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_SEARCH}">
        <p><b>Search</b> for a node in the origin and also in the destination using the search box.</p>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.TAGS}">
        <p>There is additional functionality (the ability to add tags, a notebook) which is not discussed here.</p>
      </div>



      <div>
        <button id="btnExitTutorial" class="btn btn-default btn_design scrollytelling_exit-button">Toggle Tutorial</button>
      </div>

      <div class="scrollytelling_spacer"></div>
      <div class="scrollytelling_spacer"></div>
    </div>`
    );
  }
}

/**
 * Factory method to create a new ScrollytellingTutorial instance
 * @param parent
 * @param options
 * @returns {ScrollytellingTutorial}
 */
export function create(parent: Element, options: any) {
  return new ScrollytellingTutorial(parent, options);
}

