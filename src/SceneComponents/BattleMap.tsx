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

  //
  public toObject(): Object {
    let parentObject = super.toObject();
    if (this.centerPoint && this.cornerPoints) {
      let corners = [];
      corners.push(this.cornerPoints.tl.toString());
      corners.push(this.cornerPoints.tr.toString());
      corners.push(this.cornerPoints.br.toString());
      corners.push(this.cornerPoints.bl.toString());
      return { ...parentObject, gridUnitHeight: this.gridUnitHeight, gridUnitWidth: this.gridUnitWidth, gridPlaced: this.gridPlaced, gridSnap: this.gridSnap, centerPoint: this.centerPoint.toString(), cornerPoints: corners }
    }
    return { ...parentObject, gridUnitHeight: this.gridUnitHeight, gridUnitWidth: this.gridUnitWidth, gridPlaced: this.gridPlaced, gridSnap: this.gridSnap }
  }

  //Basic constructor requires a unique and valid name string and a reference to the associated Canvas object.
  // The name is validated by the Sidebar Menu.
  constructor(name: string, id: number, gridSnap?: boolean);
  constructor(obj: Object);

  constructor(arg1: any, arg2?: any, arg3?: any) {
    if (typeof arg1 == 'string' && typeof arg2 == 'number' && (typeof arg3 == 'boolean' || arg3 == null)) {
      if (arg1.trim() == "") {
        throw new Error("BattleMap name cannot be empty or only spaces");
      }
      if (arg1.length > 64) {
        throw new Error("BattleMap name's length cannot be greater than 64 characters");
      }
      super(arg2);
      if (arg3 != null) {
        this.gridSnap = arg3;
      }
      this.name = arg1;
      this.SCENETYPE = 0;
    }
    else if (typeof arg1 == 'object') {
      super(arg1);
      if ('gridUnitHeight' in arg1 && typeof arg1.gridUnitHeight == 'number') {
        this.gridUnitHeight = arg1.gridUnitHeight;
      }
      if ('gridUnitWidth' in arg1 && typeof arg1.gridUnitWidth == 'number') {
        this.gridUnitWidth = arg1.gridUnitWidth;
      }
      if ('gridPlaced' in arg1 && typeof arg1.gridPlaced == 'boolean') {
        this.gridPlaced = arg1.gridPlaced;
      }
      if ('gridSnap' in arg1 && typeof arg1.gridSnap == 'boolean') {
        this.gridSnap = arg1.gridSnap;
      }
      let strArray;
      if ('centerPoint' in arg1 && typeof arg1.centerPoint == 'string' && (strArray = arg1.centerPoint.split(',')).length == 2) {
        if (Number(strArray[0]) != null && Number(strArray[1]) != null) {
          this.centerPoint = new Point();
          this.centerPoint.x = Number(strArray[0]);
          this.centerPoint.y = Number(strArray[1]);
        }
        else if (this.gridPlaced) {
          throw Error('Grid indicated to be placed but centerPoint string is unable to be converted to x and y coordinates');
        }
      }
      else if (this.gridPlaced) {
        throw Error('Grid indicated to be placed but centerPoint string is unable to be converted to x and y coordinates');
      }
      if('cornerPoints' in arg1 && Array.isArray(arg1.cornerPoints) && arg1.cornerPoints.length == 4)
      {
        let points:Point[] = [];
        for(let i = 0; i < 4; i++)
        {
          let temp;
          if((temp = arg1.cornerPoints[i].split(',')).length != 2 || Number(temp[0]) == null || Number(temp[1]) == null)
          {
            throw Error('cornerPoints array contains a string that is unable to convert to a number');
          }
          else
          {
            let point = new Point();
            point.x = Number(temp[0]);
            point.y = Number(temp[1]);
            points.push(point);
          }
        }
        
        this.cornerPoints = {tl: points[0], tr: points[1], br: points[2], bl: points[3] };
      }
    }
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
    if (rect) {
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
  public resizeToken(token: Group, sizeCode: number, canvas: Canvas): boolean {
    let resizeToken;

    //Validate if Group is a valid Token group and the sizeCode is valid
    if (token && sizeCode > 0 &&
      token.getObjects().length > 1 && (resizeToken = token.getObjects()[0]) instanceof FabricImage) {
      //Iterate over Tokens groups
      for (let i = 0; i < this.tokenGroups.length; i++) {
        //Check if Token group found
        if (token == this.tokenGroups[i][0]) {
          let tokenInfo;
          for (let j = 0; j < this.tokenGroups.length; j++) {
            if (this.tokenGroups[j][0] == token) {
              tokenInfo = this.tokenInfo[j];
              break;
            }
          }
          if (tokenInfo == null) {
            return false;
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
  public resizeAllObjects(width: number, height: number, corners: TCornerPoint, center: Point): number {
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

    //Iterate over Token groups and resize them all
    for (let i = 0; i < this.tokenGroups.length && i < this.tokenInfo.length; i++) {
      let currentToken = this.tokenGroups[i][0].getObjects()[0];
      let tokenInfo = this.tokenInfo[i];
      //Double check if 
      if (currentToken instanceof FabricImage) {

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