import {
    Menu, Button, Input,
    IconButton,
    Center, Group as GroupElement,
    Box,
    Collapsible,
    Portal,
    Flex
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import '../index.css';
import { FaCheck, FaEdit, FaFolderPlus } from 'react-icons/fa';
import { MdOutlineDelete } from 'react-icons/md';
import { BattleMapCreationMenu } from './BattleMapCreationMenu';

export function SceneMenu({ sceneIDMap, setSceneIDMap, linkFactory, canvasIndex,
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
    const sceneIndex = useRef<[number, number]>([-1, -1]);

    //State that contains JSX for showing collection's names in the TokenMenu context menu for the
    //'Add to a Collection' button
    const [collectionNamesJSX, setCollectionNames] = useState([]);

    //State used to determine whether TokenMenu context menu is active
    const [cmActive, setContextMenuActive] = useState(false);


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

        let collectionContextMenuJSX = [];

        const pushSceneToCollection = (event: MouseEvent) => {
            let newCollection = canvasCollection;

            //Get the target collection's index from the className scheme. Scheme should have index at 2
            if (event.target && event.target instanceof HTMLElement) {
                //Index 2 accounts for the className of Button to include the chakra-button className
                let index = Number((event.target.className.split(' '))[2]);
                //Check if index is valid and the Token to push's index is valid
                if (index >= 0 && index < canvasCollection.length && sceneIndex.current[0] >= 0 && sceneIndex.current[1] >= 0) {
                    let scene = canvasCollection[sceneIndex.current[0]][2][sceneIndex.current[1]];
                    let canvas = canvasCollection[sceneIndex.current[0]][1][sceneIndex.current[1]];
                    let tokens = canvasCollection[sceneIndex.current[0]][3][sceneIndex.current[1]];
                    let tokenImages = canvasCollection[sceneIndex.current[0]][4][sceneIndex.current[1]];

                    //Iterate over the target collection to check if the Token already exists
                    for (let i = 0; i < canvasCollection[index][2].length; i++) {
                        if (scene == canvasCollection[index][2][i]) {
                            alert('Scene Already Exists in Collection');
                            return;
                        }
                    }
                    newCollection[sceneIndex.current[0]][2].splice(sceneIndex.current[1], 1);
                    newCollection[sceneIndex.current[0]][1].splice(sceneIndex.current[1], 1);
                    newCollection[sceneIndex.current[0]][3].splice(sceneIndex.current[1],1);
                    newCollection[sceneIndex.current[0]][4].splice(sceneIndex.current[1],1);

                    newCollection[index][2].push(scene);
                    newCollection[index][1].push(canvas);
                    newCollection[index][3].push(tokens);
                    newCollection[index][4].push(tokenImages);
                    

                    if (newCollection[sceneIndex.current[0]][0] == '') {
                        newCollection.splice(sceneIndex.current[0], 1);
                    }

                    if(sceneIndex.current == canvasIndex.current)
                    {
                        canvasIndex.current = [index, newCollection[index][2].length];   
                    }
                    setCanvasCollection(newCollection);
                    setCollectionUpdate(true);
                    exitSceneCM();
                }
            }
        }

        if (collectionUpdate && myCollection.length > 0) {
            for (let i = 0; i < myCollection.length; i++) {
                //Check current array is a lone scene not in any collection
                if (myCollection[i][0] == '') {
                    //Check if the Scene is the active Scene. If so change GM button to not function
                    if (currentCanvasID == myCollection[i][2][0].getID()) {
                        collectionJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][0].getID() + ' Scene-' + i + '-0'} key={i}>
                            <h3 className={'SceneName' + ' Scene-' + i + '-0'}>{myCollection[i][2][0].getName()}</h3>
                            <IconButton
                                className='RenameButton'
                                onClick={(event) => {
                                    //Display the renaming element
                                    setRenameDisplay('flex');
                                    //Indicate what collection is being renamed
                                    setSceneID(myCollection[i][2][0].getID());
                                    sceneIndex.current = [i, 0];
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
                        </div>)
                    }
                    else {
                        collectionJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][0].getID() + ' Scene-' + i + '-0'} key={i}>
                            <h3 className={'SceneName' + ' Scene-' + i + '-0'}>{myCollection[i][2][0].getName()}</h3>
                            <IconButton
                                className='RenameButton' onClick={(event) => {
                                    //Display the renaming element
                                    setRenameDisplay('flex');
                                    //Indicate what collection is being renamed
                                    setSceneID(myCollection[i][2][0].getID());
                                    sceneIndex.current = [i, 0];
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
                                    canvasIndex.current = [i,0];
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
                    if (myCollection[i][2].length == 0) {
                        groupJSX.push(<p key='0'>No Scenes are in this Collection</p>);
                    }
                    collectionContextMenuJSX.push(<Button className={'SceneMenuElement ' + i} onClick={pushSceneToCollection} key={i}>{myCollection[i][0]}</Button>);
                    for (let j = 0; j < myCollection[i][2].length; j++) {
                        if (currentCanvasID == myCollection[i][2][j].getID()) {
                            groupJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][j].getID() + ' Scene-' + i + '-' + j} key={i + '_' + j}>
                                <h3 className={'SceneName' + ' Scene-' + i + '-' + j}>{myCollection[i][2][j].getName()}</h3>
                                <IconButton
                                    className='RenameButton' onClick={(event) => {
                                        //Display the renaming element
                                        setRenameDisplay('flex');
                                        //Indicate what collection is being renamed
                                        setSceneID(myCollection[i][2][j].getID());
                                        sceneIndex.current = [i, j];
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
                                <Button bgColor={'rgba(95, 159, 255, 1)'} _hover={{ bg: 'rgba(130, 180, 255, 1)' }} _focus={{ bg: 'rgba(130, 180, 255, 1)' }}
                                    onClick={() => {
                                        alert('Scene ' + myCollection[i][2][j].getName() + ' is already displayed in GM mode');
                                    }}>GM</Button>
                                <Button>Player</Button>
                            </div>);
                        }
                        else {
                            groupJSX.push(<div className={'SceneEl Scene_' + myCollection[i][2][j].getID() + ' Scene-' + i + '-' + j} key={i + '_' + j}>
                                <h3 className={'SceneName' + ' Scene-' + i + '-' + j}>{myCollection[i][2][j].getName()}</h3>
                                <IconButton
                                    className='RenameButton' onClick={(event) => {
                                        //Display the renaming element
                                        setRenameDisplay('flex');
                                        //Indicate what collection is being renamed
                                        setSceneID(myCollection[i][2][j].getID());
                                        sceneIndex.current = [i, j];
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
                                        canvasIndex.current = [i, j];
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
                                <Center>{myCollection[i][0]}</Center>
                            </Collapsible.Trigger>
                            <Collapsible.Content borderWidth='1px' borderColor={'gray'}>
                                {groupJSX}
                            </Collapsible.Content>
                        </Collapsible.Root>
                    </div>
                    )
                }
            }
            setSceneCollectionJSX(collectionJSX);
            setCollectionUpdate(false);
            setCollectionNames(collectionContextMenuJSX);
        }
    }, [collectionUpdate, currentCanvasID, sceneIndex]);

    //Function that adds a new collection for Tokens to be stored in
    const addCollection = () => {
        var allCollections = canvasCollection;
        var num: number = 0;
        var name;
        //Iterate over all Collections
        for (let i = 0; i < canvasCollection.length; i++) {
            //Check if collection includes 'New Group'
            if (typeof (name = canvasCollection[i][0]) === 'string' && name.includes('New Group')) {
                //Make sure the not a duplicate number otherwise increase the number
                //Assumes that user cannot rename a collection to include 'New Group'
                if (!name.includes(num.toString()) && name != 'New Group') {
                    break;
                }
                else {
                    num++;
                }
            }
        }
        if (num > 0) {
            name = 'New Group ' + num;
            allCollections.push([name, [], [], [], []]);
        }
        else if (num == 0) {
            allCollections.push(['New Group', [], [], [], []]);
        }
        setCanvasCollection(allCollections);
        setCollectionUpdate(true);
    }

    //Function to display the Token Menu's Context Menu
    const cmFunction = (event) => {
        let target;
        //Check whether context menu triggered on a BaseTokenImage
        if ((target = event.target) instanceof HTMLElement
            && target.className.includes('SceneEl')) {
            updateSceneContextMenuPosition(event);
            setContextMenuActive(true);
            let classes = target.className.split(' ');
            let indexes = classes[2].split('-');
            sceneIndex.current = [Number(indexes[1]), Number(indexes[2])];
            console.log([Number(indexes[1]), Number(indexes[2])])
        }
        else if (target instanceof HTMLElement && target.className.includes('SceneName')) {
            updateSceneContextMenuPosition(event);
            setContextMenuActive(true);
            let classes = target.className.split(' ');
            let indexes = classes[1].split('-');
            sceneIndex.current = [Number(indexes[1]), Number(indexes[2])];
            console.log([Number(indexes[1]), Number(indexes[2])])
        }
    };

    //Function to check whether to hide Token Menu's Context Menu
    const mouseDownFunction = (event) => {
        let target;
        //Check if clicking inside the SceneContextMenu based on className.
        //target.className must use includes() because ChakraUI elements add to the className string.
        if (cmActive && (target = event.target) instanceof HTMLElement &&
            !(target.className.includes('SceneContextMenu')
                || target.className.includes('SceneMenuElement'))
        ) {
            //If not clicking inside, hide BaseTokenContextMenu
            exitSceneCM();
        }
    }

    //Helper function called by mouseDownFunction to hide the Token Context Menu
    const exitSceneCM = () => {
        //Hide context menu
        var contextMenu = document.querySelector(".SceneContextMenu");
        var portal = document.querySelector('.SceneCollectionNames');
        if (contextMenu && contextMenu instanceof HTMLElement) {
            contextMenu.style.display = 'none';
        }
        if(portal && portal instanceof HTMLElement)
        {
            portal.style.display = 'none';
        }
        //Set related states to inactive states
        setContextMenuActive(false);
        sceneIndex.current = [-1, -1];
        console.log('set end')
    }

    //Update event listeners to display and hide context menu using the latest context 
    // menu boolean's state
    useEffect(() => {

        document.addEventListener('contextmenu', cmFunction);
        document.addEventListener('mousedown', mouseDownFunction);
        return () => {
            document.removeEventListener('contextmenu', cmFunction);
            document.removeEventListener('mousedown', mouseDownFunction);
        }
    }, [cmActive]);

    //Function to update the renameVal
    const updateRename = (event) => {
        setRenameVal(event.target.value);
    }

    //Called when the rename field submit button is pressed which changes the state to trigger this
    //useEffect. Changes the name of the target selection.
    useEffect(() => {
        //Check if all states are valid
        if (renameSubmit && canvasCollection && sceneID >= 0 && sceneIndex.current[0] >= 0 && sceneIndex.current[1] >= 0 && sceneIndex.current[0] < canvasCollection.length
            && sceneIndex.current[1] < canvasCollection[sceneIndex.current[0]][2].length
        ) {
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
                        if ((sceneIndex.current[0] != i || (sceneIndex.current[0] == i && sceneIndex.current[1] != j)) && myCollection[i][2][j].getName() == renameVal.trim()) {
                            if (!confirm('Another Scene already has this name. Do you want to rename this Scene?')) {
                                setRenameSubmit(false);
                                return;
                            }
                            break;
                        }
                    }

                }
                //Rename the collection
                myCollection[sceneIndex.current[0]][2][sceneIndex.current[1]].setName(renameVal.trim());
                //Update the tokenCollection
                //setTokenCollection(myCollection);
                //Indicate change so Token Menu rerenders
                setCollectionUpdate(true);
                //Update index to no longer pair to the target collection
                setSceneID(-1);

                sceneIndex.current = [-1, -1];
                console.log('end rename')
                //Hide the renaming element
                hideRenameEl();
            }

        }
        //Reset confirm so useEffect can trigger on later submits
        setRenameSubmit(false);
    }, [renameSubmit]);

    const removeFromCollection = () => {
        if(sceneIndex && sceneIndex.current[0] >= 0 && sceneIndex.current[1] >= 0 && sceneIndex.current[0] < canvasCollection.length 
            && sceneIndex.current[1] < canvasCollection[sceneIndex.current[0]][1].length)
        {
            if(canvasCollection[sceneIndex.current[0]][0] == '')
            {
                alert('Scene is not part of any collection');
            }
            else
            {
                if(canvasIndex.current == sceneIndex.current)
                {
                    canvasIndex.current = [canvasCollection.length - 1, 0];
                }
                let newCollection = canvasCollection;
                let canvas = newCollection[sceneIndex.current[0]][1][sceneIndex.current[1]];
                let scene = newCollection[sceneIndex.current[0]][2][sceneIndex.current[1]];
                let tokens = newCollection[sceneIndex.current[0]][3][sceneIndex.current[1]];
                let tokenImages = newCollection[sceneIndex.current[0]][4][sceneIndex.current[1]];
                newCollection.push(['',[canvas],[scene], [tokens], [tokenImages]]);
                newCollection[sceneIndex.current[0]][1].splice(sceneIndex.current[1],1);
                newCollection[sceneIndex.current[0]][2].splice(sceneIndex.current[1],1);
                newCollection[sceneIndex.current[0]][3].splice(sceneIndex.current[1],1);
                newCollection[sceneIndex.current[0]][4].splice(sceneIndex.current[1],1);
                setCanvasCollection(newCollection);
                setCollectionUpdate(true);
            }
        }
    }

    return (
        <div>
            <div className='ButtonRow'>
                <IconButton onClick={addCollection}><Center><FaFolderPlus /></Center></IconButton>
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
            <div className='SceneContextMenu' >
                <Flex className='SceneMenuElement' gap="0" direction="column"
                    backgroundColor={'rgba(240, 240, 240, 1)'} alignContent='center' width={210}>
                    <Menu.Root positioning={{ placement: "right-start" }}>
                        <Menu.Trigger asChild>
                            <Button variant="outline" size="sm">Add to a Collection</Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner zIndex={'sticky'}>
                                <Menu.Content position="relative" zIndex={'modal'} className='SceneCollectionNames'>
                                    <Flex className='SceneMenuElement' direction={'column'}
                                        scrollbar='visible' overflowY='scroll' css={{
                                            '&::-webkit-scrollbar': {
                                                width: '8px', // Adjust scrollbar width
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: 'gray.100', // Scrollbar track background color
                                                borderRadius: '10px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: 'gray.500', // Scrollbar thumb color
                                                borderRadius: '10px',
                                            },
                                            '&::-webkit-scrollbar-thumb:hover': {
                                                background: 'gray.500', // Scrollbar thumb hover color
                                            },
                                        }}
                                    >
                                        {collectionNamesJSX}
                                    </Flex>
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    <Button>Edit</Button>
                    <Button className='SceneMenuElement' onClick={removeFromCollection}>Remove from Collection</Button>
                </Flex>
            </div>
            <GroupElement className='SceneRenameField' attached w={'full'} position='absolute' bgColor={'rgb(255, 255, 255)'}
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

function updateSceneContextMenuPosition(event: Event): boolean {
    var contextMenu = document.querySelector(".SceneContextMenu");

    if (contextMenu && event.type == 'contextmenu' && contextMenu instanceof HTMLElement) {
        contextMenu.style.display = "flex";
        const maxTopValue = window.innerHeight - contextMenu.offsetHeight;
        const maxLeftValue = window.innerWidth - contextMenu.offsetWidth;
        contextMenu.style.left = `${Math.min(event.x, maxLeftValue)}px`;
        contextMenu.style.top = `${Math.min(event.y, maxTopValue)}px`;
        return true;
    }
    return false;
}