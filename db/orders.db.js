const pool = require("../config/index");

const createOrderDb = async ({
  cart,
  total_amount,
  userId,
  payment_method,
}) => {
  // create an order
  const { rows: order } = await pool.query(
  `INSERT INTO orders(user_id, status, total_amount, payment_method)
    VALUES($1, 'complete', $2, $3) returning *`,
    [userId, total_amount, payment_method]
  );
  
  var mycart =cart;
  var items=[];
   //create order_items
   mycart.forEach(async(item)=>{
    const {product_id,quantity,subtotal}= item;
     const result= await pool.query(
      `INSERT INTO order_item(order_id, product_id, quantity, subtotal)
       VALUES($1, $2, $3, $4)
        returning *
        `,
        [order[0].order_id, product_id, quantity, subtotal]);
        
   });
      const myorder={order:order[0],items:cart};
  return myorder;
};

const getAllOrdersDb = async ({ userId, limit, offset }) => {
  const { rowCount } = await pool.query(
    "SELECT * from orders WHERE orders.user_id = $1",
    [userId]
  );
  const orders = await pool.query(
    `SELECT order_id, user_id, status, date::date, total_amount 
      from orders WHERE orders.user_id = $1 order by order_id desc limit $2 offset $3`,
    [userId, limit, offset]
  );
  return { items: orders.rows, total: rowCount };
};

const getOrderDb = async ({ id, userId }) => {
  const { rows: order } = await pool.query(
    `SELECT products.*, order_item.quantity 
      from orders 
      join order_item
      on order_item.order_id = orders.order_id
      join products 
      on products.product_id = order_item.product_id 
      where orders.order_id = $1 AND orders.user_id = $2`,
    [id, userId]
  );
  return order;
};

module.exports = {
  createOrderDb,
  getAllOrdersDb,
  getOrderDb,
};
