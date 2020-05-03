'use strict';

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({

	start: function () {
		this.rpcUrl = undefined;
		this.querying = false;
	},

	socketNotificationReceived: function (notification, payload) {
		switch (notification) {
			case 'MMM-NowPlayingOnAIMP_UPDATE_STATE':
				this.getCurrentState(payload);
				break;
		}
	},

	getCurrentState: function (config) {

		if (config.aimpUrl != undefined && this.querying == false) {

			this.querying = true;
			var self = this;

			var options = { uri: config.aimpUrl, method: 'POST', json: { method: 'GetPlayerControlPanelState', params: {} } };

			request(options, function (error, response, body) {

				if (error) {
					console.error(error);
					self.querying = false;
				}
				else {
					var state = body.result;
					var options = { uri: config.aimpUrl, method: 'POST', json: { 
						method: 'GetFormattedEntryTitle', 
						params: { track_id: state.track_id, playlist_id: state.playlist_id, format_string: '{ "artist": "%a", "title": "%T", "album": "%A" }' } } };

					request(options, function (error, response, body) {

						self.querying = false;

						if (error) {
							console.error(error);
						}
						else {
							var song = JSON.parse(body.result.formatted_string);
							self.sendSocketNotification(
								'MMM-NowPlayingOnAIMP_CURRENT_STATE',
								{ artist: song.artist, album: song.album, title: song.title, position: state.track_position, length: state.track_length, status: state.playback_state });
						}
					});
				}
			});
		}
	},
});
