/* global DT_GLOSSARY_DATA, jwplayer */

var FACET_TYPES = [];
var FACET_DICT = {};
var EXLC_FACET_KEYS = ['videoType', 'videoID', 'title', 'description'];

jQuery(document).ready(function($) {

  jwplayer.key = "gi5wgpwDtAXG4xdj1uuW/NyMsECyiATOBxEO7A==";

  var i;
  var src;
  var $niecInput = $('#niec-input');
  var $niecVideoDiv = $('#niec-glossary-video');
  var $niecChooseVideo = $('#niec-glossary-video-empty');

  $niecVideoDiv.hide();

  if (typeof DT_GLOSSARY_DATA === 'undefined' || !$.isArray(DT_GLOSSARY_DATA) || DT_GLOSSARY_DATA.length === 0) {
    $niecChooseVideo
      .find('h2').text('Error loading data for search glossary ...');
    $niecChooseVideo
      .find('p').text('Please contact an administrator of this site for assistance.');
    return;
  }

  if (!DT_GLOSSARY_DATA[0].hasOwnProperty('videoType')) {
    for (i = DT_GLOSSARY_DATA.length - 1; i >= 0; i--) {
      DT_GLOSSARY_DATA[i].videoType = 'vimeo';
    }
  }

  // get dictionary of facet keys and options
  for (i = 0; i < DT_GLOSSARY_DATA.length; i++) {
    for (var key in DT_GLOSSARY_DATA[i]) {
      if (DT_GLOSSARY_DATA[i].hasOwnProperty(key)) {
        if ($.inArray(key, EXLC_FACET_KEYS) === -1) {
          if ($.inArray(key, FACET_TYPES) === -1) {
            FACET_TYPES.push(key);
            FACET_DICT[key] = [DT_GLOSSARY_DATA[i][key]];
          } else if ($.inArray(DT_GLOSSARY_DATA[i][key], FACET_DICT[key]) === -1) {
            FACET_DICT[key].push(DT_GLOSSARY_DATA[i][key]);
          }
        }
      }
    }
  }

  // if this glossary has facets then we need to add the drop down
  // menus for faceting to work!
  if (FACET_TYPES.length > 0) {
    var $div = $('<div />').css({
      display: 'block',
      'margin-bottom': '10px'
    }).insertBefore('#niec-terms-list');

    for (i = 0; i < FACET_TYPES.length; i++) {
      var $select = $('<select />')
        .attr('data-facet', FACET_TYPES[i])
        .addClass('form-control')
        .addClass('facet').css({
          'margin-bottom': '5px'
        });

      // add a space to our camelCase keys and then uppercase
      var facet_title = FACET_TYPES[i].replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
      $('<option />').attr('value', 'none').text(facet_title).appendTo($select);

      FACET_DICT[FACET_TYPES[i]].sort();
      for (var k = 0; k < FACET_DICT[FACET_TYPES[i]].length; k++) {
        var facet = FACET_DICT[FACET_TYPES[i]][k];
        $('<option />').attr('value', k).text(facet).appendTo($select);
      }

      $select.appendTo($div).change(handleAction);
    }
  } //end if FACET_TYPES


  $('#niec-terms-list').css('height', 500 - FACET_TYPES.length * 40);

  for (i = 0; i < DT_GLOSSARY_DATA.length; i++) {
    var attrs = {
      'data-index': i
    };
    for (var j = 0; j < FACET_TYPES.length; j++) {
      var facet_key = $.inArray(DT_GLOSSARY_DATA[i][FACET_TYPES[j]], FACET_DICT[FACET_TYPES[j]]);

      attrs['data-facet-' + FACET_TYPES[j]] = facet_key;
    }

    $('#niec-terms-list').append(
      $('<a/>').text(DT_GLOSSARY_DATA[i].title)
      .attr(attrs)
      .addClass('list-group-item')
      .css('cursor', 'pointer')
    );
  }

  // ********
  // RESET
  // ********
  $('#reset-search').click(function() {
    $niecInput.val('').trigger('keyup');

    $('.facet').each(function() {
      $(this).val('none').change();
    });

    $('#niec-terms-list a.active').removeClass('active');
    $('#video-src').attr('src', '');
    $('#text').empty();
    $niecVideoDiv.hide();
    $niecChooseVideo.show();
  });

  $niecInput.keyup(handleAction);

  $('#niec-terms-list a').click(function() {
    i = $(this).attr('data-index');
    $niecChooseVideo.hide();

    $('#niec-terms-list a.active').removeClass('active');
    $(this).addClass('active');

    $('#text').empty();
    $('#text').append($('<h2 />').text(DT_GLOSSARY_DATA[i].title)).css('padding-top', '20px')
      .append($('<p />').text(DT_GLOSSARY_DATA[i].description));

    // clear iFrame and then show the div before appending it
    jwplayer('niec-glossary-video').remove();
    $('#niec-glossary-video').empty().show();

    getPlayer($('#niec-glossary-video'), DT_GLOSSARY_DATA[i].videoType, DT_GLOSSARY_DATA[i].videoID);
    // create whole new iFrame

  });


  function getPlayer($div, videoType, videoID) {
    if (videoType === 'vimeo') {
      getVimeoPlayer($div, videoID);
    } else if (videoType === 'neu') {
      getJWPlayer(videoID);
    } else if (videoType === 'drs') {
      getDRSPlayer(videoID);
    }
  }

  function getVimeoPlayer($div, videoID) {
    src = '//player.vimeo.com/video/' + videoID;
    src += '?title=0&byline=0&portrait=0&color=7C3520&autoplay=1';

    $('<iframe/>').attr('src', src).attr('id', 'video-src')
      .attr({
        webkitallowfullscreen: '',
        mozallowfullscreen: '',
        allowfullscreen: ''
      }).css({
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
      })
      .appendTo($div);
  }

  function getJWPlayer(videoID) {
    jwplayer('niec-glossary-video').setup({
      sources: [{
        file: "rtmp://libwowza.neu.edu:1935/datastreamStore/datastreams/vod/MP4:" + videoID + ".MP4"
      }, {
        file: "http://libwowza.neu.edu:1935/datastreamStore/datastreams/" + videoID + ".MP4/playlist.m3u8"
      }, {
        file: "http://libwowza.neu.edu/datastreamStore/datastreams/" + videoID + ".MP4",
        type: "mp4"
      }],
      width: '100%',
      skin: 'bekle',
      aspectratio: "16:9",
      autostart: true,
      rtmp: {
        bufferlength: 5
      },
      fallback: true
    });
  } // end getJWPlayer

  function getDRSPlayer(videoID) {
    var fullPID = "info:fedora/" + videoID + "/content/content.0";
    var encodedAvPid = videoID.replace(":", "%3A");
    var avDir = md5(fullPID).substring(0, 2);

    var fullEncodedPID = encodeURI("info%3Afedora%2F" + encodedAvPid + "%2Fcontent%2Fcontent.0"); // $full_pid = "info%3Afedora%2F".$encoded."%2Fcontent%2Fcontent.0";
    var options = {
      sources: [     {
        file: "rtmp://libwowza.neu.edu:1935/vod/_definst_/MP4:datastreamStore/cerberusData/newfedoradata/datastreamStore/" + avDir + "/info%3Afedora%2F" + encodedAvPid + "%2Fcontent%2Fcontent.0"
      },       {
        file: "http://libwowza.neu.edu:1935/vod/_definst_/datastreamStore/cerberusData/newfedoradata/datastreamStore/" + avDir + "/MP4:" + fullEncodedPID + "/playlist.m3u8"
      },       {
        file: "http://libwowza.neu.edu/datastreamStore/cerberusData/newfedoradata/datastreamStore/" + avDir + "/" + fullEncodedPID,
        type: "mp4"
      }     ],
      width: '100%',
      skin: 'bekle',
      aspectratio: "16:9",
      autostart: true,
      rtmp: {
        bufferlength: 5
      },
      fallback: true
    };
    // for (var i = 0; i < options.sources.length; i++) {
    //   var obj = options.sources[i];
    //   console.log(obj.file);
    // }
    // console.log(options);
    jwplayer('niec-glossary-video').setup(options);
  } // end getJWPlayer


  // handles search box and facet changes
  function handleAction() {
    var searchVal = $('#niec-input').val();
    var rex = new RegExp(searchVal, 'i');
    var data_facet_type = [];
    var data_facet_dict = {};

    $('.facet').each(function() {
      var which = 'data-facet-' + $(this).attr('data-facet').toLowerCase();
      data_facet_dict[which] = $(this).val();
      data_facet_type.push(which);
    });

    $('#niec-terms-list a').hide();
    $('#niec-terms-list a').filter(function() {
      for (var i = 0; i < this.attributes.length; i++) {
        if ($.inArray(this.attributes[i].name, data_facet_type) !== -1 &&
          data_facet_dict[this.attributes[i].name] !== "none") {
          if (this.attributes[i].value !== data_facet_dict[this.attributes[i].name]) {
            return false;
          }
        }
      }

      if (searchVal !== '') {
        return rex.test($(this).text());
      }

      return true; //$(this).attr(attr) === facet_value;
    }).show();

  } // end function handleAction

  // http://www.myersdaily.org/joseph/javascript/md5.js
  function md5cycle(a,b){var c=a[0],d=a[1],e=a[2],f=a[3];c=ff(c,d,e,f,b[0],7,-680876936),f=ff(f,c,d,e,b[1],12,-389564586),e=ff(e,f,c,d,b[2],17,606105819),d=ff(d,e,f,c,b[3],22,-1044525330),c=ff(c,d,e,f,b[4],7,-176418897),f=ff(f,c,d,e,b[5],12,1200080426),e=ff(e,f,c,d,b[6],17,-1473231341),d=ff(d,e,f,c,b[7],22,-45705983),c=ff(c,d,e,f,b[8],7,1770035416),f=ff(f,c,d,e,b[9],12,-1958414417),e=ff(e,f,c,d,b[10],17,-42063),d=ff(d,e,f,c,b[11],22,-1990404162),c=ff(c,d,e,f,b[12],7,1804603682),f=ff(f,c,d,e,b[13],12,-40341101),e=ff(e,f,c,d,b[14],17,-1502002290),d=ff(d,e,f,c,b[15],22,1236535329),c=gg(c,d,e,f,b[1],5,-165796510),f=gg(f,c,d,e,b[6],9,-1069501632),e=gg(e,f,c,d,b[11],14,643717713),d=gg(d,e,f,c,b[0],20,-373897302),c=gg(c,d,e,f,b[5],5,-701558691),f=gg(f,c,d,e,b[10],9,38016083),e=gg(e,f,c,d,b[15],14,-660478335),d=gg(d,e,f,c,b[4],20,-405537848),c=gg(c,d,e,f,b[9],5,568446438),f=gg(f,c,d,e,b[14],9,-1019803690),e=gg(e,f,c,d,b[3],14,-187363961),d=gg(d,e,f,c,b[8],20,1163531501),c=gg(c,d,e,f,b[13],5,-1444681467),f=gg(f,c,d,e,b[2],9,-51403784),e=gg(e,f,c,d,b[7],14,1735328473),d=gg(d,e,f,c,b[12],20,-1926607734),c=hh(c,d,e,f,b[5],4,-378558),f=hh(f,c,d,e,b[8],11,-2022574463),e=hh(e,f,c,d,b[11],16,1839030562),d=hh(d,e,f,c,b[14],23,-35309556),c=hh(c,d,e,f,b[1],4,-1530992060),f=hh(f,c,d,e,b[4],11,1272893353),e=hh(e,f,c,d,b[7],16,-155497632),d=hh(d,e,f,c,b[10],23,-1094730640),c=hh(c,d,e,f,b[13],4,681279174),f=hh(f,c,d,e,b[0],11,-358537222),e=hh(e,f,c,d,b[3],16,-722521979),d=hh(d,e,f,c,b[6],23,76029189),c=hh(c,d,e,f,b[9],4,-640364487),f=hh(f,c,d,e,b[12],11,-421815835),e=hh(e,f,c,d,b[15],16,530742520),d=hh(d,e,f,c,b[2],23,-995338651),c=ii(c,d,e,f,b[0],6,-198630844),f=ii(f,c,d,e,b[7],10,1126891415),e=ii(e,f,c,d,b[14],15,-1416354905),d=ii(d,e,f,c,b[5],21,-57434055),c=ii(c,d,e,f,b[12],6,1700485571),f=ii(f,c,d,e,b[3],10,-1894986606),e=ii(e,f,c,d,b[10],15,-1051523),d=ii(d,e,f,c,b[1],21,-2054922799),c=ii(c,d,e,f,b[8],6,1873313359),f=ii(f,c,d,e,b[15],10,-30611744),e=ii(e,f,c,d,b[6],15,-1560198380),d=ii(d,e,f,c,b[13],21,1309151649),c=ii(c,d,e,f,b[4],6,-145523070),f=ii(f,c,d,e,b[11],10,-1120210379),e=ii(e,f,c,d,b[2],15,718787259),d=ii(d,e,f,c,b[9],21,-343485551),a[0]=add32(c,a[0]),a[1]=add32(d,a[1]),a[2]=add32(e,a[2]),a[3]=add32(f,a[3])}function cmn(a,b,c,d,e,f){return b=add32(add32(b,a),add32(d,f)),add32(b<<e|b>>>32-e,c)}function ff(a,b,c,d,e,f,g){return cmn(b&c|~b&d,a,b,e,f,g)}function gg(a,b,c,d,e,f,g){return cmn(b&d|c&~d,a,b,e,f,g)}function hh(a,b,c,d,e,f,g){return cmn(b^c^d,a,b,e,f,g)}function ii(a,b,c,d,e,f,g){return cmn(c^(b|~d),a,b,e,f,g)}function md51(a){txt="";var d,b=a.length,c=[1732584193,-271733879,-1732584194,271733878];for(d=64;d<=a.length;d+=64)md5cycle(c,md5blk(a.substring(d-64,d)));a=a.substring(d-64);var e=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(d=0;d<a.length;d++)e[d>>2]|=a.charCodeAt(d)<<(d%4<<3);if(e[d>>2]|=128<<(d%4<<3),d>55)for(md5cycle(c,e),d=0;16>d;d++)e[d]=0;return e[14]=8*b,md5cycle(c,e),c}function md5blk(a){var c,b=[];for(c=0;64>c;c+=4)b[c>>2]=a.charCodeAt(c)+(a.charCodeAt(c+1)<<8)+(a.charCodeAt(c+2)<<16)+(a.charCodeAt(c+3)<<24);return b}function rhex(a){for(var b="",c=0;4>c;c++)b+=hex_chr[a>>8*c+4&15]+hex_chr[a>>8*c&15];return b}function hex(a){for(var b=0;b<a.length;b++)a[b]=rhex(a[b]);return a.join("")}function md5(a){return hex(md51(a))}function add32(a,b){return a+b&4294967295}function add32(a,b){var c=(65535&a)+(65535&b),d=(a>>16)+(b>>16)+(c>>16);return d<<16|65535&c}var hex_chr="0123456789abcdef".split("");"5d41402abc4b2a76b9719d911017c592"!=md5("hello"); // jshint ignore: line

});
