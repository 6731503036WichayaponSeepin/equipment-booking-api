# Campus Equipment Booking API Contract

## English Version

## 1. API Overview

The Campus Equipment Booking API is a REST API for managing shared campus equipment bookings.

The API allows clients to:

- View equipment information.
- View all bookings.
- View a specific booking.
- Create a new booking.
- Update an existing booking.
- Delete a booking.
- Prevent overlapping bookings for the same equipment.

The API is implemented using TypeScript, Hono, Cloudflare Workers, and Cloudflare D1.

---

## 2. Base URL

### Local Development

During development and local testing, the API runs at:

`http://localhost:8787`

Example:

`http://localhost:8787/api/equipment`

### Production

The API is deployed to Cloudflare Workers.

Production URL:

`https://equipment-booking-api.job-board-api.workers.dev`

Example:

`https://equipment-booking-api.job-board-api.workers.dev/api/equipment`

---

## 3. Content Type

Requests that contain a body should use:

`Content-Type: application/json`

API responses are returned as JSON, except successful DELETE requests that return `204 No Content`.

---

# API Endpoints

## 4. GET /api/equipment

Returns the list of equipment stored in the system.

### Request

**Method:** `GET`

**Endpoint:** `/api/equipment`

No request body is required.

### Success Response

**Status:** `200 OK`

Example response:

~~~json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera A",
    "location": "Building 2"
  }
]
~~~

### Error Response

Unexpected server or database errors return:

`500 Internal Server Error`

---

## 5. GET /api/bookings

Returns all bookings stored in the system.

### Request

**Method:** `GET`

**Endpoint:** `/api/bookings`

No request body is required.

### Success Response

**Status:** `200 OK`

Example response:

~~~json
[
  {
    "id": 1,
    "equipment_id": "eq-1",
    "borrower_name": "Test User",
    "start_at": "2026-10-07T11:00:00",
    "end_at": "2026-10-07T13:00:00",
    "purpose": "Midterm presentation"
  }
]
~~~

### Error Response

Unexpected server or database errors return:

`500 Internal Server Error`

---

## 6. GET /api/bookings/:id

Returns one booking using its booking ID.

### Request

**Method:** `GET`

**Endpoint:** `/api/bookings/:id`

Example:

`/api/bookings/1`

### Path Parameter

`id` must be a positive integer.

### Success Response

**Status:** `200 OK`

Example response:

~~~json
{
  "id": 1,
  "equipment_id": "eq-1",
  "borrower_name": "Test User",
  "start_at": "2026-10-07T11:00:00",
  "end_at": "2026-10-07T13:00:00",
  "purpose": "Midterm presentation"
}
~~~

### Invalid ID

If the booking ID is invalid:

`400 Bad Request`

### Booking Not Found

If the ID is valid but the booking does not exist:

`404 Not Found`

### Server Error

Unexpected errors return:

`500 Internal Server Error`

---

## 7. POST /api/bookings

Creates a new equipment booking.

### Request

**Method:** `POST`

**Endpoint:** `/api/bookings`

### Request Body

All fields are required.

~~~json
{
  "equipment_id": "eq-1",
  "borrower_name": "Test User",
  "start_at": "2026-10-07T11:00:00",
  "end_at": "2026-10-07T13:00:00",
  "purpose": "Midterm presentation"
}
~~~

### Field Requirements

#### `equipment_id`

- Required.
- Must be a non-empty string.
- Must reference existing equipment.

#### `borrower_name`

- Required.
- Must be a non-empty string.

#### `start_at`

- Required.
- Must be a non-empty string representing the booking start time.

#### `end_at`

- Required.
- Must be a non-empty string representing the booking end time.
- Must be later than `start_at`.

#### `purpose`

- Required.
- Must be a non-empty string.

### Success Response

**Status:** `201 Created`

The response contains the newly created booking.

### Invalid Request

Returns:

`400 Bad Request`

Possible reasons include:

