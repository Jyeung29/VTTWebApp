import '../index.css';
import {
  FabricImage, Rect, Circle, type TCornerPoint,
  Line,
} from "fabric";
import { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';

/*
Function component Toolbar is displayed at the top of the user's window and provides a GM with tools to
interact and change the BattleMap or Roleplaying Scene's Canvas. Basic universal buttons include zooming, screen centering,
adding shapes, setting grids, and dice rolls. Different TableTopRoleplayingGame children may include exclusive features for
toolbar to display.
*/

function Toolbar({ canvas, scene, cmManager, canvasCollection }) {

  //State used to manage grid setting
  const [gridTrigger, setGridTrigger] = useState<boolean>(false);

  //Boolean to determine whether a grid is currently being set
  const [resizing, setResizing] = useState<boolean>(false);

  //Function called by a toolbar button to add a shape. Currently only adds a preset circle. The circle is able to scale with or without a grid.
  const addShape = () => {
    if (canvas) {
      let newWidth = 600;
      let newHeight = 600;
      let unitMultiplier = 4;

      //If grid has been set, set height and width to scale with multiplier
      if (scene.getGridUnitHeight() != -1 && scene.getGridUnitWidth() != -1) {
        newHeight = scene.getGridUnitHeight() * unitMultiplier;
        newWidth = scene.getGridUnitWidth() * unitMultiplier;
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
      if(scene.getSmallestGridUnit() <= 0)
      {
        circle.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 15 * unitMultiplier);
      }

      //Add shape to canvas
      canvas.add(circle);
      canvas.centerObject(circle);

      //Add to the BattleMap to track
      scene.addObject(circle, unitMultiplier);
    }
  }

  
  //Effect called whenever resizing is changed. Either hides or displays the Sidebar and non-grid Toolbar buttons
  useEffect(() => {
    //Find elements that should be hidden
    let sidebar = document.getElementsByClassName('GridSettingHiddenElement');
    //Check whether currently resizing and elements exist
    if(resizing && sidebar)
    {
      //Iterate and hide all elements found
      for(let i = 0; i < sidebar.length; i++)
      {
        let element = sidebar[i] as HTMLElement;
        element.style.display = 'none';
      }
    }
    else if(sidebar){
      //Iterate and display all elements found
      for(let i = 0; i < sidebar.length; i++)
      {
        let element = sidebar[i] as HTMLElement;
        element.style.display = 'block';
      }
    }
  }, [resizing]);

  //Effect triggered when Grid button is pressed to initiate grid setting
  useEffect(() => {
    //Only run if gridTrigger is true to prevent infinite loop
    if(gridTrigger)
    {
      //If no preexisting grid rect to use on the canvas, create a new one for the canvas
    if (!scene.getResizeRect()) {
      let resizeRect = new Rect({
        lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true,
        fill: 'transparent', strokeWidth: 1, stroke: 'red', height: window.innerHeight / 40,
      });
      resizeRect.width = resizeRect.height;
      scene.setResizeRect(resizeRect);
    }

    //If no resizing occurred
    if (!resizing) {
      //Make sure grid Group is not null and grid has been placed before
      if (scene.getGridPlaced() && scene.getGridGroup()) {
        canvas.remove(scene.getGridGroup());
        let grid = scene.getGridGroup();

        //Remove all the lines in the grid
        while (!grid.isEmpty()) {
          grid.remove(grid._objects[0]);
        }

        //Indicate Grid has not been placed on the canvas
        scene.setGridPlaced(false);
      }
      //Add the resizing rectangle to the canvas
      canvas.add(scene.getResizeRect());
      canvas.centerObject(scene.getResizeRect());

      //Deselect any objects on the canvas. Hides any contexts menus possibly opened
      canvas.discardActiveObject();
      
      //Trigger useeffect to hide all non-relevant elements to grid placement
      setResizing(true);

      //Prevent resizing rectangle from being deletable
      scene.setAllowDelete(false);

      //Make sure all objects in the canvas are not selectable during the grid resizing process
      let allObjects = canvas.getObjects();
      //Account for the map image and the resizing rectangle
      if(allObjects.length > 2)
      {
        //Skip map image and resizing rectangle and make elements unselectable
        for(let i = 1; i < allObjects.length - 1; i++)
        {
          allObjects[i].selectable = false;
        }
      }
    }
    else if (canvas.item(0) instanceof FabricImage && scene.getResizeRect()) {
      let resizeRect = scene.getResizeRect();
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

      let grid = scene.getGridGroup();

      //Draw vertical lines to right
      while (true) {
        if (totalDistance + rectBounds.bl.x < mapBounds.br.x && grid) {
          let newLine = new Line([rectBounds.bl.x + totalDistance, mapBounds.bl.y,
          rectBounds.bl.x + totalDistance, mapBounds.tl.y],
            { selectable: false, hasControls: false, stroke: 'red', strokeWidth: 1, opacity: 0.4 }
          );
          scene.getGridGroup().add(newLine);
          totalDistance += xDistance;
        } else {
          break;
        }
      }

      //Reset distance increment
      totalDistance = xDistance;

      //Draw vertical lines to left
      while (true) {
        if (rectBounds.bl.x - totalDistance > mapBounds.bl.x && grid) {
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
        if (rectBounds.bl.y - totalDistance > mapBounds.tl.y && grid) {
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
        if (rectBounds.bl.y + totalDistance < mapBounds.bl.y && grid) {
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
      scene.setGridPlaced(true);

      //Set false to allow new grid resizes on button press
      setResizing(false);

      //Make sure all objects in the canvas are not selectable during the grid resizing process
      let allObjects = canvas.getObjects();
      //Account for the map image and the resizing rectangle
      if(allObjects.length > 2)
      {
        //Skip map image and resizing rectangle and make elements unselectable
        for(let i = 1; i < allObjects.length - 1; i++)
        {
          allObjects[i].selectable = true;
        }
      }

      scene.setAllowDelete(true);

      //Add grid to canvas
      canvas.add(grid);
      canvas.sendObjectToBack(grid);
      canvas.bringObjectForward(grid);

      //resize all tokens on the map to the grid
      scene.resizeAllObjects(resizeRect.getScaledWidth(), resizeRect.getScaledHeight(), resizeRect.aCoords, resizeRect.getCenterPoint());

      //Remove the grid resizing rectangle
      canvas.remove(resizeRect);
    }
      setGridTrigger(false);
    }
  }, [gridTrigger]);

  return (
    <div className="Toolbar">
      <div className='GridSettingHiddenElement'>
        <Button id="shape" onClick={addShape}>Shape</Button>
      </div>
      <Button id="grid" onClick={() => {setGridTrigger(true);}}>Grid</Button>
    </div>
  )
}

export default Toolbar