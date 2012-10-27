#!/usr/bin/env python

import json
import urllib
import re

YEAR='2012'

def query_api(q):
    return json.loads(urllib.urlopen('http://' + YEAR + '.igem.org/wiki/api.php?'+urllib.urlencode(q)).read())


def step2():
    '''divide page_ids into groups each containing at most 50 ids (limitation of mediawiki API)'''
    pageids = json.load(open(YEAR + 'pageids.json', 'r'))
    pages = []
    for p in pageids.itervalues():
        for r in p:
            pages.append(r['pageid'])
    groups = []
    for i in range(int(len(pages) / 50)+1):
        groups.append(pages[i*50:min((i+1)*50, len(pages)-1)])
    json.dump(groups, open(YEAR + 'groups.json', 'w'))

def step3():
    '''load page contents in each group and save them to file'''
    groups = json.load(open(YEAR + 'groups.json', 'r'))
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
    groups = json.load(open(YEAR + 'groups.json', 'r'))
    for i in range(len(groups)):
        dic.update(json.load(open('%d.json'%i, 'r')))
    json.dump(dic, open(YEAR + 'pages.json', 'w'))

def step1():
    '''obtain list of page_id from part_id and store it to pageids.json'''
    teams = json.load(open(YEAR + 'teams.json', 'r'))
    try:
        pageids = json.load(open(YEAR + 'pageids.json', 'r'))
    except:
        pageids = {}
    unflushed = 0
    
    prefixList = {}
    for team in teams:
        prefixList[team] = []
    for team in teams:
        for team2 in teams:
            if(team == team2):
                continue
            else:
                if re.match(team+'.*', team2+'$'):
                    prefixList[team].append(team2)
    
    for team in teams:
        if team not in pageids:
            res = query_api({
                'action': 'query',
                'list': 'allpages',
                'apprefix': 'Team:' + team,
                'aplimit': 500,
                'format': 'json',
                })
            print('queried: '+ team +' (got %d pages)' % len(res['query']['allpages']))
            pageids[team] = []
            for i in range(len(res['query']['allpages'])):
                flag = 0
                for team2 in prefixList[team]:
                    if re.match(r'Team:' + team2.replace('_',' ') + r'.*', res['query']['allpages'][i]['title']):
                        flag = 1
                        print('Damepo :not for ' + team + ' but for ' + team2 + ' about ' + res['query']['allpages'][i]['title'])
                #for team2 in teams:
                #    if (team == team2):
                #        continue
                #    else:
                #        match = re.match(r'Team:' + team2.replace('_',' ') + r'.*', res['query']['allpages'][i]['title'])
                #        if match:
                #            flag = 1
                #            print('Damepo : ' + team + " : " + team2 + " : " + res['query']['allpages'][i]['title'])
                if (flag == 0):
                    pageids[team].append(res['query']['allpages'][i])
                #match = re.match(r'Team:' + team.replace('_',' ') + r'(/|$).*', res['query']['allpages'][i]['title'])
                #if match:
                #    pageids[team].append(res['query']['allpages'][i])
                #else:
                #    print('Not match :' + team + ' : ' + res['query']['allpages'][i]['title'])
            #pageids[team] = res['query']['allpages']
            unflushed += 1
            if unflushed >= 50:
                print 'flushing...'
                json.dump(pageids, open(YEAR + 'pageids.json', 'w'))
                unflushed = 0
    json.dump(pageids, open(YEAR + 'pageids.json', 'w'))

if __name__ == '__main__':
    step1()
    step2()
    step3()
    step4()


