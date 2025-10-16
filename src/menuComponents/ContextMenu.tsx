import {
  Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
  , Input, Field, Select,
  createListCollection
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox, FabricImage } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../SceneComponents/BattleMap';
import '../index.css';

/*
Function component ContextMenu is used for whenever a context menu is called when Tokens are selected
on the Canvas. The ContextMenu contains buttons and sub-menus to manipulate and interact with Tokens.
The ContextMenu is not interactable if non-Token groups are selected. 
*/
export function ContextMenu({ canvas, cmManager, scene }) {

  //Reference to the token name input box in ContextMenu
  const displayNameInput = useRef(null);

  //The value displayed by the token name input box
  const [displayNameVal, setNameVal] = useState("");

  //Reference to size Select component
  const sizeReference = useRef(null);

  //Hook for setting size value of size Select component. Must use string[] value due
  //same as Select's value parameter.
  const [sizeVal, setSizeVal] = useState(['1']);

  //Reference to the text input for pasting image links
  const imageLinkRef = useRef(null);

  //Value displayed by image link input box
  const [imageLinkVal, setImageLinkVal] = useState("");

  useEffect(() => {
    const exitFunction = (event) => {
      if (event.button == 0 && cmManager && cmManager.getContextMenuExit()) {
        let contextMenu = document.querySelector(".ContextMenu");
        if (contextMenu && contextMenu instanceof HTMLElement) {
          contextMenu.style.display = "none";
        }
        cmManager.setContextMenuExit(false);
      }
    }
    //Event listener to hide context menu if token(s) are no longer selected
    document.addEventListener('mousedown', exitFunction);

    return () => {
      document.removeEventListener('mousedown', exitFunction);
    }
  })


  //Create slider to change Token image offset in percentage according from center to either side
  var xSlider = useSlider({
    max: 100,
    min: -100,
    defaultValue: [0],
    thumbAlignment: "center",
    onValueChangeEnd: (event) => {
      if (canvas) {
        //If selecting multiple Tokens, change all of them with same percentage
        if (cmManager && cmManager.getMultiSelectionBool()) {
          let groups = canvas.getActiveObjects();
          //Iterate over all active objects
          for (let i = 0; i < groups.length; i++) {
            let currentGroup;

            //Check again whether all active objects are Token groups. Should be passed since this is checked
            //in Toolbar as well.
            if (groups[i] instanceof Group && (currentGroup = groups[i].getObjects()).length > 1 &&
              currentGroup[0] instanceof FabricImage) {
              //Max value that clipPath circle can move in one direction while fitting in image
              let xLimit = currentGroup[0].width / 2;
              //Radius token to subtract from offset max to fit in image
              let radius;
              //Radius determined by smallest size of width or height
              if (currentGroup[0].width > currentGroup[0].height) {
                radius = currentGroup[0].height / 4;
              }
              else {
                radius = currentGroup[0].width / 4;
              }

              //left property is x coordinate side of image so subtract by 1/2 of the image width to the left.
              //xSlider changes percentage change of how far offset will be of image
              currentGroup[0].left = (xSlider.value[0] / 100) * (xLimit - radius) - xLimit;

              //Offset clipPath of image so circle does not move away from circle border
              if (currentGroup[0].clipPath) {
                currentGroup[0].clipPath.left = -(xSlider.value[0] / 100) * (xLimit - radius);
                //Must set Token group as dirty so cache detects change on next render
                currentGroup[0].clipPath.dirty = true;
              }

              //Must set all dirty so changes are reflected on canvas with cache
              groups[i].dirty = true;
              currentGroup[0].dirty = true;
            }
          }
          canvas.renderAll();
        }
        else if (!cmManager.getMultiSelectionBool()) {
          let tokenGroup = canvas.getActiveObject();
          let tokenEl = tokenGroup.getObjects()[0];

          if (tokenGroup && tokenEl && tokenEl instanceof FabricImage) {
            //Max value that clipPath circle can move in one direction while fitting in image
            let xLimit = tokenEl.width / 2;

            //Radius token to subtract from offset max to fit in image
            let radius;

            //Radius determined by smallest size of width or height
            if (tokenEl.width > tokenEl.height) {
              radius = tokenEl.height / 4;
            }
            else {
              radius = tokenEl.width / 4;
            }

            //left property is x coordinate side of image so subtract by 1/2 of the image width to the left.
            //xSlider changes percentage change of how far offset will be of image
            tokenEl.left = (xSlider.value[0] / 100) * (xLimit - radius) - xLimit;

            //Offset clipPath of image so circle does not move away from circle border
            if (tokenEl.clipPath) {
              tokenEl.clipPath.left = -(xSlider.value[0] / 100) * (xLimit - radius);
              //Must set Token group as dirty so cache detects change on next render
              tokenEl.clipPath.dirty = true;
            }

            //Must set all dirty so changes are reflected on canvas with cache
            tokenGroup.dirty = true;
            tokenEl.dirty = true;

            //Have changes reflected on Canvas
            canvas.renderAll();
          }
        }
      }
    }
  });
  //Create slider to change Token image offset in percentage according from center to either top or bottom
  var ySlider = useSlider({
    max: 100,
    min: -100,
    defaultValue: [0],
    thumbAlignment: "center",
    onValueChangeEnd: (event) => {
      if (canvas) {
        //If selecting multiple Tokens, change all of them with same percentage
        if (cmManager && cmManager.getMultiSelectionBool()) {
          //Iterate over all active objects
          let groups = canvas.getActiveObjects();
          for (let i = 0; i < groups.length; i++) {
            let currentGroup;

            //Check again whether all active objects are Token groups. Should be passed since this is checked
            //in Toolbar as well.
            if (groups[i] instanceof Group && (currentGroup = groups[i].getObjects()).length > 1 &&
              currentGroup[0] instanceof FabricImage) {
              //Max value that clipPath circle can move in one direction while fitting in image
              let yLimit = currentGroup[0].height / 2;

              //Radius token to subtract from offset max to fit in image
              let radius;

              //Radius determined by smallest size of width or height
              if (currentGroup[0].width > currentGroup[0].height) {
                radius = currentGroup[0].height / 4;
              }
              else {
                radius = currentGroup[0].width / 4;
              }

              //left property is x coordinate side of image so subtract by 1/2 of the image width to the left.
              //xSlider changes percentage change of how far offset will be of image
              currentGroup[0].top = (ySlider.value[0] / 100) * (yLimit - radius) - yLimit;

              //Offset clipPath of image so circle does not move away from circle border
              if (currentGroup[0].clipPath) {
                currentGroup[0].clipPath.top = -(ySlider.value[0] / 100) * (yLimit - radius);
                //Must set Token group as dirty so cache detects change on next render
                currentGroup[0].clipPath.dirty = true;
              }

              //Must set all dirty so changes are reflected on canvas with cache
              groups[i].dirty = true;
              currentGroup[0].dirty = true;
            }
          }
          canvas.renderAll();
        }
        else if (!cmManager.getMultiSelectionBool()) {
          let tokenGroup = canvas.getActiveObject();
          let tokenEl = tokenGroup.getObjects()[0];

          if (tokenGroup && tokenEl && tokenEl instanceof FabricImage) {
            //Max value that clipPath circle can move in one direction while fitting in image
            let yLimit = tokenEl.height / 2;
            //Radius token to subtract from offset max to fit in image
            let radius;
            //Radius determined by smallest size of width or height
            if (tokenEl.width > tokenEl.height) {
              radius = tokenEl.height / 4;
            }
            else {
              radius = tokenEl.width / 4;
            }
            //left property is x coordinate side of image so subtract by 1/2 of the image width to the left.
            //xSlider changes percentage change of how far offset will be of image
            tokenEl.top = (ySlider.value[0] / 100) * (yLimit - radius) - yLimit;

            //Offset clipPath of image so circle does not move away from circle border
            if (tokenEl.clipPath) {
              tokenEl.clipPath.top = -(ySlider.value[0] / 100) * (yLimit - radius);
              //Must set Token group as dirty so cache detects change on next render
              tokenEl.clipPath.dirty = true;
            }

            //Must set all dirty so changes are reflected on canvas with cache
            tokenGroup.dirty = true;
            tokenEl.dirty = true;

            //Have changes reflected on Canvas
            canvas.renderAll();
          }
        }
      }
    }
  });

  //Create checkbox to set whether a Token's display name is shown
  var showName = useCheckbox({
    onCheckedChange: (event) => {
      if (canvas && cmManager) {
        let token;
        let tokenGroup;
        //Multi-Token selection
        if (cmManager.getMultiSelectionBool()) {
          let activeObjects = canvas.getActiveObjects();
          //Iterate over selected objects
          for (let i = 0; i < activeObjects.length; i++) {
            //Check if selected objects are Token Groups
            if ((tokenGroup = activeObjects[i]) instanceof Group
              && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
              let index = canvas.getObjects().indexOf(tokenGroup) + 1;
              let tokenName;
              let infoIndex = -1;
              let tokenInfo;
              //May need to make more efficient with refactoring
              for(let j = 0; j < canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]].length; j++)
              {
                if(canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]][j] == token)
                {
                  tokenInfo = canvasCollection[canvasIndex.current[0]][3][canvasIndex.current[1]][j];
                  infoIndex = j;
                  break;
                }
              }
              
              //Get the index of the name textbox and set visibility to reflect the checkbox
              if (infoIndex >= 0 && index > 0 && index < canvas.getObjects().length &&
                (tokenName = canvas.getObjects()[index]) instanceof Textbox) {
                //Set associated bool in Token to reflect change
                tokenInfo.setShowName(event.checked as boolean);
                //Show name of the Token
                tokenName.visible = event.checked as boolean;
                //Set dirty so changes are reflected with cache
                tokenGroup.dirty = true;
                tokenName.dirty = true;
                canvas.renderAll();
              }
            }
          }
        }
        //Single Token selection
        else if (!cmManager.getMultiSelectionBool() && (tokenGroup = canvas.getActiveObject()) instanceof Group
          && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
          let tokenName;
          let index = canvas.getObjects().indexOf(tokenGroup) + 1;
          let tokenInfo;
          let infoIndex = -1;
          for(let j = 0; j < canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]].length; j++)
              {
                if(canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]][j] == token)
                {
                  tokenInfo = canvasCollection[canvasIndex.current[0]][3][canvasIndex.current[1]][j];
                  infoIndex = j;
                  break;
                }
              }
          //Get the index of the name textbox and set visibility to reflect the checkbox
          if (infoIndex >= 0 && index > 0 && index < canvas.getObjects().length &&
            (tokenName = canvas.getObjects()[index]) instanceof Textbox) {
            tokenName = canvas.getObjects()[index];
            //Set associated bool in Token to reflect change
            tokenInfo.setShowName(event.checked as boolean);
            //Show name of the Token
            tokenName.visible = event.checked as boolean;
            //Set dirty so changes are reflected with cache
            tokenGroup.dirty = true;
            tokenName.dirty = true;
            canvas.renderAll();
          }
        }
      }
    }
  });


  useEffect(() => {
    if (displayNameVal.trim() != '') {
      //Check if all required references are available
      if (cmManager && canvas) {
        let tokenGroup;
        let token;
        let nameBox;
        //Multi-Token selection
        if (cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1) {
          let activeObjects = canvas.getActiveObjects();

          //Iterate over selected objects
          for (let i = 0; i < activeObjects.length; i++) {
            //Check if object is a Token group
            if ((tokenGroup = activeObjects[i]) instanceof Group && tokenGroup.getObjects().length > 1 &&
              (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
              //Calculate index of Token's name textbox 
              let index = canvas.getObjects().indexOf(tokenGroup) + 1;
              let tokenInfo;
              let infoIndex = -1;
              for(let j = 0; j < canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]].length; j++)
              {
                if(canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]][j] == token)
                {
                  tokenInfo = canvasCollection[canvasIndex.current[0]][3][canvasIndex.current[1]][j];
                  infoIndex = j;
                  break;
                }
              }

              //Update the Token's name
              tokenInfo.setName(displayNameVal);

              //Check if Textbox index is valid and is a Textbox
              if (infoIndex >= 0 && index > 0 && index < canvas.getObjects().length &&
                (nameBox = canvas.getObjects()[index]) instanceof Textbox) {
                //Update the Textbox with new name and update position to be
                //recentered
                nameBox.set('text', displayNameVal);
                let newX = tokenGroup.getObjects()[1].getCenterPoint().x;
                let newY = tokenGroup.getObjects()[1].getCoords()[3].y;
                let newPoint = new Point({ x: newX, y: newY });
                nameBox.setXY(newPoint, 'center', 'top');
                nameBox.setCoords();
              }
            }
          }

          canvas.renderAll();
        }
        //Single Token selection
        else if ((tokenGroup = canvas.getActiveObject()) instanceof Group && tokenGroup.getObjects().length > 1
          && (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
          //Calculate index of Token's name textbox
          let index = canvas.getObjects().indexOf(tokenGroup) + 1;
            let tokenInfo;
              let infoIndex = -1;
              for(let j = 0; j < canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]].length; j++)
              {
                if(canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]][j] == token)
                {
                  tokenInfo = canvasCollection[canvasIndex.current[0]][3][canvasIndex.current[1]][j];
                  infoIndex = j;
                  break;
                }
              }
          //Update Token's name
          tokenInfo.setName(displayNameVal);

          //Check if Textbox index is valid
          if (index > 0 && index < canvas.getObjects().length &&
            (nameBox = canvas.getObjects()[index]) instanceof Textbox) {
            //Update Textbox with new name and update position to be recentered
            nameBox.set('text', displayNameVal);
            let newX = tokenGroup.getObjects()[1].getCenterPoint().x;
            let newY = tokenGroup.getObjects()[1].getCoords()[3].y;
            let newPoint = new Point({ x: newX, y: newY });
            nameBox.setXY(newPoint, 'center', 'top');
            nameBox.setCoords();
            canvas.renderAll();
          }
        }
      }
    }
  }, [displayNameVal]);

  //Function that is called whenever the token name input box's value is changed
  var changeName = (event) => {
    setNameVal(event.target.value);
  };

  //Function prevents backspace key pressed from deleting Token while typing in input field
  var preventDelete = (event) => {
    cmManager.setDeleteValid(false);
  };

  //Function that allows for spaces to be typed into input elements
  var allowSpace = (event) => {
    if(event.key === " ")
    {
      //Stops spacebar from propogating to menu and stay in input element
      event.stopPropagation();
    }
  }

  //Function that allows backspace key to delete Token after exiting input field
  var allowDelete = (event) => {
    cmManager.setDeleteValid(true);
  }

  //Function that changes size of a single or multiple selected Tokens
  var changeSize = (event) => {
    let tokenGroup;
    let token;
    if (cmManager && canvas && scene) {
      //Multiple Selection
      if (cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1) {
        let activeObjects = canvas.getActiveObjects();
        for (let i = 0; i < activeObjects.length; i++) {
          if ((tokenGroup = activeObjects[i]) instanceof Group && (tokenGroup.getObjects().length > 1) &&
            (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
            //Call BattleMap to resize the Tokens
            scene.resizeToken(tokenGroup, (event.value)[0] as number, canvas, canvasCollection, canvasIndex);

            //Update size Select component's display value
            setSizeVal(event.value);
          }
        }
      }
      //Single Selection
      else if ((tokenGroup = canvas.getActiveObject()) instanceof Group &&
        (tokenGroup.getObjects().length > 1) && (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
        //Call BattleMap to resize the Tokens
        scene.resizeToken(tokenGroup, (event.value)[0] as number, canvas, canvasCollection, canvasIndex);

        //Update size Select component's display value
        setSizeVal(event.value);
      }
    }
  };

  //Runs on each render whenever Context Menu is opened or changed
  useEffect(() => {

    //When new Context Menu is opened, reflect values of the selected Token(s)
    const listeningFunc = () => {
      //Check if valid and ContextMenu can is being displayed
      if (canvas && cmManager && !cmManager.getContextMenuExit()) {
        let tokenGroup;
        let token;
        //Values for a single Token selection
        if (!cmManager.getMultiSelectionBool() && (tokenGroup = canvas.getActiveObject()) instanceof Group
          && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof FabricImage) {
          //Calculate x and y slider values from the selected Token
          let xLimit = token.width / 2;
          let yLimit = token.height / 2;
          let radius;
          if (token.width > token.height) {
            radius = token.height / 4;
          }
          else {
            radius = token.width / 4;
          }
          xSlider.value[0] = Math.round((token.left + xLimit) / (xLimit - radius) * 100);
          ySlider.value[0] = Math.round((token.top + yLimit) / (yLimit - radius) * 100);

          let tokenInfo;
              let infoIndex = -1;
              for(let j = 0; j < canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]].length; j++)
              {
                if(canvasCollection[canvasIndex.current[0]][4][canvasIndex.current[1]][j] == token)
                {
                  tokenInfo = canvasCollection[canvasIndex.current[0]][3][canvasIndex.current[1]][j];
                  infoIndex = j;
                  break;
                }
              }
          if(tokenInfo == null)
          {
            throw Error('Token Info not found');
          }

          //Set the checked box to Token's show name bool
          showName.setChecked(tokenInfo.getShowName());

          //Set the name input component to Token's name
          setNameVal(tokenInfo.getName());

          //Set the Select component display value to Token's size
          if (sizeReference) {
            setSizeVal([tokenInfo.getSizeCode().toString()]);
          }

          if (imageLinkRef) {
            setImageLinkVal(tokenInfo.getCurrentURL());
          }
        }
        //Values for a multi-Token selection are at default
        //Currently only has default values but later implementations should iterate over all Tokens to
        //check for same values to display
        else {
          tokenGroup = canvas.getActiveObjects();
          for (let i = 0; i < tokenGroup.length; i++) {
            //Should never trigger since Context Menu Event in Toolbar checks if non-token groups are present
            if (!(tokenGroup[i] instanceof Group) || tokenGroup[i].getObjects().length <= 1 ||
              !(tokenGroup[i].getObjects()[0] instanceof FabricImage)) {
              return;
            }
          }
          //Set to Default Values
          xSlider.value[0] = 0;
          ySlider.value[0] = 0;
          showName.setChecked(true);
          setNameVal("");
          
          if (sizeReference) {
            setSizeVal(['1']);
          }

          if (imageLinkRef) {
            setImageLinkVal('');
          }

        }
      }
    }
    //Add new event listener with new state of ContextMenuManager
    document.addEventListener('contextmenu', listeningFunc);

    return () => {
      //Remove any possible previous function that may cause performance issues
      document.removeEventListener('contextmenu', listeningFunc);
    }
  });



  return (
    <div className="ContextMenu" style={{
      backgroundColor: 'rgba(202, 202, 202, 1)', padding: 0,
      justifyContent: 'center', width: 'auto', height: 'auto'
    }}>
      <Flex gap="0" direction="column" alignContent='center'>
        <Button variant="outline" size="sm">
          Stat Block
        </Button>

        <Button variant="outline" size="sm">
          Conditions
        </Button>

        <Menu.Root positioning={{ placement: "right-start" }}>
          <Menu.Trigger asChild>
            <Button variant="outline" size="sm">Display Options</Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner zIndex={'sticky'}>
              <Menu.Content position="relative" tabIndex={-1}>
                <Slider.RootProvider value={xSlider} width="200px">
                  <Slider.Label>Offset X: {xSlider.value}%</Slider.Label>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.RootProvider>

                <Slider.RootProvider width="200px" value={ySlider}>
                  <Slider.Label>Offset Y: {ySlider.value}%</Slider.Label>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumbs />
                  </Slider.Control>
                </Slider.RootProvider>


                <Field.Root>
                  <Field.Label>Display Name</Field.Label>
                  <Input onChange={changeName} value={displayNameVal}
                    placeholder="Enter Display Name"  onFocus={preventDelete} onKeyDown={allowSpace}
                    onBlur={allowDelete} />
                </Field.Root>

                
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Menu.Root positioning={{ placement: "right-start" }}>
          <Menu.Trigger asChild>
            <Button variant="outline" size="sm">Token Settings</Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner zIndex={'sticky'}>
              <Menu.Content position="relative">

                <Checkbox.Root>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>Show HP</Checkbox.Label>
                </Checkbox.Root>

                <Checkbox.RootProvider value={showName}>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>Show Name</Checkbox.Label>
                </Checkbox.RootProvider>

                <Checkbox.Root>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label>Set Invisible</Checkbox.Label>
                </Checkbox.Root>

                <Select.Root ref={sizeReference} collection={sizeOptions} zIndex="sticky" size="sm"
                  onValueChange={changeSize} value={sizeVal}>
                  <Select.HiddenSelect />
                  <Select.Label>Size</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select Size" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content position={'fixed'} zIndex='sticky'>
                        {sizeOptions.items.map((size) => (
                          <Select.Item item={size} key={size.value}>
                            {size.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>

                <Field.Root>
                  <Field.Label>Image Link</Field.Label>
                  <Input
                    placeholder="Enter Image Link" contentEditable="true" onFocus={preventDelete}
                    onBlur={allowDelete} defaultValue={imageLinkVal} ref={imageLinkRef} />
                </Field.Root>

              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Button variant="outline" size="sm">
          Add to Combat
        </Button>

        <Button variant="outline" size="sm" onClick={() => {
          deleteToken(canvas, cmManager, scene);
        }}>
          Delete
        </Button>
      </Flex>
    </div >
  );
}

//Function called by context menu delete button to delete selected tokens
function deleteToken(canvas: Canvas, cmManager: ContextMenuManager, scene: BattleMap): boolean {
  //Check if delete for multiple Tokens or only one
  if (cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1) {
    let activeObjects = canvas.getActiveObjects();
    let selectedToken;
    let index;
    //Iterate over selected active objects
    for (let i = 0; i < activeObjects.length; i++) {
      //Check if they are Token groups and remove them from canvas
      if ((selectedToken = activeObjects[i]) instanceof Group && selectedToken.getObjects().length > 1
        && selectedToken.getObjects()[0] instanceof FabricImage) {
        let canvasObjects = canvas.getObjects();
        index = canvasObjects.indexOf(selectedToken) + 1;
        if (index > 0 && index < canvasObjects.length) {
          canvas.remove(canvasObjects[index]);
        }
        canvas.remove(selectedToken);
        scene.removeToken(selectedToken, canvas);
      }
      //If not, error raised. Non-Token objects should already be detected in Toolbar
      else {
        alert("Error: Non Token Object Selected");
      }
    }
    //Discard the Group selection
    canvas.discardActiveObject();
  }
  //Remove single object. Should be guaranteed as a Token Group from Toolbar defined mouse events
  else if (canvas.getActiveObjects().length == 1) {
    let selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject instanceof Group && selectedObject.getObjects().length > 1
      && selectedObject.getObjects()[0] instanceof FabricImage) {
      let index = canvas.getObjects().indexOf(selectedObject) + 1;
      //Remove Text Box
      if (index > 0 && index < canvas.getObjects().length) {
        canvas.remove(canvas.getObjects()[index]);
      }
      canvas.remove(selectedObject);
      scene.removeToken(selectedObject, canvas);
    }
    else {
      return false;
    }
  }
  //Remove any EventListeners to improve performance
  document.removeEventListener('contextmenu', cmManager.updateContextMenuPosition);
  //Reset ContextMenu booleans to default values
  cmManager.setContextMenuExit(true);
  cmManager.setMultiSelectionBool(false);
  //Hide ContextMenu
  let contextMenu = document.querySelector(".ContextMenu");
  if (contextMenu && contextMenu instanceof HTMLElement) {
    contextMenu.style.display = "none";
  }
  return true;
}

const sizeOptions = createListCollection({
  items: [
    { label: "Tiny", value: '0.5', id: 0 }, { label: "Small/Medium", value: '1', id: 1 },
    { label: "Large", value: '2', id: 2 }, { label: "Huge", value: '3', id: 3 },
    { label: "Gargantuan", value: '4', id: 4 },
    //{label:"Custom",value:'0', id:5},
  ],
});