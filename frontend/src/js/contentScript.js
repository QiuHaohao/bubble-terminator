import React from "react";
import ReactDOM from "react-dom";
import { message } from "antd";
import * as api from "./api.js";

let displayedWarning = false;

const startBubbling = () => {
  const active = { value: false };
  const thresholds = [0.25, 0.75];
  const aggregations = [];

  const getAverageScore = () => {
    const sum = aggregations.reduce((acc, cur) => parseFloat(cur) + parseFloat(acc), 0);
    // console.log("sum", sum);
    // console.log("average", (sum / aggregations.length).toFixed(3));
    return (sum / aggregations.length).toFixed(3);
  };

  const subscribeToChromeStorage = () => {
    // callback function
    const f = () => {
      chrome.storage.sync.get(["thresholds"], function(result) {
        thresholds[0] = result.thresholds[0];
        thresholds[1] = result.thresholds[1];
        // console.log("thresholds", thresholds);
      });
      chrome.storage.sync.get(["active"], function(result) {
        active.value = result.active;
        // console.log("active", active);
      });
    };
    // subscribe
    chrome.storage.onChanged.addListener(f);
    f();
  };

  const createTweetScoreBox = value => {
    // create React component
    const TweetScoreBox = props => {
      return (
        <div
          className="score-box"
          style={{
            backgroundColor: props.value > thresholds[1] ? "crimson" : "blue",
            opacity:
              props.value > thresholds[0] && props.value < thresholds[1]
                ? 0
                : props.value > thresholds[1]
                  ? Math.min(0.3, (props.value - thresholds[1]) / (1 - thresholds[1]))
                  : Math.min(0.3, (thresholds[0] - props.value) / (thresholds[0])),
          }}
        >
          <span>{props.value < thresholds[0] ? "D" : "R"}</span>
        </div>
      )};
    // create container
    const boxContainer = document.createElement("div");
    // render React component into element
    ReactDOM.render(
      <TweetScoreBox value={parseFloat(value)} active={active.value} />,
      boxContainer
    );
    // return rendered element
    return boxContainer;
  };

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
      const tweetText =
        node.querySelector(".js-tweet-text-container") &&
        node
          .querySelector(".js-tweet-text-container")
          .innerText.trim()
          .split("\n")
          .join(" ");
      // console.log(tweetText); // DEBUG
      if (tweetText !== null) {
        api.getPredictions(tweetText).then(response => {
          const prediction = response.data.predictions[0].toFixed(3);
          const scoreBox = createTweetScoreBox(prediction);
          aggregations.push(prediction);
          node.appendChild(scoreBox);
          // console.log(scoreBox);
        });
      }
    });
    // warning
    if (!displayedWarning){
      if (getAverageScore() < thresholds[0]) {
        message.warning("This is too democratic!");
      } else if (getAverageScore() > thresholds[1]) {
        message.warning("This is too republican!")
      }
    }
  };

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
    const tweetList = document.querySelectorAll(
      ".js-stream-item, .stream-item"
    );
    tweetList.forEach(node => {
      const tweetText =
        node.querySelector(".js-tweet-text-container") &&
        node
          .querySelector(".js-tweet-text-container")
          .innerText.trim()
          .split("\n")
          .join(" ");
      if (tweetText !== null) {
        api.getPredictions(tweetText).then(response => {
          const prediction = response.data.predictions[0].toFixed(3);
          const scoreBox = createTweetScoreBox(prediction);
          aggregations.push(prediction);
          node.appendChild(scoreBox);
          // console.log(scoreBox);
        });
      }
    });
    if (!displayedWarning){
      if (getAverageScore() < thresholds[0]) {
        message.error("This is too democratic!", 3);
        displayedWarning = true;
      } else if (getAverageScore() > thresholds[1]) {
        message.error("This is too republican!", 3)
        displayedWarning = true;
      } else {
        message.info("You're being watched by Bubble Terminator!!", 3);
      }
    }
  };

  subscribeToChromeStorage();
  init();
};

// start!!!!
startBubbling();

// polling to detect url change
let url = location.href;

setInterval(() => {
  if (url !== location.href) {
    // console.log("URL changed!");
    startBubbling();
    url = location.href;
    displayedWarning = false;
  }
}, 400);
