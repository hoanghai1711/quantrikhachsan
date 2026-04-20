-- ============================================================================
-- FIX SERVICES AND ORDER_SERVICES SCHEMA MISMATCHES
-- Synchronize database schema with Entity Framework models
-- Date: 2026-04-10
-- Issue: Services table missing Description and IsActive columns
--        Order_Services table using booking_detail_id instead of booking_id
-- ============================================================================

USE [HotelManagementDB]
GO

-- ============================================================================
-- PART 1: FIX SERVICES TABLE
-- ============================================================================

-- Add Description column to Services table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Services' AND COLUMN_NAME = 'description')
BEGIN
    ALTER TABLE [dbo].[Services]
    ADD [description] [nvarchar](max) NULL;
    
    PRINT 'Added [description] column to [Services] table';
END
GO

-- Ensure IsActive column exists with proper default
-- Note: AddServiceIsActiveColumn.sql migration should have added this
-- This is a safety check and fallback
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Services' AND COLUMN_NAME = 'is_active')
BEGIN
    ALTER TABLE [dbo].[Services]
    ADD [is_active] [bit] NOT NULL DEFAULT 1;
    
    -- Create index for is_active column to optimize queries
    CREATE NONCLUSTERED INDEX [IX_Services_IsActive]
    ON [dbo].[Services] ([is_active] ASC);
    
    PRINT 'Added [is_active] column to [Services] table';
END
GO

-- ============================================================================
-- PART 2: FIX ORDER_SERVICES TABLE
-- ============================================================================

-- First, add booking_id column if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'Order_Services' AND COLUMN_NAME = 'booking_id')
BEGIN
    ALTER TABLE [dbo].[Order_Services]
    ADD [booking_id] [int] NULL;
    
    PRINT 'Added [booking_id] column to [Order_Services] table';
END
GO

-- Populate booking_id from booking_details if booking_detail_id exists and booking_id is empty
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_NAME = 'Order_Services' AND COLUMN_NAME = 'booking_detail_id')
   AND EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
              WHERE TABLE_NAME = 'Order_Services' AND COLUMN_NAME = 'booking_id')
BEGIN
    UPDATE os 
    SET os.[booking_id] = bd.[booking_id]
    FROM [dbo].[Order_Services] os
    INNER JOIN [dbo].[Booking_Details] bd ON os.[booking_detail_id] = bd.[id]
    WHERE os.[booking_id] IS NULL;
    
    PRINT 'Populated [booking_id] from [Booking_Details]';
END
GO

-- Add foreign key constraint for booking_id if it doesn't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
               WHERE TABLE_NAME = 'Order_Services' 
               AND CONSTRAINT_NAME = 'FK__Order_Services__booking_id')
BEGIN
    ALTER TABLE [dbo].[Order_Services]
    ADD CONSTRAINT [FK__Order_Services__booking_id]
    FOREIGN KEY ([booking_id]) REFERENCES [dbo].[Bookings]([id])
    ON DELETE CASCADE;
    
    PRINT 'Added foreign key constraint for [booking_id]';
END
GO

-- ============================================================================
-- PART 3: VERIFY SERVICE DATA INTEGRITY
-- ============================================================================

-- List all services with their categories
SELECT 
    s.[id],
    s.[name],
    s.[description],
    s.[price],
    s.[unit],
    s.[category_id],
    sc.[name] AS [category_name]
FROM [dbo].[Services] s
LEFT JOIN [dbo].[ServiceCategories] sc ON s.[category_id] = sc.[id]
ORDER BY s.[id];

-- List all order services with booking info
SELECT TOP 10
    os.[id],
    os.[booking_id],
    os.[booking_detail_id],
    os.[order_date],
    os.[total_amount],
    os.[status],
    b.[id] AS [booking_verification]
FROM [dbo].[Order_Services] os
LEFT JOIN [dbo].[Bookings] b ON os.[booking_id] = b.[id]
ORDER BY os.[id];

GO

-- ============================================================================
-- SUMMARY
-- ============================================================================
PRINT '
=============================================================================
FIX COMPLETED
=============================================================================

Changes made:
1. ✓ Added [description] column to [Services] table
2. ✓ Added [booking_id] column to [Order_Services] table  
3. ✓ Populated [booking_id] from [Booking_Details]
4. ✓ Added foreign key constraint for [booking_id]

Next steps:
1. Verify data integrity with SELECT statements above
2. Test API endpoints: GET /api/services and GET /api/services/categories
3. Run backend application to apply Entity Framework migrations if needed

The following Entity Framework properties now align with database:
- Service.Description (nullable string)
- Service.IsActive (bit, default 1) ← Note: Still need to add IsActive column
- OrderService.BookingId (int, nullable)
- OrderService.Booking navigation property

=============================================================================
'
GO