- Invalid JSON body.
- Missing required fields.
- Required fields containing only whitespace.
- Invalid booking time.
- Start time is not earlier than end time.

Example:

~~~json
{
  "error": "Invalid booking time"
}
~~~

### Equipment Not Found

If `equipment_id` does not exist:

`404 Not Found`

Example:

~~~json
{
  "error": "Equipment not found"
}
~~~

### Booking Conflict

If another booking for the same equipment overlaps the requested time:

`409 Conflict`

Example:

~~~json
{
  "error": "Booking time conflicts with an existing booking"
}
~~~

### Server Error

Unexpected errors return:

`500 Internal Server Error`

---

## 8. PATCH /api/bookings/:id

Updates an existing booking.

PATCH supports partial updates. Fields that are not provided keep their existing values.

### Request

**Method:** `PATCH`

**Endpoint:** `/api/bookings/:id`

Example:

`/api/bookings/1`

### Path Parameter

`id` must be a positive integer.

### Example Request Body

~~~json
{
  "purpose": "Updated presentation"
}
~~~

Another example:

~~~json
{
  "start_at": "2026-10-07T12:00:00",
  "end_at": "2026-10-07T14:00:00"
}
~~~

### Editable Fields

The following fields may be updated:

- `equipment_id`
- `borrower_name`
- `start_at`
- `end_at`
- `purpose`

After the submitted values are combined with the existing booking data, the final values must pass the validation rules.

### Success Response

**Status:** `200 OK`

The response contains the updated booking.

### Invalid Request

Returns:

`400 Bad Request`

Possible reasons include:

- Invalid booking ID.
- Invalid JSON body.
- Whitespace-only string values.
- Invalid booking time.

### Booking Not Found

If the booking does not exist:

`404 Not Found`

### Equipment Not Found

If the updated `equipment_id` does not exist:

`404 Not Found`

### Booking Conflict

If the updated booking overlaps another booking for the same equipment:

`409 Conflict`

Example:

~~~json
{
  "error": "Booking time conflicts with an existing booking"
}
~~~

### Server Error

Unexpected errors return:

`500 Internal Server Error`

---

## 9. DELETE /api/bookings/:id

Deletes an existing booking.

### Request

**Method:** `DELETE`

**Endpoint:** `/api/bookings/:id`

Example:

`/api/bookings/2`

### Path Parameter

`id` must be a positive integer.

### Success Response

**Status:** `204 No Content`

A successful DELETE response does not contain a response body.

### Invalid ID

If the booking ID is invalid:

`400 Bad Request`

### Booking Not Found

If the booking does not exist:

`404 Not Found`

### Server Error

Unexpected errors return:

`500 Internal Server Error`

---

# Business Rules

## 10. Booking Time Rule

A booking must have a valid time range.

The start time must be earlier than the end time:

`start_at < end_at`

Example of a valid booking:

`10:00 - 12:00`

Example of an invalid booking:

`15:00 - 14:00`

Invalid booking times return:

`400 Bad Request`

---

## 11. Booking Overlap Rule

The same equipment cannot be booked for overlapping time periods.

A conflict exists when:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

If this condition is true for the same equipment, the request is rejected with:

`409 Conflict`

### Overlap Example

Existing booking:

`11:00 - 13:00`

New booking:

`12:00 - 14:00`

Result:

`409 Conflict`

The time periods overlap.

### Adjacent Booking Example

Existing booking:

`11:00 - 13:00`

New booking:

`13:00 - 15:00`

The bookings do not overlap because the new booking starts when the existing booking ends.

---

## 12. Equipment Rule

A booking must reference equipment that exists in the `equipment` table.

If the equipment does not exist, the API returns:

`404 Not Found`

---

## 13. HTTP Status Code Summary

