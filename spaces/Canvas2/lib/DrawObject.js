/*
  Class : CanvasObject
*/
var DrawObject = new Class({
  
  getDefaults : function() {
    return {
      name : 'untitled',
      strokeStyle : [0,0,0],
      strokeOpacity : 1.0,
      fillStyle : 'none',
      fillOpacity : 1.0,
      lineWidth : 1,
      ctm : { translate : { x: 0, y: 0 },
              rotate : 0,
              scale : { x: 1.0, y: 1.0 } }
    };
  },

  initialize : function( canvas, options )
  {
    this.setOptions( this.getDefaults(), options);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    
    this.setName( this.options.name );
    this.setCTM( this.options.ctm );
    this.setStrokeStyle( this.options.strokeStyle );
    this.setFillStyle( this.options.fillStyle );
    this.setLineWidth( this.options.lineWidth );
    this.setStrokeOpacity( this.options.strokeOpacity );
    this.setFillOpacity( this.options.fillOpacity );
    
    this.handles = [];
    this.handlesVisible = false;
  },
  
  encode : function() {
    return {
      name : this.getName(),
      strokeStyle : this.strokeStyle,
      fillStyle : this.fillStyle,
      lineWidth : this.lineWidth,
      ctm : this.ctm
    }
  },

  /*
    Setters and getters for the DrawObject name property.
  */
  setName : function(name) { this.name = name; },
  getName : function() { return this.name; },
  
  /* Current Transformation matrix */
  setCTM : function( newCTM ) { this.ctm = newCTM; },
  translate : function( translation ) { this.ctm.translate = translation; },
  rotate : function( rotation ) { this.ctm.rotate = rotation; },
  scale : function( scale ) { this.ctm.scale = scale; },
  
  /* Stroke and fill styles */
  setStrokeStyle : function(newStrokeStyle) { this.strokeStyle = newStrokeStyle; },
  setStrokeOpacity : function(newOpacity) { this.strokeOpacity = newOpacity },
  setFillStyle : function(newFillStyle) { this.fillStyle = newFillStyle },
  setFillOpacity : function(newOpacity) { this.fillOpacity = newOpacity },
  setLineWidth : function(newLineWidth) { this.lineWidth = newLineWidth; },

  onClick : function(p) { this.fireEvent('onComplete'); },
  onMouseDown : function(p) {},
  onDrag : function(p) {},
  onMouseUp : function(p) {},
  
  boundingBox : function() {},
  showBoundingBox : function() 
  {
    this.boundingBoxVisible = true;
  },
  hideBoundingBox : function()
  {
    this.boundingBoxVisible = false;
  },
  showHandles : function() 
  {
    this.handlesVisible = true;
  },
  hideHandles : function() 
  {
    this.handlesVisible = false;
  },
  
  /*
    Function : mouseLocation
      Convenience for generating the mouse location relative to the Canvas Shift coordinate system.
      
    Parameters:
      e - A raw DOM event.
  */
  mouseLocation : function( e )
  {
    var evt = new Event( e );
    var pos = this.canvas.getPosition();
    return { x : evt.page.x - pos.x, y: evt.page.y - pos.y };
  },
  
  createColorString : function(color, _opacity)
  {
    if( color == 'none' )
    {
      return 'rgba(0, 0, 0, 0)';
    }
    else
    {
      var opacity = (_opacity == null && 1.0) || _opacity;
      return ('rgba('+color.copy().extend([opacity]).join(',')+')');
    }
  },

  render : function() {
    // do the necessary transformations
    this.context.translate( this.ctm.translate.x, this.ctm.translate.y );
    this.context.rotate( this.ctm.rotate );
    this.context.scale( this.ctm.scale.x, this.ctm.scale.y );
    
    if( this.boundingBoxVisible )
    {
      var bbox = this.boundingBox();
      if(bbox)
      {
        this.context.save();
        // render the bounding box
        this.context.strokeStyle = 'rgba(0, 255, 0, 1.0)';
        this.context.lineWidth = 1;
        this.context.strokeRect(bbox.origin.x, bbox.origin.y, bbox.size.width, bbox.size.height)
        this.context.restore();
      }
    }
    
    // set up fill and stroke
    // TODO : optimize don't need to do this everytime, only when the color changes - David
    this.context.fillStyle = this.createColorString(this.fillStyle, this.fillOpacity);
    this.context.strokeStyle = this.createColorString(this.strokeStyle, this.strokeOpacity);
    this.context.lineWidth = this.lineWidth;
  },
  
  cleanup : function() {},
  finish: function() {}
});
DrawObject.implement( new Options, new Events );

