import json
import sys

if __name__ == '__main__':
    assert len(sys.argv) == 2
    filename = sys.argv[1]
    with open(filename, 'r') as fin:
        data = json.load(fin)

    # check uniqueness
    expr = [e['expression'] for e in data]
    assert len(set(expr)) == len(expr)

    data = sorted(data, key=lambda x: x['expression'])

    with open(filename, 'w') as fout:
        json.dump(data, fout, indent=2, ensure_ascii=False)