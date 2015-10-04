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
  }
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
    //console.log(obj.oCoords);
    //console.log(minX + "-" + minY);
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
  }
  var getO = function(o,c){ // Get offset between object base point and end point
    var e = getEndPoint(o,c);
    return  {x:Math.abs(o.left - e.x),y:Math.abs(o.top - e.y)};
  }
  //Get SVG file to import
  $(document).on("mousedown",".svg-item",function(event){
    isDragable = true;
    src = $(event.target).attr("src");
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
            obj.paths[i].setFill("rgb(255,128,128)");
          }
        }
        canvas.add(obj);
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
    // Reset check state
    if(isHold)
      isHold = false;
    if(isMoveObject)
      isMoveObject = false;
    if(isChangeCorner != -1)
      isChangeCorner = -1;
    if(isChangeWall != -1)
        isChangeWall = -1;
    //If pointer still in point area then load control
    if(this.findTarget(e.e) == polWall){
      e = e.e;
      var f = canvas.getPointer(e);
      var c = onCorner(f,polWall);
      if(c != -1){
        var control = jQuery(".wall-control");
        var p = polWall.points[c];
        control.css({"display":"block","position":"absolute","left":f.x - 100 + "px","top":f.y - 50 + "px"});
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
          control.css({"display":"block","position":"absolute","left":f.x - 100 + "px","top":f.y - 50 + "px"});
          control.find("#_i").val(l);
          control.find("#_x").val(f.x);
          control.find("#_y").val(f.y);
          control.find("#add-cor").css("display","block");
          control.find("#delete-cor").css("display","none");
          return;
        }
      }
    }
  });
  var fx,fy;
  canvas.on("mouse:down",function(e){
    e = e.e; //Replace event object with originalEvent
    if(this.findTarget(e))
    {
      isMoveObject = true;
      return;
    }
    isHold = true;
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

  canvas.on("mouse:move",function(e){

    if(isMoveObject == true) //Update object when mouse close to edge
    {
        e = e.e;
        if(e.offsetX < 10)
          canvas.relativePan({x: 15, y:0});
        if(e.offsetY < 10)
          canvas.relativePan({x: 0, y:15});
        if(e.offsetX > canvas.getWidth() - 10)
          canvas.relativePan({x: -15, y:0});
        if(e.offsetY > canvas.getHeight() - 10)
          canvas.relativePan({x:0,y:-15});
        return;
    }
    if(isHold == false)
      return;
    if(charCode != 17)
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
  var polWall = new fabric.Polygon(wallPoints,{
    left: 0,
    top:0,
    strokeWidth: 10,
    stroke: "#000000",
    fill: "#f1f1f1",
    hasControls: true,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    perPixelTargetFind: true, // I love this part
    padding: 4294967295 // get the fuck out border
   });
 canvas.centerObject(polWall);
 canvas.add(polWall);
  var getDistance = function(p0,p1,p2){
    var m = Math.sqrt( Math.pow( p2.y - p1.y, 2 ) + Math.pow( p2.x - p1.x, 2 ) );
    var t = Math.abs(p0.x * (p2.y - p1.y) - p0.y * (p2.x - p1.x) + p2.x * p1.y - p2.y * p1.x);
    return t/m;
  }
  var isBetween = function(p0,p1,p2){
    if( (p1.x < p0.x && p2.x > p0.x) || (p1.x > p0.x && p2.x < p0.x) )
      return true;
    if( (p1.y < p0.y && p2.y > p0.y) || (p1.y > p0.y && p2.y < p0.y) )
      return true;
    return false;
  }
  var onLineWall = function(p,w){
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
  var onCorner = function(p,w){
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
  canvas.on("mouse:move",function(e){ // Thay đổi line  của  polygon
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
    if(canvas._activeGroup == null)
      return;
    canvas._activeGroup.removeWithUpdate(polWall);
  });
  //Save
  jQuery("#saveJSON").click(function(e){
    e.preventDefault();
    var jsdaa = canvas.toJSON();
    jQuery("#loadArea").val(JSON.stringify(canvas.toJSON()));
    UIkit.notify({
    message : '<i class="uk-icon-check"></i> Saved!',
    status  : 'success',
    timeout : 2000,
    pos     : 'top-center'
    });
  });
  //Load
  jQuery("#loadJSON").click(function(e){
    e.preventDefault();
    var jsonString = jQuery("#loadArea").val();
    var JSONData = JSON.parse(jsonString);
    canvas.loadFromJSON(JSONData,canvas.renderAll.bind(canvas));
    alert(canvas._objects.length);
  });

  //Control part
  jQuery(document).on("click",".wall-control #delete-cor",function(e){
    e.preventDefault();
    var idx = jQuery(this).parent(".wall-control").find("#_i").val();
    if(idx != 'undefined')
    {
      polWall.points.splice(idx,1);
      jQuery(this).parent(".wall-control").css("display","none");
      canvas.renderAll();
    }
  });
  jQuery(document).on("click",".wall-control #add-cor",function(e){
    e.preventDefault();
    var idx = jQuery(this).parent(".wall-control").find("#_i").val();
    idx = parseInt(idx);
    if(idx != 'undefined')
    {
      var px = jQuery(this).parent(".wall-control").find("#_x").val();
      var py = jQuery(this).parent(".wall-control").find("#_y").val();
      var s = polWall.toLocalPoint({x:px,y:py},'center','center');
      polWall.points.splice(idx + 1,0,s);
      canvas.renderAll();
      jQuery(this).parent(".wall-control").find("#_i").val(idx + 1);
      jQuery(this).css("display","none");
      jQuery(this).parent(".wall-control").find("#delete-cor").css("display","block");
    }
  });
});

//Custom Polygon
var polWall = fabric.util.createClass(fabric.Polygon,{
  type: 'liPolygon',
  lineWidths: null, //Define separate width for each line
  lineColors: null, //Define separate color for each line
  lineArc: null,
  _render: function(ctx) {
    if (!this.commonRender(ctx)) {
      return;
    }
    this._renderFill(ctx);
    if (this.stroke || this.strokeDashArray) {
      ctx.closePath();
      this._renderStroke(ctx);
    }
  },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  commonRender: function(ctx) {
    var point, len = this.points.length;

    if (!len || isNaN(this.points[len - 1].y)) {
      // do not draw if no points or odd points
      // NaN comes from parseFloat of a empty string in parser
      return false;
    }
    ctx.beginPath();

    if (this._applyPointOffset) {
      if (!(this.group && this.group.type === 'path-group')) {
        this._applyPointOffset();
      }
      this._applyPointOffset = null;
    }

    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (var i = 0; i < len; i++) {
      point = this.points[i];
      ctx.lineTo(point.x, point.y);
    }
    return true;
  },
});
var zoom_change = function(e) {
  var sl = e.target;
  var tx = document.getElementsByName("zoom_value");
  tx[0].value = sl.value;
};
