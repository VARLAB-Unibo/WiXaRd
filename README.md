# WiXaRd - Web Integration for eXtended and Cross Reality

[Lorenzo Stacchio](https://www.unibo.it/sitoweb/lorenzo.stacchio2/en),
[Giacomo Vallasciani](https://www.unibo.it/sitoweb/giacomo.vallasciani2/en),
[Giulio Augello](https://www.linkedin.com/in/giulio-augello-958537194/?originalSubdomain=it),
[Silvano Carradori](https://www.linkedin.com/in/scarradori98/),
[Pasquale Cascarano](https://www.unibo.it/sitoweb/pasquale.cascarano2/en),
[Gustavo Marfia](https://www.unibo.it/sitoweb/gustavo.marfia/en)<br/>

| [IEEE VR '24 Oral Presentation at XRIOS Workshop](https://sites.google.com/view/xrios/home?authuser=0) | [paper]() | [project page]() | [video](https://www.youtube.com/watch?v=rw9mkeeRMuA)

![wixard_teaser-Pagina-1](https://github.com/VARLAB-Unibo/WiXaRd/assets/36449327/34fb512d-1aaa-4fdd-9c7d-8d73fad784eb)

Welcome to the GitHub repository of WiXaRd, a WebXR and Cross Reality (CR) based system designed for shared 3D experiences over the web. WiXaRd provides a flexible and modular interface that can be utilized across a spectrum of XR devices, including immersive headsets and traditional 2D displays such as desktops and smartphones.

## Overview
WiXaRd is developed to address the growing demand for immersive experiences in various domains, such as education, industrial design, and collaborative workspaces. It leverages eXtended Reality (XR) paradigms to spatially manipulate, visualize, and register 3D objects, offering both visualization and manipulation functionalities within a networked and real-time environment.

## Key Features
1. **Device Independence:** WiXaRd aims to be device-agnostic, and compatible with a wide range of XR devices, ensuring flexibility and ease of use for all users.
2. **Real-time Collaborations:** The platform supports collaborative real-time interactions, enabling users to work together seamlessly within a shared 3D environment.
3. **Integration with External 3D Database:** WiXaRd integrates with external 3D multimedia databases, allowing users to download and store 3D models to enhance the collaborative experience.
4. **Annotation System:** The system incorporates an annotation feature, providing users with the ability to visualize and report various types of information in a spatial context.
5. **Remote Streaming Mechanism:** WiXaRd includes an interactable remote-streaming mechanism, enabling users to access content or services from anywhere, even on devices with limited hardware capabilities.

## Comparison with Related Works

|                   | XRAG | C   | 2DC | SC  | RR  | ANN | EDI | GP  | OS  |
|-------------------|------|-----|-----|-----|-----|-----|-----|-----|-----|
| **Industrial**      |      |     |     |     |     |     |     |     |     |
| [50]              | ✗    | ✓   | ✗   | ✗   | ✓   | ✗   | ✗   | ✗   | ✗   |
| [48]              | ✗    | ✓   | ✗   | ✗   | ✗   | ✗   | ✗   | ✗   | ✗   |
| [45, 46]          | ≈    | ✓   | ✓   | ✓   | ✓   | ✓   | ✗   | ≈   | ✗   |
| [25]              | ✗    | ✓   | ✗   | ✓   | ✗   | ✗   | ✗   | ✓   | ✗   |
| [27]              | ✗    | ✓   | ✓   | ✓   | ✗   | ✗   | ✗   | ✓   | ✗   |
| [49]              | ✗    | ✓   | ✗   | ✓   | ✓   | ✓   | ✗   | ≈   | ✗   |
| **Academic**      |      |     |     |     |     |     |     |     |     |
| [1]               | ✓    | ✓   | ✗   | ✗   | ✓   | ✗   | ✗   | ✗   | ✗   |
| [20]              | ✗    | ✓   | ✓   | ≈   | ✗   | ✗   | ✗   | ✗   | ✗   |
| [24]              | ✓    | ✓   | ✓   | ✗   | ✗   | ✗   | ✗   | ✗   | ✗   |
| [28]              | ✓    | ✓   | ✗   | ≈   | ✗   | ✗   | ✗   | ✗   | ✗   |
| [37]              | ✓    | ✓   | ✓   | ≈   | ≈   | ≈   | ✗   | ✗   | ✗   |
| [11]              | ✓    | ✓   | ✓   | ≈   | ✗   | ✓   | ✗   | ✗   | ✓   |
| **WiXaRd**        | ✓    | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   | ✓   |

*Comparison between the considered systems considering different relevant features: XR Device Agnostic (XRAG), Collaborative (C), 2D device compatibility (2DC), Scene Customization (SC), Remote Rendering (RR), Annotation System (ANN), External Database Integration (EDI), General Purpose (GP), and Open-source (OS).*


## Implementation Details

WiXaRd utilizes WebXR-based technologies, offering compatibility with any XR device. The implementation includes a modular architecture for ease of use and adaptability.

**Technological Stack:**
 * [Node JS](https://nodejs.org/);
 * [Three JS](https://threejs.org/);
 * [Puppeteer](https://pptr.dev/);
 * [ATON](https://github.com/phoenixbf/aton);
 * [Photon](https://www.photonengine.com/);
 * [WebXR APIs](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API);


## How to Use

### Installation
Install [NodeJs 18.16.1](https://nodejs.org/en/blog/release/v18.16.1).

Then go in the root directory of the project and execute ```npm-install```.

Create a sketchfab profile and copy and paste the [API Token](https://sketchfab.com/settings/password) in the ```sketchfab_token``` field within the ```config\users.json```.
If required, put it also in the pop-up that could spawn on the homepage.

### Execute Wixard

Again in the root directory, execute ```npm run start-wixard```, which should start a localhost server at [https://localhost:8084](https://localhost:8084).

To execute the remote streaming pipeline execute in another terminal window ```npm run start-proxy```
