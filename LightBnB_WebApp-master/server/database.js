const { Pool } = require('pg');
const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      console.log('users', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      console.log('users', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const name = user.name
  const password = user.password
  const email = user.email
  return pool
    .query(`INSERT INTO users (name, password, email) VALUES ($1, $2, $3) RETURNING *;`, [name, password, email])
    .then((result) => {
      console.log('users', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(`SELECT reservations.*, properties.*
  FROM reservations
  JOIN properties ON property_id = properties.id
  JOIN property_reviews ON reservation_id = reservations.id
  WHERE reservations.guest_id = $1
  GROUP BY reservations.id, properties.title, cost_per_night, properties.id
  ORDER BY start_date;`, [guest_id])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {

  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    if (!options.city) {
      queryString += `WHERE cost_per_night < $${queryParams.length}`
    } else { queryString += `AND cost_per_night < $${queryParams.length} ` }
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    if (!options.city && !options.maximum_price_per_night) {
      queryString += `WHERE cost_per_night > $${queryParams.length}`
    } else { queryString += `AND cost_per_night > $${queryParams.length} ` }
  }

  queryString += `
  GROUP BY properties.id
  `

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length}
    `
  }


  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  console.log(queryString, queryParams);
  return pool.query(queryString, queryParams).then((res) => res.rows);
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const owner_id = property.owner_id
  const title = property.title
  const description = property.description
  const thumbnail_photo_url = property.thumbnail_photo_url
  const cover_photo_url = property.cover_photo_url
  const cost_per_night = property.cost_per_night
  const street = property.street
  const city = property.city
  const province = property.province
  const post_code = property.post_code
  const country = property.country
  const parking_spaces = property.parking_spaces
  const number_of_bathrooms = property.number_of_bathrooms
  const number_of_bedrooms = property.number_of_bedrooms
  const active = true
  return pool
    .query(`INSERT INTO properties (title, description, owner_id, cover_photo_url, thumbnail_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, active, province, city, country, street, post_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`, [title, description, owner_id, cover_photo_url, thumbnail_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, active, province, city, country, street, post_code])
    .then((result) => {
      console.log('users', result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.addProperty = addProperty;
