-- Add used_count column to Vouchers table for tracking voucher usage
-- Timestamp: 2026-04-10
-- Description: Add used_count int field to track how many times a voucher has been used

USE [HotelManagementDB]
GO

-- Add used_count column with default value 0
ALTER TABLE [dbo].[Vouchers]
ADD [used_count] [int] NOT NULL DEFAULT 0;
GO

-- Create index for used_count column to optimize queries
CREATE NONCLUSTERED INDEX [IX_Vouchers_UsedCount]
ON [dbo].[Vouchers] ([used_count] ASC);
GO

-- Update existing vouchers to have used_count = 0
-- (Default constraint already sets this, but explicit update for clarity)
UPDATE [dbo].[Vouchers]
SET [used_count] = 0
WHERE [used_count] IS NULL;
GO