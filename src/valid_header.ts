/**
 * Created by cniederer on 18.04.17.
 */


import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import {MAppViews} from './app';
import SimpleLogging from './simpleLogging';
import {d3TextEllipse} from './utilities';
import {BACK_INFO} from './language';

class ValidHeader implements MAppViews {

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select('#validHeader');
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<ValidHeader>}
   */
  init() {
    this.build();
    this.attachListener();
    this.shrinkHeader();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build() {
    let fileName: any = localStorage.getItem('fileName');
    if (fileName === '' || fileName === null) {
      fileName = 'No File Name';
    }

    this.$node.html(`
    <div class='logo'>NETFLOWER</div>   
    <div class='btn_preupload'>
    <span id='backBtn'><i class='fa fa-folder-open-o fa-2x'></i>
     <span id='textBackBtn'>${fileName.replace('.csv', '')}</span>
    </span>
    </div>
    <div class='valid_logo'></div>
    <div id='socialMedia'>    
        <p><a href='https://twitter.com/valid_at' target ='blank'><i class='fa fa-twitter-square fa-2x' id='web' ></i></a> </p>
        <p><a href='https://github.com/VALIDproject' target='blank'> <i class='fa fa-github fa-2x' id='web'></i></a> </p>
        <p><a href='http://www.validproject.at/' target ='blank'><i class='fa fa-globe fa-2x' id='web'></i></a></p>
    </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // Listener for the Back Button
    this.$node.select('#backBtn')
      .on('click', (e) => {
        SimpleLogging.log('reupload data clicked', '');
        bootbox.confirm({
          className: 'dialogBox',
          title: 'Information',
          message: `${BACK_INFO}`,
          callback(result) {
            if (result) {
              SimpleLogging.log('reupload data confirmed', '');
              // Clear both storage facilities
              localStorage.removeItem('dataLoaded');
              localStorage.removeItem('columnLabels');
              SimpleLogging.trimLogFile();
              localforage.clear();
              // Remove all elements that get not created from the DOM
              d3.select('.dataVizView').selectAll('*').remove();
              // Force reload and loose all data
              location.reload(true);
            } else {
              SimpleLogging.log('reupload data aborted', '');
              return;
            }
          }
        });

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });
  }

  private shrinkHeader(): void {
    $(document).on('scroll', function(){
      if ($(document).scrollTop() > 100) {
        $('.logo').addClass('shrink');
        $('#validHeader').addClass('shrink');
        $('#socialMedia').addClass('shrink');
        $('.valid_logo').addClass('shrink');
        $('.btn_preupload i').removeClass('fa fa-folder-open-o fa-2x');
        $('.btn_preupload i').addClass('fa fa-folder-open-o');
        $('.btn_preupload').attr('style', 'margin-top: 3px;');
        $('#textBackBtn').attr('style', 'margin-top: 0px;');
      } else {
        $('.logo').removeClass('shrink');
        $('#validHeader').removeClass('shrink');
        $('#socialMedia').removeClass('shrink');
        $('.valid_logo').removeClass('shrink');
        $('.btn_preupload i').removeClass('fa fa-folder-open-o');
        $('.btn_preupload i').addClass('fa fa-folder-open-o fa-2x');
        $('.btn_preupload').attr('style', 'margin-top: 7px;');
        $('#textBackBtn').attr('style', 'margin-top: 6px;');
      }
    });
  }
}

/**
 * Factory method to create a new ValidHeader instance
 * @param parent
 * @param options
 * @returns {ValidHeader}
 */
export function create(parent: Element, options: any) {
  return new ValidHeader(parent, options);
}
