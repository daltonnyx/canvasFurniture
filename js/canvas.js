/*
 * Project Name: Furniture building
 * Author: Dalton Nyx
 * License:  GNU GENERAL PUBLIC
 *
 */
jQuery(document).ready(function($){

  // init object and variable
  var canvas = new fabric.Canvas('tutorial');
  var canvasObj = $("#tutorial");
  var p,isDragable = false,src,srcW,srcH,centerX,centerY,_isInside = false;
  var isInside = function(p,obj) {
    if(typeof(p) == 'undefined' || p == null)
      return false;
    if((p.x >= obj.offset().left) && (p.x <= (obj.offset().left + obj.width())) && (p.y >= obj.offset().top) && (p.y <= (obj.offset().top + obj.height())))
        return true;
    return false;
  }

  // Find obj part
  var objectPart = function(p) {
    var cW = canvas.width / 2;
    var cH = canvas.height / 2;
    //console.log(cW + "-" + cH + "-" + p.x + "-" + p.y);
    if(p.x < cW && p.y < cH)
        return 1;
    if(p.x > cW && p.y < cH)
        return 2;
    if(p.x > cW && p.y > cH)
        return 3;
    if(p.x < cW && p.y > cH)
        return 4;
    return 0;
  };

  var getEndPoint = function(obj,c) { //Find nearest point to canvas border
    var maxX,maxY,minX,minY;
      maxX = minX = obj.oCoords.tl.x;
    maxY = minY = obj.oCoords.tl.y;
    for(var corkey in obj.oCoords)
    {
      if (obj.oCoords.hasOwnProperty(corkey) && corkey != "mtr") {
        var cor = obj.oCoords[corkey];
        if(cor.x < minX)
          minX = cor.x;
        if(cor.x > maxX)
          maxX = cor.x;
        if(cor.y < minY)
          minY = cor.y;
        if(cor.y > maxY)
          maxY = cor.y;
      }
    }
    switch (c){
      case 1 :
        return {x:minX,y:minY};break;
      case 2 :
        return {x:maxX,y:minY};break;
      case 3 :
        return {x:maxX,y:maxY};break;
      case 4 :
        return {x:minX,y:maxY};break;
      default :
        return {};break;
    }
  };

  var getO = function(o,c){ // Get offset between object base point and end point
    var e = getEndPoint(o,c);
    return  {x:Math.abs(o.left - e.x),y:Math.abs(o.top - e.y)};
  };

  //Get SVG file to import
  $(document).on("mousedown",".svg-item",function(event){
    isDragable = true;
    src = $(event.target).data("svg");
    srcH = $(event.target).height();
    srcW = $(event.target).width();
    centerX = event.pageX - $(event.target).offset().left;
    centerY = event.pageY - $(event.target).offset().top;
  });

  //prevent default drag event -> can hook drop event
  $("html").on("dragenter",function(e){
    e.preventDefault();
  });
  $("html").on("dragleave",function(e){
    e.preventDefault();
  });
  $("html").on("dragover",function(e){
    e.preventDefault();
  });

  // Check svg inside canvas and render object
  $("html").on("drop",function(event){
    event.preventDefault();
    // pageX and pageY IN originalEvent but NOT event
    var e = event.originalEvent;
    p = {x:e.pageX,y:e.pageY};
    if(isInside(p,canvasObj) == true && isDragable)
    {
      fabric.loadSVGFromURL(src,function(objects,options){
        var obj = fabric.util.groupSVGElements(objects,options);
        obj.pathToFill = []; //set pathToFill property
        obj.srcSVG = src;
        obj.scale(srcW / obj.width);
        obj.set({
          left: canvas.getPointer(e).x - centerX,
          top: canvas.getPointer(e).y - centerY,
          hoverCursor: "move",
          lockUniScaling: true,
          lockScalingFlip: true,
          centeredScaling: true
        });
        for(var i = 0; i < obj.paths.length; i++)
        {
          if(obj.paths[i].fill == "")
          {
            obj.paths[i].setFill("#ffffff");
            obj.pathToFill.push(i);
          }
        }
        obj.cloneAsImage(function(cacheImg){ // Using cache for higher performance
          cacheImg.set({
            left: obj.left,
            top: obj.top,
            hoverCursor: "move",
            lockUniScaling: true,
            lockScalingFlip: true,
            centeredScaling: true,
            alignX: 'min',
            alignY: 'min'
          });
          cacheImg.pathToFill = obj.pathToFill;
          cacheImg.srcSVG = obj.srcSVG;
          cacheImg.scaleValue = obj.scaleX;
          cacheImg.setControlsVisibility({mtr:false,tr:false,bl:false});
          canvas.add(cacheImg);
        });
      });
      isDragable = false;
    }
  });

  var z = 1;
  //Zoom control
  var zoom = function(){
    z = $(this).val() / 100;
    var c = canvas.getCenter();
    canvas.zoomToPoint({x:c.left,y:c.top},z);
  };

  $('input[name="zoom_value"]').change(zoom);
  $('input[name="zoom_slider"]').on('input',zoom);

  // Pans control
  var isHold = false,isMoveObject = false;
  canvas.on("mouse:up",function(e){//Mouse up event
    // Reset check state - No need to check condition
      isHold = false;
      canvas.setCursor('default');
       canvas.selection = true;
      isMoveObject = false;
      isChangeCorner = -1;
      isChangeWall = -1;
      canvas.renderAll();
    //If pointer still in point area then load control
    if(this.findTarget(e.e) == polWall){
      e = e.e;
      loadWallControl(e);
    }
    else if(typeof(this.findTarget(e.e)) != 'undefined')
    {
      e = e.e;
      loadObjectControl(e);
    }

  });

  var loadWallControl = function(e){//Load Wall control
    var f = canvas.getPointer(e),
        m = {x:e.pageX,y:e.pageY},
        c = onCorner(f,polWall);
    if(c != -1){
      var control = jQuery(".wall-control");
      var p = polWall.points[c];
      control.css({"display":"block","position":"absolute","left":m.x - 120 + "px","top":m.y - 80 + "px"});
      control.find("#_i").val(c);
      control.find("#_x").val(f.x);
      control.find("#_y").val(f.y);
      control.find("#delete-cor").css("display","block");
      control.find("#add-cor").css("display","none");
      return;
    }
    else
    {
      var l = onLineWall(f,polWall);
      if(l != -1)
      {
        var control = jQuery(".wall-control");
        control.css({"display":"block","position":"absolute","left":m.x - 120 + "px","top":m.y - 80 + "px"});
        control.find("#_i").val(l);
        control.find("#_x").val(f.x);
        control.find("#_y").val(f.y);
        control.find("#add-cor").css("display","block");
        control.find("#delete-cor").css("display","none");
        return;
      }
    }
  };

var loadObjectControl = function(e){ //Load Object control
    var obj = canvas.findTarget(e),
        m = {x:e.pageX,y:e.pageY},
        control = jQuery(".object-control"),
        container = jQuery("#tutorial"),
        f = getTopPoint(obj);
    control.css({
      "display":"block",
      "position":"absolute",
      "left":f.x - (control.width() / 2) + container.offset().left + "px",
      "top":f.y - control.height() - 50 + container.offset().top + "px"});
    updateControl(obj);
    if(canvas._activeGroup != null) //Disable width, height and color control when multiple objects is selected
    {
      control.find(".control-dimession").css("display","none");
      control.find("#button-color").css("display","none");
      return;
    }
    control.find(".control-dimession").css("display","inline-block");
    if(obj.pathToFill.length > 0)
      control.find("#button-color").css("display","inline-block");
    else
      control.find("#button-color").css("display","none");
    control.find("#_w").val(obj.getWidth());
    control.find("#_h").val(obj.getHeight());
    jQuery(".width-dimession").text(Math.round(obj.getWidth()));
    jQuery(".height-dimession").text(Math.round(obj.getHeight()));
  };

  var fx,fy;
  canvas.on("mouse:down",function(e){ //Change canvas state
    e = e.e; //Replace event object with originalEvent
    if(this.findTarget(e))
    {
      isMoveObject = true;
      return;
    }
    if(charCode == 17)
    {
      isHold = true;
      canvas.setCursor('grabbing');
      canvas.selection = false;
    }
    fx = e.offsetX;
    fy = e.offsetY;
  });

  var charCode;
  document.onkeydown = function(e){
    e = e || window.event;
    charCode = e.charCode || e.keyCode;
  };
  document.onkeyup = function(e){
    charCode = null;
  }


  //Pans and wall line interactive
  canvas.on("mouse:move",function(e){ // Use as less function as you can
    if(isMoveObject == true) //Update object when mouse close to edge
    {
        e = e.e;
        if(e.offsetX < 10)
          canvas.relativePan({x: 15, y:0});
        else if(e.offsetX > canvas.getWidth() - 10)
            canvas.relativePan({x: -15, y:0});
        if(e.offsetY < 10)
          canvas.relativePan({x: 0, y:15});
        else if(e.offsetY > canvas.getHeight() - 10)
          canvas.relativePan({x:0,y:-15});
        return;
    }
    if(isHold == false)
      return;
    e = e.e;
    var moX = e.offsetX - fx;
    var moY = e.offsetY - fy;
    fx = e.offsetX;
    fy = e.offsetY;
    canvas.relativePan({x: moX, y: moY});
  });

  //Setting wall
  var wallPoints = [{x:10,y:10},{x:200,y:10},{x:200,y:150},{x:400,y:150},{x:400,y:300},{x:10,y:300}];
  var polWall = new fabric.LiPolygon(wallPoints,{
    left: 0,
    top:0,
    strokeWidth: 10,
    stroke: "#000000",
    strokeLineCap: "square",
    fill: "#f1f1f1",
    hasControls: true,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    selection: false,
    perPixelTargetFind: true, // I love this part
    padding: 4294967295 // get the fuck out, border
  },[10,10,10,10,10,10]);

 canvas.centerObject(polWall);
 canvas.add(polWall);

  var getDistance = function(p0,p1,p2){ //Get point to line distance
    var m = Math.sqrt( Math.pow( p2.y - p1.y, 2 ) + Math.pow( p2.x - p1.x, 2 ) );
    var t = Math.abs(p0.x * (p2.y - p1.y) - p0.y * (p2.x - p1.x) + p2.x * p1.y - p2.y * p1.x);
    return t/m;
  };

  var isBetween = function(p0,p1,p2){ //Check if between 2 points
    if( (p1.x < p0.x && p2.x > p0.x) || (p1.x > p0.x && p2.x < p0.x) )
      return true;
    if( (p1.y < p0.y && p2.y > p0.y) || (p1.y > p0.y && p2.y < p0.y) )
      return true;
    return false;
  };

  var onLineWall = function(p,w){ //Check on wall line
    p = w.toLocalPoint(p,'center','center');
    for(var i = 0; i < w.points.length;i++)
    {
      var p1 = w.points[i];
      var p2  = (i == w.points.length - 1) ? w.points[0] : w.points[i+1];
      var d = getDistance(p,p1,p2);
      if((d < 5) && (isBetween(p,p1,p2)) )
        return i;
    }
    return -1;
  };

  var onCorner = function(p,w){ //Check on wall corner
    p = w.toLocalPoint(p,'center','center');
    for(var i=0; i < w.points.length;i++)
    {
      var p2 = w.points[i];
      if(p.distanceFrom(p2) < 5)
        return i;
    }
    return -1;
  };

  var isChangeWall = -1;
  var isChangeCorner = -1;
  canvas.on("mouse:down",function(e) { //Start change Wall
    jQuery(".wall-control").css("display","none");
    jQuery(".object-control").css("display","none");
    jQuery(".dimession").css("display","none");
    jQuery(".delete-button").css("display","none");
    jQuery(".rotate-button").css("display","none")
    if(this.findTarget(e.e) == polWall)
    {
      e = e.e;
      var f = canvas.getPointer(e);
      var c = onCorner(f,polWall);
      if(c != -1)
      {
        isChangeCorner = c;
        fx = polWall.toLocalPoint(f,'center','center').x;
        fy = polWall.toLocalPoint(f,'center','center').y;
        return;
      }
      var l = onLineWall({x:f.x,y:f.y},polWall);
      if(l != -1)
      {
        isChangeWall = l;
        fx = polWall.toLocalPoint(f,'center','center').x;
        fy = polWall.toLocalPoint(f,'center','center').y;
      }
    }
  });

  canvas.on("mouse:move",function(e){ // Change wall line, point position
    if(isChangeCorner != -1)
    {
      var i = isChangeCorner;
      e = e.e;
      var moX = polWall.toLocalPoint(canvas.getPointer(e),'center','center').x - fx;
      var moY = polWall.toLocalPoint(canvas.getPointer(e),'center','center').y - fy;
      fx = polWall.toLocalPoint(canvas.getPointer(e),'center','center').x;
      fy = polWall.toLocalPoint(canvas.getPointer(e),'center','center').y;
      polWall.points[i].x += moX;
      polWall.points[i].y += moY;
      return;
    }
    else
    {
      if(isChangeWall == -1)
        return;
      var i = isChangeWall,j = (i == polWall.points.length - 1) ? 0 : i + 1;
      e = e.e;
      var moX = polWall.toLocalPoint(canvas.getPointer(e),'center','center').x - fx;
      var moY = polWall.toLocalPoint(canvas.getPointer(e),'center','center').y - fy;
      fx = polWall.toLocalPoint(canvas.getPointer(e),'center','center').x;
      fy = polWall.toLocalPoint(canvas.getPointer(e),'center','center').y;
      polWall.points[i].x += moX;
      polWall.points[j].x += moX;
      polWall.points[i].y += moY;
      polWall.points[j].y += moY;
    }
  });

  canvas.on("object:selected",function(e){ // Remove the Wall from selected object
    cloneOffset = 10;
    if(canvas._activeGroup == null)
      return;
    canvas._activeGroup.removeWithUpdate(polWall);
    var control = jQuery(".object-control");
    control.css({"display":"block","position":"absolute","left":canvas._activeGroup.left - (control.width()) + "px","top":canvas._activeGroup.top - 50 + "px"});
    control.find(".control-dimession").css("display","none");
    control.find("#button-color").css("display","none");
    control.find("#_w").val("");
    control.find("#_h").val("");

  });
  
  jQuery("#saveJSON").click(function(e){ //Save
    e.preventDefault();
    var jsdaa = canvas.toJSON();
    jQuery("#loadArea").val(JSON.stringify(canvas.toJSON(['srcSVG','hexCode','pathToFill','left','top','strokeWidth','strokeLineCap','fill','hasControls','hasBorders','lockMovementY','lockMovementX','perPixelTargetFind','padding'])));
    UIkit.notify({
    message : '<i class="uk-icon-check"></i> Saved!',
    status  : 'success',
    timeout : 2000,
    pos     : 'top-center'
    });
  });
  
  jQuery("#loadJSON").click(function(e){//Load
    e.preventDefault();
    var jsonString = jQuery("#loadArea").val();
    var JSONData = JSON.parse(jsonString);
    canvas.loadFromJSON(JSONData,canvas.renderAll.bind(canvas),function(o,object){ //o js json object, object is fabric object
      if(object.type == 'liPolygon')
        polWall = object;
    });
  });

  //Control part
  var cloneOffset = 10;
  jQuery(document).on("click",".wall-control #delete-cor",function(e){ //Delete Wall point
    e.preventDefault();
    var idx = jQuery(this).parent(".wall-control").find("#_i").val();
    if(idx != 'undefined')
    {
      polWall.points.splice(idx,1);
      polWall.lineWidths.splice(idx,1);
      jQuery(this).parent(".wall-control").css("display","none");
      canvas.renderAll();
    }
  });

  jQuery(document).on("click",".wall-control #add-cor",function(e){ //Add Wall point
    e.preventDefault();
    var idx = jQuery(this).parent(".wall-control").find("#_i").val();
    idx = parseInt(idx);
    if(idx != 'undefined')
    {
      var px = jQuery(this).parent(".wall-control").find("#_x").val();
      var py = jQuery(this).parent(".wall-control").find("#_y").val();
      var s = polWall.toLocalPoint({x:px,y:py},'center','center');
      var lineX = polWall.lineWidths[idx];
      polWall.lineWidths.splice(idx + 1,0,lineX);
      polWall.points.splice(idx + 1,0,s);
      canvas.renderAll();
      jQuery(this).parent(".wall-control").find("#_i").val(idx + 1);
      jQuery(this).css("display","none");
      jQuery(this).parent(".wall-control").find("#delete-cor").css("display","block");
    }
  });

  jQuery(document).on("click",".object-control #button-clone",function(e){ // Clone objects
    e.preventDefault();
    if(canvas._activeGroup != null) //For group
    {
        return;
    }
    var c = canvas.getActiveObject();
    var cC = fabric.Path.makeClone(c,cloneOffset,canvas); //Create whole new object with c.options not clone
    cloneOffset += 10;
  });

  jQuery(document).on("click",".object-control #button-remove",function(e){ // Object remove
    e.preventDefault();
    if(canvas._activeGroup != null) // For group
    {
        for(var i = 0;i < canvas._activeGroup._objects.length;i++)
        {
          canvas.remove(canvas._activeGroup._objects[i]);
        }
        canvas.remove(canvas._activeGroup._objects[0]); //Remove last object
        jQuery(this).closest(".object-control").css("display","none");
        jQuery(".object-button").css("display","none");
        jQuery(".dimession").css("display","none");
        canvas.discardActiveGroup(); // Remove control border
        canvas.discardActiveObject(); // Need both discard
        return;
    }
    var cR = canvas.getActiveObject();
    canvas.remove(cR);
    jQuery(".object-button").css("display","none");
        jQuery(".dimession").css("display","none");
    jQuery(this).closest(".object-control").css("display","none");
  });

  jQuery(document).on("mousedown",".object-control .color-hex",function(){ //Color-change
    var hexCode = "#"+jQuery(this).data("color");
    if(canvas._activeGroup != null) //For group
    {
        return;
    }
    var c = canvas.getActiveObject();
    if(c.pathToFill.length > 0)
    {
      c.hexCode = hexCode; //reference for clone
      for(var i = 0; i < c.pathToFill.length;i++)
      {
        var j = c.pathToFill[i];
        c.paths[j].setFill(hexCode);
      }
    }
    //c.render(canvas.getContext()); Don't render here -> it will be rendered bug
  });

  jQuery(document).on("mouseup",".object-control .color-hex",function(){
    canvas.renderAll(); //Render when mouse release
  });

  //Delete button
  jQuery(".delete-button").on("click",function(){
    if(canvas._activeGroup != null) // For group
    {
        for(var i = 0;i < canvas._activeGroup._objects.length;i++)
        {
          canvas.remove(canvas._activeGroup._objects[i]);
        }
        canvas.remove(canvas._activeGroup._objects[0]); //Remove last object
        jQuery(".object-button").css("display","none");
        jQuery(".dimession").css("display","none");
        jQuery(".object-control").css("display","none");
        canvas.discardActiveGroup(); // Remove control border
        canvas.discardActiveObject(); // Need both discard
        return;
    }
    var cR = canvas.getActiveObject();
    canvas.remove(cR);
    jQuery(".object-button").css("display","none");
    jQuery(".dimession").css("display","none");
    jQuery(".object-control").css("display","none");
  });

  //Rotate Button
  var isRotate = false,rF;
  jQuery(".rotate-button").on('mousedown',function(event) {
    isRotate = true;
    var control = jQuery(".object-control");
    control.css({
      "display": 'none'
    });
    rF = canvas.getPointer(event);
  });
  canvas.on('mouse:up', function(event) {
    isRotate = false;
  });
  jQuery(document).on('mouseup', function(event) {
    isRotate = false;
  });
  canvas.on("mouse:move",function(e){
   
    if(!isRotate)
      return;
    var oR = canvas.getActiveObject();
    if(oR == null)
      return;
    var rL = canvas.getPointer(e.e),
        rC = oR.getCenterPoint(),
        curAngle = oR.getAngle(),
        angle = curAngle + calcAngle(rC,rL,rF);
    if(Math.abs(angle % 90) < 3)
    {
      if(angle > 0)
        angle = Math.floor(angle / 90) * 90;
      else
        angle = Math.ceil(angle / 90) * 90;
    }
    else if (Math.abs(angle % 90) > 87)
    {
      if(angle > 0)
        angle = Math.ceil((angle / 90)) * 90;
      else
        angle = Math.floor(angle / 90) * 90;
    }
    oR.rotate(angle);
    oR.setCoords();
    canvas.renderAll();
    updateControl(oR);
    rF = rL;
  });

  jQuery(window).on('mousewheel DOMMouseScroll', function(event){
    if(event.target.nodeName != 'CANVAS')
      return;
    event.preventDefault();
    var c = canvas.getCenter();
    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
        // scroll up
        if (z >= 20)
        {
          z = 20;
          return;
        }
        z += 0.05;
    }
    else {
        // scroll down
        if (z <= 0.05)
        {
          z = 0.05;
          return;
        }
        z -= 0.05;
    }
    var oZ = canvas.getActiveObject();
    if(oZ != null)
    {
      updateControl(oZ);
    }
     canvas.zoomToPoint({x:c.left,y:c.top},z);
  });

  canvas.on("object:selected",function(){ //Render object when selected
    var oS = canvas.getActiveObject(),
        i  = canvas._objects.indexOf(oS);
    if(oS.type != "image")
      return;
    fabric.loadSVGFromURL(oS.srcSVG,function(objects,options){
        var obj = fabric.util.groupSVGElements(objects,options);
        obj.pathToFill = oS.pathToFill; //set pathToFill property
        obj.srcSVG = oS.srcSVG;
        obj.scaleValue = oS.scaleValue;
        obj.set({
          left: oS.left,
          top: oS.top,
          hoverCursor: "move",
          lockUniScaling: true,
          lockScalingFlip: true,
          centeredScaling: true
        });
        obj.scale(obj.scaleValue);
        obj.setControlsVisibility({mtr:false,tr:false,bl:false});
        canvas.remove(oS);
        canvas.insertAt(obj,i);
        canvas.setActiveObject(obj);
      });
  });

  canvas.on("before:selection:cleared",function(){ //Cache object when clear selected
    var oS = canvas.getActiveObject(),
        i  = canvas._objects.indexOf(oS);
    if(oS.type == 'image' || oS == polWall)
      return;
    oS.cloneAsImage(function(cacheImg){ // Using cache for higher performance
      cacheImg.set({
        left: oS.left,
        top: oS.top,
        hoverCursor: "move",
        lockUniScaling: true,
        lockScalingFlip: true,
        centeredScaling: true,
      });
      cacheImg.pathToFill = oS.pathToFill;
      cacheImg.srcSVG = oS.srcSVG;
      cacheImg.scaleValue = oS.scaleX;
      cacheImg.setControlsVisibility({mtr:false,tr:false,bl:false});
      canvas.remove(oS);
      canvas.insertAt(cacheImg,i);
    });
  });
});

