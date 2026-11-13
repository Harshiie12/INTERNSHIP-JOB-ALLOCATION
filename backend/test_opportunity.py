import requests

url = "http://127.0.0.1:5000/api/opportunities"

data = {
    "company_name": "Google",
    "opportunity_title": "Python Developer Internship",
    "opportunity_type": "Internship",
    "required_skills": "Python",
    "minimum_cgpa": 7.0,
    "location": "Bangalore"
}

response = requests.post(url, json=data)

print("Status Code:", response.status_code)
print("Response:", response.text)