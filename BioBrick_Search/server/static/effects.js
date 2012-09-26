TYPES = ["Generator", "Conjugation", "Cell", "Intermediate", "Other", "Protein_Domain", "Temporary", "Reporter", "Composite", "Device", "DNA", "T7", "RBS", "Project", "Regulatory", "Plasmid", "Signalling", "RNA", "Coding", "Plasmid_Backbone", "Translational_Unit", "Tag", "Terminator", "Measurement", "Inverter", "Primer"];

String.prototype.replaceAll = function(org, dest) {
  return this.split(org).join(dest);
};

if (!Array.indexOf) {
    Array.prototype.indexOf = function(o) {
        for (var i in this) {
            if (this[i] == o) {
                return parseInt(i, 10);
            }
        }
        return -1;
    };
}

function bbencode(b) {
  return $.base64.encode(b).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function bbdecode(b) {
  var len = (b.length % 4 > 0) ?  (4 - (b.length % 4)) : 0;
  for (var i = 0; i < len; ++i) b += '=';
  return $.base64.decode(b.replaceAll('-', '+').replaceAll('_', '/'));
}


function showTips(j) {
  xOffset = 10;
  yOffset = 20;
  var text = $('.tooltip_data', j).html();
  $(j).hover(function(e) {
    $tip = $('<div id="tip">'+text+'</p>')
    .css("top", (e.pageY - xOffset) + "px")
    .css('font-size', '70%')
    .css('position', 'absolute')
    .css('padding', '3px')
    .css('background-color', '#333').css('box-shadow', '0px 0px 5px').css('color', '#eee')
    .css("left", (e.pageX + yOffset) + "px")
    .css('z-index', 100000)
    .fadeIn("fast");
    $('body').append($tip);
  }, function(e) {
    $('#tip').remove();
  });
  $(j).mousemove(function(e) {
    $('#tip').css("top",(e.pageY - xOffset) + "px")
    .css("left",(e.pageX + yOffset) + "px");
  });
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
      case 'underscore':
        return str.replaceAll(' ', '_').toLowerCase();
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
    for (i = 0; i < indices.length-1; ++i) {
      res.push('<span class="segment_'+i+'">'+formatted_seq_data.substring(corrected_index(indices[i]), corrected_index(indices[i+1]))+'</span>');
    }
    res.push('<span class="segment_'+(indices.length-1)+'">'+formatted_seq_data.substring(corrected_index(indices[indices.length-1]))+'</span>');
    return res.join('');
  }
});

function call_api(action, query, success_cb, failed_cb) {
  cur().data.loading = true;
  if (failed_cb === undefined) failed_cb = function(err) {};

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
  'path': 'static/img'
};

function num2rate(v) {
  if (v > 9) return 5;
  else if (v > 4) return 4;
  else if (v > 2) return 3;
  else if (v >= 1) return 2;
  else return 1;
}

function appendData(hits) {
  $('#list_'+cur().hash_data+' .list_contents').append(
    $('#part_template').render(hits)
  );
  for (var i = 0; i < hits.length; ++i) {
    var p = hits[i];
    raty_params.score = p['reliability'];
    $('#'+p['part_name']+'_reli_star_raty').raty(raty_params);
    raty_params.score = p['score'];
    $('#'+p['part_name']+'_rele_star_raty').raty(raty_params);
    raty_params.score = num2rate(p['num_teams_used']);
    $('#'+p['part_name']+'_pop_star_raty').raty(raty_params);
    $('#'+p['part_name']+'_entry .stars .star').each(function() {
      showTips(this);
    });
  }
}

function cat2field(cat) {
  switch(cat) {
    case 'ID': return 'id';
    case 'Team Name': return 'team_name';
    case 'Year': return 'year';
    case 'Type': return 'type';
    case 'text': return 'text';
    default: return cat;
  }
}

