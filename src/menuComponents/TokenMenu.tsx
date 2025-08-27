import {
    Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
    , Input, Field, Select, Collapsible, Drawer, ActionBar, Box, Tabs, CloseButton, defineRecipe
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import { Canvas, Group, Point, Circle, Textbox, LayoutManager, FixedLayout, FabricImage } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import { TbBoxMargin } from 'react-icons/tb';
import { TokenCreationEditMenu } from './TokenCreationEditMenu';
import { displayTokenCreationEditMenu } from './TokenCreationEditMenu';


export function TokenMenu({ canvas, cmManager, scene, tokenCollection, setTokenCollection }) {
    //State that contains JSX for showing all collections and their base tokens
    const [collectionJSX, setCollectionJSX] = useState([]);

    //State used to detect changes to the tokenCollection
    const [collectionChange, setCollectionChange] = useState(false);

    //State used to determine whether TokenMenu context menu is active
    const [cmActive, setContextMenuActive] = useState(false);

    //State used to store index pair to access a specfic Token and add it to the Canvas
    const [currentIndex, setCurrentIndex] = useState([-1, -1]);

    //State that contains JSX for showing collection's names in the TokenMenu context menu for the
    //'Add to a Collection' button
    const [collectionNamesJSX, setCollectionNames] = useState([]);

    var image = document.createElement('img');
    useEffect(() => {
        var source = document.createElement('source');
        image.src = 'https://www.dndbeyond.com/avatars/thumbnails/6/365/420/618/636272701937419552.png';
        image.onload = () => {
            image.appendChild(source);
            var tokenEl = new Token(image);
            var sizeCode = 1;
            tokenEl.setSizeCode(sizeCode);
            tokenEl.setName("TestName");
            var collection = tokenCollection;
            collection[0][1].push(tokenEl);
            setTokenCollection(collection);
            setCollectionChange(true);
            for (let i = 0; i < 7; i++) {
                collection[0][1].push(tokenEl);
            }
        }
        //Make sure image's link source works
        image.onerror = function () {
            alert('Token link is invalid or is not compatible');
        };
    }, []);

    //Function to display the Token Menu's Context Menu
    const cmFunction = (event) => {
        let target;
        //Check whether context menu triggered on a BaseTokenImage
        if ((target = event.target) instanceof HTMLElement
            && target.className.includes('BaseTokenImage')) {
            updateBaseTokenContextMenuPosition(event);
            setContextMenuActive(true);
            let classes = target.className.split(' ');
            let indexes = classes[1].split('_');
            let numIndexes = [Number(indexes[0]), Number(indexes[1])];
            setCurrentIndex(numIndexes);
        }
    };

    //Function to check whether to hide Token Menu's Context Menu
    const mouseDownFunction = (event) => {
        let target;
        //Check if clicking inside the BaseTokenContextMenu based on className.
        //target.className must use includes() because ChakraUI elements add to the className string.
        if (cmActive && (target = event.target) instanceof HTMLElement &&
            !(target.className.includes('BaseTokenContextMenu')
                || target.className.includes('BaseTokenElement'))
        ) {
            //If not clicking inside, hide BaseTokenContextMenu
            var contextMenu = document.querySelector(".BaseTokenContextMenu");
            if (contextMenu && !target.className.includes('BaseTokenElement')) {
                contextMenu.style.display = 'none';
            }
            setContextMenuActive(false);
            setCurrentIndex([-1, -1]);
        }
    }

    //Update event listeners to display and hide context menu using the latest context 
    // menu boolean's state
    useEffect(() => {
        document.removeEventListener('contextmenu', cmFunction);
        document.removeEventListener('mousedown', mouseDownFunction);
        document.addEventListener('contextmenu', cmFunction);
        document.addEventListener('mousedown', mouseDownFunction);
    }, [cmActive]);

    //Triggers rerender of Token Collection Groups whenever a change is detected.
    //Changes may include a new group added, a new token added, group deleted, token deleted,
    //or group order changed
    useEffect(() => {
        var newGroups = [];
        var newGroupButtons = [];
        //Iterate over all groups
        for (let i = 0; i < tokenCollection.length; i++) {
            var baseTokens = [];
            //Iterate over tokens in each group
            for (let j = 0; j < tokenCollection[i][1].length; j++) {
                //Get the image URL to use for an img element
                var url = tokenCollection[i][1][j].getCurrentURL();
                //Requires unique keys!
                //Display a base token's image and name in the collection
                baseTokens.push(<div className='BaseToken' key={i + '_' + j}>
                    <img draggable={false} className={"BaseTokenImage " + i + '_' + j} src={url} width={100} height={100}></img>
                    <p>{tokenCollection[i][1][j].getName()}</p>
                </div>);
            }

            //If the collection is empty, put text
            if (baseTokens.length == 0) {
                baseTokens.push(<p key={i + "_" + -1}>No Tokens in this Collection</p>)
            }

            newGroupButtons.push(<Button className='BaseTokenElement' key={i}>{tokenCollection[i][0]}</Button>);

            if (tokenCollection[i][0] != 'My Tokens') {
                newGroups.push(<Collapsible.Root key={i}>
                    <Collapsible.Trigger>
                        {tokenCollection[i][0]}
                    </Collapsible.Trigger>
                    <button>Edit</button>
                    <Collapsible.Content
                    >
                        <Box gap={3} display={'flex'} justifyContent={'left'} justifyItems={'left'} marginLeft={2}
                            scrollbar='visible' overflowX='scroll' css={{
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
                            }}>
                            {baseTokens}
                        </Box>
                    </Collapsible.Content>
                </Collapsible.Root>);
            }
            else
            {
                //push the entire collection into the combined TokenMenu with the baseTokens
                newGroups.push(<Collapsible.Root key={i}>
                    <Collapsible.Trigger>
                        {tokenCollection[i][0]}
                    </Collapsible.Trigger>
                    <Collapsible.Content
                    >
                        <Box gap={3} display={'flex'} justifyContent={'left'} justifyItems={'left'} marginLeft={2}
                            scrollbar='visible' overflowX='scroll' css={{
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
                            }}>
                            {baseTokens}
                        </Box>
                    </Collapsible.Content>
                </Collapsible.Root>);
            }
            
        }
        setCollectionJSX(newGroups);
        setCollectionChange(false);
        setCollectionNames(newGroupButtons);
    }, [collectionChange]);

    //Function that adds a new collection for Tokens to be stored in
    const newCollection = () => {
        var allCollections = tokenCollection;
        var num: number = 0;
        var name;
        for (let i = 0; i < tokenCollection.length; i++) {
            if (typeof (name = tokenCollection[i][0]) === 'string' && name.includes('New Group')) {
                num++;
            }
        }

        if (num > 0) {
            name = 'New Group ' + num;
            allCollections.push([name, []]);
        }
        else if (num == 0) {
            allCollections.push(['New Group', []]);
        }
        setTokenCollection(allCollections);
        setCollectionChange(true);
    }

    async function addToken() {
        if (canvas) {
            let selectToken = tokenCollection[currentIndex[0]][1][currentIndex[1]];
            //clone() only copies attributes of FabricImage. Must manually set Token attributes
            let tokenEl = await selectToken.clone();
            tokenEl.setSizeCode(selectToken.getSizeCode());
            tokenEl.setName(selectToken.getName());
            if (tokenEl) {
                //Calculate Largest Radius Fitting in Image with Padding
                let newRadius: number;
                if (tokenEl.width >= tokenEl.height) {
                    newRadius = tokenEl.height / 4;
                }
                else {
                    newRadius = tokenEl.width / 4;
                }

                //Clipping Token Image into a circle
                tokenEl.set({
                    dirty: true, selection: true,
                    clipPath: new Circle({ objectCaching: true, radius: newRadius, originX: 'center', originY: 'center' })
                });

                //Circle with border that will change color
                var circleBorder = new Circle({
                    radius: newRadius, strokeWidth: 5, lockScalingX: false, lockScalingY: false, originX: 'center', originY: 'center',
                    fill: 'transparent', stroke: 'green'
                });

                //Create group of Token and Border set as Group. FixedLayout used to change bounding box to fit circle.
                var group = new Group([tokenEl, circleBorder], {
                    width: newRadius * 2 * 1.1, height: newRadius * 2 * 1.1, originX: 'center', originY: 'center',
                    lockRotation: true, lockSkewingX: true, lockSkewingY: true, lockScalingFlip: true, lockScalingY: true, lockScalingX: true,
                    layoutManager: new LayoutManager(new FixedLayout())
                });

                //Get center point of Token Image to set circleBorder onto
                let center = group.getCenterPoint();
                circleBorder.setXY(center, 'center', 'center');
                tokenEl.setXY(center, 'center', 'center');

                canvas.on('object:removed', (event) => {
                    if (event.target == group) {
                        scene.removeToken(group);
                    }
                });

                //Textbox element to show Token's name. Must be added after Token added to canvas because
                //textbox must not be in same group.
                var nameBox = new Textbox(tokenEl.getName(), {
                    selectable: false, lockRotation: true, lockScalingFlip: true,
                    lockSkewingX: true, lockSkewingY: true, fill: 'rgba(227, 207, 207, 1)', fontSize: newRadius * 2 / 20,
                    textAlign: 'center'
                });

                //When adding Tokens check whether a grid has been added and resize accordingly
                if (scene.getSmallestGridUnit() > 0) {
                    group.scaleToHeight(scene.getSmallestGridUnit() * tokenEl.getSizeCode());
                    nameBox.scaleToHeight(scene.getGridUnitHeight() / 5);
                }
                //Otherwise scale height to the Token's image
                else if (canvas.getObjects()[0] instanceof FabricImage) {
                    group.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 15 * tokenEl.getSizeCode());
                }

                //Add Token group to the canvas
                canvas.add(group);
                canvas.centerObject(group);

                //Add textbox to canvas
                //Align textbox to bottom center of the Token
                let bottomLeft = circleBorder.getCoords()[3];
                let newPoint = new Point();
                newPoint.x = group.getCenterPoint().x;
                newPoint.y = bottomLeft.y;
                nameBox.setXY(newPoint, 'center', 'top');
                nameBox.setCoords();
                canvas.add(nameBox);

                //Alert if Token was not added to Battle Map correctly
                if (!scene.addToken(group, [nameBox])) {
                    alert("Token not added correctly");
                }

                //When Token is selected, add a listener for the context menu
                //and prevent context menu from being exited
                group.on('selected', () => {
                    let selectedObjects = canvas.getActiveObjects();
                    let allTokens: boolean = true;
                    let tokenNumber: number = 0;
                    //Iterate over selected objects and determine if all are Token groups
                    for (let i = 0; i < selectedObjects.length; i++) {
                        if ((selectedObjects[i] instanceof Group) && (selectedObjects[i].getObjects().length > 1)
                            && (selectedObjects[i].getObjects()[0] instanceof Token)) {
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
                            groupBox.on('mouseover', () => {
                                document.addEventListener('contextmenu', cmManager.updateContextMenuPosition)
                            });
                            groupBox.on('mouseout', () => {
                                document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
                            })
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

    return (
        <div className='TokenMenu'>
            <div className='ButtonRow'>
                <Button onClick={newCollection}>New Group</Button>
                <Button onClick={displayTokenCreationEditMenu}>New Token</Button>
            </div>
            <div className='TokenCollections'>
                <Box scrollbar='visible' overflowY='scroll' maxHeight={innerHeight - 140}
                >
                    {collectionJSX}
                </Box>
            </div>
            <div className='BaseTokenContextMenu'>
                <Flex className='BaseTokenElement' gap="0" direction="column"
                    backgroundColor={'rgba(240, 240, 240, 1)'} alignContent='center' width={200}>
                    <Button className='BaseTokenElement' onClick={addToken}>Add to Scene</Button>
                    <Menu.Root positioning={{ placement: "right-start" }}>
                        <Menu.Trigger asChild>
                            <Button variant="outline" size="sm">Add to a Collection</Button>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner zIndex={'sticky'}>
                                <Menu.Content position="relative" zIndex={'modal'}>
                                    <Flex className='BaseTokenElement' direction={'column'} 
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
                    <Button className='BaseTokenElement'>Edit</Button>
                    <Button className='BaseTokenElement'>Delete</Button>
                </Flex>
            </div>
        </div>
    );
}

function updateBaseTokenContextMenuPosition(event: Event): boolean {
    var contextMenu = document.querySelector(".BaseTokenContextMenu");

    if (contextMenu && event.type == 'contextmenu') {
        contextMenu.style.display = "flex";
        const maxTopValue = window.innerHeight - contextMenu.offsetHeight;
        const maxLeftValue = window.innerWidth - contextMenu.offsetWidth;
        contextMenu.style.left = `${Math.min(event.x, maxLeftValue)}px`;
        contextMenu.style.top = `${Math.min(event.y, maxTopValue)}px`;
        return true;
    }
    return false;
}