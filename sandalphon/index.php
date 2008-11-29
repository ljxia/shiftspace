<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Sandalphon</title>
    
    <!-- Load mootools script files -->
    <script src="../mootools/mootools-1.2-core.js" type="text/javascript" charset="utf-8"></script>
    <script src="../mootools/mootools-1.2-more.js" type="text/javascript" charset="utf-8"></script>
    <!-- boot strap -->
    <script src="../sandbox/GreaseMonkeyApi.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/SSLog.js" type="text/javascript" charset="utf-8"></script>
    <script type="text/javascript" charset="utf-8">
      SSSetLogLevel(SSLogError);
    </script>
    
    <!-- Globals -->
    <script type="text/javascript" charset="utf-8">
      var username = "";
      // TODO: should grab this from the server, we need a page just to set the development domain - David
      var server = "http://"+window.location.host+"/~davidnolen/shiftspace-0.11/";
      var SandalphonToolMode = true;
      
      if(!ShiftSpace) var ShiftSpace = {};
      if(!ShiftSpace.UI) ShiftSpace.UI = {};
      if(!ShiftSpaceObjects) ShiftSpaceObjects = new Hash();
      if(!ShiftSpace.instantiationListeners) ShiftSpace.instantiationListeners = {};

      // paths to required ShiftSpace files
      ShiftSpaceClassPaths = {
        'SSTableViewDatasource': '/client/'
      };

      // paths to view controllers
      ShiftSpaceUIClassPaths = { 
        'SSCell': '/client/views/SSCell/',
        'SSEditableTextCell': '/client/views/SSEditableTextCell/',
        'SSTabView': '/client/views/SSTabView/',
        'SSTableView': '/client/views/SSTableView/',
        'SSTableRow': '/client/views/SSTableRow/',
        'SSConsole': '/client/views/SSConsole/'
      };

        // path to user defined view controllers
      ShiftSpaceUserClassPaths = {
        'SSCustomTableRow': '/client/customViews/SSCustomTableRow/'
      };
    </script>
    
    <script src="../client/User.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/EventProxy.js" type="text/javascript" charset="utf-8"></script>  
    <script src="../sandbox/bootstrap.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/LocalizedStringsSupport.js" type="text/javascript" charset="utf-8"></script>
    
    <script type="text/javascript" charset="utf-8">
      function SSLocalizedStringSupport()
      {
        return (typeof __sslang__ != 'undefined');
      }

      // Localized String Support
      function SSLocalizedString(string)
      {
        if(SSLocalizedStringSupport() && ShiftSpace.localizedStrings[string]) return ShiftSpace.localizedStrings[string];
        return string;
      }
      
      var __controlledNodes__ = $H();
      // This is because node references get wrapped and look different to Mootools
      function SSSetControllerForNode(controller, node)
      {
        // gen id
        node._ssgenId();
        // store the controller
        node.store('__ssviewcontroller__', controller);
        // keep back reference
        __controlledNodes__.set(node.getProperty('id'), node);
      }
      
      var SSInstantiationListeners = {};
      function SSAddInstantiationListener(element, listener)
      {
        var id = element._ssgenId();
        if(!SSInstantiationListeners[id])
        {
          SSInstantiationListeners[id] = [];
        }
        SSInstantiationListeners[id].push(listener);
      }

      function SSNotifyInstantiationListeners(element)
      {
        var listeners = SSInstantiationListeners[element.getProperty('id')];
        if(listeners)
        {
          listeners.each(function(listener) {
            if(listener.onInstantiate) 
            {
              listener.onInstantiate();
            }
          });
        }
      }

      var __controllers__ = $H();
      // This is because node references get wrapped and look different to Mootools
      function SSSetControllerForNode(controller, _node)
      {
        var node = $(_node);

        // generate our own id
        node._ssgenId();
        // keep back reference
        __controllers__.set(node.getProperty('id'), controller);
      }

      // return the controller for a node
      function SSControllerForNode(_node)
      {
        var node = $(_node);

        return __controllers__.get(node.getProperty('id')) || 
               (node.getProperty('uiclass') && new SSViewProxy(node)) ||
               null;
      }

      // Element extensions
      Element.implement({
        _ssgenId: function()
        {
          var id = this.getProperty('id');
          if(!id)
          {
            id = Math.round(Math.random()*1000000+(new Date()).getMilliseconds());
            this.setProperty('id', 'generatedId_'+id);
          }
          return id;
        },
        _getElement: function(sel)
        {
          this._ssgenId();
          return $$('#' + this.getProperty('id') + ' ' + sel)[0];
        },
        _getElements: function(sel)
        {
          this._ssgenId();
          return $$('#' + this.getProperty('id') + ' ' + sel);
        }
      });
      
      function SSServerCall(method, _parameters, _callback) {
        var callback = _callback;
        var url = server + 'shiftspace.php?method=' + method;

        var parameters = $merge({
          now: new Date()
        }, _parameters);

        new Request({
          method: 'post',
          url: url,
          data: parameters,
          onComplete: function(responseText, responseXml) 
          {
            console.log('servercall returned');

            if (typeof callback == 'function') 
            {
              try
              {
                console.log('trying ' + url);
                var theJson = JSON.decode(responseText);
              }
              catch(exc)
              {
                console.log('Server call exception: ' + SSDescribeException(exc));
              }

              callback(theJson);
            }
            else
            {
              console.log('callback is not a function');
            }
          },
          onFailure: function(err) 
          {
            console.log(err);
          }
        }).send();
      }
      
      // Actual Sandalphon
      var Sandalphon;
      // Just the interface tool
      var SandalphonTool;

      window.addEvent('domready', function() {
        waitForConsole();
      });

      function waitForConsole()
      {
        if(!window.console || !window.console.log)
        {
          setTimeout(waitForConsole, 1000);
        }
        else
        {
          // load the local store
          SandalphonTool = new SandalphonToolClass(new Persist.Store('Sandalphon'));
        }
      }
    </script>

    <script src="../client/Exception.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/SSView.js" type="text/javascript" charset="utf-8"></script>
    <script src="../client/SSViewProxy.js" type="text/javascript" charset="utf-8"></script>
    <script src="SandalphonCore.js" type="text/javascript" charset="utf-8"></script>
    <script src="persist.js" type="text/javascript" charset="utf-8"></script>
    
    <title>Sandalphon Interface Tool</title>
    
    <!-- Load the relevant style files -->
    <link rel="stylesheet" href="../styles/ShiftSpace.css" type="text/css" media="screen" title="no title" charset="utf-8" />
    <link rel="stylesheet" href="sandalphon.css" type="text/css" media="screen" title="no title" charset="utf-8" />
  </head>
  
  <body>
    
    <div id="SSSandalphonControls">
      <div style="float: left;">
        <form action="">
          <table>
            <tr>
              <th>Load Interface File:</th>
              <td>
                <input id="loadFileInput" type="text" value="/client/views/SSConsole/SSConsole"></input>
                <!--<input id="loadFile" type="button" name="LoadInterface" value="Load"></input>-->
                <input id="compileFile" type="button" name="Compile" value="Compile"></input>
                <select id="localizedStrings">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="sv">Swedish</option>
                  <option value="ko">Korean</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>Load Test File:</th>
              <td>
                <input id="loadTestInput" type="text" value="/client/views/SSConsole/test.js"></input>
                <input id="loadTestFile" type="button" name="LoadTest" value="Load"></input>
              </td>
            </tr>
          </table>
        </form>
      </div>
      <span id='title'>Sandalphon v0.1</span>
    </div>
    
    <div id="SSSandalphonDisplay">
      <div id="SSSandalphonContainer">
      </div>
    </div>
    
  </body>  
  
</html>