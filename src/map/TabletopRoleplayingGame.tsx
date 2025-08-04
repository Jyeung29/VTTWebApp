import {Token} from './Token';

abstract class TabletopRoleplayingGame {
    private name: string;
    constructor(name: string)
    {
        this.name = name;
    }

    /*public determineTurnOrder(tokens: Token[]): Token[]
    {
        if(tokens.length == 0)
        {
            return [];
        }
        else
        {
            var tokenOrder: Token[] = [];
            for(let i = 0; i < tokens.length; i++)
            {

            }
        }
    }*/

    /*public parseStatBlock(rawText: string)
    {

    }*/
}

export default TabletopRoleplayingGame;