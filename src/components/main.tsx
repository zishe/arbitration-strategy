import React from 'react';

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
  lastPrice: number; // last close price
  lastHigh: number; // the highest price
  lastLow: number; // the lowest price
  startAmount: number; // how much to invest in stocks at the start
  minStocks: number; // minimum amount of stocks in percent of marketCap
}

export const start = 50;

class Account {
  // state: Portfolio;
  constructor(public state: Portfolio) {
    // this.state = state;
  }

  init(quote: HistoricalPrice) {
    const { cash, stocks, startAmount } = this.state;
    const stockAmount = Math.ceil((cash * startAmount) / quote.open);
    this.state = {
      ...this.state,
      stocks: stockAmount,
      lastPrice: quote.close,
      cash: cash - stockAmount * quote.open,
      lastHigh: quote.high,
      lastLow: quote.open,
    }
  }

  close(quote: HistoricalPrice) {
    const { cash, stocks, lastHigh, lastLow } = this.state;
    this.state.lastPrice = quote.close;
    if (quote.high > lastHigh) {
      this.state.lastHigh = quote.high;
      this.state.lastLow = quote.low;
    }
    if (quote.low < lastLow) {
      this.state.lastLow = quote.low;
    }
  }

  buy(price: number, amount: number) {
    const { cash, stocks } = this.state;
    const stockAmount = stocks + amount;
    this.state = {
      ...this.state,
      stocks: stockAmount,
      lastPrice: price,
      cash: cash - amount * price,
    }
  }

  sell(price: number, amount: number) {
    const { cash, stocks } = this.state;
    const stockAmount = stocks - amount;
    this.state = {
      ...this.state,
      stocks: stockAmount,
      lastPrice: price,
      cash: cash + amount * price,
    }
  }

  // TODO: покупка акций в цикле, пока это возможно на каждой свече
  next(quote: HistoricalPrice) {
    const { cash, stocks, lastPrice, lastHigh, lastLow } = this.state;
    console.log(quote);
    // console.log(this.state);
    // console.log(lastHigh - quote.low);
    const n = 2;
    if (quote.low < lastPrice && cash > quote.high * n) {
      // day is lower then previous
      // при какой цене можно будет купить еще 1 акцию
      // Price * (StockAmount + 1) = (Cash + StockAmount * Price) * (0.5 + (lastHigh - Price) / lastHigh)
      // Price * (StockAmount + 1) = Cash * (0.5 + lastHigh/lastHigh - Price/lastHigh) + StockAmount * Price * (0.5 + lastHigh/lastHigh - Price/lastHigh)
      // Price * (StockAmount + 1) = Cash * (0.5 + lastHigh/lastHigh)  - Cash*Price/lastHigh + StockAmount * Price * (0.5 + lastHigh/lastHigh) - StockAmount * Price * Price/lastHigh
      // Price * Price * StockAmount /lastHigh + Price * (StockAmount + N + Cash/lastHigh - StockAmount * 1.5) - Cash * 1.5 = 0
      const a = stocks / lastHigh;
      const b = (n + cash/lastHigh - stocks * 0.5);
      const c = - cash * 1.5;
      // console.log(a, b, c);
      const d = b * b - 4 * a * c;
      if (d < 0) return;
      // console.log(d);
      const price = (-b + Math.sqrt(d)) / (2 * a);
      // console.log(price);
      if (price > quote.low) this.buy(price, n);
    } else if (quote.high > lastPrice) {
      // day is lower then previous
      // при какой цене можно будет купить еще 1 акцию
      // Price * (StockAmount - N) = (Cash + StockAmount * Price) * (0.6 + (lastHigh - Price) / lastHigh)
      // Price * (StockAmount - N) = Cash * (0.6 + lastHigh/lastHigh - Price/lastHigh) + StockAmount * Price * (0.6 + lastHigh/lastHigh - Price/lastHigh)
      // Price * (StockAmount - N) = Cash * (0.6 + lastHigh/lastHigh)  - Cash*Price/lastHigh + StockAmount * Price * (0.6 + lastHigh/lastHigh) - StockAmount * Price * Price/lastHigh
      // Price * Price * StockAmount / lastHigh + Price * (StockAmount - N + Cash/lastHigh - StockAmount * 1.6) - Cash * 1.6 = 0
      const a = stocks / lastHigh;
      const b = (-n + cash/lastHigh - stocks * 0.65);
      const c = - cash * 1.65;
      // console.log(a, b, c);
      const d = b * b - 4 * a * c;
      if (d < 0) return;
      // console.log(d);
      const price = (-b + Math.sqrt(d)) / (2 * a);
      // console.log(price);
      if (price < quote.high) this.sell(price, n);
    }

    this.close(quote);
    console.log(this.show());
  }

  marketCap() {
    if (!this.state) return '';
    return Math.round(this.state.cash + this.state.stocks * this.state.lastPrice);
  }

  show() {
    if (!this.state) return '';
    return `${Math.round(this.state.cash)} cash, ${this.state.stocks} stocks, ${this.marketCap()} cap`
  }
}

export default function Main({ quotes }: { quotes: HistoricalPrice[] }) {
  const account = new Account({
    cash: 10000,
    stocks: 0,
    startAmount: 0.5,
    minStocks: 0.5,
    lastPrice: 0,
    lastHigh: 0,
    lastLow: 0
  });

  let log = ''
  let addLine = (line: any) => {
    log += line + '\n';
  }
  account.init(quotes[start]);
  // addLine(account.show());

  let i = start;

  let maxPrice = quotes[i].high;
  quotes.forEach((quote: HistoricalPrice, i: number) => {
    // addLine(Date.parse(quote.date).toString());
    if (i < start) return;
    account.next(quote);

    if (quote.high > maxPrice) {
      maxPrice = quote.high;
    }

  });
  addLine(account.show());

  return (
    <>
      <pre>
        {log}
      </pre>
    </>
  );
}
