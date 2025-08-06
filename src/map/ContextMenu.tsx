import {
  Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
  , Input, Field, useSelect,Select,
  createListCollection
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from './Token';
import type BattleMap from './BattleMap';
import { MenuPositioner } from '@ark-ui/react';

export function ContextMenu({ canvas, cmManager, board }) {
  //Event listener to hide context menu if token(s) are no longer selected
  const exit = document.addEventListener('mousedown', (event) => {
    if (event.button == 0 && cmManager && cmManager.getContextMenuExit()) {
      let contextMenu = document.querySelector(".ContextMenu");
      if (contextMenu) {
        contextMenu.style.display = "none";
      }
    }
  });

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
              currentGroup[0] instanceof Token) {
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

          if (tokenGroup && tokenEl && tokenEl instanceof Token) {
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
              currentGroup[0] instanceof Token) {
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

          if (tokenGroup && tokenEl && tokenEl instanceof Token) {
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
              && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof Token) {
              let index = canvas.getObjects().indexOf(tokenGroup) + 1;
              let tokenName;
              //Get the index of the name textbox and set visibility to reflect the checkbox
              if (index > 0 && index < canvas.getObjects().length &&
            (tokenName = canvas.getObjects()[index]) instanceof Textbox) {
                //Set associated bool in Token to reflect change
                token.setShowName(event.checked as boolean);
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
          && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof Token) {
          let tokenName;
          let index = canvas.getObjects().indexOf(tokenGroup) + 1;
          //Get the index of the name textbox and set visibility to reflect the checkbox
          if (index > 0 && index < canvas.getObjects().length &&
        (tokenName = canvas.getObjects()[index]) instanceof Textbox) {
            tokenName = canvas.getObjects()[index];
            //Set associated bool in Token to reflect change
            token.setShowName(event.checked as boolean);
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

  const displayNameInput = useRef(null);
  const [displayNameVal, setNameVal] = useState("");


  var changeName = (event) => {
    if (displayNameInput && cmManager && canvas) {
      let tokenGroup;
      let token;
      let nameBox;
      //Multi-Token selection
      if (cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1) {
        let activeObjects = canvas.getActiveObjects();
        for(let i = 0; i < activeObjects.length; i++)
        {
          if((tokenGroup = activeObjects[i]) instanceof Group && tokenGroup.getObjects().length > 1 &&
        (token = tokenGroup.getObjects()[0]) instanceof Token)
        {
          let index = canvas.getObjects().indexOf(tokenGroup) + 1;
          token.setName(event.target.value);
          if(index > 0 && index < canvas.getObjects().length && 
          (nameBox = canvas.getObjects()[index]) instanceof Textbox)
          {
            nameBox.set('text', event.target.value);
            let newX = tokenGroup.getObjects()[1].getCenterPoint().x;
            let newY = tokenGroup.getObjects()[1].getCoords()[3].y;
            let newPoint = new Point({x:newX,y:newY});
            nameBox.setXY(newPoint, 'center', 'top');
            nameBox.setCoords();
          }
        }
        }
        canvas.renderAll();
      }
      //Single Token selection
      else if ((tokenGroup = canvas.getActiveObject()) instanceof Group && tokenGroup.getObjects().length > 1
        && (token = tokenGroup.getObjects()[0]) instanceof Token) {
        let index = canvas.getObjects().indexOf(tokenGroup) + 1;
        token.setName(event.target.value);
        if(index > 0 && index < canvas.getObjects().length &&
      (nameBox = canvas.getObjects()[index]) instanceof Textbox)
        { 
          nameBox.set('text', event.target.value);
          let newX = tokenGroup.getObjects()[1].getCenterPoint().x;
          let newY = tokenGroup.getObjects()[1].getCoords()[3].y;
          let newPoint = new Point({x:newX,y:newY});
          nameBox.setXY(newPoint, 'center', 'top');
          nameBox.setCoords();
          canvas.renderAll();
        }
        
      }
    }
  };

  const sizeReference = useRef(null);
  const [sizeVal, setSizeVal] = useState(['1']);

  var changeSize = (event) => {
      let tokenGroup;
      let nameBox;
      let token;
      if(cmManager && canvas && board)
      {
        //Multiple Selection
        if(cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1)
        {
          let activeObjects = canvas.getActiveObjects();
          for(let i = 0; i < activeObjects.length; i++)
          {
            if((tokenGroup = activeObjects[i])instanceof Group && (tokenGroup.getObjects().length > 1) &&
          (token = tokenGroup.getObjects()[0]) instanceof Token)
          {
            board.resizeToken(tokenGroup, (event.value)[0] as number, canvas);
            setSizeVal(event.value);
          }
          }
        }
        //Single Selection
        else if((tokenGroup = canvas.getActiveObject()) instanceof Group &&
      (tokenGroup.getObjects().length > 1) && (token = tokenGroup.getObjects()[0]) instanceof Token)
        {
          board.resizeToken(tokenGroup,(event.value)[0] as number, canvas)
          setSizeVal(event.value);
        }
      }
    };
  //When new Context Menu is opened, reflect values of the selected Token(s)
  document.addEventListener('contextmenu', () => {
    //Check if valid and ContextMenu can is being displayed
    if (canvas && cmManager && !cmManager.getContextMenuExit()) {
      let tokenGroup;
      let token;
      //Values for a single Token selection
      if (!cmManager.getMultiSelectionBool() && (tokenGroup = canvas.getActiveObject()) instanceof Group
        && tokenGroup.getObjects().length > 1 && (token = tokenGroup.getObjects()[0]) instanceof Token) {
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
        showName.setChecked(token.getShowName());
        if (displayNameInput) {
          setNameVal(token.getName());
        }
      }
      //Values for a multi-Token selection are at default
      else {
        tokenGroup = canvas.getActiveObjects();
        for (let i = 0; i < tokenGroup.length; i++) {
          //Should never trigger since Context Menu Event in Toolbar checks if non-token groups are present
          if (!(tokenGroup[i] instanceof Group) || tokenGroup[i].getObjects().length <= 1 ||
            !(tokenGroup[i].getObjects()[0] instanceof Token)) {
            return;
          }
        }
        //Set to Default Values
        xSlider.value[0] = 0;
        ySlider.value[0] = 0;
        showName.setChecked(true);
        if (displayNameInput) {
          setNameVal("");
        }

      }
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

        <Menu.Root positioning={{ placement: "right-start"}}>
          <Menu.Trigger asChild>
            <Button variant="outline" size="sm">Display Options</Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner zIndex={'sticky'}>
              <Menu.Content position="relative">
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

                <Field.Root>
                  <Field.Label>Display Name</Field.Label>
                  <Input onChange={changeName} defaultValue={displayNameVal} ref={displayNameInput}
                    placeholder="Enter Display Name" contentEditable="true" />
                </Field.Root>

                <Select.Root ref={sizeReference} collection={sizeOptions} zIndex="sticky" size="sm"
                onValueChange={changeSize} value={sizeVal}> 
                  <Select.HiddenSelect/>
                  <Select.Label>Size</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select Size"/>
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator/>
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content zIndex="sticky">
                        {sizeOptions.items.map((size) => (
                          <Select.Item item={size} key={size.value}>
                            {size.label}
                          <Select.ItemIndicator/>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>

              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>

        <Button variant="outline" size="sm">
          Token Settings
        </Button>

        <Button variant="outline" size="sm">
          Add to Combat
        </Button>

        <Button variant="outline" size="sm" onClick={() => {
          deleteToken(canvas, cmManager, board);
        }}>
          Delete
        </Button>
      </Flex>
    </div >
  );
}

//Function called by context menu delete button to delete selected tokens
function deleteToken(canvas: Canvas, cmManager: ContextMenuManager, board: BattleMap): boolean {
  //Check if delete for multiple Tokens or only one
  if (cmManager.getMultiSelectionBool() && canvas.getActiveObjects().length > 1) {
    let activeObjects = canvas.getActiveObjects();
    let selectedToken;
    let index;
    //Iterate over selected active objects
    for (let i = 0; i < activeObjects.length; i++) {
      //Check if they are Token groups and remove them from canvas
      if ((selectedToken = activeObjects[i]) instanceof Group && selectedToken.getObjects().length > 1
        && selectedToken.getObjects()[0] instanceof Token) {
        let canvasObjects = canvas.getObjects();
        index = canvasObjects.indexOf(selectedToken) + 1;
        if(index > 0 && index < canvasObjects.length)
        {
          canvas.remove(canvasObjects[index]);
        }
        canvas.remove(selectedToken);
        board.removeToken(selectedToken, canvas);
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
  else if(canvas.getActiveObjects().length == 1){
    let selectedObject = canvas.getActiveObject();
    if (selectedObject && selectedObject instanceof Group && selectedObject.getObjects().length > 1
  && selectedObject.getObjects()[0] instanceof Token) {
    let index = canvas.getObjects().indexOf(selectedObject) + 1;
    //Remove Text Box
      if(index > 0 && index < canvas.getObjects().length)
        {
          canvas.remove(canvas.getObjects()[index]);
        }  
      canvas.remove(selectedObject);
      board.removeToken(selectedObject, canvas);
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
  if (contextMenu) {
    contextMenu.style.display = "none";
  }
  return true;
}

const sizeOptions = createListCollection({items: [
    {label:"Tiny",value:'0.5', id:0}, {label:"Small/Medium",value:'1', id:1},
    {label:"Large",value:'2', id:2}, {label:"Huge", value:'3', id:3},
    {label:"Gargantuan",value:'4', id:4}, {label:"Custom",value:'0', id:5},
  ],
    //itemToString:(item)=>`${item.text} ${item.code}`,
    //itemToValue: (item) => item.text,
  });