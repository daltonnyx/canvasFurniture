fabric.groupLiPolygon = fabric.util.createClass(fabric.Group,{
	type: 'groupLiPolygon',
	initialize: function(pointArray, options, lineWidths) {
		options = options || [];
		
		this._objects = [];
		for (var i = 0; i <= pointArray.length - 1; i++) {
			var object = new fabric.LiPolygon(pointArray[i],options,lineWidths);
			object.ProName = this.ProName;
			this._objects.push(object);
		};
		options['padding'] = 4294967295;
	    this.callSuper('initialize',this._objects, options);
	},
	getActiveObject: function(f){
		f = this.toLocalPoint(f,'center','center');
		for (var i = this._objects.length - 1; i >= 0; i--) {
			    console.log(i + " " +this._objects[i].toLocalPoint(f,'center','center'));
			if(this._objects[i].containsPoint(this._objects[i].toLocalPoint(f,'center','center')))
				return this._objects[i];
		};
	}
}); 