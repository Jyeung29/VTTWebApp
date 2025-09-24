import BattleMap from "./battleMapComponents/BattleMap";
import { useRef, useState, useEffect } from 'react';
import { Canvas, Rect, FabricImage, Point, Group, Textbox } from 'fabric';
import { Token } from "./tokenComponents/Token";
import './index.css';
import Toolbar from './menuComponents/Toolbar';
import { ContextMenu } from './menuComponents/ContextMenu';
import { ContextMenuManager } from "./menuComponents/ContextMenuManager";
import { SidebarMenu } from "./menuComponents/SidebarMenu";
import { handleObjectSnapping } from "./battleMapComponents/GridSnappingHelper";
import { handleObjectMoving } from "./battleMapComponents/TokenMovingHelper";
import { ImageLinkFactory } from "./ImageLinkFactory";
import type Scene from "./SceneComponents/Scene";

function Board() {
  const [canvas, setCanvas] = useState<Canvas>();
  const [currentScene, setCurrentScene] = useState<Scene>();
  const [currentCanvasID, setCurrentCanvasID] = useState<number>(0);
  const [contextMenuManager, setContextMenuManager] = useState<ContextMenuManager>(new ContextMenuManager);
  const [linkFactory, setLinkFactory] = useState<ImageLinkFactory>(new ImageLinkFactory);

  //tokenCollection is a array where each row contains the group's name and an array of Tokens 
  // placeable onto the scene
  const [tokenCollection, setTokenCollection] = useState<[string, Token[]][]>([['My Tokens', []]]);

  //track Mouse Canvas Coordinate
  const [mouseLocation, setMouseLocation] = useState<Point>();
  const [mouseLocationBool, setMouseLocationBool] = useState<boolean>(false);

  //Boolean to determine whether to Pan
  const [isPanning, setIsPanning] = useState<boolean>(false);

  const [panTrigger, setPanTrigger] = useState<boolean>(false);

  //An array containing the name of a scene collection and an array of Scenes. For scenes not associated
  //with any collection, the name is empty and the Scene arrray only contains the Scene by itself 
  const [sceneCollection, setSceneCollection] = useState<[string, Scene[]][]>([]);

  const [canvasCollection, setCanvasCollection] = useState<[string, Canvas[]][]>([]);

  const [sceneIDMap, setSceneIDMap] = useState<Map<number, boolean>>(new Map<number, boolean>());

  const [resizeBool, setResizeBool] = useState<boolean>(false);

  const [deleteBool, setDeleteBool] = useState<boolean>(false);


  //Resize all canvas's in the collection to new width and height if new window size is bigger.
  //Has TypeError for this.lower which is in Fabric library. Does not cause issues with functionality
  useEffect(() => {
    if (resizeBool) {
      for (let i = 0; i < canvasCollection.length; i++) {
        if (canvasCollection[i][0] == '') {
          let myCanvas = canvasCollection[i][1][0];
          myCanvas.setDimensions({ width: window.innerWidth, height: window.innerHeight, });
        }
        else {
          for (let j = 0; j < canvasCollection[i][1].length; j++) {
            let myCanvas = canvasCollection[i][1][j];
            myCanvas.setDimensions({ width: window.innerWidth, height: window.innerHeight, });
          }
        }
      }
      setResizeBool(false);
    }
  }, [resizeBool])


  useEffect(() => {
    if (deleteBool && canvas) {
      //Get all selected FabricObjects on Canvas
      let actives = canvas.getActiveObjects();
      //Check if FabricObjects have been selected
      if (actives.length > 0) {
        //Remove all selected FabricObjects
        for (let i = 0; i < actives.length; i++) {
          let token;
          let tokenGroup;
          let nameBox;
          if ((tokenGroup = actives[i]) instanceof Group && (tokenGroup = tokenGroup.getObjects()).length > 1
            && (token = tokenGroup[0]) instanceof Token) {
            let index = canvas.getObjects().indexOf(actives[i]) + 1;
            if (index > 0 && index < canvas.getObjects().length &&
              (nameBox = canvas.getObjects()[index]) instanceof Textbox) {
              canvas.remove(nameBox);
            }
          }
          canvas.remove(actives[i]);
        }
        //Remove group selection box
        canvas.discardActiveObject();
      }
      setDeleteBool(false);
    }

  }, [deleteBool])

  useEffect(() => {
    if (panTrigger && canvas) {
      if (isPanning) {
        setIsPanning(false);
        canvas.selection = true;
      }
      else {
        setIsPanning(true);
        canvas.selection = false;
      }
    }
  }, [panTrigger])


  //Runs after detecting that new DOM element added which is the <canvas> so that 
  //Fabric.js Canvas element can be connected
  useEffect(() => {
    var newMap = new BattleMap("Test Map", 0);
    setSceneCollection([['', [newMap]]]);
    setCurrentScene(newMap);
    let newIDMap = sceneIDMap;
    newIDMap.set(0, true);
    setSceneIDMap(newIDMap);
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    //Listener for detecting resize
    window.addEventListener("resize", () => { setResizeBool(true) });

    let currentCanvas = document.getElementById('scene_0');
    if (currentCanvas) {
      //Remove any preexisting events from previous renders. Optimize performance
      window.removeEventListener("keydown", detectKeydown, false);
      window.removeEventListener('mousedown', panCanvas);
      window.removeEventListener('mouseup', stopPan);

      const initCanvas = new Canvas('scene_0', {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'rgb(0,0,0)',
        enableRetinaScaling: true
      });

      setCanvasCollection([['', [initCanvas]]]);

      //Listen for any keyboard input
      document.addEventListener("keydown", detectKeydown, false);

      //Delete Group and Single FabricObject selections when "Backspace" or "Delete" keys pressed
      function detectKeydown(event: KeyboardEvent) {
        //Check if key event was a Backspace
        if (event.key == "Backspace" && contextMenuManager && contextMenuManager.getDeleteValid()) {
          setDeleteBool(true);
        }
      }

      //Event for mouse event to start panning
      window.addEventListener('mousedown', panCanvas);

      function panCanvas(event: MouseEvent) {
        //If (for right hand) right mouse button down
        if (event.button == 2) {
          setPanTrigger(true);
        }
      }

      //Event for mouse event to stop panning
      window.addEventListener('mouseup', stopPan);
      function stopPan(event: MouseEvent) {
        //If (for right hand) right mouse button down
        if (event.button == 2) {
          setPanTrigger(true);
        }
      }

      //Pan Viewport change this!!!
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
        setMouseLocation(event.viewportPoint);
      });

      //Zoom with scrollwheel
      initCanvas.on('mouse:wheel', (opt) => {
        setMouseLocation(opt.viewportPoint);

        //Current Zoom Value
        var delta = opt.e.deltaY;
        var zoom = initCanvas.getZoom();
        //New Zoom Value
        zoom *= 0.999 ** delta;
        //Range of Zoom Value
        if (zoom > 20) zoom = 20;
        if (zoom < 0.3) zoom = 0.3;
        //Make sure mouse location is found    
        if (mouseLocation) {
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

  //Function to enable grid snapping and Token moving
  const handleMove = (event) => {
    if (canvas) {
      if (currentScene && currentScene instanceof BattleMap &&
        currentScene.getGridSnap() && currentScene.getSmallestGridUnit() > 0) {
        handleObjectSnapping(canvas, event.target, currentScene);
      }
      else {
        handleObjectMoving(canvas, event.target);
      }
    }
  };

  //Update event whenever currentScene or canvas is updated so state values are up-to-date
  useEffect(() => {
    if (canvas) {
      canvas.off('object:moving', handleMove);
      canvas.on('object:moving', handleMove);
    }

  }, [currentScene, canvas])

  useEffect(() => {
    console.log('scene collection')
    console.log(sceneCollection);
    if (sceneCollection.length > 0)
      console.log(sceneCollection[0][1])
    console.log('canvas collection')
    console.log(canvasCollection)
  });

  return (
    <div className="Board">
      <div className="ToolMenus">
        <Toolbar canvas={canvas} scene={currentScene} cmManager={contextMenuManager} />
        <SidebarMenu canvas={canvas} cmManager={contextMenuManager} scene={currentScene}
          setCurrentScene={setCurrentScene} setCanvas={setCanvas}
          tokenCollection={tokenCollection} setTokenCollection={setTokenCollection}
          linkFactory={linkFactory} sceneIDMap={sceneIDMap} setSceneIDMap={setSceneIDMap}
          sceneCollection={sceneCollection} setSceneCollection={setSceneCollection}
          currentCanvasID={currentCanvasID} setCurrentCanvasID={setCurrentCanvasID}
          canvasCollection={canvasCollection} setCanvasCollection={setCanvasCollection} />
      </div>
      <ContextMenu canvas={canvas} cmManager={contextMenuManager} scene={currentScene} />
      <div id='SceneDiv'>
        <canvas id='scene_0' />
      </div>
    </div>
  )
}

export default Board