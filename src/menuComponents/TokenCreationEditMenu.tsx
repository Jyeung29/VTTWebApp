import {
    Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
    , Input, Field, Select, Box,
    createListCollection,
    Textarea,
    CloseButton,
    Dialog,
    Spinner,
    Center
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox, } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import { ImageLinkFactory } from '../ImageLinkFactory';

/*Function component TokenCreationEditMenu is a draggable pane where the user
    creates a new token or edits a preexisting base Token in the token collection.
    The component is hidden and is displayed when the user presses the "Create New Token"
    button in the TokenMenu or "Edit" in the TokenMenu's context menu.
*/
export function TokenCreationEditMenu({ tokenCollection, setTokenCollection, linkFactory, setCollectionChange }) {
    const sizeReference = useRef(null);
    const [sizeVal, setSizeVal] = useState(['']);
    const [spinState, setSpinState] = useState('none');
    const [nameVal, setNameVal] = useState('');
    const [linkVal, setLinkVal] = useState('');
    const [operation, setOperation] = useState('Create');
    const [menuOpen, setMenuOpen] = useState(false);
    const [submitState, setSubmitState] = useState(false);

    //Triggers on initial render to add event listener and hide the TokenCreationEditMenu (CSS problems with
    //how react renders with a space seperated className with multiple names instead of classList)
    useEffect(() => {
    }, []);

    useEffect(() => {
        if (submitState) {
            if (operation == 'Create') {
                    if (tokenCollection && tokenCollection.length > 0 && linkFactory
                        && linkFactory instanceof ImageLinkFactory) {
                        var source = document.createElement('source');
                        var image = document.createElement('img');
                        let idLink = linkFactory.getLinkAndID(linkVal);
                        image.src = idLink[1];
                        setSpinState('block');
                        image.onload = () => {
                            image.appendChild(source);
                            var tokenEl = new Token(image);
                            tokenEl.addURL(idLink[0], idLink[1]);
                            var sizeCode = Number(sizeVal[0]);
                            setSpinState('none');
                            if (sizeCode <= 0) {
                                alert('No Token Size Set');
                                return;
                            }
                            tokenEl.setSizeCode(sizeCode);
                            if (nameVal.trim() == "") {
                                alert('No Token Name Set');
                                return;
                            }
                            if (nameVal.length > 64) {
                                alert('Token name cannot be over 64 characters long');
                                return;
                            }
                            tokenEl.setName(nameVal.trim());
                            var collection = tokenCollection;
                            collection[0][1].push(tokenEl);
                            setTokenCollection(collection);
                            setCollectionChange(true);
                            setMenuOpen(false);
                        }
                        //Make sure image's link source works
                        image.onerror = function () {
                            setSpinState('none');
                            alert('Image Link is Invalid or Incompatible');
                        };
                    }
            }
            else if (operation == 'Edit') {

            }
            setSubmitState(false);
        }
    }, [submitState]);

    //Function that changes size of a single or multiple selected Tokens
    const updateSize = (event) => {
        setSizeVal(event.value);
    };

    const updateName = (event) => {
        setNameVal(event.target.value);
    }

    const updateLink = (event) => {
        setLinkVal(event.target.value);
    }

    const resetTokenFields = (event) => {
        setLinkVal('');
        setNameVal('');
        setSizeVal(['']);
        setMenuOpen(event.open);
    }

    const submitFields = () => {
        setSubmitState(true);
    }

    /* place in menu when stat block implemented
                <Field.Root>
                    <Field.Label>
                        Stat Block Text <Field.RequiredIndicator />
                    </Field.Label>
                    <Textarea autoresize={true} maxHeight={window.innerHeight / 2} placeholder="Paste the Stat Block"></Textarea>
                </Field.Root>
    */


    return (
        <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom"
            onOpenChange={resetTokenFields} open={menuOpen}>
            <Dialog.Trigger asChild>
                <Button variant="outline" size="sm">
                    Create Token
                </Button>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Create or Edit Token</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body position='relative'>
                            <Box pos='relative'>
                                <Field.Root>
                                    <Field.Label>
                                        Token Name <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input onChange={updateName} placeholder="Enter the Token's Name"></Input>
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>
                                        Image Link <Field.RequiredIndicator />
                                    </Field.Label>
                                    <Input onChange={updateLink} placeholder="Paste the Image Link"></Input>
                                </Field.Root>

                                <Select.Root collection={sizeOptions} size="sm"
                                    onValueChange={updateSize}
                                    value={sizeVal}>
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
                                    <Select.Positioner>
                                        <Select.Content zIndex="sticky">
                                            {sizeOptions.items.map((size) => (
                                                <Select.Item item={size} key={size.value}>
                                                    {size.label}
                                                    <Select.ItemIndicator />
                                                </Select.Item>
                                            ))}
                                        </Select.Content>
                                    </Select.Positioner>
                                </Select.Root>

                                <Button onClick={submitFields}>
                                    Submit
                                </Button>
                                <Box pos={'absolute'} inset='0' bg='bg/80' display={spinState}>
                                    <Center h='full'>
                                        <Spinner size='xl'/>
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

const sizeOptions = createListCollection({
    items: [
        { label: "Tiny", value: '0.5', id: 0 }, { label: "Small/Medium", value: '1', id: 1 },
        { label: "Large", value: '2', id: 2 }, { label: "Huge", value: '3', id: 3 },
        { label: "Gargantuan", value: '4', id: 4 },
        //{label:"Custom",value:'0', id:5},
    ],
});
