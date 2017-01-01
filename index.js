var Buffer = require('buffer').Buffer;
var isBuffer = require('is-buffer');
var Dissolve = require('dissolve');
var VoxelCrunch = require("voxel-crunch");

const NEXTSLICEFLAG = 6;
const CODEFLAG = 2;

function parseQubicle(BufferLikeData){
  var buffer = BufferLikeData;
  if(!isBuffer(buffer)){
    try {
      buffer = new Buffer( new Uint8Array(BufferLikeData) );
    }catch (ex){
      throw ex;
    }
  }

  var ret = {};

  var bufferReadIndexPtr = 0;
  
  ret.version = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;

  ret.colorFormat = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;

  ret.zAxisOrientation = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;

  ret.compressed = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;  

  ret.visibilityMaskEncoded = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;

  ret.numMatrices = buffer.readUInt32LE(bufferReadIndexPtr);
  bufferReadIndexPtr+=4;

  ret.matrixList = [];
  for(var i = 0; i < ret.numMatrices; i++){
    var matrix = {};
    matrix.nameLength = buffer.readInt8(bufferReadIndexPtr);
    bufferReadIndexPtr++;
    
    matrix.name = buffer.toString('utf8', bufferReadIndexPtr, bufferReadIndexPtr+matrix.nameLength);
    bufferReadIndexPtr += matrix.nameLength;

    var sizeX = buffer.readUInt32LE(bufferReadIndexPtr);
    matrix.sizeX = sizeX;
    bufferReadIndexPtr+=4;

    var sizeY = buffer.readUInt32LE(bufferReadIndexPtr);
    matrix.sizeY = sizeY;
    bufferReadIndexPtr+=4;

    var sizeZ = buffer.readUInt32LE(bufferReadIndexPtr);
    matrix.sizeZ = sizeZ;
    bufferReadIndexPtr+=4;

    matrix.posX = buffer.readInt32LE(bufferReadIndexPtr);
    bufferReadIndexPtr+=4;

    matrix.posY = buffer.readInt32LE(bufferReadIndexPtr);
    bufferReadIndexPtr+=4;

    matrix.posZ = buffer.readInt32LE(bufferReadIndexPtr);
    bufferReadIndexPtr+=4;

    matrix.matrix = [];

    ret.matrixList.push(matrix);

    if(!ret.compressed){
      for(z = 0; z < sizeZ; z++){
        for(y = 0; y < sizeY; y++){
          for(x = 0; x < sizeX; x++){
            var c1 = buffer.readUInt8(bufferReadIndexPtr);
            bufferReadIndexPtr++;
            var c2 = buffer.readUInt8(bufferReadIndexPtr);
            bufferReadIndexPtr++;
            var c3 = buffer.readUInt8(bufferReadIndexPtr);
            bufferReadIndexPtr++;
            var a = buffer.readUInt8(bufferReadIndexPtr);
            bufferReadIndexPtr++;

            if(a != 0){
              matrix.matrix.push({
                x: ret.zAxisOrientation ? z : x,
                y: y,
                z: ret.zAxisOrientation ? x : z,
                r: !ret.colorFormat ? c1 : c3,
                g: c2,
                b: !ret.colorFormat ? c3 : c1,
                a:a,
              });

              // cubicle example code was initializing nulls
              /* matrix.matrix[x + y*sizeX + z*sizeX*sizeY] = {
               *   x:x,
               *   y:y,
               *   z:z,
               *   r:r,
               *   g:g,
               *   b:b,
               *   a:a,
               * }*/
            }
          }
        }
      }
      continue;
    }
    
    var z = 0;
    var colorBuffer = Buffer.alloc(4);
    
    while (z < sizeZ){         
      z++;
      index = 0;
      while(true){
        var data = buffer.readUInt32LE(bufferReadIndexPtr);
        bufferReadIndexPtr+=4;
        
        if(data === NEXTSLICEFLAG){
          break;
        } else if(data === CODEFLAG){
          var count = buffer.readUInt32LE(bufferReadIndexPtr);
          bufferReadIndexPtr+=4;

          data = buffer.readUInt32LE(bufferReadIndexPtr);
          bufferReadIndexPtr+=4;

          for(j = 0; j < count; j++) {
            var x = index % sizeX + 1; // mod = modulo e.g. 12 mod 8 = 4
            var y = Math.floor(index / sizeX) + 1; // div = integer division e.g. 12 div 8 = 1
            index++;

            /* var c1 = buffer.readUInt8(bufferReadIndexPtr);
             * bufferReadIndexPtr++;
             * var c2 = buffer.readUInt8(bufferReadIndexPtr);
             * bufferReadIndexPtr++;
             * var c3 = buffer.readUInt8(bufferReadIndexPtr);
             * bufferReadIndexPtr++;
             * var a = buffer.readUInt8(bufferReadIndexPtr);
             * bufferReadIndexPtr++;*/

            
            colorBuffer.writeUInt32LE(data, 0, false);

            var c1 = colorBuffer[0] & 0x0000FF;
            var c2 = colorBuffer[1] & 0x0000FF;
            var c3 = colorBuffer[2] & 0x0000FF;
            var a = colorBuffer[3] & 0x0000FF;            

            //matrix.matrix[x + y*sizeX + z*sizeX*sizeY] = data;
            
            if(a != 0){
              matrix.matrix.push({
                x: ret.zAxisOrientation ? z : x,
                y: y,
                z: ret.zAxisOrientation ? x : z,
                r: !ret.colorFormat ? c1 : c3,
                g: c2,
                b: !ret.colorFormat ? c3 : c1,
                a:a,
              });
            }

          }          
        }else{
          x = index % sizeX + 1;
          y = Math.floor(index / sizeX) + 1;
          index++;

          colorBuffer.writeUInt32LE(data, 0, false);

          var c1 = colorBuffer[0] & 0x0000FF;
          var c2 = colorBuffer[1] & 0x0000FF;
          var c3 = colorBuffer[2] & 0x0000FF;
          var a = colorBuffer[3] & 0x0000FF;

          /* var c1 = buffer.readUInt8(bufferReadIndexPtr);
           * bufferReadIndexPtr++;
           * var c2 = buffer.readUInt8(bufferReadIndexPtr);
           * bufferReadIndexPtr++;
           * var c3 = buffer.readUInt8(bufferReadIndexPtr);
           * bufferReadIndexPtr++;
           * var a = buffer.readUInt8(bufferReadIndexPtr);
           * bufferReadIndexPtr++;          */

          //matrix.matrix[x + y*sizeX + z*sizeX*sizeY] = data;
          if(a != 0){          
            matrix.matrix.push({
              x: ret.zAxisOrientation ? z : x,
              y: y,
              z: ret.zAxisOrientation ? x : z,
              r: !ret.colorFormat ? c1 : c3,
              g: c2,
              b: !ret.colorFormat ? c3 : c1,
              a:a,
            });
          }
          
//          matrix.matrix[x + y*sizeX + z*sizeX*sizeY] = data;
        }
      }
    }
  
  }
    return ret;
}

module.exports = parseQubicle;
