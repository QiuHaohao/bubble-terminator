import React from "react";
import ReactDOM from "react-dom";

const Test = () => (
  <div>Hi!!!!!!!!!!</div>
);

const app = document.createElement("div");
app.id = "my-extension-root";

document.body.appendChild(app);
ReactDOM.render(<Test />, app);