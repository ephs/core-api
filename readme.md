EPHS Core API: A easy way to interact with [core.edenpr.org](https://edenprairie_students.na.rapidbiz.com/)
---
This is a API server that allows interacting with [Core](https://edenprairie_students.na.rapidbiz.com/), a program at our school.
This was made because you can't directly fetch data from the application because of [cross site scripting protections](https://en.wikipedia.org/wiki/Cross-site_scripting), so I made this program.

### Routes:
* 127.0.0.1/api/v1/login (POST)
* 127.0.0.1/api/v1/sessions/available (GET, Authorization)
* 127.0.0.1/api/v1/sessions/signedup (GET, Authorization)
* 127.0.0.1/api/v1/sessions/past (GET, Authorization)
* 127.0.0.1/api/v1/sessions/signup (POST, Authorization)