import React from "react";
import ReactDOM from "react-dom";
import * as api from "./api.js";

const startBubbling = () => {
  const createScoreBox = value => {
    // create React component
    const ScoreBox = () => (
      <span>{/* Math.random().toFixed(1) */ value}</span>
    );
    // create container
    const boxContainer = document.createElement("div");
    boxContainer.className = "score-box";  // so we can style them
    if (value > 0.5) {
      boxContainer.style.backgroundColor = "crimson";
    } else {
      boxContainer.style.backgroundColor = "blue";
    }
    // render React component into element
    ReactDOM.render(<ScoreBox />, boxContainer);
    // return rendered element
    return boxContainer;
  }

  // called by observer
  const dispatchAction = mutationsList => {
    // filter out non-tweets
    const unFlattenedList = mutationsList
      .filter(mutationRecord => mutationRecord.type === "childList")
      .map(mutationRecord => mutationRecord.addedNodes)
      .map(nodeList => {
        const nodeArray = Array.from(nodeList);
        return nodeArray.filter(node => {
          return node.className && node.className.includes("stream-item");
        });
      });
      // flatten DOM list
    const flattenedList = unFlattenedList.reduce((acc, cur) => {
      cur.forEach(val => acc.push(val));
      return acc;
    }, []);
    // append score box
    flattenedList.forEach(node => {
      const tweetText = node.querySelector(".js-tweet-text-container") && node.querySelector(".js-tweet-text-container").innerText.trim().split("\n").join(" ");
      console.log(tweetText); // DEBUG
      api.getPredictions(tweetText).then(response => {
        const prediction = response.data.predictions[0].toFixed(3);
        console.log("response", prediction); // DEBUG
        tweetText === "" ? null : node.appendChild(createScoreBox(prediction).cloneNode(true));
      });
    });
  }

  // construct observer
  const config = {
    childList: true,
    subtree: true
  };
  const observeTarget = document.querySelector(".stream-items");
  const observer = new MutationObserver(dispatchAction);

  // start observing
  observer.observe(observeTarget, config);

  // init
  const init = () => {
    const tweetList = document.querySelectorAll(".js-stream-item, .stream-item");
    tweetList.forEach(node => {
      const tweetText = node.querySelector(".js-tweet-text-container") && node.querySelector(".js-tweet-text-container").innerText.trim().split("\n").join(" ");
      api.getPredictions(tweetText).then(response => {
        const prediction = response.data.predictions[0].toFixed(3);
        console.log("response", prediction); // DEBUG
        tweetText === "" ? null : node.appendChild(createScoreBox(prediction).cloneNode(true));
      });
    })
  };
  init();
}

startBubbling();

// polling url change
let url = location.href;
setInterval(() => {
  if (url !== location.href) {
    console.log("URL changed!");
    startBubbling();
    url = location.href;
  }
}, 400);