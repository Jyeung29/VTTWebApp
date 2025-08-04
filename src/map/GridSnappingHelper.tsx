import { FabricObject, Canvas, Group, Point } from "fabric";
import type BattleMap from "./BattleMap";
import { Token } from './Token';

export const handleObjectMoving = (canvas: Canvas, obj: FabricObject, map: BattleMap) => {
    let mapEl = map.getCurrentMap();
    let token;

    //Check if map exists and grid exists
    if (!mapEl || map.getCenterPoint() == null || map.getCornerPoints() == null) {
        return;
    }

    let unitCenter = map.getCenterPoint();
    let unitCorners = map.getCornerPoints();

    //Calculate coordinate x and y distance of corners from the center of a grid unit
    let unitXDistance = unitCorners.bl.distanceFrom(unitCorners.br) / 2;
    let unitYDistance = unitCorners.bl.distanceFrom(unitCorners.tl) / 2;

    //X and Y translate distance from unitCenter to newly snapped object's center
    var translateX;
    var translateY;

    //Check if obj is a Token group
    if (obj && obj instanceof Group && obj.getObjects().length > 1 &&
        (token = obj.getObjects()[0]) instanceof Token) {
        let tokenCenter = obj.getCenterPoint();
        let tokenSize = token.getSizeCode();

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

        let coordDistance = new Point({ x: translateX, y: translateY });
        let newPoint = unitCenter.add(coordDistance);
        obj.setXY(newPoint);
    }
    //Generic Canvas Object. Usually will be shapes
    else if (obj instanceof FabricObject) {
        //find multiplier of the object
        let multiplier = Math.round(obj.scaleY / map.getGridUnitHeight() * 600);
        console.log(obj.scaleY)
        let objCenter = obj.getCenterPoint();
        if (multiplier % 2 == 0) {
            let xHalves = Math.floor(Math.abs(unitCenter.x - objCenter.x) / unitXDistance);
            let yHalves = Math.floor(Math.abs(unitCenter.y - objCenter.y) / unitYDistance);

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
            let xHalves = Math.floor(Math.abs(unitCenter.x - objCenter.x) / unitXDistance);
            let yHalves = Math.floor(Math.abs(unitCenter.y - objCenter.y) / unitYDistance);

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
        else
        {
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
    }
}