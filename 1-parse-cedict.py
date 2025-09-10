input_fn = './data/cedict_1_0_ts_utf-8_mdbg.txt'
output_fn = 'cedict_tabs.txt'

import itertools as it

join = lambda it: ''.join(it)

with open(output_fn, 'w', encoding='utf-8') as fout:
    with open(input_fn, 'r', encoding='utf-8') as fin:
        for line in fin.readlines():
            if line.startswith('#'):
                continue
            if line[-1] == '\n':
                line = line[:-1]

            line = iter(line)
            hanzi_simp = join(it.takewhile(lambda c: c != ' ', line))
            hanzi_trad = join(it.takewhile(lambda c: c != ' ', line))
            assert next(line) == '['
            reading = join(it.takewhile(lambda c: c != ']', line))
            assert next(line) == ' '
            meaning = join(line)
            assert meaning[0] == meaning[-1] == '/'
            meaning = meaning[1:-1]
            fout.write('\t'.join([hanzi_simp, hanzi_trad, reading, meaning]))
            fout.write('\n')
