import React from "react";
import ReactDOM from "react-dom";
import * as api from "./api.js";

const startBubbling = () => {
  const active = { value: false };
  const thresholds = [0, 1];
  const aggregations = [];

  const getAverageScore = () => {
    const sum = aggregations.reduce((acc, cur) => cur + acc, 0);
    return (sum / aggregations.length).toFixed(3);
  };

  const createProfileScoreBox = () => {
    const profileContainerDOM = document.querySelector(".ProfileAvatar");
    const ProfileScoreBox = props => (
      <div className="score-box">
        <span>Hello, world!</span>
      </div>
    );
    const boxContainer = document.createElement("div");
    ReactDOM.render(<ProfileScoreBox />, boxContainer);
    if (profileContainerDOM && profileContainerDOM !== undefined) profileContainerDOM.appendChild(boxContainer); // TODO: change this
  };

  const subscribeToChromeStorage = () => {
    // callback function
    const f = () => {
      chrome.storage.sync.get(["thresholds"], function(result) {
        thresholds[0] = result.thresholds[0];
        thresholds[1] = result.thresholds[1];
        console.log("thresholds", thresholds);
      });
      chrome.storage.sync.get(["active"], function(result) {
        active.value = result.active;
        console.log("active", active);
        // init();  // necessary, as those React elements don't re-render automatically
      });
    };
    // subscribe
    chrome.storage.onChanged.addListener(f);
    f();
  };

  const createTweetScoreBox = value => {
    // create React component
    const TweetScoreBox = props => (
      <div
        className="score-box"
        style={{
          backgroundColor: props.value > 0.5 ? "crimson" : "blue",
          visibility: props.active ? "visible" : "hidden",
          opacity:
            value < thresholds[0]
              ? 0
              : value > thresholds[1]
                ? 1
                : (value - thresholds[0]) / (thresholds[1] - thresholds[0])
        }}
      >
        <span>{props.value}</span>
      </div>
    );
    // create container
    const boxContainer = document.createElement("div");
    // render React component into element
    ReactDOM.render(
      <TweetScoreBox value={value} active={active.value} />,
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
      console.log(tweetText); // DEBUG
      if (tweetText !== null) {
        api.getPredictions(tweetText).then(response => {
          const prediction = response.data.predictions[0].toFixed(3);
          // console.log("response", prediction); // DEBUG
          const scoreBox = createTweetScoreBox(prediction);
          aggregations.push(prediction);
          node.appendChild(scoreBox);
          console.log(scoreBox);
        });
      }
    });
    // append profile score box
    // createProfileScoreBox();
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
    subscribeToChromeStorage();
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
          // console.log("response", prediction); // DEBUG
          const scoreBox = createTweetScoreBox(prediction);
          aggregations.push(prediction);
          node.appendChild(scoreBox);
          console.log(scoreBox);
        });
      }
    // createProfileScoreBox();
  });

  init();
};

// polling to detect url change
let url = location.href;
setInterval(() => {
  if (url !== location.href) {
    console.log("URL changed!");
    startBubbling();
    url = location.href;
  }
}, 400);

// start!!!!
startBubbling();