import { FabricObject, Canvas, Group, Point } from "fabric";
import type BattleMap from "./BattleMap";
import { Token } from '../tokenComponents/Token';

//Function that handles moving Tokens with their unselectable elements that cannot be in the same group such as the
//name textbox.
export const handleObjectMoving = (canvas: Canvas, obj: FabricObject) => {
    if (!canvas || !obj) {
        return;
    }
    let canvasObjects = canvas.getObjects();
    let activeObjects;
    let tokenGroup;
    let token;
    let index;

    //Multi Object Selection
    if ((activeObjects = canvas.getActiveObjects()).length > 1) {
        //Iterate over active objects
        for (let i = 0; i < activeObjects.length; i++) {

            //If object is a Token move associated name Textbox
            if ((tokenGroup = activeObjects[i]) instanceof Group &&
                (tokenGroup = tokenGroup.getObjects()).length > 1 &&
                (token = tokenGroup[0]) instanceof Token
            ) {
                //Find index of name Textbox
                index = canvasObjects.indexOf(activeObjects[i]) + 1;
                
                //Check if index is invalid
                if (index >= canvasObjects.length || index == 0) {
                    alert('Error: Token Name TextBox not Found');
                    return;
                }

                //Move name Textbox underneath Token
                let nameBox = canvasObjects[index];
                let newX = token.getCenterPoint().x;
                let newY = tokenGroup[1].getCoords()[3].y;
                let newPoint = new Point({ x: newX, y: newY });
                nameBox.setXY(newPoint, 'center', 'top');
                nameBox.setCoords();
            }
        }
    }
    //Single Token Selection
    else if (activeObjects.length == 1 && activeObjects[0] instanceof Group &&
        (tokenGroup = activeObjects[0].getObjects()).length > 1 &&
        (token = tokenGroup[0]) instanceof Token) {
        //Find index of name Textbox
        index = canvasObjects.indexOf(obj) + 1;

        //Check if index invalid
        if (index >= canvasObjects.length || index == 0) {
            alert('Error: Token Name TextBox not Found');
            return;
        }

        //Move name Textbox underneath Token
        let nameBox = canvasObjects[index];
        let newX = token.getCenterPoint().x;
        let newY = tokenGroup[1].getCoords()[3].y;
        let newPoint = new Point({ x: newX, y: newY });
        nameBox.setXY(newPoint, 'center', 'top');
        nameBox.setCoords();
    }
}