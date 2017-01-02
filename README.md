# Parse Qubicle Binary

## Install
Javascript parser for Qubicle Binary file format:
http://minddesk.com/wiki/index.php?title=Qubicle_Constructor_1:Data_Exchange_With_Qubicle_Binary

Works in browser and server Node.js environments

```
npm install parse-qubicle
```

## Usage

### Input

```javascript
  var parseQubicle = require('parse-qubicle');
  //read a .qb file as an arrayBuffer from file system or xhr request;
  var qbJSON = parseQubicle(arrayBuffer);
```

### Output
```javascript
{
  "version":257,
  "colorFormat":0,
  "zAxisOrientation":0,
  "compressed":1,
  "visibilityMaskEncoded":1,
  "numMatrices":1,
  "matrixList":[
    {
      "nameLength":5,
      "name":"FootL",
      "sizeX":5,
      "sizeY":3,
      "sizeZ":9,
      "posX":0,
      "posY":0,
      "posZ":0,
      "matrix":[
        {
         "x":0,
         "y":0,
         "z":0,
         "r":68,
         "g":68,
         "b":68,
         "a":127
        },
        // ... more matrix verts
      ]
     },
     // ... more matrix meshes
  ]
}
```