| Status Code | Meaning | Usage |
|---|---|---|
| `200` | OK | Successful GET or PATCH |
| `201` | Created | Booking successfully created |
| `204` | No Content | Booking successfully deleted |
| `400` | Bad Request | Invalid input, JSON, ID, or booking time |
| `404` | Not Found | Booking or equipment does not exist |
| `409` | Conflict | Booking time overlaps another booking |
| `500` | Internal Server Error | Unexpected server or database error |

---

## 14. Error Response Format

Error responses use JSON.

General format:

~~~json
{
  "error": "Error message"
}
~~~

Examples:

~~~json
{
  "error": "Invalid JSON body"
}
~~~

~~~json
{
  "error": "Equipment not found"
}
~~~

~~~json
{
  "error": "Booking time conflicts with an existing booking"
}
~~~

---

## 15. CORS

CORS is enabled for API routes under:

`/api/*`

The API allows the following methods:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

The `Content-Type` request header is allowed.

This allows a browser-based frontend tester to communicate with the API.

---

# สัญญาการใช้งาน Campus Equipment Booking API

## ฉบับภาษาไทย

## 1. ภาพรวม API

Campus Equipment Booking API เป็น REST API สำหรับจัดการการจองอุปกรณ์ส่วนกลางภายในมหาวิทยาลัย

API สามารถ:

- ดูรายการอุปกรณ์
- ดูรายการจองทั้งหมด
- ดู Booking ตาม ID
- สร้าง Booking ใหม่
- แก้ไข Booking
- ลบ Booking
- ป้องกันการจองอุปกรณ์เดียวกันในช่วงเวลาที่ซ้อนกัน

API พัฒนาด้วย TypeScript, Hono, Cloudflare Workers และ Cloudflare D1

---

## 2. Base URL

### Local Development

ระหว่างการพัฒนาและทดสอบ API ทำงานที่:

`http://localhost:8787`

ตัวอย่าง:

`http://localhost:8787/api/equipment`

### Production

API ถูก Deploy ขึ้น Cloudflare Workers แล้ว

Production URL:

`https://equipment-booking-api.job-board-api.workers.dev`

ตัวอย่าง:

`https://equipment-booking-api.job-board-api.workers.dev/api/equipment`

---

## 3. Content Type

Request ที่มี Body ใช้:

`Content-Type: application/json`

Response ของ API ใช้ JSON ยกเว้น DELETE ที่สำเร็จและตอบกลับ `204 No Content` ซึ่งจะไม่มี Response Body

---

# API Endpoints

## 4. GET /api/equipment

ใช้สำหรับเรียกดูรายการอุปกรณ์ในระบบ

### Request

**Method:** `GET`

**Endpoint:** `/api/equipment`

ไม่ต้องมี Request Body

### Success Response

**Status:** `200 OK`

ตัวอย่าง:

~~~json
[
  {
    "id": "eq-1",
    "name": "Projector A",
    "location": "Building 1"
  },
  {
    "id": "eq-2",
    "name": "Camera A",
    "location": "Building 2"
  }
]
~~~

หากเกิด Server หรือ Database Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

## 5. GET /api/bookings

ใช้เรียกดู Booking ทั้งหมดในระบบ

### Request

**Method:** `GET`

**Endpoint:** `/api/bookings`

ไม่ต้องมี Request Body

### Success Response

**Status:** `200 OK`

ตัวอย่าง:

~~~json
[
  {
    "id": 1,
    "equipment_id": "eq-1",
    "borrower_name": "Test User",
    "start_at": "2026-10-07T11:00:00",
    "end_at": "2026-10-07T13:00:00",
    "purpose": "Midterm presentation"
  }
]
~~~

หากเกิด Server หรือ Database Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

## 6. GET /api/bookings/:id

ใช้เรียกดู Booking ตาม ID

### Request

**Method:** `GET`

**Endpoint:** `/api/bookings/:id`

ตัวอย่าง:

`/api/bookings/1`

### Path Parameter

`id` ต้องเป็นจำนวนเต็มบวก

### Success

หากพบ Booking:

`200 OK`

### Invalid ID

