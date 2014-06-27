(function ($) {
  $(document).ready(function () {
	  var $channels = $('#channels'),
        $page = $('#page'),
        $videosContainer = $('#videos-container'),
        $currentVideoMetadata = $('#current-video-metadata'),
        playlistData,
        ajaxCall;

	  //Carousel playlist template
    _.templateSettings.variable = "data";

    var playlistTemplate = _.template(
      $("#playlist-item-template").html()
    );

    var channelTemplate = _.template(
      $("#channel-template").html()
    );

    var videoMetadataTemplate = _.template(
      $('#video-metadata-template').html()
    );

    var sendAjaxCall = function(url, data, dataType, success, error) {
      if (ajaxCall) {
        ajaxCall.abort();
      }

      ajaxCall = $.ajax({
        type: 'GET',
        url: url,
        dataType: dataType,
        data: data,
        success: success,
        error: error
      });
    }

    var getAllPlaylists = function(){
      var url = 'http://www.ign.com/apiproxy/slotter/playstation-app-video-browser-us';
      channelData = [];

      sendAjaxCall(url, {}, 'jsonp', function(response){
        console.log(response);
        channelData = response.response.version.items;
        var html = '';

        for (var i = 0; i < channelData.length; i++) {
          channelData[i].slug = channelData[i].url.split('/').pop();
          html += channelTemplate(channelData[i]);
        };

        $channels.append(html);
      }, function(a,b,c){
        console.log(a,b,c);
      });
    }

    var updatePlaylist = function() {
      var $this = $(this),
          data = $this.data(),
          html = '',
          url, playlistData;

      if (!data.slug) return;

      url = 'http://apis.ign.com/video/v3/playlists/slug/' + data.slug;
      
      sendAjaxCall(url, {}, 'json', function(response){
        console.log(response);
        playlistData = response.videos.data;
        var html = '';
        console.log(playlistData.length);
        for (var i = 0; i < playlistData.length; i++) {
          console.log(playlistData.length);
          var assets = playlistData[i].assets;
          if ( !assets ) return;
          var assetToUse;
          for (var j = 0; j < assets.length; j++) {
            if(assets[j].width === 1280){
              assetToUse = assets[j];
            }
          };

          if (!assetToUse) continue;

          var styleUrl = playlistData[i].thumbnails[0].styleUrl;
          playlistData[i].thumbnails[0].styleUrl = styleUrl.replace('{size}', 'medium');
          playlistData[i].assetToUse = assetToUse;
          console.log(playlistData[i]);
          html += playlistTemplate(playlistData[i]);
        };

        $('#video-list').html(html);
        $page.toggleClass("list-visible");
      }, function(a,b,c){
        console.log(a,b,c);
      });
    }

    $channels.on('click', '.channel', updatePlaylist);
    $videosContainer.on('click', '.play-option', function(e){
      e.preventDefault();
      var data = $(this).parent().data();

      $currentVideoMetadata.html(videoMetadataTemplate(data))
      
      var videoPlayer = document.getElementsByTagName('video')[0];
      videoPlayer.src = $(this).parent().data('asset');
      videoPlayer.load();
      videoPlayer.play();
    });

    getAllPlaylists();
  });
})(jQuery);