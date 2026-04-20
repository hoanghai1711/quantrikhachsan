-- Add IsActive column to Services table for service availability management
-- Timestamp: 2026-04-10
-- Description: Add IsActive boolean field to control service availability

USE [HotelManagementDB]
GO

-- Add IsActive column with default value true (active)
ALTER TABLE [dbo].[Services]
ADD [is_active] [bit] NOT NULL DEFAULT 1;
GO

-- Create index for is_active column to optimize queries
CREATE NONCLUSTERED INDEX [IX_Services_IsActive]
ON [dbo].[Services] ([is_active] ASC);
GO

-- Update existing services to be active by default
-- (Default constraint already sets this, but explicit update for clarity)
UPDATE [dbo].[Services]
SET [is_active] = 1
WHERE [is_active] IS NULL;
GO