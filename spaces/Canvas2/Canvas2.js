var Canvas2Space = Space({
  setup: function(options) {
    this.build();
    this.attachEvents();
    
    // set the default fill and stroke color
    this.setStrokeStyle([0,0,0])
    this.setFillStyle([0,0,0]);
    
    // position the toolbar
    this.toolBar.setStyles({
      top: 100,
      left: 100
    });
    
    // set up the tools
    // TODO : This is silly need to fix this - David
    var theMoveTool = new MoveTool();
    this.getMoveTool = function()
    {
      return theMoveTool;
    }
    var rotateTool = new RotateTool();
    this.getRotateTool = function()
    {
      return rotateTool;
    }
    var arrowTool = new ArrowTool();
    this.getArrowTool = function()
    {
      return arrowTool;
    }
    var scaleTool = new ScaleTool();
    this.getScaleTool = function()
    {
      return scaleTool;
    }
    
    // set default tool to pencil
    this.setTool( 'Pencil' );
    
    // make the toolbar draggable
    this.toolBar.makeDraggable();
    this.showInterface();
  },
  
  
  /*
    Function : build
      Builds the interface for the Canvas space.
  */
  build : function()
  {
    // build the toolbar
    this.toolBar = new ShiftSpace.Element('div', {
      'class': "CSToolBar CSHidden"
    });

    this.stroke = new ShiftSpace.Element('div', {
      id: "CSStroke", 
      'class': "CSColor"
    });
    this.fill = new ShiftSpace.Element('div', {
      id: "CSFill", 
      'class': "CSColor"
    });

    this.noColor = new ShiftSpace.Element('div', {
      id: "CSNoStroke",
      'class' : "CSColor"
    });
    this.noFill = new ShiftSpace.Element('div', {
      id: "CSNoFill",
      'class': "CSColor", 
    });
    
    this.arrow = new ShiftSpace.Element('div', {
      id: "CSArrow",
      'class': "CSTool"
    });
    this.arrow.set('text','A');
    
    this.pencil = new ShiftSpace.Element('div', {
      id: "CSPencil",
      'class': "CSTool"
    });
    this.pencil.set('text','P');
    
    this.pen = new ShiftSpace.Element('div', {
      id: "CSPen",
      'class': "CSTool"
    });
    this.pen.set('text','V');
    
    this.translate = new ShiftSpace.Element('div', {
      id: 'CSMove',
      'class': "CSTool"
    });
    this.translate.set('text','M');
    
    this.rotate = new ShiftSpace.Element('div', {
      id: 'CSRotate',
      'class': "CSTool"
    });
    this.rotate.set('text','R');
    
    this.scale = new ShiftSpace.Element('div', {
      id: "CSScale", 
      'class' : 'CSTool'
    });
    this.scale.set('text','S');
    
    this.circle = new ShiftSpace.Element('div', {
      id: "CSCircle",
      'class': "CSTool"
    });
    this.circle.set('text','C');
    
    this.rect = new ShiftSpace.Element('div', {
      id: "CSRect", 
      'class': "CSTool"
    });
    this.rect.set('text','R');
    
    this.stroke.injectInside(this.toolBar);
    this.fill.injectInside(this.toolBar);
    this.noColor.injectInside(this.toolBar);
    this.noFill.injectInside(this.toolBar);

    this.arrow.injectInside(this.toolBar);
    this.pencil.injectInside(this.toolBar);
    this.pen.injectInside(this.toolBar);
    this.translate.injectInside(this.toolBar);
    this.rotate.injectInside(this.toolBar);
    this.scale.injectInside(this.toolBar);
    this.circle.injectInside(this.toolBar);
    this.rect.injectInside(this.toolBar);
    
    this.toolBar.injectInside(document.body);
    
    this.buildObjectInspector();

    // build MooRainbow color picker
    this.mooRainbow = new MooRainbow(this.stroke, {
      imgPath : ShiftSpace.info().server + 'spaces/Canvas2/images/',
      startColor : [0, 0, 0],
      onChange : function(color)
      {
        this.mooRainbow.element.setStyle('backgroundColor', color.hex);
        this.setStrokeStyle(color.rgb);
      }.bind(this),
      onComplete : function(color)
      {
        this.setStrokeStyle(color.rgb);
      }
    });
  },
  
  /*
    Function : buildObjectInspector
      Builds the object inspector which is used to view and change
      additional properties of drawn objects.
  */
  buildObjectInspector: function()
  {
    // build the object inspect
    this.objectInspector = new ShiftSpace.Element('div', {
      'class': "CSObjectInspector CSHidden"
    });
    
    this.objectInspector.setStyles({
      top: 200, 
      left: 200
    });
    
    /* Opacity slider */
    this.opacitySlider =new ShiftSpace.Element('div', {
      'class': "CSSliderContainer"
    });
    this.opacitySliderLabel = new ShiftSpace.Element('div', {
      'class': "CSPropertySliderLabel"
    });
    this.opacitySliderLabel.set('text','Opacity:');
    
    // build the opacity slider
    this.opacityHandle = new ShiftSpace.Element('div', {
      id: "CSOpacityHandle",
      'class': "CSPropertySliderKnob"
    });
    this.opacityTrack = new ShiftSpace.Element('div', {
      id: "CSOpacityTrack",
      'class': "CSPropertySlider"
    });
    this.opacityHandle.injectInside(this.opacityTrack);

    // add the sliders
    this.opacitySliderLabel.injectInside(this.opacitySlider);
    this.opacityTrack.injectInside(this.opacitySlider);
    this.opacitySlider.injectInside(this.objectInspector);
    
    /* Line width slider */
    this.lineWidthSlider =new ShiftSpace.Element('div', {
      'class': "CSSliderContainer"
    });
    this.lineWidthSliderLabel = new ShiftSpace.Element('div', {
      'class': "CSPropertySliderLabel"
    });
    this.lineWidthSliderLabel.set('text','Line Width:');
    
    // build the lineWidth slider
    this.lineWidthHandle = new ShiftSpace.Element('div', {
      id: "CSLineWidthHandle",
      'class': "CSPropertySliderKnob"
    });
    this.lineWidthTrack = new ShiftSpace.Element('div', {
      id: "CSLineWidthTrack",
      'class': "CSPropertySlider"
    });
    this.lineWidthHandle.injectInside(this.lineWidthTrack);
    
    /* Arrow checkbox */
    this.arrowOption = new ShiftSpace.Element('input', {
      id: "CSArrowOption",
      'class': 'CSPropertyCheckbox CSHidden',
      type: 'checkbox',
      name: 'arrowhead',
      value: 'Arrowhead',
      checked: ''
    });
    this.arrowOptionLabel = new ShiftSpace.Element('div', {
      'class' : 'CSPropertyLabel CSHidden'
    });
    this.arrowOptionLabel.set('text','Arrowhead');

    // add the sliders
    this.lineWidthSliderLabel.injectInside(this.lineWidthSlider);
    this.lineWidthTrack.injectInside(this.lineWidthSlider);
    this.lineWidthSlider.injectInside(this.objectInspector);

    // add the arrow options
    this.arrowOption.injectInside(this.objectInspector);
    this.arrowOptionLabel.injectInside(this.objectInspector);
    
    // make the object inspector draggable
    this.objectInspector.makeDraggable();
    this.objectInspector.injectInside(document.body);

    // we initialize the sliders the first time the inspector becomes visible
    this.slidersInitialized = false;
  },
  
  /*
    Function: updateObjectInspector
      Updates the object inspector interface to reflect the properties of the
      currently selected object.
  */
  updateObjectInspector: function(evt)
  {
    if(evt.layer && evt.layer instanceof Pen)
    {
      this.arrowOption.removeClass('CSHidden');
      this.arrowOptionLabel.removeClass('CSHidden');
    }
    else
    {
      this.arrowOption.addClass('CSHidden');
      this.arrowOptionLabel.addClass('CSHidden');
    }
  },
  /*
    Function: initializeSliders
      Initializes the sliders in the object inspector.
  */
  initializeSliders: function()
  {
    // have to wait for css to construct slider as well
    new Slider(this.opacityTrack, this.opacityHandle, {
      onChange: this.setOpacity.bind(this),
      onComplete: this.setOpacity.bind(this)
    });
    
    // have to wait for css to construct slider as well
    new Slider(this.lineWidthTrack, this.lineWidthHandle, {
      steps: 20,
      onChange: this.setLineWidth.bind(this),
      onComplete: this.setLineWidth.bind(this)
    });
  },
  
  /*
    Function : attachEvents
      Attaches events to the Canvas Space toolbar interface.
  */
  attachEvents : function()
  {
    this.noColor.addEvent('click', this.setStrokeStyle.bind(this, 'none'));
    this.noFill.addEvent('click', this.setFillStyle.bind(this, 'none'));
    
    // set up the tools
    this.arrow.addEvent('click', this.setTool.bind(this, 'Arrow'));
    this.pencil.addEvent('click', this.setTool.bind(this, 'Pencil'));
    this.pen.addEvent('click', this.setTool.bind(this, 'Pen'));
    this.circle.addEvent('click', this.setTool.bind(this, 'Circle'));
    
    this.translate.addEvent('click', this.setTool.bind(this, 'Move'));
    this.rotate.addEvent('click', this.setTool.bind(this, 'Rotate'));
    this.scale.addEvent('click', this.setTool.bind(this, 'Scale'));
  },
  
  /*
    Function : onCssLoad
      Setup MooRainbow. :.clo:fdrop
  */
  onCssLoad : function() {},
  
  showInterface : function()
  {
    this.parent();
    
    this.toolBar.removeClass('CSHidden');
    this.objectInspector.removeClass('CSHidden');
    
    if(!this.slidersInitialized)
    {
      this.initializeSliders();
    }
  },
  
  onShiftCreate : function(shiftId)
  {
    // attach a bunch of events to the new canvas
    var aCanvas = this.shifts[shiftId];
    
    // update the object inspector if the canvas changes layer focus
    aCanvas.addEvent('onSelectLayer', this.updateObjectInspector.bind(this));
  },
  
  onShiftFocus : function(shiftId)
  {
    this.selectedCanvas = this.shifts[shiftId];
  },
  
  hideInterface : function(shiftId)
  {
    this.toolBar.addClass('CSHidden');
    this.objectInspector.addClass('CSHidden');
  },
  
  /*
    Function: setTool
      Set the current tool.
      
    Parameters:
      newTool - a string representing the selected tool.
  */
  setTool : function(newTool) 
  { 
    // update the interface
    if($$('.CSSelectedTool')[0])
    {
      $$('.CSSelectedTool')[0].removeClass('CSSelectedTool');
    }
    $('CS'+newTool).addClass('CSSelectedTool');
    
    this.tool = newTool;
    
    this.fireEvent('onToolChange');
  },
  getTool : function() { return this.tool },
  
  setFillStyle : function(newFillStyle) 
  { 
    this.fillStyle = newFillStyle;
    this.fireEvent('onFillChange', [newFillStyle]);
  },
  getFillStyle : function() { return this.fillStyle; },
  
  setStrokeStyle : function(newStrokeStyle) 
  { 
    this.strokeStyle = newStrokeStyle; 
    this.fireEvent('onStrokeChange', [newStrokeStyle]);
  },
  getStrokeStyle : function() { return this.strokeStyle },
  
  setOpacity : function(newOpacity)
  {
    this.opacity = newOpacity/100;
    // check to see if there is a current object and set the opacity
    this.fireEvent('onOpacityChange', this.opacity);
  },
  getOpacity : function() { return this.opacity },
  
  setLineWidth : function(newWidth) 
  {
    this.lineWidth = newWidth;
    this.fireEvent('onLineWidthChange', this.lineWidth)
  },
  getLineWidth : function() { return 2; }
  
});

