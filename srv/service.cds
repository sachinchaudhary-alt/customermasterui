// Yeh file OData API expose karti hai
// SAP CAP automatically CRUD endpoints banata hai

using customer.master as master from '../db/schema';

service CustomerService {
    // Customers table bahar expose karo
    // Isse GET, POST, PUT, DELETE sab automatically ban jaata hai
    entity Customers as projection on master.Customers;
}

