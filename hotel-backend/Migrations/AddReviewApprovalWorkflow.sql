-- Add status and audit columns to Reviews table for approval workflow
-- Timestamp: 2026-04-09
-- Description: Support review approval workflow with RBAC

USE [HotelManagementDB]
GO

-- Add new columns for approval workflow
ALTER TABLE [dbo].[Reviews]
ADD 
    [status] [nvarchar](20) NOT NULL DEFAULT 'Pending',
    [rejection_reason] [nvarchar](max) NULL,
    [reviewed_by] [int] NULL,
    [reviewed_at] [datetime] NULL;
GO

-- Add foreign key constraint for reviewed_by
ALTER TABLE [dbo].[Reviews]
ADD CONSTRAINT [FK_Reviews_ReviewedBy] 
FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[Users]([id]);
GO

-- Create index for status column to optimize queries
CREATE NONCLUSTERED INDEX [IX_Reviews_Status]
ON [dbo].[Reviews] ([status] ASC);
GO

-- Create index for filtering pending reviews
CREATE NONCLUSTERED INDEX [IX_Reviews_Status_CreatedAt]
ON [dbo].[Reviews] ([status] ASC, [created_at] DESC);
GO

-- Add check constraint to enforce valid status values
ALTER TABLE [dbo].[Reviews]
ADD CONSTRAINT [CK_Reviews_Status] 
CHECK ([status] IN ('Pending', 'Approved', 'Rejected'));
GO

-- Backfill existing approved reviews
UPDATE [dbo].[Reviews]
SET [status] = 'Approved', [reviewed_at] = [created_at]
WHERE [is_approved] = 1 AND [status] = 'Pending';
GO

-- UPDATE: Remove old is_approved column if it exists (optional - for full migration)
-- ALTER TABLE [dbo].[Reviews]
-- DROP COLUMN [is_approved];
-- GO
