import { FabricObject, Canvas, Group, Point } from "fabric";
import type BattleMap from "./BattleMap";
import { Token } from '../tokenComponents/Token';

/*
Function called when Canvas FabricObjects are moved by the user and a grid has been set while snapping is true.
The function handles snapping objects according to their size (how many spaces they occupy) and whether they are
Tokens or other objects. Sizes snapped are either 1/4 of a square (0.5), are centered inside a square (odds), or centered 
at the intersection of four squares (even).
*/
export const handleObjectSnapping = (canvas: Canvas, obj: FabricObject, map: BattleMap) => {
    let mapEl = map.getCurrentMap();
    let token;

    //Check if map exists and grid exists
    if (!mapEl || map.getCenterPoint() == null || map.getCornerPoints() == null) {
        return;
    }

    //Check if current Battle Map set so elements snap. Return if not.
    if(!map.getGridSnap()) return;

    //Get coordinates of base grid unit to calculate snapping coordinates
    let unitCenter = map.getCenterPoint();
    let unitCorners = map.getCornerPoints();

    //Calculate coordinate x and y distance of corners from the center of a grid unit
    let unitXDistance = unitCorners.bl.distanceFrom(unitCorners.br) / 2;
    let unitYDistance = unitCorners.bl.distanceFrom(unitCorners.tl) / 2;

    //X and Y translate distance from unitCenter to newly snapped object's center
    var translateX;
    var translateY;

    let canvasObjects = canvas.getObjects();

    //Check if obj is a Token group
    if (obj && obj instanceof Group && obj.getObjects().length > 1 &&
        (token = obj.getObjects()[0]) instanceof Token) {
        let tokenCenter = obj.getCenterPoint();
        let tokenSize = token.getSizeCode();

        //Calculate index of the name Textbox
        let index = canvasObjects.indexOf(obj) + 1;
        if (index >= canvasObjects.length || index == 0) {
            alert('Error: Token Name TextBox not Found');
            return;
        }

        let nameBox = canvasObjects[index];

        //Snap to center of grid rectangle
        if (tokenSize % 2 == 1 && tokenSize >= 1) {
            let xHalves = Math.floor(Math.abs(unitCenter.x - tokenCenter.x) / unitXDistance);
            let yHalves = Math.floor(Math.abs(unitCenter.y - tokenCenter.y) / unitYDistance);

            //Even halves means current token location needs to snap closer by 1 half
            //Odd halves means current token location needs to snap farther by 1 half
            translateX = unitXDistance * xHalves;
            translateY = unitYDistance * yHalves;

            if (xHalves % 2 == 1) {
                translateX += unitXDistance;
            }

            if (yHalves % 2 == 1) {
                translateY += unitYDistance;
            }
        }
        //Snap to intersection corner of 4 grid rectangles
        else if (tokenSize % 2 == 0 && tokenSize >= 2) {
            let xHalves = Math.floor(Math.abs(unitCenter.x - tokenCenter.x) / unitXDistance);
            let yHalves = Math.floor(Math.abs(unitCenter.y - tokenCenter.y) / unitYDistance);

            //Even halves means current token location needs to snap farther by 1 half
            //Odd halves means current token location needs to snap closer by 1 half
            translateX = unitXDistance * xHalves;
            translateY = unitYDistance * yHalves;

            if (xHalves % 2 == 0) {
                translateX += unitXDistance;
            }

            if (yHalves % 2 == 0) {
                translateY += unitYDistance;
            }
        }
        //Snap to center of 1/4 of a grid rectangle. 1/4 will be smallest size code
        else if (tokenSize == 0.5) {
            let xQuarter = Math.floor(Math.abs(unitCenter.x - tokenCenter.x) / (unitXDistance / 2));
            let yQuarter = Math.floor(Math.abs(unitCenter.y - tokenCenter.y) / (unitYDistance / 2));

            //Even quarters means current token location needs to snap closer by 1 quarter
            //Odd quarters means current token location needs to snap farther by 1 quarter
            translateX = unitXDistance / 2 * xQuarter;
            translateY = unitYDistance / 2 * yQuarter;

            if (xQuarter % 2 == 0) {
                translateX += unitXDistance / 2;
            }

            if (yQuarter % 2 == 0) {
                translateY += unitYDistance / 2;
            }
        }
        else {
            return;
        }

        if (tokenCenter.x < unitCenter.x) {
            translateX = -translateX;
        }

        if (tokenCenter.y < unitCenter.y) {
            translateY = -translateY;
        }

        //Snap Token group to the grid
        let coordDistance = new Point({ x: translateX, y: translateY });
        let newPoint = unitCenter.add(coordDistance);
        obj.setXY(newPoint, 'center', 'center');

        //Move the Token's name Textbox under the Token
        let nameCoords = new Point();
        nameCoords.x = obj.getCenterPoint().x;
        nameCoords.y = obj.getCoords()[3].y;
        nameBox.setXY(nameCoords, 'center', 'top');
        nameBox.setCoords();
    }
    //Generic Canvas Object. Usually will be shapes
    else if (obj instanceof FabricObject && !(obj instanceof Group)) {
        //find multiplier of the object
        let multiplier = Math.round(obj.scaleY / map.getGridUnitHeight() * 600);
        let objCenter = obj.getCenterPoint();
        let xHalves = Math.floor(Math.abs(unitCenter.x - objCenter.x) / unitXDistance);
        let yHalves = Math.floor(Math.abs(unitCenter.y - objCenter.y) / unitYDistance);
        if (multiplier % 2 == 0) {
            //Even halves means current token location needs to snap farther by 1 half
            //Odd halves means current token location needs to snap closer by 1 half
            translateX = unitXDistance * xHalves;
            translateY = unitYDistance * yHalves;

            if (xHalves % 2 == 0) {
                translateX += unitXDistance;
            }

            if (yHalves % 2 == 0) {
                translateY += unitYDistance;
            }
        }
        else if (multiplier % 2 == 1) {

            //Even halves means current token location needs to snap closer by 1 half
            //Odd halves means current token location needs to snap farther by 1 half
            translateX = unitXDistance * xHalves;
            translateY = unitYDistance * yHalves;

            if (xHalves % 2 == 1) {
                translateX += unitXDistance;
            }

            if (yHalves % 2 == 1) {
                translateY += unitYDistance;
            }
        }
        else {
            return;
        }

        if (objCenter.x < unitCenter.x) {
            translateX = -translateX;
        }

        if (objCenter.y < unitCenter.y) {
            translateY = -translateY;
        }

        let coordDistance = new Point({ x: translateX, y: translateY });
        let newPoint = unitCenter.add(coordDistance);
        obj.setXY(newPoint);
        obj.setCoords();
    }
    //Moving possible mix of Tokens and shapes in a multi-selection
    else if (obj instanceof Group) {
        let objCenter = obj.getCenterPoint();
        let widthUnits = Math.round(obj.getScaledWidth() / map.getGridUnitWidth());
        let heightUnits = Math.round(obj.getScaledHeight() / map.getGridUnitHeight());
        let widthQuarters = Math.round(obj.getScaledWidth() / map.getGridUnitWidth() * 2);
        let heightQuarters = Math.round(obj.getScaledHeight() / map.getGridUnitHeight() * 2);

        let xHalves;
        let yHalves;

        let divideX = 1;
        let divideY = 1;
        console.log("halves: " + widthUnits + " " + heightUnits);
        console.log("quarters: " + widthQuarters + " " + heightQuarters);
        //Check if a height or width is a 1/2 of a grid unit off. If so, set to calculate as if
        //1/2 size code as seen for snappingTokens only.
        if (widthQuarters / widthUnits != 2) {
            widthUnits = widthQuarters;
            divideX = 2;
        }

        if (heightQuarters / heightUnits != 2) {
            heightUnits = heightQuarters;
            divideY = 2;
        }

        //Calculate number of half units from resizeRect to the current object
        xHalves = Math.floor(Math.abs(unitCenter.x - objCenter.x) / (unitXDistance / divideX));
        yHalves = Math.floor(Math.abs(unitCenter.y - objCenter.y) / (unitYDistance / divideY));

        //Calculate distance needed to translate to
        translateX = unitXDistance * xHalves / divideX;
        translateY = unitYDistance * yHalves / divideY;

        //Snap X to Grid Unit Intersection
        //Width units equivalent to size code or shape multiplier
        if (widthUnits % 2 == 0 && divideX == 1) {
            if (xHalves % 2 == 0) {
                translateX += unitXDistance;
            }
        }
        //Snap X to Grid Unit Center
        else if (widthUnits % 2 == 1 && divideX == 1) {
            if (xHalves % 2 == 1) {
                translateX += unitXDistance;
            }
        }
        else if(divideX == 2)
        {
            if(xHalves % 2 == 0) {
                translateX += unitXDistance / 2;
            }
        }

        //Snap Y to Grid Unit Intersection
        if (heightUnits % 2 == 0 && divideY == 1) {
            if (yHalves % 2 == 0) {
                translateY += unitYDistance;
            }
        }
        //Snap Y to Grid Unit Center
        else if (heightUnits % 2 == 1 && divideY == 1) {
            if (yHalves % 2 == 1) {
                translateY += unitYDistance;
            }
        }
        else if(divideY == 2)
        {
            if(yHalves % 2 == 0)
            {
                translateY += unitYDistance / 2;
            }
        }

        //Change x and y to negative depending on where Group center point is relative to the
        //resizingUnit's original coordinate provided by BattleMap
        if (objCenter.x < unitCenter.x) {
            translateX = -translateX;
        }

        if (objCenter.y < unitCenter.y) {
            translateY = -translateY;
        }

        //Set Group to new coordinate
        let coordDistance = new Point({ x: translateX, y: translateY });
        let newPoint = unitCenter.add(coordDistance);
        obj.setXY(newPoint, 'center', 'center');
        obj.setCoords();

        let activeObjects = canvas.getActiveObjects();

        let tokenGroup;
        let token;

        //Find Token groups so that associated name textboxes can be moved
        for (let i = 0; i < activeObjects.length; i++) {
            if ((tokenGroup = activeObjects[i]) instanceof Group &&
                (tokenGroup = tokenGroup.getObjects()).length > 1
                && (token = tokenGroup[0]) instanceof Token) {
                    //Get index of the name textbox
                    let index = canvas.getObjects().indexOf(activeObjects[i]) + 1;
                    if(index > 0 && index < canvas.getObjects().length)
                    {
                        //Set name textbox to be underneath Token group
                        let nameBox = canvas.getObjects()[index];
                        let newX = tokenGroup[1].getCenterPoint().x;
                        let newY = tokenGroup[1].getCoords()[3].y;
                        let newPoint = new Point({x:newX,y:newY});
                        nameBox.setXY(newPoint, 'center', 'top');
                        nameBox.setCoords();
                    }
            }
        }
    }
}