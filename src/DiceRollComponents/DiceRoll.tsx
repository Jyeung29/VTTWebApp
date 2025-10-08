
export interface Dice {
    numDice: number, //Indicates number of the dice to roll
    diceFace: number, //Indicates number of faces on a dice ie. the max value
    staticMod: number, //Indicates static number to add to the final result
    operationType: number, //Indicates either a negative or positive operation result. Primarily used in combination with other dices. 0: Add, 1: Subtract
    valMethod: number, //Indicates how final value is decided for the dice. 0: Total Value, 1: Take Highest Value, 2: Take Lowest Value, 3:Number of Results over SubVal, 4:Number of Results under SubVal
    methodSubVal?: number //Optional value used by valMethod to decide dice rolls of methods 3 and 4
}


export class DiceRoll {

    protected diceArray: Dice[] = [];

    constructor(dice: Dice[]) {
        for (let i = 0; i < dice.length; i++) {
            if (dice[i].numDice == 0) {
                throw Error('DiceRoll cannot roll 0 dice');
            }
            if (dice[i].diceFace == 0) {
                throw Error('DiceRoll cannot roll a 0 sided dice');
            }
        }
        this.diceArray = dice;
    }

    public rollDice(): number {
        let total = 0;
        //Roll all dice
        for (let i = 0; i < this.diceArray.length; i++) {
            let localVal = 0;
            let currentDice = this.diceArray[i];

            //Add total
            if (currentDice.valMethod == 0) {
                for (let j = 0; j < currentDice.numDice; j++) {
                    localVal += Math.floor(Math.random() * currentDice.diceFace) + 1;
                }
            }
            //Get highest value
            else if (currentDice.valMethod == 1) {
                let highest = 0;
                for (let j = 0; j < currentDice.numDice; j++) {
                    let roll = Math.floor(Math.random() * currentDice.diceFace) + 1;
                    if (roll > highest) {
                        highest = roll;
                    }
                }
                localVal = highest;
            }
            //Get lowest value
            else if (currentDice.valMethod == 2) {
                let lowest = currentDice.diceFace + 1;
                for(let j = 0; j < currentDice.numDice; j++)
                {
                    let roll = Math.floor(Math.random() * currentDice.diceFace) + 1;
                    if(roll < lowest)
                    {
                        lowest = roll;
                    }
                }
                localVal = lowest;
            }
            else if(currentDice.valMethod == 3 || currentDice.valMethod == 4)
            {
                if(currentDice.methodSubVal == null || currentDice.methodSubVal <= 0)
                {
                    throw Error('DiceRoll ceiling or floor threshold is not provided for number of rolls under or over value');
                }
                let success = 0;
                if(currentDice.valMethod == 3)
                {
                    for(let j = 0; j < currentDice.numDice; j++)
                    {
                        let roll = Math.floor(Math.random() * currentDice.diceFace) + 1;
                        if(roll >= currentDice.methodSubVal)
                        {
                            success++;
                        }
                    }
                }
                else
                {
                    for(let j = 0; j < currentDice.numDice; j++)
                    {
                        let roll = Math.floor(Math.random() * currentDice.diceFace) + 1;
                        if(roll <= currentDice.methodSubVal)
                        {
                            success++;
                        }
                    }
                }
                localVal = success;
            }

            if (localVal == 0 && currentDice.valMethod < 3) {
                throw Error('DiceRoll in diceArray index ' + i + ' rolls incorrectly');
            }

            //Add static modifier only if it does not cause result to go to 0
            if(currentDice.staticMod + localVal >= 0)
            {
                localVal += currentDice.staticMod;
            }

            //Add to overall total
            if(currentDice.operationType == 0)
            {
                total += localVal;
            }
            //Subtract from overall total
            else if(currentDice.operationType == 1)
            {
                total -= localVal;
            }
        }

        return total;
    }
}