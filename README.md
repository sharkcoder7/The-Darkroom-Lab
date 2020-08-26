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
So in order to fix it, you should add several things in `node_modules/react-native-toggle-element/toggle.js`:

### Add useEffect function import on line 2 (replace string with this one)

`import React, { useRef, useState , useEffect} from 'react';`

### Apply initial state (place it on line 136)
` useEffect(() =>
   {
     updateThumbButton(value, true);
   }, []);
`

### Add second `force = false` argument in updateThumbButton function:

`
 const updateThumbButton = (toggleState, force = false) => {...
`

### Update duration property on line 123 (to remove initial state animation)

`duration: force ? 0 : 350`
