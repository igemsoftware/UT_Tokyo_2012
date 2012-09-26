#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import operator
from pprint import pprint


print('loading parts data...')
parts = json.load(open('parts.json', 'r'))
teams = json.load(open('teams.json', 'r'))
print('data loaded')


# preprocess
name2part = {}
id2part = {}
for part in parts:
    name2part[part['part_name']] = part
    id2part[part['part_id']] = part
for team in teams:
    for part in team['parts']:
        name2part[part]['submitted_by'] = str(team['year'])+' '+team['name']

incl_rel = {}
for part in parts:
    incl_rel[part['part_name']] = {'sup': [], 'sub': []}
for part in parts:
    this = part['part_name']
    incl_rel[this]['part_type'] = part['part_type']
    incl_rel[this]['part_short_desc'] = part['part_short_desc']
    for ssp in part['specified_subparts']:
        parent = id2part[ssp]['part_name']
        if parent not in incl_rel[this]['sub']:
            incl_rel[this]['sub'].append(parent)
        if this not in incl_rel[parent]['sup']:
            incl_rel[parent]['sup'].append(this)
json.dump(incl_rel, open('incl_rel.json', 'wb'), indent=2)

superparts = {}
for part in parts:
    for ssp in part['specified_subparts']:
        if ssp not in superparts:
            superparts[ssp] = [part['part_id']]
        else:
            superparts[ssp].append(part['part_id'])
        if 'superparts' not in id2part[ssp]:
            id2part[ssp]['superparts'] = [part['part_id']]
        else:
            id2part[ssp]['superparts'].append(part['part_id'])
#print superparts

def describe(part):
    print(u'%s (ID: %d) %s' % (part['part_name'], part['part_id'], part['part_short_name']))
    print(u'Abs: %f, Rel: %f' % (abs_evaluate(part), rel_evaluate(part)))
    print(u'Type: %s' % part['part_type'])
    print(u'Length: %d' % len(part['seq_data']))
    if 'deep_subparts' in part:
        print('Flattened: '+' - '.join(map(lambda x: id2part[x]['part_name'], part['deep_subparts'])))
    if 'specified_subparts' in part:
        print('Specified: '+' - '.join(map(lambda x: id2part[x]['part_name'], part['specified_subparts'])))
    if 'superparts' in part:
        print('Contained in: '+', '.join(map(lambda x: id2part[x]['part_name'], part['superparts'])))
    if 'submitted_by' in part:
        sb = part['submitted_by']
        print('Submitted by: %d %s' % (sb['year'], sb['name']))
    print(u'%s' % part['part_short_desc'])
    print


def search(parts, qs, types, attrs=None):
    if not attrs:
        attrs = ('part_name', 'part_short_name', 'part_short_desc', 'part_nickname', 'part_type')
    res = []
    for part in parts:
        if types and part['part_type'].lower() not in types:
            continue
        ok = True
        for q in qs:
            found = False
            for attr in attrs:
                if part[attr].lower().find(q.lower()) != -1:
                    found = True
                    break
            if not found:
                ok = False
                break
        if ok:
            res.append(part)
    return res

def get_teams(part):
    s = set()
    if 'teams' in part:
        return part['teams']
    if 'submitted_by' in part:
        s.add(part['submitted_by'])
    if 'superparts' in part:
        for superpart in part['superparts']:
            if superpart == part['part_id']: continue
            b = get_teams(id2part[superpart])
            s.update(b)
    part['teams'] = s
    return s

def reliability(part):
    pos = neg = 0
    if part['part_results'] == 'Fails': neg += 2
    elif part['part_results'] == 'Issues': neg += 1
    elif part['part_results'] == 'Works': pos += 1
    if part['part_status'] == 'Available': pos += 1
    if part['best_quality'] == 'Confirmed': pos += 1
    elif part['best_quality'] == 'Questionable': neg += 1
    elif part['best_quality'] == 'Bad Sequencing': neg += 2
    
    if pos >= 3 and neg == 0: return 5
    elif pos >= 2 and neg == 0: return 4
    elif pos - neg > 0: return 3
    elif pos - neg == 0: return 2
    elif pos < neg: return 1


score = {}
for part in parts:
    score[part['part_name']] = {
            'num_teams_used': len(get_teams(part)),
            'reliability': reliability(part),
            }
json.dump(score, open('score.json', 'wb'))

def abs_evaluate(part):
    if 'score' in part:
        return part['score']

    weights = {
    'results': {
        'Fails': -20.0,
        'Issues': -3,
        'None': 0.0,
        'Works': +10.0,
        },
    'status': {
        'Available': +10.0,
        },
    'best_quality': {
        'Bad Sequencing': -2.0,
        'Confirmed': +2.0,
        'Long Part': 0.0,
        'None': 0.0,
        'Partially Confirmed': +1.0,
        'Questionable': -1.0,
        },
    }
    score = 5.0
    for key, weight in weights.items():
        if key in part:
            if part[key] in weight:
                score += weight[part[key]]
    if 'superparts' in part:
        #print part['superparts']
        for sp in part['superparts']:
            if sp != part['part_id']:
                score += 0.1 * abs_evaluate(id2part[sp])
    part['abs_score'] = score
    return score


def rel_evaluate(part):
    if 'rel_score' in part:
        return part['rel_score']
    res = abs_evaluate(part)
    a = 0
    for ssp in part['specified_subparts']:
        a += 0.2 * abs_evaluate(id2part[ssp])
    if len(part['specified_subparts']) > 0:
        a /= len(part['specified_subparts'])
        res += a
    part['rel_score'] = res
    return res


def parts_comp(x, y):
    rx = rel_evaluate(x)
    ry = rel_evaluate(y)
    if rx > ry:
        return -1
    elif rx < ry:
        return +1
    else:
        return 0


def main():
    while True:
        try:
            q = raw_input('query? ').split(' ')
        except EOFError:
            break
        part_type = raw_input('type? ').lower()
        if not part_type:
            part_type = []
        else:
            part_type = part_type.split(' ')
        ans = search(parts, q, part_type)
        ans.sort(cmp=parts_comp)
        for i, a in enumerate(ans[:10]):
            print 'Result: %d of %d' % (i+1, len(ans))
            describe(a)


#if __name__ == '__main__':
#    main()
