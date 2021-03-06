// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListView
// ==/Builder==

var ShiftListView = new Class({

  Extends: SSListView, 
  name: "ShiftListView",
  
  
  defaults: function()
  {
    return $merge(this.parent(), {
      scrollEvents: true,
      customShiftList: false
    });
  },

  
  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, 'onNewShiftSave', this.onCreate.bind(this));
    SSAddObserver(this, 'onShiftShow', this.onShow.bind(this));
    SSAddObserver(this, 'onShiftHide', this.onHide.bind(this));
    SSAddObserver(this, 'onUserLogout', this.uncheckAll.bind(this));
  },
  
  
  onScrollTop: function() {},
  
  
  onScrollBottom: function()
  {
    this.__reloadData__(this.table().read({start:this.count()}), this.count());
  },
  
  
  willShow: function()
  {
    SSPostNotification("onShiftListViewWillShow", {listView:this});
  },


  willHide: function()
  {
    this.uncheckAll();
    SSPostNotification("onShiftListViewWillHide", {listView:this});
  },

  
  onRowSelect: function(idx)
  {
    this.parent(idx);
    var shift = this.data()[idx],
        noErr = true;
    if(!this.options.customShiftList) noErr = SSShowShift(SSSpaceForName(shift.space.name), shift._id);
    if(!noErr) this.deselectRow(idx);
  },
  

  onRowDeselect: function(idx)
  {
    var shift = this.data()[idx];
    if(!this.options.customShiftList) SSHideShift(SSSpaceForName(shift.space.name), shift._id);
  },
  
  
  onCreate: function(id)
  {
    if(!this.isVisible()) return;
    this.refresh();
    var idx = this.find(function(x) { return x._id == id; });
    this.selectRow(idx);
  },
  
  
  onShow: function(id)
  {
    if(!this.isVisible()) return;
    var idx = this.find(function(x) { return x._id == id; });
    if(idx != -1)
    {
      this.selectRow(idx);
    }
  },


  onHide: function(id)
  {
    if(!this.isVisible()) return;
    var idx = this.find(function(x) { return x._id == id; });
    if(idx != -1)
    {
      this.deselectRow(idx);
    }
  },
  
  
  onDelete: function(ack)
  {
    this.refresh();
  },
  
  
  check: function(indices)
  {
    indices = $splat(indices);
    var cell = this.cell();
    indices.each(function(idx, i) {
      var cellNode = this.cellNodeForIndex(idx);
      cell.lock(cellNode);
      cell.check();
      cell.unlock();
    }, this);
  },
  

  onCheck: function(evt)
  {
    var id = evt.data._id;
    /*
    if(SSUserCanEditShift(id))
    {
      SSEditShift(SSSpaceForShift(id), id);
    }
    */
  },

  
  uncheck: function(indices, noEvent)
  {
    indices = $splat(indices);
    var cell = this.cell();
    indices.each(function(idx, i) {
      var cellNode = this.cellNodeForIndex(idx);
      cell.lock(cellNode);
      cell.uncheck(noEvent);
      cell.unlock();
    }, this);
  },


  onUncheck: function(evt)
  {
    var id = evt.data._id;
    SSEditExitShift(SSSpaceForShift(id), id);
  },


  uncheckAll: function(noEvent)
  {
    if(!this.isVisible()) return;
    this.uncheck(this.checkedItemIndices(), noEvent);
  },
  
  
  checkedItemIndices: function()
  {
    var indices = [];
    this.cellNodes().each(function(el, i) {
      if(el.getElement('input.SSInputField[type=checkbox]').getProperty("checked")) indices.push(i);
    });
    return indices;
  },


  checkedItems: function()
  {
    return this.checkedItemIndices().map(this.data().asFn());
  },


  checkedItemIds: function()
  {
    return this.checkedItemIndices().map(Function.comp(this.data().asFn(), Function.acc("_id")));
  },
  
  
  onReloadData: function()
  {
    // we need to wait until the styles for the rounded images are loaded
    /*
    if(!__mainCssLoaded)
    {
      SSAddObserver(this, 'onMainCssLoad', function() {
        RoundedImage.init(".ShiftListView .ShiftListViewCell .gravatar", new Window(this.element.getWindow()), document);
      });
    }
    else
    {
      RoundedImage.init(".ShiftListView .ShiftListViewCell .gravatar", new Window(this.element.getWindow()), document);
    }
    */
  },


  openShift: function(sender, evt)
  {
    var id = evt.data._id,
        href = evt.data.href;
    SSSetValue("__currentShift", {id: evt.data._id, href: href});
    window.open(evt.data.href);
  }
});