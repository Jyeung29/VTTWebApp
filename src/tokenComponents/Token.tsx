import {FabricImage} from 'fabric';
import type {
    ImageProps, 
    TOptions, 
    SerializedImageProps, 
    ObjectEvents,
} from 'fabric';

//Token class definition. Extends Fabric's FabricImage class but with additional Functionality to store
// values regarding the Token's name, size, visibility, resources, and more. The class provides multiple
//getter, setters, add, and remove functions to manipulate the Token's values.
export class Token<
    Props extends TOptions<ImageProps> = Partial<ImageProps>,
    SProps extends SerializedImageProps = SerializedImageProps,
    EventSpec extends ObjectEvents = ObjectEvents,
  >extends FabricImage<Props, SProps, EventSpec>
  implements ImageProps{

    //Name displayed on Battle Maps. Multiple tokens can have same name.
    protected name: string = "";
    
    //Whether a token is displayed in Streaming Mode and is transparent in GM Mode
    protected visibility: boolean = true;

    //Number Code to scale token size based on grid space. 
    // Multiplicative to how many rectangles on a grid a token occupies.
    //1 = 1 spaces, 2 = 4 spaces, 3 = 9 spaces, etc.
    protected sizeCode: number = 1;

    //Whether token's name is shown in Streaming Mode
    protected showName: boolean = true;

    //Whether resources like HP or Actions are displayed in Streaming Mode
    protected showResources: boolean[] = [];

    //Whether resources are synced and shared across multiple token instances
    protected shareResource: boolean = false;

    //Number that is added onto the end of a Token's name if GM group toggles name numbering.
    //-1 value indicates it should not be displayed. Otherwise must be positive integer starting at 1
    protected nameNumber: number = -1;

    //Variable that stores URLs of images while also storing the provided file's id in their associated
    //cloud storage service such as Google Drive or OneDrive.
    protected imageURLs: [string, string][] = [];

    //Number that tracks the current image link being used for the Token
    protected currentImage: number = 0;

    //An array of index pairs that indicate where in the Base Token Collection a token is located
    protected baseTokenIndexPairs: [number,number][] = [];

    //Returns string name of Token.
    public getName(): string {
        return this.name;
    }

    //Sets name of Token to entered String. Returns false if string is only spaces, empty string, or null. 
    // Otherwise returns true
    public setName(newName: string): boolean {
        //Make sure not empty name or null
        if(!newName && newName.trim() == "")
        {
            return false;
        }
        //Otherwise set name
        this.name = newName;
        return true;
    }

    //Sets nameNumber of the Token to the provided number. Returns false if provided number is null
    // or less than -1. Otherwise returns true.
    public setNameNumber(num: number): boolean {
        if(num == null || num < -1)
        {
            return false;
        }
        else
        {
            this.nameNumber = num;
            return true;
        }
    }

    //Returns nameNumber of the Token.
    public getNameNumber(): number {
        return this.nameNumber;
    }

    //Returns boolean of whether to show in Streaming Mode
    public getVisibility(): boolean {
        return this.visibility;
    }

    //Sets visibility to entered boolean. Returns true if visibility was set.
    public setVisibility(newVisibility: boolean): boolean {
        if(newVisibility)
        {
            this.visibility = newVisibility;
            return true;
        }
        return false;
    }

    //Returns sizeCode of the Token. 
    public getSizeCode(): number {
        return this.sizeCode;
    }

    //Sets sizeCode to entered number. If an invalid negative number return false.
    public setSizeCode(newCode: number): boolean {
        //Make sure not negative size
        if(newCode && newCode > 0)
        {
            this.sizeCode = newCode;
            return true;
        }
        return false;
    }

    /*
    //Return all Resources of Token
    public getAllResources(): Resource[] {
        return this.resources;
    }

    public getResource(index?:number, name?:string){
        //Check if index is not out of bounds. Directly access Resource at index.
        if(index && index > -1 && index < this.resources.length)
        {
            return this.resources[index];
        } 
        //Make sure name is not null and only spaces
        else if(name && name.trim() != "")
        {
            //Find Resource with parameter name. Return the Resource when found.
            for(let i = 0; i < this.resources.length; i++)
            {
                if(this.resources[i].name == name)
                {
                    return this.resources[i];
                }
            }
        }
        //Null if out of bounds index, name is null or only spaces, no Resource with given name.
        return null;
    }

    //Method that sets a specific resource value and maximum found with index or name of Resource.
    public setResource(index?:number, name?:string, val?:number, max?:number): boolean {
        //Check if valid index provided
        if(index && index > -1 && index < this.resources.length)
        {
            this.setResourceData(this.resources[index], val, max);
            return true;     
        }
        //Check if name is provided
        else if(name && name.trim() != "")
        {
            //Search for resource name in Token's resources
            for(let i = 0; i < this.resources.length; i++)
            {
                //If found, set new resource values
                if(this.resources[i].name == name)
                {
                    this.setResourceData(this.resources[i], val, max);
                    return true;  
                }
            }
        }
        return false;
    }

    //Method that resets all Resource's val to the max value.
    public restoreAllResources(): boolean {
        for(let i = 0; i < this.resources.length; i++)
        {
            this.setResourceData(this.resources[i], this.resources[i].max, );
        }
        return true;
    }

    //Helper method for setResource() and restoreAllResources(). Sets Resource object values.
    protected setResourceData(resource: Resource, val?:number, max?:number): boolean {
        if(resource)
        {
            //If val or max is null, then make no changes
            resource.val = val ?? resource.val;
            resource.max = max ?? resource.max;
            return true;
        }
        return false;
    }

    //Returns boolean array of whether to display resources of the Token. 
    public getShowResources(): boolean[] {
        return this.showResources;
    }

    //Sets showResource at given index to entered boolean. Returns true if in range of array.
    public setShowResources(newShowResource: boolean, index: number): boolean {
        if(newShowResource != null && index && index > -1 && this.showResources.length > index)
        {
            this.showResources[index] = newShowResource;
            return true;
        }
        return false;
    }*/

    //Returns sizeCode of the Token. 
    public getShowName(): boolean {
        return this.showName;
    }

    //Sets showName to entered boolean. Returns true if showName is set.
    public setShowName(newShowName: boolean): boolean {
        if(newShowName != null)
        {
            this.showName = newShowName;
            return true;
        }
        return false;
    }

    //Returns whether token shares resources with other Tokens
    public getShareResource(): boolean {
        return this.shareResource;
    }

    /*//Temp method must change
    public createStatBlock(): boolean {
        let health: Resource = {val:30, max:40, name:'HP', index:0};
        this.resources.push(health);
        return true;
    }*/

    //Method that only adds a url string to be tracked. Does not change the 
    //Token's image. Assumes that ImageLinkFactory outputed correct file id and
    //url.
    public addURL(id:string, url: string): boolean {
        //Check if not empty
        if(//id.trim() != '' && 
        url.trim() != '')
        {
            for(let i = 0; i < this.imageURLs.length; i++)
            {
                //Make sure there are no redundant links. IDs could be same across
                //drive services so must match url as well.
                if(this.imageURLs[i][0] == id && this.imageURLs[i][1] == url)
                {
                    return false;
                }
            }
            //Add url and file id to the array
            this.imageURLs.push([id, url]);
            return true;
        }
        return false;
    }

    public getCurrentURL(): string {
        return this.imageURLs[this.currentImage][1];
    }

    public cloneTokenMembers(copyToken: Token): boolean {
        this.imageURLs = copyToken.imageURLs
        this.name = copyToken.name;
        this.sizeCode = copyToken.sizeCode;
        return true;
    }

    //Method that adds url string to be tracked and changes the Token's image
    public setNewImage(url: string): boolean {
        return false;
    }
}