# Campus Equipment Booking API

## English Version

## 1. Project Overview

Campus Equipment Booking API is a backend REST API for managing shared campus equipment reservations.

The system is designed for shared resources such as cameras, projectors, and other campus equipment.

The API allows users to:

- View equipment information.
- View existing bookings.
- View a booking by ID.
- Create a new booking.
- Update an existing booking.
- Delete a booking.
- Prevent overlapping bookings for the same equipment.

The project was developed as a practical lab using TypeScript, Hono, Cloudflare Workers, and Cloudflare D1.

---

## 2. Technology Stack

The project uses:

- TypeScript
- Hono
- Cloudflare Workers
- Cloudflare D1
- SQLite-compatible SQL
- Wrangler
- Postman
- Git

---

## 3. Project Structure

~~~text
equipment-booking-api/
│
├── evidence/
│   └── Test and Quality Gate screenshots
│
├── src/
│   └── index.ts
│
├── AI_LOG.md
├── API_CONTRACT.md
├── QUALITY_GATE_REVIEW.md
├── README.md
├── schema.sql
├── package.json
├── tsconfig.json
└── wrangler.jsonc
~~~

---

## 4. Database

The application uses Cloudflare D1.

Database name:

`equipment-booking-db`

D1 binding used by the Worker:

`equipment_booking_db`

The database contains two tables:

- `equipment`
- `bookings`

---

## 5. Database Schema

### Equipment Table

The `equipment` table stores the equipment that can be booked.

| Column | Type | Constraint |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `location` | TEXT | NOT NULL |

Initial equipment data:

| ID | Name | Location |
|---|---|---|
| `eq-1` | Projector A | Building 1 |
| `eq-2` | Camera A | Building 2 |

### Bookings Table

The `bookings` table stores equipment booking information.

