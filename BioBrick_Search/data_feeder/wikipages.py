#!/usr/bin/env python

import json
import urllib

def query_api(q):
    return json.loads(urllib.urlopen('http://partsregistry.org/wiki/api.php?'+urllib.urlencode(q)).read())


def step2():
    '''divide page_ids into groups each containing at most 50 ids (limitation of mediawiki API)'''
    pageids = json.load(open('pageids.json', 'r'))
    pages = []
    for p in pageids.itervalues():
        for r in p:
            pages.append(r['pageid'])
    groups = []
    for i in range(int(len(pages) / 50)+1):
        groups.append(pages[i*50:min((i+1)*50, len(pages)-1)])
    json.dump(groups, open('groups.json', 'w'))

def step3():
    '''load page contents in each group and save them to file'''
    groups = json.load(open('groups.json', 'r'))
    for i in range(len(groups)):
        group = groups[i]
        res = query_api({
            'action': 'query',
            'prop': 'revisions',
            'pageids': '|'.join(map(str,group)),
            'rvprop': 'ids|timestamp|user|comment|content',
            'format': 'json',
            })
        print('writing %d.json' % i)
        json.dump(res['query']['pages'], open('%d.json' % i, 'w'))
        

def step4():
    '''integrate page contents data into single file "pageids.json"'''
    dic = {}
    groups = json.load(open('groups.json', 'r'))
    for i in range(len(groups)):
        dic.update(json.load(open('%d.json'%i, 'r')))
    json.dump(dic, open('pages.json', 'w'))

def step1():
    '''obtain list of page_id from part_id and store it to pageids.json'''
    parts = json.load(open('parts.json', 'r'))
    try:
        pageids = json.load(open('pageids.json', 'r'))
    except:
        pageids = {}
    unflushed = 0
    for part in parts:
        if part['part_name'] not in pageids:
            res = query_api({
                'action': 'query',
                'list': 'allpages',
                'apprefix': 'Part:'+part['part_name'],
                'limit': 100,
                'format': 'json',
                })
            print('queried: '+part['part_name']+' (got %d pages)' % len(res['query']['allpages']))
            pageids[part['part_name']] = res['query']['allpages']
            unflushed += 1
            if unflushed >= 50:
                print 'flushing...'
                json.dump(pageids, open('pageids.json', 'w'))
                unflushed = 0
    json.dump(pageids, open('pageids.json', 'w'))

if __name__ == '__main__':
    #step1()
    #step2()
    #step3()
    step4()