หาก ID ไม่ถูกต้อง:

`400 Bad Request`

### Booking Not Found

หาก ID ถูกต้องแต่ไม่มี Booking:

`404 Not Found`

### Server Error

หากเกิด Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

## 7. POST /api/bookings

ใช้สร้าง Booking ใหม่

### Request

**Method:** `POST`

**Endpoint:** `/api/bookings`

### Request Body

ต้องส่งข้อมูล Required Field ให้ครบ

~~~json
{
  "equipment_id": "eq-1",
  "borrower_name": "Test User",
  "start_at": "2026-10-07T11:00:00",
  "end_at": "2026-10-07T13:00:00",
  "purpose": "Midterm presentation"
}
~~~

### เงื่อนไขของ Field

#### `equipment_id`

- ต้องมีค่า
- ต้องเป็น String ที่ไม่ว่าง
- ต้องอ้างถึง Equipment ที่มีอยู่จริง

#### `borrower_name`

- ต้องมีค่า
- ต้องเป็น String ที่ไม่ว่าง

#### `start_at`

- ต้องมีค่า
- ต้องเป็น String
- ใช้เป็นเวลาเริ่มต้นของ Booking

#### `end_at`

- ต้องมีค่า
- ต้องเป็น String
- ต้องอยู่หลัง `start_at`

#### `purpose`

- ต้องมีค่า
- ต้องเป็น String ที่ไม่ว่าง

### Success

หากสร้าง Booking สำเร็จ:

`201 Created`

### Bad Request

ตอบกลับ:

`400 Bad Request`

ตัวอย่างกรณี:

- JSON ไม่ถูกต้อง
- Required Field ไม่ครบ
- Required Field มีเฉพาะช่องว่าง
- เวลา Booking ไม่ถูกต้อง
- Start Time ไม่ได้อยู่ก่อน End Time

### Equipment Not Found

หาก Equipment ไม่มีอยู่จริง:

`404 Not Found`

### Booking Conflict

หาก Equipment เดียวกันมี Booking ในช่วงเวลาที่ซ้อนกัน:

`409 Conflict`

ตัวอย่าง:

~~~json
{
  "error": "Booking time conflicts with an existing booking"
}
~~~

### Server Error

หากเกิด Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

## 8. PATCH /api/bookings/:id

ใช้แก้ไข Booking ที่มีอยู่

PATCH รองรับ Partial Update หมายความว่าสามารถส่งเฉพาะ Field ที่ต้องการแก้ไขได้ ส่วน Field ที่ไม่ได้ส่งมาจะใช้ข้อมูลเดิม

### Request

**Method:** `PATCH`

**Endpoint:** `/api/bookings/:id`

ตัวอย่าง:

`/api/bookings/1`

### Example Request Body

~~~json
{
  "purpose": "Updated presentation"
}
~~~

Field ที่สามารถแก้ไขได้:

- `equipment_id`
- `borrower_name`
- `start_at`
- `end_at`
- `purpose`

หลังจากรวมข้อมูลใหม่กับ Booking เดิมแล้ว ข้อมูลสุดท้ายต้องผ่าน Validation

### Success

หาก Update สำเร็จ:

`200 OK`

### Bad Request

ตอบกลับ:

`400 Bad Request`

ตัวอย่างกรณี:

- Booking ID ไม่ถูกต้อง
- JSON ไม่ถูกต้อง
- String มีเฉพาะช่องว่าง
- เวลา Booking ไม่ถูกต้อง

### Booking Not Found

หากไม่พบ Booking:

`404 Not Found`

### Equipment Not Found

หาก Equipment ที่แก้ไขไม่มีอยู่จริง:

`404 Not Found`

### Booking Conflict

หากช่วงเวลาใหม่ซ้อนกับ Booking อื่นของ Equipment เดียวกัน:

`409 Conflict`

### Server Error

หากเกิด Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

## 9. DELETE /api/bookings/:id

ใช้ลบ Booking

