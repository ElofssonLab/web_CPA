#!/usr/bin/env python

import sys
# import re
import urllib2
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError
from xml.etree.ElementTree import ParseError
# from collections import defaultdict


def get_clan(raw_acc):
    acc = raw_acc.split('.')[0]
    # print "Getting " + acc + "..."
    response = urllib2.urlopen("http://pfam.xfam.org/family/" +
                         acc +
                         "?output=xml")
    html = response.read()
    data = ''
    try:
        root = ET.fromstring(html)
        for entry in root.findall("{https://pfam.xfam.org/}entry"):
            clan_obj = entry.find("{https://pfam.xfam.org/}clan_membership")
            if clan_obj is not None:
                clan_acc = clan_obj.get("clan_acc")
            else:
                clan_acc = ''
            data = "," + clan_acc
    except ParseError:
        data = ","
    return data
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
    with open(sys.argv[1]) as file_handle:
        data_to_write = file_handle.readline()  # File header
        for line in file_handle:
            print "Adding clan to " + line.split(',')[0] + "..."
            data_to_write += line.strip() + get_clan(line.split(',')[0]) + '\n'
    # print(data_to_write)
    with open('clan_' + sys.argv[1], 'w') as file_handle:
        file_handle.write(data_to_write)
    # acc_lst = open(sys.argv[1]).readlines()
    # acc_lst = [acc.strip() for acc in acc_lst]

    # get_desc(acc_lst)

    # for acc, descr in descr_dict.items():
    #     # with open('%s_descr.txt' % acc, 'w') as outfile:
    #     print(descr)
    #     with open("29.0/" + acc + "/description.txt", 'w') as outfile:
    #         outfile.write(descr)
