jQuery(document).ready(function($) {
	$('#productSelect').on('change', function(event) {
		var type = $(event.target).val(),url;
		switch(type){
			case 'door' :
				url = '/path/door.html';
				break;
			case 'floor' :
				url = '/path/floor.html';
				break;
			case 'furniture':
				url= '/path/furniture.html';
				break;
			default :
				url = '/path/furniture.html';
				break;
		}
		$.ajax({
			url: '/canvasFurniture' + url,
			type: 'GET',
			dataType: 'html',
			data: {},
		})
		.done(function(data) {
			console.log("success");
			$('.funiture-list').html(data);
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
		

		/* Act on the event */
	});
});