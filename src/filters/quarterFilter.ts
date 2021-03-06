import Filter from './filter';

/**
 * This class is used to describe a filter by the time aspect of the data.
 */
export default class QuarterFilter implements Filter
{
  private resultData: Array<any>;

  private _minValue: number;
  private _maxValue: number;

  constructor()
  {
    this.resultData = new Array<any>();
  }

  get minValue():number
  {
    return this._minValue;
  }

  set minValue(min:number)
  {
    this._minValue = min;
  }

  get maxValue():number
  {
    return this._maxValue;
  }

  set maxValue(max:number)
  {
    this._maxValue = max;
  }

  public changeRange(minValue: number, maxValue: number)
  {
    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  /**
   * This checks if the value is in the given range.
   * @param data to perform the check on.
   * @returns {Array<any>} the filtered data by the given criteria.
   */
  public meetCriteria(data: any): any
  {
    this.resultData = new Array<any>();

    for (let entry of data)
    {
      let quarter:number = entry.timeNode;

      if (quarter >= this.minValue && quarter <= this.maxValue)
      {
        this.resultData.push(entry);
      }
    }

    return this.resultData;
  }

  public printData(): void
  {
    console.log('Quarter Filter: ' + this.minValue + ' / ' + this.maxValue);
  }
}
