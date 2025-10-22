import { DungeonsNDragons5E } from "./TTRPGComponents/DungeonsNDragons5E";
import type TabletopRoleplayingGame from "./TTRPGComponents/TabletopRoleplayingGame";

export class Factory {

    public getLinkAndID(link:string): [string,string]
    {
        let id: string;
        if(link.trim() != '')
        {
            //console.log(link);
            if(link.includes('https://1drv.ms/i/c/'))
            {
                id = link.replace('https://1drv.ms/i/c/', '');
                id = id.split('/')[0];
            }
            else if(link.includes('src/DefaultImages/'))
            {
                let split = link.split('src/DefaultImages/');
                id = split[1];
            }
            else
            {
                return ['',''];
            }
            return [id, link];
        }
        return ['',''];
    }
    
    public createTabletopRoleplayingGameSystem(id:number){
        switch(id){
            case 0: 
                return new DungeonsNDragons5E;
            default:
                return null;
        }
    }
}

export const systems = [
    {label: 'Dungeons and Dragons 5th Edition', value:'0'}
];

/*Array of link schemas used in the ImageLinkFactory. First index indicates the drive service such as 
OneDrive or GoogleDrive. Second index indicates values where 0: substrings to identify the service,
1: substring to add before the id, 2: substring to add after the id.
*/
const linkSchemes = [[['https://1drv.ms/i/c/'], 'https://1drv.ms/i/c/', '']
];

