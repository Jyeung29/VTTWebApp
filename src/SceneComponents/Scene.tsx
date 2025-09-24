import { Canvas, Group, type TCornerPoint, Point, FabricImage, FabricObject, Circle } from 'fabric';
import { useState } from 'react'
import { Token } from '../tokenComponents/Token';

/*
Scene is an abstract class extended by BattleMap and RoleplayingScene that stores Fabric.js canvas object 
references and other data members. Scene provides functions that get, set, add, and
remove from data members.
*/

abstract class Scene {
  //String which is displayed to the user on the Scene Selection Menu
  protected name: string = '';

  //A list which contains a reference to a Group which contains a Token object (With a Specified Order and Composition)
  // and an array of references to associated FabricObjects such as a token name textbox
  protected tokenGroups: [Group, FabricObject[]][] = [];

  //A list which contains a reference to non-token interactable objects on a Scene such as a circle and an associated
  // size multiplier used to scale the object to the grid.
  protected objects: [FabricObject, number][] = [];

  //A list of FabricImages that can be switched between a single Scene instance. Currently only supports a single image.
  protected images: FabricImage[] = [];

  //The index number used to access the current FabricImage being displayed on the canvas. Currently not implemented.
  protected currentImage: number = 0;

  //Variable that stores URLs of images while also storing the provided file's id in their associated
    //cloud storage service such as Google Drive or OneDrive.
    protected imageURLs: [string, string][] = [];

  protected id = -1;

  constructor(id: number)
  {
    this.id = id;
  }

  public getID(): number {
    return this.id;
  }

  //Function that returns the string name of the Scene. 
  public getName(): string {
    return this.name;
  }

  //Function that sets the name of the Scene. Returns true if a valid name and false if invalid.
  public setName(newName: string): boolean {
    //Remove spaces and check if length is not too long
    if(newName.trim() != "" && newName.length <= 64)
    {
      this.name = newName.trim();
      return true;
    }
    return false;
  } 

  //A function that adds new token and associated list of FabricObjects to be tracked in instance of Scene. 
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

  //Function that Removes token from being tracked in instance of Scene. Returns the
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

  //Function that adds new objects to be tracked in instance of Scene. Returns boolean depending on
  //success of object addition. Examples of objects include circles, rectangles, and polygons.
  public addObject(newObject: FabricObject, multiplier: number): boolean {
    //Check if provided object is not null and multiplier is valid. If so, add object with multiplier.
    if (newObject && multiplier > 0) {
      this.objects.push([newObject, multiplier]);
      return true;
    }
    return false;
  }

  //Funciton that removes shape from being tracked in instance of Scene. Returns the
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

  //Method to add a map's FabricImage to reference. Returns boolean of whether
  //map was added.
  public addImage(image: FabricImage): boolean {
    if (image) {
      this.images.push(image);
      return true;
    }
    return false;
  }

  //Method to retrieve a a map's FabricImage reference with an index.
  public getImageAtIndex(index: number) {
    if (index && index > 0 && index < this.images.length) {
      return this.images[index];
    }
    return null;
  }

  //Method to retrieve the current map's FabricImage used on the canvas.
  //Returns null of no maps have been added.
  public getCurrentImage() {
    if (this.images.length == 0) {
      return null;
    }
    else {
      return this.images[this.currentImage];
    }
  }
}

export default Scene;