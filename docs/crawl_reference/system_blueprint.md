# Optical CRM - Core Architecture Blueprint

This blueprint maps out the core data architecture, module taxonomy, and business logic workflows for the Optical CRM.

## 1. Enterprise Module Taxonomy

The entire system is categorized into 9 distinct macro-modules that govern the application.

```mermaid
mindmap
  root((OPTICAL CRM))
    1. MASTER / CONFIGURATION
      Product definitions
      Product fields
      Customer fields
      Barcode fields
      Prescription formats
      Invoice & Order formats
      Discount settings
      SMS & WhatsApp settings
    2. PRODUCT MASTER
      Frame
      Sunglasses
      Lens
      Contact Lens
      Solution
      Other & Packages
    3. SUPPLY CHAIN
      Purchase
      Purchase Items
      Challan
      Barcode
      Purchase Return
    4. INVENTORY
      Stock & Stock Movement
      Transfer
      Audit & Adjustment
      Barcode Tracking
    5. CUSTOMER
      Customer & Patient
      Prescription
      Appointment
      Loyalty & Referral
      Promotions
    6. SALES
      Order & Order Items
      Prescription & Product
      Discount
      Invoice
      Payment
    7. COMMUNICATION
      SMS
      WhatsApp
      Feedback
      Order Ready
    8. FINANCE
      Expenses
      Ledgers & Vouchers
      Payables & Receivables
      Payments
      P/L & Balance Sheet
    9. ANALYTICS
      Sales & Purchase
      Inventory
      Customers
      Prescription
      Payments & Expenses
      GST & Operational
```

---

## 2. High-Level Data Flow Architecture

The system is driven by three primary foundational pillars that converge into operational workflows and ultimately feed into the financial accounting engine.

```mermaid
flowchart TD
    %% Pillars
    Master[MASTER DATA]
    CustData[CUSTOMER DATA]
    ProdData[PRODUCT DATA]

    %% Operations
    Prescription[PRESCRIPTION]
    Sales[SALES]
    Purchase[PURCHASE]
    Inventory[INVENTORY]
    StockMove[STOCK MOVEMENT]
    
    %% Financials
    Invoice[INVOICE]
    Payment[PAYMENT]
    Accounting[ACCOUNTING]

    %% Relationships
    CustData & ProdData --> Prescription
    Prescription --> Sales
    ProdData --> Purchase
    Purchase --> Inventory
    Sales --> Inventory
    Sales --> Invoice
    Invoice --> Payment
    Inventory --> StockMove
    Payment & StockMove --> Accounting
```

---

## 3. Core Operational Cascade (The Supply Chain Flow)

This represents the strict linear flow of goods and money through the system, from creation to final accounting.

```mermaid
flowchart TD
    PM[PRODUCT MASTER] --> PUR[PURCHASE]
    PUR --> INV[INVENTORY]
    INV --> SAL[SALES]
    SAL --> ACC[ACCOUNTING]

    subgraph Product Master
        P1(Frame)
        P2(Sunglasses)
        P3(Lens)
        P4(Contact Lens)
        P5(Solution)
        P6(Other)
        P7(Non-Chargeable)
        P8(Package)
    end
    
    subgraph Purchase
        PU1(Purchase)
        PU2(Purchase Items)
        PU3(Challan)
        PU4(Barcode)
        PU5(Purchase Price)
        PU6(Discount)
        PU7(Other Cost)
    end
    
    subgraph Inventory
        I1(Stock Available)
        I2(Stock In)
        I3(Stock Out)
        I4(Stock Transfer)
        I5(Adjustment)
        I6(Audit)
        I7(Barcode Tracking)
    end
    
    subgraph Sales
        S1(Customer)
        S2(Product)
        S3(Prescription)
        S4(Order)
        S5(Discount)
        S6(Invoice)
        S7(Payment)
    end
    
    subgraph Accounting
        A1(Revenue)
        A2(Receivable)
        A3(Payment)
        A4(Profit/Loss)
    end
```

---

## 4. The Clinical-to-Retail Workflow (Sales & Prescription Flow)