var Circle = DrawObject.extend({
  intialize : function( context, options )
  {
    this.parent(context, options);
    this.origin = this.options.origin;
    this.size = this.options.size;
  },
  
  onMouseDown : function( p ) 
  {
    this.startPoint = { x: p.x, y: p.y };
    this.origin = p; 
  },
  onDrag : function( p ) { this.updateSize( p ); },
  onMouseUp : function( p ) { 
    this.updateSize( p );
  },
  
  finish : function()
  {
    // reposition the circle to allow for logical rotation and scaling
  },
  
  updateSize : function( p )
  {
    var temp = { x : p.x, y : p.y };
    
    this.size = Math.abs( this.startPoint.y - p.y );
    
    if( p.x < this.startPoint.x )
    {
      this.origin.x = this.startPoint.x - this.size;
    }
    else
    {
      this.origin.x = this.startPoint.x;
    }
    
    if( p.y < this.startPoint.y )
    { 
      this.origin.y = this.startPoint.y - this.size;
    }
    else
    {
      this.origin.y = this.startPoint.y;
    }
  },
  
  render : function()
  {
    this.parent();
    
    if( this.size )
    {
      this.context.beginPath();
      var r = Math.round(this.size/2);
      this.context.arc(this.origin.x+r, 
                       this.origin.y+r, 
                       r,
                       0,
                       Math.PI*2,
                       true);

      // fill
      this.context.stroke();
      this.context.fill();
    }
  }

});

/*
  Class : Pencil
*/
var Pencil = DrawObject.extend({
  
  getDefaults : function()
  {
    return $merge( this.parent(), {
      strokeStyle : [255, 0, 0],
      lineWidth : 2
    } );
  },
  
  initialize : function( context, options )
  {
    this.parent(context, options);
    this.points = this.options.points || [];
  },
  
  onMouseDown : function( p ) { this.points.push( p ); },
  onDrag : function( p ) { this.points.push( p ); },
  
  onMouseUp : function( p ) { 
    this.points.push( p ); 
    var bbox = this.boundingBox();
    
    var newOrigin = { x : Math.round(bbox.origin.x + bbox.size.width/2),
                      y : Math.round(bbox.origin.y + bbox.size.height/2) };

    this.points = this.points.map( function( op ) {
      return { x : op.x - newOrigin.x, y : op.y - newOrigin.y };
    } );
    
    this.translate( newOrigin );
  },

  encode : function()
  {
    return $merge( this.parent(), {
      type : 'Pencil',
      points : this.points
    } );
  },
  
  boundingBox : function()
  {
    var left = this.points[0].x;
    var right = this.points[0].x;
    var top = this.points[0].y;
    var bottom = this.points[0].y;

    this.points.each( function(p) { 
      if (p.x < left) left = p.x; 
      if (p.x > right ) right = p.x;
      if (p.y < top ) top = p.y;
      if (p.y > bottom ) bottom = p.y;
    } );
    
    var temp =  {
      origin : { x : left, y : top },
      size : { width : right-left, height : bottom - top }
    };
    
    return temp;
  },
  
  render : function()
  {
    this.parent();
    
    if( this.points.length > 0 )
    {
      // begin a path
      this.context.beginPath();
      // move to the first point
      this.context.moveTo( this.points[0].x, this.points[0].y );

      // draw a path from each point of the stroke
      this.points.each( function( aPoint ) {
        this.context.lineTo( aPoint.x, aPoint.y );
      }.bind( this ) );
    
      // render the line
      this.context.stroke();
    }
  }
});

