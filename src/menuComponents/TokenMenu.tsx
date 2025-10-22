import {
    Menu, Button, Portal, Flex,
    Input, Collapsible, Box,
    IconButton, Group as GroupElement,
    Center
} from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';
import { Canvas, Group, Point, Circle, Textbox, LayoutManager, FixedLayout, FabricImage } from 'fabric';
import { Token } from '../tokenComponents/Token';
import '../index.css';
import { TokenCreationEditMenu } from './TokenCreationEditMenu';
import { FaCheck, FaEdit, FaFolderPlus } from 'react-icons/fa';
import { MdOutlineDelete } from "react-icons/md";
import defaultTokenImage from '../DefaultImages/defaultPaladinOrc.png'

export function TokenMenu({ canvas, cmManager, scene, tokenCollection, setTokenCollection, factory, gameLog, canvasCollection, setCanvasCollection }) {
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

    //State that contains index for the collection to be deleted or renamed
    const [collectionIndex, setCollectionIndex] = useState(-1);

    //State that sets the csss 'display' vallue for the token rename bar
    const [renameDisplay, setRenameDisplay] = useState('none');

    //State the stores the string typed into the token rename bar
    const [renameVal, setRenameVal] = useState('');

    //State that stores whether the rename 
    const [renameSubmit, setRenameSubmit] = useState(false);

    //State used to set whether a collection is deleted
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    //State changed when user wants to add a Token to the current Canvas
    const [tryAddToken, setTryAddToken] = useState(false);

    const groupNum = useRef(new Map<number, boolean>());

    //Testing Purposes to Preload Tokens
    useEffect(() => {
        var image = document.createElement('img');
        var source = document.createElement('source');
        image.src = defaultTokenImage;
        image.onload = () => {
            image.appendChild(source);
            var tokenEl = new FabricImage(image);
            var tokenInfo = new Token();
            var sizeCode = 1;
            tokenInfo.setSizeCode(sizeCode);
            tokenInfo.setName("TestName");
            let linkPair = factory.getLinkAndID(defaultTokenImage);
            tokenInfo.addURL(linkPair[0], linkPair[1]);
            var collection = tokenCollection;
            collection[0][1] = [tokenEl];
            collection[0][2] = [tokenInfo];
            setTokenCollection(collection);
            setCollectionChange(true);
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
            console.log('set index')
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
            exitTokenCM();
        }
    }

    //Helper function called by mouseDownFunction to hide the Token Context Menu
    const exitTokenCM = () => {
        //Hide context menu
        var contextMenu = document.querySelector(".BaseTokenContextMenu");
        if (contextMenu && contextMenu instanceof HTMLElement) {
            contextMenu.style.display = 'none';
        }
        //Set related states to inactive states
        setContextMenuActive(false);
        setCurrentIndex([-1, -1]);
        console.log('set index')
    }

    //Called when clicking delete in the Token Context Menu when hovering over a Token in the Token Menu.
    //Does not require useEffect due to context menu triggering a rerender and updating the state being used
    const deleteBaseToken = () => {
        //console.log(currentIndex)

        if (currentIndex != null && currentIndex[0] >= 0 && currentIndex[1] >= 0 &&
            currentIndex[0] < tokenCollection.length && currentIndex[1] < tokenCollection[currentIndex[0]][1].length
        ) {
            let myCollection = tokenCollection;
            //Delete All Instances of the Token in All Collections
            if (currentIndex[0] == 0 && confirm('Deleting this Token Will Remove it From All Collections')) {
                //Parse over all collections except the first
                for (let i = 1; i < tokenCollection.length; i++) {
                    for (let j = 0; j < tokenCollection[i][1].length; j++) {
                        //If same base token found then remove it from the collection
                        if (tokenCollection[i][1][j] == tokenCollection[currentIndex[0]][1][currentIndex[1]]) {
                            myCollection[i][1].splice(j, 1);
                            myCollection[i][2].splice(j, 1);
                            //Exit from current collection's loop and move to next collection
                            //Assumes that there can only be 1 identical base token in a collection
                            break;
                        }
                    }
                }
                //Remove from 1st Base Token Collection
                myCollection[0][1].splice(currentIndex[1], 1);
                myCollection[0][2].splice(currentIndex[1], 1);
            }
            //Remove from a Collection
            else if (confirm('Are you sure you want to remove this Token from the collection?')) {
                //Copy target Collection
                let newRow = myCollection[currentIndex[0]][1];
                //Remove Target Base Token
                newRow.splice(currentIndex[1], 1);
                myCollection[currentIndex[0]][1] = newRow;

                newRow = myCollection[currentIndex[0]][2];
                //Remove Target Base Token
                newRow.splice(currentIndex[1], 1);
                myCollection[currentIndex[0]][2] = newRow;
            }
            //Update States to Reflect Changes
            setTokenCollection(myCollection);
            setCollectionChange(true);
            exitTokenCM();
        }
    }

    //Deletes a collection when a collection's Delete Button is clicked. User is given a confirmation
    //prompt to check if they want to continue deleting the collection
    useEffect(() => {
        if (deleteConfirm && collectionIndex != null && collectionIndex >= 0 && collectionIndex < tokenCollection.length
            && confirm('Are you sure you want to delete this collection?')
        ) {

            if(tokenCollection[collectionIndex][0].includes('New Group'))
            {
                let parts = tokenCollection[collectionIndex][0].split(' ');
                if(parts.length == 2)
                {
                    groupNum.current.set(0, false);
                }
                else if(parts.length == 3)
                {
                    groupNum.current.set(Number(parts[2]), false);
                }
            }

            //Remove the collection from the tokenCollection array
            let myCollection = tokenCollection;
            myCollection.splice(collectionIndex, 1);
            setCollectionChange(true);
            setTokenCollection(myCollection);
            setCollectionIndex(-1);
        }
        setDeleteConfirm(false);
    }, [deleteConfirm]);


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

    //Function called by the event listener for the click event added by the collectio rename button
    const exitRename = (event) => {
        let target;
        if (event && event.target && (target = event.target) instanceof HTMLElement
            && !target.className.includes('RenameButton') && !target.className.includes('RenameEl')
            && !target.className.includes('RenameField') && !target.className.includes('RenameIcon')) {
            hideRenameEl();
            document.removeEventListener('click', exitRename);
        }
    }

    //Triggers on every rerender including when token images load
    useEffect(() => {
        //Check if renaming element is displayed and may need to be repositioned
        if (renameDisplay && renameDisplay == 'flex' && collectionIndex >= 0 && tokenCollection
            && tokenCollection.length > collectionIndex) {
            //Get the position value that include 'left' to position the renaming element
            let rect = document.querySelector('.TokenCollection_' + collectionIndex)?.getBoundingClientRect();
            //Position the renaming element over the target collection to be renamed
            var renameField = document.querySelector(".RenameField");
            if (rect && renameField && renameField instanceof HTMLElement) {
                renameField.style.top = `${rect.top}px`;
            }
        }
    })

    //Triggers rerender of Token Collection Groups whenever a change is detected.
    //Changes may include a new group added, a new token added, group deleted, token deleted,
    //or group order changed
    useEffect(() => {
        //Function for pushing a token into a collection. Must update each time currentIndex is changed so
        // onClick reflects new currentIndex
        const pushTokenToCollection = (event: MouseEvent) => {
            let newCollection = tokenCollection;

            //Get the target collection's index from the className scheme. Scheme should have index at 2
            if (event.target && event.target instanceof HTMLElement) {
                //Index 2 accounts for the className of Button to include the chakra-button className
                let index = Number((event.target.className.split(' '))[2]);

                //Check if index is valid and the Token to push's index is valid
                if (index > 0 && index < tokenCollection.length && currentIndex[0] >= 0 && currentIndex[1] >= 0) {
                    let token = tokenCollection[currentIndex[0]][1][currentIndex[1]];
                    let tokenInfo = tokenCollection[currentIndex[0]][2][currentIndex[1]];

                    //Iterate over the target collection to check if the Token already exists
                    for (let i = 0; i < tokenCollection[index][1].length; i++) {
                        if (token == tokenCollection[index][1][i]) {
                            alert('Token Already Exists in Collection');
                            return;
                        }
                    }
                    newCollection[index][1].push(token);
                    newCollection[index][2].push(tokenInfo);
                    setTokenCollection(newCollection);
                    setCollectionChange(true);
                }
            }
        }
        var newGroups = [];
        var newGroupButtons = [];
        //Iterate over all groups
        for (let i = 0; i < tokenCollection.length; i++) {
            var baseTokens = [];
            //Iterate over tokens in each group
            for (let j = 0; j < tokenCollection[i][1].length; j++) {
                //Get the image URL to use for an img element
                var url = tokenCollection[i][2][j].getCurrentURL();
                //Requires unique keys!
                //Display a base token's image and name in the collection
                baseTokens.push(
                    <div className={'ImageBox'} key={i + '_' + j}>
                        <img draggable={false} className={"BaseTokenImage " + i + '_' + j} src={url}></img>
                    </div>);
            }

            //If the collection is empty, put text
            if (baseTokens.length == 0) {
                baseTokens.push(<p key={i + "_" + -1}>No Tokens in this Collection</p>)
            }

            //Create new buttons for context menu's "Add to a Collection" button. Exclude
            //the 'My Tokens' collection which cannot be deleted and contains all base Tokens 
            if (i > 0) {
                newGroupButtons.push(<Button className={'BaseTokenElement ' + i} key={i} onClick={pushTokenToCollection}>
                    {tokenCollection[i][0]}</Button>);
            }

            //Create the each Token Collection with it's collapsible with the Tokens, Rename Button, and Delete Button
            if (tokenCollection[i][0] != 'My Tokens') {
                newGroups.push(<Collapsible.Root key={i} className={'TokenCollection_' + i}>
                    <Collapsible.Trigger>
                        <h4 className='collapsibleText'>{tokenCollection[i][0]}</h4>
                    </Collapsible.Trigger>
                    <IconButton
                        className='RenameButton'
                        onClick={(event) => {
                            //Display the renaming element
                            setRenameDisplay('flex');
                            //Indicate what collection is being renamed
                            setCollectionIndex(i);
                            let renameButton;
                            //Check if event and target exist
                            if (event && (renameButton = event.target as HTMLElement) != null) {
                                //Get the position value that include 'left' to position the renaming element
                                let rect = document.querySelector('.TokenCollection_' + i)?.getBoundingClientRect();
                                //Position the renaming element over the target collection to be renamed
                                var renameField = document.querySelector(".RenameField");
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
                    <IconButton onClick={() => {
                        setCollectionIndex(i);
                        setDeleteConfirm(true);
                    }}>
                        <Center>
                            <MdOutlineDelete />
                        </Center>
                    </IconButton>
                    <Collapsible.Content
                    >
                        <Box gap={3} display={'flex'} justifyContent={'left'} justifyItems={'left'} marginLeft={1} flexWrap={'wrap'}
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
                            }}>
                            {baseTokens}
                        </Box>
                    </Collapsible.Content>
                </Collapsible.Root>);
            }
            else {
                //push the entire collection into the combined TokenMenu with the baseTokens
                newGroups.push(<Collapsible.Root key={i}>
                    <Collapsible.Trigger>
                        <h4 className='collapsibleText'>{tokenCollection[i][0]}</h4>
                    </Collapsible.Trigger>
                    <Collapsible.Content
                    >
                        <Box gap={3} display={'flex'} justifyContent={'left'} justifyItems={'left'} marginLeft={1} flexWrap={'wrap'}
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
    }, [collectionChange, currentIndex]);


    //Function that adds a new collection for Tokens to be stored in
    const addCollection = () => {
        var allCollections = tokenCollection;
        var num: number = 0;
        var name;
        /*//Iterate over all Collections
        for (let i = 0; i < tokenCollection.length; i++) {
            //Check if collection includes 'New Group'
            if (typeof (name = tokenCollection[i][0]) === 'string' && name.includes('New Group')) {
                //Make sure the not a duplicate number otherwise increase the number
                //Assumes that user cannot rename a collection to include 'New Group'
                let parts = name.split(' ');
                if(parts.length == 2)
                {
                    groupNum.current.set()
                }
                else
                {

                }
            }
        }*/


        while(true)
        {
            if((groupNum.current.get(num) == null || !groupNum.current.get(num)))
            {
                groupNum.current.set(num,true);
                break;
            }
            num++;
        }

        if (num > 0) {
            name = 'New Group ' + num;
            allCollections.push([name, [], []]);
        }
        else if (num == 0) {
            allCollections.push(['New Group', [], []]);
        }
        setTokenCollection(allCollections);
        setCollectionChange(true);
    }

    //Effect called when tryAddToken is changed by the 'Add to Scene' button in the TokenMenu's Context Menu
    useEffect(() => {
        if (tryAddToken) {
            //Function for adding a base Token in the token collection onto the current Canvas
            const addToken = async () => {
                if (canvas && canvas instanceof Canvas) {
                    let selectToken = tokenCollection[currentIndex[0]][1][currentIndex[1]];
                    let selectTokenInfo = tokenCollection[currentIndex[0]][2][currentIndex[1]];
                    //clone() only copies attributes of FabricImage. Must manually set Token attributes
                    let tokenEl: FabricImage = await selectToken.clone();
                    let tokenInfo = new Token();
                    tokenInfo.cloneTokenMembers(selectTokenInfo);
                    //tokenEl.setSizeCode(selectToken.getSizeCode());
                    //tokenEl.setName(selectToken.getName());
                    //tokenEl.copyURLArray(selectToken);
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
                            radius: newRadius, strokeWidth: 1, lockScalingX: false, lockScalingY: false, originX: 'center', originY: 'center',
                            fill: 'transparent', stroke: 'green', strokeUniform:true
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

                        //Inefficient memory. Change on later implementation
                        canvas.on('object:removed', (event) => {
                            console.log('remove')
                            if (event.target == group) {
                                scene.removeToken(group);
                            }
                        });

                        //Textbox element to show Token's name. Must be added after Token added to canvas because
                        //textbox must not be in same group.
                        var nameBox = new Textbox(tokenInfo.getName(), {
                            selectable: false, lockRotation: true, lockScalingFlip: true,
                            lockSkewingX: true, lockSkewingY: true, fill: 'rgba(227, 207, 207, 1)', //fontSize: newRadius * 2 / 20,
                            textAlign: 'center'
                        });

                        //When adding Tokens check whether a grid has been added and resize accordingly
                        if (scene.getSmallestGridUnit() > 0) {
                            group.scaleToHeight(scene.getSmallestGridUnit() * tokenInfo.getSizeCode());
                            nameBox.scaleToHeight(scene.getGridUnitHeight() / 5);
                        }
                        //Otherwise scale height to the Token's image
                        else if (canvas.getObjects()[0] instanceof FabricImage) {
                            group.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 15 * tokenInfo.getSizeCode());
                            nameBox.scaleToHeight(canvas.getObjects()[0].getScaledHeight() / 100)
                        }

                        //Add Token group to the canvas
                        canvas.add(group);
                        canvas.centerObject(group);
                        let newCollection = canvasCollection;
                        setCanvasCollection(newCollection);

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
                        if (!scene.addToken(group, [nameBox], tokenInfo)) {
                            alert("Error: Token not added correctly");
                            return;
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
            addToken();
            setTryAddToken(false);
        }
    }, [tryAddToken]);




    //Function called when text field changes to store the value
    const updateRename = (event) => {
        setRenameVal(event.target.value);
    }

    //Called when the rename field submit button is pressed which changes the state to trigger this
    //useEffect. Changes the name of the target selection.
    useEffect(() => {
        //Check if all states are valid
        if (renameSubmit && collectionIndex && collectionIndex >= 0 && tokenCollection &&
            collectionIndex < tokenCollection.length &&
            typeof renameVal === 'string') {
            //Check if rename string is not empty or only spaces
            if (renameVal.trim() == '') {
                alert('Collection name cannot be empty or only contain spaces')
            }
            //Check if rename string includes 'New Group' which will cause errors in the default collection naming scheme
            else if (renameVal.includes('New Group')) {
                alert("Collection cannot be renamed to include \"New Group\"");
            }
            //Check if rename string is greater than than 64 characters
            else if (renameVal.length > 64) {
                alert('Collection name cannot exceed 64 characters');
            }
            else {
                let myCollection = tokenCollection;
                //Iterate over all collections and make sure the no collections have the same value 
                for (let i = 0; i < myCollection.length; i++) {
                    //Considers spaces or tabs added before and after the rename value
                    if (myCollection[i][0] == renameVal.trim()) {
                        alert('Another collection already has this name');
                        setRenameSubmit(false);
                        return;
                    }
                }
                if(myCollection[collectionIndex][0].includes('New Group'))
                {
                    let parts = myCollection[collectionIndex][0].split(' ');
                    if(parts.length == 2)
                    {
                        groupNum.current.set(0, false);
                    }
                    else if(parts.length == 3)
                    {
                        groupNum.current.set(Number(parts[2]), false);
                    }
                }
                //Rename the collection
                myCollection[collectionIndex][0] = renameVal.trim();

                //Update the tokenCollection
                setTokenCollection(myCollection);
                //Indicate change so Token Menu rerenders
                setCollectionChange(true);
                //Update index to no longer pair to the target collection
                setCollectionIndex(-1);
                //Hide the renaming element
                hideRenameEl();
            }

        }
        //Reset confirm so useEffect can trigger on later submits
        setRenameSubmit(false);
    }, [renameSubmit]);

    //Called to hide the renaming element either when done submitting or user exits
    const hideRenameEl = () => {
        setRenameDisplay('none');
        setRenameVal('');
    };

    return (
        <div className='TokenMenu'>
            <div className='ButtonRow'>
                <IconButton onClick={addCollection}><FaFolderPlus /></IconButton>
                <TokenCreationEditMenu setCollectionChange={setCollectionChange} factory={factory} tokenCollection={tokenCollection} setTokenCollection={setTokenCollection} gameLog={gameLog} canvasCollection={canvasCollection}/>
            </div>
            <div className='TokenCollections'>
                <Box scrollbar='visible' overflowY='scroll' maxHeight={innerHeight - 140} display={'flex'} flexDir={'column'} gap={'10px'}
                >
                    {collectionJSX}
                </Box>
            </div>
            <div className='BaseTokenContextMenu' >
                <Flex className='BaseTokenElement' gap="0" direction="column"
                    backgroundColor={'rgba(240, 240, 240, 1)'} alignContent='center' width={200}>
                    <Button className='BaseTokenElement' onClick={() => { setTryAddToken(true) }}>Add to Scene</Button>
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
                    <Button className='BaseTokenElement' onClick={deleteBaseToken}>Delete</Button>
                </Flex>
            </div>
            <GroupElement className='RenameField' attached w={'full'} position='absolute'
                maxW='md' display={renameDisplay} backgroundColor={'white'}>
                <Input flex='1' data-testid="RenameField" placeholder="Enter the collection's name" value={renameVal}
                    onChange={updateRename} className='RenameEl' height={50 + 'px'} />
                <IconButton height={50 + 'px'} left={-3} width={50+'px'} className='RenameEl' data-testid="RenameSubmit" onClick={() => { setRenameSubmit(true); }}>
                    <Center><FaCheck /></Center>
                </IconButton>
            </GroupElement>
        </div>
    );
}

function updateBaseTokenContextMenuPosition(event: MouseEvent): boolean {
    var contextMenu = document.querySelector(".BaseTokenContextMenu");

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