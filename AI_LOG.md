# AI Usage Log

## English Version

### AI Tool Used

ChatGPT was used as a development assistant during this practical lab test.

AI was used to provide step-by-step guidance, review implementation decisions, suggest code, identify potential problems, and assist with testing. I executed the commands, implemented the code, tested the API, and verified the results myself.

---

## 1. Project and Database Setup

### Prompt / Request

Asked AI for step-by-step guidance to create the Campus Equipment Booking API using TypeScript, Hono, and Cloudflare D1.

### AI Assistance Used

AI assisted with:

- Creating the Cloudflare Worker project.
- Installing and using Hono.
- Creating and configuring the D1 database.
- Creating the `equipment` and `bookings` tables.
- Designing the one-to-many relationship between equipment and bookings.
- Adding two initial equipment records required by the specification.

### My Verification

I executed `schema.sql` against the local D1 database and queried the `equipment` table to verify that the database and required equipment records were created successfully.

---

## 2. REST API Implementation

### Prompt / Request

Asked AI to guide the implementation of the REST API endpoints required by the specification.

### AI Assistance Used

AI assisted with the implementation of:

- `GET /api/equipment`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `DELETE /api/bookings/:id`

AI also suggested the expected HTTP status codes and JSON response structures.

### My Verification

I manually tested the endpoints using Postman.

I checked both the HTTP status codes and response bodies to verify that the endpoints behaved as expected.

---

## 3. Booking Overlap Prevention

### Prompt / Request

Asked AI how to prevent the same equipment from being booked for overlapping time periods.

### AI Assistance Used

AI suggested the overlap condition:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

For the PATCH endpoint, AI also suggested excluding the current booking ID from the conflict query so that a booking would not conflict with itself.

### My Verification

I tested overlapping bookings using Postman.

For POST, I attempted to create a booking whose time overlapped an existing booking for the same equipment.

For PATCH, I attempted to change another booking so that its time overlapped an existing booking.

Both requests correctly returned:

`409 Conflict`

---

## 4. Input Validation and Error Handling

### Prompt / Request

Asked AI to review the API for input validation and error-handling issues.

### AI Assistance Used

AI assisted with validation for:

- Missing required fields.
- Invalid booking times.
- Invalid JSON request bodies.
- Whitespace-only strings.
- Equipment that does not exist.
- Invalid booking IDs.
- Bookings that do not exist.
- Overlapping booking times.

AI also suggested using consistent JSON error responses in the form:

`{ "error": "message" }`

### My Verification

I manually tested success and error cases using Postman.

The API was tested for HTTP responses including:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`

I verified the response body for applicable responses.

---

## 5. SQL Security

### Prompt / Request

Asked AI to help review basic API security, especially SQL queries.

### AI Assistance Used

AI recommended using parameterized SQL statements with `.bind()` rather than directly concatenating user input into SQL queries.

Example:

`prepare('SELECT * FROM bookings WHERE id = ?').bind(id)`

### My Verification

I reviewed the SQL queries in the implementation and verified that request values used in SQL operations were passed through parameter binding.

This reduces the risk of SQL injection caused by directly inserting user input into SQL statements.

---

## 6. CORS

### Prompt / Request

Asked AI how to allow the API to work with a frontend tester running in a browser.

### AI Assistance Used

AI suggested adding Hono CORS middleware to the API routes.

The configuration allows the required HTTP methods:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

### My Verification

After adding CORS, I tested the API again and confirmed that the API endpoints continued to respond correctly.

---

## 7. API Testing

### Prompt / Request

Asked AI which success and error cases should be tested and which results should be kept as evidence.

### AI Assistance Used

AI suggested testing cases including:

- Get equipment successfully.
- Create booking successfully.
- Reject overlapping booking on POST.
- Update booking successfully.
- Reject overlapping booking on PATCH.
- Reject invalid booking time.
- Delete booking successfully.
- Reject booking for nonexistent equipment.
- Reject malformed JSON.
- Reject whitespace-only input.

### My Verification

I manually sent each request using Postman and checked the actual response.

Screenshots of important test results were saved in the `evidence` directory.

---

## 8. AI Quality Gate

I did not accept the first AI-assisted implementation as the final version.

Before beginning the Quality Gate review, I created a Git snapshot of the first working version:

`883e8f9 - First working version before AI Quality Gate`

After the snapshot, I reviewed the implementation with AI assistance and identified areas that could be improved.

The Quality Gate identified and fixed three issues:

1. Malformed JSON handling.
2. Whitespace-only values in POST requests.
3. Whitespace-only values in PATCH requests.

Each improvement was tested after the change.

Detailed findings, fixes, and evidence are documented in:

`QUALITY_GATE_REVIEW.md`

---

## Responsibility Statement

AI was used as a development assistant during this practical lab.

I did not rely on AI output without verification.

I executed the development commands, created and configured the local database, ran the API, sent the test requests, reviewed the HTTP responses, verified the booking overlap business rule, reviewed the SQL parameter binding, and tested the Quality Gate improvements before submission.

---

# บันทึกการใช้งาน AI

## ฉบับภาษาไทย

### เครื่องมือ AI ที่ใช้

ใช้ ChatGPT เป็นผู้ช่วยในการพัฒนาระบบระหว่างการสอบ Practical Lab ครั้งนี้

AI ถูกใช้เพื่อแนะนำขั้นตอนการทำงาน ช่วยตรวจสอบแนวทางการพัฒนา แนะนำโค้ด ช่วยค้นหาจุดที่ควรปรับปรุง และช่วยวางแผนการทดสอบ

ฉันเป็นผู้รันคำสั่ง เขียนและนำโค้ดไปใช้งาน ทดสอบ API และตรวจสอบผลลัพธ์ด้วยตนเอง

---

## 1. การตั้งค่าโปรเจกต์และฐานข้อมูล

### สิ่งที่ถาม AI

ขอให้ AI แนะนำการสร้าง Campus Equipment Booking API แบบทีละขั้นตอน โดยใช้ TypeScript, Hono และ Cloudflare D1

### สิ่งที่ AI ช่วย

AI ช่วยแนะนำ:

- การสร้าง Cloudflare Worker Project
- การติดตั้งและใช้งาน Hono
- การสร้างและตั้งค่า D1 Database
- การสร้างตาราง `equipment` และ `bookings`
- การออกแบบความสัมพันธ์แบบ One-to-Many ระหว่าง Equipment และ Booking
- การเพิ่มข้อมูล Equipment เริ่มต้นจำนวน 2 รายการตาม Requirement

### การตรวจสอบด้วยตนเอง

ฉันรันไฟล์ `schema.sql` กับ Local D1 Database และ Query ตาราง `equipment` เพื่อตรวจสอบว่าฐานข้อมูล ตาราง และข้อมูล Equipment ที่กำหนดถูกสร้างขึ้นจริง

---

## 2. การพัฒนา REST API

### สิ่งที่ถาม AI

ขอให้ AI ช่วยแนะนำการพัฒนา REST API Endpoint ตาม Requirement ของโจทย์

### สิ่งที่ AI ช่วย

AI ช่วยแนะนำการพัฒนา Endpoint ดังต่อไปนี้:

- `GET /api/equipment`
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/bookings`
- `PATCH /api/bookings/:id`
- `DELETE /api/bookings/:id`

