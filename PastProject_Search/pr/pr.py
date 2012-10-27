#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import web
import json
import pyes
import math
import pickle

INDEX_NAME = 'aaa'

urls = (
    '/', 'index',
)


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
            },{
          'text': {
            'abstract': {
              'query': x,
                'operator': 'and',
                'fuzziness': 0.8,
                },
              },
            },{
          'terms': {
            'team_name': x.split(),
            },
          }],
        'minimum_number_should_match': 1,
        },
      },
    'team_name': lambda x: {
      'text': {
        'team_name': x.split(),
        },
      },
    'medal': lambda x: {
      'text': {
        'medal': x,
        },
    },
    'region': lambda x: {
      'text': {
        'region': x,
        },
    },
    'award': lambda x: {
      'text': {
        'award': x,
        },
    },
    'track': lambda x: {
      'text': {
        'track': x,
        },
    },
    'year': lambda x: {
      'range': {
        'year': {
          'gte': int(x),
          'lte': int(x),
          },
        },
      },
    }

def search(query):
    search_query = {
        'fields': ['team_name', 'year', 'region', 'medal', 'award', 'wiki_link', 'presentation_link', 'video_link', 'poster_link',
                    'championship_presentation_link', 'championship_video_link', 'championship_poster_link',
                    'school', 'description', 'title', 'track', 'abstract', 'id'],
        'from': query['from'],
        'size': 20,
        'query': {
          'custom_score': {
            'query': {
              'bool': {
                'must': [],
                }
              },
            'script': "_score"
            },
          },
        'facets': {
          'year': {'terms': { 'field': 'year' } },
          'region': {'terms': { 'field': 'region' } },
          'medal': {'terms': { 'field': 'medal' } },
          'award': {'terms': { 'field': 'award' } },
          'track':{'terms': {'field': 'track'}}
          },
        'highlight': {
          'order': 'score',
          'number_of_fragments': 5,
          'fragment_size': -1,
          'tag_schema': 'styled',
          'require_field_match': True,
          'fields': {
            'pages.content': {},
            'pages.title':{},
            },
          },
        }
    for k, v in query['obj']:
        search_query['query']['custom_score']['query']['bool']['must'].append(
          query_map[k](v)
          )
    print search_query
    res = conn.search_raw(search_query)
    ret = []
    print res
    for r in res['hits']['hits']:
        p = r['fields']
        p['score'] = r['_score']
        try:
            p['highlight'] = map(lambda x: {'content': x}, r['highlight']['pages.content'])
            p['title'] = map(lambda x: {'title': x}, r['highlight']['pages.title'])
        except:
            pass
        ret.append(p)
    return {
      'facets': res['facets'],
      'total': res['hits']['total'],
      'hits': ret,
      }

dispatch = {
    'search': search,
    }

class NoneException(Exception):
    pass

class index:
    def GET(self):
        web.header('Content-Type', 'text/html')
        return open(os.path.dirname(__file__) + '/' + 'index.html').read()
        #return idx

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
        return json.dumps(res)

#web.wsgi.runwsgi = lambda func, addr=None: web.wsgi.runfcgi(func, addr)
app = web.application(urls, globals())

if __name__ == "__main__":
    app.run()
