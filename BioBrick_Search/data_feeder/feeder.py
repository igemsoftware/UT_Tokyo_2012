#!/usr/bin/env python
# -*- coding: utf-8 -*-

import pyes
import json
import wikimarkup
import re

INDEX_NAME = 'test-index5'

def remove_html_tags(data):
  p = re.compile(r'<.*?>')
  c = re.compile(r'<!--.*?-->')
  return p.sub('', c.sub('', data.replace('\n', ' ')))

feature_type_mapping = {
    'type': 'object', # included within parent (part) type
    'properties': {
        'title': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'startpos': {
            'type': 'integer',
            },
        'endpos': {
            'type': 'integer',
            },
        'direction': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'type': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        },
    }


parameter_type_mapping = {
    'type': 'object', # included within parent (part) type
    'dynamic': False,
    'properties': {
        'user_id': {
            'type': 'integer',
            },
        'name': {
            'type': 'string',
            },
        'url': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'value': {
            'type': 'string',
            },
        'm_date': {
            'type': 'date',
            'format': 'yyyy-MM-dd HH:mm:ss',
            },
        'units': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'user_name': {
            'type': 'string',
            },
        },
    }


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
    'type': 'object',
    'dynamic': False,
    'properties': {
        'team_name': {
            'type': 'string',
            },
        'year': {
            'type': 'integer',
            },
        },
        # TODO: add track / region / prize ... ?
    }

part_type_mapping = {
    '_all': {
        'enabled': True,
        #'store': 'yes',
        },
    'dynamic': False,
    'properties': {
        'seq_data': {
            'type': 'string',
            'index': 'not_analyzed',
            'include_in_all': False,
            },
        'best_quality': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'features': feature_type_mapping,
        'part_name': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'part_status': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'part_short_name': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'part_id': {
            'type': 'integer',
            },
        'part_rating': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'part_short_desc': {
            'type': 'string',
            },
        'part_url': {
            'type': 'string',
            'include_in_all': False,
            },
        'part_entered': {
            'type': 'date',
            'format': 'YYYY-MM-dd',
            },
        'part_type': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'deep_subparts': {
            'type': 'integer',
            },
        'parameters': parameter_type_mapping,
        'specified_subparts': {
            'type': 'integer',
            },
        'part_results': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'part_nickname': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'categories': {
            'type': 'string',
            'index': 'not_analyzed',
            },
        'pages': page_type_mapping,
        'reliability': {
            'type': 'integer',
            },
        'num_teams_used': {
            'type': 'integer',
            },
        'submitted_by': team_type_mapping,
        },
    }



def loadJson(f):
    return json.load(open(f, 'r'))

pageids = loadJson('pageids.json')
parts = loadJson('parts.json')
pages = loadJson('pages.json')
score = loadJson('score.json')
teams = loadJson('teams.json')

# preprocess
name2part = {}
id2part = {}
for part in parts:
    name2part[part['part_name']] = part
    id2part[part['part_id']] = part
for team in teams:
    for part in team['parts']:
        name2part[part]['submitted_by'] = {'team_name': team['name'], 'year': team['year']}

partinfo_re = re.compile('<partinfo>.*</partinfo>')
        

def getData(part):
    res = {}
    res.update(part)

    if 'submitted_by' not in res:
      res['submitted_by'] = {
        'year': int(part['part_entered'][:4]),
        'team_name': 'Unknown',
        }
    part_pages = []
    for pageid in pageids[part['part_name']]:
        try:
            p = pages[str(pageid['pageid'])]
        except:
            continue
        raw_page = partinfo_re.sub('', p['revisions'][0]['*'])
        try:
            content = remove_html_tags(wikimarkup.parse(raw_page))
        except Exception as e: # parse error
            content = remove_html_tags(raw_page) # give up parsing
        part_pages.append({
            'content': content,
            'title': pageid['title'],
            'revid': p['revisions'][0]['revid'],
            'timestamp': p['revisions'][0]['timestamp'],
            'user': p['revisions'][0]['user'],
            'pageid': pageid['pageid'],
            })
    res['pages'] = part_pages
    s = score[part['part_name']]
    res['reliability'] = s['reliability']
    res['num_teams_used'] = s['num_teams_used']
    return res


def postData():
    conn = pyes.ES(['127.0.0.1:9200'])
    conn.create_index_if_missing(INDEX_NAME)
    conn.put_mapping('part', part_type_mapping, [INDEX_NAME])
    on = True
    for part in parts:
        #if part['part_name'] == 'BBa_K079031':
        #    on = True
        print part['part_name']
        if on:
            conn.index(getData(part), INDEX_NAME, 'part', part['part_id'])
    conn.refresh([INDEX_NAME])


def search():
    q = raw_input()
    conn = pyes.ES(['localhost:9201'])
    conn.default_indices = [INDEX_NAME]
    results = conn.search(query=pyes.query.TermQuery('_all', q))
    for r in results:
        print r

postData()
#search()
