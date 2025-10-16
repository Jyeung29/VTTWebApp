import { Canvas, Group, type TCornerPoint, Point, FabricImage, FabricObject, Circle, Line, Rect } from 'fabric';
import { useState } from 'react'
import { Token } from '../tokenComponents/Token';
import Scene from '../SceneComponents/Scene';

/*
BattleMap is a child class of Scene that stores Fabric.js canvas object references and other data members used for
Battle Map functionality such as for token snapping. BattleMap provides functions that get, set, add, and
remove from data members.
*/

class BattleMap extends Scene {
  //The non-zero number of the smallest value of either a single grid unit's width or height. Used for
  // performing snapping calculations in GridSnappingHelper. A negative number indicates no grid has been set.
  protected smallestGridUnit: number = -1;

  //The center coordinate of the originating resizing grid unit (the rectangle used to set the grid). Used for
  // performing snapping calculations in GridSnappingHelper.
  protected centerPoint: Point;

  //The coordinates of all four corners of the originating resizing grid unit (the rectangle used to set the grid). Used for
  // performing snapping calculations in GridSnappingHelper.
  protected cornerPoints: TCornerPoint;

  //The boolean which sets whether a BattleMap will snap elements to a grid. User will change boolean according to whether they
  // want to have grid snapping in the Sidebar Menu.
  protected gridSnap: boolean = true;

  //Fabric Group object that contains the lines that create the grid
  protected gridGroup: Group = new Group([], { selectable: false, hasControls: false });

  //Fabric Rect object that is used to create a grid based on it's size
  protected resizeRect: Rect;

  //Boolean that indicates whether a grid has been placed and allows for snapping to occur if both it and gridSnap is set true
  protected gridPlaced: boolean = false;

  //The non-zero numbers of a single grid unit's width and height. Used for
  // performing snapping calculations in GridSnappingHelper. A negative number indicates no grid has been set.
  protected gridUnitHeight: number = -1;
  protected gridUnitWidth: number = -1;

  //Basic constructor requires a unique and valid name string and a reference to the associated Canvas object.
  // The name is validated by the Sidebar Menu.
  constructor(name: string, id:number, gridSnap?:boolean) {
    if(name.trim() == "")
    {
      throw new Error("BattleMap name cannot be empty or only spaces");
    }
    if(name.length > 64)
    {
      throw new Error("BattleMap name's length cannot be greater than 64 characters");
    }
    super(id);
    if(gridSnap != null)
    {
      this.gridSnap = gridSnap;
    }
    this.name = name;
  }

  public setGridPlaced(bool: boolean): boolean {
    this.gridPlaced = bool;
    return true;
  }

  public getGridPlaced(): boolean {
    return this.gridPlaced;
  }

  public getResizeRect() {
    return this.resizeRect;
  }

  public setResizeRect(rect: Rect): boolean {
    if(rect)
    {
      this.resizeRect = rect;
      return true;
    }
    return false;
  }

  public getGridGroup(): Group {
    return this.gridGroup;
  }

  //Function that scales a specified Token according to the new size based on the grid.
  // Used by ContextMenu when setting Token size
  public resizeToken(token: Group, sizeCode: number, canvas: Canvas, 
    canvasCollection: [string, Canvas[], Scene[], Token[][], FabricImage[][]][], canvasIndex:number[] ): boolean {
    let resizeToken;

    //Validate if Group is a valid Token group and the sizeCode is valid
    if (token && sizeCode > 0 &&
      token.getObjects().length > 1 && (resizeToken = token.getObjects()[0]) instanceof FabricImage) {
      //Iterate over Tokens groups
      for (let i = 0; i < this.tokenGroups.length; i++) {
        //Check if Token group found
        if (token == this.tokenGroups[i][0]) {
          let tokenInfo;
              let infoIndex = -1;
              for(let j = 0; j < canvasCollection[canvasIndex[0]][4][canvasIndex[1]].length; j++)
              {
                if(canvasCollection[canvasIndex[0]][4][canvasIndex[1]][j] == resizeToken)
                {
                  tokenInfo = canvasCollection[canvasIndex[0]][3][canvasIndex[1]][j];
                  infoIndex = j;
                  break;
                }
              }
        if(tokenInfo == null)
        {
          throw Error('Token Info not found');
        }
          //Set the Token's size code
          tokenInfo.setSizeCode(sizeCode);
          //Account for grid not yet created. Map must be used as baseline size. Currently
          //does not account for multiple Map Images for a calculation of size
          if (this.smallestGridUnit <= 0 && this.images.length > 0) {
            let newHeight = canvas.getObjects()[0].getScaledHeight() / 15 * sizeCode;
            this.tokenGroups[i][0].scaleToHeight(newHeight);
          }
          //Check whether grid has been added. Assumed that if it is, then map image already present.
          else if (this.smallestGridUnit > 0) {
            this.tokenGroups[i][0].scaleToHeight(this.smallestGridUnit * sizeCode);
            this.tokenGroups[i][1][0].scaleToHeight(this.gridUnitHeight / 5);
          }

          //Set the Token's name textbox to be underneath resized Token
          let newX = this.tokenGroups[i][0].getObjects()[1].getCenterPoint().x;
          let newY = this.tokenGroups[i][0].getObjects()[1].getCoords()[3].y;
          let newPoint = new Point({ x: newX, y: newY });
          this.tokenGroups[i][1][0].setXY(newPoint, 'center', 'top');

          //Update coordinates so Canvas caching sets dirty and renders correctly
          this.tokenGroups[i][1][0].setCoords();

          //Render changes to the Canvas
          canvas.renderAll();
          return true;
        }
      }
      //Token not found
    }
    return false;
  }

