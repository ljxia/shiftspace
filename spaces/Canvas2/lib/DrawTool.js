/*
  Class : DrawTool
*/
var DrawTool = new Class({

  initialize : function() {},
  setObject : function( object ) { this.object = object },

  onClick : function( p ) { this.fireEvent('onComplete'); },
  onDoubleClick : function( p ) { },
  onMouseDown : function( p ) { this.startPoint = p; },
  onDrag : function( p ) { this.dragPoint = p },
  onMouseUp : function( p ) { this.endPoint = p; },
  
  cleanup : function() {}

});
DrawTool.implement( new Events, new Options );

/*
  Class : ArrowTool
*/
var ArrowTool = DrawTool.extend({

  initialize : function() 
  { 
    this.parent() 
  },
  
  onClick : function( p ) 
  {
    this.parent();
    if(this.object) this.object.showHandles();
  },
  
  onMouseDown : function( p ) {},
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  update : function( p ) {},
  
  cleanup : function()
  {
    if(this.object)
    {
      this.object.cleanup();
    }
  }

});

/*
  Class : MoveTool
*/
var MoveTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
    
    if(this.object)
    {
      this.origin = { x : this.object.ctm.translate.x, 
                      y : this.object.ctm.translate.y };
    }  
  },
  
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    if(this.object)
    {
      var dx = p.x - this.startPoint.x;
      var dy = p.y - this.startPoint.y;
    
      this.object.translate( { x: this.origin.x + dx, y: this.origin.y + dy } );
    }
  }

});

/*
  RotateTool
*/
var RotateTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
    this.originalRotation = this.object.ctm.rotate;
  },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    var dy = p.y - this.startPoint.y;
    this.object.rotate( ((this.originalRotation + dy)/100) * (2*Math.PI) );
  }

});

/*
  ScaleTool
*/
var ScaleTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
  },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    var dx = p.x - this.startPoint.x;
    var dy = p.y - this.startPoint.y;
    this.object.scale({x: Math.abs(dx/100), y: Math.abs(dy/100)});
  }

});

/*
  Copy Tool
*/
var CopyTool = DrawTool.extend({
  
  initialize : function() { this.parent() },
  
  onMouseDown : function( p ) { this.parent( p ); },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp: function( p ) 
  { 
    // get the rectangle region to copy.  Create a new image object that shows the result
    // you can place it in an image object and just drag the image object to your desktop?!
    this.update( p ); 
  },

  update : function( p )
  {
    // nothing yet
  }
});


