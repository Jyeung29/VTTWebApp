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

  protected tokenInfo: Token[] = [];

  //A list which contains a reference to non-token interactable objects on a Scene such as a circle and an associated
  // size multiplier used to scale the object to the grid.
  protected objects: FabricObject[] = [];

  protected objectSizeCodes: number[] = [];

  protected improperObjects:boolean = false;

  //A list of FabricImages that can be switched between a single Scene instance. Currently only supports a single image.
  protected images: FabricImage[] = [];

  //The index number used to access the current FabricImage being displayed on the canvas. Currently not implemented.
  protected currentImage: number = 0;

  protected allowDelete: boolean = true;

  //Variable that stores URLs of images while also storing the provided file's id in their associated
    //cloud storage service such as Google Drive or OneDrive.
    protected imageURLs: [string, string][] = [];

  protected id = -1;

  protected SCENETYPE = -1;

  //Overloaded toObject() must include a data member that indicates being a BattleMap or RoleplayingScene
  public toObject(): Object
  {
    //Get all Token object representations
    let tokenObjects = [];
    for(let i = 0; i < this.tokenInfo.length; i++)
    {
      tokenObjects.push(this.tokenInfo[i].toObject());
    }

    let otherObjects = [];
    for(let i = 0; i < this.objectSizeCodes.length; i++)
    {
      otherObjects.push(this.objectSizeCodes[i]);
    }

    return {SCENETYPE: this.SCENETYPE, name: this.name, currentImage: this.currentImage,
       imageURLs: this.imageURLs, id: this.id, tokenInfo:tokenObjects, otherObjects: otherObjects};
  }

  constructor(id: number);
  constructor(obj: Object);

  constructor(arg1: any)
  {
    if(typeof arg1 == 'number')
    {
      this.id = arg1;
    }
    else if(typeof arg1 == 'object')
    {
      if('SCENETYPE' in arg1 && typeof arg1.SCENETYPE == 'number' && Number.isInteger(arg1.SCENETYPE))
      {
        this.SCENETYPE = arg1.SCENETYPE;
      }
      else
      {
        throw Error('No SCENETYPE number provided');
      }

      if('currentImage' in arg1 && typeof arg1.currentImage == 'number' && Number.isInteger(arg1.currentImage))
      {
        this.currentImage = arg1.currentImage;
      }
      else
      {
        throw Error('No number is provided to be the currentImage index');
      }

      if('imageURLs' in arg1 && Array.isArray(arg1.imageURLs))
      {
        for(let i = 0; i < arg1.imageURLs.length; i++)
        {
          if(arg1.imageURLs[i].length != 2 || typeof arg1.imageURLs[i][0] != 'string' || typeof arg1.imageURLs[i][1] != 'string')
          {
            throw Error('imageURLs array contains an entry that is not two strings');
          }
        }
        this.imageURLs = arg1.imageURLs;
      }
      else
      {
        throw Error('No array is provided with imageURLs');
      }

      if('id' in arg1 && typeof arg1.id == 'number' && Number.isInteger(arg1.id))
      {
        this.id = arg1.id;
      }
      else
      {
        throw Error('No id was provided');
      }

      if('tokenInfo' in arg1 && Array.isArray(arg1.tokenInfo))
      {
        for(let i = 0; i < arg1.tokenInfo.length; i++)
        {
          if(typeof arg1.tokenInfo[i] == 'object')
            {
              try {
                this.tokenInfo.push(new Token(arg1.tokenInfo[i]));
              }
              catch(error)
              {
                throw error;
              }
            } 
        }
      }
      else
      {
        this.tokenInfo = [];
      }

      if('otherObjects' in arg1 && Array.isArray(arg1.otherObjects))
      {
        let newObjects = arg1.otherObjects;
        for(let i = 0; i < arg1.otherObjects.length; i++)
        {
          if(typeof arg1.otherObjects[i] != 'number' && !Number.isInteger(arg1.otherObjects[i]))
          {
            throw Error('Campaign file contains otherObject array item that is not an integer number');
          }
          if(arg1.otherObjects[i] <= 0) throw Error('Campaign file contains otherObject array itme that is less than or equal to 0');
        }
        this.objectSizeCodes = newObjects;
        //Flags that size codes are present but requires canvas reconstruction with object references to have
        //one to one relationship with objects array
        this.improperObjects = true;
      }

    }
  }

  public getID(): number {
    return this.id;
  }

  //Function that returns the string name of the Scene. 
  public getName(): string {
    return this.name;
  }

  public setAllowDelete(bool: boolean): boolean {
    this.allowDelete = bool;
    return true;
  }

  public getAllowDelete(): boolean {
    return this.allowDelete;
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
  public addToken(newToken: Group, tokenObjects: FabricObject[], tokenInfo?:Token): boolean {
    //Check if provided Group is a valid Token Group. If so, add to tokenGroups data member.
    if (newToken && newToken.getObjects().length > 1 && newToken.getObjects()[0] instanceof FabricImage) {
      this.tokenGroups.push([newToken, tokenObjects]);
      if(tokenInfo)this.tokenInfo.push(tokenInfo);
      return true;
    }
    return false;
  }

  public retrieveTokenInfo(targetToken: Group)
  {
    let index = -1;
    if (targetToken && targetToken.getObjects().length > 1 && targetToken.getObjects()[0] instanceof FabricImage) {
      for(let i = 0; i < this.tokenGroups.length; i++)
      {
        if(this.tokenGroups[i][0] == targetToken)
        {
          index = i;
          break;
        }
      }
      if(index >= 0)
      {
        return this.tokenInfo[index];
      }
    }
      return null;
  }

  //Function that Removes token from being tracked in instance of Scene. Returns the
  //target token to be removed. Called when canvas object removed event triggers and
  //is a Token group. Removes any associated Token elements such as name textbox.
  public removeToken(removeToken: Group) {
    //Validate whether provided Group is a Token Group
    if (removeToken && removeToken.getObjects().length > 1 && removeToken.getObjects()[0] instanceof FabricImage) {
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
        let removedInfo = this.tokenInfo.splice(index, 1);
        console.log(this.tokenInfo)
        console.log(this.tokenGroups)
        return [removedTokens, removedInfo];
      }
    }
    return null;
  }

  //Function that adds new objects to be tracked in instance of Scene. Returns boolean depending on
  //success of object addition. Examples of objects include circles, rectangles, and polygons.
  public addObject(newObject: FabricObject, multiplier: number): boolean {
    //Check if provided object is not null and multiplier is valid. If so, add object with multiplier.
    if (newObject && multiplier > 0) {
      this.objects.push(newObject);
      this.objectSizeCodes.push(multiplier);
      return true;
    }
    return false;
  }

  //Function that adds an object reference to be tracked in instance of Scene. Only used during reconstruction of
  //Scene's object representation
  public addObjectReference(newObject: FabricObject): boolean {
    if(newObject && this.objectSizeCodes.length > this.objects.length)
    {
      this.objects.push(newObject);
      return true;
    }
    return false;
  }

  //Function that removes shape from being tracked in instance of Scene. Returns the
  //target shape to be removed. Called when canvas object removed event triggers and
  //is a shape.
  public removeObjects(removeObject: FabricObject) {
    //Check if removeObject is not null
    if (removeObject) {
      let index = -1;
      //Iterate over tracked objects and if found, track index
      for (let i = 0; i < this.objects.length; i++) {
        if (this.objects[i] == removeObject) {
          index = i;
          break;
        }
      }

      //If object was found, remove it and it's multiplier. Return the object.
      if (index > -1) {
        let removedObject = this.objects.splice(index, 1);
        this.objectSizeCodes.splice(index, 1);
        return removedObject;
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