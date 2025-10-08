import { Resource } from "../tokenComponents/Resource";
import type { Token } from "../tokenComponents/Token";
import TabletopRoleplayingGame from "./TabletopRoleplayingGame";
import { DiceRoll, type Dice } from "../DiceRollComponents/DiceRoll";
import { Button, Table } from "@chakra-ui/react";

const ABILITYSCORENAMES = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'];

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
        let stats = [];
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

            if(!Number.isInteger(Number(newRow[1])) || !Number.isInteger(Number(newRow[3])))
            {
                throw Error('Stat block text contains a non-integer Armor Class or Intiative value');
            }

            stats.push(['AC', Number(newRow[1])]);

            let staticMod = Number(newRow[3]);
            let myDice: Dice = {
                diceFace: 20, numDice: 1, valMethod: 0, staticMod: staticMod,
                operationType: 0
            };
            stats.push(['Initiative', new DiceRoll([myDice]), 10 + staticMod]);
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

            if(!Number.isInteger(Number(staticHP[1])))
            {
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

            if(!Number.isInteger(Number(diceNotation[0])) || !Number.isInteger(Number(diceNotation[1])))
            {
                throw Error('Stat block HP dice notation contains non-integer numbers');
            }

            if (rollVals.length == 3) {
                if (Number(rollVals[2]) == null) {
                    throw Error('Stat block does not contain numbers at the HP dice modifier');
                }

                if(!Number.isInteger(Number(rollVals[2])))
                {
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

            stats.push(['HP', new DiceRoll([myDice]), Number(staticHP[1].trim())]);
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
                if(!Number.isInteger(Number(speedLine[1])))
                {
                    throw Error('Stat block contains a non-integer speed value');
                }

                let standardMeasurement = false;
                for(let j = 0; j < UNITMEASUREMENTS.length; j++)
                {
                    if(speedLine[2] == UNITMEASUREMENTS[j])
                    {
                        standardMeasurement = true;
                        break;
                    }
                }
                if(!standardMeasurement && !confirm('Speed is using ' + speedLine[2] + ' which is a non-standard unit of measurement. Do you want to proceed to use this measurement?'))
                {
                    throw Error('Stat block Speed uses a non-standard unit of measurement');
                }

                stats.push([speedLine[0], Number(speedLine[1]), speedLine[2]]);
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

                if(!Number.isInteger(Number(newRow[1])) || !Number.isInteger(Number(newRow[2])) || !Number.isInteger(Number(newRow[3])))
                {
                    let ability = ABILITYSCORENAMES[i - 10];
                    if (i > 13) {
                        ability = ABILITYSCORENAMES[i - 11];
                    }
                    throw Error('Stat block ' + ability + ' contains a non-integer value');
                }

                if(Number(newRow[1]) < 0)
                {
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
                stats.push([newRow[0], Number(newRow[1]), myDice, myDice2]);
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
                            throw Error('Stat Block Skills are not formatted correctly');
                        }

                        if (Number(skill[1]) == null) {
                            throw Error('Stat Block Skills must include a modifier');
                        }

                        if(!Number.isInteger(Number(skill[1])))
                        {
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

                    stats.push(['Skills', skillArray]);
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
                        stats.push(['Vulnerabilities', vulnArray]);
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
                        stats.push(['Vulnerabilities', resArray]);
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
                            stats.push(['Damage Immunities', damageImmune.concat(customImmunities)]);
                        }
                        else if (immuneType == 1) {
                            stats.push(['Condition Immunities', conditionImmune.concat(customImmunities)]);
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
                                stats.push(['Damage Immunities', rightCustom]);
                                stats.push(['Condition Immunities', leftCustom]);
                                alert('Warning: Stat Block Immunities section has a non-standard ordering of conditions,\';\', and damage types');
                                jsx.push(<div key={keyCount}><p><b>Immunities</b> {newRow[0]};{newRow[1]}</p></div>)
                                keyCount++;
                            }
                            //Do not switch sides
                            else if (!invalid) {
                                stats.push(['Damage Immunities', leftCustom]);
                                stats.push(['Condition Immunities', rightCustom]);
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
                            stats.push(['Damage Immunities', damageImmune.concat(leftCustom)]);
                            stats.push(['Condition Immunities', conditionImmune.concat(rightCustom)]);
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
                    for(let j = 0; j < newRow.length; j++)
                    {
                        let sense = newRow[j].split(' ');
                        if(sense.length == 3)
                        {
                            if(sense[1] == 'Perception' && sense[0] == 'Passive')
                            {
                                if(Number(sense[2]) == null)
                                {
                                    throw Error('Stat Block senses contains a Passive Perception without a valid value');
                                }
                                else if(Number(sense[2]) < 0)
                                {
                                    throw Error('Stat Block senses contains a Passive Perception with an invalid negative value');
                                }
                                else if(!Number.isInteger(sense[2]))
                                {
                                    throw Error('Stat Block senses contains a Passive Perception with an invalid non-integer value');
                                }
                                else
                                {
                                    senseArray.push(['Passive Perception', Number(sense[2])]);
                                }
                            }
                            else if(Number(sense[1]) != null && !Number.isInteger(Number(sense[1])))
                            {
                                throw Error('A sense in the stat block contains an invalid non-integer value');
                            }
                            else if(Number(sense[1]) != null && Number(sense[1]) > 0)
                            {
                                let localSense = false;
                                let localMeasurement = false;
                                //Check if any custom senses are included
                                for(let k = 0; k < SENSES.length; k++)
                                {
                                    if(SENSES[k] == sense[0])
                                    {
                                        localSense = true;
                                        break;
                                    }
                                }

                                //Set overall boolean to indicate to user all at once if there are custom senses
                                if(!localSense && standardSenses)
                                {
                                    standardSenses = false;
                                }

                                for(let k = 0; k < UNITMEASUREMENTS.length; k++)
                                {
                                    if(UNITMEASUREMENTS[k] == sense[2])
                                    {
                                        localMeasurement = true;
                                        break;
                                    }
                                }

                                //Set overall boolean to indicate to user all at once if there are custom measurements
                                if(!localMeasurement && standardMeasurement)
                                {
                                    standardMeasurement = false;
                                }

                                senseArray.push([sense[0], Number(sense[1]), sense[2]]);
                            }
                            else
                            {
                                throw Error('A sense in the stat block is not formatted correctly with the sense, distance, and unit of measurement');
                            }
                        }
                        else
                        {
                            throw Error('Stat Block Senses section contains a sense that is not \'Passive Perception\' with a number or a sense with a distance and unit of measurement');
                        }
                    }

                    //Custom senses were detected check if it was intentional and should be included
                    if(!standardSenses && !confirm('Stat block Senses section contains custom senses. Proceed with using these senses?'))
                    {
                        throw Error('Stat block contains custom senses are not used');
                    }

                    if(!standardMeasurement && !confirm('Stat block Senses section contains senses with custom units of measurement. Proceed with using these measurements?'))
                    {
                        throw Error('Stat block contains custom unit measures that are not used');
                    }

                    jsx.push(<div key={keyCount}><p><b>Senses</b> {rowArray[i].replace('Senses', '').trim()}</p></div>);
                    stats.push(['Senses', senseArray]);
                    keyCount++;

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Languages') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'CR') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Traits') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Actions') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Bonus' && newRow.length > 1 && newRow[1] == 'Actions') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Reactions') {

                }
                else if ((newRow = rowArray[i].split(' '))[0] == 'Legendary' && newRow.length > 1 && newRow[1] == 'Actions') {

                }
            }

        }
        //2014 version
        else {
            throw Error('2014 stat block parsing not available');
        }
    }
}