import {
    Menu, Button, Portal, Flex, Checkbox, useCheckbox
    , Input, Field, Select, Drawer, Tabs, CloseButton, defineRecipe,
    IconButton,
    Center,
    Box,
    Collapsible
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import { Canvas, Group, Point, Circle, Textbox } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import { FaEdit, FaFolderPlus } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { BattleMapCreationMenu } from './BattleMapCreationMenu';

export function SceneMenu({sceneIDMap, setSceneIDMap, linkFactory,
    currentCanvasID, setCurrentCanvasID, setCurrentScene, setCanvas, canvasCollection, setCanvasCollection,
}) {
    const [sceneCollectionJSX, setSceneCollectionJSX] = useState([]);
    const [collectionUpdate, setCollectionUpdate] = useState<boolean>(true);

    //Use to display all scenes that user can switch between
    useEffect(() => {
        let myCollection = canvasCollection;
        let collectionJSX = [];

        if (collectionUpdate && myCollection.length > 0) {
            for (let i = 0; i < myCollection.length; i++) {
                //Check current array is a lone scene not in any collection
                if (myCollection[i][0] == '') {
                    if (currentCanvasID == myCollection[i][2][0].getID()) {
                        collectionJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][0].getID()} key={i}>
                            <h3>{myCollection[i][2][0].getName()}</h3>
                            <IconButton
                                className='RenameButton'>
                                <Center className='RenameIcon'>
                                    <FaEdit className='RenameIcon' />
                                </Center>
                            </IconButton>
                            <Button bgColor={'rgba(95, 159, 255, 1)'} _hover={{ bg: 'rgba(130, 180, 255, 1)' }} _focus={{bg: 'rgba(130, 180, 255, 1)' }}
                                onClick={() => {
                                    alert('Scene ' + myCollection[i][2][0].getName() + ' is already displayed in GM mode');
                                }}>GM</Button>
                            <Button>Player</Button>
                            <IconButton>
                                <Center>
                                    <MdOutlineDelete />
                                </Center>
                            </IconButton>
                        </div>)
                    }
                    else {
                        collectionJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][0].getID()} key={i}>
                            <h3>{myCollection[i][2][0].getName()}</h3>
                            <IconButton
                                className='RenameButton'>
                                <Center className='RenameIcon'>
                                    <FaEdit className='RenameIcon' />
                                </Center>
                            </IconButton>
                            <Button onClick={() => {
                                let prevCanvas = document.getElementById('scene_' + currentCanvasID);
                                let newCanvas = document.getElementById('scene_' + myCollection[i][2][0].getID());
                                if(newCanvas && prevCanvas)
                                {
                                    let prevDiv = prevCanvas.parentNode as HTMLElement;
                                    prevDiv.style.display = 'none';
                                    let newDiv = newCanvas.parentNode as HTMLElement;
                                    newDiv.style.display = 'block';
                                    setCurrentCanvasID(myCollection[i][2][0].getID());
                                    setCanvas(myCollection[i][1][0]);
                                    setCurrentScene(myCollection[i][2][0]);
                                    setCollectionUpdate(true);
                                }
                                else if(newCanvas)
                                {
                                    alert('Error: Cannot find previous scene canvas');
                                } else if(prevCanvas)
                                {
                                    alert('Error: Cannot find new scene canvas');
                                }
                            }}>GM</Button>
                            <Button>Player</Button>
                            <IconButton>
                                <Center>
                                    <MdOutlineDelete />
                                </Center>
                            </IconButton>
                        </div>)
                    }

                }
                else {
                    //Iterate over all the scenes in the collection
                    let groupJSX = [];
                    for (let j = 0; j < myCollection[i][2].length; j++) {
                        if (currentCanvasID == myCollection[i][2][j].getID()) {
                            groupJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][j].getID()}>
                                <h3>{myCollection[i][2][j].getName()}</h3>
                                <IconButton
                                    className='RenameButton'>
                                    <Center className='RenameIcon'>
                                        <FaEdit className='RenameIcon' />
                                    </Center>
                                </IconButton>
                                <Button bgColor={'rgba(95, 159, 255, 1)'} _hover={{ bg: 'rgba(130, 180, 255, 1)' }}
                                    onClick={() => {
                                        alert('Scene ' + myCollection[i][2][j].getName() + ' is already displayed in GM mode');
                                    }}>GM</Button>
                                <Button>Player</Button>
                                <IconButton>
                                    <Center>
                                        <MdOutlineDelete />
                                    </Center>
                                </IconButton>
                            </div>);
                        }
                        else {
                            groupJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][j].getID()}>
                                <h3>{myCollection[i][2][j].getName()}</h3>
                                <IconButton
                                    className='RenameButton'>
                                    <Center className='RenameIcon'>
                                        <FaEdit className='RenameIcon' />
                                    </Center>
                                </IconButton>
                                <Button onClick={() => {
                                let prevCanvas = document.getElementById('scene_' + currentCanvasID);
                                let newCanvas = document.getElementById('scene_' + myCollection[i][2][j].getID());
                                if(newCanvas && prevCanvas)
                                {
                                    let prevDiv = prevCanvas.parentNode as HTMLElement;
                                    prevDiv.style.display = 'none';
                                    let newDiv = newCanvas.parentNode as HTMLElement;
                                    newDiv.style.display = 'block';
                                    setCurrentCanvasID(myCollection[i][2][j].getID());
                                    setCanvas(myCollection[i][1][j]);
                                    setCurrentScene(myCollection[i][2][j]);
                                    setCollectionUpdate(true);
                                }
                                else if(newCanvas)
                                {
                                    alert('Error: Cannot find previous scene canvas');
                                } else if(prevCanvas)
                                {
                                    alert('Error: Cannot find new scene canvas');
                                }
                            }}>GM</Button>
                                <Button>Player</Button>
                                <IconButton>
                                    <Center>
                                        <MdOutlineDelete />
                                    </Center>
                                </IconButton>
                            </div>);
                        }

                    }
                    collectionJSX.push(<div className='SceneGroup' key={i}>
                        <Collapsible.Root>
                            <Collapsible.Trigger>
                                {myCollection[i][0]}
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                                {groupJSX}
                            </Collapsible.Content>
                        </Collapsible.Root>
                    </div>
                    )
                }
            }
            setSceneCollectionJSX(collectionJSX);
            setCollectionUpdate(false);
        }
    }, [collectionUpdate, currentCanvasID]);

    return (
        <div>
            <div className='ButtonRow'>
                <IconButton><Center><FaFolderPlus /></Center></IconButton>
                <BattleMapCreationMenu linkFactory={linkFactory} setCurrentScene={setCurrentScene}
                    sceneIDMap={sceneIDMap} setSceneIDMap={setSceneIDMap} setCanvas={setCanvas}
                    currentCanvasID={currentCanvasID} setCurrentCanvasID={setCurrentCanvasID}
                    canvasCollection={canvasCollection} setCanvasCollection={setCanvasCollection}
                    setCollectionUpdate={setCollectionUpdate} />
                <Button>Add Roleplaying Scene</Button>
            </div>
            <div>
                <Box scrollbar='visible' overflowY='scroll' maxHeight={innerHeight - 140}>
                    {sceneCollectionJSX}
                </Box>
            </div>
        </div>
    );
}