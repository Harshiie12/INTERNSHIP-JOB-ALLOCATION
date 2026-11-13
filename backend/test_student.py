import requests

url = "http://127.0.0.1:5000/api/students"

data = {
    "name": "Rahul",
    "email": "rahul14@gmail.com",
    "qualification": "BCA",
    "cgpa": 8.2,
    "skills": "Python",
    "preferred_type": "Internship"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.text)