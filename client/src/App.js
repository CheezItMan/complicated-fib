import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import OtherPage from './components/OtherPage';
import Fib from './components/Fib';
import './App.css';

function App () {
  return (
    <div className="App">
      <Router>
        <header>
          <h1>Header</h1>
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <main>
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </main>
      </Router>

    </div>
  );
}

export default App;
