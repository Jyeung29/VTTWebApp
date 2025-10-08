import { DungeonsNDragons5E } from "./TTRPGComponents/DungeonsNDragons5E";
import type TabletopRoleplayingGame from "./TTRPGComponents/TabletopRoleplayingGame";

export class Factory {
    
    constructor() {};

    public createTabletopRoleplayingGameSystem(id:number){
        switch(id){
            case 0: 
                return new DungeonsNDragons5E;
            default:
                return null;
        }
    }
}