function field2cat(field) {
  switch(field) {
    case 'id': return 'ID';
    case 'team_name': return 'Team Name';
    case 'year': return 'Year';
    case 'type': return 'Type';
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
            'ID',
            'Type',
            { label: 'Team Name', category: 'Team Submitted' },
            { label: 'Year', category: 'Team Submitted' }
            ]);
          },
          valueMatches : function(facet, searchTerm, callback) {
            switch(facet) {
              case 'ID':
                break;
              case 'Type':
                callback(TYPES);
                break;
              case 'Team Name':
                break;
              case 'Year':
                callback(['2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005', '2004', '2003']);
                break;
            }
          }
        }
      });
      var e = jQuery.Event("keydown");
      cur().data.visualSearch.searchBox.focusSearch(e);
    },
    resume: function() {
      transitions.top.create();
    },
    destroy: function() {
      $('#top_wrapper').css('display', 'none');
    }
  },
  list: {
    on_common: function() {
      $('body').prepend(
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
                  'from': cur().data.hits.length
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
              if ('active_part' in cur().data) {
                activatePart($('#'+cur().data.active_part), 0);
              }
              cur().title = query;
              cur().data.search_cb_action = 'transit';
            } else {
              transit('list', getQobj(searchCollection));
            }
          },
          facetMatches : function(callback) {
            callback([
            'ID',
            'Type',
            { label: 'Team Name', category: 'Team Submitted' },
            { label: 'Year', category: 'Team Submitted' }
            ]);
          },
          valueMatches : function(facet, searchTerm, callback) {
            switch(facet) {
              case 'ID':
                break;
              case 'Type':
                callback(TYPES);
                break;
              case 'Team Name':
                break;
              case 'Year':
                callback(['2012', '2011', '2010', '2009', '2008', '2007']);
                break;
            }
          }
        }
      });
      $(document).on('click', '.part', function(e) {
        if ($(this).hasClass('active')) {
          transit('detail', $('h1', $(this)).text());
        } else {
          activatePart(this);
        }
      });
      $(document).on('dblclick', '.part', function(e) {
        transit('detail', $('h1', $(this)).text());
      });
      $(document).on('click', '.part .stars .star', function(e) {
        
      });
      $(document).on('click', '.facet ul li a', function(e) {
        e.preventDefault();
        var key = $(this).parents('.facet').attr('id').substr(6); // 6 == 'facet_'.length
        var val = $('.facet_term', $(this)).text();
        cur().data.visualSearch.searchBox.addFacet(field2cat(key), val, 0);
        var ev = jQuery.Event("keydown");
        ev.which = 13; //choose the one you want
        ev.keyCode = 13;
        cur().data.visualSearch.searchBox.searchEvent(ev);
      });
      $(window).scroll(function() {
        if ($('.part:last').offset().top < $(document).scrollTop() + $(window).height()) {
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
      $(document).off('click', '.part');
      $(document).off('dblclick', '.part');
      $(document).off('click', '.facet ul li a');
      $(window).unbind('scroll');
      $('#list_'+cur().hash_data).remove();
    }
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
      $('body').prepend($('#detail_template').render(cur().data.part_data));
      // add class for each feature
      for (i = 0; i < features.length; ++i) {
        var f = features[i];
        var s = indices.indexOf(f.startpos-1); // note that startpos / endpos are 1-origin
        var e = indices.indexOf(f.endpos);
        for (var j = s; j < e; ++j) {
          $('.segment_'+j).addClass('feature_'+f.id);
        }
      }
      $('.feature').on('mouseenter', function(e) {
        var id = $(this).attr('id').substr(5); // feat_ + id
        $('.feature_'+id).addClass('active_seq');
      }).on('mouseleave', function(e) {
        var id = $(this).attr('id').substr(5); // feat_ + id
        $('.feature_'+id).removeClass('active_seq');
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
            panning: true
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
            type: 'bezier',
            overridable: true
        },
        onCreateLabel: function(label, node){
            label.id = node.id;
            label.innerHTML = node.name;
            label.onclick = function(){
              transit('detail', node.id);
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
        }
      });
      call_api('incl_graph', {'root_part': cur().data.part_data.part_name}, function(data) {
        cur().data.test = data;
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
    }
  }
};


var states_stack = [];
states_stack.push({
  state: 'top',
  title: 'Top',
  data: {}
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
  var obj_notation;
  if (state == 'list') {
    obj_notation = bbencode(JSON.stringify(hash_obj));
  } else {
    obj_notation = hash_obj;
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
      data: {}
    };
  }
}


function activatePart(part, millisec) {
  if (millisec === undefined) millisec = 80;
  if (cur().state != 'list') return;
  var $p = $(part);
  $('.part.active .appendix').hide();
  $('.part.active').removeClass('active');
  $p.addClass('active');
  cur().data.active_part = $p.attr('id');
  $('.appendix', $p).show();
  if (!($(document).scrollTop() < $p.offset().top && $p.offset().top + $p.height() < $(document).scrollTop() + $(window).height() - 100)) {
    $('html, body').animate({ scrollTop: $p.offset().top-20 }, millisec);
  }
}

function hash_change_cb(e, first){
  if (location.hash === '') {
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
          data: {}
        };
        states_stack.splice(current_idx+1, 0, new_state);
        current_idx += 1;
        max_idx = current_idx;
        var obj;
        if (p[0] == 'list') {
          obj = JSON.parse(bbdecode(p[1]));
        } else {
          obj = p[1];
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
  $('.breadCrumb').jBreadCrumb({
    previewWidth: 30,
    openElementsIndices: [current_idx]
  });
  if (cur().state == 'top') {
    document.title = 'BioBrick Search';
  } else {
    document.title = cur().title + ' - BioBrick Search';
  }
}

$(function() {
  $.reject({
    reject: {
      msie5: true, msie6: true, msie7: true, msie8: true,
      firefox1: true, firefox2: true
    },
    close: false,
    paragraph1: 'Your browser is out of date, and is not compatible with '+
                'BioBrick Search. A list of the most popular web browsers can be '+
                'found below.',
    imagePath: 'static/img/browsers/'
  });

  $(window).hashchange(hash_change_cb);


  $('#feedback_form_dialog').dialog({
    autoOpen: false,
    width: 540,
    modal: true,
    resize: false,
    draggable: false,
    show: 'drop',
    hide: { effect:'drop', direction: 'right' },
    buttons: [{
      text: 'Cancel',
      click: function() {
        $(this).dialog('close');
      }
    },{
      text: 'Submit',
      click: function() {
        var param = {};
        $($('#feedback_form').serializeArray()).each(function(i, v) {
            if (v.name == 'reasons') {
              if ('reasons' in param) param['reasons'].push(v.value);
              else param['reasons'] = [v.value];
            } else {
              param[v.name] = v.value;
            }
        });
        $('#feedback_form_dialog #res').html('Submitting.');
        var timerId = setInterval(function() {
          var s = $('#feedback_form_dialog #res').html();
          if (s.split('.').length > 5) s = 'Submitting.';
          else s += '.';
          $('#feedback_form_dialog #res').html(s);
        }, 100);
        call_api('feedback', param, function(data) {
          clearInterval(timerId);
          $('#feedback_form_dialog #res').html('Feedback successfully submitted!');
          setTimeout(function() {
            $('#feedback_form_dialog').dialog('close');
          }, 800);
        }, function() {
          clearInterval(timerId);
          $('#feedback_form_dialog #res').html('OMG... Failed to submit your feedback.');
        });
      }
    }]
  });
  $('#you_are').change(function() {
    if ($(this).val() == 'iGEM Participant (2012)') {
      $('#team').removeAttr('disabled');
    } else {
      $('#team').attr('disabled', 'disabled');
    }
  });
  $('#reasons_other').change(function() {
    if ($(this).is(':checked')) {
      $('#reasons_other_text').removeAttr('disabled');
    } else {
      $('#reasons_other_text').attr('disabled', 'disabled');
    }
  });
  $('#feedback_form_dialog input[name="help_team"]:radio').change(function() {
    if ($(this).val() == 'yes') {
      $('#help_team_how').removeAttr('disabled');
      $('#help_team_why_fail').attr('disabled', 'disabled');
    } else {
      $('#help_team_why_fail').removeAttr('disabled');
      $('#help_team_how').attr('disabled', 'disabled');
    }
  });


  $('#feedback_link').click(function(e) {
    e.preventDefault();
    $('#feedback_form_dialog').dialog('open');
  });

  $(document).keydown(function(e) {
    if (e.target && e.target.tagName.toLowerCase() == 'textarea' || e.target.tagName.toLowerCase() == 'input') return true;
    if (cur().state == 'list') {
      if (e.keyCode == 74 || e.keyCode == 75) { // 'j', 'k'
        // find the active part
        var offset = (e.keyCode == 74) ? 1 : -1;
        var a = $('.part.active');
        if (a.length == 1) {
          if (offset == +1 && a.next().hasClass('part')) {
            activatePart(a.next());
          } else if (offset == -1 && a.prev().hasClass('part')) {
            activatePart(a.prev());
          }
        } else {
          // find the part to activate
          var parts = $('.part');
          var idx = 0;
          for (var i = 0; i < parts.length; ++i) {
            if ($(parts[i]).offset().top > $(document).scrollTop()) {
              idx = i;
              break;
            }
          }
          activatePart(parts[idx]);
        }
      } else if (e.keyCode == 79) { // 'o'
        $('.part.active').dblclick();
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
  $('#search_btn').click(function(ev) {
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
        'from': 0
      },
      function(data) {

        if (data.total > 0) {
          transit('detail', data.hits[0].part_name);
        } else {
          alert('No result found!');
        }
      });

  });
  hash_change_cb(null, true);
});
