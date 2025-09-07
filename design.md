### Database Design

1.  **colleges**
    * id (primary key)
    * name

2.  **students**
    * id (primary key)
    * college_id (foreign key)
    * student_number (student id unique for college)
    * name 
    * email 
    * year 

3.  **events**
    * id (primary key)
    * college_id (foreign key)
    * title 
    * type  — (e.g., workshop, hackathon, seminar, fest)
    * start_time (date)
    * end_time (date)
    * max_capacity
    * status

4.  **registrations**
    * id (primary key)
    * event_id (foreign key)
    * student_id (foreign key)
    * registered_at (date)
    * checked_in_at (date)


5.  **attendance**
    * id (primary key)
    * event_id (foreign key)
    * student_id (foreign key)

6.  **feedback**
    * id (primary key)
    * event_id (foreign key)
    * student_id (foreign key)
    * rating (range)
    * comment

7.  **constraints** : events, attendance and feedback should be unique per student_id.