var zoom_change = function(e) { //Change zoom value
  var sl = e.target;
  var tx = document.getElementsByName("zoom_value");
  tx[0].value = sl.value;
};

fabric.Path.makeClone = function(o,cOffset,ca){ // Custom clone object function 
  o.cloneAsImage(function(cacheImg){ // Using cache for higher performance
          cacheImg.set({
            left: o.left + cOffset,
            top: o.top + cOffset,
            hoverCursor: "move",
            lockUniScaling: true,
            lockScalingFlip: true,
            centeredScaling: true,
            alignX: 'min',
            alignY: 'min'
          });
          cacheImg.scaleValue = o.scaleValue;
          cacheImg.pathToFill = o.pathToFill;
          cacheImg.srcSVG = o.srcSVG;
          cacheImg.setControlsVisibility({mtr:false,tr:false,bl:false});
          ca.add(cacheImg);
        });
}

var getTopPoint = function(o)
{
  var t;
  for(var i in o.oCoords)
  {
    p = o.oCoords[i];
    if(typeof t == 'undefined' || t == null)
    {
      t = p;
    }
    if(t.y > p.y)
    {
      t = p;
    }
  }
  return t;
}


var calcAngle = function(p0,p1,p2) //Calc object angle
{
  var x0 = p0.x,y0 = p0.y,
      x1 = p1.x,y1 = p1.y,
      x2 = p2.x,y2 = p2.y;
  var angle = Math.atan2((x1-x0)*(y2-y0)-(x2-x0)*(y1-y0),
                (x1-x0)*(x2-x0)+(y1-y0)*(y2-y0));
  return fabric.util.radiansToDegrees(angle*(-1));
}

