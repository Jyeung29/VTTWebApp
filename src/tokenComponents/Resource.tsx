export class Resource {
    private val:number = -1;
    private max:number = -1;
    private conditionalMax: number = -1;
    private name:string = '';
    private overflowVal: number = 0;

    constructor(name:string, max:number, val?:number, conditionalMax?:number, overflowVal?:number)
    {
        if(name.trim() == '')
        {
            throw Error('Resource name cannot be empty or only spaces');
        }
        if(name.length > 64){
            throw Error('Resource name cannot be over 64 characters');
        }
        this.name = name;
        
        if(max <= 0)
        {
            throw Error('Max value of a resource cannot be 0 or negative');
        }
        this.max = max;

        this.val = val ? val : max;
        this.conditionalMax = conditionalMax ? conditionalMax : max;
        this.overflowVal = overflowVal ? overflowVal : 0;
    }

    public getName(): string {
        return this.name;
    }

    public getVal(): number {
        return this.val;
    }

    public setVal(val: number, overflow?: boolean): boolean {
        //Check if value is negative and invalid
        if(val < 0)
        {
            return false;
        }
        
        //Check if new val should not overflow over conditionalMax
        //or overflow is not specified to default not overflow val
        if(((overflow != null && !overflow) || overflow == null) && val > this.conditionalMax)
        {
            this.val = this.conditionalMax;
        }
        //Check if new val should overflow over the conditionalMax
        else if(overflow != null && overflow && val > this.conditionalMax)
        {
            let difference = val - this.conditionalMax;
            this.val = this.conditionalMax;
            this.incrementOverflowVal(difference);
        }
        //or if new val is less than conditionalMax
        else if(val <= this.conditionalMax)
        {
            this.val = val;
        }
        
        return true;
    }

    public incrementVal(increment:number, overflow?:boolean): number
    {
        //Check if incrementing val will cause overflow and should overflow
        if(increment + this.val > this.conditionalMax && overflow != null && overflow)
        {
            let difference = increment + this.val - this.conditionalMax;
            this.val = this.conditionalMax;
            this.incrementOverflowVal(difference);
        }
        //or if incrementing val will not cause overflow or underflow
        else if((increment + this.val <= this.conditionalMax && increment + this.val >= 0))
        {
            this.val += increment;
        }
        //Check if incrementing val will cause overflow and either overflow is undefined or false
        else if(increment + this.val > this.conditionalMax && (overflow == null || (overflow != null && !overflow)))
        {
            this.val = this.conditionalMax;
        }
        //Check if incrementing val will cause underflow
        else if(increment + this.val < 0)
        {
            this.val = 0;
        }
        return this.val;
    }

    public getMax(): number {
        return this.max;
    }

    public setMax(max: number, resetVal: boolean, resetConditionalMax:boolean, increaseValByDifference?:boolean): boolean {
        //Check if max is invalid negative
        if(max <= 0)
        {
            //Indicate invalid set
            return false;
        }

        //Check if want to reset val to the new max
        if(resetVal)
        {
            this.val = max;
        }
        //Otherwise check if want to increase the val by the new max and old max difference if max is increasing
        else if(increaseValByDifference != null && increaseValByDifference && this.max < max)
        {
            let difference = max - this.max;
            this.val += difference;
        }

        //Check if want to reset conditionalMax to new max
        if(resetConditionalMax)
        {
            this.conditionalMax = max;
        }

        //Indicate valid set
        return true;
    }

    public getConditionalMax(): number {
        return this.conditionalMax;
    }

    public setConditionalMax(condMax:number): boolean
    {
        //Check if new conditionalMax is invalid negative
        if(condMax < 0)
        {
            return false;
        }

        //Set new conditionalMax
        this.conditionalMax = condMax;
        
        //Check if val is greater than new conditionalMax and needs to be reduced
        if(condMax < this.val)
        {
            this.val = condMax;
        }

        return true;
    }

    public incrementConditionalMax(increment: number): number {
        //Check if incrementing conditionalMax is negative and set floor to 0 values
        if(increment + this.conditionalMax < 0)
        {
            this.conditionalMax = 0;
            this.val = 0;
        }
        //Otherwise increment as normal
        else
        {
            this.conditionalMax += increment;
        }
        return this.conditionalMax;
    }

    public getOverflowVal(): number {
        return this.overflowVal;
    }

    public setOverflowVal(overflow: number): boolean {
        //Check if overflow is negative and invalid
        if(overflow < 0)
        {
            return false;
        }

        //Otherwise set overflow
        this.overflowVal = overflow;
        return true;
    }

    public incrementOverflowVal(increment: number): number {
        //Check if increment will cause overflow to become negative and set it to 0
        if(increment + this.overflowVal <= 0)
        {
            this.overflowVal = 0;
        }
        //Otherwise increment as normal
        else
        {
            this.overflowVal += increment;
        }
        
        return this.overflowVal;
    }

    public resetValues(setVal:boolean, setCondMax: boolean, setOverflow: boolean): boolean {
        //Check if resetting the val will be to the conditionalMax or normal max
        if(setVal && !setCondMax)
        {
            this.val = this.conditionalMax;
        }
        else if(setVal)
        {
            this.val = this.max;
        }

        //Check if resetting conditionalMax
        if(setCondMax)
        {
            this.conditionalMax = this.max;
        }

        //Check if resettting overflowVal
        if(setOverflow)
        {
            this.overflowVal = 0;
        }
        return true;
    }
}