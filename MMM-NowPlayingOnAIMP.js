'use strict';

Module.register('MMM-NowPlayingOnAIMP', {

	defaults: {
		aimpUrl: '',
	},

	start: function() {
		this.initialized = false;
		this.context = {};
		this.scheduleUpdate();
	},

	getCurrentState: function() {
		this.sendSocketNotification('MMM-NowPlayingOnAIMP_UPDATE_STATE', this.config);
	},

	scheduleUpdate: function() {
		var self = this;
		this.getCurrentState();
		setInterval(function () {
			self.getCurrentState();
		}, 1000);
	},

	getStyles: function() {
		return ["MMM-NowPlayingOnAIMP.css", "font-awesome.css"];
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification == 'MMM-NowPlayingOnAIMP_CURRENT_STATE') {
			this.initialized = true;
			this.context = payload;
			this.updateDom();
		}
	},
	
	// DOM functions
	
	getDom: function() {

		let content = document.createElement('div');
		content.className = 'NPOA_container';

		if (this.context.position) {
			
			let progressContainer = document.createElement('div');
			progressContainer.className = 'NPOA_progress_container';
			progressContainer.appendChild(this.getProgressBar());
			content.appendChild(progressContainer);

			let barContainer = document.createElement('div');
			barContainer.className = 'NPOA_bar_container';
			
			var addSeparator = false;
			
			var items = (this.context.artist && this.context.artist.length ? 1 : 0) + 
				(this.context.title && this.context.title.length ? 1 : 0) +
				(this.context.album && this.context.album.length ? 1 : 0);
				
			if (this.context.artist && this.context.artist.length) {
				barContainer.appendChild(this.getDiv('fa fa-user', this.context.artist, false, items));
				addSeparator = true;
			}

			if (this.context.title && this.context.title.length) {
				barContainer.appendChild(this.getDiv('fa fa-music', this.context.title, addSeparator, items));
				addSeparator = true;
			}

			if (this.context.album && this.context.album.length) {
				barContainer.appendChild(this.getDiv('fa fa-folder', this.context.album, addSeparator, items));
				addSeparator = true;
			}

			let div = this.getDiv(
				this.context.status == 'playing' ? 'fa fa-play' : this.context.status == 'paused' ? 'fa fa-pause' : '',
				this.getTrackPosition());
			div.style.float = 'right';
			barContainer.appendChild(div);
			
			content.appendChild(barContainer);
		}
		
		return content;	
	},
	
	getDiv: function(symbol, text, addSeparator, items) {
		
		let div = document.createElement('div');
		div.className = 'NPOA_label';
		
		if (items) {
			div.style.maxWidth = 'calc(' + (100 / items) + '% - ' + (9 / items) + 'em)';
		}

		if (addSeparator) {
			let icon = document.createElement('i');
			icon.className = 'NPOA_separator fa fa-angle-double-right';
			div.appendChild(icon);
		}
		
		if (symbol) {
			let icon = document.createElement('i');
			icon.className = 'NPOA_icon ' + symbol;
			div.appendChild(icon);
		}

		div.appendChild(document.createTextNode(text));

		return div;
	},	

	getProgressBar: function() {
		
		let progressBar = document.createElement('progress');
		progressBar.className = 'NPOA_bar_progress';
		progressBar.value = this.context.position;
		progressBar.max = this.context.length;
	
		return progressBar;
	},

	getTrackPosition: function() {
		return this.formatTime(this.context.position) + ' / ' + this.formatTime(this.context.length);
	},

	formatTime: function(position) {
		
		var time_hour = (position / 3600) | 0;
		var time_min = ((position % 3600) / 60) | 0;
		var time_sec = (position % 60) | 0;

		function padout(number) {
			return (number < 10) ? '0' + number : number;
		}

		var delimeter = ':';

		return  ((time_hour > 0) ? (padout(time_hour) + delimeter) : '') + padout(time_min) + delimeter + padout(time_sec);
	}  
});
