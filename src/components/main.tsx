import React from 'react';
import { tqqq } from '../data/tqqq'

export interface HistoricalPrice {
  readonly symbol?: string;
  /** Formatted as YYYY-MM-DD */
  readonly date: string;
  /** Adjusted data for historical dates. Split adjusted only. */
  readonly high: number;
  /** Adjusted data for historical dates. Split adjusted only. */
  readonly low: number;
  /** Adjusted data for historical dates. Split adjusted only. */
  readonly volume: number;
  /** Adjusted data for historical dates. Split adjusted only. */
  readonly open: number;
  /** Adjusted data for historical dates. Split adjusted only. */
  readonly close: number;
  /** Unadjusted data for historical dates. */
  readonly uHigh: number;
  /** Unadjusted data for historical dates. */
  readonly uLow: number;
  /** Unadjusted data for historical dates. */
  readonly uVolume: number;
  /** Unadjusted data for historical dates. */
  readonly uOpen: number;
  /** Unadjusted data for historical dates. */
  readonly uClose: number;
  /** Percent change of each interval relative to first value. Useful for comparing multiple stocks. */
  readonly changeOverTime: number;
  /** A human readable format of the date depending on the range. */
  readonly label: string;
  /** Change from previous trading day. */
  readonly change: number;
  /** Change percent from previous trading day. */
  readonly changePercent: number;
}

export interface Portfolio {
  cash: number; // cash in usd
  stocks: number; // amount of stocks (TQQQ)
  lastPrice?: number; // last close price
  lastHigh?: number; // the highest price
  lastLow?: number; // the lowest price
  marketCap?: number; // all assets by actual price
  startAmount: number; // how much to invest in stocks at the start
  minStocks: number; // minimum amount of stocks in percent of marketCap
}

const start = 100;

function Simple() {
  const canByStocks = Math.ceil(10000 / tqqq[start].open);
  const lastPrice = tqqq[tqqq.length - 1].close;

  return (
    <pre>
      {`${canByStocks * lastPrice} with ${canByStocks} stocks`}
    </pre>
  )
}

export default function Main() {
  const state: Portfolio = {
    cash: 10000,
    stocks: 0,
    startAmount: 0.5,
    minStocks: 0.5
  }
  let log = ''
  let addLine = (line: any) => {
    log += line + '\n';
  }

  // addLine(tqqq[0].open);
  // addLine(tqqq[tqqq.length - 1].close);
  let i = start;

  let stocks = Math.ceil(5000 / tqqq[i].open);
  let cash = 10000 - stocks * tqqq[i].open;
  let maxPrice = tqqq[i].high;
  let minPrice = tqqq[i].low;
  let whenBuyingMaxPrice = tqqq[i].high;
  addLine(`Initial stocks: ${stocks}`);
  let amounts = {};
  const buythreshold: { [key: number]: number } = {
    1: 0.8,
    2: 0.7,
    3: 0.6,
    4: 0.5,
    5: 0.4,
    6: 0.35,
    7: 0.2,
  };
  let byingAmount: { [key: number]: number } = {
    1: 0.1,
    2: 0.15,
    3: 0.2,
    4: 0.33,
    5: 0.5,
    6: 0.8,
    7: 1,
  };
  let level = 1;
  const selltrashold: { [key: number]: number } = {
    1: 1.2,
    2: 1.12,
    3: 1.11,
    4: 1.1,
    5: 1,
    6: 0.9,
    7: 0.8,
  };
  let freeze = 0;
  let x = 0
  tqqq.forEach((quote: HistoricalPrice, i: number) => {
    // addLine(Date.parse(quote.date).toString());

    x += 1;
    if (x <= i) return;
    if (freeze > 0) freeze -= 1;

    if (quote.high > maxPrice) {
      maxPrice = quote.high;
    }

    let whenBuyPrice = maxPrice * buythreshold[level];

    if (quote.low < whenBuyPrice && cash > whenBuyPrice && level < 7) {
      const newAmount = Math.ceil(byingAmount[level] * cash / whenBuyPrice);
      stocks += newAmount;
      cash -= newAmount * whenBuyPrice;
      level += 1;
      addLine(level);
      // minPrice = whenBuyPrice;
      whenBuyingMaxPrice = maxPrice;
      // addLine(`Price ${quote.low} is lower then a trashold ${Math.round(whenBuyPrice)}, buy ${newAmount} stocks by price ${whenBuyPrice}`);
      // addLine(`Cash: ${Math.round(cash)}, stocks: ${stocks}, all: ${Math.round(quote.close * stocks + cash)}, level: ${level}`);
    }

    whenBuyPrice = maxPrice * buythreshold[level];
    // addLine(whenBuyPrice);

    if (quote.low < whenBuyPrice && cash > whenBuyPrice && level < 7) {
      const newAmount = Math.ceil(byingAmount[level] * cash / whenBuyPrice);
      stocks += newAmount;
      cash -= newAmount * whenBuyPrice;
      level += 1;
      addLine(level);
      // minPrice = quote.low;
      // minPrice = whenBuyPrice;
      whenBuyingMaxPrice = maxPrice;
      // addLine(`Price ${quote.low} is lower then a trashold ${Math.round(whenBuyPrice)}, buy ${newAmount} stocks by price ${whenBuyPrice}`);
      // addLine(`Cash: ${Math.round(cash)}, stocks: ${stocks}, all: ${Math.round(quote.close * stocks + cash)}, level: ${level}`);
    }

    // if (whenBuyPrice < minPrice && level > 1) {
    //   minPrice = whenBuyPrice;
    // }

    const whenSellPrice = whenBuyingMaxPrice * selltrashold[level];
    if (quote.high > whenSellPrice && cash < (stocks * whenSellPrice) && freeze === 0) {
      let sellingAmount; 
      if (level === 1) {
        freeze = 5;
        sellingAmount = Math.ceil((stocks * quote.open - cash) * 0.1 / quote.open)
      } else {
        sellingAmount = Math.ceil(stocks * 0.07);
      }
      stocks -= sellingAmount;
      cash += sellingAmount * whenSellPrice;
      if (level > 1) level -= 1;
      // addLine(`Price ${quote.high} is higher then a trashold ${Math.round(whenSellPrice)}, selling ${sellingAmount} stocks by price ${whenSellPrice}`);
      // addLine(`Cash: ${Math.round(cash)}, stocks: ${stocks}, all: ${Math.round(quote.close * stocks + cash)}, level: ${level}`);
    }
    // addLine(quote as HistoricalPrice);
  });
  addLine(`cash: ${cash + stocks * tqqq[tqqq.length - 1].close}`);

  return (
    <>
      <Simple />
      <pre>
        {log}
      </pre>
    </>
  );
}
