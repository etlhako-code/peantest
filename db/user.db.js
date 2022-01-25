const pool = require("../config");

const getAllUsersDb = async () => {
  const { rows: users } = await pool.query("select * from users");
  return users;
};

const createUserDb = async ({ name, password, email, lastname }) => {
  const { rows: user } = await pool.query(
    `INSERT INTO users(name, password, email, lastname) 
    VALUES($1, $2, $3, $4) 
    returning user_id, name, email, lastname, roles, address, city, state, created_at`,
    [name, password, email, lastname]
  );
  return user[0];
};

const getUserByIdDb = async (id) => {
  const { rows: user } = await pool.query(
    "select users.*, cart.id as cart_id from users left join cart on cart.user_id = users.user_id where users.user_id = $1",
    [id]
  );
  return user[0];
};
const getUserByUsernameDb = async (name) => {
  const { rows: user } = await pool.query(
    "select users.*, cart.id as cart_id from users left join cart on cart.user_id = users.user_id where lower(users.name) = lower($1)",
    [name]
  );
  return user[0];
};

const getUserByEmailDb = async (email) => {
  const { rows: user } = await pool.query(
    "select users.*, cart.id as cart_id from users left join cart on cart.user_id = users.user_id where lower(email) = lower($1)",
    [email]
  );
  return user[0];
};

const updateUserDb = async ({
  name,
  email,
  lastname,
  id,
  address,
  city,
  province,
}) => {
  const { rows: user } = await pool.query(
    `UPDATE users set name = $1, email = $2, lastname = $3, address = $4, city = $5, province = $6
      where user_id = $8 returning name, email, lastname, user_id, address, city, province`,
    [name, email, lastname, address, city, province, id]
  );
  return user[0];
};

const deleteUserDb = async (id) => {
  const { rows: user } = await pool.query(
    "DELETE FROM users where user_id = $1 returning *",
    [id]
  );
  return user[0];
};

const changeUserPasswordDb = async (hashedPassword, email) => {
  return await pool.query("update users set password = $1 where email = $2", [
    hashedPassword,
    email,
  ]);
};

module.exports = {
  getAllUsersDb,
  getUserByIdDb,
  getUserByEmailDb,
  updateUserDb,
  createUserDb,
  deleteUserDb,
  getUserByUsernameDb,
  changeUserPasswordDb,
};
