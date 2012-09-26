#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import web
import json
import pyes
import math
from datetime import datetime


INDEX_NAME = 'test-index5'


#superparts = pickle.load(open('superparts.pickle'))
incl_rel = json.load(open('incl_rel.json'))


render = web.template.render('.')
idx = open(os.path.dirname(__file__) + '/' + 'index.html').read()


conn = pyes.ES(['127.0.0.1:9200'])
conn.default_indices = [INDEX_NAME]


query_map = {
    'text': lambda x: {
      'bool': {
        'should': [{
          'text': {
            'pages.content': {
              'query': x,
                'operator': 'and',
                'fuzziness': 0.8,
                },
              },
            }, {
          'terms': {
            'part_short_desc': x.split(),
            }
          }, {
          'terms': {
            'part_name': x.split(),
            },
          }],
        'minimum_number_should_match': 1,
        },
      },
    'id': lambda x: {
      'bool': {
        'should': [{
          'terms': {
            'part_name': x.split(),
            },
          },{
          'terms': {
            'part_short_name': x.split(),
            },
          }],
        'minimum_number_should_match': 1,
        },
      },
    'team_name': lambda x: {
      'text': {
        'submitted_by.team_name': x,
        },
      },
    'year': lambda x: {
      'range': {
        'submitted_by.year': {
          'gte': int(x),
          'lte': int(x),
          },
        },
      },
    'type': lambda x: {
      'terms': {
        'part_type': x.split(),
        },
      },
    'pk': lambda x: {
      'ids': {
        'type': 'part',
        'values': x,
        },
      },
    }


scripts = {
    'relevance': '_score',
    'overall': "_score * doc['reliability'].value * log10(doc['num_teams_used'].value+2)",
    'popularity': "log10(doc['num_teams_used'].value+2)",
    }


def _rough_data(query, size=20):
    search_query = {
        'fields': ['part_name', 'part_id', 'part_short_desc', 'num_teams_used', 'reliability', 'part_type', 'submitted_by',],
        'from': 0,
        'size': 20,
        'query': {
          'custom_score': {
            'query': query,
            'script': "_score * doc['reliability'].value * log10(doc['num_teams_used'].value+2)"
            },
          },
        }
    res = conn.search_raw(search_query)
    ret = []
    for r in res['hits']['hits']:
        ret.append(r['fields'])
    return ret


def search(query):
    search_query = {
        'fields': ['part_name', 'part_id', 'part_short_desc', 'num_teams_used', 'reliability', 'part_type', 'submitted_by', 'part_status', 'part_results', 'best_quality', 'pages.title'],
        'from': query['from'],
        'size': 20,
        'query': {
          'custom_score': {
            'query': {
              'bool': {
                'must': [],
                }
              },
            'script': "_score * doc['reliability'].value * log10(doc['num_teams_used'].value+2)"
            },
          },
        'facets': {
          'type': {'terms': { 'field': 'part_type' } },
          'year': {'terms': {'field': 'submitted_by.year' } },
          },
        'highlight': {
          'order': 'score',
          'number_of_fragments': 3,
          'fragment_size': 200,
          'tag_schema': 'styled',
          'require_field_match': True,
          'fields': {
            'pages.content': {},
            },
          },
        }
    for k, v in query['obj']:
        search_query['query']['custom_score']['query']['bool']['must'].append(
          query_map[k](v)
          )
    res = conn.search_raw(search_query)
    ret = []
    for r in res['hits']['hits']:
        p = r['fields']
        p['score'] = r['_score']/r['fields']['reliability']/math.log10(r['fields']['num_teams_used']+2)*10
        p['page_titles'] = p['pages.title']
        del p['pages.title']
        #try:
        #    p['score'] = r['_score']/r['fields']['reliability']/math.log10(r['fields']['num_teams_used']+2)*10
        #except: # FIXME
        #    p['score'] = 0.1
        try:
            p['highlight'] = map(lambda x: {'content': x}, r['highlight']['pages.content'])
        except:
            pass
        ret.append(p)
    return {
      'facets': res['facets'],
      'total': res['hits']['total'],
      'hits': ret,
      }


