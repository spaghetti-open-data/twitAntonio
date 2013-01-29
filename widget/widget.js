function adjustIframes() {
	$('#twitAntonio iframe').each(function() {
		var self = $(this);
		console.debug(self);
		
		var proportion = self.data('proportion');
		var w = self.attr('width');
		var actual_w = self.width();

		self.attr('scrolling', 'no');
		self.attr('marginheight', 0);
		self.attr('marginwidth', 0);
		self.attr('width', '240px');
		self.attr('height', '260px');
		
		if (!proportion) {
			proportion = self.attr('height') / w;
			self.data('proportion', proportion);
		}

		if (actual_w != w) {
			self.css('height', Math.round(actual_w * proportion) + 'px');
		}
	});
}

$(window).on('resize load', adjustIframes);