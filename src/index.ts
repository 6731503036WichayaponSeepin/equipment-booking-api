import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
	equipment_booking_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
	origin: '*',
	allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type'],
}))


app.get('/', (c) => {
	return c.json({
		message: 'Campus Equipment Booking API'
	})
})

app.get('/api/equipment', async (c) => {
	try {
		const result = await c.env.equipment_booking_db
			.prepare('SELECT id, name, location FROM equipment')
			.all()

		return c.json(result.results, 200)
	} catch (error) {
		return c.json({
			error: 'Internal server error'
		}, 500)
	}
})

app.post('/api/bookings', async (c) => {
	try {
		let body: any

		try {
			body = await c.req.json()
		} catch {
			return c.json({
				error: 'Invalid JSON body'
			}, 400)
		}
		const {
			equipment_id,
			borrower_name,
			start_at,
			end_at,
			purpose
		} = body

		// 1. Required fields
		if (!equipment_id || !borrower_name || !start_at || !end_at || !purpose) {
			return c.json({
				error: 'Missing required fields'
			}, 400)
		}

		// Quality Gate: validate string fields
		if (
			typeof equipment_id !== 'string' ||
			typeof borrower_name !== 'string' ||
			typeof start_at !== 'string' ||
			typeof end_at !== 'string' ||
			typeof purpose !== 'string' ||
			equipment_id.trim() === '' ||
			borrower_name.trim() === '' ||
			start_at.trim() === '' ||
			end_at.trim() === '' ||
			purpose.trim() === ''
		) {
			return c.json({
				error: 'Fields must be non-empty strings'
			}, 400)
		}

		// 2. Validate time
		const startTime = new Date(start_at)
		const endTime = new Date(end_at)

		if (
			Number.isNaN(startTime.getTime()) ||
			Number.isNaN(endTime.getTime()) ||
			startTime >= endTime
		) {
			return c.json({
				error: 'Invalid booking time'
			}, 400)
		}

		// 3. Equipment must exist
		const equipment = await c.env.equipment_booking_db
			.prepare('SELECT id FROM equipment WHERE id = ?')
			.bind(equipment_id)
			.first()

		if (!equipment) {
			return c.json({
				error: 'Equipment not found'
			}, 404)
		}

		// 4. Check overlapping booking
		const conflict = await c.env.equipment_booking_db
			.prepare(`
				SELECT id FROM bookings
				WHERE equipment_id = ?
				AND start_at < ?
				AND end_at > ?
				LIMIT 1
			`)
			.bind(equipment_id, end_at, start_at)
			.first()

		if (conflict) {
			return c.json({
				error: 'Booking time conflicts with an existing booking'
			}, 409)
		}

		// 5. Create booking
		const result = await c.env.equipment_booking_db
			.prepare(`
				INSERT INTO bookings
				(equipment_id, borrower_name, start_at, end_at, purpose)
				VALUES (?, ?, ?, ?, ?)
			`)
			.bind(
				equipment_id,
				borrower_name,
				start_at,
				end_at,
				purpose
			)
			.run()

		const booking = await c.env.equipment_booking_db
			.prepare('SELECT * FROM bookings WHERE id = ?')
			.bind(result.meta.last_row_id)
			.first()

		return c.json(booking, 201)

	} catch (error) {
		return c.json({
			error: 'Internal server error'
		}, 500)
	}
})


app.get('/api/bookings', async (c) => {
	try {
		const result = await c.env.equipment_booking_db
			.prepare('SELECT * FROM bookings ORDER BY id')
			.all()

		return c.json(result.results, 200)
	} catch (error) {
		return c.json({
			error: 'Internal server error'
		}, 500)
	}
})

app.get('/api/bookings/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'))

		if (!Number.isInteger(id) || id <= 0) {
			return c.json({
				error: 'Invalid booking ID'
			}, 400)
		}

		const booking = await c.env.equipment_booking_db
			.prepare('SELECT * FROM bookings WHERE id = ?')
			.bind(id)
			.first()

		if (!booking) {
			return c.json({
				error: 'Booking not found'
			}, 404)
		}

		return c.json(booking, 200)

	} catch (error) {
		return c.json({
			error: 'Internal server error'
		}, 500)
	}
})