/*
  Class : Pen
*/
var Pen = DrawObject.extend({
  initialize : function(canvas, options)
  {
    this.parent(canvas, options);
    
    this.bezierPoints = this.options.bezierPoints || [];
    
    this.build();
  },
  
  /*
    Function : build
      Create the two control point divs that are use to modify
      the two control points of a bezier curve point.
  */
  build : function()
  {
    this.cpOne = new ShiftSpace.Element('div', {
      'class': "CSEditControlPoint CSHidden"
    });
    this.cpTwo = new ShiftSpace.Element('div', {
      'class': "CSEditControlPoint CSHidden"
    });
    
    // Nutty use of closures here
    var selectedPoint;
    var originalPoint;
    this.setSelectedPoint = function(np)
    {
      selectedPoint = np;
      if( np )
      {
        this.updateEditControlPoints();
      }
      else
      {
        this.hideEditControlPoints();
      }
    }.bind( this );
    this.getSelectedPoint = function()
    {
      return selectedPoint;
    }.bind( this );
    
    var sp;
    this.cpOne.makeDraggable({
      onStart : function()
      {
        originalPoint = {x: selectedPoint.controlPoint1.x, y: selectedPoint.controlPoint1.y };
        sp = this.cpOne.getPosition();
      }.bind(this),
      onDrag : function( e )
      {
        // get the offset location
        var loc = this.cpOne.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        selectedPoint.controlPoint1.x = originalPoint.x + v.x;
        selectedPoint.controlPoint1.y = originalPoint.y + v.y;
        this.fireEvent('displayNeedsUpdate');
      }.bind(this)
    });
    
    this.cpTwo.makeDraggable({
      onStart : function()
      {
        originalPoint = {x: selectedPoint.controlPoint2.x, y: selectedPoint.controlPoint2.y };
        sp = this.cpTwo.getPosition();
      }.bind(this),
      onDrag : function( e )
      {
        // get the offset location
        var loc = this.cpTwo.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        selectedPoint.controlPoint2.x = originalPoint.x + v.x;
        selectedPoint.controlPoint2.y = originalPoint.y + v.y;
        this.fireEvent('displayNeedsUpdate');
      }.bind(this)
    });
    
    this.cpOne.injectInside(document.body);
    this.cpTwo.injectInside(document.body);
  },
  
  /*
    Function : updateEditControlPoints
      Update the two bezier control point tools.
  */
  updateEditControlPoints : function()
  {
    var selectedPoint = this.getSelectedPoint();
    var pos = this.canvas.getPosition();
    var t = this.ctm.translate;
    
    if(selectedPoint)
    {
      this.cpOne.setStyles({
        left: selectedPoint.controlPoint1.x + t.x + pos.x-1, 
        top: selectedPoint.controlPoint1.y + t.y + pos.y-2
      });
      this.cpTwo.setStyles({
        left: selectedPoint.controlPoint2.x + t.x + pos.x-1, 
        top: selectedPoint.controlPoint2.y + t.y + pos.y-2
      });
    }
  },
  
  /*
    Function : showEditControlPoints
      Show the bezier control point edit divs.
  */
  showEditControlPoints : function()
  {
    this.cpOne.removeClass('CSHidden');
    this.cpTwo.removeClass('CSHidden');
  },
  
  /*
    Function : hideEditControlPoints
      Hide the bezier control point edit divs.
  */
  hideEditControlPoints : function()
  {
    this.cpOne.addClass('CSHidden');
    this.cpTwo.addClass('CSHidden');
  },
  
  encode : function()
  {
    return $merge( this.parent(), {
      type : 'Pen',
      bezierPoints : this.bezierPoints
    } );
  },
  
  onClick : function(p)
  {
  },
  
  onDoubleClick : function(p)
  {
    this.fireEvent('onComplete', this);
  },
  
  onMouseDown : function(p)
  {
    this.bezierPoints.push({ point : { x: p.x, y: p.y }, 
                             controlPoint1 : { x: p.x, y: p.y },
                             controlPoint2 : { x: p.x, y: p.y } } )
  },
  
  onDrag : function(p)
  {
    var lastPoint = this.bezierPoints.getLast();

    var v = { x : -(p.x - lastPoint.point.x), 
              y : -(p.y - lastPoint.point.y) };

    lastPoint.controlPoint1.x = lastPoint.point.x + v.x;
    lastPoint.controlPoint1.y = lastPoint.point.y + v.y;
    lastPoint.controlPoint2.x = lastPoint.point.x - v.x;
    lastPoint.controlPoint2.y = lastPoint.point.y - v.y;
  },
  
  onMouseUp : function(p)
  {
  },
  
  /*
    Function : showHandles
      Show the control handles for each point on the line.
    
    Parameters :
      p - A bezier control point javascript object.
  */
  showHandles : function(p)
  {
    if(this.handlesVisible) return;

    this.handlesVisible = true;
    this.bezierPoints.each(this.createControlPoint.bind(this));
  },
  
  /*
    Function : createControlPoint
      Create a single point handle.
    
    Parameters :
      aPoint - A single bezier point javascript object.
      
    See Also :
      showHandles
  */
  createControlPoint : function(aPoint)
  {
    // store the original point information
    var op = { x: aPoint.point.x, y: aPoint.point.y };
    var ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
    var ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
    
    // create a DOM node, attach an event
    var controlPoint = new ShiftSpace.Element('div', {
      'class': "CSPenControlPoint"
    });
    
    var pos = this.canvas.getPosition();
    controlPoint.setStyles({
      left : pos.x + this.ctm.translate.x + op.x-1,
      top : pos.y + this.ctm.translate.y + op.y-2
    });
    
    var sp;
    
    // set up a click event
    controlPoint.addEvent('click', function() {
      // show the control point editors
      this.setSelectedPoint( aPoint );
      this.showEditControlPoints();
      this.fireEvent('displayNeedsUpdate');
    }.bind(this));

    controlPoint.makeDraggable({

      onStart : function( e )
      {
        // store the original point information
        op = { x: aPoint.point.x, y: aPoint.point.y };
        ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
        ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
        
        sp = controlPoint.getPosition();
      }.bind( this ),

      onDrag : function( e )
      {
        // get the offset location
        var loc = controlPoint.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        // TODO - simplify with getters and setters
        aPoint.point.x = op.x + v.x;
        aPoint.point.y = op.y + v.y;
        aPoint.controlPoint1.x = ocp1.x + v.x;
        aPoint.controlPoint1.y = ocp1.y + v.y;
        aPoint.controlPoint2.x = ocp2.x + v.x;
        aPoint.controlPoint2.y = ocp2.y + v.y;
        
        this.fireEvent('displayNeedsUpdate');
      }.bind( this ),
      
      onComplete : function( e )
      {
        // get the offset location
        var loc = controlPoint.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        // TODO - simplify with  getters and setters
        aPoint.point.x = op.x + v.x;
        aPoint.point.y = op.y + v.y;
        aPoint.controlPoint1.x = ocp1.x + v.x;
        aPoint.controlPoint1.y = ocp1.y + v.y;
        aPoint.controlPoint2.x = ocp2.x + v.x;
        aPoint.controlPoint2.y = ocp2.y + v.y;
        
        // save new information
        op = { x: aPoint.point.x, y: aPoint.point.y };
        ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
        ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
        
        this.fireEvent('displayNeedsUpdate');
      }.bind( this )
    });
    
    // add to the page
    controlPoint.injectInside(document.body);
    
    this.handles.push(controlPoint);
  },
  
  /*
    Function : hideHandles
      Hide the handles used to manipulate this object.
  */
  hideHandles : function()
  {
    if(!this.handlesVisible) return;
    this.handlesVisible = false;
    
    // remove each handle from the DOM
    this.handles.each(function(aHandle) {
      aHandle.remove();
    });
  },
  
  /*
    Function : boundingBox
      Return the bounding box of the bezier curve.
  */
  boundingBox : function()
  {
    var left = this.bezierPoints[0].point.x;
    var right = this.bezierPoints[0].point.x;
    var top = this.bezierPoints[0].point.y;
    var bottom = this.bezierPoints[0].point.y;

    this.bezierPoints.each( function(abp) { 
      var p = abp.point;
      var cp1 = abp.controlPoint1;
      var cp2 = abp.controlPoint2;
      
      var minx = Math.min(p.x, cp1.x, cp2.x);
      if (minx < left) left = minx; 

      var maxx = Math.max(p.x, cp1.x, cp2.x);
      if (maxx > right ) right = maxx;

      var miny = Math.min(p.y, cp1.y, cp2.y);
      if (miny < top ) top = miny;
      
      var maxy = Math.max(p.y, cp1.y, cp2.y) ;
      if (maxy > bottom ) bottom = maxy;
    } );
    
    return {
      origin : { x : left, y : top },
      size : { width : right-left, height : bottom - top }
    };
  },
  
  /*
    Function: renderArrow
      Render the arrow for the pen tool line.
  */
  renderArrow : function()
  {
    // render the arrow for Mushon ;) 
    // calculate the vector from the last point and its control point
    var lastPoint = this.bezierPoints.getLast();
    var dx = lastPoint.point.x - lastPoint.controlPoint1.x;
    var dy = lastPoint.point.y - lastPoint.controlPoint1.y;
    var dist = Math.sqrt( (dx*dx) - (dy*dy) );
    
    // normalized vector
    var v = { x : dx/dist, y : dy/dist };
    
    // draw the triangle, its dimensions are a ratio of the line width
    this.context.beginPath();

    // fill and stroke
    this.fill();
    this.stroke();
  },
  
  render : function()
  {
    this.parent();
    
    if( this.bezierPoints.length > 0 )
    {
      var fp = this.bezierPoints[0];

      // move to the first point
      this.context.beginPath();
      this.context.moveTo(fp.point.x, fp.point.y);
    
      // render each point
      var lastPoint = fp;
      var len = this.bezierPoints.length;
      for( var i = 1; i < len; i++ )
      {
        var aBezierPoint = this.bezierPoints[i];
          
        this.context.bezierCurveTo(lastPoint.controlPoint2.x, 
                                   lastPoint.controlPoint2.y,
                                   aBezierPoint.controlPoint1.x,
                                   aBezierPoint.controlPoint1.y,
                                   aBezierPoint.point.x,
                                   aBezierPoint.point.y);
      
        lastPoint = aBezierPoint;
      }
      this.context.stroke();
      this.context.fill();
    
      // show the bezier point control point editors if there is a selected point
      var selectedPoint = this.getSelectedPoint();
      if( selectedPoint )
      {
        this.updateEditControlPoints(); 
        var p = selectedPoint;
      
        // get the current selected control points
        this.context.strokeStyle = 'rgba(150, 150, 255, 1.0)';
        this.context.lineWidth = 1;
      
        // draw a blue line to them
        this.context.beginPath();
        this.context.moveTo(p.point.x, p.point.y);
        this.context.lineTo(p.controlPoint1.x, p.controlPoint1.y);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(p.point.x, p.point.y);
        this.context.lineTo(p.controlPoint2.x, p.controlPoint2.y);
        this.context.stroke();
      }
    }
    
  },
  
  /*
    Function : cleanup
      A general function that the object should return to it's normal state.
  */
  cleanup : function()
  {
    this.hideHandles();
    // hide the selected point and its control points
    this.setSelectedPoint(null);
    this.fireEvent('displayNeedsUpdate');
  },
  
  /*
    Function : finish
      This function is called when a tool has finished operating on this object.
  */
  finish : function()
  {
    var bbox = this.boundingBox();
    
    var newOrigin = { x : Math.round(bbox.origin.x + bbox.size.width/2),
                      y : Math.round(bbox.origin.y + bbox.size.height/2) };

    this.bezierPoints = this.bezierPoints.map( function( op ) {
      var p = op.point,
          cp1 = op.controlPoint1,
          cp2 = op.controlPoint2;

      return {
        point : { x: p.x - newOrigin.x, y: p.y - newOrigin.y },
        controlPoint1 : { x: cp1.x - newOrigin.x, y: cp1.y - newOrigin.y },
        controlPoint2 : { x: cp2.x - newOrigin.x, y: cp2.y - newOrigin.y }
      };
    });
    
    this.translate( newOrigin );
  }
});