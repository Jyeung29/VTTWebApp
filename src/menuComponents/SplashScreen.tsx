import {
    Button, Portal,
    Input, Field, Select, Box,
    createListCollection,
    CloseButton,
    Dialog,
    Spinner,
    Center,
    Combobox,
    useFilter,
    useListCollection,
    FileUpload
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Token } from '../tokenComponents/Token';
import '../index.css';
import { Canvas, Circle, FabricImage, FixedLayout, Group, LayoutManager, Textbox } from 'fabric';
import { systems } from '../Factory';
import { HiUpload } from 'react-icons/hi';
import { Factory } from '../Factory';
import BattleMap from '../SceneComponents/BattleMap';

const CANVASCOLLECTIONLENGTH = 3;

export function SplashScreen({ setNewCampaign, openSplash, setOpenSplash, ttrpgSystem, setCanvasCollection, setCurrentCanvasID, setSceneIDMap, setTokenCollection, factory, setCanvas, setCurrentScene }) {
    const { contains } = useFilter({ sensitivity: 'base' });
    const { collection, filter } = useListCollection({ initialItems: systems, filter: contains });
    const [systemChosen, setSystemChosen] = useState();
    const [createCampaign, setCreateCampaign] = useState(false);
    const [spinState, setSpinState] = useState('none');

    const fileUploaded = (event) => {
        let file = event.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target && typeof e.target.result == 'string') {
                const fileContent = e.target.result;
                let object;
                console.log(fileContent);
                try {
                    object = JSON.parse(fileContent);
                }
                catch (error) {
                    alert(error);
                    return;
                }

                console.log(object);

                if (!('canvasCollection'! in object) || !('tokenCollection'! in object) || !('currentCanvasID'! in object) || !('sceneIDMap' in object)) {
                    alert('Campaign file is in the wrong format or has been corrupted');
                    return;
                }

                if (!Array.isArray(object.canvasCollection)) {
                    alert('Campaign file contains canvasCollection property that is not an array');
                    return;
                }

                if (!Array.isArray(object.tokenCollection)) {
                    alert('Campaign file contains tokenCollection property that is not an array');
                    return;
                }

                if (typeof object.sceneIDMap != 'object') {
                    alert('Campaign file contains sceneIDMap property that is not an object');
                    return;
                }

                if (typeof object.currentCanvasID != 'number') {
                    alert('Campaign file contains currentCanvasID property that is not a number');
                    return;
                }

                let newCollection = [];
                try {
                    let map = new Map(Object.entries(object.sceneIDMap));
                    if (map.size < 1) {
                        throw Error('Campaign file must have at least 1 sceneIDMap');
                    }

                    let atLeastOne = false;
                    map.forEach(function (value, key) {
                        if(typeof key != 'number' || typeof value != 'boolean')
                        {
                            throw Error('Campaign file must have sceneIDMap entries in pairs of an ID number and boolean value');
                        }
                        //Detect if there is at least 1 Scene ID in use
                        if(value)
                        {
                            atLeastOne = true;
                        }
                    });

                    if(!atLeastOne) throw Error('Campaign file must have at least 1 active ID in use in sceneIDMap');

                    setSceneIDMap(map);

                    let dupMap = new Map();

                    let parentDiv = document.getElementById('SceneDiv');
                    if (parentDiv) {
                        for (let i = 0; i < object.canvasCollection.length; i++) {
                            if (object.canvasCollection[i].length != CANVASCOLLECTIONLENGTH) {
                                throw Error('Campaign file contains canvasCollection property that contains items not of length ' + CANVASCOLLECTIONLENGTH);
                            }
                            if (typeof object.canvasCollection[i][0] != 'string' || !Array.isArray(object.canvasCollection[i][1]) || !Array.isArray(object.canvasCollection[i][2])) {
                                throw Error('Campaign file contains canvasCollection property that has items not in format of [string, Object[], Object[]]');
                            }

                            if (object.canvasCollection[i][1].length != object.canvasCollection[i][2].length) {
                                throw Error('Campaign file contains canvasCollection property that contains items of Scene and Canvas arrays that are not the same length');
                            }

                            let canvasArray = [];
                            let sceneArray = [];

                            //Iterate over all canvasCollection and rebuild each Canvas and Scene pair
                            for (let j = 0; j < object.canvasCollection[i][1].length; j++) {
                                if (typeof object.canvasCollection[i][1][j] != 'object' || typeof object.canvasCollection[i][2][j] != 'object') {
                                    throw Error('Campaign file contains canvasCollection property that contains items of Scene and Canvas arrays that are in in object representation');
                                }

                                let newScene;

                                if ('SCENETYPE' in object.canvasCollection[i][2][j] && object.canvasCollection[i][2][j].SCENETYPE == 0) {
                                    newScene = new BattleMap(object.canvasCollection[i][2][j]);
                                }
                                else {
                                    throw Error('Campaign file contains canvasCollection property with an item that does not define a valid SCENETYPE for a Scene');
                                }

                                let newCanvas = document.createElement('canvas');
                                if(!dupMap.has(newScene.getID()))
                                {
                                    dupMap.set(newScene.getID(), true);
                                }
                                else
                                {
                                    throw Error('Campaign file contains multiple of the same Scene ID');
                                }

                                newCanvas.id = 'scene_' + newScene.getID();
                                const fabricCanvas = new Canvas(newCanvas, {
                                    width: window.innerWidth,
                                    height: window.innerHeight,
                                    backgroundColor: 'rgb(0,0,0)',
                                    enableRetinaScaling: true
                                });

                                fabricCanvas.loadFromJSON(object.canvasCollection[i][1][j], function (o, object) {
                                    //parse objects and add events to the Token Groups
                                    if (object instanceof Group && object.getObjects().length > 1 && object.getObjects()[0] instanceof FabricImage) {
                                        let tokenEls = object.getObjects();
                                        let newRadius: number;
                                        if (tokenEls[0].width >= tokenEls[0].height) {
                                            newRadius = tokenEls[0].height / 4;
                                        }
                                        else {
                                            newRadius = tokenEls[0].width / 4;
                                        }
                                        //Make sure Token Group objects all have the valid data members
                                        if (!(tokenEls[1] instanceof Circle) || tokenEls[0].clipPath == null || tokenEls[0].selectable || tokenEls[1].strokeWidth != 1 || tokenEls[1].lockScalingX || tokenEls[1].lockScalingY
                                            || !(tokenEls[0].clipPath instanceof Circle) || Math.floor(tokenEls[0].clipPath.radius * 10000) != Math.floor(newRadius * 10000)
                                            || tokenEls[1].fill != 'transparent' || !tokenEls[1].strokeUniform || Math.floor(tokenEls[1].radius * 10000) != Math.floor(newRadius * 10000) || Math.floor(object.width * 10000) != Math.floor(newRadius * 2.2 * 10000) || Math.floor(object.height * 100) != Math.floor(newRadius * 2.2 * 100) || !object.lockRotation
                                            || !object.lockSkewingX || !object.lockSkewingY || !object.lockScalingFlip || !object.lockScalingY || !object.lockScalingX || !(object.layoutManager.strategy instanceof FixedLayout)
                                        ) {
                                            throw Error('Campaign file contains Scene with a Token with incorrect settings')
                                        }

                                        let removeGroup = (event) => {
                                            if (event.target == object) {
                                                newScene.removeToken(object);
                                            }
                                            fabricCanvas.off('object:removed', removeGroup);
                                        };
                                        fabricCanvas.on('object:removed', removeGroup);
                                    }
                                    else if (object instanceof Textbox) {
                                        if (object.selectable || !object.lockRotation || !object.lockScalingFlip || !object.lockSkewingX ||
                                            !object.lockSkewingY || object.textAlign != 'center'
                                        ) {
                                            throw Error('Campaign file contains Token name element that has inccorect settings');
                                        }
                                    }

                                }).then((canvas) => {
                                    //canvas restored
                                    let img;
                                    //Check if Scene contains FabricImage at lowest layer with valid data members
                                    if (fabricCanvas.getObjects().length > 0 && (img = fabricCanvas.getObjects()[0]) instanceof FabricImage) {
                                        if (img.hoverCursor != 'default' || img.hasBorders || img.hasControls || img.selectable) {
                                            throw Error('Campaign file contains a Scene with an image on the lowest layer with incorrect settings');
                                        }
                                        newScene.addImage(img);
                                    }
                                    else {
                                        throw Error('Campaign file contains a Scene without an image on the lowest layer');
                                    }
                                    parentDiv.appendChild(newCanvas);
                                });
                                canvasArray.push(fabricCanvas);
                                sceneArray.push(newScene);
                            }
                            newCollection.push([object.canvasCollection[i][0],canvasArray,sceneArray]);
                        }
                    }

                } catch (error) {
                    alert(error);
                    return;
                }
                /*

        //Make sure image loads before adding to Canvas
          //Update ID map to indicate the id is taken
          let newMap = sceneIDMap;
          newMap.set(idNum, true);
          setSceneIDMap(newMap);
          fabricCanvas.renderAll();
          //Hide the previous canvas
          let prevID = 'scene_' + currentCanvasID;
          let prevCanvas = document.getElementById(prevID);
          if (prevCanvas) {
            let prevDiv = prevCanvas.parentNode as HTMLElement;
            prevDiv.style.display = 'none';
          }
        };
      }
        
        
                                //When Token is selected, add a listener for the context menu
                                //and prevent context menu from being exited
                                group.on('selected', () => {
                                    let selectedObjects = canvas.getActiveObjects();
                                    let allTokens: boolean = true;
                                    let tokenNumber: number = 0;
                                    //Iterate over selected objects and determine if all are Token groups
                                    for (let i = 0; i < selectedObjects.length; i++) {
                                        let tokenGroup;
                                        if (((tokenGroup = selectedObjects[i]) instanceof Group) && (tokenGroup.getObjects().length > 1)
                                            && (tokenGroup.getObjects()[0] instanceof FabricImage)) {
                                            tokenNumber++;
                                        }
                                        else //If not a Token Group end loop
                                        {
                                            allTokens = false;
                                            break;
                                        }
                                    }
        
                                    //If all selected Group objects are Token groups then allow context menu access
                                    if (allTokens) {
                                        document.addEventListener('contextmenu', cmManager.updateContextMenuPosition);
                                        cmManager.setContextMenuExit(false);
                                        if (tokenNumber > 1) {
                                            cmManager.setMultiSelectionBool(true);
                                            let groupBox = canvas.getActiveObject();
                                            if(groupBox)
                                            {
                                                //Should not cause memory leak due to the multi object selection being removed and deleted
                                               groupBox.on('mouseover', () => {
                                                document.addEventListener('contextmenu', cmManager.updateContextMenuPosition)
                                                });
                                                groupBox.on('mouseout', () => {
                                                    document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
                                                });
                                            }
                                            
                                        }
                                        else {
                                            cmManager.setMultiSelectionBool(false);
                                        }
                                    }
                                });
        
                                //When mouse hovers over Token group and the group is selected, add listener for context menu
                                group.on('mouseover', () => {
                                    let selectedObjects = canvas.getActiveObjects();
                                    for (let i = 0; i < selectedObjects.length; i++) {
                                        if (selectedObjects[i] == group) {
                                            document.addEventListener('contextmenu', cmManager.updateContextMenuPosition);
                                            break;
                                        }
                                    }
                                });
        
                                //When mouse no longer hovers over Token group, remove listener for context menu
                                group.on('mouseout', (mouseEvent) => {
                                    let selectedObjects = canvas.getActiveObjects();
                                    for (let i = 0; i < selectedObjects.length; i++) {
                                        if (selectedObjects[i] == group) {
                                            document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
                                            break;
                                        }
                                    }
                                });
        
                                //When Token group is no longer selected, remove listener for context menu and
                                //allow context menu to be exited
                                group.on('deselected', () => {
                                    document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
                                    cmManager.setContextMenuExit(true);
                                    cmManager.setMultiSelectionBool(false);
                                });
                            }
                        }
                    }
                }*/
                setOpenSplash(false);
            }
        }
        reader.readAsText(file);

    }

    useEffect(() => {
        if (createCampaign) {
            if (systemChosen && systemChosen[0] != '') {
                setOpenSplash(false);
                setNewCampaign(true);
            }
            else {
                alert('Choose a TTRPG System');
            }
            setCreateCampaign(false);
        }
    }, [createCampaign]);

    const changeSystem = (event) => {
        setSystemChosen(event.value);
    }

    return (
        <Dialog.Root size="full" placement="center" motionPreset="slide-in-bottom" open={openSplash}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Create or Continue Campaign</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body position='relative' display={'flex'} flexDir={'row'} justifyContent={'center'}>
                            <Center>
                                <Box>
                                    <h2>New Campaign</h2>
                                    <Combobox.Root
                                        collection={collection}
                                        onInputValueChange={(e) => filter(e.inputValue)}
                                        width="320px"
                                        value={systemChosen}
                                        onValueChange={changeSystem}
                                        positioning={{ strategy: 'fixed', hideWhenDetached: true }}
                                    >
                                        <Combobox.Label>Select TTRPG System</Combobox.Label>
                                        <Combobox.Control>
                                            <Combobox.Input placeholder="Type to search" />
                                            <Combobox.IndicatorGroup>
                                                <Combobox.ClearTrigger />
                                                <Combobox.Trigger />
                                            </Combobox.IndicatorGroup>
                                        </Combobox.Control>
                                        <Combobox.Positioner>
                                            <Combobox.Content>
                                                <Combobox.Empty>No items found</Combobox.Empty>
                                                {collection.items.map((item) => (
                                                    <Combobox.Item item={item} key={item.value}>
                                                        {item.label}
                                                        <Combobox.ItemIndicator />
                                                    </Combobox.Item>
                                                ))}
                                            </Combobox.Content>
                                        </Combobox.Positioner>
                                    </Combobox.Root>
                                    <Button onClick={() => { setCreateCampaign(true) }} >Create Campaign</Button>
                                </Box>
                                <Box>
                                    <h2>Existing Campaign</h2>
                                    <FileUpload.Root className='GridSettingHiddenElement' accept={["application/json"]}
                                        onFileAccept={fileUploaded}>
                                        <FileUpload.HiddenInput />
                                        <FileUpload.Trigger asChild>
                                            <Button variant="outline" size="sm" display={'flex'}>
                                                <HiUpload /> Upload Campaign File
                                            </Button>
                                        </FileUpload.Trigger>
                                        <FileUpload.List />
                                    </FileUpload.Root>
                                </Box>
                            </Center>
                        </Dialog.Body>
                        <Box pos={'absolute'} inset='0' bg='bg/80' display={spinState}>
                            <Center h='full'>
                                <Spinner size='xl' />
                            </Center>
                        </Box>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}