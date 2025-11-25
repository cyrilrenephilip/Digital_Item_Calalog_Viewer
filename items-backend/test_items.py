import json
import sys
from urllib import request, error

BASE = 'http://127.0.0.1:8001'

def assert_true(cond, msg):
    if not cond:
        print('TEST FAIL:', msg)
        sys.exit(1)

def http_get(path):
    try:
        with request.urlopen(BASE + path) as resp:
            data = resp.read()
            return resp.getcode(), json.loads(data)
    except error.HTTPError as e:
        return e.code, e.read()

def http_post_json(path, payload):
    data = json.dumps(payload).encode('utf-8')
    req = request.Request(BASE + path, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with request.urlopen(req) as resp:
            body = json.loads(resp.read())
            return resp.getcode(), body
    except error.HTTPError as e:
        return e.code, e.read()

def main():
    code, items = http_get('/items')
    assert_true(code == 200, 'GET /items status')
    assert_true(isinstance(items, list) and len(items) >= 1, 'GET /items body list')

    first_id = items[0]['id']
    code, item = http_get(f'/items/{first_id}')
    assert_true(code == 200 and item['id'] == first_id, 'GET /items/{id} returns item')

    payload = { 'name': 'Tester', 'email': 'test@example.com', 'message': 'hi' }
    code, res = http_post_json(f'/items/{first_id}/submit', payload)
    assert_true(code == 200 and res.get('status') == 'ok', 'POST /items/{id}/submit ok')

    print('All items backend tests passed')
    sys.exit(0)

if __name__ == '__main__':
    main()
