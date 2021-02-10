import React, { Component } from "react";
import { Route } from "react-router-dom";
import Awareness from "./components/Awareness/awareness";
import Homepage from "./components/Homepage/homepage";
import Sales from "./components/Sales/sales";
import Revenue from "./components/Revenue/revenue";
import Histroy from "./components/History/history";

class Main extends Component {
  render() {
    return (
      <div>
        <Route path="/" component={Homepage} />
        <Route path="/awareness" component={Awareness} />
        <Route path="/sales" component={Sales} />
        <Route path="/history" component={Histroy} />
        <Route path="/revenue" component={Revenue} />
      </div>
    );
  }
}
//Export The Main Component
export default Main;