| Column | Type | Constraint |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `equipment_id` | TEXT | NOT NULL, FOREIGN KEY |
| `borrower_name` | TEXT | NOT NULL |
| `start_at` | TEXT | NOT NULL |
| `end_at` | TEXT | NOT NULL |
| `purpose` | TEXT | NOT NULL |
| `created_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

`equipment_id` references:

`equipment(id)`

---

## 6. ERD

The database has a one-to-many relationship between `equipment` and `bookings`.

One equipment item can have multiple bookings.

~~~text
┌──────────────────────────┐
│        equipment         │
├──────────────────────────┤
│ PK  id          TEXT     │
│     name        TEXT     │
│     location    TEXT     │
└────────────┬─────────────┘
             │
             │ 1
             │
             │
             │ N
┌────────────▼─────────────┐
│         bookings         │
├──────────────────────────┤
│ PK  id          INTEGER  │
│ FK  equipment_id TEXT    │
│     borrower_name TEXT   │
│     start_at      TEXT   │
│     end_at        TEXT   │
│     purpose       TEXT   │
│     created_at    TEXT   │
│     updated_at    TEXT   │
└──────────────────────────┘

equipment.id
      │
      └──────< bookings.equipment_id

Relationship: equipment 1 : N bookings
~~~

---

## 7. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API information/root endpoint |
| GET | `/api/equipment` | Get all equipment |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get a booking by ID |
| POST | `/api/bookings` | Create a new booking |
| PATCH | `/api/bookings/:id` | Update an existing booking |
| DELETE | `/api/bookings/:id` | Delete a booking |

Detailed request and response specifications are documented in:

`API_CONTRACT.md`

---

## 8. Booking Business Rules

### Valid Booking Time

The booking start time must be earlier than the booking end time.

~~~text
start_at < end_at
~~~

An invalid booking time returns:

`400 Bad Request`

### Equipment Must Exist

A booking must reference an equipment record that exists in the `equipment` table.

If the equipment does not exist, the API returns:

`404 Not Found`

### Booking Overlap Prevention

The same equipment cannot be booked during overlapping time periods.

The overlap condition is:

~~~text
existing.start_at < new.end_at
AND
existing.end_at > new.start_at
~~~

If another booking for the same equipment satisfies this condition, the API returns:

`409 Conflict`

Example:

~~~text
Existing booking: 11:00 - 13:00
New booking:      12:00 - 14:00

Result: Conflict
~~~

Adjacent bookings are allowed.

Example:

~~~text
Existing booking: 11:00 - 13:00
New booking:      13:00 - 15:00

Result: Allowed
~~~

---

## 9. Input Validation

The API validates:

- Required booking fields.
- Non-empty string values.
- Malformed JSON.
- Booking start and end times.
- Equipment existence.
- Booking IDs.
- Booking existence.
- Booking time conflicts.

Errors are returned as JSON.

Example:

~~~json
{
  "error": "Invalid booking time"
}
~~~

---

## 10. HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Successful GET or PATCH |
| `201 Created` | Booking created successfully |
| `204 No Content` | Booking deleted successfully |
| `400 Bad Request` | Invalid request or input |
| `404 Not Found` | Equipment or booking not found |
| `409 Conflict` | Booking time conflict |
| `500 Internal Server Error` | Unexpected server/database error |

---

## 11. SQL Security

Database queries use parameterized SQL statements with D1 `.bind()`.

Example:

~~~ts
prepare('SELECT * FROM bookings WHERE id = ?').bind(id)
~~~

Request values are not directly concatenated into SQL statements.

This provides basic protection against SQL injection.

---

## 12. CORS

CORS is enabled for:

`/api/*`

Allowed methods:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

Allowed request header:

`Content-Type`

---

## 13. Local Development

Install project dependencies:

~~~bash
npm install
~~~

Create the local database schema and seed data:

~~~bash
npx wrangler d1 execute equipment-booking-db --local --file=schema.sql
~~~

Start the development server:

~~~bash
npm run dev
~~~

The local API is available at:

`http://localhost:8787`

Example:

`http://localhost:8787/api/equipment`

---

## 14. Cloudflare Deployment

The final version of the API will be deployed to Cloudflare Workers and connected to the remote Cloudflare D1 database.

Production API:

`https://equipment-booking-api.job-board-api.workers.dev`

The production Cloudflare Workers URL will be used for final submission instead of localhost.

---

## 15. Testing

The API was manually tested using Postman.

Testing included both success and error cases:

- GET equipment.
- Create booking.
- Get bookings.
- Get booking by ID.
- Update booking.
- Delete booking.
- Invalid booking time.
- Equipment not found.
- Booking not found.
- POST booking overlap.
- PATCH booking overlap.
- Malformed JSON.
- Whitespace-only input.

Important test screenshots are stored in:

`evidence/`

---

## 16. AI Usage and Quality Gate

AI was used as a development assistant during this practical lab.

AI usage is documented in:

`AI_LOG.md`

After completing the first working version, a Git snapshot was created before the AI Quality Gate review.

Pre-Quality-Gate commit:

`883e8f9 - First working version before AI Quality Gate`

Quality Gate findings, improvements, verification, and evidence are documented in:

`QUALITY_GATE_REVIEW.md`

---

# Campus Equipment Booking API

## ฉบับภาษาไทย

## 1. ภาพรวมโปรเจกต์

Campus Equipment Booking API เป็น Backend REST API สำหรับจัดการการจองอุปกรณ์ส่วนกลางภายในมหาวิทยาลัย

ระบบรองรับทรัพยากรที่ใช้ร่วมกัน เช่น กล้อง โปรเจกเตอร์ และอุปกรณ์อื่น ๆ

API สามารถ:

- ดูข้อมูลอุปกรณ์
- ดูรายการ Booking
- ดู Booking ตาม ID
- สร้าง Booking ใหม่
- แก้ไข Booking
- ลบ Booking
- ป้องกันการจองอุปกรณ์เดียวกันในช่วงเวลาที่ซ้อนกัน

โปรเจกต์พัฒนาด้วย TypeScript, Hono, Cloudflare Workers และ Cloudflare D1

---

## 2. Technology Stack

เทคโนโลยีและเครื่องมือที่ใช้:

- TypeScript
- Hono
- Cloudflare Workers
- Cloudflare D1
- SQLite-compatible SQL
- Wrangler
- Postman
- Git

---

## 3. โครงสร้างโปรเจกต์

~~~text
equipment-booking-api/
│
├── evidence/
│   └── รูปหลักฐานการทดสอบและ Quality Gate
│
├── src/
│   └── index.ts
│
├── AI_LOG.md
├── API_CONTRACT.md
├── QUALITY_GATE_REVIEW.md
├── README.md
├── schema.sql
├── package.json
├── tsconfig.json
└── wrangler.jsonc
~~~

---

## 4. ฐานข้อมูล

ระบบใช้ Cloudflare D1

ชื่อ Database:

`equipment-booking-db`

D1 Binding ที่ Worker ใช้:

`equipment_booking_db`

ฐานข้อมูลประกอบด้วย 2 ตาราง:

- `equipment`
- `bookings`

---

## 5. Database Schema

### ตาราง Equipment

ใช้เก็บข้อมูลอุปกรณ์ที่สามารถจองได้

| Column | Type | Constraint |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `location` | TEXT | NOT NULL |

ข้อมูล Equipment เริ่มต้น:

| ID | Name | Location |
|---|---|---|
| `eq-1` | Projector A | Building 1 |
| `eq-2` | Camera A | Building 2 |

### ตาราง Bookings

ใช้เก็บข้อมูลการจองอุปกรณ์

| Column | Type | Constraint |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `equipment_id` | TEXT | NOT NULL, FOREIGN KEY |
| `borrower_name` | TEXT | NOT NULL |
| `start_at` | TEXT | NOT NULL |
| `end_at` | TEXT | NOT NULL |
| `purpose` | TEXT | NOT NULL |
| `created_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TEXT | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

`equipment_id` อ้างอิง:

`equipment(id)`

---

## 6. ERD

Database มีความสัมพันธ์แบบ One-to-Many ระหว่าง `equipment` และ `bookings`

Equipment 1 รายการสามารถมี Booking ได้หลายรายการ

~~~text
┌──────────────────────────┐
│        equipment         │
├──────────────────────────┤
│ PK  id          TEXT     │
│     name        TEXT     │
│     location    TEXT     │
└────────────┬─────────────┘
             │
             │ 1
             │
             │
             │ N
┌────────────▼─────────────┐
│         bookings         │
├──────────────────────────┤
│ PK  id          INTEGER  │
│ FK  equipment_id TEXT    │
│     borrower_name TEXT   │
│     start_at      TEXT   │
│     end_at        TEXT   │
│     purpose       TEXT   │
│     created_at    TEXT   │
│     updated_at    TEXT   │
└──────────────────────────┘

equipment.id
      │
      └──────< bookings.equipment_id

Relationship: equipment 1 : N bookings
~~~

---

## 7. API Endpoints

| Method | Endpoint | การทำงาน |
|---|---|---|
| GET | `/` | Root/API information |
| GET | `/api/equipment` | ดู Equipment ทั้งหมด |
| GET | `/api/bookings` | ดู Booking ทั้งหมด |
| GET | `/api/bookings/:id` | ดู Booking ตาม ID |
| POST | `/api/bookings` | สร้าง Booking |
| PATCH | `/api/bookings/:id` | แก้ไข Booking |
| DELETE | `/api/bookings/:id` | ลบ Booking |

รายละเอียด Request และ Response ทั้งหมดอยู่ใน:

`API_CONTRACT.md`

---

## 8. Business Rules ของการจอง

### ช่วงเวลาต้องถูกต้อง

เวลาเริ่มต้นต้องอยู่ก่อนเวลาสิ้นสุด:

~~~text
start_at < end_at
~~~

หากเวลาไม่ถูกต้อง:

`400 Bad Request`

### Equipment ต้องมีอยู่จริง

Booking ต้องอ้างอิง Equipment ที่มีอยู่ในตาราง `equipment`

หาก Equipment ไม่มีอยู่:

`404 Not Found`

### ป้องกัน Booking Overlap

Equipment เดียวกันไม่สามารถถูกจองในช่วงเวลาที่ซ้อนกันได้

เงื่อนไขตรวจสอบ:

~~~text
existing.start_at < new.end_at
AND
existing.end_at > new.start_at
~~~

หากเวลาซ้อนกัน:

`409 Conflict`

ตัวอย่าง:

~~~text
Booking เดิม: 11:00 - 13:00
Booking ใหม่: 12:00 - 14:00

ผลลัพธ์: Conflict
~~~

แต่เวลาที่ต่อกันโดยไม่ซ้อนสามารถจองได้:

~~~text
Booking เดิม: 11:00 - 13:00
Booking ใหม่: 13:00 - 15:00

ผลลัพธ์: Allowed
~~~

---

## 9. Input Validation

API ตรวจสอบ:

- Required Fields
- String ที่ต้องไม่ว่าง
- Malformed JSON
- Start Time และ End Time
- Equipment ว่ามีอยู่จริง
- Booking ID
- Booking ว่ามีอยู่จริง
- Booking Time Conflict

Error Response ใช้ JSON

ตัวอย่าง:

~~~json
{
  "error": "Invalid booking time"
}
~~~

---

## 10. HTTP Status Codes

| Status | ความหมาย |
|---|---|
| `200 OK` | GET หรือ PATCH สำเร็จ |
| `201 Created` | สร้าง Booking สำเร็จ |
| `204 No Content` | ลบ Booking สำเร็จ |
| `400 Bad Request` | Request หรือ Input ไม่ถูกต้อง |
| `404 Not Found` | ไม่พบ Equipment หรือ Booking |
| `409 Conflict` | เวลาการจองซ้อนกัน |
| `500 Internal Server Error` | Server หรือ Database Error ที่ไม่คาดคิด |

---

## 11. SQL Security

Database Query ใช้ Parameterized SQL และ D1 `.bind()`

ตัวอย่าง:

~~~ts
prepare('SELECT * FROM bookings WHERE id = ?').bind(id)
~~~

ไม่มีการนำ Request Value ไปต่อกับ SQL Statement โดยตรง

ช่วยลดความเสี่ยงจาก SQL Injection

---

## 12. CORS

เปิด CORS สำหรับ:

`/api/*`

รองรับ Method:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

อนุญาต Header:

`Content-Type`

---

## 13. การรันแบบ Local

ติดตั้ง Dependencies:

~~~bash
npm install
~~~

สร้าง Schema และ Seed Data ใน Local D1:

~~~bash
npx wrangler d1 execute equipment-booking-db --local --file=schema.sql
~~~

เริ่ม Development Server:

~~~bash
npm run dev
~~~

Local API:

`http://localhost:8787`

ตัวอย่าง:

`http://localhost:8787/api/equipment`

---

## 14. การ Deploy ขึ้น Cloudflare

Final Version ของ API จะถูก Deploy ขึ้น Cloudflare Workers และเชื่อมกับ Remote Cloudflare D1 Database

Production API:

`https://equipment-booking-api.job-board-api.workers.dev`

ตอนส่งงานจะใช้ Production Cloudflare Workers URL แทน localhost

---

## 15. การทดสอบ

API ถูกทดสอบด้วย Postman

ทดสอบทั้ง Success Case และ Error Case เช่น:

- GET Equipment
- Create Booking
- GET Bookings
- GET Booking by ID
- Update Booking
- Delete Booking
- Invalid Booking Time
- Equipment Not Found
- Booking Not Found
- POST Booking Overlap
- PATCH Booking Overlap
- Malformed JSON
- Whitespace-only Input

Screenshot หลักฐานสำคัญเก็บไว้ใน:

`evidence/`

---

## 16. การใช้งาน AI และ Quality Gate

ใช้ AI เป็น Development Assistant ระหว่าง Practical Lab

รายละเอียดการใช้ AI บันทึกไว้ใน:

`AI_LOG.md`

หลังจาก First Working Version ทำงานได้แล้ว ได้สร้าง Git Snapshot ก่อนเริ่ม AI Quality Gate

Commit ก่อน Quality Gate:

`883e8f9 - First working version before AI Quality Gate`

รายละเอียด Finding การแก้ไข การตรวจสอบ และ Evidence ของ Quality Gate อยู่ใน:

`QUALITY_GATE_REVIEW.md`
