import BattleMap from "./SceneComponents/BattleMap";
import { useRef, useState, useEffect } from 'react';
import { Canvas, FabricImage, Point, Group, Textbox, Circle } from 'fabric';
import { Token } from "./tokenComponents/Token";
import './index.css';
import Toolbar from './menuComponents/Toolbar';
import { ContextMenu } from './menuComponents/ContextMenu';
import { ContextMenuManager } from "./menuComponents/ContextMenuManager";
import { SidebarMenu } from "./menuComponents/SidebarMenu";
import { handleObjectSnapping } from "./SceneComponents/GridSnappingHelper";
import { handleObjectMoving } from "./SceneComponents/TokenMovingHelper";
import type Scene from "./SceneComponents/Scene";

import defaultMap from './DefaultImages/defaultCliffMap.jpeg'
import { Factory } from "./Factory";
import { SplashScreen } from "./menuComponents/SplashScreen";

function Campaign() {
  //State used to access current Canvas to manipulate
  const [canvas, setCanvas] = useState<Canvas>();

  //State used to access the current Scene child class associated with the current Canvas
  const [currentScene, setCurrentScene] = useState<Scene>();

  //State used to store the current unique ID number of the current Canvas and Scene child class
  const [currentCanvasID, setCurrentCanvasID] = useState<number>(0);

  //State that stores class that manages the Canvas Context Menu display and placement. Should refactor as useRef
  const [contextMenuManager, setContextMenuManager] = useState<ContextMenuManager>(new ContextMenuManager);

  //State that stores class that returns image link and id pairs used by Token and Scene classes
  const [factory, setFactory] = useState<Factory>(new Factory);

  //tokenCollection is a array where each row contains the group's name and an array of Tokens 
  // placeable onto the scene
  const [tokenCollection, setTokenCollection] = useState<[string, FabricImage[], Token[]][]>([['My Tokens', [], []]]);

  //Reference used to track Mouse Canvas Coordinate
  const mouseLocation = useRef<Point>(null);

  //Reference boolean to determine whether to Pan
  const isPanning = useRef<boolean>(false);

  const [openSplash, setOpenSplash] = useState(true);

  const ttrpgSystem = useRef(null);

  const [newCampaign, setNewCampaign] = useState(false);

  //An array containing the name of a scene collection and an array of Scenes. For scenes not associated
  //with any collection, the name is empty and the Scene arrray only contains the Scene by itself 
  //const [sceneCollection, setSceneCollection] = useState<[string, Scene[]][]>([]);

  const [canvasCollection, setCanvasCollection] = useState<[string, Canvas[], Scene[]][]>([]);

  //A map containing IDs that are actively used or not used so that scene's can have unique ID's
  const [sceneIDMap, setSceneIDMap] = useState<Map<number, boolean>>(new Map<number, boolean>());

  const gameLog = useRef([]);

  const campaignName = useRef('testCampaign');

  //const canvasIndex = useRef([-1, -1]);

  //Create the initial Canvas on startup with default BattleMap
  useEffect(() => {
    var newMap = new BattleMap("Test Map", 0);
    setCurrentScene(newMap);
    let newIDMap = sceneIDMap;
    newIDMap.set(0, true);
    setSceneIDMap(newIDMap);
    document.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    //Mouse event that indicates panning should be allowed
    window.addEventListener('mousedown', panCanvas);
    function panCanvas(event: MouseEvent) {
      //If (for right hand) right mouse button down
      if (event.button == 2) {
        isPanning.current = true;
      }
    }

    //Event for mouse event to stop panning
    window.addEventListener('mouseup', stopPan);
    function stopPan(event: MouseEvent) {
      //If (for right hand) right mouse button down
      if (event.button == 2) {
        isPanning.current = false;
      }
    }

    let currentCanvas = document.getElementById('scene_0');
    if (currentCanvas) {
      const initCanvas = new Canvas('scene_0', {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 'rgb(0,0,0)',
        enableRetinaScaling: true
      });

      setCanvasCollection([['', [initCanvas], [newMap]]]);
      //canvasIndex.current = [0,0];

      var image = document.createElement('img');
      var source = document.createElement('source');

      //Set image URL source
      image.appendChild(source);
      image.src = defaultMap;
      //Make sure image's link source works
      image.onerror = function () {
        alert('Map Image link is invalid or is not compatible');
      };

      //Make sure image loads before adding to Canvas
      image.onload = function () {
        const mapEl = new FabricImage(image);

        //Scale image for battle map to fit in window as large as possible with some padding
        if (mapEl.height >= mapEl.width && initCanvas.getHeight() < mapEl.height) {
          mapEl.scaleToHeight(initCanvas.getHeight() - 50);
        } else if (mapEl.width > mapEl.height && initCanvas.getWidth() < mapEl.width) {
          mapEl.scaleToWidth(initCanvas.getWidth() - 50);
        }

        //Set map to be unable to be changed and have no controls
        mapEl.set({
          hoverCursor: 'default',
          hasBorder: false,
          hasControls: false,
          selectable: false
        });
        //Add map onto center of canvas and at the very back layer
        initCanvas.add(mapEl);
        initCanvas.sendObjectToBack(mapEl);
        initCanvas.centerObject(mapEl);

        //Add the FabricImage object to BattleMap instance
        newMap.addImage(mapEl);
      };

      //Rendering
      initCanvas.renderAll();
      setCanvas(initCanvas);

      //Unmounted to free memory
      return () => {
        initCanvas.dispose();
      }
    }
  }, [newCampaign]);

  //Update event whenever currentScene or canvas is updated so user view features apply to the current canvas
  useEffect(() => {
    if (canvas) {
      //Delete Group and Single FabricObject selections when "Backspace" or "Delete" keys pressed
      function detectKeydown(event: KeyboardEvent) {
        //Check if key event was a Backspace
        if (event.key == "Backspace" && contextMenuManager && contextMenuManager.getDeleteValid()) {
          //Prevent anything from being deleted when a scene disables deletes
          if (canvas && currentScene && currentScene.getAllowDelete()) {
            //Get all selected FabricObjects on Canvas
            let actives = canvas.getActiveObjects();

            let newCollection = canvasCollection;

            //Check if FabricObjects have been selected
            if (actives.length > 0) {
              //Remove all selected FabricObjects
              for (let i = 0; i < actives.length; i++) {
                let token;
                let tokenGroup;
                let nameBox;
                if ((tokenGroup = actives[i]) instanceof Group && (tokenGroup = tokenGroup.getObjects()).length > 1
                  && (token = tokenGroup[0]) instanceof FabricImage) {
                  let index = canvas.getObjects().indexOf(actives[i]) + 1;
                  if (index > 0 && index < canvas.getObjects().length &&
                    (nameBox = canvas.getObjects()[index]) instanceof Textbox) {
                    canvas.remove(nameBox);
                    //newCollection[canvasIndex.current[0]][3][canvasIndex.current[1]].splice(0,1)
                  }
                }
                //Remove non-token objects from the Scene's info
                else if(actives[i] instanceof Circle)
                {
                  currentScene.removeObjects(actives[i]);
                }
                canvas.remove(actives[i]);
              }
              //Remove group selection box
              canvas.discardActiveObject();
            }
          }
        }
      }
      document.addEventListener('keydown', detectKeydown);

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

      if (currentScene && currentScene instanceof BattleMap) {
        canvas.on('object:moving', handleMove);
      }


      //Function to pan across the canvas
      const panView = (event) => {
        if (isPanning.current && mouseLocation.current) {
          var vpt = canvas.viewportTransform;

          //pan in x direction
          vpt[4] += event.viewportPoint.x - mouseLocation.current.x;

          //pan in y direction
          vpt[5] += event.viewportPoint.y - mouseLocation.current.y;

          //Add panning range in future
          //let center = initCanvas.getCenterPoint()
          //let corners = initCanvas.calcViewportBoundaries();

          canvas.setViewportTransform(vpt);
          canvas.requestRenderAll();
        }
        mouseLocation.current = event.viewportPoint;
      }

      canvas.on('mouse:move', panView);

      //Function to zoom in or out of the canvas using the scroll wheel
      const zoomView = (opt) => {
        mouseLocation.current = opt.viewportPoint;

        //Current Zoom Value
        var delta = opt.e.deltaY;
        var zoom = canvas.getZoom();
        //New Zoom Value
        zoom *= 0.999 ** delta;
        //Range of Zoom Value
        if (zoom > 20) zoom = 20;
        if (zoom < 0.3) zoom = 0.3;
        //Make sure mouse location is found    
        if (mouseLocation.current) {
          //Zoom to where mouse is
          canvas.zoomToPoint(mouseLocation.current, zoom);
          //opt.e.preventDefault();
          //opt.e.stopPropagation();
        }
      }

      //Zoom with scrollwheel
      canvas.on('mouse:wheel', zoomView);

      //Resize all canvases to fit the window. Runs whenever scene is switched so all scenes match in size
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

      //Detect window resize and resize the currently viewable canvas which must respond to minute and numerous changes without
      //too much computation time.
      const resizeCanvas = () => {
        if (canvas)
          canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight, });
      }

      window.addEventListener('resize', resizeCanvas);

      //When canvas is updated make sure previous canvas viewing features are
      //turned off to be reset
      return () => {
        if (currentScene && currentScene instanceof BattleMap) {
          canvas.off('object:moving', handleMove);
        }
        canvas.off('mouse:wheel', zoomView);
        canvas.off('mouse:move', panView);
        document.removeEventListener('keydown', detectKeydown);
        window.removeEventListener('resize', resizeCanvas);
      }
    }

  }, [canvas, currentScene]);



  /*useEffect(() => {
    console.log('scene collection')
    console.log(sceneCollection);
    if (sceneCollection.length > 0)
      console.log(sceneCollection[0][1])
    console.log('canvas collection')
    console.log(canvasCollection)
  });*/

  return (
    <div className="Board">
      <div className="ToolMenus">
        <Toolbar canvas={canvas} scene={currentScene} cmManager={contextMenuManager} campaignName={campaignName} canvasCollection={canvasCollection}
          tokenCollection={tokenCollection} sceneIDMap={sceneIDMap} currentCanvasID={currentCanvasID} />
        <SidebarMenu canvas={canvas} cmManager={contextMenuManager} scene={currentScene}
          setCurrentScene={setCurrentScene} setCanvas={setCanvas}
          tokenCollection={tokenCollection} setTokenCollection={setTokenCollection}
          factory={factory} sceneIDMap={sceneIDMap} setSceneIDMap={setSceneIDMap}
          currentCanvasID={currentCanvasID} setCurrentCanvasID={setCurrentCanvasID}
          canvasCollection={canvasCollection} setCanvasCollection={setCanvasCollection}
          gameLog={gameLog} />
      </div>
      <ContextMenu canvas={canvas} cmManager={contextMenuManager} scene={currentScene} />
      <SplashScreen openSplash={openSplash} setOpenSplash={setOpenSplash} ttrpgSystem={ttrpgSystem} setCanvasCollection={setCanvasCollection}
        setSceneIDMap={setSceneIDMap} setTokenCollection={setTokenCollection} setCurrentCanvasID={setCurrentCanvasID} factory={factory}
        setCurrentScene={setCurrentScene} setCanvas={setCanvas} setNewCampaign={setNewCampaign}/>
      <div id='SceneDiv'>
        <canvas id='scene_0' />
      </div>
    </div>
  )
}

export default Campaign