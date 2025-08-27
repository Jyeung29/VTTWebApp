import {
    Menu, Button, Portal, Flex, Checkbox, useCheckbox
    , Input, Field, Select, Drawer, Tabs, CloseButton, defineRecipe
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import '../index.css';
import {TokenMenu} from './TokenMenu';

export function SidebarMenu({ canvas, cmManager, scene, tokenCollection, setTokenCollection }) {
    const [open, setOpen] = useState(false)
    return (
        <div className='SidebarMenu'>
            <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} closeOnInteractOutside={false}
                trapFocus={false} modal={false} size={"md"} unmountOnExit={false}>
                <Drawer.Trigger asChild>
                    <Button variant="outline" size="sm">
                        Open Drawer
                    </Button>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Positioner pointerEvents={"none"}>
                        <Drawer.Content>
                            <Drawer.CloseTrigger asChild>
                                <CloseButton position={'absolute'} _hover={{backgroundColor:'rgb(255,255,255,255)'}} 
                                height={'55px'} left={-10} top={-2} backgroundColor={'rgb(255,255,255,255)'}/>
                            </Drawer.CloseTrigger>
                            <Tabs.Root defaultValue="game log" fitted>
                                <Tabs.List justifyItems={'center'}>
                                    <Tabs.Trigger value="game log">
                                        Log
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="tokens">
                                        Tokens
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="audio">
                                        Audio
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="scenes">
                                        Scenes
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="settings">
                                        Settings
                                    </Tabs.Trigger>
                                </Tabs.List>
                                <Drawer.Body>
                                <Tabs.Content value="game log">Game Log Coming Soon</Tabs.Content>
                                <Tabs.Content value="tokens">
                                    <TokenMenu canvas={canvas} cmManager={cmManager} scene={scene} tokenCollection={tokenCollection} setTokenCollection={setTokenCollection}/>
                                    </Tabs.Content>
                                <Tabs.Content value="audio">
                                    Audio Coming Soon
                                </Tabs.Content>
                                <Tabs.Content value="scenes">
                                    Scenes Coming Soon
                                </Tabs.Content>
                                <Tabs.Content value="settings">
                                    Settings Coming Soon
                                </Tabs.Content>
                                </Drawer.Body>
                            </Tabs.Root>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </div>
    );
}