import { FabricObject, Canvas, Group, Point } from "fabric";
import type BattleMap from "./BattleMap";
import { Token } from './Token';

//Handles moving Tokens with their unselectable elements that cannot be in the same group such as the
//name textbox.
export const handleObjectMoving = (canvas: Canvas, obj: FabricObject) => {
    if(!canvas || !obj)
    {
        return;
    }
    let canvasObjects = canvas.getObjects();
    let activeObjects;
    let tokenGroup;
    let token;
    let index;

    //Multi Object Selection
    if((activeObjects = canvas.getActiveObjects()).length > 1)
    {
        for(let i = 0; i < activeObjects.length; i++)
        {
            if((tokenGroup = activeObjects[i]) instanceof Group && 
            (tokenGroup = tokenGroup.getObjects()).length > 1 && 
            (token = tokenGroup[0]) instanceof Token    
            )
            {
                
            }
        }
    }
    //Single Token Selection
    else if(activeObjects.length == 1 && activeObjects[0] instanceof Group &&
        (tokenGroup = activeObjects[0].getObjects()).length > 1 && 
        (token = tokenGroup[0]) instanceof Token)
    {
        index = canvasObjects.indexOf(obj) + 1;
        if(index >= canvasObjects.length || index == 0)
        {
            alert('Error: Token Name TextBox not Found');
            return;
        }

        let nameBox = canvasObjects[index];
        let newX = token.getCenterPoint().x;
        let newY = tokenGroup[1].getCoords()[3].y;
        let newPoint = new Point({x:newX,y:newY});
        nameBox.setXY(newPoint, 'center', 'top');
        nameBox.setCoords();
    }
}