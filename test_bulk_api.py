#!/usr/bin/env python
import requests
import json

def test_bulk_enroll():
    url = 'http://127.0.0.1:8000/api/enrollments/bulk-enroll/'
    payload = {'enrollments': [{'student_id': 1, 'subject_id': 1}]}

    print('Testing bulk-enroll API...')
    try:
        r = requests.post(url, json=payload)
        print(f'Status: {r.status_code}')
        if r.status_code == 201:
            response_data = r.json()
            print('Response:')
            print(json.dumps(response_data, indent=2))
            return response_data
        else:
            print(f'Error: {r.text}')
            return None
    except Exception as e:
        print(f'Error: {e}')
        return None

if __name__ == '__main__':
    test_bulk_enroll()