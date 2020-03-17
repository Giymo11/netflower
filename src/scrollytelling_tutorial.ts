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

class ScrollytellingTutorial implements MAppViews {

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('scrollytelling_tutorial', true);
  }

  init(): Promise<MAppViews> {
    this.build();
    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  private build() {
    this.$node.html(`
    <div class="scrollytelling_tutorial-hider"></div>
      <div>
        <h3 id="about">
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

      <div>
        <h3 id="loading">
          Loading Data
        </h3>

        <p>
          This tool requires a specific format for the tables in order to
          visualize them appropriately. Also only <b>.CSV</b> files are
          accepted. If the required format isn't met, it will result in errors
          or no displayed data. The format of the table headings defines all
          further views but needs to be in a specific order.
        </p>
      </div>

      <div>
        <ol start="1">
          <li>
            Prepare your data file as a .csv file with the structure shown in
            the table.
          </li>
        </ol>
      </div>
      <img
        src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2Fnetflower_01_table.jpg?v=1578395805078"
      />

      <div>
        <ol start="2">
          <li>Load your data here and click 'Load & Show'.</li>
        </ol>
      </div>
      <img
        src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2Fnetflower_01_load.jpg?v=1578397613789"
      />

      <div>
        <ol start="3">
          <li>Here you can download some sample files.</li>
        </ol>
      </div>
      <img
        src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2Fnetflower_01_sample.jpg?v=1578397817941"
      />

      <div>
        <p>
          The data you load will only be stored locally on your computer. When
          you close the browser, the data is retained. When the computer is
          restarted or you upload new data, the data and exploration steps are
          lost.
        </p>
      </div>

      <div>
        <h3 id="reading">
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
      <img class="chart" src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2F02_sankey.png?v=1579238348463">


      <div>
        <ol start="2">
          <li>
            The small bar charts left and right show the amount of asylum
            applications over time from the original country and destination
            country point of view.
          </li>
        </ol>
      </div>
      <img class="chart" src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2F02_small_bars.png?v=1579238731176">

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
      <div>
        <p>
          <b>Detailed view</b>: By clicking on one connection line in the sankey
          diagram, you get a detail view showing the amount of asylum
          applications between the two nodes (origin countries and destination
          countries).
        </p>
      </div>
      <img class="chart" src="https://cdn.glitch.com/c7f79333-d81b-4410-afb5-7bfda6c6ddea%2F02_detail.png?v=1579249450573">

      <div>
        <p>
          The screen picture shows the <b>visual encoding</b>. There is this
          example table of asylum data. The lines from the table to the sankey
          diagram show the encoding from the data to the visual element - in
          this case a sankey diagram.
        </p>
      </div>

      <div>
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
      <div>
        <ol start="2">
          <li>
            You can sort the data by source, target and flow and order it,
            ascending and descending.
          </li>
        </ol>
      </div>
      <div>
        <ol start="3">
          <li>
            Exporting the data from the current view. You get a .csv file with
            the data of the current visualization, including all sorting and
            filtering operations.
          </li>
        </ol>
      </div>
      <div>
        <ol start="4">
          <li>
            You can limit the number of asylum applications by using the slider
            on both sides.
          </li>
        </ol>
      </div>
      <div>
        <ol start="5">
          <li>
            Search for a particular country in the origin and also in the
            destination countries using the seach box.
          </li>
        </ol>
      </div>

      <div>
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
      <div>
        <ol start="2">
          <li>
            You can add tags by clicking the tags-sign next to the nodes in the
            sankey diagram.
          </li>
        </ol>
      </div>
      <div>
        <ol start="3">
          <li>
            You can filter by tags by clicking the small button below the search
            either on the left and right side.
          </li>
        </ol>
      </div>
      <div>
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
      </div>`
    );
  }

  /**
   * Attach the event listeners
   */
  // tslint:disable-next-line:no-empty
  private attachListener() {

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

