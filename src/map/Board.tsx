import BattleMap from "./BattleMap";
import {useRef, useState, useEffect} from 'react';
import {Canvas, Rect, FabricImage} from 'fabric';
import './Board.css';

function Board() {
  //Return using HTML notation
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if(canvasRef.current) {
        const initCanvas = new Canvas(canvasRef.current, {
            width: 500,
            height: 500,
            backgroundColor: 'rgb(0,0,0)',
        });
        
        const image = new FabricImage('testMap','./testMap.jpg');
        initCanvas.add(image);

        //Rendering
        initCanvas.renderAll();
        setCanvas(initCanvas);
        
        //Unmounted to free memory
        return () => {
            initCanvas.dispose();
        }
    }
  }, []);

  const addRectangle = () => {
    if(canvas){
      const rect = new Rect({
        top: 100, 
        left: 50,
        width: 100,
        height: 60,
        fill: "rgb(0, 100, 100)"
      });
      canvas.add(rect);
    }
  }

  return (
    <div className="Board">
      <div className="Toolbar darkmode">
        <h1>Hi</h1>
        <button id="rect" onClick={addRectangle}>The Button</button>
      </div>
      <canvas id="test" ref={canvasRef}/>
    </div>
  )
}

export default Board