AI ยังช่วยแนะนำ HTTP Status Code และรูปแบบ JSON Response ที่เหมาะสม

### การตรวจสอบด้วยตนเอง

ฉันทดสอบ Endpoint แต่ละรายการด้วย Postman ด้วยตนเอง

ตรวจสอบทั้ง HTTP Status Code และ Response Body เพื่อยืนยันว่า API ทำงานตามที่กำหนด

---

## 3. การป้องกันเวลาจองซ้อนกัน

### สิ่งที่ถาม AI

ถาม AI เกี่ยวกับวิธีป้องกันไม่ให้อุปกรณ์ชิ้นเดียวกันถูกจองในช่วงเวลาที่ซ้อนกัน

### สิ่งที่ AI ช่วย

AI แนะนำเงื่อนไขตรวจสอบช่วงเวลาซ้อน:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

สำหรับ PATCH AI แนะนำให้ไม่นำ Booking ID ที่กำลังแก้ไขมาตรวจสอบกับตัวเอง

### การตรวจสอบด้วยตนเอง

ฉันทดสอบการจองเวลาซ้อนด้วย Postman

สำหรับ POST ฉันทดลองสร้าง Booking ใหม่ที่มีช่วงเวลาชนกับ Booking เดิมของ Equipment เดียวกัน

สำหรับ PATCH ฉันทดลองแก้ไข Booking ให้มีช่วงเวลาชนกับ Booking อื่น

ทั้งสองกรณี API ตอบกลับ:

`409 Conflict`

จึงยืนยันได้ว่าระบบตรวจสอบเวลาซ้อนทั้งตอน Create และ Update

---

## 4. การตรวจสอบข้อมูลและ Error Handling

### สิ่งที่ถาม AI

ขอให้ AI ตรวจสอบว่าระบบยังมีปัญหาด้าน Input Validation และ Error Handling หรือไม่

### สิ่งที่ AI ช่วย

AI ช่วยตรวจสอบกรณี:

- Required Fields ไม่ครบ
- ช่วงเวลาจองไม่ถูกต้อง
- JSON Request Body ไม่ถูกต้อง
- String ที่มีเฉพาะช่องว่าง
- Equipment ไม่มีอยู่ในระบบ
- Booking ID ไม่ถูกต้อง
- ไม่พบ Booking
- ช่วงเวลาการจองซ้อนกัน

AI ยังแนะนำให้ Error Response ใช้รูปแบบเดียวกัน:

`{ "error": "message" }`

### การตรวจสอบด้วยตนเอง

ฉันทดสอบทั้ง Success Case และ Error Case ด้วย Postman

