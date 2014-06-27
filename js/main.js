var videoSlugs = [
    'a-haunted-house-2-video-review',
    'top-5-michael-bay-movies',
    'transformers-age-of-extinction-exclusive-tv-spot',
    'transformers-movie-trailer-trailer'
  ],
  index = 0;

(function ($) {
  var insertVideoEmbed = function(videoSlug) {
    videoSlug = videoSlug || 'a-haunted-house-2-video-review'
    data = {
      slug : videoSlug,
      width : '100%',
      autoplay : 'true',
      'force_html5' : 'true',
      companions : false
    };

    $.ajax({
      type: 'GET',
      url: 'http://widgets.ign.com/video/embed/content.jsonp',
      data: data,
      dataType: 'jsonp',
      success: function(response) {
        $('#player').html(response);
      },
      error: function(e) {
        if(typeof console !== 'undefined') {
          console.log(e);
        }
      }
    });
  };

  var cycleVideo = function() {
    console.log('trying to cycle');
    if(index < videoSlugs.length) {
      index++;
    } else {
      index = 0;
    }

    insertVideoEmbed(videoSlugs[index]);
  }

  $(document).ready(function () {
    var $channels = $('#channels'),
        $page = $('#page'),
        $videosContainer = $('#videos-container'),
        $currentVideoMetadata = $('#current-video-metadata'),
        playlistData,
        ajaxCall;

    window.onPlayerWorkflowStateChange = function (state) {
      console.log(state);
      if(state === 'PlayerState_Recirculation') {
        cycleVideo();
      }
    };

    insertVideoEmbed();
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
        console.log('aborting!');
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