app.patch('/api/bookings/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'))

		if (!Number.isInteger(id) || id <= 0) {
			return c.json({ error: 'Invalid booking ID' }, 400)
		}

		const existing = await c.env.equipment_booking_db
			.prepare('SELECT * FROM bookings WHERE id = ?')
			.bind(id)
			.first()

		if (!existing) {
			return c.json({ error: 'Booking not found' }, 404)
		}

		let body: any

		try {
			body = await c.req.json()
		} catch {
			return c.json({
				error: 'Invalid JSON body'
			}, 400)
		}

		const equipment_id = body.equipment_id ?? existing.equipment_id
		const borrower_name = body.borrower_name ?? existing.borrower_name
		const start_at = body.start_at ?? existing.start_at
		const end_at = body.end_at ?? existing.end_at
		const purpose = body.purpose ?? existing.purpose

		if (
			typeof equipment_id !== 'string' ||
			typeof borrower_name !== 'string' ||
			typeof start_at !== 'string' ||
			typeof end_at !== 'string' ||
			typeof purpose !== 'string' ||
			equipment_id.trim() === '' ||
			borrower_name.trim() === '' ||
			start_at.trim() === '' ||
			end_at.trim() === '' ||
			purpose.trim() === ''
		) {
			return c.json({
				error: 'Fields must be non-empty strings'
			}, 400)
		}

		const startTime = new Date(String(start_at))
		const endTime = new Date(String(end_at))

		if (
			Number.isNaN(startTime.getTime()) ||
			Number.isNaN(endTime.getTime()) ||
			startTime >= endTime
		) {
			return c.json({ error: 'Invalid booking time' }, 400)
		}

		const equipment = await c.env.equipment_booking_db
			.prepare('SELECT id FROM equipment WHERE id = ?')
			.bind(equipment_id)
			.first()

		if (!equipment) {
			return c.json({ error: 'Equipment not found' }, 404)
		}

		const conflict = await c.env.equipment_booking_db
			.prepare(`
				SELECT id FROM bookings
				WHERE equipment_id = ?
				AND id != ?
				AND start_at < ?
				AND end_at > ?
				LIMIT 1
			`)
			.bind(equipment_id, id, end_at, start_at)
			.first()

		if (conflict) {
			return c.json({
				error: 'Booking time conflicts with an existing booking'
			}, 409)
		}

		await c.env.equipment_booking_db
			.prepare(`
				UPDATE bookings
				SET equipment_id = ?,
					borrower_name = ?,
					start_at = ?,
					end_at = ?,
					purpose = ?,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`)
			.bind(
				equipment_id,
				borrower_name,
				start_at,
				end_at,
				purpose,
				id
			)
			.run()

		const updated = await c.env.equipment_booking_db
			.prepare('SELECT * FROM bookings WHERE id = ?')
			.bind(id)
			.first()

		return c.json(updated, 200)

	} catch (error) {
		return c.json({ error: 'Internal server error' }, 500)
	}
})

app.delete('/api/bookings/:id', async (c) => {
	try {
		const id = Number(c.req.param('id'))

		if (!Number.isInteger(id) || id <= 0) {
			return c.json({ error: 'Invalid booking ID' }, 400)
		}

		const existing = await c.env.equipment_booking_db
			.prepare('SELECT id FROM bookings WHERE id = ?')
			.bind(id)
			.first()

		if (!existing) {
			return c.json({ error: 'Booking not found' }, 404)
		}

		await c.env.equipment_booking_db
			.prepare('DELETE FROM bookings WHERE id = ?')
			.bind(id)
			.run()

		return c.body(null, 204)

	} catch (error) {
		return c.json({ error: 'Internal server error' }, 500)
	}
})


export default app
