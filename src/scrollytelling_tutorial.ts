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
  static VIS_DETAIL = 'scrollytelling_waypoint-vis-detail';
  static FILTER_TIME = 'scrollytelling_waypoint-filter-time';
  static FILTER_SORT = 'scrollytelling_waypoint-filter-sort';
  static FILTER_EXPORT = 'scrollytelling_waypoint-filter-export';
  static FILTER_LIMIT = 'scrollytelling_waypoint-filter-limit';
  static FILTER_SEARCH = 'scrollytelling_waypoint-filter-search';
  static TAG_DATA = 'scrollytelling_waypoint-tag-data';
  static TAG_ADD = 'scrollytelling_waypoint-tag-add';
  static TAG_FILTER = 'scrollytelling_waypoint-tag-filter';
  static TAG_FLOW = 'scrollytelling_waypoint-tag-flow';
}

class ScrollytellingTutorial implements MAppViews {

  private $node;
  private waypoints: Array<Element>;
  private indicator;
  private currentOverlap;
  private viewsToHide = [
    '',
    '.left_bars, .right_bars',
    '.tooltip2',
    '',
    '.sankey_features-filter-time',
    '.sankey_features-filter-sort',
    '.sankey_features-filter-export',
    '.sankey_diagram-slider, .middle_bars',
    '.sankey_diagram-search',
    '',
    '.manageEntityTag, .manageMediaTag',
    '.sankey_diagram-tagfilter',
    '.sankey_features-tag-flow',
  ];
  private breakpoints = [
    ScrollytellingConstants.ABOUT,
    ScrollytellingConstants.VIS_MAIN,
    ScrollytellingConstants.VIS_CHART,
    ScrollytellingConstants.VIS_DETAIL,
    ScrollytellingConstants.FILTER_TIME,
    ScrollytellingConstants.FILTER_SORT,
    ScrollytellingConstants.FILTER_EXPORT,
    ScrollytellingConstants.FILTER_LIMIT,
    ScrollytellingConstants.FILTER_SEARCH,
    ScrollytellingConstants.TAG_DATA,
    ScrollytellingConstants.TAG_ADD,
    ScrollytellingConstants.TAG_FILTER,
    ScrollytellingConstants.TAG_FLOW,
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
      this.build();
      this.attachListener();
      this.exitedTutorial = exitedTutorial as Boolean;
      this.updateTutorialEnabled();
    });

    events.on(AppConstants.EVENT_UI_COMPLETE, (evt, data) => {
      this.hideView();

      this.waypoints = Array.from(document.querySelectorAll('.scrollytelling_waypoint'));
      this.indicator = document.querySelector('#scrollytelling_indicator');

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
    if (this.exitedTutorial) {
      $('.scrollytelling-tutorial').removeClass('scrollytelling-tutorial');
      $('.scrollytelling_container').addClass('scrollytelling-disabled');
      $('.scrollytelling_tutorial-hider').addClass('scrollytelling-disabled');
      // $('.sankey_features').addClass('scrollytelling-tutorial');
    } else {
      $('.sankey_features').addClass('scrollytelling-tutorial');
      $('.sankey_diagram').addClass('scrollytelling-tutorial');
      $('.sankey_details').addClass('scrollytelling-tutorial');
      $('.sankey_details2').addClass('scrollytelling-tutorial');
      $('.scrollytelling-disabled').removeClass('scrollytelling-disabled');
    }
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

  private hideView() {
    for (const selector of this.viewsToHide) {
      $(selector).addClass('scrollytelling-hidden');
    }
  }

  private updateViewForCurrentProgress() {
    if (this.exitedTutorial) {
      for (const view of this.viewsToHide) {
        $(view).removeClass('scrollytelling-hidden');
      }
    } else {
      for (const waypoint of this.waypoints) {
        if (this.overlap(this.indicator, waypoint)) {
          console.log(waypoint.id);
          this.hideView();
          for (let i = 0; i < this.viewsToHide.length; ++i) {
            $(this.viewsToHide[i]).removeClass('scrollytelling-hidden');
            if (this.breakpoints[i] === waypoint.id) {
              if (waypoint.id === ScrollytellingConstants.VIS_CHART && this.currentOverlap === ScrollytellingConstants.VIS_DETAIL) {
                events.fire(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, {});
              }
              if (waypoint.id === ScrollytellingConstants.VIS_DETAIL && this.currentOverlap === ScrollytellingConstants.VIS_CHART) {
                document.querySelector('#sankeyDiagram path.link')
                  .dispatchEvent(new MouseEvent('show', {clientX: 200, clientY: 200}));
              }
              if (waypoint.id === ScrollytellingConstants.FILTER_TIME && this.currentOverlap === ScrollytellingConstants.VIS_DETAIL) {
                events.fire(AppConstants.EVENT_CLOSE_DETAIL_SANKEY, {});
              }
              break;
            }
          }
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
    $(document).on('scroll', function () {
      debounce(that.updateViewForCurrentProgress.bind(that), 80)();
    });
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
      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.ABOUT}">
        <h3>
          About
        </h3>

        <p>
          Netflower is a tool for visual exploration of flows in dynamic
          networks, such as money flows between organizations or migration flows
          between countries. It is a highly interactive web application
          particularly developed for investigative data journalism.
        </p>
        <p>
          Netflower is developed to explore large bipartite network data. The
          tool supports you finding interesting aspects in the data. You cannot
          directly create visualizations out of it, but you can export the data
          based on your exploration state.
        </p>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_MAIN}">
        <h3>
          Read the Visualization
        </h3>
        <ol start="1">
          <li>
            The main visualization is a sankey diagram. You read the sankey
            diagram from left to right. In this example you see the number of
            Asylum seekers which make an application. The left side show the
            origin countries and on the right are the destination countries.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_CHART}">
        <ol start="2">
          <li>
            The small bar charts left and right show the amount of asylum
            applications over time from the original country and destination
            country point of view.
          </li>
        </ol>
      </div>

      <div>
        <p>
          On the bottom of the site, you find two buttons <b>'Show Less'</b> and
          <b>'Show More'</b>. Here you can load more nodes or show less nodes.
          When you hover over the nodes (rectangles) in the visualization you
          get the information of how many asylum applications were made from the
          selected country (node). You also see that maybe not all destination
          and origin countries are visible by the hatching rectangle. Here you
          can use the buttons below to load more origin and destination
          countries.
        </p>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.VIS_DETAIL}">
        <p>
          <b>Detailed view</b>: By clicking on one connection line in the sankey
          diagram, you get a detail view showing the amount of asylum
          applications between the two nodes (origin countries and destination
          countries).
        </p>
      </div>

      <div>
        <p>
          The screen picture shows the <b>visual encoding</b>. There is this
          example table of asylum data. The lines from the table to the sankey
          diagram show the encoding from the data to the visual element - in
          this case a sankey diagram.
        </p>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_TIME}">
        <h3 id="filtering">
          Filtering, Sorting, Ordering
        </h3>
        <p>
          You can filter, sort and order the data, which influences the
          visualization view.
        </p>
        <ol start="1">
          <li>
            You can filter the data in time and connection.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_SORT}">
        <ol start="2">
          <li>
            You can sort the data by source, target and flow and order it,
            ascending and descending.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_EXPORT}">
        <ol start="3">
          <li>
            Exporting the data from the current view. You get a .csv file with
            the data of the current visualization, including all sorting and
            filtering operations.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_LIMIT}">
        <ol start="4">
          <li>
            You can limit the number of asylum applications by using the slider
            on both sides.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.FILTER_SEARCH}">
        <ol start="5">
          <li>
            Search for a particular country in the origin and also in the
            destination countries using the seach box.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.TAG_DATA}">
        <h3 id="tags">
          Use Tags
        </h3>
        <p>
          You can use tags to organize and group nodes on the source or target
          side. You can add tags in the .csv file you will upload, or you can
          add tags directly in the visualization view.
        </p>
        <ol start="1">
          <li>
            Add tags in the .csv in the 'SourceTag' or 'TargetTag' row. By using
            the pipe sign '|' you can add more than one tag to a particular
            node.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.TAG_ADD}">
        <ol start="2">
          <li>
            You can add tags by clicking the tags-sign next to the nodes in the
            sankey diagram.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.TAG_FILTER}">
        <ol start="3">
          <li>
            You can filter by tags by clicking the small button below the search
            either on the left and right side.
          </li>
        </ol>
      </div>

      <div class="scrollytelling_waypoint" id="${ScrollytellingConstants.TAG_FLOW}">
        <ol start="4">
          <li>
            To see the flows between given tags you can switch the view in the
            header, as it is desribed in the video.
          </li>
        </ol>
      </div>

      <div>
        <ol start="5">
          <li>
            When you export the data, the tags, you have assigned in the
            visualization view, are also exported.
          </li>
        </ol>
      </div>

      <div>
        <h3 id="notebook">
          Notebook
        </h3>
        <p>
          You can use a notebook, which opens when clicking the handler on the
          left side of the screen. You can add some notes and also export it as
          a .txt. file. This file can be loaded in the notebook sidebar, when
          starting for example a new session analysing data with netflower.
        </p>
        <p>
          Please notice, that if you clean your browser forcefully or shut down
          your device, the data gets lost. However, if you referesh the page or
          go back to it if you closed the browser normally it will still be
          there!
        </p>
      </div>
      <div class="scrollytelling_spacer"></div>
        <div>
            <button id="btnExitTutorial" class="btn btn-default btn_design scrollytelling_exit-button">Toggle Tutorial</button>
        </div>
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

