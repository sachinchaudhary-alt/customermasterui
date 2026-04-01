// Customer Master ka database design
// SAP CAP is file se automatically table banata hai

namespace customer.master;

// Customers table — saare customers ka data yahan store hoga
entity Customers {
    key CustomerID   : Integer;      // Unique ID — har customer ka alag number
        customerName : String(100);  // Customer ka poora naam
        city         : String(50);   // Customer jis shehar mein rehta hai
        addressNo    : String(50);   // Address number
        phone        : String(15);   // Phone number
}