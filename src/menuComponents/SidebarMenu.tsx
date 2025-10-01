import {
    Button, Portal, Drawer, Tabs, CloseButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import '../index.css';
import {TokenMenu} from './TokenMenu';
import { SceneMenu } from './SceneMenu';

/*
The Sidebar Component uses the Chakra UI Drawer component as a top-level overlay that allows for the current canvas to
be manipulatable. It contains five sub-menus: the GameLog, TokenMenu, SceneMenu, AudioMenu, and SettingsMenu.
*/

export function SidebarMenu({ canvas, cmManager, scene, tokenCollection, setTokenCollection, 
    linkFactory, sceneIDMap, setSceneIDMap, currentCanvasID, 
    setCurrentCanvasID, setCurrentScene, setCanvas, canvasCollection, setCanvasCollection}) {
    
        //State that sets whether the Sidebar is open
    const [open, setOpen] = useState(false)
    
    return (
        <div className='SidebarMenu GridSettingHiddenElement'>
            <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} closeOnInteractOutside={false}
                trapFocus={false} modal={false} size={"md"} unmountOnExit={false}>
                <Drawer.Trigger asChild>
                    <Button variant="outline" size="sm">
                        Open Drawer
                    </Button>
                </Drawer.Trigger>
                <Portal>
                    <Drawer.Positioner pointerEvents={"none"}>
                        <Drawer.Content className='GridSettingHiddenElement'>
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
                                    <TokenMenu canvas={canvas} cmManager={cmManager} scene={scene} tokenCollection={tokenCollection} 
                                    setTokenCollection={setTokenCollection} linkFactory={linkFactory}/>
                                    </Tabs.Content>
                                <Tabs.Content value="audio">
                                    Audio Coming Soon
                                </Tabs.Content>
                                <Tabs.Content value="scenes">
                                    <SceneMenu linkFactory={linkFactory} setCurrentScene={setCurrentScene}
                                    sceneIDMap={sceneIDMap} setSceneIDMap={setSceneIDMap} setCanvas={setCanvas}
                                    currentCanvasID={currentCanvasID} setCurrentCanvasID={setCurrentCanvasID}
                                    canvasCollection={canvasCollection} setCanvasCollection={setCanvasCollection}/>
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