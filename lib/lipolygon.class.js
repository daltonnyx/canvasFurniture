(function(global) {

//Custom Polygon
var LiPolygon = fabric.util.createClass(fabric.Polygon,{
  type: 'liPolygon',
  lineWidths: null, //Define separate width for each line
  lineColors: null, //Define separate color for each line
  lineArc: null,
  initialize: function(points, options, pointWidths) {
    options = options || { };
    this.points = points || [ ];
    this.pointWidths = pointWidths || [ ];
    //this.pointColors = pointColors || [ ];
    this.callSuper('initialize', options);
    this._calcDimensions();
    if (!('top' in options)) {
      this.top = this.minY;
    }
    if (!('left' in options)) {
      this.left = this.minX;
    }
  },
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
      if(typeof(this.pointWidths[i]) != 'undefined' && this.pointWidths[i] != null) {
        this.strokeWidth = this.pointWidths[i];
        this._setStrokeStyles(ctx);
      }
      point = this.points[i];
      ctx.lineTo(point.x, point.y);
    }
    return true;
  },
});
})(typeof exports !== 'undefined' ? exports : this);
