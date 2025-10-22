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
import { FabricImage } from 'fabric';
import { systems } from '../Factory';
import { HiUpload } from 'react-icons/hi';
import { Factory } from '../Factory';

const CANVASCOLLECTIONLENGTH = 3;

export function SplashScreen({ openSplash, setOpenSplash, ttrpgSystem, setCanvasCollection, setCurrentCanvasID, setSceneIDMap, setTokenCollection, factory, setCanvas, setCurrentScene }) {
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
                try{
                    object = JSON.parse(fileContent);
                }
                catch(error)
                {
                    alert(error);
                    return;
                }
                
                console.log(object);

                if('canvasCollection' !in object || 'tokenCollection' !in object || 'currentCanvasID' !in object || 'sceneIDMap' !in object)
                {
                    alert('Campaign file is in the wrong format or has been corrupted');
                    return;
                }

                if(!Array.isArray(object.canvasCollection))
                {
                   alert('Campaign file contains canvasCollection property that is not an array');
                   return;
                }

                if(!Array.isArray(object.tokenCollection))
                {
                   alert('Campaign file contains tokenCollection property that is not an array');
                   return;
                }

                if(typeof object.sceneIDMap != 'object')
                {
                    alert('Campaign file contains sceneIDMap property that is not an object');
                    return;
                }

                if(typeof object.currentCanvasID != 'number')
                {
                    alert('Campaign file contains currentCanvasID property that is not a number');
                    return;
                }


                try {
                    for(let i = 0; i < object.canvasCollection.length; i++)
                    {
                        if(object.canvasCollection[i].length != CANVASCOLLECTIONLENGTH)
                        {
                            throw Error('Campaign file contains canvasCollection property that contains items not of length ' + CANVASCOLLECTIONLENGTH);
                        }
                        if(typeof object.canvasCollection[i][0] != 'string' || !Array.isArray(object.canvasCollection[i][1]) || !Array.isArray(object.canvasCollection[i][2]))
                        {
                            throw Error('Campaign file contains canvasCollection property that has items not in format of [string, Object[], Object[]]');
                        }

                        if(object.canvasCollection[i][1].length != object.canvasCollection[i][2].length)
                        {
                            throw Error('Campaign file contains canvasCollection property that contains items of Scene and Canvas arrays that are not the same length');
                        }

                        for(let j = 0; j < object.canvasCollection[i][1].length; j++)
                        {
                            if(typeof object.canvasCollection[i][1][j] != 'object' || typeof object.canvasCollection[i][2][j] != 'object')
                            {
                                throw Error('Campaign file contains canvasCollection property that contains items of Scene and Canvas arrays that are in in object representation');
                            }

                        }

                    }
                }catch(error)
                {
                    alert(error);
                    return;
                }
                /*
                var newMap = new BattleMap("Test Map", 0);
                setCurrentScene(newMap);
                let newIDMap = sceneIDMap;
                newIDMap.set(0, true);
                setSceneIDMap(newIDMap);
                document.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                });

                //Mouse event that indicates panning should be allowed
                window.addEventListener('mousedown', panCanvas);
                function panCanvas(event: MouseEvent) {
                    //If (for right hand) right mouse button down
                    if (event.button == 2) {
                        isPanning.current = true;
                    }
                }

                //Event for mouse event to stop panning
                window.addEventListener('mouseup', stopPan);
                function stopPan(event: MouseEvent) {
                    //If (for right hand) right mouse button down
                    if (event.button == 2) {
                        isPanning.current = false;
                    }
                }

                let currentCanvas = document.getElementById('scene_0');
                if (currentCanvas) {
                    const initCanvas = new Canvas('scene_0', {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        backgroundColor: 'rgb(0,0,0)',
                        enableRetinaScaling: true
                    });

                    setCanvasCollection([['', [initCanvas], [newMap]]]);
                    //canvasIndex.current = [0,0];

                    var image = document.createElement('img');
                    var source = document.createElement('source');

                    //Set image URL source
                    image.appendChild(source);
                    image.src = defaultMap;
                    //Make sure image's link source works
                    image.onerror = function () {
                        alert('Map Image link is invalid or is not compatible');
                    };

                    //Make sure image loads before adding to Canvas
                    image.onload = function () {
                        const mapEl = new FabricImage(image);

                        //Scale image for battle map to fit in window as large as possible with some padding
                        if (mapEl.height >= mapEl.width && initCanvas.getHeight() < mapEl.height) {
                            mapEl.scaleToHeight(initCanvas.getHeight() - 50);
                        } else if (mapEl.width > mapEl.height && initCanvas.getWidth() < mapEl.width) {
                            mapEl.scaleToWidth(initCanvas.getWidth() - 50);
                        }

                        //Set map to be unable to be changed and have no controls
                        mapEl.set({
                            hoverCursor: 'default',
                            hasBorder: false,
                            hasControls: false,
                            selectable: false
                        });
                        //Add map onto center of canvas and at the very back layer
                        initCanvas.add(mapEl);
                        initCanvas.sendObjectToBack(mapEl);
                        initCanvas.centerObject(mapEl);

                        //Add the FabricImage object to BattleMap instance
                        newMap.addImage(mapEl);
                    };

                    //Rendering
                    initCanvas.renderAll();
                    setCanvas(initCanvas);

                    //Unmounted to free memory
                    return () => {
                        initCanvas.dispose();
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