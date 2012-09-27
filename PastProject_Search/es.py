#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pyes
import json
import wikimarkup
import re
import pprint

YEAR='2008'

INDEX_NAME = 'aaa'


def remove_html_tags(data):
  p = re.compile(r'<.*?>')
  c = re.compile(r'<!--.*?-->')
  return p.sub('', c.sub('', data.replace('\n', ' ')))

#feature_type_mapping = {
#    'type': 'object', # included within parent (part) type
#    'properties': {
#        'title': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'startpos': {
#            'type': 'integer',
#            },
#        'endpos': {
#            'type': 'integer',
#            },
#        'direction': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'type': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        },
#    }
#
#
#parameter_type_mapping = {
#    'type': 'object', # included within parent (part) type
#    'dynamic': False,
#    'properties': {
#        'user_id': {
#            'type': 'integer',
#            },
#        'name': {
#            'type': 'string',
#            },
#        'url': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'value': {
#            'type': 'string',
#            },
#        'm_date': {
#            'type': 'date',
#            'format': 'yyyy-MM-dd HH:mm:ss',
#            },
#        'units': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'user_name': {
#            'type': 'string',
#            },
#        },
#    }
#
#
#page_type_mapping = {
#    'type': 'object',
#    'dynamic': False,
#    'properties': {
#        'pageid': {
#            'type': 'integer',
#            },
#        'title': {
#            'type': 'string',
#            },
#        'revid': {
#            'type': 'integer',
#            },
#        'timestamp': {
#            'type': 'date',
#            },
#        'user': {
#            'type': 'string',
#            },
#        'content': {
#            'type': 'string'
#            },
#        },
#    }
#
#team_type_mapping = {
#    'type': 'object',
#    'dynamic': False,
#    'properties': {
#        'team_name': {
#            'type': 'string',
#            },
#        'year': {
#            'type': 'integer',
#            },
#        },
#        # TODO: add track / region / prize ... ?
#    }
#
#part_type_mapping = {
#    '_all': {
#        'enabled': True,
#        #'store': 'yes',
#        },
#    'dynamic': False,
#    'properties': {
#        'seq_data': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            'include_in_all': False,
#            },
#        'best_quality': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'features': feature_type_mapping,
#        'part_name': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'part_status': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'part_short_name': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'part_id': {
#            'type': 'integer',
#            },
#        'part_rating': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'part_short_desc': {
#            'type': 'string',
#            },
#        'part_url': {
#            'type': 'string',
#            'include_in_all': False,
#            },
#        'part_entered': {
#            'type': 'date',
#            'format': 'YYYY-MM-dd',
#            },
#        'part_type': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'deep_subparts': {
#            'type': 'integer',
#            },
#        'parameters': parameter_type_mapping,
#        'specified_subparts': {
#            'type': 'integer',
#            },
#        'part_results': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'part_nickname': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'categories': {
#            'type': 'string',
#            'index': 'not_analyzed',
#            },
#        'pages': page_type_mapping,
#        'reliability': {
#            'type': 'integer',
#            },
#        'num_teams_used': {
#            'type': 'integer',
#            },
#        'submitted_by': team_type_mapping,
#        },
#    }
page_type_mapping = {
    'type': 'object',
    'dynamic': False,
    'properties': {
        'pageid': {
            'type': 'integer',
            },
        'title': {
            'type': 'string',
            },
        'revid': {
            'type': 'integer',
            },
        'timestamp': {
            'type': 'date',
            },
        'user': {
            'type': 'string',
            },
        'content': {
            'type': 'string'
            },
        },
    }

team_type_mapping = {
    '_all': {
        'enabled': True,
        #'store': 'yes',
        },
    'dynamic': False,
    'properties': {
        'team_name': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'year': {
            'type': 'integer',
            },
        'region': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'medal': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'award' : {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'wiki_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'presentation_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'video_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'poster_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'championship_presentation_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'championship_video_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'championship_poster_link': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'school': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'description': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'title': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'track': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'abstract': {
            'type': 'string',
            'index': 'not_analyzed',
        },
        'id''year': {
            'type': 'integer',
        },
        'pages': page_type_mapping,
        },
    }


def loadJson(f):
    return json.load(open(f, 'r'))

pageids = loadJson(YEAR + 'pageids.json')
pages = loadJson(YEAR + 'pages.json')
teams = loadJson(YEAR + 'teams.json')
results = loadJson(YEAR + 'results.json')
teaminfo = loadJson(YEAR + 'teaminfo.json')

# preprocess
#name2part = {}
#id2part = {}
#for part in parts:
#    name2part[part['part_name']] = part
#    id2part[part['part_id']] = part
#for team in teams:
#    for part in team['parts']:
#        name2part[part]['submitted_by'] = {'team_name': team['name'], 'year': team['year']}
#
        

def getData(team):
    res = {}

#    if 'submitted_by' not in res:
#      res['submitted_by'] = {
#        'year': int(part['part_entered'][:4]),
#        'team_name': 'Unknown',
#        }


    res.update(results[team])
    res['year'] = YEAR
    
    idx=0
    
    team_pages = []
    for pageid in pageids[team]:
#        idx += 1
#        if(idx > 79):
#            break
        try:
            p = pages[str(pageid['pageid'])]
        except:
            continue
        raw_page = p['revisions'][0]['*']
        try:
            content = remove_html_tags(wikimarkup.parse(raw_page))
        except Exception as e: # parse error
            content = remove_html_tags(raw_page) # give up parsing
            print ('give up')
        content = '<{<{<wikititle>}>}>' + pageid['title'] + '<{<{</wikititle>}>}>' + content  # add title to content header
        team_pages.append({
            'content': content,
            'title': pageid['title'],
            'revid': p['revisions'][0]['revid'],
            'timestamp': p['revisions'][0]['timestamp'],
            'user': p['revisions'][0]['user'],
            'pageid': pageid['pageid'],
            })
#        print(str(idx) + ':' + str(pageid))
#        pprint.pprint(content)
    res['pages'] = team_pages
#    res['school'] = teaminfo[team]['school']
#    res['description'] = teaminfo[team]['description']
#    res['title'] = teaminfo[team]['title']
#    res['track'] = teaminfo[team]['track']
#    res['abstract'] = teaminfo[team]['abstract']
    res.update(teaminfo[team])

#    s = score[part['part_name']]
#    res['reliability'] = s['reliability']
#    res['num_teams_used'] = s['num_teams_used']
    return res

def postData():
    conn = pyes.ES(['127.0.0.1:9201'])
    conn.create_index_if_missing(INDEX_NAME)
    conn.put_mapping('team', team_type_mapping, [INDEX_NAME])
    on = True
    times = 0
    for team in teams:
        if team == 'Heidelberg':
            continue
        times = times + 1
        print (str(times) + ':' + team)
        if on:
            conn.index(getData(team), INDEX_NAME, 'team', str(YEAR) + team)
    conn.refresh([INDEX_NAME])


def search():
    q = raw_input()
    conn = pyes.ES(['127.0.0.1:9200'])
    conn.default_indices = [INDEX_NAME]
    results = conn.search(query=pyes.query.TermQuery('_all', q))
    for r in results:
        print r

postData()
#search()
