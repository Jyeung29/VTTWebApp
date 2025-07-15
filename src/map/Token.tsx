//Token class definition

class Token {
    private name: string = "";
    private visibility: boolean = true;
    private sizeCode: number = 5;
    private showHP: boolean = true;
    private showName: boolean = true;
    private shareResource: boolean = false;
    
    //Constructor Overloads
    //New Token Constructor
    constructor(name: string, sizeCode: number, visibility: boolean, showName: boolean, showHP: boolean);
    //Copy Token Constructor
    constructor(baseToken: Token, shareResource: boolean);

    constructor(...args: any[])
    {
        //Copy Token Constructor
        if(args.length == 2)
        {
            Object.assign(this, args[0]);
            this.shareResource = args[1];
        }
        //New Token Constructor
        else if(args.length == 5)
        {
            this.name = args[0]; //name is required
            this.visibility = (args[1] ?? true);
            this.sizeCode = (args[2] ?? 5); //default medium sizeCode
            this.showHP = (args[3] ?? true);
            this.showName = (args[4] ?? true);
        }
    }

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

    //Returns sizeCode of the Token. 
    public getShowHP(): boolean {
        return this.showHP;
    }

    //Sets showHP to entered boolean. Always returns true.
    public setShowHP(newShowHP: boolean): boolean {
        this.showHP = newShowHP;
        return true;
    }

    //Returns sizeCode of the Token. 
    public getShowName(): boolean {
        return this.showName;
    }

    //Sets showHP to entered boolean. Always returns true.
    public setShowName(newShowName: boolean): boolean {
        this.showHP = newShowName;
        return true;
    }

    //Returns sizeCode of the Token. 
    public getShareResource(): boolean {
        return this.shareResource;
    }
}
export default Token;