This flow details the exact data structure required when a Customer receives a Prescription and converts it into a Sales Order for a Frame and Lens.

```mermaid
flowchart TD
    CUST[CUSTOMER] --> PRES[PRESCRIPTION]
    PRES --> SO[SALES ORDER]
    SO --> INV_CHECK[INVENTORY]
    INV_CHECK --> INVOICE[INVOICE]

    subgraph Prescription Data
        P_PATIENT[Patient]
        P_OD[Right Eye / OD]
        P_OS[Left Eye / OS]
        P_DV[Distance Vision]
        P_NV[Near Vision]
        P_NOTES[Notes]
        P_HIST[Prescription Version / History]
        
        P_OD_FIELDS(SPH, CYL, AXIS, ADD, PD)
        P_OS_FIELDS(SPH, CYL, AXIS, ADD, PD)
        
        P_OD -.-> P_OD_FIELDS
        P_OS -.-> P_OS_FIELDS
    end
    
    subgraph Sales Order Details
        SO_FRAME[FRAME]
        SO_LENS[LENS]
        
        SO_LENS_FIELDS(Vision, Design, Coating, Material, Index, Power, Addition, Axis)
        SO_LENS -.-> SO_LENS_FIELDS
    end
```

---

## 5. The Inventory Lifecycle Workflow

This flow maps the precise states of stock movement through the system, from initial receipt to final disposition.

```mermaid
flowchart TD
    PROD[PRODUCT] --> PUR[PURCHASE]
    PUR --> RECV[STOCK RECEIVED]
    
    RECV --> AVAIL[AVAILABLE]
    RECV --> TRANS[TRANSFER]
    RECV --> ADJ[ADJUSTMENT]
    
    TRANS --> OB[OTHER BRANCH]
    
    AVAIL --> SALE[SALE]
    ADJ --> SALE
    
    SALE --> SOLD[SOLD]
    SALE --> RET[RETURN]
    
    SOLD --> OUT[STOCK OUT]
    RET --> BACK[STOCK BACK]
```

---

## 6. Detailed Entity Models

### A. The Comprehensive Customer Entity
The Customer is the central hub for all outward-facing business operations, marketing, and clinical history.

```mermaid
mindmap
  root((CUSTOMER))
    Basic Profile
    Patient Details
    Prescription
      Historical prescriptions
      Eyewear prescription
      Contact-lens prescription
    SALES
      Orders
      Products
      Invoice
      Payments
    MARKETING
      SMS
      WhatsApp
      Coupons
      Loyalty
      Referral
    EVENTS
      Birthday
      Anniversary
    ACCOUNT
      Receivable
      Payment history
```

### B. The Product Entity
The Product is the central hub for all supply chain and inventory operations.

*   **Supply Chain:** Purchase, Stock Transfer, Vendor Returns
*   **Operational:** Inventory Tracking, Barcode Generation
*   **Transactional:** Sales
*   **Analytics:** Product-specific Reports

---

## 7. Enterprise Reporting Architecture

The reporting module aggregates data from the three main operational branches (Sales, Purchase, Inventory) and feeds them into the overarching Financial reports.

```mermaid
flowchart TD
    REP[REPORTING ENGINE]
    
    REP --> S_REP[SALES]
    REP --> P_REP[PURCHASE]
    REP --> I_REP[INVENTORY]
    
    S_REP --> S1(Sales Report)
    S_REP --> S2(Payment Report)
    S_REP --> S3(Customer Report)
    S_REP --> S4(Pending Orders)
    S_REP --> S5(Prescription Report)
    
    P_REP --> P1(Purchase Report)
    
    I_REP --> I1(Stock Report)
    I_REP --> I2(Barcode Report)
    I_REP --> I3(Closing Stock)
    I_REP --> I4(Loss/Damage)
    I_REP --> I5(Transfer Stock)
    I_REP --> I6(Lens Grid)
    
    S_REP & P_REP & I_REP --> FIN[FINANCIAL]
    
    FIN --> F1(Expense)
    FIN --> F2(GST)
    FIN --> F3(Payment)
    FIN --> F4(Profit/Loss)
    FIN --> F5(Balance Sheet)
```
