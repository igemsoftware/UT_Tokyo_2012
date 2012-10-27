import re
import pprint
import json
import urllib2
import BeautifulSoup

YEAR = '2012'

teamids = json.load(open(YEAR + 'teamids.json', 'r'))
teaminfo = {}
for team in teamids:
    req = urllib2.Request('http://igem.org/Team.cgi?id=' + teamids[team]['id'])
    req.add_header('Cookie', 'team_ID=%d' % int(teamids[team]['id']))
    soup = BeautifulSoup.BeautifulSoup(urllib2.urlopen(req).read())
    print (team + ":" + teamids[team]['id'])
    teaminfo[teamids[team]['team_name']] = {
        'school': soup.find(id="table_info").tr.nextSibling.nextSibling.td.nextSibling.pre.text.replace("\r\n", "\n").replace("\n", " "),
        'description': soup.findAll(text="Description:")[0].parent.nextSibling.text.replace("\r\n", "\n").replace("\n", " "),
        'title': soup.find(id="table_abstract").tr.td.text,
        'abstract': soup.find(id="table_abstract").tr.nextSibling.td.text,
        'id': teamids[team]['id']
    }
    t = soup.find(id="table_tracks").tr.td.string.strip()
    if t.startswith('Assigned Track: '):
        t = t[len('Assigned Track: '):]
    teaminfo[teamids[team]['team_name']]['track'] = t
    #pprint.pprint(teaminfo)
json.dump(teaminfo, open(YEAR + 'teaminfo.json', 'w'), indent=4)
