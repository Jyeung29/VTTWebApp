export function setActivePane(event: MouseEvent)
{
    var pane;
    var parent;
    //Check whether selected pane has the correct classNames
    if(event.button == 0 && (pane = event.target) != null && pane instanceof HTMLElement && 
        pane.className == 'paneHeader' && (parent = pane.parentElement) instanceof HTMLElement
    && parent.className.includes('dragPane'))
    {
        //Change the pane's className from paneHeader to isDragging to change color 
        pane.className = pane.className.replace("paneHeader","isDragging");

        //Store pane's left and top offset
        var l = parent.offsetLeft;
        var t = parent.offsetTop;

        //Store the cursor's initial x and y when mouse was pressed
        var startX = event.pageX;
        var startY = event.pageY;

        //Function definition called when moving the pane while primary mouse button is down
        const drag = (dragEvent: MouseEvent) => {
            //Confirm that pane heading and parent div is valid
            if(pane && pane instanceof HTMLElement
                && (pane.className.includes('paneHeader') || pane.className.includes('isDragging'))
                 && parent && parent instanceof HTMLElement
                && parent.className.includes('dragPane')
            )
            {
                //Move entire pane according to where the cursor is hovering over.
                //Calculate left and right offset
                let newLeft = l + (dragEvent.pageX - startX);
                let newTop = t + (dragEvent.pageY - startY);

                //Calculate max top and left offset based on pane's size
                const maxTopValue = window.innerHeight - parent.offsetHeight;
                const maxLeftValue = window.innerWidth - parent.offsetWidth;

                //Change offsets to 0 if any are negative
                if(newLeft < 0) newLeft = 0;
                if(newTop < 0) newTop = 0;

                //Set offsets to either the new offset or the max offset value
                parent.style.left = `${Math.min(newLeft, maxLeftValue)}px`;
                parent.style.top = `${Math.min(newTop, maxTopValue)}px`;
            }
        }
        //Listen for when mouse moves to start dragging
        document.addEventListener('mousemove', drag);

        //Function definition called when primary mouse button no longer pressed. Remove previous
        //pane event listeners
        const mouseUp = (event:MouseEvent) => {
            if(event.button == 0)
            {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', mouseUp);
                //Change the pane header's className back to 'paneHeader' which reverts CSS
                if(pane && pane instanceof HTMLElement && pane.className.includes('isDragging'))
                pane.className = pane.className.replace('isDragging', 'paneHeader');
            }
        }
        //Listen for when primary mouse button no longer pressed
        document.addEventListener('mouseup', mouseUp);
    }
}