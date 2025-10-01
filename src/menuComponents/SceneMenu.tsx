import {
    Menu, Button, Input, 
    IconButton,
    Center, Group as GroupElement,
    Box,
    Collapsible
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import '../index.css';
import { FaCheck, FaEdit, FaFolderPlus } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { BattleMapCreationMenu } from './BattleMapCreationMenu';

export function SceneMenu({ sceneIDMap, setSceneIDMap, linkFactory,
    currentCanvasID, setCurrentCanvasID, setCurrentScene, setCanvas, canvasCollection, setCanvasCollection,
}) {
    //State containing JSX that reflects all Scene's in the sceneCollection
    const [sceneCollectionJSX, setSceneCollectionJSX] = useState([]);

    //Boolean state changed to indicate SceneCollection has been changed
    const [collectionUpdate, setCollectionUpdate] = useState<boolean>(true);

    //State that manages whether rename overlay is visible or hidden
    const [renameDisplay, setRenameDisplay] = useState('none');

    //State that stores the string value for renaming a Scene
    const [renameVal, setRenameVal] = useState<string>('');

    //State changed by the rename submission button whether to set the renameVal as a Scene's name
    const [renameSubmit, setRenameSubmit] = useState<boolean>(false);

    //State that stores the current Scene ID that is being renamed
    const [sceneID, setSceneID] = useState<number>(-1)
    
    //State that stores the indexes of the Scene being renamed in the canvasCollection
    const [sceneIndex, setSceneIndex] = useState<[number, number]>([-1, -1]);
    //Function called by the event listener for the click event added by the collectio rename button
    const exitRename = (event) => {
        let target;
        if (event && event.target && (target = event.target) instanceof HTMLElement
            && !target.className.includes('RenameButton') && !target.className.includes('RenameEl')
            && !target.className.includes('SceneRenameField') && !target.className.includes('RenameIcon')) {
            hideRenameEl();
            document.removeEventListener('click', exitRename);
        }
    }

    //Called to hide the renaming element either when done submitting or user exits
    const hideRenameEl = () => {
        setRenameDisplay('none');
        setRenameVal('');
    };

    

    //Triggers on every rerender including when token images load
    useEffect(() => {
        //Check if renaming element is displayed and may need to be repositioned
        if (renameDisplay && renameDisplay == 'flex' && sceneID >= 0 && canvasCollection) {
            //Get the position value that include 'left' to position the renaming element
            let rect = document.querySelector('.Scene_' + sceneID)?.getBoundingClientRect();
            //Position the renaming element over the target collection to be renamed
            var renameField = document.querySelector(".SceneRenameField");
            if (rect && renameField && renameField instanceof HTMLElement) {
                renameField.style.top = `${rect.top}px`;
            }
        }
    })

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
                                className='RenameButton'
                                onClick={(event) => {
                                    //Display the renaming element
                                    setRenameDisplay('flex');
                                    //Indicate what collection is being renamed
                                    setSceneID(myCollection[i][2][0].getID());
                                    setSceneIndex([i, 0]);
                                    let renameButton;
                                    //Check if event and target exist
                                    if (event && (renameButton = event.target as HTMLElement) != null) {
                                        //Get the position value that include 'left' to position the renaming element
                                        let rect = document.querySelector('.Scene_' + myCollection[i][2][0].getID())?.getBoundingClientRect();
                                        //Position the renaming element over the target collection to be renamed
                                        var renameField = document.querySelector(".SceneRenameField");
                                        if (rect && renameField && renameField instanceof HTMLElement) {
                                            renameField.style.top = `${rect.top}px`;
                                        }
                                        document.addEventListener('click', exitRename);
                                    }
                                }}>
                                <Center className='RenameIcon'>
                                    <FaEdit className='RenameIcon' />
                                </Center>
                            </IconButton>
                            <Button bgColor={'rgba(95, 159, 255, 1)'} _hover={{ bg: 'rgba(130, 180, 255, 1)' }} _focus={{ bg: 'rgba(130, 180, 255, 1)' }}
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
                                className='RenameButton' onClick={(event) => {
                                    //Display the renaming element
                                    setRenameDisplay('flex');
                                    //Indicate what collection is being renamed
                                    setSceneID(myCollection[i][2][0].getID());
                                    setSceneIndex([i, 0]);
                                    let renameButton;
                                    //Check if event and target exist
                                    if (event && (renameButton = event.target as HTMLElement) != null) {
                                        //Get the position value that include 'left' to position the renaming element
                                        let rect = document.querySelector('.Scene_' + myCollection[i][2][0].getID())?.getBoundingClientRect();
                                        //Position the renaming element over the target collection to be renamed
                                        var renameField = document.querySelector(".SceneRenameField");
                                        if (rect && renameField && renameField instanceof HTMLElement) {
                                            renameField.style.top = `${rect.top}px`;
                                        }
                                        document.addEventListener('click', exitRename);
                                    }
                                }}>
                                <Center className='RenameIcon'>
                                    <FaEdit className='RenameIcon' />
                                </Center>
                            </IconButton>
                            <Button onClick={() => {
                                let prevCanvas = document.getElementById('scene_' + currentCanvasID);
                                let newCanvas = document.getElementById('scene_' + myCollection[i][2][0].getID());
                                if (newCanvas && prevCanvas) {
                                    let prevDiv = prevCanvas.parentNode as HTMLElement;
                                    prevDiv.style.display = 'none';
                                    let newDiv = newCanvas.parentNode as HTMLElement;
                                    newDiv.style.display = 'block';
                                    setCurrentCanvasID(myCollection[i][2][0].getID());
                                    setCanvas(myCollection[i][1][0]);
                                    setCurrentScene(myCollection[i][2][0]);
                                    setCollectionUpdate(true);
                                }
                                else if (newCanvas) {
                                    alert('Error: Cannot find previous scene canvas');
                                } else if (prevCanvas) {
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
                                    className='RenameButton' onClick={(event) => {
                                        //Display the renaming element
                                        setRenameDisplay('flex');
                                        //Indicate what collection is being renamed
                                        setSceneID(myCollection[i][2][j].getID());
                                        setSceneIndex([i, j]);
                                        let renameButton;
                                        //Check if event and target exist
                                        if (event && (renameButton = event.target as HTMLElement) != null) {
                                            //Get the position value that include 'left' to position the renaming element
                                            let rect = document.querySelector('.Scene_' + myCollection[i][2][j].getID())?.getBoundingClientRect();
                                            //Position the renaming element over the target collection to be renamed
                                            var renameField = document.querySelector(".SceneRenameField");
                                            if (rect && renameField && renameField instanceof HTMLElement) {
                                                renameField.style.top = `${rect.top}px`;
                                            }
                                            document.addEventListener('click', exitRename);
                                        }
                                    }}>
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
                                    className='RenameButton' onClick={(event) => {
                                        //Display the renaming element
                                        setRenameDisplay('flex');
                                        //Indicate what collection is being renamed
                                        setSceneID(myCollection[i][2][j].getID());
                                        setSceneIndex([i, j]);
                                        let renameButton;
                                        //Check if event and target exist
                                        if (event && (renameButton = event.target as HTMLElement) != null) {
                                            //Get the position value that include 'left' to position the renaming element
                                            let rect = document.querySelector('.Scene_' + myCollection[i][2][j].getID())?.getBoundingClientRect();
                                            //Position the renaming element over the target collection to be renamed
                                            var renameField = document.querySelector(".SceneRenameField");
                                            if (rect && renameField && renameField instanceof HTMLElement) {
                                                renameField.style.top = `${rect.top}px`;
                                            }
                                            document.addEventListener('click', exitRename);
                                        }
                                    }}>
                                    <Center className='RenameIcon'>
                                        <FaEdit className='RenameIcon' />
                                    </Center>
                                </IconButton>
                                <Button onClick={() => {
                                    let prevCanvas = document.getElementById('scene_' + currentCanvasID);
                                    let newCanvas = document.getElementById('scene_' + myCollection[i][2][j].getID());
                                    if (newCanvas && prevCanvas) {
                                        let prevDiv = prevCanvas.parentNode as HTMLElement;
                                        prevDiv.style.display = 'none';
                                        let newDiv = newCanvas.parentNode as HTMLElement;
                                        newDiv.style.display = 'block';
                                        setCurrentCanvasID(myCollection[i][2][j].getID());
                                        setCanvas(myCollection[i][1][j]);
                                        setCurrentScene(myCollection[i][2][j]);
                                        setCollectionUpdate(true);
                                    }
                                    else if (newCanvas) {
                                        alert('Error: Cannot find previous scene canvas');
                                    } else if (prevCanvas) {
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

    //Function to update the renameVal
    const updateRename = (event) => {
        setRenameVal(event.target.value);
    }

    //Called when the rename field submit button is pressed which changes the state to trigger this
    //useEffect. Changes the name of the target selection.
    useEffect(() => {
        //Check if all states are valid
        if (renameSubmit && canvasCollection && sceneID >= 0 && sceneIndex[0] >= 0 && sceneIndex[1] >= 0 && sceneIndex[0] < canvasCollection.length 
            && sceneIndex[1] < canvasCollection[sceneIndex[0]][2].length
        ){
            //Check if rename string is not empty or only spaces
            if (renameVal.trim() == '') {
                alert('Scene name cannot be empty or only contain spaces')
            }
            //Check if rename string is greater than than 64 characters
            else if (renameVal.length > 64) {
                alert('Scene name cannot exceed 64 characters');
            }
            else {

                let myCollection = canvasCollection;
                //Iterate over all collections and make sure the no collections have the same value 
                for (let i = 0; i < myCollection.length; i++) {
                    for (let j = 0; j < myCollection[i][2].length; j++) {
                        //Considers spaces or tabs added before and after the rename value
                        if ((sceneIndex[0] != i || (sceneIndex[0] == i && sceneIndex[1] != j)) && myCollection[i][2][j].getName() == renameVal.trim()) {
                            if (!confirm('Another Scene already has this name. Do you want to rename this Scene?')) {
                                setRenameSubmit(false);
                                return;
                            }
                            break;
                        }
                    }

                }
                //Rename the collection
                myCollection[sceneIndex[0]][2][sceneIndex[1]].setName(renameVal.trim());
                //Update the tokenCollection
                //setTokenCollection(myCollection);
                //Indicate change so Token Menu rerenders
                setCollectionUpdate(true);
                //Update index to no longer pair to the target collection
                setSceneID(-1);

                setSceneIndex([-1,-1]);
                //Hide the renaming element
                hideRenameEl();
            }

        }
        //Reset confirm so useEffect can trigger on later submits
        setRenameSubmit(false);
    }, [renameSubmit]);

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
            <GroupElement className='SceneRenameField' attached w={'full'} position='absolute' bgColor={'rgba(160, 121, 121, 1)'}
                maxW='md' display={renameDisplay}>
                <Input flex='1' placeholder="Enter the scene's name" value={renameVal}
                    onChange={updateRename} className='RenameEl' height={50 + 'px'} />
                <IconButton height={50 + 'px'} width={50 + 'px'} left={-3} className='RenameEl' onClick={() => { setRenameSubmit(true); }}>
                    <Center><FaCheck /></Center>
                </IconButton>
            </GroupElement>
        </div>
    );
}