ตรวจสอบ HTTP Status Code เช่น:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`

และตรวจสอบ Response Body ในกรณีที่มี Response Body

---

## 5. ความปลอดภัยของ SQL

### สิ่งที่ถาม AI

ขอให้ AI ช่วยตรวจสอบ Basic API Security โดยเฉพาะการใช้งาน SQL

### สิ่งที่ AI ช่วย

AI แนะนำให้ใช้ Parameterized SQL ร่วมกับ `.bind()` แทนการนำข้อมูลจากผู้ใช้ไปต่อกับ SQL Statement โดยตรง

ตัวอย่าง:

`prepare('SELECT * FROM bookings WHERE id = ?').bind(id)`

### การตรวจสอบด้วยตนเอง

ฉันตรวจสอบ SQL Query ในโค้ด และยืนยันว่าค่าที่มาจาก Request และถูกนำไปใช้กับ SQL ถูกส่งผ่าน Parameter Binding

วิธีนี้ช่วยลดความเสี่ยงจาก SQL Injection ที่เกิดจากการนำ User Input ไปต่อกับ SQL โดยตรง

---

## 6. CORS

### สิ่งที่ถาม AI

ถาม AI เกี่ยวกับการตั้งค่า API เพื่อให้สามารถเชื่อมต่อกับ Frontend Tester ที่ทำงานผ่าน Browser ได้

### สิ่งที่ AI ช่วย

AI แนะนำการเพิ่ม Hono CORS Middleware ให้กับ API Route

โดยอนุญาต HTTP Method ที่ระบบใช้งาน ได้แก่:

- GET
- POST
- PATCH
- DELETE
- OPTIONS

### การตรวจสอบด้วยตนเอง

หลังจากเพิ่ม CORS ฉันทดสอบ API อีกครั้ง และตรวจสอบว่า Endpoint หลักยังสามารถทำงานและตอบกลับได้อย่างถูกต้อง

---

## 7. การทดสอบ API

### สิ่งที่ถาม AI

ขอให้ AI ช่วยแนะนำ Success Case และ Error Case ที่ควรทดสอบ รวมถึงกรณีที่ควรเก็บ Screenshot เป็นหลักฐาน

### สิ่งที่ AI ช่วย

AI แนะนำการทดสอบ เช่น:

- เรียกดู Equipment สำเร็จ
- สร้าง Booking สำเร็จ
- POST Booking ที่เวลาซ้อนและต้องถูกปฏิเสธ
- PATCH Booking สำเร็จ
- PATCH ให้เวลาซ้อนและต้องถูกปฏิเสธ
- เวลาเริ่มต้นและสิ้นสุดไม่ถูกต้อง
- ลบ Booking สำเร็จ
- ใช้ Equipment ที่ไม่มีอยู่จริง
- ส่ง JSON ที่ไม่ถูกต้อง
- ส่ง String ที่มีเฉพาะช่องว่าง

### การตรวจสอบด้วยตนเอง

ฉันเป็นผู้ส่ง Request แต่ละรายการด้วย Postman และตรวจสอบผลลัพธ์จริง

Screenshot ของ Test Case สำคัญถูกเก็บไว้ในโฟลเดอร์ `evidence`

---

## 8. AI Quality Gate

ฉันไม่ได้ใช้ Implementation เวอร์ชันแรกที่ AI ช่วยแนะนำเป็น Final Version ทันที

ก่อนเริ่ม Quality Gate ได้สร้าง Git Snapshot ของ First Working Version:

`883e8f9 - First working version before AI Quality Gate`

หลังจาก Snapshot แล้ว จึงตรวจสอบ Implementation ร่วมกับ AI และค้นหาจุดที่สามารถปรับปรุงได้

Quality Gate พบและแก้ไขทั้งหมด 3 จุด:

1. การจัดการ Malformed JSON
2. การป้องกัน POST รับ String ที่มีเฉพาะช่องว่าง
3. การป้องกัน PATCH รับ String ที่มีเฉพาะช่องว่าง

หลังจากแก้ไขแต่ละจุด ได้ทดสอบผลลัพธ์อีกครั้ง

รายละเอียด Finding, วิธีแก้ และ Evidence ถูกบันทึกไว้ใน:

`QUALITY_GATE_REVIEW.md`

---

## คำชี้แจงความรับผิดชอบ

AI ถูกใช้เป็น Development Assistant ในการสอบ Practical Lab ครั้งนี้

ฉันไม่ได้ใช้คำตอบจาก AI โดยไม่มีการตรวจสอบ

ฉันเป็นผู้รันคำสั่งสำหรับการพัฒนา สร้างและตั้งค่า Local Database รัน API ส่ง Test Request ตรวจสอบ HTTP Response ตรวจสอบ Business Rule เรื่อง Booking Overlap ตรวจสอบ SQL Parameter Binding และทดสอบการปรับปรุงจาก Quality Gate ก่อนส่งงานด้วยตนเอง
