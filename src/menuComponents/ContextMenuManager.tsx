export class ContextMenuManager {
    //Boolean for whether context menu should be exited on a left click
    private contextMenuExit: boolean = true;

    //Boolean for whether the current selection is selecting multiple canvas objects
    private multiSelection: boolean = false;

    //Boolean for whether the delete key is able to delete the selected Tokens
    private deleteKeyValid: boolean = true;

    constructor()
    {
        this.contextMenuExit = true;
        this.multiSelection = false;
    }

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

    public getContextMenuExit(): boolean {
        return this.contextMenuExit;
    }

    public getMultiSelectionBool(): boolean {
        return this.multiSelection;
    }

    public setMultiSelectionBool(status: boolean): boolean {
        if (status == null) {
            return false;
        }
        this.multiSelection = status;
        return true;
    }

    public setContextMenuExit(status: boolean): boolean {
        if (status == null) {
            return false;
        }
        this.contextMenuExit = status;
        return true;
    }

    public getDeleteValid(): boolean {
        return this.deleteKeyValid;
    }

    public setDeleteValid(status: boolean): boolean {
        if(status == null)
        {
            return false;
        }
        this.deleteKeyValid = status;
        return true;
    }
}