  //Function that scales all objects and Tokens tracked by the BattleMap. Returns either error that
  //indicates invalid size number or number of objects unable to be resized. Called when grid is created or resized by Toolbar.
  public resizeAllObjects(width: number, height: number, corners: TCornerPoint, center: Point, 
    canvasCollection: [string, Canvas[], Scene[], Token[][], FabricImage[][]][], canvasIndex:[number,number]): number {
    //Check whether necessary grid information is provided
    if (!width || !height || !corners || !center || width <= 0 || height <= 0) {
      return -1; //Indicates error
    }

    //Find smallest grid unit and save it.
    if (width >= height) {
      this.smallestGridUnit = height;
    }
    else {
      this.smallestGridUnit = width;
    }

    //Track grid unit width and height.
    this.gridUnitHeight = height;
    this.gridUnitWidth = width;

    var errorCount = 0; //Indicates number of objects not resized

    if(canvasIndex[0] < 0 || canvasIndex[1] < 0)
    {
      throw Error('Index for accessing Token Info is negative');
    }

    //Iterate over Token groups and resize them all
    for (let i = 0; i < this.tokenGroups.length; i++) {
      let currentToken = this.tokenGroups[i][0].getObjects()[0];
      //Double check if 
      if (currentToken instanceof FabricImage) {
        let tokenInfo;
              let infoIndex = -1;
              for(let j = 0; j < canvasCollection[canvasIndex[0]][4][canvasIndex[1]].length; j++)
              {
                if(canvasCollection[canvasIndex[0]][4][canvasIndex[1]][j] == currentToken)
                {
                  tokenInfo = canvasCollection[canvasIndex[0]][3][canvasIndex[1]][j];
                  infoIndex = j;
                  break;
                }
              }
        if(tokenInfo == null)
        {
          throw Error('Token Info not found');
        }

        let sizeMultiplier = tokenInfo.getSizeCode();
        this.tokenGroups[i][0].scaleToHeight(this.smallestGridUnit * sizeMultiplier);

        //Resize Associated Token Elements such as name textbox
        if (this.tokenGroups[i][1].length > 0) {
          this.tokenGroups[i][1][0].scaleToHeight(this.gridUnitHeight / 5);
          let newX = this.tokenGroups[i][0].getObjects()[1].getCenterPoint().x;
          let newY = this.tokenGroups[i][0].getObjects()[1].getCoords()[3].y;
          let newPoint = new Point({ x: newX, y: newY });
          this.tokenGroups[i][1][0].setXY(newPoint, 'center', 'top');
          this.tokenGroups[i][1][0].setCoords();
        }
      }
      else {
        errorCount++;
      }
    }

    //Iterate over objects and resize them all
    for (let i = 0; i < this.objects.length; i++) {
      let currentObject = this.objects[i][0];
      let multiplier = this.objects[i][1];

      //Circles have different multiplier logic due to radius data member in Fabric.js
      if (currentObject instanceof Circle && multiplier > 0) {
        currentObject.scaleX = this.gridUnitWidth / 600 * multiplier;
        currentObject.scaleY = this.gridUnitHeight / 600 * multiplier;
      }
      else if (currentObject instanceof FabricObject && multiplier > 0) {
        currentObject.scaleToHeight(this.gridUnitHeight * multiplier);
      }
      else {
        errorCount++;
      }
    }
    //Save current grid coordinates and size to use in GridSnappingHelper
    this.cornerPoints = corners;
    this.centerPoint = center;
    return errorCount;
  }

  //Function that sets whether objects should snap on grid on this BattleMap. Returns true if gridSnap has been set.
  public setGridSnap(snap: boolean): boolean {
    if (snap != null) {
      this.gridSnap = snap;
      return true;
    }
    return false;
  }

  //Function that returns boolean of whether objects should snap on grid for this BattleMap. 
  public getGridSnap(): boolean {
    return this.gridSnap;
  }

  //Returns the current smallestGridUnit size. smallestGridUnit is set by resizeAllTokens. Will return
  //-1 if resizeAllTokens has not been called before this method is called. 
  public getSmallestGridUnit(): number {
    return this.smallestGridUnit;
  }

  //Returns current gridUnitHeight. gridUnitHeight is set by resizeAllTokens. Will return -1 if
  //resizeAllTokens has not been called before this method is called.
  public getGridUnitHeight(): number {
    return this.gridUnitHeight;
  }

  //Returns current gridUnitWidth. gridUnitWidth is set by resizeAllTokens. Will return -1 if
  //resizeAllTokens has not been called before this method is called.
  public getGridUnitWidth(): number {
    return this.gridUnitWidth;
  }

  //Returns corner Point coordinates of the grid resizing rectangle. Used to calculate
  //snapping distances in GridSnappingHelper.
  public getCornerPoints(): TCornerPoint {
    return this.cornerPoints;
  }

  //Returns center Point coorindate of the grid resizing rectangle. Used to calculate
  //snapping distances in GridSnappingHelper.
  public getCenterPoint(): Point {
    return this.centerPoint;
  }
}

export default BattleMap;