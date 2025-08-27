import {
    Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
    , Input, Field, Select, Box,
    createListCollection,
    Textarea,
    CloseButton
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import { setActivePane } from './PaneHelper';

/*Function component TokenCreationEditMenu is a draggable pane where the user
    creates a new token or edits a preexisting base Token in the token collection.
    The component is hidden and is displayed when the user presses the "Create New Token"
    button in the TokenMenu or "Edit" in the TokenMenu's context menu.
*/
export function TokenCreationEditMenu({ tokenCollection, setTokenCollection }) {
    const sizeReference = useRef(null);
    const [sizeVal, setSizeVal] = useState(['1']);

    //Triggers on initial render to add event listener and hide the TokenCreationEditMenu (CSS problems with
    //how react renders with a space seperated className with multiple names instead of classList)
    useEffect(() => {
        document.addEventListener('mousedown', setActivePane);
        hideTokenCreationEditMenu();
    }, [])

    return (
        <div className="dragPane tokenCreationEditMenu">
            <div className="paneHeader">
                <CloseButton onClick={hideTokenCreationEditMenu}/>
                </div>
            <Box position='relative'>
                <Field.Root>
                    <Field.Label>
                        Token Name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input placeholder="Enter the Token's Name"></Input>
                </Field.Root>
                <Field.Root>
                    <Field.Label>
                        Image Link <Field.RequiredIndicator />
                    </Field.Label>
                    <Input placeholder="Paste the Image Link"></Input>
                </Field.Root>
                <Field.Root>
                    <Field.Label>
                        Stat Block Text <Field.RequiredIndicator />
                    </Field.Label>
                    <Textarea autoresize={true} maxHeight={window.innerHeight / 2} placeholder="Paste the Stat Block"></Textarea>
                </Field.Root>
                <Select.Root ref={sizeReference} collection={sizeOptions} size="sm"
                    value={sizeVal}>
                    <Select.HiddenSelect />
                    <Select.Label textAlign={'left'}>Default Size</Select.Label>
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
                            <Select.Content zIndex="sticky">
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
                <Button>Sumbit</Button>
                <Button>Cancel</Button>
                </Box>
        </div>
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

export function displayTokenCreationEditMenu() {
    let menu = document.querySelector('.tokenCreationEditMenu');
    if(menu && menu instanceof HTMLElement)
    {
        menu.style.display = 'initial';
    }
}

function hideTokenCreationEditMenu() {
    let menu = document.querySelector('.tokenCreationEditMenu');
    if(menu && menu instanceof HTMLElement)
    {
        menu.style.display = 'none';
    }
}