/**
 * Created by Florian on 12.04.2017.
 */

/**
 * This class is used to define all constants across the application. Use it for
 * event tags or constant names, that shouldn't change across the whole system.
 */
export class AppConstants {

  static VIEW = 'validView';

  static EVENT_RESIZE_WINDOW = 'resizeWindow';

  static EVENT_DATA_PARSED = 'eventDataParsed';

  static EVENT_CLICKED_PATH = 'eventClickPath';

  static EVENT_CLOSE_DETAIL_SANKEY = 'closeSankeyDetails';

  static EVENT_FILTER_CHANGED = 'eventFilterChanged';

  static EVENT_FILTER_DEACTIVATE_TOP_FILTER = 'eventFilterDeactivateTopFilter';

  static EVENT_FILTER_DEACTIVATE_TAG_FLOW_FILTER = 'eventFilterDeactiveTagFlowFilter';

  static EVENT_SLIDER_CHANGE = 'eventSliderChange';

  static EVENT_UI_COMPLETE = 'eventUIComplete';

  static EVENT_CLEAR_FILTERS = 'eventClearFilters';

  static EVENT_TIME_VALUES = 'eventTimeValues';

  static EVENT_SORT_CHANGE = 'eventSortChange';

  static EVENT_SANKEY_SORT_BEHAVIOR = 'eventSankeySortBehavior';

  static EVENT_SHRINK_CHANGE = 'eventShrinkChange';

  static SANKEY_TOP_MARGIN = 10;
  static SANKEY_NODE_PADDING = 20;

  static EVENT_SHOW_DETAIL_SANKEY = 'eventShowDetailSankey';

  static EVENT_EXIT_TURORIAL = 'eventExitScrollytellingTutorial';

  static EVENT_REQUEST_CURRENT_DATA = 'eventRequestCurrentData';
  static EVENT_RESPONSE_CURRENT_DATA = 'eventResponseCurrentData;'
}
