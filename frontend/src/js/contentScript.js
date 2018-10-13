import React from "react";
import ReactDOM from "react-dom";

const Test = () => (
  <span>Yo Yo</span>
);

const app = document.createElement("div");
app.className = "score-box";  // so we can style them
app.style.display = "block";

// render those components
ReactDOM.render(<Test />, app);

// document.body.appendChild(app);
// find all tweets
const tweetList = document.querySelectorAll(".tweet .js-stream-tweet");
tweetList.forEach((tweetDOM) => {
  console.log("tweetDOM", tweetDOM);
  console.log("app", app);
  tweetDOM.appendChild(app);
})

// app.style.display = "none";
// chrome.runtime.onMessage.addListener(
//    function(request, sender, sendResponse) {
//       if( request.message === "clicked_browser_action") {
//         toggle();
//       }
//    }
// );

// function toggle(){
//    if(app.style.display === "none"){
//      app.style.display = "block";
//    }else{
//      app.style.display = "none";
//    }
// }