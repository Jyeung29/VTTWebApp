import { Resource } from "../tokenComponents/Resource";
import type { Token } from "../tokenComponents/Token";
import TabletopRoleplayingGame from "./TabletopRoleplayingGame";
import { DiceRoll, type Dice } from "../DiceRollComponents/DiceRoll";
import { Button, Table } from "@chakra-ui/react";
import { emitKeypressEvents } from "readline";

const ABILITYSCORENAMES = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'];

const SAVINGTHROWS = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

const SIZECATEGORIES: [string, number][] = [['Tiny', 0.5], ['Small', 1], ['Medium', 2], ['Large', 3], ['Huge', 4], ['Gargantuan', 5]];

//Damage vulnerabilities ordered in how often they appear
const DAMAGEVULNERABILITIES: string[] = ['Fire', 'Bludgeoning', 'Radiant', 'Cold', 'Piercing From Magic Weapons Wilded By good Creatures', 'Thunder', 'Force', 'Necrotic',
    'Acid', 'Psychic', 'Slashing', 'Piercing', 'Lightning', 'Poison', 'Slashingfrom a Vorpal Weapon', 'Bludgeoning, Piercing, and Slashing by Silvered Weapons',
    'Piercing damage from weapons wielded by creatures under the effect of a Bless spell'];

//Damage immunities ordered in how often they appear. Include non-standard immunities later in development.
const DAMAGEIMMUNITIES: string[] = ['Poison', 'Fire', 'Cold', 'Acid', 'Necrotic', 'Psychic', 'Lightning', 'Thunder', 'Force', 'Radiant'];

const SENSES: string[] = ['Darkvision', 'Blindsight', 'Truesight', 'Tremorsense'];

//Condition immunities ordered in how often they appear
const CONDITIONIMMUNITIES: string[] = ['Poisoned', 'Charmed', 'Frightened', 'Exhaustion', 'Paralyzed', 'Petrified', 'Prone', 'Blinded', 'Deafened', 'Restrained', 'Grappled', 'Stunned', 'Unconscious', 'Incapacitated', 'Invisible'];

//Include Non-standard resistances later in development
const DAMAGERESISTANCES: string[] = ['Cold', 'Fire', 'Lightning', 'Acid', 'Thunder', 'Necrotic', 'Poison', 'Radiant', 'Psychic', 'Force'];

const UNITMEASUREMENTS: string[] = ['ft.', 'm.']

//Unimplemented when stat block displaying is complete
const SPELLDESCRIPTIONS: [string, string, any][] = [];

export class DungeonsNDragons5E extends TabletopRoleplayingGame {
    protected generalToolJSX = [];
    protected battleMapToolJSX = [];
    protected roleplayingSceneToolJSX = [];
    protected paneToolJSX = [];
    protected statBlockJSX = [];

    public determineTurnOrder(Tokens: Token[]): Token[] {
        return [];
    }

