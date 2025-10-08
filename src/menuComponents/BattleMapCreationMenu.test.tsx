import { Canvas } from "fabric";
import { BattleMapCreationMenu } from "./BattleMapCreationMenu";
import {render, fireEvent} from '@testing-library/react';
import { useState } from "react";
import { ImageLinkFactory } from "../ImageLinkFactory";
import BattleMap from "../SceneComponents/BattleMap";
import type Scene from "../SceneComponents/Scene";

describe(BattleMapCreationMenu, () => {
    let newCanvas = document.createElement('canvas');
    newCanvas.id = 'scene_0';
    let fabricCanvas = new Canvas(newCanvas);
    let testBattle = new BattleMap('Test Map', 0, true);
    const [canvas, setCanvas] = useState(fabricCanvas);
    const [currentScene, setCurrentScene] = useState<Scene>(testBattle);
    const [collectionUpdate, setCollectionUpdate] = useState<boolean>(false);
    let testIDMap = new Map<number,boolean>();
    testIDMap.set(0, true);
    const [sceneIDMap, setSceneIDMap] = useState<Map<number,boolean>>(testIDMap)
    const [currentCanvasID, setCurrentCanvasID] = useState<number>(0);
    const [canvasCollection, setCanvasCollection] = useState<[string, Canvas[], Scene[]]>(['', [fabricCanvas], [testBattle]])
    
    const {getByTestID} = render(<BattleMapCreationMenu linkFactory={new ImageLinkFactory} setCanvas={setCanvas}
    canvasCollection={canvasCollection} setCanvasCollection={setCanvasCollection} sceneIDMap={sceneIDMap} 
    setSceneIDMap={setSceneIDMap} currentCanvasID={currentCanvasID} setCurrentCanvasID={setCurrentCanvasID}
    setCurrentScene={setCurrentCanvasID} setCollectionUpdate={setCollectionUpdate}/>);

    const nameField = getByTestID('NameField');




});