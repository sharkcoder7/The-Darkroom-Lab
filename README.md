TheDarkRoom mobile application

# Run application in local environment

## Copy project

`git clone https://berezhnov@bitbucket.org/edentechlabs/thedarkroom-mobile.git`

## Install npm deps

`npm i`

## Install ios deps

`cd ios && pod install && cd ..`

## Run app 

`react-native run-android` or `react-native run-ios`

## Warning

This project includes library `react-native-toggle-element`. It has bug with initial state.
So in order to fix it, you should add 

` useEffect(() =>
   {
     updateThumbButton(value, true);
   }, []);
`

on the line 136 in `node_modules/react-native-toggle-element/toggle.js`
