import { describe, expect, test } from '@jest/globals';
import BattleMap from './BattleMap';

//Test name cases
const names = ["", "      ",
    "D&D departs from traditional wargaming by allowing each player to create their own character to play instead of a military formation. These characters embark upon adventures within a fantasy setting. A Dungeon Master (DM) serves as referee and storyteller for the game, while maintaining the setting in which the adventures occur, and playing the role of the inhabitants of the game world, known as non-player characters (NPCs). The characters form a party and they interact with the setting's inhabitants and each other. Together they solve problems, engage in battles, explore, and gather treasure and knowledge. In the process, player characters earn experience points (XP) to level up, and become increasingly powerful over a series of separate gaming sessions.[3][7][11] Players choose a class when they create their character, which gives them special perks and abilities every few levels."
    , "TestMap", "Turbulent Tower", "😸 A cat house", "😸😸😊😸😸", "😊"
]

//Descriptions of Test Cases
const nameDescriptions = ["Empty Name", "All Spaces", "Valid Name", "Valid Name 2", "Over 64 Characters", "Emoji and Text", "Multiple Emojis", "1 Emoji"];

//Expected Results of setting name
const setNameResults = [false, false, false, true, true, true, true, true, true];

describe('BattleMap Class', () => {
    var testMap: BattleMap;

    //Test for Initializing BattleMap
    describe('Initializing BattleMap', () => {
        for (let i = 0; i < 3; i++) {
            test(nameDescriptions[i], () => {
                expect(() => {testMap = new BattleMap(names[i], 0)}).toThrow();
            });
        }
        for (let i = 3; i < names.length; i++) {
            test(nameDescriptions[i], () => {
                expect(testMap = new BattleMap(names[i], 0)).toBeDefined();
            });
        }

    })

    //Test for Setting Name
    describe('Setting Name', () => {
        testMap = new BattleMap("TestName", 0);
        for (let i = 0; i < names.length; i++) {
            test(nameDescriptions[i], () => {
                expect(testMap.setName(names[i])).toBe(setNameResults[i]);
                if(setNameResults[i])
                {
                    expect(testMap.getName()).toBe(names[i]);
                }
                
            });
        }
    });

});