var updateControl = function(o) //Update user control
{
  var   rotate_button = jQuery(".rotate-button"),
        dimession_width = jQuery(".width-dimession"),
        dimession_height = jQuery(".height-dimession"),
        delete_button = jQuery(".delete-button"),
        container = jQuery("#tutorial");
  rotate_button.css({
      "display": 'block',
      "left": o.oCoords.bl.x - 10 + container.offset().left + "px",
      "top":  o.oCoords.bl.y - 12 + container.offset().top + "px",
      "transform" : "rotate("+o.getAngle()+"deg)"
  });
  delete_button.css({
      "display": 'block',
      "left": o.oCoords.tr.x - 8 + container.offset().left + "px",
      "top":  o.oCoords.tr.y - 8 + container.offset().top + "px"
  });
  var dOffsetY = (o.oCoords.mt.y > o.getCenterPoint().y) ? 0 : - 24,
      dOffsetX = (o.oCoords.mt.x >= o.getCenterPoint().x) ? 0 : - 24;
  dimession_width.css({
      "display": 'block',
      "left": o.oCoords.mt.x + dOffsetX + container.offset().left + "px",
      "top" : o.oCoords.mt.y + dOffsetY + container.offset().top + "px",
      "transform" : "rotate("+o.getAngle()+"deg)"
  });
  var hOffsetY = (o.oCoords.mr.y > o.getCenterPoint().y) ? 0 : - 24,
      hOffsetX = (o.oCoords.mr.x >= o.getCenterPoint().x) ? 0 : - 24;
  dimession_height.css({
      "display": 'block',
      "left": o.oCoords.mr.x + hOffsetX + container.offset().left + "px",
      "top" : o.oCoords.mr.y + hOffsetY + container.offset().top + "px",
      "transform" : "rotate("+ (o.getAngle() + 90) +"deg)"
  });
}