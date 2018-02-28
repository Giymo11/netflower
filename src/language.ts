/**
 * Created by Florian Grassinger on Mon, 10 Apr 2017 08:54:58 GMT.
 *
 * Add your constants here or Strings in order to make it possible for future distributions to change the language.
 * If all strings and texts are written in constants it's easier to change the language depending on the region settings.
 */
import {AppConstants} from './app_constants';

export const APP_NAME = 'Valid';
export const HELLO_WORLD = 'Hello World this is VALID... or will be...';

export const ERROR_TOOMANYNODES = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font>
has too many nodes to display for the visual space. <br/> Please press the <strong>Show More</strong>
utton at the end of the sankey diagram.<br/>This will create more visual space for the nodes in order to be loaded.
<br/><br/><strong>Reapeat if still not shown!</strong>`;

export const ERROR_TOOMANYFILTER = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font> settings are
too restrictive. There is <strong>NO DATA</strong> to show!<br/>Please change your filter settings in order to show
data on the visualization.`;

export const USAGE_INFO = `<strong><h3>Data format:</h3></strong><br/>
This tool requires a specific format for the tables in order to visualize them appropriate. Also <strong>.CSV</strong> are
only accepted. If the required format isn't met, it will result in erros or no displayed data. The format of the
table headings defines all further views but needs to be in a specific order:`;

export const BACK_INFO = `Upon hitting the <strong>OK</strong> button, you will be redirected to the data load page.<br/>
<strong>NOTE:</strong> This will reload the page and the previous data will be lost!!<br/><br/>
Be sure you don't lose anything important or save your progress before you proceed.`;

export const TIME_INFO = `Select here the time range of the visualization. You have various controls avaialbe for the selection.
The controls are listed on the right near the box. Inide the box are Quarters which you can choose. Below
you will see your current selection. After you finished, hit the <strong>Submit</strong> button in order
to change the visualization.`;

export const ATTR_INFO = `Select here the attributes you want to filter for on the current visualization. The attributes
are read from your imported .csv file. If you see no checkboxes here, you probably have no attributes defined.`;

export const LOG_INFO = `Here you are able to export the logs of the whole system. This is mainly for testing and evaluation
purposes. However, the application tracks your actions and the state of the visualization the whole time. By clicking on the
button a <strong>Log File</strong> will be created that is saved locally on your machine.`;

export const NO_TIME_POINTS = `<span class='label label-warning' style='font-weight: normal;'>Warning</span>
You have no time points selected! <br/> In order to prevent the application from showing nothing or unwanted results,
the last defined time points were choosen.`;

export const DOWNLOAD_INFO = `The <strong>button</strong> below let's you download a sample dataset for the application.
It contains numerous media transperency data rows who are already in the right format and with meaningful headings.`;

export const DOWNLOAD_DIALOG = `You can download the following sample files by klicking on their name:
<br/>
<table class='downloadTable'>
	<tbody>
	<tr>
		<td class='leftTD'><strong>Simple Example</strong><br/>
        A simple example file with only a few entries.
    </td>
		<td class='rightTD'><a href=${AppConstants.FILE4} download=''>Download Data (.csv)</a></td>
	</tr>
	<tr>
	  <td class='leftTD'><strong>Media Transparency Data</strong><br/>
      Austrian governmental organizations are legally required to report the money flow for advertisement
      and media sponsoring, which are collectively published as open government data on media transparency.
      <a target='_blank' href='https://www.rtr.at/de/m/Medientransparenz'>Source</a>
    </td>
		<td class='rightTD'><a href=${AppConstants.MEDIA_FILE}>Download Data (.csv)</a></td>
	</tr>
	<tr>
		<td class='leftTD'><strong>Asylum Data</strong><br/>
        The data presents information about asylum applications lodged in 38 European and 6 non-European
        countries. Data are broken down by month and origin.
        <a target='_blank' href='http://popstats.unhcr.org/en/overview'>Source</a>
    </td>
		<td class='rightTD'><a href=${AppConstants.ASYLUM_FILE}>Download Data (.csv)</a></td>
	</tr>
	<tr>
		<td class='leftTD'><strong>Farm subsidies data</strong><br/>
       The data includes farm subsidy payments made in Austria as published directly by the government
       of Austria or sourced via freedom of information requests.
       <a target='_blank' href='https://www.ama.at/Fachliche-Informationen/Transparenzdatenbank'>Source</a>
    </td>
		<td class='rightTD'><a href=${AppConstants.FARM_FILE}>Download Data (.csv)</a></td>
	</tr>
	</tbody>
</table>`;
