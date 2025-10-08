import {
    Button, Portal,
    Input, Field, Select, Box,
    createListCollection,
    CloseButton,
    Dialog,
    Spinner,
    Center
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Token } from '../tokenComponents/Token';
import '../index.css';
import { ImageLinkFactory } from '../ImageLinkFactory';

/*Function component TokenCreationEditMenu is a draggable pane where the user
    creates a new token or edits a preexisting base Token in the token collection.
    The component is hidden and is displayed when the user presses the "Create New Token"
    button in the TokenMenu or "Edit" in the TokenMenu's context menu.
*/
export function TokenCreationEditMenu({ tokenCollection, setTokenCollection, linkFactory, setCollectionChange, gameLog }) {
    //State that stores the selected size value of the Token
    const [sizeVal, setSizeVal] = useState(['']);

    //State that stores whether the loading icon is displayed
    const [spinState, setSpinState] = useState('none');

    //State that stores the string value name of the Token
    const [nameVal, setNameVal] = useState('');

    //State that stores the stirng value link of the Token
    const [linkVal, setLinkVal] = useState('');

    //State that stores a string of what operation the Menu is in. Currently only implements 'Create'
    const [operation, setOperation] = useState('Create');

    //State that sets whether the menu (which is a Dialogue) is open
    const [menuOpen, setMenuOpen] = useState(false);

    //State that sets whether the fields in the menu are being submitted to create a new Token
    const [submitState, setSubmitState] = useState(false);

    //Effect called when Submit button is pressed in the menu. Creates a Token if all fields are valid and adds it to the TokenCollection
    useEffect(() => {
        //Make sure submitState is true to prevent infinite loop
        if (submitState) {
            //Check if the current operation uses the Token 'Creation' logic 
            if (operation == 'Create') {
                    //Make sure the tokenCollection and linkFactory exist
                    if (tokenCollection && tokenCollection.length > 0 && linkFactory
                        && linkFactory instanceof ImageLinkFactory) {
                        //Create an HTML img element
                        var source = document.createElement('source');
                        var image = document.createElement('img');
                        let idLink = linkFactory.getLinkAndID(linkVal);
                        image.src = idLink[1];
                        //Set the loading spinner to display
                        setSpinState('block');

                        //Called if image link was valid and able to be loaded
                        image.onload = () => {
                            image.appendChild(source);
                            //Create a Token object
                            var tokenEl = new Token(image);
                            //Store the link and ID pair in the Token
                            tokenEl.addURL(idLink[0], idLink[1]);
                            //Hide loading spinner
                            setSpinState('none');
                            //Check whether size is valid and has been selected
                            var sizeCode = Number(sizeVal[0]);
                            if (sizeCode <= 0) {
                                alert('No Token Size Set');
                                return;
                            }
                            //Otherwise set the size code
                            tokenEl.setSizeCode(sizeCode);
                            
                            //Check if entered name is valid
                            if (nameVal.trim() == "") {
                                alert('No Token Name Set');
                                return;
                            }
                            if (nameVal.length > 64) {
                                alert('Token name cannot be over 64 characters long');
                                return;
                            }
                            //Otherwise set the Token's name
                            tokenEl.setName(nameVal.trim());

                            //Add the Token to the TokenCollection
                            var collection = tokenCollection;
                            collection[0][1].push(tokenEl);
                            setTokenCollection(collection);
                            setCollectionChange(true);
                            //Close the TokenCreationEditMenu Dialogue
                            setMenuOpen(false);
                        }
                        //Called if image link does not work or unable to be fetched
                        image.onerror = function () {
                            setSpinState('none');
                            alert('Image Link is Invalid or Incompatible');
                        };
                    }
            }
            //Currently unimplemented
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
