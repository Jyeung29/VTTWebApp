import {
    Menu, Button, Portal, Slider, Flex, Checkbox, useSlider, useCheckbox
    , Input, Field, Select, Collapsible, Drawer, ActionBar, Box, Tabs
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { Canvas, Group, Point, Circle, Textbox } from 'fabric';
import { ContextMenuManager } from './ContextMenuManager';
import { Token } from '../tokenComponents/Token';
import type BattleMap from '../battleMapComponents/BattleMap';
import './SidebarMenu.css'

export function SidebarMenu({ canvas, cmManager, board }) {
    const [checked, setChecked] = useState(false)
    return (
        <div className='SidebarMenu'>
            <Checkbox.Root onCheckedChange={(e) => setChecked(!!e.checked)}
            >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>Show Action bar</Checkbox.Label>
            </Checkbox.Root>
            <ActionBar.Root open={checked}>
                <Portal>
                    <ActionBar.Positioner>
                        <ActionBar.Content >
                            <Tabs.Root defaultValue="members" variant="plain">
                                <Tabs.List bg="bg.muted" rounded="l3" p="1">
                                    <Tabs.Trigger value="members">
                                        Members
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="projects">
                                        Projects
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="tasks">
                                        Settings
                                    </Tabs.Trigger>
                                    <Tabs.Indicator rounded="l2" />
                                </Tabs.List>
                                <Tabs.Content value="members">
                                    <Box display={'flex'} flexDirection={'column'} scrollbar='visible'
                                    scrollBehavior={'smooth'} maxH={window.innerHeight} overflow='auto'>
                                        <Button variant="outline" size="sm">
                                            Delete
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Share
                                        </Button>
                                    </Box>
                                </Tabs.Content>
                                <Tabs.Content value="projects">Manage your projects</Tabs.Content>
                                <Tabs.Content value="tasks">
                                    Manage your tasks for freelancers
                                </Tabs.Content>
                            </Tabs.Root>


                        </ActionBar.Content>
                    </ActionBar.Positioner>
                </Portal>
            </ActionBar.Root>
        </div>
    );
}