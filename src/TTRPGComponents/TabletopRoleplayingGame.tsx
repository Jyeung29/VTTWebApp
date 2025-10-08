import {Token} from '../tokenComponents/Token';
import {Resource} from '../tokenComponents/Resource';

abstract class TabletopRoleplayingGame {
    protected generalToolJSX = [];
    protected battleMapToolJSX = [];
    protected roleplayingSceneToolJSX = [];
    protected paneToolJSX = [];
    protected statBlockJSX = [];
    
    public abstract determineTurnOrder(Tokens: Token[]): Token[];

    public abstract parseStatBlock(rawText: string, gameLog);

    public getGeneralTools() {
        return this.generalToolJSX;
    }

    public getBattleMapTools() {
        return this.battleMapToolJSX;
    }

    public getRoleplayingSceneTools() {
        return this.roleplayingSceneToolJSX;
    }

    public getPaneTools() {
        return this.paneToolJSX;
    }

    public getStatBlockJSX() {
        return this.statBlockJSX;
    }
}

export default TabletopRoleplayingGame;