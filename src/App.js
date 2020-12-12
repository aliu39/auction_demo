import React from "react";
import "./App.css";
import Myerson from "./components/Myerson";

//main app component
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <header></header>
        <div id="myerson">
          <Myerson />
        </div>
      </div>
    );
  }
}

export default App;