    public parseStatBlock(rawText: string, gameLog) {

        let rowArray = rawText.split('\n');
        let stats: any[] = [];
        let jsx = [];
        let resources: Resource[] = [];

        //Copied stat block must at least have 24 rows including empty \n lines which are from required sections like name, 
        // alignment and creature type, initiative and armor class, HP, speed, ability scores, senses, languages, and combat rating
        if (rowArray.length < 24) {
            throw Error('Stat block size is too small')
        }

        //Parse Name
        stats.push(['Name', rowArray[0]]);
        jsx.push(<h3 key='0'>{rowArray[0]}</h3>);

        let creatureDescr = rowArray[1].split(',');

        //Make sure there are no out of bounds index errors
        if (creatureDescr.length != 2) {
            throw Error('Stat block does not have correct creature type and alignment format');
        }
        let half = creatureDescr[0].split(' ');

        if (half.length < 2) {
            throw Error('Stat block does not have correct creature type format');
        }

        //Parse size, creature type, and alignment
        let size = half[0];
        let type = half[1];

        //Check if creature size and type is of a length more than 2 words. Ex. Large Dragon (Metallic)
        if (half.length > 2) {
            //Indicating multiple size options. Ex. Medium or Small Humanoid
            if (half[1] == 'or') {
                type = creatureDescr[0].replace(half[0] + ' or ' + half[1], '').trim();
            }
            //Indicating Swarm type creature. Ex. Large Swarm of Medium Fiends (Devils)
            else if (half[1] == 'Swarm' && half.length > 4) {
                type = creatureDescr[0].replace(half[0] + ' Swarm of ' + half[4], '').trim();
            }
            else {
                type = creatureDescr[0].replace(half[0], '').trim();
            }
        }

        let alignment = creatureDescr[1].trim();
        jsx.push(<p key='1'>{rowArray[1]}</p>)

        let sizeCode = 0;

        for (let i = 0; i < SIZECATEGORIES.length; i++) {
            if (size == SIZECATEGORIES[i][0]) {
                sizeCode = SIZECATEGORIES[i][1];
                break;
            }
            //Runs if checked all size strings and found no matches
            if (i == SIZECATEGORIES.length - 1) {
                throw Error('Stat block text does not contain a valid creature size');
            }
        }

        stats.push(['Size', sizeCode]);
        stats.push(['Creature Type', type.toLowerCase()]);
        stats.push(['Alignment', alignment.toLowerCase()]);


        //Determine statblock is 2014 or 2024 version
        //2024 version
        if (rowArray[3].includes('AC')) {
            let newRow = rowArray[3].split(' ');
            if (newRow.length != 4) {
                throw Error('Stat block does not contain correct Armor Class and Initiative format');
            }

            if (Number(newRow[1]) == null || Number(newRow[3]) == null || Number(newRow[1]) < 0) {
                throw Error('Stat block text contains an invalid Armor Class or Initiative value');
            }

            if (!Number.isInteger(Number(newRow[1])) || !Number.isInteger(Number(newRow[3]))) {
                throw Error('Stat block text contains a non-integer Armor Class or Intiative value');
            }

            stats.push(['AC', Number(newRow[1])]);

            let staticMod = Number(newRow[3]);
            let myDice: Dice = {
                diceFace: 20, numDice: 1, valMethod: 0, staticMod: staticMod,
                operationType: 0
            };
            stats.push(['Initiative', new DiceRoll([myDice], 'Initiative'), 10 + staticMod]);
            //When Game log is implemented, implement Dice Roll Message Creation with onClick
            jsx.push(<div className='StatBlockTextAndButton' key='2'>
                <p><b>AC</b> {newRow[1]} <b>Initiative</b> <Button size='xs'>{newRow[3]}</Button> {newRow[4]}</p>
            </div>);

            newRow = rowArray[5].split('(');

            if (newRow.length != 2) {
                throw Error('Stat block does not contain correct Health Points format');
            }

            let staticHP = newRow[0].split(' ');
            if (staticHP.length < 2) {
                throw Error('Stat block does not contain correct Health Points format');
            }

            let rollHP = newRow[1].replace(')', '');
            if (Number(staticHP[1]) == null) {
                throw Error('Static HP is not specified in correct 2024 format');
            }

            if (!Number.isInteger(Number(staticHP[1]))) {
                throw Error('Static HP is not an integer value');
            }

            let rollVals = rollHP.split(' ');
            if (rollVals.length < 1) {
                throw Error('Stat block does not contain correct rolled HP format');
            }

            let diceNotation = rollHP[0].split('d');

            if (diceNotation.length != 2) {
                throw Error('Stat block does not contain correct rolled dice notation at HP');
            }

            if (Number(diceNotation[0]) == null || Number(diceNotation[1]) == null) {
                throw Error('Stat block does not contain numbers at the dice notation of HP');
            }

            if (!Number.isInteger(Number(diceNotation[0])) || !Number.isInteger(Number(diceNotation[1]))) {
                throw Error('Stat block HP dice notation contains non-integer numbers');
            }

            if (rollVals.length == 3) {
                if (Number(rollVals[2]) == null) {
                    throw Error('Stat block does not contain numbers at the HP dice modifier');
                }

                if (!Number.isInteger(Number(rollVals[2]))) {
                    throw Error('Stat block HP modifier contains non-integer numbers');
                }

                if (rollVals[1] == '+' || rollVals[1] == '-') {

                    myDice = {
                        diceFace: Number(diceNotation[1]), numDice: Number(diceNotation[0]), valMethod: 0, staticMod: Number(rollVals[2]),
                        operationType: 0
                    };
                }
                else {
                    throw Error('Stat block contains rolled HP notation that has either incorrect operation or incorrect formatting');
                }

            }
            else {
                myDice = {
                    diceFace: Number(diceNotation[1]), numDice: Number(diceNotation[0]), valMethod: 0, staticMod: 0,
                    operationType: 0
                };
            }

            //HP array shows string, static value, dice roll, and index of HP in resource array
            stats.push(['HP', Number(staticHP[1].trim()), new DiceRoll([myDice], 'HP'), 0]);
            jsx.push(<div className='StatBlockTextAndButton' key='3'>
                <p><b>HP</b> {staticHP[1].trim()} <Button size='xs'>{rollHP}</Button></p>
            </div>);
            resources.push(new Resource('HP', Number(staticHP[1].trim())));

            newRow = rowArray[7].split(',');

            if (newRow.length == 0) {
                throw Error('Stat block does not contain correct Speed format');
            }

            let speedLine: string[];
            for (let i = 0; i < newRow.length; i++) {
                speedLine = newRow[i].split(' ');
                if (speedLine.length != 3 || Number(speedLine[1]) == null) {
                    throw Error('Stat block does not contain correct Speed format with Speed type, speed value, and unit of measurement')
                }
                if (!Number.isInteger(Number(speedLine[1]))) {
                    throw Error('Stat block contains a non-integer speed value');
                }

                let standardMeasurement = false;
                for (let j = 0; j < UNITMEASUREMENTS.length; j++) {
                    if (speedLine[2] == UNITMEASUREMENTS[j]) {
                        standardMeasurement = true;
                        break;
                    }
                }
                if (!standardMeasurement && !confirm('Speed is using ' + speedLine[2] + ' which is a non-standard unit of measurement. Do you want to proceed to use this measurement?')) {
                    throw Error('Stat block Speed uses a non-standard unit of measurement');
                }

                stats.push([speedLine[0], Number(speedLine[1]), speedLine[2], 1]);
                resources.push(new Resource(speedLine[0], Number(speedLine[1])));
            }

            jsx.push(<p key='4'><b>Speed</b> {rowArray[7].replace('Speed ', '')}</p>);

            if (rowArray[9] != 'Ability\tScore\tMod\tSave') {
                throw Error('Stat block Ability Score Table is not formatted correctly');
            }

            if (!rowArray[10].includes('Str')) {
                throw Error('Stat block Str row in the Ability Score Table is not formatted correctly')
            }
            else if (!rowArray[11].includes('Dex')) {
                throw Error('Stat block Dex row in the Ability Score Table is not formatted correctly')
            }
            else if (!rowArray[12].includes('Con')) {
                throw Error('Stat block Con row in the Ability Score Table is not formatted correctly')
            }
            else if (!rowArray[14].includes('Int')) {
                throw Error('Stat block Int row in the Ability Score Table is not formatted correctly')
            }
            else if (!rowArray[15].includes('Wis')) {
                throw Error('Stat block Wis row in the Ability Score Table is not formatted correctly')
            }
            else if (!rowArray[16].includes('Cha')) {
                throw Error('Stat block Cha row in the Ability Score Table is not formatted correctly')
            }

            var tableItems = [];
            let increment = 0;
            for (let i = 10; i < 17; i++) {
                newRow = rowArray[i].split('\t');

                if (i == 13) {
                    continue;
                }

                if (newRow.length < 4 || Number(newRow[1]) == null || Number(newRow[2]) == null || Number(newRow[3]) == null) {
                    let ability = ABILITYSCORENAMES[i - 10];
                    if (i > 13) {
                        ability = ABILITYSCORENAMES[i - 11];
                    }
                    throw Error('Stat block ' + ability + ' row in the Ability Score Table is not formatted correctly');
                }

                if (!Number.isInteger(Number(newRow[1])) || !Number.isInteger(Number(newRow[2])) || !Number.isInteger(Number(newRow[3]))) {
                    let ability = ABILITYSCORENAMES[i - 10];
                    if (i > 13) {
                        ability = ABILITYSCORENAMES[i - 11];
                    }
                    throw Error('Stat block ' + ability + ' contains a non-integer value');
                }

                if (Number(newRow[1]) < 0) {
                    let ability = ABILITYSCORENAMES[i - 10];
                    if (i > 13) {
                        ability = ABILITYSCORENAMES[i - 11];
                    }
                    throw Error('Stat block ' + ability + ' contains an invalid negative ability score');
                }

                myDice = {
                    diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(newRow[2]),
                    operationType: 0
                };
                let myDice2 = {
                    diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(newRow[3]),
                    operationType: 0
                };
                tableItems.push({ id: increment, ability: newRow[0], score: Number(newRow[1]), modifier: Number(newRow[2]), save: Number(newRow[3]) });
                stats.push([newRow[0], Number(newRow[1]), new DiceRoll([myDice], newRow[0] + ' Check'), new DiceRoll([myDice2], newRow[0] + ' Saving Throw')]);
                increment++;
            }

            jsx.push(<Table.Root key={5} size={'md'}>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>ABILITY</Table.ColumnHeader>
                        <Table.ColumnHeader>Score</Table.ColumnHeader>
                        <Table.ColumnHeader>MOD</Table.ColumnHeader>
                        <Table.ColumnHeader>SAVE</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {tableItems.map((item) => (
                        <Table.Row key={item.id}>
                            <Table.Cell>{item.ability}</Table.Cell>
                            <Table.Cell>{item.score}</Table.Cell>
                            <Table.Cell><Button>{item.modifier}</Button></Table.Cell>
                            <Table.Cell><Button>{item.save}</Button></Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>);

            //Index 14
            stats.push(['Skills', []]);
            stats.push(['Vulnerabilities', []]);
            stats.push(['Resistances', []]);
            //Imunities two arrays are Damage Types and Conditions
            stats.push(['Immunities', [], []]);
            stats.push(['Senses', []]);
            //Languages two arrays are of languages and telepathy
            stats.push(['Languages', [], []]);
            //CR arrays are CR value in fraction form and XP value (no lair, and in lair)
            stats.push(['CR', [], []]);
            stats.push('Proficiency Bonus', 0)
            stats.push(['Traits', []]);
            stats.push(['Actions', []]);
            stats.push(['Bonus Actions', []]);
            stats.push(['Reactions', []]);
            stats.push(['Legendary Actions', []]);

            let keyCount = 6;
            //Iterate over rest of stat block which will vary in length and stat sections
            for (let i = 17; i < rowArray.length; i++) {
                if (rowArray[i].split(' ')[0] == 'Skills') {
                    let skillArray = [];
                    let skillJSX = [];
                    newRow = rowArray[i].replace('Skills', '').trim().split(',');
                    for (let j = 0; j < newRow.length; j++) {
                        let skill = newRow[j].split(' ');
                        if (skill.length != 2) {
                            throw Error('Stat Block Skills are not formatted correctly with the skill name and skill modifier (that considers proficiency bonus)');
                        }

                        if (Number(skill[1]) == null) {
                            throw Error('Stat Block Skills must include a modifier');
                        }

                        if (!Number.isInteger(Number(skill[1]))) {
                            throw Error('Stat Block contains a skill with a non-integer modifier');
                        }

                        if (j > 0) {
                            skillJSX.push(<p>, {skill[0]}</p>, <Button>{skill[1]}</Button>);
                        }
                        else {
                            skillJSX.push(<p>{skill[0]}</p>, <Button>{skill[1]}</Button>);
                        }

                        skillArray.push([skill[0], Number(skill[1])]);
                    }
                    if (skillArray.length < 1) {
                        throw Error('Stat Block Skill parsing encountered an error');
                    }

                    stats[14][1] = (skillArray);
                    jsx.push(<div className='StatBlockTextAndButton' key={keyCount}><b>Skills</b> {skillArray}</div>)
                    keyCount++;
                }
                else if (rowArray[i].split(' ')[0] == 'Vulnerabilities') {
                    newRow = rowArray[i].replace('Vulnerabilities', '').trim().split(',');
                    let vulnArray: string[] = [];
                    let unofficialVulnerabilities = [];
                    //Iterate over the vulnerabilities
                    for (let j = 0; j < newRow.length; j++) {
                        if (newRow[j] == 'None') {
                            alert('Warning: Stat Block parsing detected \'None\' in the Vulnerabilies section which is non-standard formatting');
                        }
                        else {
                            let found = false;
                            //Detect official damage types and order based on how common they are to slightly improve performance
                            for (let k = 0; k < DAMAGEVULNERABILITIES.length; k++) {
                                if (newRow[j] == DAMAGEVULNERABILITIES[k]) {
                                    vulnArray.push(newRow[j]);
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                unofficialVulnerabilities.push(newRow[i]);
                            }
                        }
                    }
                    if (unofficialVulnerabilities.length > 0 && confirm('Stat Block parsing detected unofficial damage types in Vulnerabilities. Do you want to proceed with the custom damage types ' + unofficialVulnerabilities + '?')) {
                        for (let j = 0; j < unofficialVulnerabilities.length; j++) {
                            vulnArray.push(unofficialVulnerabilities[j]);
                        }
                    }
                    if (vulnArray.length > 0) {
                        stats[15][1] = vulnArray;
                        jsx.push(<div key={keyCount}><p><b>Vulnerabilities</b> {rowArray[i].replace('Vulnerabilities', '').trim()}</p></div>);
                        keyCount++;
                    }
                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Resistances') {
                    newRow = rowArray[i].replace('Resistances', '').trim().split(',');
                    let resArray: string[] = [];
                    let unofficialResistances = [];
                    //Iterate over the resistances
                    for (let j = 0; j < newRow.length; j++) {
                        if (newRow[j] == 'None') {
                            alert('Warning: Stat Block parsing detected \'None\' in the Resistances section which is non-standard formatting');
                        }
                        else {
                            let found = false;
                            //Detect official damage types and order based on how common they are to slightly improve performance
                            for (let k = 0; k < DAMAGERESISTANCES.length; k++) {
                                if (newRow[j] == DAMAGERESISTANCES[k]) {
                                    resArray.push(newRow[j]);
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                unofficialResistances.push(newRow[i]);
                            }
                        }
                    }
                    if (unofficialResistances.length > 0 && confirm('Stat Block parsing detected unofficial damage types in Resistances. Do you want to proceed with the custom damage types ' + unofficialResistances + '?')) {
                        for (let j = 0; j < unofficialResistances.length; j++) {
                            resArray.push(unofficialResistances[j]);
                        }
                    }
                    if (resArray.length > 0) {
                        stats[16][1] = resArray;
                        jsx.push(<div key={keyCount}><p><b>Vulnerabilities</b> {rowArray[i].replace('Resistances', '').trim()}</p></div>);
                        keyCount++;
                    }
                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Immunities') {
                    newRow = rowArray[i].replace('Immunities', '').trim().split(';');
                    let conditionImmune = [];
                    let damageImmune = [];
                    //There are only condition or damage type immunities
                    if (newRow.length == 1 && newRow[0].trim() != '') {
                        let immunities = newRow[0].split(',');
                        //Immune type indicates whether immunity is a damage type: 0 or condition: 1
                        let immuneType = -1;
                        let customImmunities = [];
                        //Iterate over all immunities
                        for (let j = 0; j < immunities.length; j++) {
                            //Try to find whether immune section contains damage types or conditions. If custom values are found, try to find on other immunities
                            if (immuneType == -1) {
                                //Iterate over damage immunities for match
                                for (let k = 0; k < DAMAGEIMMUNITIES.length; k++) {
                                    if (DAMAGEIMMUNITIES[k] == immunities[j]) {
                                        immuneType = 0;
                                        damageImmune.push(immunities[j]);
                                        break;
                                    }
                                }

                                //If damage immunities were not found then iterate over conditions
                                if (immuneType == -1) {
                                    for (let k = 0; k < CONDITIONIMMUNITIES.length; k++) {
                                        if (CONDITIONIMMUNITIES[k] == immunities[j]) {
                                            immuneType = 1;
                                            conditionImmune.push(immunities[j]);
                                            break;
                                        }
                                    }
                                }

                                //Custom damage or condition found
                                if (immuneType == -1) {
                                    customImmunities.push(immunities[j]);
                                }
                            }
                            //Found that Immunities are all damage types
                            else if (immuneType == 0) {
                                let found = false;
                                //Iterate over damage immunities for match
                                for (let k = 0; k < DAMAGEIMMUNITIES.length; k++) {
                                    if (DAMAGEIMMUNITIES[k] == immunities[j]) {
                                        damageImmune.push(immunities[j]);
                                        found = true;
                                        break;
                                    }
                                }

                                //If non-damage type found, check if it is a condition and throw error
                                if (!found) {
                                    for (let k = 0; k < CONDITIONIMMUNITIES.length; k++) {
                                        if (CONDITIONIMMUNITIES[k] == immunities[j]) {
                                            throw Error('Stat Block Vulnerabilities combines condition and damage type immunities without a \';\' symbol');
                                        }
                                    }
                                    customImmunities.push(immunities[j]);
                                }
                            }
                            //Found that Immunities are all conditions
                            else if (immuneType == 1) {
                                let found = false;
                                //If damage immunities were not found then iterate over conditions
                                for (let k = 0; k < CONDITIONIMMUNITIES.length; k++) {
                                    if (CONDITIONIMMUNITIES[k] == immunities[j]) {
                                        found = true;
                                        conditionImmune.push(immunities[j]);
                                        break;
                                    }
                                }

                                //If non-condition found, check if it is a damage type and throw error
                                for (let k = 0; k < DAMAGEIMMUNITIES.length; k++) {
                                    if (DAMAGEIMMUNITIES[k] == immunities[j]) {
                                        throw Error('Stat Block Vulnerabilities combines condition and damage type immunities without a \';\' symbol');
                                    }
                                }

                                //Custom damage or condition found
                                if (!found) {
                                    customImmunities.push(immunities[j]);
                                }
                            }
                        }

                        //Ask User for confirmation whether immunities are damage types or conditions
                        if (immuneType == -1 && customImmunities.length > 0) {
                            let confirmed = false;
                            while (!confirmed) {
                                if (confirm('Press OK if the immunities are damage types')) {
                                    confirmed = true;
                                    immuneType = 0;
                                }
                                else if (confirm('Press OK if the immunities are conditions')) {
                                    confirmed = true;
                                    immuneType = 1;
                                }
                                else if (confirm('Warning: Not indicating if immunities are damage types or conditions will cause the immunities to be removed. Do you want to proceed without specifying?')) {
                                    confirmed = true;
                                }
                            }
                        }

                        if (immuneType == 0) {
                            stats[17][1] = damageImmune.concat(customImmunities);
                        }
                        else if (immuneType == 1) {
                            stats[17][2] = conditionImmune.concat(customImmunities);
                        }

                        if (immuneType != -1) {
                            jsx.push(<div key={keyCount}><p><b>Immunities</b> {rowArray[i].replace('Immunities', '').trim()}</p></div>);
                            keyCount++;
                        }
                    }
                    //There are both condition and damage type immunities
                    else if (newRow.length == 2) {
                        let left = newRow[0].split(',');
                        let right = newRow[1].split(',');

                        let leftCustom = [];
                        let rightCustom = [];
                        //Iterate over left side of semi colon
                        for (let j = 0; j < left.length; j++) {
                            let found = false;
                            //Find match for damage types
                            for (let k = 0; k < DAMAGEIMMUNITIES.length; k++) {
                                if (left[j] == DAMAGEIMMUNITIES[k]) {
                                    damageImmune.push(left[j]);
                                    found = true;
                                    break;
                                }
                            }

                            //Custom immunity
                            if (!found) {
                                leftCustom.push(left[j]);
                            }
                        }

                        for (let j = 0; j < right.length; j++) {
                            let found = false;
                            for (let k = 0; k < CONDITIONIMMUNITIES.length; k++) {
                                if (right[j] == CONDITIONIMMUNITIES[k]) {
                                    conditionImmune.push(right[j]);
                                    found = true;
                                    break;
                                }
                            }
                            //Custom damage type
                            if (!found) {
                                rightCustom.push(right[j]);
                            }
                        }

                        //Everything is custom or is reversed order of condition and damage type 
                        if (leftCustom.length > 0 && rightCustom.length > 0 && conditionImmune.length == 0 && damageImmune.length == 0) {

                            let switched = false;
                            //Iterate over left to find condition matches
                            for (let j = 0; j < left.length; j++) {
                                for (let k = 0; k < CONDITIONIMMUNITIES.length; k++) {
                                    if (CONDITIONIMMUNITIES[k] == left[j]) {
                                        switched = true;
                                        break;
                                    }
                                }
                                if (switched) {
                                    break;
                                }
                            }


                            //If left is all custom then check if right has standard damage immunities
                            if (!switched) {
                                //Iterate over left to find condition matches
                                for (let j = 0; j < right.length; j++) {
                                    for (let k = 0; k < DAMAGEIMMUNITIES.length; k++) {
                                        if (DAMAGEIMMUNITIES[k] == right[j]) {
                                            switched = true;
                                            break;
                                        }
                                    }
                                    if (switched) {
                                        break;
                                    }
                                }
                            }

                            let invalid = false;

                            if (!switched) {
                                let confirmed = false;
                                while (!confirmed) {
                                    if (confirm('Press OK if the left immunities are damage types and right immunities are conditions')) {
                                        confirmed = true;
                                    }
                                    else if (confirm('Press OK if the left immunities are conditions and right immunities are damage types')) {
                                        confirmed = true;
                                        switched = true;
                                    }
                                    else if (confirm('Warning: Not indicating if immunities are damage types or conditions will cause the immunities to be removed. Do you want to proceed without specifying?')) {
                                        confirmed = true;
                                        invalid = true;
                                    }
                                }
                            }

                            //Switch sides
                            if (switched && !invalid) {
                                stats[17][1] = rightCustom;
                                stats[17][2] = leftCustom;
                                alert('Warning: Stat Block Immunities section has a non-standard ordering of conditions,\';\', and damage types');
                                jsx.push(<div key={keyCount}><p><b>Immunities</b> {newRow[0]};{newRow[1]}</p></div>)
                                keyCount++;
                            }
                            //Do not switch sides
                            else if (!invalid) {
                                stats[17][1] = leftCustom;
                                stats[17][2] = rightCustom;
                                jsx.push(<div key={keyCount}><p><b>Immunities</b> {rowArray[i].replace('Immunities', '').trim()}</p></div>)
                                keyCount++;
                            }
                        }
                        //Check if custom immunities in correct format or incorrect format with mixed condition and damage types without semi-colon
                        else if ((rightCustom.length > 0 && conditionImmune.length > 0) || (leftCustom.length > 0 && damageImmune.length > 0)) {
                            let incorrectFormat = false;
                            //Iterate over left customs and check if they are actually conditions and not custom damage types
                            for (let j = 0; j < leftCustom.length; j++) {
                                for (let k = 0; k < conditionImmune.length; k++) {
                                    if (conditionImmune[k] == leftCustom[j]) {
                                        incorrectFormat = true;
                                        break;
                                    }
                                }
                                if (incorrectFormat) {
                                    break;
                                }
                            }

                            if (incorrectFormat) {
                                throw Error('Stat Block Immunities section contains conditions and damage types not seperated by \';\' character');
                            }

                            //Iterate over right customs and check if they are actually damage types and not custom conditions
                            for (let j = 0; j < rightCustom.length; j++) {
                                for (let k = 0; k < damageImmune.length; k++) {
                                    if (damageImmune[k] == rightCustom[j]) {
                                        incorrectFormat = true;
                                        break;
                                    }
                                }
                                if (incorrectFormat) {
                                    break;
                                }
                            }

                            if (incorrectFormat) {
                                throw Error('Stat Block Immunities section contains conditions and damage types not seperated by \';\' character');
                            }

                            //Is correct and are custom Immunities
                            stats[17][1] = damageImmune.concat(leftCustom);
                            stats[17][2] = conditionImmune.concat(rightCustom);
                            jsx.push(<div key={keyCount}><p><b>Immunities</b> {rowArray[i].replace('Immunities', '').trim()}</p></div>)
                            keyCount++;
                        }
                    }
                    else {
                        throw Error('Stat Block Immunities section is not formatted correctly');
                    }
                }
                else if (rowArray[i].split(' ')[0] == 'Senses') {
                    newRow = rowArray[i].replace('Senses', '').trim().split(';');
                    let senseArray = [];
                    let standardSenses = true;
                    let standardMeasurement = true;
                    for (let j = 0; j < newRow.length; j++) {
                        let sense = newRow[j].split(' ');
                        if (sense.length == 3) {
                            if (sense[1] == 'Perception' && sense[0] == 'Passive') {
                                if (Number(sense[2]) == null) {
                                    throw Error('Stat Block senses contains a Passive Perception without a valid value');
                                }
                                else if (Number(sense[2]) < 0) {
                                    throw Error('Stat Block senses contains a Passive Perception with an invalid negative value');
                                }
                                else if (!Number.isInteger(sense[2])) {
                                    throw Error('Stat Block senses contains a Passive Perception with an invalid non-integer value');
                                }
                                else {
                                    senseArray.push(['Passive Perception', Number(sense[2])]);
                                }
                            }
                            else if (Number(sense[1]) != null && !Number.isInteger(Number(sense[1]))) {
                                throw Error('A sense in the stat block contains an invalid non-integer value');
                            }
                            else if (Number(sense[1]) != null && Number(sense[1]) > 0) {
                                let localSense = false;
                                let localMeasurement = false;
                                //Check if any custom senses are included
                                for (let k = 0; k < SENSES.length; k++) {
                                    if (SENSES[k] == sense[0]) {
                                        localSense = true;
                                        break;
                                    }
                                }

                                //Set overall boolean to indicate to user all at once if there are custom senses
                                if (!localSense && standardSenses) {
                                    standardSenses = false;
                                }

                                for (let k = 0; k < UNITMEASUREMENTS.length; k++) {
                                    if (UNITMEASUREMENTS[k] == sense[2]) {
                                        localMeasurement = true;
                                        break;
                                    }
                                }

                                //Set overall boolean to indicate to user all at once if there are custom measurements
                                if (!localMeasurement && standardMeasurement) {
                                    standardMeasurement = false;
                                }

                                senseArray.push([sense[0], Number(sense[1]), sense[2]]);
                            }
                            else {
                                throw Error('A sense in the stat block is not formatted correctly with the sense, distance, and unit of measurement');
                            }
                        }
                        else {
                            throw Error('Stat Block Senses section contains a sense that is not \'Passive Perception\' with a number or a sense with a distance and unit of measurement');
                        }
                    }

                    //Custom senses were detected check if it was intentional and should be included
                    if (!standardSenses && !confirm('Stat block Senses section contains custom senses. Proceed with using these senses?')) {
                        throw Error('Stat block contains custom senses are not used');
                    }

                    if (!standardMeasurement && !confirm('Stat block Senses section contains senses with custom units of measurement. Proceed with using these measurements?')) {
                        throw Error('Stat block contains custom unit measures that are not used');
                    }

                    jsx.push(<div key={keyCount}><p><b>Senses</b> {rowArray[i].replace('Senses', '').trim()}</p></div>);
                    stats[18][1] = senseArray;
                    keyCount++;

                }
                else if ((rowArray[i].split(' '))[0] == 'Languages') {
                    newRow = rowArray[i].replace('Languages', '').trim().split(';');
                    //Telepathy section detected
                    if (newRow.length == 2) {
                        let telepathy = newRow[1].split(' ');
                        if (telepathy.length != 3 || (telepathy.length == 3 && (telepathy[0] != 'telepathy' || Number(telepathy[1] == null)))) {
                            throw Error('Stat block Languages section indicates telepathy but telepathy is incorrectly formatted or not provided');
                        }
                        if (Number(telepathy[1]) <= 0 || !Number.isInteger(Number(telepathy[1]))) {
                            throw Error('Stat block Languages section indicates a telepathy that is an invalid negative or non-integer distance value');
                        }

                        let standardMeasurement = false;
                        for (let j = 0; j < UNITMEASUREMENTS.length; j++) {
                            if (UNITMEASUREMENTS[j] == telepathy[2]) {
                                standardMeasurement = true;
                                break;
                            }
                        }
                        if (!standardMeasurement && !confirm('Telepathy distance is provided in a non-standard unit of measurement. Would you like to proceed using this measurement?')) {
                            throw Error('Stat block Languages section contains telepathy that has a non-standard unit of measurement');
                        }
                        stats[19][2] = ['telepathy', Number(telepathy[1]), telepathy[2]];
                    }

                    newRow = newRow[0].trim().split(',');
                    if (newRow.length == 1 && newRow[0] == '') {
                        throw Error('Stat block is formatted incorrectly. To indicate no languages, include \'None\' after languages');
                    }

                    let languages = [];

                    for (let j = 0; j < newRow.length; j++) {
                        if (newRow[j] == 'None' && newRow.length > 1) {
                            throw Error('Stat block includes \'None\' when multiple languages are indicated in the languages section');
                        }
                        languages.push(newRow[j]);
                    }

                    stats[19][1] = languages;
                    jsx.push(<p><b>Languages</b> {rowArray[i].replace('Languages', '').trim()}</p>);
                }
                else if ((rowArray[i].split(' '))[0] == 'CR') {
                    newRow = rowArray[i].replace('CR', '').trim().split('(');
                    if (newRow.length != 2) {
                        throw Error('Stat block Combat Rating section is incorrectly formatted and may not include parentheses around the experience points and proficiency bonus');
                    }

                    let rating = newRow[0].trim().split('/');
                    if (rating.length == 1) {
                        if (Number(rating[0]) == null || !Number.isInteger(Number(rating[0]))) {
                            throw Error('Stat block Combat Rating value must be a positive integer value');
                        }
                        stats[20][1] = [Number(rating[0]), 1];
                    }
                    else if (rating.length == 2) {
                        if (Number(rating[0]) == null || !Number.isInteger(Number(rating[0])) || Number(rating[1]) == null || !Number.isInteger(Number(rating[1]))) {
                            throw Error('Stat block Combat Rating fraction values must each be a positive integer value');
                        }
                        stats[20][1] = [Number(rating[0]), Number(rating[1])];
                    }
                    else {
                        throw Error('Stat block Combat Rating cannot have more than a single \'/\' to indicate a fraction');
                    }

                    newRow[1] = newRow[1].replace(')', '');
                    let parentheses = newRow[1].split(';');
                    if (parentheses.length != 2) {
                        throw Error('Stat block Combat Rating parentheses must contain an experience and proficiency bonus section seperated by \';\'');
                    }
                    let exp = parentheses[0].split('or');

                    //No lair experience
                    exp[0] = exp[0].replace(',', '').trim();
                    let part = exp[0].split(' ');
                    if (part.length != 2) {
                        throw Error('Stat block experience point must be in the format of \'XP\' and the experience value');
                    }
                    if (Number(part[1]) == null || !Number.isInteger(Number(part[1])) || Number(part[1]) <= 0) {
                        throw Error('Stat block experience points can only be a positive integer value');
                    }
                    stats[20][2] = [Number(part[1]), 0];
                    //Has lair experience
                    if (exp.length == 2) {
                        exp[1] = exp[1].replace(',', '').trim();
                        let lair = exp[1].split(' ');
                        if (lair.length != 3 || (lair[1] != 'in' || lair[2] != 'lair')) {
                            throw Error('Stat block experience point for a lair must be in the format of the experience value and \'in lair\'');
                        }
                        if (Number(lair[0]) == null || !Number.isInteger(Number(lair[0])) || Number(lair[0]) <= 0) {
                            throw Error('Stat block lair experience points can only be a positive integer value');
                        }
                        stats[20][2] = [Number(part[1]), Number(lair[0])];
                    }
                    else if (exp.length > 2 || exp.length <= 0) {
                        throw Error('Stat block experience points can only include one or up to 2 sections containing exp values not in or within a lair');
                    }

                    let proficiency = parentheses[1].split(' ');
                    if (proficiency.length != 2 || proficiency[0] != 'PB' || Number(proficiency[1]) == null || !Number.isInteger(Number(proficiency[1]))) {
                        throw Error('Stat block proficiency bonus must be in format of \'PB\' and a positive integer modifier');
                    }

                    stats[21][1] = Number(proficiency[1]);
                    jsx.push(<p><b>CR</b> {rowArray[i].replace('CR', '').trim()}</p>);
                }
                else if ((rowArray[i].split(' '))[0] == 'Traits') {
                    let end = false;
                    let j = i + 1;
                    let followingParagraph = false;
                    //Follows format of trait name, trait description, 
                    let traits: any[] = [];
                    let traitJSX = [<h4 key={keyCount} className='sectionHeaderDND5E'><b>Traits</b></h4>];
                    keyCount++;
                    while (!end) {
                        //Check if new section or still inside Trait section
                        if (rowArray.length <= j) {
                            end = true;
                            break;
                        }

                        let spaceSeperated = rowArray[j].split(' ');

                        switch (rowArray[j].split(' ')[0]) {
                            case 'Actions':
                                end = true;
                                break;
                            case 'Bonus':
                                end = true;
                                break;
                            case 'Reactions':
                                end = true;
                                break;
                            case 'Legendary':
                                if (spaceSeperated.length > 3 && spaceSeperated[1] == 'Resistance') {
                                    let legendRes = rowArray[j].split('.')[0];
                                    let resResource = legendRes.split('(');
                                    if (resResource.length == 2) {
                                        legendRes = resResource[1].replace(')', '').trim();
                                        resResource = legendRes.split(', or ');
                                        if (resResource.length == 1) {
                                            let parts = resResource[0].split('/');
                                            if (parts.length == 2) {
                                                if (Number(parts[0]) == null || !Number.isInteger(Number(parts[0]))) {
                                                    throw Error('Stat block Legendary Resistance value must be a positive integer');
                                                }
                                                resources.push(new Resource('Legendary Resistance', Number(parts[0])));
                                                traits.push(['Legendary Resistance', [resources.length - 1, parts[1]], [-1, '']]);
                                            }
                                            else {
                                                throw Error('Stat block Legendary Resistances amount indicated must be in format of positive integer value followed by \'/\' and the recharge unit of time');
                                            }
                                        }
                                        else if (resResource.length == 2) {
                                            let parts = resResource[0].split('/');
                                            let lairParts = resResource[1].split('/');

                                            if (parts.length == 2) {
                                                if (Number(parts[0]) == null || !Number.isInteger(Number(parts[0]))) {
                                                    throw Error('Stat block Legendary Resistance value must be a positive integer');
                                                }
                                                resources.push(new Resource('Legendary Resistance', Number(parts[0])));

                                            }
                                            else {
                                                throw Error('Stat block Legendary Resistances amount indicated must be in format of positive integer value followed by \'/\' and the recharge unit of time');
                                            }

                                            if (lairParts.length != 2) {
                                                throw Error('Stat block Legendary Resistance value must include a \'/\' to seperate the number of legendary actions and the time to reset');
                                            }
                                            let lairReset = lairParts[1].split(' ');

                                            if (lairReset.length != 3 || lairReset[1] != 'in' || lairReset[2].toLowerCase() != 'lair') {
                                                throw Error('Stat block Legendary Resistance for within a lair must include the value sperated by a \'/\', the recharge unit of time, and \'in Lair\'');
                                            }

                                            if (Number(lairParts[0]) == null || !Number.isInteger(Number(lairParts[0]))) {
                                                throw Error('Stat block Legendary Resistance value must be a positive integer');
                                            }

                                            resources.push(new Resource('Legendary Resistance (Lair)', Number(lairParts[0])));

                                            traits.push(['Legendary Resistance', [resources.length - 2, parts[1]], [resources.length - 1, lairReset[0]]]);
                                        }
                                        else {
                                            throw Error('Stat block Legendary Resistances can only indicate the number of resistances with and without a lair');
                                        }
                                        traitJSX.push(<p key={keyCount}><b>Legendary Resistance</b> {rowArray[j].replace('Legendary Resistance', '').trim()}</p>);
                                        keyCount++;
                                    }
                                    else {
                                        throw Error('Stat Block Trait including Legendary Resistance must have parentheses surounding the number per day');
                                    }
                                }
                                else if (spaceSeperated.length == 2 && spaceSeperated[1] == 'Actions') {
                                    end = true;
                                    break;
                                }
                                break;
                            case '':
                                break;
                            default:

                                newRow = rowArray[j].split('.');
                                if (newRow.length <= 1 && !followingParagraph) {
                                    throw Error('Stat block Traits must follow the format of the trait name ending in a \'.\' followed by the trait description');
                                }

                                let candidateName = newRow[0].split(' ');
                                let isName = true;
                                //Iterate over all words in seperated by period
                                for (let k = 0; k < candidateName.length; k++) {
                                    //If the first letter is not uppercase, indicate it as not a trait name
                                    let letter = candidateName[k].at(0);

                                    if (letter == null || !isUpperCase(letter)) {
                                        isName = false;
                                        break;
                                    }
                                }
                                let descriptionJSX = [];
                                if (!isName && followingParagraph) {
                                    let index = traits.length - 1;
                                    traits[index][1] = traits[index][1] + rowArray[j];
                                }
                                else if (!isName) {
                                    throw Error('Stat block must have a trait name before a trait description');
                                }
                                else {
                                    traits.push([newRow[0], rowArray[j].replace(newRow[0], '').trim()]);
                                    descriptionJSX.push(<b>{newRow[0]}. </b>)
                                }

                                //Iterate over trait description to format JSX
                                let description = rowArray[j].replace(newRow[0], '').trim();
                                let descrParts = description.split('.');

                                //Iterate over description seperated by periods
                                for (let x = 0; x < descrParts.length; x++) {
                                    let unparsedDesc = '';
                                    if (descrParts[x].includes('Saving Throw: DC')) {
                                        //Find index of saving throw
                                        for (let k = 0; k < SAVINGTHROWS.length; k++) {
                                            if (descrParts[x].includes(SAVINGTHROWS[k] + ' Saving Throw:')) {
                                                descriptionJSX.push(<i>{SAVINGTHROWS[k] + ' Saving Throw:'}</i>);
                                                unparsedDesc = descrParts[x].replace(SAVINGTHROWS[k] + ' Saving Throw:', '') + '.';
                                            }
                                        }
                                    }
                                    else if (descrParts[x].includes('Failure or Success:')) {
                                        descriptionJSX.push(<i> Failure or Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure or Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Failure:')) {
                                        descriptionJSX.push(<i> Failure:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Success:')) {
                                        descriptionJSX.push(<i> Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Success:', '') + '.';
                                    }
                                    else {
                                        unparsedDesc = descrParts[x] + '.';
                                    }
                                    //Search for 
                                    const regex = new RegExp('(\d+d\d+)( (\+|\-)\d+)?');
                                    let match = unparsedDesc.match(regex);
                                    if (match && match.length > 0) {
                                        //Iterate over all matches of dice roll notations and add them as buttons to the JSX array
                                        for (let k = 0; k < match.length; k++) {
                                            let sides = unparsedDesc.split(match[k]);
                                            descriptionJSX.push(sides[0]);

                                            let rollAndMod = match[k].split(' ');
                                            let diceNums = rollAndMod[0].split('d');

                                            if (diceNums.length != 2 || Number(diceNums[0]) == null || Number(diceNums[1]) == null) {
                                                throw Error('Stat block parses dice notations incorrectly');
                                            }

                                            if (rollAndMod.length == 2) {
                                                if (Number(rollAndMod[1]) == null) {
                                                    throw Error('Stat block parses dice notations incorrectly');
                                                }

                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: Number(rollAndMod[1]),
                                                    operationType: 0
                                                };
                                            }
                                            else if (rollAndMod.length == 1) {
                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: 0,
                                                    operationType: 0
                                                };
                                            }

                                            unparsedDesc = sides[1];

                                            descriptionJSX.push(<Button>{match[k]}</Button>)
                                        }
                                    }
                                    //Place any leftover descriptions into the JSX array
                                    descriptionJSX.push(unparsedDesc);
                                }
                                traitJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                keyCount++;
                        }
                        j++;
                    }
                    jsx = jsx.concat(traitJSX);
                    i = j;
                }
                else if ((rowArray[i].split(' '))[0] == 'Actions') {
                    let end = false;
                    let j = i + 1;
                    let followingParagraph = false;
                    //Follows format of trait name, action description, 
                    let actions: any[] = [];
                    let actionJSX = [<h4 key={keyCount} className='sectionHeaderDND5E'><b>Actions</b></h4>];
                    keyCount++;
                    while (!end) {
                        //Check if new section or still inside action section
                        if (rowArray.length <= j) {
                            end = true;
                            break;
                        }

                        switch (rowArray[j].split(' ')[0]) {
                            case 'Traits':
                                end = true;
                                alert('Warning: Stat block Trait section is improperly placed after the Actions section');
                                break;
                            case 'Bonus':
                                end = true;
                                break;
                            case 'Reactions':
                                end = true;
                                break;
                            case 'Legendary':
                                end = true;
                                break;
                            case '':
                                break;
                            default:

                                newRow = rowArray[j].split('.');
                                if (newRow.length <= 1 && !followingParagraph) {
                                    throw Error('Stat block actions must follow the format of the action name ending in a \'.\' followed by the action description');
                                }

                                let candidateName = newRow[0].split(' ');
                                let isName = true;
                                let colonName = false;
                                //Iterate over all words in seperated by period
                                for (let k = 0; k < candidateName.length; k++) {
                                    //If the first letter is not uppercase, indicate it as not a action name
                                    let letter = candidateName[k].at(0);
                                    //Indicates is a resource
                                    if (letter == '(') {
                                        let resourceName = newRow[0].replace(candidateName[k], '').trim();
                                        let resourceMax = candidateName[k].replace('(', '').replace(')', '').trim().split('/');
                                        if (resourceMax.length == 2 && Number(resourceMax[0]) != null && Number.isInteger(Number(resourceMax[0]))) {
                                            resources.push(new Resource(resourceName, Number(resourceMax[0])));
                                            break;
                                        }
                                    }

                                    //For spell cantrips. May implement further logic when spells descriptions are implemented
                                    if (k == 0 && candidateName[k] == 'At' && candidateName.length > k + 1 && candidateName[k + 1] == 'Will:') {
                                        colonName = true;
                                    }

                                    //Indicates a pooled resource. Typically for spells
                                    if (k == 0 && Number(letter) != null && candidateName.length > k + 1 && candidateName[k + 1] == 'Each:') {
                                        let resourceParts = candidateName[k].split('/');
                                        if (resourceParts.length == 2 && Number(resourceParts[0]) != null && Number.isInteger(Number(resourceParts[0]))) {
                                            let name = rowArray[j].replace(candidateName[k] + ' Each:', '').trim();
                                            resources.push(new Resource(name, Number(resourceParts[0])));
                                            colonName = true;
                                        }
                                        else {
                                            throw Error('Stat block parsing detected Action that is limited per a unit of time but the format is not correct');
                                        }
                                        break;
                                    }

                                    if (letter == null || !isUpperCase(letter)) {
                                        isName = false;
                                        break;
                                    }
                                }

                                let descriptionJSX = [];
                                if (!isName && followingParagraph) {
                                    let index = actions.length - 1;
                                    actions[index][1] = actions[index][1] + rowArray[j];
                                }
                                else if (!isName) {
                                    throw Error('Stat block must have an action name before an action description');
                                }
                                else if (colonName) {
                                    let colonSection = rowArray[j].split(':');
                                    actions.push([colonSection[0], rowArray[j].replace(colonSection[0], '').trim()]);
                                    descriptionJSX.push(<b>{colonSection[0]}: </b>);
                                    actionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                    keyCount++;
                                    //Skip parsing for formatting dice rolls and bolds
                                    break;
                                }
                                else {
                                    actions.push([newRow[0], rowArray[j].replace(newRow[0], '').trim()]);
                                    descriptionJSX.push(<b>{newRow[0]}. </b>);
                                }

                                //Iterate over trait description to format JSX
                                let description = rowArray[j].replace(newRow[0], '').trim();
                                let descrParts = description.split('.');

                                //Iterate over description seperated by periods
                                for (let x = 0; x < descrParts.length; x++) {
                                    let unparsedDesc = '';
                                    if (descrParts[x].includes('Saving Throw: DC')) {
                                        //Find index of saving throw
                                        for (let k = 0; k < SAVINGTHROWS.length; k++) {
                                            if (descrParts[x].includes(SAVINGTHROWS[k] + ' Saving Throw:')) {
                                                descriptionJSX.push(<i>{SAVINGTHROWS[k] + ' Saving Throw:'}</i>);
                                                unparsedDesc = descrParts[x].replace(SAVINGTHROWS[k] + ' Saving Throw:', '') + '.';
                                            }
                                        }
                                    }
                                    else if (descrParts[x].includes('Failure or Success:')) {
                                        descriptionJSX.push(<i> Failure or Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure or Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Failure:')) {
                                        descriptionJSX.push(<i> Failure:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Success:')) {
                                        descriptionJSX.push(<i> Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Melee Attack Roll:')) {
                                        descriptionJSX.push(<i>Melee Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Melee Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '') + '.';
                                    }
                                    else if (descrParts[x].includes('Ranged Attack Roll:')) {
                                        descriptionJSX.push(<i>Ranged Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Ranged Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else if (descrParts[x].includes('Hit:')) {
                                        descriptionJSX.push(<i>Hit: </i>);
                                        let parts = descrParts[x].replace('Hit:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else {
                                        unparsedDesc = descrParts[x] + '.';
                                    }
                                    //Search for dice notation with regex
                                    const regex = new RegExp('(\d+d\d+)( (\+|\-)\d+)?');
                                    let match = unparsedDesc.match(regex);
                                    if (match && match.length > 0) {
                                        //Iterate over all matches of dice roll notations and add them as buttons to the JSX array
                                        for (let k = 0; k < match.length; k++) {
                                            let sides = unparsedDesc.split(match[k]);
                                            descriptionJSX.push(sides[0]);

                                            let rollAndMod = match[k].split(' ');
                                            let diceNums = rollAndMod[0].split('d');

                                            if (diceNums.length != 2 || Number(diceNums[0]) == null || Number(diceNums[1]) == null) {
                                                throw Error('Stat block parses dice notations incorrectly');
                                            }

                                            if (rollAndMod.length == 2) {
                                                if (Number(rollAndMod[1]) == null) {
                                                    throw Error('Stat block parses dice notations incorrectly');
                                                }

                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: Number(rollAndMod[1]),
                                                    operationType: 0
                                                };
                                            }
                                            else if (rollAndMod.length == 1) {
                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: 0,
                                                    operationType: 0
                                                };
                                            }

                                            unparsedDesc = sides[1];

                                            descriptionJSX.push(<Button>{match[k]}</Button>)
                                        }
                                    }
                                    //Place any leftover descriptions into the JSX array
                                    descriptionJSX.push(unparsedDesc);
                                }
                                actionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                keyCount++;
                        }
                        j++;
                    }
                    jsx = jsx.concat(actionJSX);
                    i = j;
                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Bonus' && newRow.length > 1 && newRow[1] == 'Actions') {
                    let end = false;
                    let j = i + 1;
                    let followingParagraph = false;
                    //Follows format of trait name, action description, 
                    let bActions: any[] = [];
                    let bActionJSX = [<h4 key={keyCount} className='sectionHeaderDND5E'><b>Bonus Actions</b></h4>];
                    keyCount++;
                    while (!end) {
                        //Check if new section or still inside action section
                        if (rowArray.length <= j) {
                            end = true;
                            break;
                        }

                        switch (rowArray[j].split(' ')[0]) {
                            case 'Traits':
                                end = true;
                                alert('Warning: Stat block Traits section is improperly placed after the Bonus Actions section');
                                break;
                            case 'Actions':
                                end = true;
                                alert('Warning: Stat block Actions section is improperly placed after the Bonus Actions section');
                                break;
                            case 'Reactions':
                                end = true;
                                break;
                            case 'Legendary':
                                end = true;
                                break;
                            case '':
                                break;
                            default:

                                newRow = rowArray[j].split('.');
                                if (newRow.length <= 1 && !followingParagraph) {
                                    throw Error('Stat block bonus actions must follow the format of the action name ending in a \'.\' followed by the bonus action description');
                                }

                                let candidateName = newRow[0].split(' ');
                                let isName = true;
                                let colonName = false;
                                //Iterate over all words in seperated by period
                                for (let k = 0; k < candidateName.length; k++) {
                                    //If the first letter is not uppercase, indicate it as not a action name
                                    let letter = candidateName[k].at(0);
                                    //Indicates is a resource
                                    if (letter == '(') {
                                        let resourceName = newRow[0].replace(candidateName[k], '').trim();
                                        let resourceMax = candidateName[k].replace('(', '').replace(')', '').trim().split('/');
                                        if (resourceMax.length == 2 && Number(resourceMax[0]) != null && Number.isInteger(Number(resourceMax[0]))) {
                                            resources.push(new Resource(resourceName, Number(resourceMax[0])));
                                            break;
                                        }
                                    }

                                    //For spell cantrips
                                    if (k == 0 && candidateName[k] == 'At' && candidateName.length > k + 1 && candidateName[k + 1] == 'Will:') {
                                        colonName = true;
                                    }

                                    //Indicates a pooled resource. Typically for spells
                                    if (k == 0 && Number(letter) != null && candidateName.length > k + 1 && candidateName[k + 1] == 'Each:') {
                                        let resourceParts = candidateName[k].split('/');
                                        if (resourceParts.length == 2 && Number(resourceParts[0]) != null && Number.isInteger(Number(resourceParts[0]))) {
                                            let name = rowArray[j].replace(candidateName[k] + ' Each:', '').trim();
                                            resources.push(new Resource(name, Number(resourceParts[0])));
                                        }
                                        else {
                                            throw Error('Stat block parsing detected Bonus Action that is limited per a unit of time but the format is not correct');
                                        }
                                        break;
                                    }

                                    if (letter == null || !isUpperCase(letter)) {
                                        isName = false;
                                        break;
                                    }
                                }

                                let descriptionJSX = [];
                                if (!isName && followingParagraph) {
                                    let index = bActions.length - 1;
                                    bActions[index][1] = bActions[index][1] + rowArray[j];
                                }
                                else if (!isName) {
                                    throw Error('Stat block must have a bonus action name before a bonus action description');
                                }
                                else if (colonName) {
                                    let colonSection = rowArray[j].split(':');
                                    bActions.push([colonSection[0], rowArray[j].replace(colonSection[0], '').trim()]);
                                    descriptionJSX.push(<b>{colonSection[0]}: </b>);
                                    bActionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                    keyCount++;
                                    //Skip parsing for formatting dice rolls and bolds
                                    break;
                                }
                                else {
                                    bActions.push([newRow[0], rowArray[j].replace(newRow[0], '').trim()]);
                                    descriptionJSX.push(<b>{newRow[0]}. </b>)
                                }

                                //Iterate over trait description to format JSX
                                let description = rowArray[j].replace(newRow[0], '').trim();
                                let descrParts = description.split('.');

                                //Iterate over description seperated by periods
                                for (let x = 0; x < descrParts.length; x++) {
                                    let unparsedDesc = '';
                                    if (descrParts[x].includes('Saving Throw: DC')) {
                                        //Find index of saving throw
                                        for (let k = 0; k < SAVINGTHROWS.length; k++) {
                                            if (descrParts[x].includes(SAVINGTHROWS[k] + ' Saving Throw:')) {
                                                descriptionJSX.push(<i>{SAVINGTHROWS[k] + ' Saving Throw:'}</i>);
                                                unparsedDesc = descrParts[x].replace(SAVINGTHROWS[k] + ' Saving Throw:', '') + '.';
                                            }
                                        }
                                    }
                                    else if (descrParts[x].includes('Failure or Success:')) {
                                        descriptionJSX.push(<i> Failure or Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure or Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Failure:')) {
                                        descriptionJSX.push(<i> Failure:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Success:')) {
                                        descriptionJSX.push(<i> Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Melee Attack Roll:')) {
                                        descriptionJSX.push(<i>Melee Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Melee Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '') + '.';
                                    }
                                    else if (descrParts[x].includes('Ranged Attack Roll:')) {
                                        descriptionJSX.push(<i>Ranged Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Ranged Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else if (descrParts[x].includes('Hit:')) {
                                        descriptionJSX.push(<i>Hit: </i>);
                                        let parts = descrParts[x].replace('Hit:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else {
                                        unparsedDesc = descrParts[x] + '.';
                                    }
                                    //Search for dice notation with regex
                                    const regex = new RegExp('(\d+d\d+)( (\+|\-)\d+)?');
                                    let match = unparsedDesc.match(regex);
                                    if (match && match.length > 0) {
                                        //Iterate over all matches of dice roll notations and add them as buttons to the JSX array
                                        for (let k = 0; k < match.length; k++) {
                                            let sides = unparsedDesc.split(match[k]);
                                            descriptionJSX.push(sides[0]);

                                            let rollAndMod = match[k].split(' ');
                                            let diceNums = rollAndMod[0].split('d');

                                            if (diceNums.length != 2 || Number(diceNums[0]) == null || Number(diceNums[1]) == null) {
                                                throw Error('Stat block parses dice notations incorrectly');
                                            }

                                            if (rollAndMod.length == 2) {
                                                if (Number(rollAndMod[1]) == null) {
                                                    throw Error('Stat block parses dice notations incorrectly');
                                                }

                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: Number(rollAndMod[1]),
                                                    operationType: 0
                                                };
                                            }
                                            else if (rollAndMod.length == 1) {
                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: 0,
                                                    operationType: 0
                                                };
                                            }

                                            unparsedDesc = sides[1];

                                            descriptionJSX.push(<Button>{match[k]}</Button>)
                                        }
                                    }
                                    //Place any leftover descriptions into the JSX array
                                    descriptionJSX.push(unparsedDesc);
                                }
                                bActionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                keyCount++;
                        }
                        j++;
                    }
                    jsx = jsx.concat(bActionJSX);
                    i = j;
                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Reactions') {
                    let end = false;
                    let j = i + 1;
                    let followingParagraph = false;
                    //Follows format of trait name, action description, 
                    let reactions: any[] = [];
                    let reactionJSX = [<h4 key={keyCount} className='sectionHeaderDND5E'><b>Bonus Actions</b></h4>];
                    keyCount++;
                    while (!end) {
                        //Check if new section or still inside action section
                        if (rowArray.length <= j) {
                            end = true;
                            break;
                        }

                        switch (rowArray[j].split(' ')[0]) {
                            case 'Traits':
                                end = true;
                                alert('Warning: Stat block Traits section is improperly placed after the Reactions section');
                                break;
                            case 'Actions':
                                end = true;
                                alert('Warning: Stat block Actions section is improperly placed after the Reactions section');
                                break;
                            case 'Bonus':
                                end = true;
                                alert('Warning: Stat block Bonus Action section is improperly placed after the Reactions section');
                                break;
                            case 'Legendary':
                                end = true;
                                break;
                            case '':
                                break;
                            default:

                                newRow = rowArray[j].split('.');
                                if (newRow.length <= 1 && !followingParagraph) {
                                    throw Error('Stat block reactions must follow the format of the reaction name ending in a \'.\' followed by the reaction description');
                                }

                                let candidateName = newRow[0].split(' ');
                                let isName = true;
                                let colonName = false;
                                //Iterate over all words in seperated by period
                                for (let k = 0; k < candidateName.length; k++) {
                                    //If the first letter is not uppercase, indicate it as not a action name
                                    let letter = candidateName[k].at(0);
                                    //Indicates is a resource. Not all parentheses are for resources
                                    if (letter == '(') {
                                        let resourceName = newRow[0].replace(candidateName[k], '').trim();
                                        let resourceMax = candidateName[k].replace('(', '').replace(')', '').trim().split('/');
                                        if (resourceMax.length == 2 && Number(resourceMax[0]) != null && Number.isInteger(Number(resourceMax[0]))) {
                                            resources.push(new Resource(resourceName, Number(resourceMax[0])));
                                            break;
                                        }
                                    }

                                    //For spell cantrips
                                    if (k == 0 && candidateName[k] == 'At' && candidateName.length > k + 1 && candidateName[k + 1] == 'Will:') {
                                        colonName = true;
                                    }

                                    //Indicates a pooled resource. Typically for spells
                                    if (k == 0 && Number(letter) != null && candidateName.length > k + 1 && candidateName[k + 1] == 'Each:') {
                                        let resourceParts = candidateName[k].split('/');
                                        if (resourceParts.length == 2 && Number(resourceParts[0]) != null && Number.isInteger(Number(resourceParts[0]))) {
                                            let name = rowArray[j].replace(candidateName[k] + ' Each:', '').trim();
                                            resources.push(new Resource(name, Number(resourceParts[0])));
                                        }
                                        else {
                                            throw Error('Stat block parsing detected Reaction that is limited per a unit of time but the format is not correct');
                                        }
                                        break;
                                    }

                                    if (letter == null || !isUpperCase(letter)) {
                                        isName = false;
                                        break;
                                    }
                                }

                                let descriptionJSX = [];
                                if (!isName && followingParagraph) {
                                    let index = reactions.length - 1;
                                    reactions[index][1] = reactions[index][1] + rowArray[j];
                                }
                                else if (!isName) {
                                    throw Error('Stat block reactions must have a reaction name before a reaction description');
                                }
                                else if (colonName) {
                                    let colonSection = rowArray[j].split(':');
                                    reactions.push([colonSection[0], rowArray[j].replace(colonSection[0], '').trim()]);
                                    descriptionJSX.push(<b>{colonSection[0]}: </b>);
                                    reactionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                    keyCount++;
                                    //Skip parsing for formatting dice rolls and bolds
                                    break;
                                }
                                else {
                                    reactions.push([newRow[0], rowArray[j].replace(newRow[0], '').trim()]);
                                    descriptionJSX.push(<b>{newRow[0]}. </b>)
                                }

                                //Iterate over trait description to format JSX
                                let description = rowArray[j].replace(newRow[0], '').trim();
                                let descrParts = description.split('.');

                                //Iterate over description seperated by periods
                                for (let x = 0; x < descrParts.length; x++) {
                                    let unparsedDesc = '';
                                    if (descrParts[x].includes('Saving Throw: DC')) {
                                        //Find index of saving throw
                                        for (let k = 0; k < SAVINGTHROWS.length; k++) {
                                            if (descrParts[x].includes(SAVINGTHROWS[k] + ' Saving Throw:')) {
                                                descriptionJSX.push(<i>{SAVINGTHROWS[k] + ' Saving Throw:'}</i>);
                                                unparsedDesc = descrParts[x].replace(SAVINGTHROWS[k] + ' Saving Throw:', '') + '.';
                                            }
                                        }
                                    }
                                    else if (descrParts[x].includes('Failure or Success:')) {
                                        descriptionJSX.push(<i> Failure or Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure or Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Failure:')) {
                                        descriptionJSX.push(<i> Failure:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Success:')) {
                                        descriptionJSX.push(<i> Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Melee Attack Roll:')) {
                                        descriptionJSX.push(<i>Melee Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Melee Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '') + '.';
                                    }
                                    else if (descrParts[x].includes('Ranged Attack Roll:')) {
                                        descriptionJSX.push(<i>Ranged Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Ranged Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else if (descrParts[x].includes('Hit:')) {
                                        descriptionJSX.push(<i>Hit: </i>);
                                        let parts = descrParts[x].replace('Hit:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else {
                                        unparsedDesc = descrParts[x] + '.';
                                    }
                                    //Search for dice notation with regex
                                    const regex = new RegExp('(\d+d\d+)( (\+|\-)\d+)?');
                                    let match = unparsedDesc.match(regex);
                                    if (match && match.length > 0) {
                                        //Iterate over all matches of dice roll notations and add them as buttons to the JSX array
                                        for (let k = 0; k < match.length; k++) {
                                            let sides = unparsedDesc.split(match[k]);
                                            descriptionJSX.push(sides[0]);

                                            let rollAndMod = match[k].split(' ');
                                            let diceNums = rollAndMod[0].split('d');

                                            if (diceNums.length != 2 || Number(diceNums[0]) == null || Number(diceNums[1]) == null) {
                                                throw Error('Stat block parses dice notations incorrectly');
                                            }

                                            if (rollAndMod.length == 2) {
                                                if (Number(rollAndMod[1]) == null) {
                                                    throw Error('Stat block parses dice notations incorrectly');
                                                }

                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: Number(rollAndMod[1]),
                                                    operationType: 0
                                                };
                                            }
                                            else if (rollAndMod.length == 1) {
                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: 0,
                                                    operationType: 0
                                                };
                                            }

                                            unparsedDesc = sides[1];

                                            descriptionJSX.push(<Button>{match[k]}</Button>)
                                        }
                                    }
                                    //Place any leftover descriptions into the JSX array
                                    descriptionJSX.push(unparsedDesc);
                                }
                                reactionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                keyCount++;
                        }
                        j++;
                    }
                    jsx = jsx.concat(reactionJSX);
                    i = j;
                }
                else if (rowArray[i].split(' ')[0] == 'Legendary' && newRow.length > 1 && newRow[1] == 'Actions') {
                    let end = false;
                    let j = i + 1;
                    let followingParagraph = false;
                    //Follows format of trait name, action description, 
                    let legActions: any[] = [];
                    let legActionJSX = [<h4 key={keyCount} className='sectionHeaderDND5E'><b>Bonus Actions</b></h4>];
                    keyCount++;
                    if (j >= rowArray.length) {
                        throw Error('Stat block contains Legendary Actions section header but has no further action names or descriptions');
                    }
                    newRow = rowArray[j].split('.');
                    if (newRow[0].includes('Legendary Action Uses:')) {
                        let legendRes = newRow[0];
                        let resResource = legendRes.split('(');
                        if (resResource.length == 2) {
                            legendRes = resResource[1].replace(')', '').trim();
                            resResource = legendRes.split(', or ');
                            if (resResource.length == 1) {
                                let parts = resResource[0].split('/');
                                if (parts.length == 2) {
                                    if (Number(parts[0]) == null || !Number.isInteger(Number(parts[0]))) {
                                        throw Error('Stat block Legendary Resistance value must be a positive integer');
                                    }
                                    resources.push(new Resource('Legendary Resistance', Number(parts[0])));
                                    traits.push(['Legendary Resistance', [resources.length - 1, parts[1]], [-1, '']]);
                                }
                                else {
                                    throw Error('Stat block Legendary Resistances amount indicated must be in format of positive integer value followed by \'/\' and the recharge unit of time');
                                }
                            }
                            else if (resResource.length == 2) {
                                let parts = resResource[0].split('/');
                                let lairParts = resResource[1].split('/');

                                if (parts.length == 2) {
                                    if (Number(parts[0]) == null || !Number.isInteger(Number(parts[0]))) {
                                        throw Error('Stat block Legendary Resistance value must be a positive integer');
                                    }
                                    resources.push(new Resource('Legendary Resistance', Number(parts[0])));

                                }
                                else {
                                    throw Error('Stat block Legendary Resistances amount indicated must be in format of positive integer value followed by \'/\' and the recharge unit of time');
                                }

                                if (lairParts.length != 2) {
                                    throw Error('Stat block Legendary Resistance value must include a \'/\' to seperate the number of legendary actions and the time to reset');
                                }
                                let lairReset = lairParts[1].split(' ');

                                if (lairReset.length != 3 || lairReset[1] != 'in' || lairReset[2].toLowerCase() != 'lair') {
                                    throw Error('Stat block Legendary Resistance for within a lair must include the value sperated by a \'/\', the recharge unit of time, and \'in Lair\'');
                                }

                                if (Number(lairParts[0]) == null || !Number.isInteger(Number(lairParts[0]))) {
                                    throw Error('Stat block Legendary Resistance value must be a positive integer');
                                }

                                resources.push(new Resource('Legendary Resistance (Lair)', Number(lairParts[0])));

                                traits.push(['Legendary Resistance', [resources.length - 2, parts[1]], [resources.length - 1, lairReset[0]]]);
                            }
                            else {
                                throw Error('Stat block Legendary Resistances can only indicate the number of resistances with and without a lair');
                            }
                            traitJSX.push(<p key={keyCount}><b>Legendary Resistance</b> {rowArray[j].replace('Legendary Resistance', '').trim()}</p>);
                            keyCount++;
                        }
                        else {
                            throw Error('Stat Block Trait including Legendary Resistance must have parentheses surounding the number per day');
                        }
                    }


                    while (!end) {
                        //Check if new section or still inside action section
                        if (rowArray.length <= j) {
                            end = true;
                            break;
                        }

                        switch (rowArray[j].split(' ')[0]) {
                            case 'Traits':
                                end = true;
                                alert('Warning: Stat block Traits section is improperly placed after the Legendary Actions section');
                                break;
                            case 'Actions':
                                end = true;
                                alert('Warning: Stat block Actions section is improperly placed after the Legendary Actions section');
                                break;
                            case 'Bonus':
                                end = true;
                                alert('Warning: Stat block Bonus Actions section is improperly placed after the Legendary Actions section');
                                break;
                            case 'Reactions':
                                end = true;
                                alert('Warning: Stat block Reactions section is improperly placed after the Legendary Actions section');
                                break;
                            case '':
                                break;
                            default:

                                newRow = rowArray[j].split('.');
                                if (newRow.length <= 1 && !followingParagraph) {
                                    throw Error('Stat block reactions must follow the format of the reaction name ending in a \'.\' followed by the reaction description');
                                }

                                let candidateName = newRow[0].split(' ');
                                let isName = true;
                                let colonName = false;
                                //Iterate over all words in seperated by period
                                for (let k = 0; k < candidateName.length; k++) {
                                    //If the first letter is not uppercase, indicate it as not a action name
                                    let letter = candidateName[k].at(0);
                                    //Indicates is a resource
                                    if (letter == '(') {
                                        let resourceName = newRow[0].replace(candidateName[k], '').trim();
                                        let resourceMax = candidateName[k].replace('(', '').replace(')', '').trim().split('/');
                                        if (resourceMax.length == 2 && Number(resourceMax[0]) != null && Number.isInteger(Number(resourceMax[0]))) {
                                            resources.push(new Resource(resourceName, Number(resourceMax[0])));
                                        }
                                        else {
                                            throw Error('Stat block found reaction resource but positive integer number per unit of time is not formatted correctly');
                                        }

                                        break;
                                    }

                                    //For spell cantrips
                                    if (k == 0 && candidateName[k] == 'At' && candidateName.length > k + 1 && candidateName[k + 1] == 'Will:') {
                                        colonName = true;
                                    }

                                    //Indicates a pooled resource. Typically for spells
                                    if (k == 0 && Number(letter) != null && candidateName.length > k + 1 && candidateName[k + 1] == 'Each:') {
                                        let resourceParts = candidateName[k].split('/');
                                        if (resourceParts.length == 2 && Number(resourceParts[0]) != null && Number.isInteger(Number(resourceParts[0]))) {
                                            let name = rowArray[j].replace(candidateName[k] + ' Each:', '').trim();
                                            resources.push(new Resource(name, Number(resourceParts[0])));
                                        }
                                        else {
                                            throw Error('Stat block parsing detected Reaction that is limited per a unit of time but the format is not correct');
                                        }
                                        break;
                                    }

                                    if (letter == null || !isUpperCase(letter)) {
                                        isName = false;
                                        break;
                                    }
                                }

                                let descriptionJSX = [];
                                if (!isName && followingParagraph) {
                                    let index = legActions.length - 1;
                                    legActions[index][1] = legActions[index][1] + rowArray[j];
                                }
                                else if (!isName) {
                                    throw Error('Stat block reactions must have a reaction name before a reaction description');
                                }
                                else if (colonName) {
                                    let colonSection = rowArray[j].split(':');
                                    legActions.push([colonSection[0], rowArray[j].replace(colonSection[0], '').trim()]);
                                    descriptionJSX.push(<b>{colonSection[0]}: </b>);
                                    legActionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                    keyCount++;
                                    //Skip parsing for formatting dice rolls and bolds
                                    break;
                                }
                                else {
                                    legActions.push([newRow[0], rowArray[j].replace(newRow[0], '').trim()]);
                                    descriptionJSX.push(<b>{newRow[0]}. </b>)
                                }

                                //Iterate over trait description to format JSX
                                let description = rowArray[j].replace(newRow[0], '').trim();
                                let descrParts = description.split('.');

                                //Iterate over description seperated by periods
                                for (let x = 0; x < descrParts.length; x++) {
                                    let unparsedDesc = '';
                                    if (descrParts[x].includes('Saving Throw: DC')) {
                                        //Find index of saving throw
                                        for (let k = 0; k < SAVINGTHROWS.length; k++) {
                                            if (descrParts[x].includes(SAVINGTHROWS[k] + ' Saving Throw:')) {
                                                descriptionJSX.push(<i>{SAVINGTHROWS[k] + ' Saving Throw:'}</i>);
                                                unparsedDesc = descrParts[x].replace(SAVINGTHROWS[k] + ' Saving Throw:', '') + '.';
                                            }
                                        }
                                    }
                                    else if (descrParts[x].includes('Failure or Success:')) {
                                        descriptionJSX.push(<i> Failure or Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure or Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Failure:')) {
                                        descriptionJSX.push(<i> Failure:</i>);
                                        unparsedDesc = descrParts[x].replace('Failure:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Success:')) {
                                        descriptionJSX.push(<i> Success:</i>);
                                        unparsedDesc = descrParts[x].replace('Success:', '') + '.';
                                    }
                                    else if (descrParts[x].includes('Melee Attack Roll:')) {
                                        descriptionJSX.push(<i>Melee Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Melee Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '') + '.';
                                    }
                                    else if (descrParts[x].includes('Ranged Attack Roll:')) {
                                        descriptionJSX.push(<i>Ranged Attack Roll: </i>);
                                        let parts = descrParts[x].replace('Ranged Attack Roll:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else if (descrParts[x].includes('Hit:')) {
                                        descriptionJSX.push(<i>Hit: </i>);
                                        let parts = descrParts[x].replace('Hit:', '').trim().split(',');
                                        if (Number(parts[0]) != null && Number.isInteger(Number(parts[0]))) {
                                            let myDice: Dice = {
                                                diceFace: 20, numDice: 1, valMethod: 0, staticMod: Number(parts[0]),
                                                operationType: 0
                                            };
                                            descriptionJSX.push(<Button>{parts[0]}</Button>);
                                        }
                                        else {
                                            throw Error('Stat Block detects a Melee Attack Roll but does not contain a hit modifier');
                                        }
                                        unparsedDesc = descrParts[x].replace('Melee Attack Roll: ' + parts[0], '');
                                    }
                                    else {
                                        unparsedDesc = descrParts[x] + '.';
                                    }
                                    //Search for dice notation with regex
                                    const regex = new RegExp('(\d+d\d+)( (\+|\-)\d+)?');
                                    let match = unparsedDesc.match(regex);
                                    if (match && match.length > 0) {
                                        //Iterate over all matches of dice roll notations and add them as buttons to the JSX array
                                        for (let k = 0; k < match.length; k++) {
                                            let sides = unparsedDesc.split(match[k]);
                                            descriptionJSX.push(sides[0]);

                                            let rollAndMod = match[k].split(' ');
                                            let diceNums = rollAndMod[0].split('d');

                                            if (diceNums.length != 2 || Number(diceNums[0]) == null || Number(diceNums[1]) == null) {
                                                throw Error('Stat block parses dice notations incorrectly');
                                            }

                                            if (rollAndMod.length == 2) {
                                                if (Number(rollAndMod[1]) == null) {
                                                    throw Error('Stat block parses dice notations incorrectly');
                                                }

                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: Number(rollAndMod[1]),
                                                    operationType: 0
                                                };
                                            }
                                            else if (rollAndMod.length == 1) {
                                                let myDice: Dice = {
                                                    diceFace: Number(diceNums[1]), numDice: Number(diceNums[0]), valMethod: 0, staticMod: 0,
                                                    operationType: 0
                                                };
                                            }

                                            unparsedDesc = sides[1];

                                            descriptionJSX.push(<Button>{match[k]}</Button>)
                                        }
                                    }
                                    //Place any leftover descriptions into the JSX array
                                    descriptionJSX.push(unparsedDesc);
                                }
                                legActionJSX.push(<p key={keyCount}>{descriptionJSX}</p>);
                                keyCount++;
                        }
                        j++;
                    }
                    jsx = jsx.concat(legActionJSX);
                    i = j;
                }
            }

        }
        //2014 version
        else {
            throw Error('2014 stat block parsing not available');
        }
    }
}

function isUpperCase(letter: string): boolean {
    if (letter.length != 1 || letter !== letter.toUpperCase() || letter === letter.toLowerCase()) {
        return false;
    }
    return true;
}