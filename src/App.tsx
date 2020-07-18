import React from 'react';
import './App.css';
import Main from './components/main';
import Simple from './components/simple';
import { tqqq } from './data/tqqq'
import { tsla } from './data/tsla'

function App() {
  return (
    <div className="App">
      <h3>Strategies</h3>
      <Simple quotes={tqqq} />
      <Main quotes={tqqq} />
    </div>
  );
}

export default App;
