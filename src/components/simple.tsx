import React from 'react';
import { HistoricalPrice, start } from './main';

export default function Simple({ quotes }: { quotes: HistoricalPrice[] }) {
  const stocks = Math.floor(10000 / quotes[start].open);
  const cash = Math.round(10000 - stocks * quotes[start].open);
  const lastPrice = quotes[quotes.length - 1].close;

  return (
    <pre>
      {`${cash} cash, ${stocks} stocks, ${cash + Math.round(stocks * lastPrice)} cap`}
    </pre>
  )
}
