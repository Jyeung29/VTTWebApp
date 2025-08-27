import {Group} from 'fabric';

//Class ContextMenuManager is a class that contains data that determines the state of the
// ContextMenu component and is manipulated by various components such as the Toolbar and Board.
export class ContextMenuManager {
    
    //Boolean for whether context menu should be exited on a left click
    private contextMenuExit: boolean = true;

    //Boolean for whether the current selection is selecting multiple canvas objects
    private multiSelection: boolean = false;

    //Boolean for whether the delete key is able to delete the selected Tokens
    private deleteKeyValid: boolean = true;

    //Boolean for whether the context menu is currently displayed
    private visible: boolean = false;

    constructor()
    {
        this.contextMenuExit = true;
        this.multiSelection = false;
    }

    //Update the position of the ContextMenu while preventing it from going beyond the screen
    public updateContextMenuPosition(event: Event): boolean {
        var contextMenu = document.querySelector(".ContextMenu");

        if (contextMenu && event.type == 'contextmenu') {
            contextMenu.style.display = "flex";
            const maxTopValue = window.innerHeight - contextMenu.offsetHeight;
            const maxLeftValue = window.innerWidth - contextMenu.offsetWidth;
            contextMenu.style.left = `${Math.min(event.x, maxLeftValue)}px`;
            contextMenu.style.top = `${Math.min(event.y, maxTopValue)}px`;
            return true;
        }
        return false;
    }

    //Gets boolean of whether context menu is visible
    public getVisible(): boolean {
        return this.visible;
    }

    //Sets whether the context menu is visible
    public setVisible(vis: boolean): boolean {
        if(vis != null)
        {
            this.visible = vis;
            return true;
        }
        return false;
    }

    //Gets whether the ContextMenu can be exited
    public getContextMenuExit(): boolean {
        return this.contextMenuExit;
    }

    //Get the current multiSelection boolean
    public getMultiSelectionBool(): boolean {
        return this.multiSelection;
    }

    //Sets whether the current selection is a multi-selection
    public setMultiSelectionBool(status: boolean): boolean {
        if (status == null) {
            return false;
        }
        this.multiSelection = status;
        return true;
    }

    //Sets whether ContextMenu can be exited
    public setContextMenuExit(status: boolean): boolean {
        if (status == null) {
            return false;
        }
        this.contextMenuExit = status;
        return true;
    }

    //Indicates whether delete key can be pressed to delete an object
    public getDeleteValid(): boolean {
        return this.deleteKeyValid;
    }

    //Sets deleteKeyValid to given boolean
    public setDeleteValid(status: boolean): boolean {
        if(status == null)
        {
            return false;
        }
        this.deleteKeyValid = status;
        return true;
    }
}

