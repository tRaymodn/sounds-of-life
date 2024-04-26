import logo from './logo.svg';
import './App.css';
import Page from "./components/Page.js"
import React, {useState} from 'react'

function App() {

  const [page, setBoard] = useState(React.createElement(Page, {size: 4}));

  return (
    <div className="App">
      {page}
    </div>
  );
}

export default App;
