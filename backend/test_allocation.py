import requests

url = "http://127.0.0.1:5000/api/allocations"

data = {
    "student_id": 1,
    "opportunity_id": 1,
    "allocation_date": "2026-10-02",
    "status": "Allocated"
}

response = requests.post(url, json=data)

print(response.status_code)
print(response.json())