import type TabletopRoleplayingGame from '../TTRPGComponents/TabletopRoleplayingGame';
import {Resource} from './Resource';
import { DiceRoll, type Dice } from '../DiceRollComponents/DiceRoll';

export class StatBlock {
    protected resources: Resource[] = [];
    protected statJSX = [];
    protected stats: [];
    protected system:TabletopRoleplayingGame;

    constructor(system: TabletopRoleplayingGame, rawText: string, gameLog) 
    {
        if(!system)
        {
            throw Error('TabletopRoleplayingGame must be defined');
        }
        let results = system.parseStatBlock(rawText, gameLog);
        
        this.system = system;
    }

    public getResources(): Resource[] {
        return this.resources;
    }

    public getResource(index:number)
    {
        if(index >= 0 && index < this.resources.length)
        {
            return this.resources[index];
        }
        return undefined;
    }

    public getStatJSX() {
        return this.statJSX;
    }


}