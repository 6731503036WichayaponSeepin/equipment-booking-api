# AI Quality Gate Review

## English Version

## 1. Pre-Quality-Gate Snapshot

After the first working version of the API was completed, I created a Git snapshot before making the AI Quality Gate improvements.

Git commit:

`883e8f9 - First working version before AI Quality Gate`

Evidence:

`evidence/09_PRE_QUALITY_GATE_snapshot.png`

This snapshot represents the working implementation before the Quality Gate review and improvements.

---

## 2. Finding 1: Invalid JSON Handling

### What I Found

The POST and PATCH endpoints used `c.req.json()` to parse the request body.

If a client sent malformed JSON, JSON parsing could fail and be handled by the general error handler as an internal server error.

Malformed JSON is a client input problem and should return a 400-level response rather than HTTP 500.

### How I Fixed It

I added specific error handling around JSON parsing in POST and PATCH.

If JSON parsing fails, the API now returns:

`400 Bad Request`

with:

`{ "error": "Invalid JSON body" }`

### Verification

I sent malformed JSON to:

`POST /api/bookings`

The API returned:

`400 Bad Request`

with:

`{ "error": "Invalid JSON body" }`

Evidence:

`evidence/10_QG_invalid_json_400.png`

### Result

Invalid JSON is now handled as a client input error instead of an internal server error.

---

## 3. Finding 2: POST Allowed Whitespace-Only Strings

### What I Found

The first implementation checked whether required fields existed.

However, string input containing only whitespace could still be considered a provided value.

Example:

`"borrower_name": "   "`

A borrower name containing only spaces should not be accepted as valid input.

### How I Fixed It

I added:

- Type checking for required string fields.
- `.trim()` validation to ensure that the values contain actual text.

The validation covers:

- `equipment_id`
- `borrower_name`
- `start_at`
- `end_at`
- `purpose`

If a required field contains only whitespace, the API returns:

`400 Bad Request`

with:

`{ "error": "Fields must be non-empty strings" }`

### Verification

I sent:

`POST /api/bookings`

with a whitespace-only value for `borrower_name`.

The API returned:

`400 Bad Request`

with:

`{ "error": "Fields must be non-empty strings" }`

Evidence:

`evidence/11_QG_empty_string_400.png`

### Result

POST requests can no longer create bookings containing whitespace-only required string values.

---

## 4. Finding 3: PATCH Allowed Whitespace-Only Strings

### What I Found

The PATCH endpoint supports partial updates by merging submitted values with the existing booking data.

However, the first implementation could accept a submitted value containing only whitespace.

For example:

`{ "purpose": "   " }`

This could replace valid existing data with an invalid whitespace-only value.

### How I Fixed It

After merging the PATCH request values with the existing booking data, I added the same type and non-empty string validation used for POST.

This ensures that the final values used for the update are valid strings containing actual text.

### Verification

I sent:

`PATCH /api/bookings/1`

with:

`{ "purpose": "   " }`

The API returned:

`400 Bad Request`

with:

`{ "error": "Fields must be non-empty strings" }`

Evidence:

`evidence/12_QG_PATCH_empty_string_400.png`

### Result

PATCH requests can no longer replace valid booking information with whitespace-only values.

---

## 5. Additional Checks During Quality Gate

In addition to the three findings above, I reviewed the implementation for the following requirements:

### SQL Parameter Binding

SQL queries that use request values use placeholders and `.bind()`.

This avoids directly concatenating user-controlled values into SQL statements.

### Booking Overlap on Create

POST checks whether another booking for the same equipment overlaps the requested time.

The overlap condition is:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

A conflict returns:

`409 Conflict`

### Booking Overlap on Update

PATCH performs the same overlap check.

The current booking ID is excluded from the query to prevent a booking from conflicting with itself.

A conflict returns:

`409 Conflict`

### Equipment Existence

Before creating or updating a booking, the API verifies that the referenced equipment exists.

A nonexistent equipment ID returns:

`404 Not Found`

### Booking Time

The API verifies that the booking start time is earlier than the end time.

Invalid booking time returns:

`400 Bad Request`

### Booking IDs

Endpoints that operate on a booking ID validate that the ID is a positive integer.

Invalid IDs return:

`400 Bad Request`

Missing bookings return:

`404 Not Found`

### CORS

CORS middleware is configured for `/api/*` and allows the HTTP methods required by the API.

---

## 6. Quality Gate Summary

The first working implementation was saved before the Quality Gate review.

After reviewing the implementation, three validation and error-handling improvements were identified, implemented, and tested.

The final implementation was also reviewed for:

