import React from "react";
import ReactDOM from "react-dom";
import * as api from "./api.js";

function showLogs() {
  console.log("Content script loaded on this page");
  console.log("Internal version 1.8");
}

showLogs();

const createScoreBox = () => {
  // create React component
  const ScoreBox = () => (
    <span>{Math.random().toFixed(1)}</span>
  );
  // create container
  const boxContainer = document.createElement("div");
  boxContainer.className = "score-box";  // so we can style them
  // render React component into element
  ReactDOM.render(<ScoreBox />, boxContainer);
  // return rendered element
  return boxContainer;
}

// called by observer
const dispatchAction = mutationsList => {
  const boxContainer = createScoreBox();
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
  flattenedList.forEach(node => node.appendChild(boxContainer.cloneNode(true)));
  // console.log(flattenedList.map(node => node.innerText.trim().split("\n").join(" ")
  //   .replace(/\*replies\*retweets\*likesReply\*Retweet\*Like\*Direct message\*/gi, ""))); // DEBUG
  // append serious score box
  flattenedList.forEach(node => {
    const tweetText = node.querySelector(".js-tweet-text-container") && node.querySelector(".js-tweet-text-container").innerText.trim().split("\n").join(" ");
    console.log(tweetText);
    const form = new FormData();
    form.append("text", [tweetText]);
    api.getPredictions(form).then(response => console.log("response", response));
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
  const boxContainer = createScoreBox();
  const tweetList = document.querySelectorAll(".js-stream-item, .stream-item");
  tweetList.forEach((tweetDOM) => {
    tweetDOM.appendChild(boxContainer.cloneNode(true));
  })
};
init();