import { Canvas, Group, type TCornerPoint, Point, FabricImage, FabricObject, Circle, Textbox } from 'fabric';
import { useState } from 'react'
import { Token } from './Token';

//Class definition for BattleMap
class BattleMap {
  private name: string;
  private tokenGroups: [Group, FabricObject[]][] = [];
  private objects: [FabricObject, number][] = [];
  private maps: FabricImage[] = [];
  private currentMap: number = 0;
  private canvas;
  private smallestGridUnit: number = -1;
  private centerPoint: Point;
  private cornerPoints: TCornerPoint;
  private gridSnap: boolean = true;
  private gridUnitHeight = -1;
  private gridUnitWidth = -1;

  constructor(name: string, canvas: Canvas) {
    this.name = name;
    this.canvas = canvas;
  }

  //Adds new token to be tracked in instance of BattleMap. Returns boolean depending
  //on success of Token addition.
  public addToken(newToken: Group, tokenObjects: FabricObject[]): boolean {
    if (newToken && newToken.getObjects().length > 1 && newToken.getObjects()[0] instanceof Token) {
      this.tokenGroups.push([newToken, tokenObjects]);
      return true;
    }
    return false;
  }

  //Removes token from being tracked in instance of BattleMap. Returns the
  //target token to be removed. Called when canvas object removed event triggers and
  //is a Token group. Removes any associated Token elements such as name textbox.
  public removeToken(removeToken: Group, canvas: Canvas) {
    if (removeToken && removeToken.getObjects().length > 1 && removeToken.getObjects()[0] instanceof Token) {
      let index = -1;
      for (let i = 0; i < this.tokenGroups.length; i++) {
        if (this.tokenGroups[i][0] == removeToken) {
          /*console.log("found" + i)
          canvas.remove(this.tokenGroups[i][0]);
          for(let j = 0; j < this.tokenGroups[i][1].length; j++)
          {
            console.log(j);
            canvas.remove(this.tokenGroups[i][1][j]);
          }*/
          index = i;
          break;
        }
      }
      if (index > -1) {
        let removedTokens = this.tokenGroups.splice(index, 1);
        return removedTokens[0];
      }
    }
    return null;
  }

  //Adds new shape to be tracked in instance of BattleMap. Returns boolean depending on
  //success of shape addition.
  public addObject(newObject: FabricObject, multiplier: number): boolean {
    if (newObject) {
      this.objects.push([newObject, multiplier]);
      return true;
    }
    return false;
  }

  //Removes shape from being tracked in instance of BattleMap. Returns the
  //target shape to be removed. Called when canvas object removed event triggers and
  //is a shape.
  public removeObjects(removeObject: FabricObject) {
    if (removeObject) {
      let index = -1;
      for (let i = 0; i < this.objects.length; i++) {
        if (this.objects[i][0] == removeObject) {
          index = i;
          break;
        }
      }

      if (index > -1) {
        let removedTokens = this.objects.splice(index, 1);
        return removedTokens[0][0];
      }
    }
    return null;
  }

  //Scales a specified Token according to the new size based on the grid
  public resizeToken(token: Group, sizeCode: number, canvas:Canvas): boolean {
    let resizeToken;

    if (token && sizeCode > 0 &&
      token.getObjects().length > 1 && (resizeToken = token.getObjects()[0]) instanceof Token) {
      //Find Tokens added to the BattleMap
      for (let i = 0; i < this.tokenGroups.length; i++) {
        if (token == this.tokenGroups[i][0]) {
          resizeToken.setSizeCode(sizeCode);
          //Account for grid not yet created. Map must be used as baseline size. Currently
          //does not account for multiple Map Images for a calculation of size
          if(this.smallestGridUnit <= 0 && this.maps.length > 0)
          {
            let newHeight = canvas.getObjects()[0].getScaledHeight() / 15 * sizeCode;
          this.tokenGroups[i][0].scaleToHeight(newHeight);
          }
          //Check whether grid has been added. Assumed that if it is, then map image already present.
          else if(this.smallestGridUnit > 0)
          {
            this.tokenGroups[i][0].scaleToHeight(this.smallestGridUnit * sizeCode);
            this.tokenGroups[i][1][0].scaleToHeight(this.gridUnitHeight / 5);
          }
          
          let newX = this.tokenGroups[i][0].getObjects()[1].getCenterPoint().x;
          let newY = this.tokenGroups[i][0].getObjects()[1].getCoords()[3].y;
          let newPoint = new Point({ x: newX, y: newY });
          this.tokenGroups[i][1][0].setXY(newPoint, 'center', 'top');
          this.tokenGroups[i][1][0].setCoords();
          canvas.renderAll();
          return true;
        }
      }
      //Token not found
      return false;
    }
    return false;
  }

  //Scales the Token size to the specified number. Returns either error that
  //indicates invalid size number or number of tokens unable to be resized.
  public resizeAllObjects(width: number, height: number, corners: TCornerPoint, center: Point): number {
    if (!width || !height || !corners || !center || width <= 0 || height <= 0) {
      return -1; //Indicates error
    }

    //Find smallest grid unit to resize to
    if (width >= height) {
      this.smallestGridUnit = height;
    }
    else {
      this.smallestGridUnit = width;
    }
    this.gridUnitHeight = height;
    this.gridUnitWidth = width;

    var errorCount = 0; //Indicates number of tokens not resized

    if (this.tokenGroups.length > 0) {
      for (let i = 0; i < this.tokenGroups.length; i++) {
        let currentToken = this.tokenGroups[i][0].getObjects()[0];
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
    }

    if (this.objects.length > 0) {
      for (let i = 0; i < this.objects.length; i++) {
        let currentObject = this.objects[i][0];
        let multiplier = this.objects[i][1];
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
    }

    //Save current grid coordinates and size to use in GridSnappingHelper
    this.cornerPoints = corners;
    this.centerPoint = center;
    return errorCount;
  }

  //Set whether objects should snap on grid on this BattleMap. Returns true if gridSnap has been set.
  public setGridSnap(snap: boolean): boolean {
    if (snap) {
      this.gridSnap = snap;
      return true;
    }
    return false;
  }

  //Returns boolean of whether objects should snap on grid for this BattleMap. 
  public getGridSnap(): boolean {
    return this.gridSnap;
  }

  //Method to add a map's FabricImage to reference. Returns of boolean of whether
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