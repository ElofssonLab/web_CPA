#!/usr/bin/env python

import sys
# import re
import urllib2
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError
from xml.etree.ElementTree import ParseError
# from collections import defaultdict


def get_desc(acc_list):
    for raw_acc in acc_list:
        acc = raw_acc.split('.')[0]
        print "Getting " + acc + "..."
        response = urllib2.urlopen("http://pfam.xfam.org/family/" +
                             acc +
                             "?output=xml")
        html = response.read()
        try:
            root = ET.fromstring(html)
            data = ""
            for entry in root.findall("{https://pfam.xfam.org/}entry"):
                pfam_id = entry.get("id")
                desc_obj = entry.find("{https://pfam.xfam.org/}description")
                if desc_obj is not None:
                    desc = desc_obj.text.strip().encode('utf-8')
                else:
                    desc = ''
                comment_obj = entry.find("{https://pfam.xfam.org/}comment")
                if comment_obj is not None:
                    comment = comment_obj.text.strip().encode('utf-8')
                else:
                    comment = ''
                clan_obj = entry.find("{https://pfam.xfam.org/}clan_membership")
                if clan_obj is not None:
                    clan_acc = clan_obj.get("clan_acc")
                    clan_id = clan_obj.get("clan_id")
                else:
                    clan_acc = ''
                    clan_id = ''
                data += "\n".join([pfam_id, desc, comment, clan_acc, clan_id])

            with open("29.0/" + raw_acc + "/description.txt", 'w') as outfile:
                outfile.write(data)
        except ParseError:
            in_comment = False
            for line in html.split('\n'):
                if in_comment:
                    comment = line.strip()
                    break
                elif line.find("dead_comment") > -1:
                    in_comment = True
            with open("29.0/" + raw_acc + "/description.txt", 'w') as outfile:
                outfile.write("Dead family, " + comment)
            # print(html)
# def get_descr(acc_lst):
# 
#     descr_dict = defaultdict(list)
# 
#     for acc in acc_lst:
#         page = urllib2.urlopen('http://pfam.xfam.org/family/%s' % acc).read()
#         descr = ""
#         in_descr = False
#         in_h1 = False
#         was_h1 = False
#         for l in page.split('\n'):
#             if in_descr:
#                 if in_h1:
#                     was_h1 = True
#                     if '"' not in l and '<' not in l:
#                         descr += l.strip() + ': '
#                 if was_h1 and '<p>' and '</p>' in l:
#                     descr += l.replace('<p>', '').replace('</p>', '').strip() + '\n'
#                     #descr += l + '\n'
#                     descr = re.sub(r'\[.*?\]', '', descr).replace(' .', '.')
#                     descr = re.sub(r'\<.*?\>', '', descr).replace(' .', '.')
#                     descr_dict[acc] = descr
#                     break
#                 if in_h1 and '</h1>' in l:
#                     in_h1 = False
#                 if '<h1>' in l:
#                     in_h1 = True
#             if in_descr and '<!-- ================' in l:
#                 in_descr = False
#             if 'id="pfamContent"' in l:
#                 in_descr = True
# 
#     return descr_dict

if __name__ == "__main__":

    acc_lst = open(sys.argv[1]).readlines()
    acc_lst = [acc.strip() for acc in acc_lst]

    get_desc(acc_lst)

    # for acc, descr in descr_dict.items():
    #     # with open('%s_descr.txt' % acc, 'w') as outfile:
    #     print(descr)
    #     with open("29.0/" + acc + "/description.txt", 'w') as outfile:
    #         outfile.write(descr)