- Input validation
- JSON parsing
- HTTP status codes
- Consistent JSON error responses
- SQL parameter binding
- Equipment existence checking
- Booking overlap prevention during POST
- Booking overlap prevention during PATCH
- Booking time validation
- Booking ID validation
- CORS configuration

The API was manually tested after the Quality Gate improvements.

---

# รายงานการตรวจสอบ AI Quality Gate

## ฉบับภาษาไทย

## 1. Snapshot ก่อนเริ่ม Quality Gate

หลังจาก API เวอร์ชันแรกสามารถทำงานได้แล้ว ฉันสร้าง Git Snapshot ก่อนที่จะเริ่มแก้ไขระบบตาม AI Quality Gate

Git Commit:

`883e8f9 - First working version before AI Quality Gate`

หลักฐาน:

`evidence/09_PRE_QUALITY_GATE_snapshot.png`

Snapshot นี้ใช้เป็นหลักฐานของ Working Version ก่อนการตรวจสอบและปรับปรุง Quality Gate

---

## 2. Finding 1: การจัดการ JSON ที่ไม่ถูกต้อง

### สิ่งที่พบ

POST และ PATCH ใช้ `c.req.json()` สำหรับอ่าน Request Body

หาก Client ส่ง JSON ที่เขียนผิดรูปแบบ การ Parse JSON อาจเกิด Error และถูกจัดการโดย General Error Handler ทำให้มีโอกาสตอบกลับเป็น Internal Server Error

แต่ Malformed JSON เป็นข้อผิดพลาดจากข้อมูลที่ Client ส่งมา จึงควรตอบกลับเป็น HTTP 400 ไม่ใช่ HTTP 500

### วิธีที่แก้ไข

เพิ่ม Error Handling เฉพาะส่วนที่ Parse JSON ทั้งใน POST และ PATCH

หาก Parse JSON ไม่สำเร็จ API จะตอบกลับ:

`400 Bad Request`

พร้อม:

`{ "error": "Invalid JSON body" }`

### การตรวจสอบ

ทดลองส่ง Malformed JSON ไปยัง:

`POST /api/bookings`

API ตอบกลับ:

`400 Bad Request`

พร้อม:

`{ "error": "Invalid JSON body" }`

หลักฐาน:

`evidence/10_QG_invalid_json_400.png`

### ผลลัพธ์

JSON ที่ไม่ถูกต้องถูกจัดการเป็น Client Input Error แทนที่จะถูกจัดการเป็น Internal Server Error

---

## 3. Finding 2: POST สามารถรับ String ที่มีเฉพาะช่องว่าง

### สิ่งที่พบ

Implementation เวอร์ชันแรกตรวจสอบว่า Required Field มีค่าหรือไม่

แต่ String ที่มีเฉพาะช่องว่างอาจยังถูกมองว่าเป็นค่าที่ถูกส่งมา

ตัวอย่าง:

`"borrower_name": "   "`

ชื่อผู้จองที่มีเฉพาะช่องว่างไม่ควรถูกยอมรับเป็นข้อมูลที่ถูกต้อง

### วิธีที่แก้ไข

เพิ่ม:

- การตรวจสอบ Type ของ Required String Fields
- การใช้ `.trim()` เพื่อตรวจสอบว่าข้อมูลมีข้อความจริงหลังจากตัดช่องว่าง

ตรวจสอบ Field:

- `equipment_id`
- `borrower_name`
- `start_at`
- `end_at`
- `purpose`

หาก Field มีเฉพาะช่องว่าง API จะตอบกลับ:

`400 Bad Request`

พร้อม:

`{ "error": "Fields must be non-empty strings" }`

### การตรวจสอบ

ทดลองส่ง:

`POST /api/bookings`

โดยกำหนด `borrower_name` ให้มีเฉพาะช่องว่าง

API ตอบกลับ:

`400 Bad Request`

พร้อม:

`{ "error": "Fields must be non-empty strings" }`

หลักฐาน:

`evidence/11_QG_empty_string_400.png`

### ผลลัพธ์

POST ไม่สามารถสร้าง Booking ที่ Required String Field มีเฉพาะช่องว่างได้อีก

---

## 4. Finding 3: PATCH สามารถอัปเดต String เป็นช่องว่าง

### สิ่งที่พบ

PATCH รองรับ Partial Update โดยนำค่าที่ Client ส่งมาไปรวมกับข้อมูล Booking เดิม

แต่ Implementation เวอร์ชันแรกยังสามารถรับค่าที่มีเฉพาะช่องว่างได้

ตัวอย่าง:

