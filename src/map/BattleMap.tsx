import {Canvas, Rect} from 'fabric';

//Class definition for BattleMap
class BattleMap {
  private name: string;
  private id: number;
  private tokens: Tokens[];
  private canvas: Canvas;

  constructor(name: string)
  {
    this.name = name;
    this.canvas = new Canvas('name', {
      backgroundColor: 'rgb(0,0,0)',
      selectionColor: 'white'
      });
    var rect = new Rect();
    this.canvas.add(rect);
    //canvas.setBackgroundImage('https')
    
  }
  


}

export default BattleMap;