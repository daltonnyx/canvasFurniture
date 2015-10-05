//Custom Polygon
var LiPolygon = fabric.util.createClass(fabric.Polygon,{
  type: 'liPolygon',
  lineWidths: null, //Define separate width for each line
  lineColors: null, //Define separate color for each line
  lineArc: null,
  points: null,
  initialize: function(points, options, lineWidths) {
    options = options || { };
    this.points = points || [ ];
    this.lineWidths = lineWidths || [ ];
    //this.pointColors = pointColors || [ ];
    this.callSuper('initialize', points, options);
  },
  _render: function(ctx) {
    if(!this.callSuper('commonRender',ctx))
      return;
    this.callSuper('_renderFill',ctx);
    // if (this.stroke || this.strokeDashArray) {
      ctx.closePath();
      ctx.stroke();
    // }
    if(!this.commonRender(ctx))
      return;
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
    for (var i = 1; i <= len; i++) {
      var j = i;
      //this._renderStroke(ctx);
      if(typeof(this.lineWidths[j-1]) != 'undefined' && this.lineWidths[j-1] != null) {
        //ctx.save();
        ctx.beginPath();
        if (this._applyPointOffset) {
          if (!(this.group && this.group.type === 'path-group')) {
            this._applyPointOffset();
          }
          this._applyPointOffset = null;
        }
        this._setStrokeStyles(ctx,this.lineWidths[j-1]);
      }
      if(i == len)
        j = 0;
      point = this.points[j];
      ctx.moveTo(this.points[i-1].x, this.points[i-1].y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    return true;
  },
  _setStrokeStyles: function(ctx,lineWidth){
      this.strokeWidth = lineWidth;
      this.callSuper('_setStrokeStyles',ctx);
  },
});
