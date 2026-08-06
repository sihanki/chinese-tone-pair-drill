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
        reading = reading.lower()
        readings.append(reading)
        tones.append(tone)
    return readings, tones

with open('tone-exceptions.txt', 'r') as fin:
    exceptions_map = {}
    for line in fin.readlines():
        line = line.strip().split('#')[0]
        if len(line) == 0:
            continue
        expression, pattern = line.strip().split('\t')
        pattern = [int(x) for x in pattern.split(' ')]
        assert len(pattern) == 2
        exceptions_map[expression] = pattern

def process_exceptions(expression, readings, tones):
    if expression.startswith('一') and expression != '一一' and tones[0] == 1:
        tones[0] = 2 if tones[1] in (4, 0) else 4
    elif expression.startswith('不') and tones[0] == 4:
        tones[0] = 2 if tones[1] == 4 else 4
    elif expression in exceptions_map:
        tones = exceptions_map[expression]
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
                if hanzi in cedict and (readings, tones) != cedict[hanzi]:
                    repeats.add(hanzi)
                else:
                    cedict[hanzi] = (readings, tones)
            except InvalidTonesException:
                pass

result = []
for word in words_with_audio:
    if word not in cedict or word in repeats or len(cedict[word][1]) != 2:
        continue
    readings, tones = process_exceptions(word, *cedict[word])
    result.append({
        'expression': word,
        'audio': 'cmn-' + word + '.mp3',
        'pinyin': ' '.join(readings),
        'pattern': ' '.join(map(str, tones))
    })

with open('data.json', 'w') as fout:
    json.dump(result, fout, indent=2, ensure_ascii=False)
# print(len(files))

