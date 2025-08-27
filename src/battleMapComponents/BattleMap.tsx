import { Canvas, Group, type TCornerPoint, Point, FabricImage, FabricObject, Circle } from 'fabric';
import { useState } from 'react'
import { Token } from '../tokenComponents/Token';

/*
BattleMap is a class that stores Fabric.js canvas object references and other data members used for
Battle Map functionality such as for token snapping. BattleMap provides functions that get, set, add, and
remove from data members.
*/

class BattleMap {
  //String which is displayed to the user on the Scene Selection Menu
  private name: string;

  //A list which contains a reference to a Group which contains a Token object (With a Specified Order and Composition)
  // and an array of references to associated FabricObjects such as a token name textbox
  private tokenGroups: [Group, FabricObject[]][] = [];

  //A list which contains a reference to non-token interactable objects on a BattleMap such as a circle and an associated
  // size multiplier used to scale the object to the grid.
  private objects: [FabricObject, number][] = [];

  //A list of FabricImages that can be switched between a single BattleMap instance. Currently only supports a single image.
  private maps: FabricImage[] = [];

  //The index number used to access the current FabricImage being displayed on the canvas. Currently not implemented.
  private currentMap: number = 0;

  //The non-zero number of the smallest value of either a single grid unit's width or height. Used for
  // performing snapping calculations in GridSnappingHelper. A negative number indicates no grid has been set.
  private smallestGridUnit: number = -1;

  //The center coordinate of the originating resizing grid unit (the rectangle used to set the grid). Used for
  // performing snapping calculations in GridSnappingHelper.
  private centerPoint: Point;

  //The coordinates of all four corners of the originating resizing grid unit (the rectangle used to set the grid). Used for
  // performing snapping calculations in GridSnappingHelper.
  private cornerPoints: TCornerPoint;

  //The boolean which sets whether a BattleMap will snap elements to a grid. User will change boolean according to whether they
  // want to have grid snapping in the Sidebar Menu.
  private gridSnap: boolean = true;

  //The non-zero numbers of a single grid unit's width and height. Used for
  // performing snapping calculations in GridSnappingHelper. A negative number indicates no grid has been set.
  private gridUnitHeight: number = -1;
  private gridUnitWidth: number = -1;

  //Basic constructor requires a unique and valid name string and a reference to the associated Canvas object.
  // The name is validated by the Sidebar Menu.
  constructor(name: string) {
    if(name.trim() == "")
    {
      throw new Error("BattleMap name cannot be empty or only spaces");
    }
    if(name.length > 64)
    {
      throw new Error("BattleMap name's length cannot be greater than 64 characters");
    }
    this.name = name;

  }

  //Function that returns the string name of the BattleMap. 
  public getName(): string {
    return this.name;
  }

  //Function that sets the name of the BattleMap. Returns true if a valid name and false if invalid.
  public setName(newName: string): boolean {
    //Remove spaces and check if length is not too long
    if(newName.trim() != "" && newName.length <= 64)
    {
      this.name = newName;
      return true;
    }
    return false;
  } 

  //A function that adds new token and associated list of FabricObjects to be tracked in instance of BattleMap. 
  // Returns boolean depending on success of Token addition. Function validates whether the Group object is
  // a Token group.
  public addToken(newToken: Group, tokenObjects: FabricObject[]): boolean {
    //Check if provided Group is a valid Token Group. If so, add to tokenGroups data member.
    if (newToken && newToken.getObjects().length > 1 && newToken.getObjects()[0] instanceof Token) {
      this.tokenGroups.push([newToken, tokenObjects]);
      return true;
    }
    return false;
  }

  //Function that Removes token from being tracked in instance of BattleMap. Returns the
  //target token to be removed. Called when canvas object removed event triggers and
  //is a Token group. Removes any associated Token elements such as name textbox.
  public removeToken(removeToken: Group, canvas: Canvas) {
    //Validate whether provided Group is a Token Group
    if (removeToken && removeToken.getObjects().length > 1 && removeToken.getObjects()[0] instanceof Token) {
      let index = -1;
      //Iterate over tracked Tokens and if found, track the index of the Token.
      for (let i = 0; i < this.tokenGroups.length; i++) {
        if (this.tokenGroups[i][0] == removeToken) {
          index = i;
          break;
        }
      }
      //Pop the Token Group and associated FabricObjects and return the Token group.
      if (index > -1) {
        let removedTokens = this.tokenGroups.splice(index, 1);
        return removedTokens[0];
      }
    }
    return null;
  }

  //Function that adds new objects to be tracked in instance of BattleMap. Returns boolean depending on
  //success of object addition. Examples of objects include circles, rectangles, and polygons.
  public addObject(newObject: FabricObject, multiplier: number): boolean {
    //Check if provided object is not null and multiplier is valid. If so, add object with multiplier.
    if (newObject && multiplier > 0) {
      this.objects.push([newObject, multiplier]);
      return true;
    }
    return false;
  }

  //Funciton that removes shape from being tracked in instance of BattleMap. Returns the
  //target shape to be removed. Called when canvas object removed event triggers and
  //is a shape.
  public removeObjects(removeObject: FabricObject) {
    //Check if removeObject is not null
    if (removeObject) {
      let index = -1;
      //Iterate over tracked objects and if found, track index
      for (let i = 0; i < this.objects.length; i++) {
        if (this.objects[i][0] == removeObject) {
          index = i;
          break;
        }
      }

      //If object was found, remove it and it's multiplier. Return the object.
      if (index > -1) {
        let removedTokens = this.objects.splice(index, 1);
        return removedTokens[0][0];
      }
    }
    return null;
  }

  //Function that scales a specified Token according to the new size based on the grid.
  // Used by ContextMenu when setting Token size
  public resizeToken(token: Group, sizeCode: number, canvas: Canvas): boolean {
    let resizeToken;

    //Validate if Group is a valid Token group and the sizeCode is valid
    if (token && sizeCode > 0 &&
      token.getObjects().length > 1 && (resizeToken = token.getObjects()[0]) instanceof Token) {
      //Iterate over Tokens groups
      for (let i = 0; i < this.tokenGroups.length; i++) {
        //Check if Token group found
        if (token == this.tokenGroups[i][0]) {
          //Set the Token's size code
          resizeToken.setSizeCode(sizeCode);
          //Account for grid not yet created. Map must be used as baseline size. Currently
          //does not account for multiple Map Images for a calculation of size
          if (this.smallestGridUnit <= 0 && this.maps.length > 0) {
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
      return false;
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
    for (let i = 0; i < this.tokenGroups.length; i++) {
      let currentToken = this.tokenGroups[i][0].getObjects()[0];
      //Double check if 
      if (currentToken instanceof Token) {
        let sizeMultiplier = currentToken.getSizeCode();
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

  //Method to add a map's FabricImage to reference. Returns boolean of whether
  //map was added.
  public addMap(map: FabricImage): boolean {
    if (map) {
      this.maps.push(map);
      return true;
    }
    return false;
  }

  //Method to retrieve a a map's FabricImage reference with an index.
  public getMapAtIndex(index: number) {
    if (index && index > 0 && index < this.maps.length) {
      return this.maps[index];
    }
    return null;
  }

  //Method to retrieve the current map's FabricImage used on the canvas.
  //Returns null of no maps have been added.
  public getCurrentMap() {
    if (this.maps.length == 0) {
      return null;
    }
    else {
      return this.maps[this.currentMap];
    }
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