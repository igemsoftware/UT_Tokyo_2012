REGIONS = ["Africa", "Americas", "Asia", "Canada", "Europe", "Latin America", "US"];

TRACKS = ["Environment", "Food & Energy", "Foundational Advance", "Health & Medicine", "Information Processing", "Manufacturing", "New Application", "Software Tools"];

String.prototype.replaceAll = function(org, dest) {
  return this.split(org).join(dest);
};

if (!Array.indexOf) {
    Array.prototype.indexOf = function(o) {
        for (var i in this) {
            if (this[i] == o) {
                return i;
            }
        }
        return -1;
    }
}

function bbencode(b) {
  return $.base64.encode(b).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function bbdecode(b) {
  var len = (b.length % 4 > 0) ?  (4 - (b.length % 4)) : 0;
  for (var i = 0; i < len; ++i) b += '=';
  return $.base64.decode(b.replaceAll('-', '+').replaceAll('_', '/'));
}

$.views.helpers({
  format: function(str, format) {
	switch(format) {
      case "upper":
        return str.toUpperCase();
      case "lower":
        return str.toLowerCase();
      case "capitalize":
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      default:
        return str;
    }
  },
  getFields: function(object) {
  	var key, value, fieldsArray = [];
  	for (key in object) {
  	  if ( object.hasOwnProperty( key )) {
        value = object[ key ];
        // For each property/field add an object to the array, with key and value
  	    fieldsArray.push({
          key: key,
          value: value
        });
      }
    }
  	// Return the array, to be rendered using {{for ~fields(object)}}
  	return fieldsArray;
  },
  seq_formatter: function(seq, indices) {
    var res = '';
    var tmp = [];
    for (var i = 0; i < ((seq.length + 99) / 100); ++i) {
      var slice = seq.substr(i*100, 100);
      var t = [];
      for (var j = 0; j < (slice.length + 9) / 10; ++j) {
        t.push(slice.substr(j*10, 10));
      }
      tmp.push(t.join(' '));
    }
    var formatted_seq_data = tmp.join('<br>');
    function corrected_index(i) {
      var brs = Math.floor(i / 100);
      var spaces = Math.floor(i / 10);
      return i + 1*spaces + 4*brs;
    }
    var res = [];
    for (var i = 0; i < indices.length-1; ++i) {
      res.push('<span class="segment_'+i+'">'+formatted_seq_data.substring(corrected_index(indices[i]), corrected_index(indices[i+1]))+'</span>');
    }
    res.push('<span class="segment_'+(indices.length-1)+'">'+formatted_seq_data.substring(corrected_index(indices[indices.length-1]))+'</span>');
    return res.join('');
  },
});

function call_api(action, query, success_cb, failed_cb) {
  cur().data.loading = true;
  if (failed_cb === undefined) failed_cb = function(err) { $('#res').html('Error communicating with server: '+ err); };
  
  $.ajax({
	url: location.href,
	dataType: 'json',
	data: JSON.stringify({
	  action: action,
	  query: query
	}),
	type: 'POST',
	contentType: 'application/json; charset=utf-8',
	success: function(data) {
	  if (data.success) {
	    success_cb(data.result);
	  } else {
	    failed_cb(data.error);
	  }
      cur().data.loading = false;
	},
	error: failed_cb
  });
}

raty_params = {
  'readOnly': true,
  'path': 'static/img',
};

function num2rate(v) {
  if (v > 9) return 5;
  else if (v > 4) return 4;
  else if (v > 2) return 3;
  else if (v >= 1) return 2;
  else return 1;
}

function initialize(map_id, school){

  var flag = true;

  console.log(school);
// var place = school.replace(/(\s+\S+?\.+\S+?){2,}$/,"");
  var place = school.replace(/\s+\S+\.\S+\.\S+/,"");


  console.log(place);

  var opts = {
    zoom: 12,
    center: google.maps.LatLng(0,0),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  console.log(map_id);
  
  var map = new google.maps.Map(document.getElementById(map_id), opts);
  var geocoder = new google.maps.Geocoder();

  function geo(){
    geocoder.geocode({address : place}, function(results, status) {
      console.log(results);
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      }
      else{
        if(place.split(" ").length > 1){ 
          place = place.replace(/\s+\S*?$/,"");
          console.log(place.split(" ").length +" : "+ place);
          geo(); 
        }
        else{
          console.log("Geocode was not successful for the following reason: " + status);
        }
      }
    });
  }

  geo();

  console.log(map);
  //google.maps.event.trigger(map, 'resize');
}

function appendData(hits) {
  wikititle_re = new RegExp("");
  wikititle_re.compile("<{<{<wikititle>}>}>Team:(.*)<{<{</wikititle>}>}>");
  wikicontent_re = new RegExp("");
  //wikicontent_re.compile("(\\S*)\\s*(\\S*)\\s*(\\S*)\\s*(\\S*)(<em>.*?</em>)(\\S*)\\s*(\\S*)\s*(\\S*)");
  wikicontent_re.compile("(<em>.*?</em>)","m");
  for (var i = 0; i < hits.length; ++i) {
    if('highlight' in hits[i]){
      for (var j = 0; j < hits[i].highlight.length; ++j) {
        hits[i].highlight[j].content.match(wikititle_re);
        hits[i].highlight[j].title = RegExp.$1;
        hits[i].highlight[j].url =  hits[i].wiki_link.replace(/Team:.*/,"") + 'Team:' + hits[i].highlight[j].title.replace(/<.?em>/g,"").replace(/ /g,"_"); //scape is NOT allowed

      //  console.log(hits[i].highlight[j].content.match(wikicontent_re));
        hits[i].highlight[j].content.match(wikicontent_re);
        left = RegExp.leftContext;
        right = RegExp.rightContext;
        center = RegExp.$1;
        hits[i].highlight[j].revisedcontent = left.split(/\s+/).slice(-25).join(" ") + center + right.split(/\s+/,25).join(" ");
      }
    }
  }

  $('#list_'+cur().hash_data+' .list_contents').append(
    $('#team_template').render(hits)
  );
  // for (var i = 0; i < hits.length; ++i) {
  //   var p = hits[i];
  //   $('#'+p['team_name']).attr("id",i);
  // }
  for (var i = 0; i < hits.length; ++i) {
    var p = hits[i];

    $('.abstract','#'+'teamid_'+p['id']).qtip({
      content: 'abstract: ' + p.abstract,
      position: {corner: {target: 'bottomRight', tooltip: 'topLeft'}},
      hide: { fixed: true, delay: 300 },
      style: {
        //name : 'light',
        width:{max : '660'},
        border:{width : '5'},
        "background-color": "#EBFEFF"
      }
    });

  }


  for (var i = 0; i < hits.length; ++i) {
    var p = hits[i];
    $('.team_info','#'+'teamid_'+p['id']).each( function() {
      var id4map = p.year + p.team_name;
      var thisid = p['id'];
      //console.log(id4map);
      console.log(thisid);
      $(this).qtip({
        content: '<div><p>region : '+ p.region +'</p><p>school : '+ p.school + '</p><p>description : '+ p.description + '</p><div id="map_' + id4map +  '" style="width: 500px;height: 500px"></div></div>',
        // content : 'This is an active list element',
        position: {corner: {target: 'bottomLeft', tooltip: 'topRight'}},
        hide: { fixed: true, delay: 100 },
        style: { width:{max : '518'} },
        api: { onShow: function(){
            var q;
            console.log(thisid);
            for(var j = 0; j < cur().data.hits.length; ++j){
              if(cur().data.hits[j].id == thisid){
                console.log(cur().data.hits[j].id);
                q = cur().data.hits[j];
              }
            }
            console.log(q);
            initialize('map_' + id4map, q.school);
          }
        }
      });
    });
  }
}

function cat2field(cat) {
  switch(cat) {
    case 'Track': return 'track';
    case 'Medal': return 'medal';
    case 'Team Name': return 'team_name';
    case 'Year': return 'year';
    case 'Region': return 'region';
    case 'text': return 'text';
    default: return cat;
  }
}

function field2cat(field) {
  switch(field) {
    case 'track': return 'Track';
    case 'medal': return 'Medal';
    case 'team_name': return 'Team Name';
    case 'year': return 'Year';
    case 'region': return 'Region';
    case 'text': return 'text';
    default: return field;
  }
}

function getQobj(searchCollection) {
  var qobj = [];
  for (var i = 0; i < searchCollection.size(); ++i) {
    var obj = searchCollection.at(i);
    qobj.push([cat2field(obj.get('category')), obj.get('value')]);
  }
  return qobj;
}


var transitions = {
  top: {
    create: function(hash_obj) {
      $('#top_wrapper').css('display', 'block');
      cur().data.visualSearch = VS.init({
        container : $('#top_visual_search'),
        query     : '',
        callbacks : {
          search : function(query, searchCollection) {
            transit('list', getQobj(searchCollection));
          },
          facetMatches : function(callback) {
            callback([
            'Track',
            'Medal',
            'Region',
            'Team Name',
            'Year'
            ]);
          },
          valueMatches : function(facet, searchTerm, callback) {
            switch(facet) {
              case 'Track':
                callback(TRACKS);
                break;
              case 'Medal':
                callback(['Gold', 'Silver', 'Bronze']);
                break;
              case 'Region':
                callback(REGIONS);
                break;
              case 'Team Name':
                break;
              case 'Year':
                callback(['2012', '2011', '2010', '2009', '2008', '2007']);
                break;
            }
          },
        },
      });
    },
    resume: function() {
      transitions.top.create();
    },
    destroy: function() {
      $('#top_wrapper').css('display', 'none');
    },
  },
  list: {
    on_common: function() {
      $('body').append(
        $('#list_template').render({hash: cur().hash_data})
        );
      cur().data.visualSearch = VS.init({
        container : $('#list_'+cur().hash_data+' .visual_search'),
        query     : '',
        callbacks : {
          search : function(query, searchCollection) {
            if (cur().data.search_cb_action == 'search') {
              $('#list_'+cur().hash_data+' .list_contents').html('');
              cur().data.hits = [];
              call_api('search', {
                  'obj': cur().data.qed,
                  'from': cur().data.hits.length,
                },
                function(data) {
                  cur().data.first_data = data;
                  cur().data.num_total = data.total;
                  $('#list_'+cur().hash_data+' .list_navi').html(
                    $('#facet_template').render(data)
                  );
                  cur().data.hits = cur().data.hits.concat(data.hits);
                  appendData(cur().data.hits);
                }
              );
              cur().title = query;
              cur().data.search_cb_action = 'transit';
            } else if (cur().data.search_cb_action == 'append') {
              $('#list_'+cur().hash_data+' .list_navi').html(
                $('#facet_template').render(cur().data.first_data)
              );
              appendData(cur().data.hits);
              if ('active_team' in cur().data) {
                activateTeam($('#'+cur().data.active_team), 0);
              }
              cur().title = query;
              cur().data.search_cb_action = 'transit';
            } else {
              transit('list', getQobj(searchCollection));
            }
          },
          facetMatches : function(callback) {
            callback([
            'Track',
            'Medal',
            'Region',
            'Team Name',
            'Year'
            ]);
          },
          valueMatches : function(facet, searchTerm, callback) {
            switch(facet) {
              case 'Track':
                callback(TRACKS);
                break;
              case 'Medal':
                callback(['Gold', 'Silver', 'Bronze']);
              case 'Region':
                callback(REGIONS);
                break;
              case 'Team Name':
                break;
              case 'Year':
                callback(['2012', '2011', '2010', '2009', '2008', '2007']);
                break;
            }
          },
        },
      });
      $(document).on('click', '.team', function(e) {
        if ($(this).hasClass('active')) {
          window.open($('.wikilink', this).attr("id"), '_blank')
        } else {
          activateTeam(this);
        }
      });
      $(document).on('dblclick', '.team', function(e) {
        window.open($('.wikilink', this).attr("id"), '_blank')
      });
      $(document).on('click', '.facet ul li a', function(e) {
        e.preventDefault();
        var key = $(this).parents('.facet').attr('id').substr(6); // 6 == 'facet_'.length
        var val = $('.facet_term', $(this)).text();
        cur().data.visualSearch.searchBox.addFacet(field2cat(key), val, 0);
        var e = jQuery.Event("keydown");
        e.which = 13; //choose the one you want
        e.keyCode = 13;
        cur().data.visualSearch.searchBox.searchEvent(e);
      });
      $(window).scroll(function() {
        if ($('.team:last').offset().top < $(document).scrollTop() + $(window).height()) {
          if (!cur().data.loading) {
            if (cur().data.hits.length < cur().data.num_total) {
              call_api('search', {'obj': cur().data.qed, 'from': cur().data.hits.length}, function(data) {
                appendData(data.hits);
                cur().data.hits = cur().data.hits.concat(data.hits);
              });
            }
          }
        }
      });
    },
    create: function(hash_obj) {
      transitions.list.on_common();
      
      for (var i = hash_obj.length-1; i >= 0; --i) {
        cur().data.visualSearch.searchBox.addFacet(field2cat(hash_obj[i][0]), hash_obj[i][1], 0);
        
      }
      var e = jQuery.Event("keydown");
      e.which = 13; //choose the one you want
      e.keyCode = 13;
      cur().data.qed = getQobj(cur().data.visualSearch.searchQuery);
      cur().data.search_cb_action = 'search';
      cur().data.visualSearch.searchBox.searchEvent(e);
      
    },
    resume: function() {
      transitions.list.on_common();
      
      for (var i = cur().data.qed.length-1; i >= 0; --i) {
        var d = cur().data.qed[i];
        cur().data.visualSearch.searchBox.addFacet(field2cat(d[0]), d[1], 0);
      }
      cur().data.search_cb_action = 'append';
      var e = jQuery.Event("keydown");
      e.which = 13; //choose the one you want
      e.keyCode = 13;
      cur().data.visualSearch.searchBox.searchEvent(e);
      
      
    },
    destroy: function() {
      $(document).off('click', '.team');
      $(document).off('dblclick', '.team');
      $(document).off('click', '.facet ul li a');
      $(window).unbind('scroll');
      $('#list_'+cur().hash_data).remove();
    },
  },
  detail: {
    create: function(hash_obj) {
      cur().title = hash_obj;
      call_api('detail', { 'names': [hash_obj] }, function(data) {
        if (data.length == 1) {
          cur().data.part_data = data[0];
          transitions.detail.resume();
        } else {
          alert('failed to retrieve data');
          history.back();
        }
      }, function() {
      });
    },
    resume: function() {
      var features = cur().data.part_data.features;
      var indices = [];
      indices.push(0);
      for (var i = 0; i < features.length; ++i) {
        var st = features[i].startpos-1, ed = features[i].endpos-1;
        if (!indices.contains(st)) indices.push(st);
        if (!indices.contains(ed+1)) indices.push(ed+1);
      }
      indices.sort(function(a,b){return a-b;});
      cur().data.part_data.indices = indices;
      $('body').append($('#detail_template').render(cur().data.part_data));
      // add class for each feature
      for (var i = 0; i < features.length; ++i) {
        var f = features[i];
        var s = indices.indexOf(f.startpos-1); // note that startpos / endpos are 1-origin
        var e = indices.indexOf(f.endpos);
        for (var j = s; j < e; ++j) $('.segment_'+j).addClass('feature_'+f.id);
      }
      $('.feature').on('mouseenter', function(e) {
        var id = $(this).attr('id').substr(5); // feat_ + id
        $('.feature_'+id).css('color', '#f00');
      }).on('mouseleave', function(e) {
        var id = $(this).attr('id').substr(5); // feat_ + id
        $('.feature_'+id).css('color', '#000');
      });
      
      // inclusion graph
      cur().data.st = new $jit.ST({
        injectInto: 'infovis_'+cur().data.part_data.part_name,
        duration: 500,
        transition: $jit.Trans.Quart.easeInOut,
        levelDistance: 40,        
        siblingOffset: 10,
        subtreeOffset: 0,
        multitree: true,
        Navigation: {
            enable: true,
            panning: true,
        },
        Node: {
            height: 30,
            width: 100,
            type: 'rectangle',
            color: '#aaa',
            overridable: true,
            //set canvas specific styles
            //like shadows
            CanvasStyles: {
              shadowColor: '#ccc',
              shadowBlur: 10
            }
        },
        Edge: {
            type: 'line',
            overridable: true
        },
        onCreateLabel: function(label, node){
            label.id = node.id;            
            label.innerHTML = node.name;
            label.onclick = function(){
              call_api('incl_graph', {'root_part': node.id}, function(data) {
                var st = cur().data.st;
                st.updateJSON(data);
                st.refresh();
                st.setRoot(node.id, 'animate');
              });
              
            };
            //set label styles
            var style = label.style;
            style.width = 100 + 'px';
            style.height = 35 + 'px';
            style.cursor = 'pointer';
            style.color = '#333';
            style.fontSize = '0.8em';
            style.textAlign= 'center';
            style.paddingTop = '10px';
        },
      });
      call_api('incl_graph', {'root_part': cur().data.part_data.part_name}, function(data) {
        cur().data.test = data;
        console.log(data);
        var st = cur().data.st;
        st.loadJSON(data);
        st.compute('end');
        st.select(st.root, function() {
          
        });
      });
    },
    destroy: function() {
      if ('part_data' in cur().data) {
        $('#detail_'+cur().data.part_data.part_name).remove();
      }
    },
  },
};


var states_stack = [];
states_stack.push({
  state: 'top',
  title: 'Top',
  data: {},
});
var current_idx = 0;
var max_idx = 0;

function searchExistingState(state, hash_data) {
  for (var i = 0; i < states_stack.length; ++i) {
    if (state == states_stack[i].state && hash_data == states_stack[i].hash_data) {
      return i;
    } else if (state == 'top' && states_stack[i].state == 'top') {
      return i;
    }
  }
  return -1;
}

function transit(state, hash_obj) {
  if (state == 'list') {
    var obj_notation = bbencode(JSON.stringify(hash_obj));
  } else {
    var obj_notation = hash_obj;
  }
  location.hash = '#'+state+'?'+obj_notation;
}

function cur() {
  if (current_idx >= 0) {
    return states_stack[current_idx];
  } else {
    
    return {
      state: '',
      title: '',
      data: {},
    };
  }
}


function activateTeam(team, millisec) {
  if (millisec == undefined) millisec = 80;
  if (cur().state != 'list') return;
  var $p = $(team);
  $('.team.active').removeClass('active');
  $p.addClass('active');
  cur().data.active_team = $p.attr('id');
  if (!($(document).scrollTop() < $p.offset().top && $p.offset().top + $p.height() < $(document).scrollTop() + $(window).height())) {
    $('html, body').animate({ scrollTop: $p.offset().top-20 }, millisec);
  }
}

function hash_change_cb(e, first){
  if (location.hash == '') {
    // top
    if (cur().state != 'top' || first) {
      if (!first) {
        transitions[cur().state].destroy(); // destroy current state
      }
      current_idx = 0;
      transitions.top.create();
    } else {
      return;
    }
  } else {
    var p = location.hash.substr(1).split('?');
    if (p.length == 2 && (p[0] == 'list' || p[0] == 'detail')) {
      //states_stack.push(current); // push current hash
      if (!first) {
        transitions[cur().state].destroy(); // destroy current state
      }
      var idx = searchExistingState(p[0], p[1]);
      if (idx == -1) {
        // create new state
        var new_state = {
          state: p[0],
          hash_data: p[1],
          title: '',
          data: {},
        };
        states_stack.splice(current_idx+1, 0, new_state);
        current_idx += 1;
        max_idx = current_idx;
        if (p[0] == 'list') {
          var obj = JSON.parse(bbdecode(p[1]));
        } else {
          var obj = p[1];  
        }
        transitions[p[0]].create(obj);
      } else {
        // resume existing state
        current_idx = idx;
        transitions[p[0]].resume();
      }
    } else {
      // top
      if (cur().state != 'top' || first) {
        if (!first) {
          transitions[cur().state].destroy(); // destroy current state
        }
        current_idx = 0;
        transitions.top.create();
      } else {
        return;
      }
    }
  }
  $('.breadCrumb').remove();
  $('body').prepend($('#breadcrumbs_template').render({sessions: states_stack.slice(0, max_idx+1)}));
  $('.breadCrumb').jBreadCrumb ({
    previewWidth: 30,
    openElementsIndices: [current_idx],
  });
}

$(function() {
  $.reject({
    reject: {
      msie5: true, msie6: true, msie7: true, msie8: true,
      firefox1: true, firefox2: true,
    },
    close: false,
    paragraph1: 'Your browser is out of date, and is not compatible with '+
                'Team Wiki Search. A list of the most popular web browsers can be '+  
                'found below.',
    imagePath: 'static/img/browsers/'
  });

  $(window).hashchange(hash_change_cb);
  $(document).keydown(function(e) {
    if (e.target && e.target.tagName.toLowerCase() == 'textarea' || e.target.tagName.toLowerCase() == 'input') return true;
    if (cur().state == 'list') {
      if (e.keyCode == 74 || e.keyCode == 75) { // 'j', 'k'
        // find the active team
        var offset = (e.keyCode == 74) ? 1 : -1;
        var a = $('.team.active');
        if (a.length == 1) {
          if (offset == +1 && a.next().hasClass('team')) {
            activateTeam(a.next());
          } else if (offset == -1 && a.prev().hasClass('team')) {
            activateTeam(a.prev());
          }
        } else {
          // find the team to activate
          var teams = $('.team');
          var idx = 0;
          for (var i = 0; i < teams.length; ++i) {
            if ($(teams[i]).offset().top > $(document).scrollTop()) {
              idx = i;
              break;
            }
          }
          activateTeam(teams[idx]);
        }
      } else if (e.keyCode == 79) { // 'o'
        $('.team.active').dblclick();
      } else if (e.keyCode == 70) { // 'f'
        $('html, body').animate({ scrollTop: 0 }, 200, function() {
          var e = jQuery.Event("click");
          cur().data.visualSearch.searchBox.focusSearch(e);
        });
      }
      else if (e.keyCode == 66) { // 'b'
        history.back();
      }
      
    } else if (cur().state == 'detail') {
      if (e.keyCode == 66) { // 'b'
        history.back();
      }
    }
    console.log(e.keyCode);
  });
  $('#search_btn').click(function(e) {
    var e = jQuery.Event("keydown");
    e.which = 13; //choose the one you want
    e.keyCode = 13;
    cur().data.visualSearch.searchBox.searchEvent(e);
  });
  $('#lucky_btn').click(function(e) {
    var query = cur().data.visualSearch.searchBox.value();
    cur().data.visualSearch.searchBox.focusSearch(e);
    cur().data.visualSearch.searchBox.value(query);
    var q = getQobj(cur().data.visualSearch.searchQuery);
    call_api('search', {
        'obj': q,
        'from': 0,
      },
      function(data) {
      
        if (data.total > 0) {
          //transit('detail', data.hits[0].part_name);
        } else {
          //alert('No result found!');
        }
      });
    
  })
  hash_change_cb(null, true);
});
