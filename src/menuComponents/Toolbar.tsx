import './Toolbar.css';
import {
  FabricImage, Rect, Canvas, Circle, Group, LayoutManager, FixedLayout, type TCornerPoint,
  Line, Textbox, Point
} from "fabric";
import { Token } from '../tokenComponents/Token';
import { handleObjectSnapping } from '../battleMapComponents/GridSnappingHelper';
import { handleObjectMoving } from '../battleMapComponents/TokenMovingHelper';

/*
Function component Toolbar is displayed at the top of the user's window and provides a GM with tools to
interact and change the BattleMap or Roleplaying Scene's Canvas. Basic universal buttons include zooming, screen centering,
adding shapes, setting grids, and dice rolls. Different TableTopRoleplayingGame children may include exclusive features for
toolbar to display.
*/

function Toolbar({ canvas, board, cmManager }) {
  //Array of references to TableTopRoleplayingGame exclusive features. Is not implemented currently.
  const features = [];

  //Boolean that checks whether map image has been added. Used for grid creation. Will be removed when Scene Switching functionality is implemented.
  var mapAdded = false;

  //Boolean that checks whether any map objects have been added. Only switches to true once.
  var objectAdded = false;

  //Function called by a toolbar button to add a shape. Currently only adds a preset circle. The circle is able to scale with or without a grid.
  const addShape = () => {
    if (canvas) {
      let newWidth = 600;
      let newHeight = 600;
      let unitMultiplier = 4;

      //If grid has been set, set height and width to scale with multiplier
      if (mapAdded && board.getGridUnitHeight() != -1 && board.getGridUnitWidth() != -1) {
        newHeight = board.getGridUnitHeight() * unitMultiplier;
        newWidth = board.getGridUnitWidth() * unitMultiplier;
      }

      //Find the scale factor
      let newScaleY = newHeight / 600;
      let newScaleX = newWidth / 600;

      //Create the shape. Circle is the only shape implemented currently. Shape can only be moved by the user.
      var circle = new Circle({
        objectCaching: true, radius: 300, scaleY: newScaleY, scaleX: newScaleX, originX: 'center', originY: 'center', lockRotation: true,
        lockSkewingX: true, lockSkewingY: true, lockScalingFlip: true, lockScalingY: true, lockScalingX: true,
        fill: 'rgba(227, 6, 6, 0.67)'
      });

      //If grid has not been set and the map image has been added, scale the shape to the map image
      if(mapAdded && board.getSmallestGridUnit() <= 0)
      {
        circle.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 15 * unitMultiplier);
      }

      //Add shape to canvas
      canvas.add(circle);
      canvas.centerObject(circle);

      //Add to the BattleMap to track
      board.addObject(circle, unitMultiplier);

      //If no objects have been added, add event to handle all object grid snapping and non-snapping movement
      //Will be removed once Scene Switching has been implemented
      if (!objectAdded) {
        canvas.on('object:moving', (event) => {
          if(gridSet && board.getGridSnap())
          {
            handleObjectSnapping(canvas, event.target, board);
          }
          else
          {
            handleObjectMoving(canvas, event.target);
          }
        });
      }
    }
  }

  const addImage = () => {
    if (canvas && !mapAdded) {
      mapAdded = true;
      var image = document.createElement('img');
      var source = document.createElement('source');
      image.id = 'testMap';

      //Set image URL source
      image.appendChild(source);
      image.src = 'https://content.encounterkit.com/cdn-cgi/image/width=1920,quality=75,format=auto/https://content.encounterkit.com/map/preview/5209421a3a339713f582dadc92ba9488.webp';

      //Make sure image's link source works
      image.onerror = function () {
        alert('Token link is invalid or is not compatible');
      };

      //Make sure image loads before adding to Canvas
      image.onload = function () {
        const mapEl = new FabricImage(image);

        //Scale image for battle map to fit in window as large as possible with some padding
        if (mapEl.height >= mapEl.width && canvas.getHeight() < mapEl.height) {
          mapEl.scaleToHeight(canvas.getHeight() - 50);
        } else if (mapEl.width > mapEl.height && canvas.getWidth() < mapEl.width) {
          mapEl.scaleToWidth(canvas.getWidth() - 50);
        }

        //Set map to be unable to be changed and have no controls
        mapEl.set({
          hoverCursor: 'default',
          hasBorder: false,
          hasControls: false,
          selectable: false
        });

        //Add map onto center of canvas and at the very back layer
        canvas.add(mapEl);
        canvas.sendObjectToBack(mapEl);
        canvas.centerObject(mapEl);

        //Add the FabricImage object to BattleMap instance
        board.addMap(mapEl);
      };
    }
  }

  const addToken = () => {
    if (canvas) {
      var image = document.createElement('img');
      var source = document.createElement('source');
      image.src = 'https://www.dndbeyond.com/avatars/thumbnails/6/365/420/618/636272701937419552.png';

      //Make sure image's link source works
      image.onerror = function () {
        alert('Token link is invalid or is not compatible');
      };

      //Make sure image loads before loading to Canvas
      image.onload = function () {
        image.appendChild(source);
        var tokenEl = new Token(image);
        var sizeCode = 1;
        tokenEl.setSizeCode(sizeCode);
        tokenEl.setName("TestName");

        //Calculate Largest Radius Fitting in Image with Padding
        let newRadius: number;
        if (tokenEl.width >= tokenEl.height) {
          newRadius = tokenEl.height / 4;
        }
        else {
          newRadius = tokenEl.width / 4;
        }

        //Clipping Token Image into a circle
        tokenEl.set({
          dirty: true, selection: true,
          clipPath: new Circle({ objectCaching: true, radius: newRadius, originX: 'center', originY: 'center'})
        });

        //Circle with border that will change color
        var circleBorder = new Circle({
          radius: newRadius, strokeWidth: 5, lockScalingX: false, lockScalingY: false, originX: 'center', originY: 'center',
          fill: 'transparent', stroke: 'green'
        });

        //Create group of Token and Border set as Group. FixedLayout used to change bounding box to fit circle.
        var group = new Group([tokenEl, circleBorder], {
          width: newRadius * 2 * 1.1, height: newRadius * 2 * 1.1, originX: 'center', originY: 'center',
          lockRotation: true, lockSkewingX: true, lockSkewingY: true, lockScalingFlip: true, lockScalingY: true, lockScalingX: true,
          layoutManager: new LayoutManager(new FixedLayout())
        });

        //Get center point of Token Image to set circleBorder onto
        let center = group.getCenterPoint();
        circleBorder.setXY(center, 'center', 'center');
        tokenEl.setXY(center, 'center', 'center');

        canvas.on('object:removed', (event) => {
          if (event.target == group) {
            board.removeToken(group);
          }
        });

        //Textbox element to show Token's name. Must be added after Token added to canvas because
        //textbox must not be in same group.
        var nameBox = new Textbox(tokenEl.getName(), {selectable:false, lockRotation:true,lockScalingFlip:true,
          lockSkewingX:true, lockSkewingY:true, fill:'rgba(227, 207, 207, 1)', fontSize: newRadius * 2 / 20,
          textAlign:'center'
        });
        
        //When adding Tokens check whether a grid has been added and resize accordingly
        if (board.getSmallestGridUnit() > 0) {
          group.scaleToHeight(board.getSmallestGridUnit() * tokenEl.getSizeCode());
          nameBox.scaleToHeight(board.getGridUnitHeight() / 5);
        }
        //Otherwise scale height to the Token's image
        else if (canvas.getObjects()[0] instanceof FabricImage) {
          group.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 15 * sizeCode);
        }

        //Add Token group to the canvas
        canvas.add(group);
        canvas.centerObject(group);

        //Add textbox to canvas
        //Align textbox to bottom center of the Token
        let bottomLeft = circleBorder.getCoords()[3];
        let newPoint = new Point();
        newPoint.x = group.getCenterPoint().x;
        newPoint.y = bottomLeft.y;
        nameBox.setXY(newPoint, 'center', 'top');
        nameBox.setCoords();
        canvas.add(nameBox);

        //Alert if Token was not added to Battle Map correctly
        if (!board.addToken(group, [nameBox])) {
          alert("Token not added correctly");
        }

        //When Token is selected, add a listener for the context menu
        //and prevent context menu from being exited
        group.on('selected', () => {
          let selectedObjects = canvas.getActiveObjects();
          let allTokens: boolean = true;
          let tokenNumber: number = 0;
          //Iterate over selected objects and determine if all are Token groups
          for (let i = 0; i < selectedObjects.length; i++) {
            if ((selectedObjects[i] instanceof Group) && (selectedObjects[i].getObjects().length > 1)
              && (selectedObjects[i].getObjects()[0] instanceof Token)) {
              tokenNumber++;
            }
            else //If not a Token Group end loop
            {
              allTokens = false;
              break;
            }
          }

          //If all selected Group objects are Token groups then allow context menu access
          if (allTokens) {
            document.addEventListener('contextmenu', cmManager.updateContextMenuPosition);
            cmManager.setContextMenuExit(false);
            if (tokenNumber > 1) {
              cmManager.setMultiSelectionBool(true);
              let groupBox = canvas.getActiveObject();
              groupBox.on('mouseover', () => {
                document.addEventListener('contextmenu', cmManager.updateContextMenuPosition)
              });
              groupBox.on('mouseout', () => {
                document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
              })
            }
            else {
              cmManager.setMultiSelectionBool(false);
            }
          }
        });

        //When mouse hovers over Token group and the group is selected, add listener for context menu
        group.on('mouseover', () => {
          let selectedObjects = canvas.getActiveObjects();
          for (let i = 0; i < selectedObjects.length; i++) {
            if (selectedObjects[i] == group) {
              document.addEventListener('contextmenu', cmManager.updateContextMenuPosition);
              break;
            }
          }
        });

        //When mouse no longer hovers over Token group, remove listener for context menu
        group.on('mouseout', (mouseEvent) => {
          let selectedObjects = canvas.getActiveObjects();
          for (let i = 0; i < selectedObjects.length; i++) {
            if (selectedObjects[i] == group) {
              document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
              break;
            }
          }
        });

        //When Token group is no longer selected, remove listener for context menu and
        //allow context menu to be exited
        group.on('deselected', () => {
          document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
          cmManager.setContextMenuExit(true);
          cmManager.setMultiSelectionBool(false);
        });

        //If no objects have been added, add event to handle all object grid snapping and non-snapping movement
      //Will be removed once Scene Switching has been implemented
        if (!objectAdded) {
          canvas.on('object:moving', (event) => {
            if(gridSet && board.getGridSnap())
            {
              handleObjectSnapping(canvas, event.target, board);
            }
            else
            {
              handleObjectMoving(canvas, event.target);
            }
          });
        }
      };
    }
  }

  //Boolean to determine whether a grid is being set
  var resizing = false;
  
  //The user manipulatable rectangle that is the base unit of the grid
  var resizeRect: Rect;

  //Boolean set when a grid has been created
  var gridSet = false;
  
  //The Group of lines drawn onto the Canvas
  var grid: Group = new Group([], { selectable: false, hasControls: false });

  //Function called by a toolbar button to create a grid.
  var resizeGrid = () => {
    //If no preexisting grid rect to use, create a new one
    if (!resizeRect) {
      resizeRect = new Rect({
        lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true,
        fill: 'transparent', strokeWidth: 1, stroke: 'red', height: window.innerHeight / 40,
      });
      resizeRect.width = resizeRect.height;
    }

    //If no resizing occurred
    if (!resizing) {
      if (gridSet) {
        canvas.remove(grid);
        while (!grid.isEmpty()) {
          grid.remove(grid._objects[0]);
        }
        gridSet = false;
      }
      canvas.add(resizeRect);
      canvas.centerObject(resizeRect);
      resizing = true;
    }
    else if (canvas.item(0) instanceof FabricImage) {
      //Get canvas coordinates of the 4 corners of both the map and resize rectangle
      let map = canvas.item(0);
      let mapBounds: TCornerPoint = map.aCoords;
      let rectBounds: TCornerPoint = resizeRect.aCoords;

      //Calculate x and y distance to create lines over
      var xDistance = rectBounds.bl.distanceFrom(rectBounds.br);
      var yDistance = rectBounds.bl.distanceFrom(rectBounds.tl);

      //Variable to contain increment from single rectangle to new line
      var totalDistance = 0;

      //If grid setting rect outside of map image then alert user and don't set grid
      if (rectBounds.bl.x < mapBounds.bl.x || rectBounds.bl.y > mapBounds.bl.y ||
        rectBounds.tr.x > mapBounds.tr.x || rectBounds.tr.y < mapBounds.tr.y) {
        alert('Grid Setting Rectangle is Out of Map\'s Bounds');
        return;
      }

      //Draw vertical lines to right
      while (true) {
        if (totalDistance + rectBounds.bl.x < mapBounds.br.x) {
          let newLine = new Line([rectBounds.bl.x + totalDistance, mapBounds.bl.y,
          rectBounds.bl.x + totalDistance, mapBounds.tl.y],
            { selectable: false, hasControls: false, stroke: 'red', strokeWidth: 1, opacity: 0.4 }
          );
          grid.add(newLine);
          totalDistance += xDistance;
        } else {
          break;
        }
      }

      //Reset distance increment
      totalDistance = xDistance;

      //Draw vertical lines to left
      while (true) {
        if (rectBounds.bl.x - totalDistance > mapBounds.bl.x) {
          let newLine = new Line([rectBounds.bl.x - totalDistance, mapBounds.bl.y,
          rectBounds.bl.x - totalDistance, mapBounds.tl.y],
            { selectable: false, hasControls: false, stroke: 'red', strokeWidth: 1, opacity: 0.4 }
          );
          grid.add(newLine);
          totalDistance += xDistance;
        } else {
          break;
        }
      }

      //Reset distance increment
      totalDistance = yDistance;

      //Draw horizontal line to above
      while (true) {
        //Fabric.js has y coordinates increase down
        if (rectBounds.bl.y - totalDistance > mapBounds.tl.y) {
          let newLine = new Line([mapBounds.bl.x, rectBounds.bl.y - totalDistance,
          mapBounds.br.x, rectBounds.bl.y - totalDistance],
            { selectable: false, hasControls: false, stroke: 'red', strokeWidth: 1, opacity: 0.4 }
          );
          grid.add(newLine);
          totalDistance += yDistance;
        } else {
          break;
        }
      }

      //Reset distance increment
      totalDistance = 0;

      //Draw horizontal line to below
      while (true) {
        //Fabric.js has y coordinates increase down
        if (rectBounds.bl.y + totalDistance < mapBounds.bl.y) {
          let newLine = new Line([mapBounds.bl.x, rectBounds.bl.y + totalDistance,
          mapBounds.br.x, rectBounds.bl.y + totalDistance],
            { selectable: false, hasControls: false, stroke: 'red', strokeWidth: 1, opacity: 0.4 }
          );
          grid.add(newLine);
          totalDistance += yDistance;
        } else {
          break;
        }
      }

      //Set true to remove grid lines on future resizes
      gridSet = true;

      //Set false to allow new grid resizes on button press
      resizing = false;

      //Add grid to canvas
      canvas.add(grid);
      canvas.sendObjectToBack(grid);
      canvas.bringObjectForward(grid);

      //resize all tokens on the map to the grid
      board.resizeAllObjects(resizeRect.getScaledWidth(), resizeRect.getScaledHeight(), resizeRect.aCoords, resizeRect.getCenterPoint());

      //Remove the grid resizing rectangle
      canvas.remove(resizeRect);
    }
  }

  return (
    <div className="Toolbar">
      <button id="rect" onClick={addShape}>Shape</button>
      <button id="image" onClick={addImage}>Map</button>
      <button id="token" onClick={addToken}>Token</button>
      <button id="grid" onClick={resizeGrid}>Grid</button>
    </div>
  )
}

export default Toolbar