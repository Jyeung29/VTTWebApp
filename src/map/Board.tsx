import BattleMap from "./BattleMap";
import { useRef, useState, useEffect } from 'react';
import { Canvas, Rect, FabricImage, Point } from 'fabric';
import { useWindowSize } from '@uidotdev/usehooks';
import {Token} from "./Token";
import './Board.css';
import Toolbar from './Toolbar'

function Board() {
  //Return using HTML notation
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  //track Mouse Canvas Coordinate
  var mouseLocation: Point;

  //Boolean to set Panning bools only once during Panning
  var panSwitch:boolean = false;

  //Boolean to determine whether to Pan
  var isPanning:boolean = false;

  //Runs every render
  useEffect(() => {
    if (canvasRef.current) {
      const initCanvas = new Canvas(canvasRef.current, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'rgb(0,0,0)',
        enableRetinaScaling: true
      });

      //Listener for detecting resize
      var resizeEvent = window.addEventListener("resize", detectResize, false);

      //Resize Canvas width and height if new window size is bigger
      function detectResize() {
        initCanvas.setDimensions({height:window.innerHeight,width:window.innerWidth});
        /*let changeMade = false;
          if (initCanvas.width < window.innerWidth) {
            console.log("width change");
            let myHeight = initCanvas.height;
            initCanvas.setDimensions({height:myHeight,width:window.innerWidth});
            changeMade = true;
          }
          if (initCanvas.height < window.innerHeight) {
            console.log("height change");
            let myWidth = initCanvas.width;
            initCanvas.setDimensions({height:window.innerHeight,width:myWidth});
            changeMade = true;
          }
          /*
          //Recenters when resized to larger screen. Back to normal screen causes issues.
          if(changeMade)
          {
            let newCenter = initCanvas.getCenterPoint();
            let difference = newCenter.subtract({x:centerPoint.x,y:centerPoint.y});
            let objects = initCanvas.getObjects();
            for(let i = 0; i < objects.length; i++)
            {
              let newCoord = objects[i].getXY().add(difference);
              objects[i].setXY(newCoord);
            }
          }*/
      }

      //Listen for any keyboard input
      var deleteEvent = document.addEventListener("keydown", detectKeydown, false);

      //Delete Group and Single FabricObject selections when "Backspace" or "Delete" keys pressed
      function detectKeydown(event) {
        //Check if key event was a Backspace
        if (event.key == "Backspace") {
          //Get all selected FabricObjects on Canvas
          let actives = initCanvas.getActiveObjects();
          //Check if FabricObjects have been selected
          if (actives.length > 0) {
            //Remove all selected FabricObjects
            for (let i = 0; i < actives.length; i++) {
              initCanvas.remove(actives[i]);
            }
            //Remove group selection box
            initCanvas.discardActiveObject();
          }
        }
      }

      //Event for mouse event to start panning
      const mousePan = window.addEventListener('mousedown', (event) => {
        //If (for right hand) right mouse button down
        if(event.button == 2 && !panSwitch)
        {
          isPanning = true;
          panSwitch = true;
          initCanvas.selection = false;
        }
      });

      //Event for mouse event to stop panning
      const mouseNoPan = window.addEventListener('mouseup', (event) => {
        //If (for right hand) right mouse button down
        if(event.button == 2 && isPanning)
        {
          panSwitch = false;
          isPanning = false;
          initCanvas.selection = true;
        }
      });

      //Prevent Panning from Displaying Context Menu
      const contextMenu = document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        /*if((canvas._activeObject) instanceof Token)
        {
          
        }*/
      });

      //Pan Viewport
      initCanvas.on('mouse:move', (event) => {
        if (isPanning) {
          var vpt = initCanvas.viewportTransform;

          //pan in x direction
          vpt[4] += event.viewportPoint.x - mouseLocation.x;

          //pan in y direction
          vpt[5] += event.viewportPoint.y - mouseLocation.y;

          let center = initCanvas.getCenterPoint()
          let corners = initCanvas.calcViewportBoundaries();

          //Add panning range in future

          initCanvas.setViewportTransform(vpt);
          initCanvas.requestRenderAll();
        }
        mouseLocation = event.viewportPoint;
      });

      //Zoom with scrollwheel
      initCanvas.on('mouse:wheel', function(opt) {
        mouseLocation = opt.viewportPoint;
        //Current Zoom Value
        var delta = opt.e.deltaY;
        var zoom = initCanvas.getZoom();
        //New Zoom Value
        zoom *= 0.999 ** delta;
        //Range of Zoom Value
        if (zoom > 20) zoom = 20;
        if (zoom < 0.3) zoom = 0.3;
        //Make sure mouse location is found    
        if(mouseLocation)
        {
          //Zoom to where mouse is
          initCanvas.zoomToPoint(mouseLocation, zoom);
          opt.e.preventDefault();
          opt.e.stopPropagation();
        }
      });

      //Rendering
      initCanvas.renderAll();
      setCanvas(initCanvas);

      //Unmounted to free memory
      return () => {
        initCanvas.dispose();
      }

    }
  }, []);

  return (
    <div className="Board">
      <div className="Toolbar Top">
        <Toolbar canvas={canvas} />
      </div>
      <canvas id="test" ref={canvasRef} />
    </div>
  )
}

export default Board