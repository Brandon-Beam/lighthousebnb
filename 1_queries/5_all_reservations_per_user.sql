SELECT reservations.id, properties.title, reservations.start_date, cost_per_night , AVG(rating)
FROM reservations
JOIN properties ON property_id = properties.id
JOIN property_reviews ON reservation_id = reservations.id
WHERE owner_id = 1
GROUP BY reservations.id, properties.title, cost_per_night
ORDER BY start_date;