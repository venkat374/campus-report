# Example API Endpoints

* **POST /api/events**
    * **Description:** Creates a new event.
    * **Body:**
        ```
        {
          "college_id": 1,
          "title": "AI Workshop",
          "type": "Workshop",
          "start_time": "2025-09-05T10:00:00Z",
          "end_time": "2025-09-05T12:00:00Z",
          "max_capacity": 50,
          "status": "active"
        }
        ```
    * **Response:**
        * `201 Created`:
            ```
            {
              "id": 12,
              "message": "Event created successfully."
            }
            ```

* **POST /api/events/:eventId/register**
    * **Description:** Registers a student for an event.
    * **Body:**
        ```
        {
          "student_id": 5
        }
        ```
    * **Response:**
        * `201 Created`: Successful registration.
        * `409 Conflict`: If the student is already registered for the event.

* **POST /api/events/:eventId/checkin**
    * **Description:** Checks a student into an event to record attendance.
    * **Body:**
        ```
        {
          "student_id": 5
        }
        ```
    * **Response:**
        * `200 OK`:
            ```
            {
              "status": "checked_in"
            }
            ```

* **POST /api/events/:eventId/feedback**
    * **Description:** Submits feedback and a rating for an event.
    * **Body:**
        ```
        {
          "student_id": 5,
          "rating": 4,
          "comment": "Great workshop, very informative!"
        }
        ```
    * **Response:**
        * `201 Created`: Feedback submitted successfully.

## Reporting

* **GET /api/reports/event/:eventId**
    * **Description:** Retrieves summary statistics for a specific event.
    * **Response:**
        ```
        {
          "total_registrations": 45,
          "attendance_count": 30,
          "attendance_percentage": 66.67,
          "average_feedback_rating": 4.5
        }
        ```

* **GET /api/reports/college/:collegeId/popular-events?limit=10**
    * **Description:** Lists the most popular events for a college, sorted by number of registrations.
    * **Query Parameters:**
        * `limit`: Optional, restricts the number of events returned. Default is 10.

* **GET /api/reports/student/:studentId**
    * **Description:** Provides a summary of a student's event activity.
    * **Response:**
        ```
        {
          "registered_events": [
            { "id": 12, "title": "AI Workshop" },
            { "id": 25, "title": "Hackathon 2025" }
          ],
          "attended_events": [
            { "id": 12, "title": "AI Workshop", "checked_in_at": "2025-09-05T10:15:00Z" }
          ]
        }
        ```

* **GET /api/reports/top-active-students?college_id=1&limit=3**
    * **Description:** Identifies the top N students for a given college based on the number of events they've attended.
    * **Query Parameters:**
        * `college_id`: Required, specifies the college.
        * `limit`: Optional, restricts the number of students returned. Default is 3.