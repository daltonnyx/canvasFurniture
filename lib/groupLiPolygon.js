fabric.groupLiPolygon = fabric.util.createClass(fabric.Group,{
	type: 'groupLiPolygon',
	childOptions: [],
	initialize: function(pointArray, options, lineWidths) {
		options = options || [];
		this._objects = [];
		for (var i = 0; i <= pointArray.length - 1; i++) {
			var object = new fabric.LiPolygon(pointArray[i],options,lineWidths);
			object.ProName = this.ProName;
			this._objects.push(object);
		};
		options['padding'] = 4294967295;
		this.childOptions = options;
	    this.callSuper('initialize',this._objects, options);
	},
	getActiveObject: function(f){
		f = this.toLocalPoint(f,'center','center');
		for (var i = this._objects.length - 1; i >= 0; i--) {
			    console.log(i + " " +this._objects[i].toLocalPoint(f,'center','center'));
			if(this._objects[i].containsPoint(this._objects[i].toLocalPoint(f,'center','center')))
				return this._objects[i];
		};
	},

	getPoints: function() {
		var points = new Array();
		for (var i = 0; i <= this._objects.length - 1; i++) {
			var objCenterPoint = this._objects[i].getCenterPoint();
			for (var j = 0; j <= this._objects[i].points.length - 1; j++) {
				var insrtPoint = new Object();
				insrtPoint.x = this._objects[i].points[j].x + objCenterPoint.x;
				insrtPoint.y = this._objects[i].points[j].y + objCenterPoint.y;
				insrtPoint.i = i;
				points.push(insrtPoint);
			}
		}
		return points;
	}
}); 