import React from "react";
import ReactDOM from "react-dom";

import { Switch, Icon, Slider, Tooltip } from "antd";

import 'antd/dist/antd.css';
import "./css/style.css";

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      thresholds: [0.25, 0.75],
      active: true,
    }
  }

  componentWillMount() {
    get_active().then(a=>{this.setState({...this.state, active: a});})
    get_thresholds().then(t=>{this.setState({...this.state, thresholds: t});})
  }

  render() {
    return(
      <div className="popup">
        <div className="popup-switch">
          Active: <Switch key={this.state.active.toString} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} checked={this.state.active} onChange={(a)=>{this.setState({...this.state, active: a});save_active(a);}}/>
        </div>
        <div className="popup-slide">
            Threshold: <Slider key={this.state.thresholds.toString} range max={1} min={0} value={this.state.thresholds} onAfterChange={save_thresholds} onChange={(t)=>this.setState({...this.state, thresholds: t})} step={0.01}/>
        </div>
      </div>
    )
  }
}

function save_active(v) {
  chrome.storage.sync.set({
    active: v
  });
}

const get_active = () => new Promise(function(resolve) {
  chrome.storage.sync.get({
    active: true
  }, function(items) {
    resolve(items.active);
  });
})

function save_thresholds(v) {
  chrome.storage.sync.set({
    thresholds: v
  });
}

const get_thresholds = () => new Promise(function(resolve) {
  chrome.storage.sync.get({
    thresholds: [0.25, 0.75]
  }, function(items) {
    resolve(items.thresholds);
  });
})

ReactDOM.render(<App />, document.getElementById("root"));
