import unittest


def check_match(student, opportunity):

    if student["cgpa"] < opportunity["minimum_cgpa"]:
        return False

    student_skills = student["skills"].lower()
    required_skill = opportunity["required_skill"].lower()

    if required_skill not in student_skills:
        return False

    if student["preferred_type"].lower() != opportunity["opportunity_type"].lower():
        return False

    return True


class TestMatch(unittest.TestCase):

    def test_matching_student(self):

        student = {
            "student_id": 1,
            "name": "Rahul",
            "cgpa": 8.5,
            "skills": "Python, SQL",
            "preferred_type": "Internship"
        }

        opportunity = {
            "opportunity_id": 1,
            "opportunity_name": "Python Developer Internship",
            "opportunity_type": "Internship",
            "required_skill": "Python",
            "minimum_cgpa": 7.0
        }

        result = check_match(student, opportunity)

        self.assertTrue(result)


    def test_non_matching_student(self):

        student = {
            "student_id": 2,
            "name": "Aman",
            "cgpa": 6.0,
            "skills": "HTML, CSS",
            "preferred_type": "Internship"
        }

        opportunity = {
            "opportunity_id": 1,
            "opportunity_name": "Python Developer Internship",
            "opportunity_type": "Internship",
            "required_skill": "Python",
            "minimum_cgpa": 7.0
        }

        result = check_match(student, opportunity)

        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()