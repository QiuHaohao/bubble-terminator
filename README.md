# political-classifier
A chrome extension that helps you to look through the filter bubble with the power of AI and Machine Learning

## How to run the server

First make sure you've installed all the dependencies needed by the server in a virtualenv. If you haven't, do this in the project root:
```
virtualenv --python=python3.6 ENV
pip install -r requirements
```

and run the server with nohup:
```
nohup sudo python3 app.py &
```

## Build the Chrome extension

Go to the frontend directory:
```
cd frontend
```

Install dependencies:
```
yarn install
```

Build!
```
yarn build
```