def detail(query):
    if 'ids' in query:
        res = conn.search(query=IdsQuery('part', query['ids']))
    elif 'names' in query:
        detail_query = {
            'query': {
                'bool': {
                    'should': [{
                        'terms': {
                            'part_name': query['names'],
                            },
                        },{
                        'terms': {
                            'part_short_name': query['names'],
                            },
                        },{
                        'terms': {
                            'part_nickname': query['names'],
                            },
                        },],
                        'minimum_number_should_match': 1,
                    },
                },
            }

        res = conn.search_raw(detail_query)
    ret = []
    for r in res['hits']['hits']:
        obj = r['_source']
        obj['related_parts'] = {}
        # same team
        obj['related_parts']['same_team'] = _rough_data({'bool': { 'must': [query_map['year'](obj['submitted_by']['year']), query_map['team_name'](obj['submitted_by']['team_name'])]}})
        ret.append(obj)
    return ret


def incl_graph(query):
    def recr_node(name, dir, depth_left):
        node = {
            'id': name,
            'name': name,
            'data': {
                '$orn': ('right' if dir == 'sub' else 'left'),
                'part_type': incl_rel[name]['part_type'],
                'part_short_desc': incl_rel[name]['part_short_desc']
                },
            'children': [],
            }
        if depth_left == 0:
            return node
        next_depth = incl_rel[name][dir] # dir == 'sub' or 'sup'
        for next_name in next_depth:
            node['children'].append(recr_node(next_name, dir, depth_left-1))
        return node

    qbase = {'sup_depth': 3, 'sub_depth': 5}
    qbase.update(query)
    query = qbase
    root = query['root_part']
    if root not in incl_rel:
        raise ValueError
    res = recr_node(root, 'sub', query['sub_depth'])
    sup_res = recr_node(root, 'sup', query['sup_depth'])
    res['children'] += sup_res['children']
    del res['data']['$orn']
    return res


feedback_mapping = {'you_are': {'type': 'string'},
 'team': {'type': 'string'},
 'name': {'type': 'string'},
 'email': {'type': 'string'},
 'reasons': {'type': 'string'},
 'reasons_other_text': {'type': 'string'},
 'useful': {'type': 'string'},
 'help_team': {'type': 'string'},
 'help_team_how': {'type': 'string'},
 'help_team_why_fail': {'type': 'string'},
 'suggestion': {'type': 'string'},
 'submitted': {'type': 'date'},
 'user_agent': {'type': 'string'},
 'ip_addr': {'type': 'ip'},
}
conn.put_mapping('feedback', feedback_mapping, [INDEX_NAME])
log_mapping = {
  'action': {'type': 'string'},
  'query': {'type': 'object'},
  'ip_addr': {'type': 'ip'},
  'datetime': {'type': 'date'},
  'user_agent': {'type': 'string'},
}
conn.put_mapping('log', log_mapping, [INDEX_NAME])


def feedback(query):
    #print(query)
    query['submitted'] = datetime.now()
    query['user_agent'] = web.ctx.env['HTTP_USER_AGENT']
    query['ip_addr'] = web.ctx.ip
    conn.index(query, INDEX_NAME, 'feedback')
    return True


dispatch = {
    'search': search,
    'detail': detail,
    'incl_graph': incl_graph,
    'feedback': feedback,
    }


class NoneException(Exception):
    pass


urls = (
    '/', 'index',
)


class index:
    def GET(self):
        web.header('Content-Type', 'text/html')
        conn.index({'action': 'top', 'submitted': datetime.now(), 'user_agent': web.ctx.env['HTTP_USER_AGENT'], 'ip_addr': web.ctx.ip}, INDEX_NAME, 'log')
        return open(os.path.dirname(__file__) + '/' + 'index.html').read()
        return idx

    def POST(self):
        q = json.loads(web.data())
        try:
            res = {
                'success': True,
                'result': (dispatch[q['action']])(q['query'])
                }
        except NoneException:
            pass
        #except Exception as e:
        #    res = {
        #        'success': False,
        #        'error': str(e)
        #        }
        web.header('Content-Type', 'application/json')
        q['submitted'] = datetime.now()
        q['user_agent'] = web.ctx.env['HTTP_USER_AGENT']
        q['ip_addr'] = web.ctx.ip
        conn.index(q, INDEX_NAME, 'log')
        return json.dumps(res)


#web.wsgi.runwsgi = lambda func, addr=None: web.wsgi.runfcgi(func, addr)
app = web.application(urls, globals())


if __name__ == "__main__":
    app.run()
