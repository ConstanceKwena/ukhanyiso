# Validation and spam-limit test cases (Iteration 1)

| ID | Input | Expected |
|---|---|---|
| V-01 | Maths 101 | "Marks must be between 0 and 100." |
| V-02 | Maths -1 | "Marks must be between 0 and 100." |
| V-03 | Maths 70.5 | Rejected, whole numbers only |
| V-04 | Maths 70, Maths 65 | "Each subject can only be added once." |
| V-05 | Subject "Wizardry" | "Please choose a subject from the list." |
| V-06 | Empty mark | "Please fill in all required fields." |
| V-07 | `<script>alert(1)</script>` as subject | Rejected, never echoed back |
| V-08 | Maths 0 and Maths 100 | Accepted (boundaries) |
| S-01 | First 10 `POST /api/match` requests from one client address in a 60-second window starting with its first request | Allowed |
| S-02 | 11th `POST /api/match` request from the same client address in that window | HTTP 429; "Too many attempts. Please wait a minute and try again." A different client address has its own limit. |
| S-03 | Oversized body or unexpected extra field | Rejected |
| V-09 | Mathematics and Mathematical Literacy | "Some of these subjects can't be taken together." |
| V-10 | Computer Applications Technology and Information Technology | "Some of these subjects can't be taken together." |
| V-11 | English Home Language and English First Additional Language | "A language can only be added once, at one level." |
| V-12 | isiZulu Home Language and isiXhosa First Additional Language | "Some of these languages can't be taken together." |