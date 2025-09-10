import os
import json

def extract_word(filename):
    return filename[4:-4]

words_with_audio = [
    extract_word(filename)
    for filename in os.listdir('data/audio')
]

class InvalidTonesException(Exception):
    pass

def split_tones(pinyin):
    pinyin = pinyin.split()
    readings = []
    tones = []
    for t in pinyin:
        reading, tone = t[:-1], t[-1]
        try:
            tone = int(tone)
        except ValueError:
            raise InvalidTonesException(f'{tone}')
        if tone == 5:
            tone = 0
        assert 0 <= tone <= 4
        readings.append(reading)
        tones.append(tone)
    return readings, tones

with open('cedict_tabs.txt', 'r', encoding='utf-8') as fin:
    cedict = dict()
    repeats = set()
    for line in fin.readlines():
        line = line[:-1]
        if len(line) > 0:
            _, hanzi, tones, _ = line.split('\t')
            try:
                readings, tones = split_tones(tones)
                # assert hanzi not in cedict, hanzi
                if hanzi in cedict and tones != cedict[hanzi]:
                    repeats.add(hanzi)
                else:
                    cedict[hanzi] = (readings, tones)
            except InvalidTonesException:
                pass

result = []
for word in words_with_audio:
    if word not in cedict or word in repeats or len(cedict[word][1]) != 2:
        continue
    readings, tones = cedict[word]
    result.append({
        'expression': word,
        'audio': 'cmn-' + word + '.mp3',
        'pinyin': ' '.join(readings),
        'pattern': ' '.join(map(str, tones))
    })

with open('words.json', 'w') as fout:
    json.dump(result, fout, indent=2, ensure_ascii=False)
# print(len(files))

