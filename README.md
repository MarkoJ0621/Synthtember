# Synthtember - Marko Jeremic
An art installation built for New Alliance Gallery in Sommerville, MA

## Features
- Tracking of audiences hands and positions using MediaPipe
- Dynamically generated music utilizing csound
- IPC Communication between csound and js to control progression and change in music through audiences positions and movements
-D ynamically generated Visuals

## Tech Stack
- Electron + Webpack for running the project as a desktop app
- Media Pipe, a Computer Vision library by google 
- Csound, music programming language
- Hydra, a video synthesis tool utilizing OpenGL



## Installation instructions
- Install [csound](https://csound.com/download.html)
- Fork repository
- run npm install to download required dependencies
- run npm run dev to start the project


## Notes for running
- Make sure you have csound installed, as it is spawned as a child process and not included in dependencies
- Run npm install to install other dependencies
- Feeling brave and want to customize? change audio.csd and visuals.js and see what might happen!