var Canvas2Shift = Shift({
  getDefaults : function()
  {
    return $merge( this.parent(), {
      size : { x : 200, y : 200 }
    });
  },

  setup : function(json)
  {
    this.defaults = this.getDefaults();
    this.hideControls = false;

    this.build();
    this.attachEvents();
    
    // holds the display list
    this.displayList = [];
    
    // undo redo operation queues
    // and operation consists of the tool
    // the method and arguments that need to
    // be applied
    this.redoOperationQueue = [];
    this.undoOperationQueue = [];
    
    if( json.displayList )
    {
      this.loadEncodedDisplayList( json.displayList );
    }
    
    this.element.setStyles({
      left : json.position.x,
      top : json.position.y,
      width : this.defaults.size.x,
      height : this.defaults.size.y
    });
    
    // TODO - This a design ugliness. Fix this The Space should call operationComplete - David
    // these functions should get called.  Canvas should keep track of the focused shift
    this.getParentSpace().addEvent('onStrokeChange', this.setStroke.bind(this));
    this.getParentSpace().addEvent('onOpacityChange', this.setOpacity.bind(this));
    this.getParentSpace().addEvent('onLineWidthChange', this.setLineWidth.bind(this));
    this.getParentSpace().addEvent('onFillChange', this.setFill.bind(this));
    this.getParentSpace().addEvent('onToolChange', this.operationComplete.bind(this));
    
    this.getParentSpace().getMoveTool().addEvent('onComplete', this.operationComplete.bind(this));
    this.getParentSpace().getRotateTool().addEvent('onComplete', this.operationComplete.bind(this));
    this.getParentSpace().getScaleTool().addEvent('onComplete', this.operationComplete.bind(this));
    
    if(json.summary)
    {
      this.title.value = json.summary;
    }
    
    this.manageElement(this.element);
    this.setFocusRegions( this.title, this.handle );
    
    this.refresh();
    this.render();
  },
  
  setStroke : function(stroke)
  {
    if(this.selectedLayer) 
    {
      this.selectedLayer.setStrokeStyle(stroke);
      this.render();
    }
  },
  
  setFill : function(fill)
  {
    if(this.selectedLayer) 
    {
      this.selectedLayer.setFillStyle(fill);
      this.render();
    }
  },
  
  setOpacity : function( opacity )
  {
    if(this.selectedLayer)
    {
      // TODO : For now there are the same but maybe allow them to be different soon. - David
      this.selectedLayer.setFillOpacity(opacity);
      this.selectedLayer.setStrokeOpacity(opacity);
      this.render();
    }
  },
  
  setLineWidth : function( lineWidth )
  {
    if(this.selectedLayer)
    {
      // TODO : For now there are the same but maybe allow them to be different soon. - David
      this.selectedLayer.setLineWidth(lineWidth);
      this.render();
    }
  },
  
  /*
    Function : loadEncodedDisplayList
      Creates all the objects in a serialized display list.
      
    Parameters:
      encodedDL - An array of serialized DrawObjects.
  */
  loadEncodedDisplayList : function( encodedDL )
  {
    encodedDL.each( this.newObject.bind(this) );
  },
  
  anchor : function()
  {
    // anchor to a div an stay in relative position to it.
    // this requires the shift to be absolute positioned in respect
    // to the anchoring div
    // you should be able to anchors different keypoints on the div
  },
  
  newObject : function( json )
  {
    var newObj = null;
    var _p = this.getParentSpace();
    
    var curSettings = $merge(
      {
        fillStyle : _p.getFillStyle(),
        strokeStyle : _p.getStrokeStyle(),
        lineWidth : _p.getLineWidth()
      }, 
      json);
    var graphicObject = false;
    
    // TODO - Design ugliness, Move Rotate and Scale should just be one default function - David
    switch( json.type )
    {
      case 'Pencil':
        newObj = new Pencil(this.canvas, curSettings);
      break;
      
      case 'Pen':
        newObj = new Pen(this.canvas, curSettings);
      break;
      
      case 'Circle':
        newObj = new Circle(this.canvas, curSettings);
      break;
      
      case 'Arrow':
        newObj = this.getParentSpace().getArrowTool();
      break;
      
      case 'Move':
        newObj = this.getParentSpace().getMoveTool();
      break;
      
      case 'Rotate':
        newObj = this.getParentSpace().getRotateTool();
      break;
      
      case 'Scale':
        newObj = this.getParentSpace().getScaleTool();
      break;
      
      default:
      
      break;
    }
    
    // add this to the display list
    if( newObj instanceof DrawObject ) 
    {
      // attach events
      newObj.addEvent('onComplete', this.operationComplete.bind(this));
      newObj.addEvent('displayNeedsUpdate', this.render.bind(this));
      
      this.displayList.push(newObj);
      
      this.updateDrawer(true);
      this.selectLayer(newObj);
    }
    else
    {
      // otherwise a CTM tool
      newObj.setObject( this.selectedLayer );
    }
    
    return newObj;
  },
  
  refresh : function()
  {
    var size = this.element.getSize().size;
    var hsize = this.handle.getSize().size;
    var bsize = this.bottom.getSize().size
    
    this.canvas.setProperty('width', size.x );
    this.canvas.setProperty('height', size.y - hsize.y - bsize.y);
    
    this.updateDrawer();
    
    // redraw after the refresh
    this.render();
  },
  
  encode : function()
  {
    var temp = {
      summary : this.title.value,
      position : this.element.getPosition(),
      displayList : this.displayList.map( function(obj) { return obj.encode() } ),
      size : this.element.getSize().size,
      version : this.getParentSpace().attributes.version
    };
    return temp;
  },
  
  attachEvents : function()
  {
    // set the mouse drag events
    this.canvas.addEvent( 'mousedown', this.handleMouseDown.bind( this ) );
    this.canvas.addEvent( 'mousemove', this.handleMouseMove.bind( this ) );
    this.canvas.addEvent( 'mouseup', this.handleMouseUp.bind( this ) );
    this.canvas.addEvent( 'click', this.handleClick.bind( this ) );
    this.canvas.addEvent( 'dblclick', this.handleDoubleClick.bind( this ) );
    
    // save the drawing
    this.saveButton.addEvent('click', this.save.bind(this));
    this.viewButton.addEvent('click', this.toggleView.bind(this));
    //this.canvas.addEvent('dblclick', this.toggleView.bind(this));
    
    // make the drawing draggable
    this.element.makeDraggable({
      handle : this.handle,
      onStart : function() 
      {
        // turn of any control handles on the current object
        if(this.currentObject) this.currentObject.cleanup();
      }.bind(this),
      onDrag : this.updateDrawer.bind(this)
    });
    
    // make the note resizeable
    this.element.makeResizable({
      handle : this.resizeControl,
      onDrag : this.refresh.bind(this)
    });
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
  
  /*
    Function : toggleView
      Toggle the surrounding interface of the Canvas Shift.
  */
  toggleView : function()
  {
    this.hideControls = !this.hideControls;
    
    if(this.hideControls)
    {
      this.element.setStyle('visibility', 'hidden');
      this.handle.setStyle('visibility', 'hidden');
      this.bottom.setStyle('visibility', 'hidden');
      this.bottom.getChildren().setStyle('visibility', 'hidden');
      this.drawer.addClass('CSHidden');
    }
    else
    {
      this.element.setStyle('visibility', 'visible');
      this.handle.setStyle('visibility', 'visible');
      this.bottom.setStyle('visibility', 'visible');
      this.bottom.getChildren().setStyle('visibility', 'visible');
      this.drawer.removeClass('CSHidden');
    }
  },
  
  handleClick : function( e )
  {
    var curPoint = this.mouseLocation( e );
    if(this.currentObject)
    {
      this.currentObject.onClick( e );
    }
  },
  
  handleDoubleClick : function( e )
  {
    if (this.currentObject) 
    {
      this.currentObject.onDoubleClick( this.mouseLocation( e ) );
    }
  },
  
  /*
    Function : prepare
      Prepare the state of the Shift to act on a user action.
    
    Parmeters :
      A raw DOM event.
  */
  handleMouseDown : function( e )
  {
    this.startPoint = this.mouseLocation( e );
    this.drag = true;
    
    // don't create a new object if currentObject is not null
    // we are in the middle of an operation
    if(this.currentObject == null)
    {
      this.prepareToExecute = true;

      // check to see if the pen tool is selected since it has a different behavior
      if( this.getParentSpace().getTool() == 'Pen' ||
          this.getParentSpace().getTool() == 'Arrow' )
      {
        // turn this flag off
        this.prepareToExecute = false;
        // create the pen tool
        this.currentObject = this.newObject( { type : this.getParentSpace().getTool() } );
        this.currentObject.onMouseDown( this.startPoint );
      }
    }
    else
    {
      if( this.getParentSpace().getTool() == 'Pen' )
      {
        // pass the mouse down point to the pen tool
        this.currentObject.onMouseDown( this.startPoint );
      }
    }

    this.render();
  },
  
  /*
    Function : execute
      Act on the user action.
    
    Parmeters:
      e - A raw DOM event.
  */
  handleMouseMove : function( e )
  {
    var curPoint = this.mouseLocation( e );
    
    if( this.prepareToExecute )
    {
      this.prepareToExecute = false;

      // create the right object for the tool
      this.currentObject = this.newObject( { type : this.getParentSpace().getTool() } );
      
      // pass the original prepare event, and the current drag event
      this.currentObject.onMouseDown( this.startPoint );
      this.currentObject.onDrag( curPoint );
    }
    else if( this.currentObject && this.drag )
    {
      // pass the drag event
      this.currentObject.onDrag( curPoint );
    }
    
    // update the drawing area
    this.render();
  },
  
  handleMouseUp : function( e )
  {
    var curPoint = this.mouseLocation( e );

    this.drag = false;
    this.prepareToExecute = false;
    if( this.currentObject )
    {
      this.currentObject.onMouseUp( curPoint );
    }
    
    // update the drawing area
    this.render();
  },
  
  /*
    Function : operationComplete
      User operation complete, clean up.
  */
  operationComplete : function( e )
  {
    // show bounding box after operation is complete
    if(this.selectedLayer)
    {
      this.selectedLayer.showBoundingBox();
    }

    if( this.currentObject )
    {
      // finish
      if(this.currentObject.finish) this.currentObject.finish();
      // clean up the current object if possible
      if(this.currentObject.cleanup) this.currentObject.cleanup();
      this.currentObject = null;
    }
    
    this.render();
  },
  
  /*
    Function : render
      Render each object in the display list.
  */
  render : function()
  {
    var size = this.canvas.getSize().size;
    // clear the rectangle
    this.context.clearRect( 0, 0, size.x, size.y );
    this.displayList.each( function( obj ) { 
      this.context.save();
      obj.render(); 
      this.context.restore();
    }.bind( this ) );
  },
  
  /*
    Function : updateDrawer
      Updates the position and contents of the layer drawer.
    
    Parmeters :
      newObjectWasCreated - a boolean flag. If set to true the drawer will refresh it content
      to sync with the current display list.
  */
  updateDrawer : function(contentsDidChange)
  {
    if(this.displayList.length > 0)
    {
      var pos = this.element.getPosition();
      var size = this.element.getSize().size;
      
      this.drawer.setStyles({
        top: pos.y, 
        left: pos.x+size.x,
        height: size.y
      });
      this.drawer.removeClass('CSHidden');
    }
    else
    {
      this.drawer.addClass('CSHidden');
    }
    
    this.drawer.getChildren().removeClass('CSSelectedLayer');
    if(this.selectedLayer)
    {
      var idx = this.displayList.indexOf(this.selectedLayer);
      this.drawer.getChildren()[idx].addClass('CSSelectedLayer');
    }
    
    if( contentsDidChange )
    {
      this.drawer.set('html','');
      this.displayList.each(this.createLayerForObject.bind(this));
    }
  },
  
  /*
    Function : createLayerForObject
      Creates the layer control that goes into the drawer.
      
    Parmeters :
      obj - A DrawObject.
  */
  createLayerForObject : function(obj)
  {
    var layer = new ShiftSpace.Element('div', {
      'class' : 'CSLayer'
    });
    var layerName = new ShiftSpace.Element('input', {
      'class': "CSLayerInput"
    });
    var deleteLayer = new ShiftSpace.Element('div', {
      'class': "CSLayerDelete"
    });
    deleteLayer.set('text','X');
    
    layerName.injectInside(layer);
    deleteLayer.injectInside(layer);
    
    layerName.setProperty('value', obj.getName());
    
    // select the layer on click
    layer.addEvent('click', function() {
      this.selectLayer(obj, true);
    }.bind(this));
    // setup layer deletion
    deleteLayer.addEvent('click', this.deleteLayer.bind(this, obj));

    // set the name of the object
    layerName.addEvent('keyup', function(e) {
      obj.setName(layerName.value);
    }.bind(this));

    layer.injectInside(this.drawer);
  },
  
  /*
    Function : selectLayer
      Set the selected layers.
      
    Parmeters :
      layer - A DrawObject.
  */
  selectLayer : function(layer, showBox)
  {
    // hide the old selected layer
    if(this.selectedLayer)
    {
      this.selectedLayer.hideBoundingBox();
    }
    
    this.selectedLayer = layer;

    if( showBox )
    {
      this.selectedLayer.showBoundingBox();
    }

    this.updateDrawer();
    this.fireEvent('onSelectLayer', {canvas: this, layer: this.selectedLayer});
    this.render();
  },
  
  /*
    Function : deleteLayer
      Delete a layer.
    
    Parmeters :
      layer - A DrawObject.
  */
  deleteLayer : function(layer)
  {
    if(this.selectedLayer == layer )
    {
      this.selectedLayer = null;
    }
    
    // cleanup the object
    layer.cleanup();
    
    // remove the layer and update
    this.displayList.remove(layer);
    this.updateDrawer(true);
    this.render();
  },
  
  /*
    Function : clear 
      Empties out the displayList and clears the drawing.
  */
  clear : function()
  {
    this.displayList = [];
    this.render();
  },
  
  /*
    Function : build
      Builds the Canvas interface.
  */
  build : function()
  {
    this.element = new ShiftSpace.Element('div', {
      'class' : 'CSContainer'
    });
    this.element.setStyle('display', 'none');
    
    this.handle = new ShiftSpace.Element('div', {
      'class' : 'CSHandle'
    });
    this.canvas = new ShiftSpace.Element('canvas', {
      'class' : "CSCanvas"
    });
    this.bottom = new ShiftSpace.Element('div', {
      'class' : "CSBottom"
    });
    this.title = new ShiftSpace.Element('input', {
      'class' : 'CSTitle',
      'value' : 'Title',
      'type' : 'text'
    });
    this.saveButton = new ShiftSpace.Element('input', {
      'type': "button", 
      'value' : 'Save',
      'class' : 'CSSaveButton'
    });
    this.viewButton = new ShiftSpace.Element('input', {
      'type': 'button',
      'value': 'View',
      'class' : 'CSSaveButton'
    });
    this.resizeControl = new ShiftSpace.Element('div', {
      'class' : 'CSResizeControl'
    });
    this.drawer = new ShiftSpace.Element('div', {
      'class': "CSDrawer CSHidden"
    });
        
    this.context = this.canvas.getContext( '2d' );
    
    this.title.injectInside(this.bottom);
    this.saveButton.injectInside(this.bottom);
    this.viewButton.injectInside(this.bottom);
    this.resizeControl.injectInside(this.bottom);

    this.handle.injectInside(this.element);
    this.canvas.injectInside(this.element);
    this.bottom.injectInside(this.element);

    this.drawer.injectInside(document.body);
    this.element.injectInside(document.body);
  },
  
  /*
    Function : hide
      Hides the main view and the drawer.
  */
  hide : function()
  {
    this.parent();
    this.drawer.addClass('CSHidden');
  }
});