### Request

**Method:** `DELETE`

**Endpoint:** `/api/bookings/:id`

ตัวอย่าง:

`/api/bookings/2`

### Path Parameter

`id` ต้องเป็นจำนวนเต็มบวก

### Success

หากลบสำเร็จ:

`204 No Content`

Response จะไม่มี Body

### Invalid ID

หาก ID ไม่ถูกต้อง:

`400 Bad Request`

### Booking Not Found

หากไม่พบ Booking:

`404 Not Found`

### Server Error

หากเกิด Error ที่ไม่คาดคิด:

`500 Internal Server Error`

---

# Business Rules

## 10. กฎเรื่องช่วงเวลาการจอง

Booking ต้องมีช่วงเวลาที่ถูกต้อง

เวลาเริ่มต้นต้องอยู่ก่อนเวลาสิ้นสุด:

`start_at < end_at`

ตัวอย่างที่ถูกต้อง:

`10:00 - 12:00`

ตัวอย่างที่ไม่ถูกต้อง:

`15:00 - 14:00`

หากเวลาไม่ถูกต้อง:

`400 Bad Request`

---

## 11. กฎป้องกัน Booking Overlap

Equipment เดียวกันไม่สามารถถูกจองในช่วงเวลาที่ซ้อนกันได้

ใช้เงื่อนไข:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

หากเงื่อนไขนี้เป็นจริงสำหรับ Equipment เดียวกัน หมายความว่าช่วงเวลาซ้อนกัน

API จะตอบกลับ:

`409 Conflict`

### ตัวอย่างเวลาซ้อน

Booking เดิม:

`11:00 - 13:00`

Booking ใหม่:

`12:00 - 14:00`

ผลลัพธ์:

`409 Conflict`

เพราะช่วงเวลาซ้อนกัน

### ตัวอย่างเวลาต่อกันแต่ไม่ซ้อน

Booking เดิม:

`11:00 - 13:00`

Booking ใหม่:

`13:00 - 15:00`

สามารถจองได้ เพราะ Booking ใหม่เริ่มต้นตรงกับเวลาที่ Booking เดิมสิ้นสุด จึงไม่ถือว่า Overlap

---

## 12. กฎเรื่อง Equipment

Booking ต้องอ้างอิง `equipment_id` ที่มีอยู่จริงในตาราง `equipment`

หาก Equipment ไม่มีอยู่จริง:

`404 Not Found`

---

## 13. สรุป HTTP Status Code

| Status Code | ความหมาย | ใช้ในกรณี |
|---|---|---|
| `200` | OK | GET หรือ PATCH สำเร็จ |
| `201` | Created | สร้าง Booking สำเร็จ |
| `204` | No Content | ลบ Booking สำเร็จ |
| `400` | Bad Request | Input, JSON, ID หรือเวลาไม่ถูกต้อง |
| `404` | Not Found | ไม่พบ Booking หรือ Equipment |
| `409` | Conflict | ช่วงเวลาการจองซ้อนกัน |
| `500` | Internal Server Error | Server หรือ Database Error ที่ไม่คาดคิด |

---

## 14. รูปแบบ Error Response

Error Response ใช้ JSON

รูปแบบทั่วไป:

~~~json
{
  "error": "Error message"
}
~~~

ตัวอย่าง Invalid JSON:

~~~json
{
  "error": "Invalid JSON body"
}
~~~

ตัวอย่างไม่พบ Equipment:

~~~json
{
  "error": "Equipment not found"
}
~~~

ตัวอย่าง Booking Conflict:

~~~json
{
  "error": "Booking time conflicts with an existing booking"
}
~~~

---

## 15. CORS

เปิดใช้งาน CORS สำหรับ:

`/api/*`

รองรับ HTTP Method:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

และอนุญาต `Content-Type` Header

ทำให้ Frontend Tester ที่ทำงานผ่าน Browser สามารถเรียกใช้งาน API ได้
