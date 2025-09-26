import {
  Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
  , Input, Field, Select, Box,
  createListCollection,
  Textarea,
  CloseButton,
  Dialog,
  Spinner,
  Center,
  Switch
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox, FabricImage, } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import { ImageLinkFactory } from '../ImageLinkFactory';

export function BattleMapCreationMenu({ linkFactory, sceneCollection, setCanvas, canvasCollection, setCanvasCollection,
  setSceneCollection, sceneIDMap, setSceneIDMap, currentCanvasID, setCurrentCanvasID, setCurrentScene, setCollectionUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [spinState, setSpinState] = useState('none');
  const [checked, setChecked] = useState(true);
  const [linkVal, setLinkVal] = useState('');
  const [nameVal, setNameVal] = useState('');
  const [submitState, setSubmitState] = useState(false);

  useEffect(() => {
    if (submitState) {
      let parentDiv = document.getElementById('SceneDiv');

      if (parentDiv && sceneIDMap && sceneIDMap instanceof Map) {

        let idNum = 0;
        //Find a scene ID that has not been taken in the map
        while (true) {
          //If the id is in the map and is taken
          if (sceneIDMap.has(idNum) && sceneIDMap.get(idNum)) {
            idNum++;
          }
          //Otherwise use the id for the canvas element
          else {
            break;
          }
        }
        //Create new BattleMap instance
        let newBattleMap;
        try {
          newBattleMap = new BattleMap(nameVal, idNum, checked);
        } catch (error) {
          //If error is caught do not create the scene and alert the user
          alert(error);
          setSubmitState(false);
          return;
        }

        //Create the new canvas element
        let newCanvas = document.createElement('canvas');
        newCanvas.id = 'scene_' + idNum;
        //newCanvas.style.display = 'block';
        parentDiv.appendChild(newCanvas);
        const fabricCanvas = new Canvas(newCanvas, {
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 'rgb(0,0,0)',
          enableRetinaScaling: true
        });

        var image = document.createElement('img');
        var source = document.createElement('source');

        //Set image URL source
        image.appendChild(source);
        image.src = linkVal;
        setSpinState('block');
        //Make sure image's link source works
        image.onerror = function () {
          alert('Image link is invalid or is not compatible');
          fabricCanvas.dispose();
          newCanvas.remove();
          setSpinState('none');
        };

        //Make sure image loads before adding to Canvas
        image.onload = function () {
          const mapEl = new FabricImage(image);

          //Scale image for battle map to fit in window as large as possible with some padding
          if (mapEl.height >= mapEl.width && fabricCanvas.getHeight() < mapEl.height) {
            mapEl.scaleToHeight(fabricCanvas.getHeight() - 50);
          } else if (mapEl.width > mapEl.height && fabricCanvas.getWidth() < mapEl.width) {
            mapEl.scaleToWidth(fabricCanvas.getWidth() - 50);
          }

          //Set map to be unable to be changed and have no controls
          mapEl.set({
            hoverCursor: 'default',
            hasBorder: false,
            hasControls: false,
            selectable: false
          });
          //Add map onto center of canvas and at the very back layer
          fabricCanvas.add(mapEl);
          fabricCanvas.sendObjectToBack(mapEl);
          fabricCanvas.centerObject(mapEl);

          //Add the FabricImage object to BattleMap instance
          newBattleMap.addImage(mapEl);

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

          let newCollection = sceneCollection;
          newCollection.push(['', [newBattleMap]]);
          setSceneCollection(newCollection);
          let newCanvasCollection = canvasCollection;
          newCanvasCollection.push(['', [fabricCanvas]]);
          setCanvasCollection(newCanvasCollection);

          //Update the current canvas ID being used
          setCurrentCanvasID(idNum);
          setCurrentScene(newBattleMap);
          setCanvas(fabricCanvas);
          setMenuOpen(false);
          setCollectionUpdate(true);

          setSpinState('none');
          //Unmounted to free memory
          return () => {
            fabricCanvas.dispose();
          }
        };
      }
      setSubmitState(false);
    }
  }, [submitState]);


  useEffect(() => {
    if (!menuOpen) {
      setChecked(true);
      setLinkVal('');
      setNameVal('');
    }
  }, [menuOpen])


  const updateName = (event) => {
    setNameVal(event.target.value);
  }

  const updateLink = (event) => {
    setLinkVal(event.target.value);
  }

  const resetMenuFields = (event) => {
    setLinkVal('');
    setNameVal('');
    setMenuOpen(event.open);
  }

  const submitFields = () => {
    setSubmitState(true);
  }

  const setGridSnap = (event) => {
    setChecked(event.target.checked);
  }

  return (
    <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom"
      onOpenChange={resetMenuFields} open={menuOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          Create Battle Map
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create Battle Map</Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Body position='relative'>
              <Box pos='relative' flexDirection={'column'}>
                <Field.Root>
                  <Field.Label>
                    Battle Map Name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input onChange={updateName} placeholder="Enter the Token's Name"></Input>
                </Field.Root>
                <Field.Root>
                  <Field.Label>
                    Image Link <Field.RequiredIndicator />
                  </Field.Label>
                  <Input onChange={updateLink} placeholder="Paste the Image Link"></Input>
                </Field.Root>
                <Switch.Root checked={checked} onClick={setGridSnap}>
                  <Switch.HiddenInput />
                  <Switch.Control />
                  <Switch.Label>Grid Snapping</Switch.Label>
                </Switch.Root>
                <Button onClick={submitFields} display='block'>
                  Submit
                </Button>
                <Box pos={'absolute'} inset='0' bg='bg/80' display={spinState}>
                  <Center h='full'>
                    <Spinner size='xl' />
                  </Center>
                </Box>
              </Box>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}