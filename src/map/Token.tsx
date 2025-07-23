import {FabricImage} from 'fabric';
import type {
    ImageProps, 
    TOptions, 
    SerializedImageProps, 
    ObjectEvents,
} from 'fabric';

//Interface Resource used for tracking game statistics like HP and Legendary Actions
interface Resource {
        val: number,
        max: number,
        index: number,
        name: string
}

//Token class definition. Extends Fabric's FabricImage class but with additional Functionality
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
    // Tiny = 1, Medium = 5, Large = 10, Huge = 15, Gigantic = 20
    protected sizeCode: number = 5;

    //Whether token's name is shown in Streaming Mode
    protected showName: boolean = true;

    //The resources a Token has and can utilize. See interface Resource.
    protected resources: Resource[] = [];

    //Whether resources like HP or Actions are displayed in Streaming Mode
    protected showResources: boolean[] = [];

    //Whether resources are synced and shared across multiple token instances
    protected shareResource: boolean = false;

    //Returns string name of Token.
    public getName(): string {
        return this.name;
    }

    //Sets name of Token to entered String. Returns false if string is only spaces or is empty. 
    // Otherwise returns true
    public setName(newName: string): boolean {
        //Make sure not empty name or 
        if(newName.trim() == "")
        {
            return false;
        }
        this.name = newName;
        return true;
    }

    //Returns boolean of whether to show in Streaming Mode
    public getVisibility(): boolean {
        return this.visibility;
    }

    //Sets visibility to entered boolean. Always returns true.
    public setVisibility(newVisibility: boolean): boolean {
        this.visibility = newVisibility;
        return true;
    }

    //Returns sizeCode of the Token. 
    public getSizeCode(): number {
        return this.sizeCode;
    }

    //Sets sizeCode to entered number. If an invalid negative number return false.
    public setSizeCode(newCode: number): boolean {
        //Make sure not negative size
        if(newCode > 0)
        {
            this.sizeCode = newCode;
            return true;
        }
        return false;
    }

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
        if(index && index > -1 && index < this.resources.length)
        {
            this.setResourceData(this.resources[index], val, max);
            return true;     
        }
        else if(name && name.trim() != "")
        {
            for(let i = 0; i < this.resources.length; i++)
            {
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
    protected setResourceData(resource: Resource, val?:number, max?:number): void {
        //If val or max is null, then make no changes
        resource.val = val ?? resource.val;
        resource.max = max ?? resource.max;
    }

    //Returns boolean array of whether to display resources of the Token. 
    public getShowResources(): boolean[] {
        return this.showResources;
    }

    //Sets showResource at given index to entered boolean. Returns true if in range of array.
    public setShowResources(newShowResource: boolean, index: number): boolean {
        if(index > -1 && this.showResources.length > index)
        {
            this.showResources[index] = newShowResource;
            return true;
        }
        return false;
    }

    //Returns sizeCode of the Token. 
    public getShowName(): boolean {
        return this.showName;
    }

    //Sets showName to entered boolean. Always returns true.
    public setShowName(newShowName: boolean): boolean {
        this.showName = newShowName;
        return true;
    }

    //Returns whether token shares resources with other Tokens
    public getShareResource(): boolean {
        return this.shareResource;
    }

    public createStatBlock(): boolean {
        let health: Resource = {val:30, max:40, name:'HP', index:0};
        this.resources.push(health);
        return true;
    }
}