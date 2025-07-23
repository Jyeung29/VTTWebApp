import './Toolbar.css';
import { FabricImage, Rect, Canvas, Circle, Group, LayoutManager, FixedLayout, type TCornerPoint,
  Line
} from "fabric";
import {Token} from './Token';

function Toolbar({canvas}) {
  const features = [];
  var mapAdded = false;

  const addShape = () => {
      const circle = new Circle({
        objectCaching: true, radius: 300, originX: 'center', originY: 'center', lockRotation: true,
        lockSkewingX: true, lockSkewingY: true, lockScalingFlip: true, lockScalingY: true, lockScalingX: true,
        fill: 'rgba(227, 6, 6, 0.67)'});
      canvas.add(circle);
      canvas.centerObject(circle);
  }

  const addImage = () => {
    if(canvas && !mapAdded)
    {
      mapAdded = true;
      const image = document.createElement('img');
      const source = document.createElement('source');
      image.id = 'testMap';

      //Set image URL source
      image.appendChild(source);
      image.src = 'https://content.encounterkit.com/cdn-cgi/image/width=1920,quality=75,format=auto/https://content.encounterkit.com/map/preview/5209421a3a339713f582dadc92ba9488.webp';
      
      //Make sure image loads before adding to Canvas
      image.onload = function() {
        const mapEl = new FabricImage(image);

        //Scale image for battle map to fit in window as large as possible with some padding
        if(mapEl.height >= mapEl.width && canvas.getHeight() < mapEl.height)
        {
          mapEl.scaleToHeight(canvas.getHeight() - 50);
        }else if(mapEl.width > mapEl.height && canvas.getWidth() < mapEl.width)
        {
          mapEl.scaleToWidth(canvas.getWidth() - 50);
        }
        mapEl.set({
          hoverCursor: 'default',
          hasBorder: false,
          hasControls: false,
          selectable: false
        });
        
        canvas.add(mapEl);
        canvas.sendObjectToBack(mapEl);
        canvas.centerObject(mapEl);
      };
    }
  }

  const addToken = () => {
    if(canvas)
    {
      const image = document.createElement('img');
      const source = document.createElement('source');
      image.src = 'https://www.dndbeyond.com/avatars/thumbnails/6/365/420/618/636272701937419552.png';
      
      //Make sure image loads before loading to Canvas
      image.onload = function() {
        image.appendChild(source);
        const tokenEl = new Token(image);

        //Calculate Largest Radius Fitting in Image with Padding
        let newRadius: number;
        if(tokenEl.width >= tokenEl.height)
        {
          newRadius = tokenEl.height / 4;
        }
        else
        {
          newRadius = tokenEl.width / 4;
        }

        //Clipping Token Image into a circle
        tokenEl.set({dirty: true, selection: true,
          clipPath: new Circle({objectCaching: false, radius: newRadius, originX: 'center', originY: 'center', })});
        
        //Circle with border that will change color
        var circleBorder = new Circle({radius: newRadius, strokeWidth: 5, lockScalingX:false, lockScalingY:false, originX:'center',originY:'center',
          fill:'transparent', stroke:'green'});
        
        //Get center point of Token Image to set circleBorder onto
        let center = tokenEl.getCenterPoint();
        circleBorder.setXY(center);

        //Create group of Token and Border set as Group. FixedLayout used to change bounding box to fit circle.
        var group = new Group([tokenEl,circleBorder], {width: newRadius * 2, height: newRadius * 2, originX:'center', originY:'center',
          lockRotation: true, lockSkewingX: true, lockSkewingY: true, lockScalingFlip: true, lockScalingY: true, lockScalingX: true,
          layoutManager: new LayoutManager(new FixedLayout)});
        
        canvas.add(group);
        canvas.centerObject(group);
      };
    }
  }

  var resizing = false;
  var resizeRect: Rect;
  var gridSet = false;
  var grid: Group;

  var resizeGrid = () => {
    //If no preexisting grid rect to use, create a new one
    if(!resizeRect)
    {
      resizeRect = new Rect({lockRotation: true, lockScalingFlip: true, lockSkewingX: true, lockSkewingY: true,
        fill:'transparent', strokeWidth: 1, stroke:'red', height: window.innerHeight / 40,
      });
      resizeRect.width = resizeRect.height;
    }

    //If no resizing occurred
    if(!resizing)
    {
      if(gridSet)
      {
        console.log("removing");
        canvas.remove(grid);
      }
      canvas.add(resizeRect);
      canvas.centerObject(resizeRect);
      resizing = true;
    }
    else if(canvas.item(0) instanceof FabricImage)
    {
      resizing = false;
      let map = canvas.item(0);
      let mapBounds: TCornerPoint = map.aCoords;
      let rectBounds: TCornerPoint = resizeRect.aCoords;
      var grid = new Group([], {selectable:false, hasControls:false});
      //Calculate x and y distance to create lines over
      var xDistance = rectBounds.bl.distanceFrom(rectBounds.br);
      var yDistance = rectBounds.bl.distanceFrom(rectBounds.tl);

      var overBorder = false;
      var totalDistance = 0;
      //Draw vertical lines to right
      while(!overBorder)
      {
        if(totalDistance + rectBounds.bl.x < mapBounds.br.x)
        {
          let newLine = new Line([rectBounds.bl.x + totalDistance,mapBounds.bl.y,
            rectBounds.bl.x + totalDistance,mapBounds.tl.y],
            {selectable:false,hasControls:false, stroke:'red', strokeWidth:1, opacity:0.4}
          );
          grid.add(newLine);
          totalDistance += xDistance;
        }else{
          //Reset boolean
          overBorder = true;
        }
      }

      //Reset boolean and distance increment
      overBorder = false;
      totalDistance = xDistance;

      //Draw vertical lines to left
      while(!overBorder)
      {
        if(rectBounds.bl.x - totalDistance > mapBounds.bl.x)
        {
          let newLine = new Line([rectBounds.bl.x - totalDistance,mapBounds.bl.y,
            rectBounds.bl.x - totalDistance,mapBounds.tl.y],
            {selectable:false,hasControls:false, stroke:'red', strokeWidth:1, opacity:0.4}
          );
          grid.add(newLine);
          totalDistance += xDistance;
        }else{
          //Reset boolean and distance change
          overBorder = true;
        }
      }

      //Reset boolean and distance increment
      overBorder = false;
      totalDistance = yDistance;

      //Draw horizontal line to above
      while(!overBorder)
      {
        //Fabric.js has y coordinates increase down
        if(rectBounds.bl.y - totalDistance > mapBounds.tl.y)
        {
          let newLine = new Line([mapBounds.bl.x,rectBounds.bl.y - totalDistance,
            mapBounds.br.x,rectBounds.bl.y - totalDistance],
            {selectable:false,hasControls:false, stroke:'red', strokeWidth:1, opacity:0.4}
          );
          grid.add(newLine);
          totalDistance += xDistance;
        }else{
          //Reset boolean and distance change
          overBorder = true;
        }
      }

      //Reset boolean and distance increment
      overBorder = false;
      totalDistance = 0;

      //Draw horizontal line to below
      while(!overBorder)
      {
        //Fabric.js has y coordinates increase down
        if(rectBounds.bl.y + totalDistance < mapBounds.bl.y)
        {
          let newLine = new Line([mapBounds.bl.x,rectBounds.bl.y + totalDistance,
            mapBounds.br.x,rectBounds.bl.y + totalDistance],
            {selectable:false,hasControls:false, stroke:'red', strokeWidth:1, opacity:0.4}
          );
          grid.add(newLine);
          totalDistance += xDistance;
        }else{
          //Reset boolean and distance change
          overBorder = true;
        }
      }


      gridSet = true;
      canvas.add(grid);
      canvas.remove(resizeRect);
    }
  }

  return (
    <div className="Toolbar">
        <button id="rect" onClick={addShape}>Shape</button>
        <button id="image" onClick={addImage}>Map</button>
        <button id="token" onClick={addToken}>Token</button>
        <button id="grid" onClick={resizeGrid}>Grid</button>
    </div>
  )
}

export default Toolbar