`{ "purpose": "   " }`

ทำให้ข้อมูลเดิมที่ถูกต้องอาจถูกแทนที่ด้วยข้อมูลที่ไม่มีความหมาย

### วิธีที่แก้ไข

หลังจากรวมข้อมูลจาก PATCH กับข้อมูล Booking เดิมแล้ว ได้เพิ่ม Type Validation และ Non-Empty String Validation แบบเดียวกับ POST

ทำให้ค่าที่จะนำไป Update ต้องเป็น String ที่มีข้อความจริง

### การตรวจสอบ

ทดลองส่ง:

`PATCH /api/bookings/1`

พร้อม:

`{ "purpose": "   " }`

API ตอบกลับ:

`400 Bad Request`

พร้อม:

`{ "error": "Fields must be non-empty strings" }`

หลักฐาน:

`evidence/12_QG_PATCH_empty_string_400.png`

### ผลลัพธ์

PATCH ไม่สามารถนำค่าที่มีเฉพาะช่องว่างไปแทนข้อมูล Booking ที่ถูกต้องได้อีก

---

## 5. การตรวจสอบเพิ่มเติมระหว่าง Quality Gate

นอกจาก Finding ทั้ง 3 จุดแล้ว ยังได้ตรวจสอบ Requirement สำคัญอื่น ๆ ดังนี้

### SQL Parameter Binding

SQL Query ที่ใช้ค่าจาก Request ใช้ Placeholder และ `.bind()`

จึงไม่มีการนำ User Input ไปต่อกับ SQL Statement โดยตรง

### การตรวจสอบ Booking Overlap ตอน Create

POST ตรวจสอบว่ามี Booking อื่นของ Equipment เดียวกันที่มีช่วงเวลาซ้อนกับเวลาที่ต้องการจองหรือไม่

ใช้เงื่อนไข:

`existing.start_at < new.end_at AND existing.end_at > new.start_at`

หากเวลาซ้อนกัน API ตอบกลับ:

`409 Conflict`

### การตรวจสอบ Booking Overlap ตอน Update

PATCH ตรวจสอบ Overlap ด้วยเงื่อนไขเดียวกัน

แต่จะไม่นำ Booking ID ที่กำลังแก้ไขมาตรวจชนกับตัวเอง

หากเวลาซ้อนกับ Booking อื่น API ตอบกลับ:

`409 Conflict`

### การตรวจสอบ Equipment

ก่อนสร้างหรือแก้ไข Booking ระบบตรวจสอบว่า Equipment ที่อ้างถึงมีอยู่จริงหรือไม่

หากไม่มี Equipment ดังกล่าว API ตอบกลับ:

`404 Not Found`

### การตรวจสอบช่วงเวลา Booking

ระบบตรวจสอบว่าเวลาเริ่มต้นต้องอยู่ก่อนเวลาสิ้นสุด

หากเวลาไม่ถูกต้อง API ตอบกลับ:

`400 Bad Request`

### การตรวจสอบ Booking ID

Endpoint ที่รับ Booking ID ตรวจสอบว่า ID ต้องเป็นจำนวนเต็มบวก

หาก ID ไม่ถูกต้อง API ตอบกลับ:

`400 Bad Request`

หาก ID ถูกต้องแต่ไม่มี Booking ดังกล่าว API ตอบกลับ:

`404 Not Found`

### CORS

ตั้งค่า CORS Middleware สำหรับ `/api/*` และอนุญาต HTTP Method ที่ API ต้องใช้งาน

---

## 6. สรุป Quality Gate

ก่อนเริ่ม Quality Gate ได้เก็บ First Working Version ไว้เป็น Git Snapshot

หลังจากตรวจสอบ Implementation พบจุดที่ควรปรับปรุงด้าน Validation และ Error Handling จำนวน 3 จุด และได้แก้ไขพร้อมทดสอบผลลัพธ์จริง

นอกจากนี้ยังตรวจสอบ:

- Input Validation
- JSON Parsing
- HTTP Status Codes
- รูปแบบ JSON Error Response
- SQL Parameter Binding
- การตรวจสอบว่า Equipment มีอยู่จริง
- การป้องกัน Booking Overlap ตอน POST
- การป้องกัน Booking Overlap ตอน PATCH
- การตรวจสอบช่วงเวลาการจอง
- การตรวจสอบ Booking ID
- การตั้งค่า CORS

หลังจากแก้ไข Quality Gate แล้ว ได้ทดสอบ API อีกครั้งเพื่อยืนยันว่าระบบยังทำงานได้อย่างถูกต้อง
