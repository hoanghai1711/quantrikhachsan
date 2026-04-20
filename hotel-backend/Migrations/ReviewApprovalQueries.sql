-- ============================================================================
-- REVIEW APPROVAL WORKFLOW SQL QUERIES
-- Enterprise-grade queries with RBAC support
-- ============================================================================

-- ============================================================================
-- 1. GET PENDING REVIEWS (for admin moderation dashboard)
-- ============================================================================
SELECT 
    r.[id],
    r.[user_id],
    u.[full_name] AS [guest_name],
    u.[email] AS [guest_email],
    r.[room_type_id],
    r.[rating],
    r.[comment],
    r.[created_at],
    r.[status],
    DATEDIFF(HOUR, r.[created_at], GETUTCDATE()) AS [hours_pending]
FROM [dbo].[Reviews] r
LEFT JOIN [dbo].[Users] u ON r.[user_id] = u.[id]
WHERE r.[status] = 'Pending'
ORDER BY r.[created_at] ASC;

-- ============================================================================
-- 2. GET REVIEWS WITH STATUS FILTER AND PAGINATION
-- ============================================================================
DECLARE @PageNumber INT = 1;
DECLARE @PageSize INT = 20;
DECLARE @Status NVARCHAR(20) = 'Pending'; -- Can be 'Pending', 'Approved', or 'Rejected'

SELECT 
    r.[id],
    r.[user_id],
    u.[full_name] AS [guest_name],
    r.[rating],
    r.[comment],
    r.[created_at],
    r.[status],
    r.[rejection_reason],
    r.[reviewed_at],
    reviewer.[full_name] AS [reviewed_by],
    ROW_NUMBER() OVER (ORDER BY r.[created_at] DESC) AS [row_num]
FROM [dbo].[Reviews] r
LEFT JOIN [dbo].[Users] u ON r.[user_id] = u.[id]
LEFT JOIN [dbo].[Users] reviewer ON r.[reviewed_by] = reviewer.[id]
WHERE r.[status] = @Status
    OR @Status IS NULL -- If NULL, get all reviews
ORDER BY r.[created_at] DESC
OFFSET (@PageNumber - 1) * @PageSize ROWS
FETCH NEXT @PageSize ROWS ONLY;

-- ============================================================================
-- 3. APPROVE REVIEW (for admin moderation)
-- ============================================================================
DECLARE @ReviewId INT = 1;
DECLARE @AdminUserId INT = 1; -- Current logged-in admin

UPDATE [dbo].[Reviews]
SET 
    [status] = 'Approved',
    [reviewed_by] = @AdminUserId,
    [reviewed_at] = GETUTCDATE(),
    [rejection_reason] = NULL
WHERE [id] = @ReviewId
    AND [status] = 'Pending';

-- Verify update
SELECT [id], [status], [reviewed_by], [reviewed_at] FROM [dbo].[Reviews] WHERE [id] = @ReviewId;

-- ============================================================================
-- 4. REJECT REVIEW ACCOUNT (for admin moderation)
-- ============================================================================
DECLARE @ReviewId INT = 2;
DECLARE @AdminUserId INT = 1; -- Current logged-in admin
DECLARE @RejectionReason NVARCHAR(MAX) = 'Offensive language';

UPDATE [dbo].[Reviews]
SET 
    [status] = 'Rejected',
    [reviewed_by] = @AdminUserId,
    [reviewed_at] = GETUTCDATE(),
    [rejection_reason] = @RejectionReason
WHERE [id] = @ReviewId
    AND [status] = 'Pending';

-- Verify update
SELECT [id], [status], [reviewed_by], [reviewed_at], [rejection_reason] 
FROM [dbo].[Reviews] 
WHERE [id] = @ReviewId;

-- ============================================================================
-- 5. GET REVIEW MODERATION STATS
-- ============================================================================
SELECT 
    [status],
    COUNT(*) AS [count],
    AVG([rating]) AS [avg_rating]
FROM [dbo].[Reviews]
GROUP BY [status]
ORDER BY [status];

-- ============================================================================
-- 6. GET REVIEWS PENDING APPROVAL FOR LONGER THAN X HOURS
-- ============================================================================
DECLARE @HoursThreshold INT = 48;

SELECT 
    r.[id],
    u.[full_name] AS [guest_name],
    r.[rating],
    r.[created_at],
    DATEDIFF(HOUR, r.[created_at], GETUTCDATE()) AS [hours_pending]
FROM [dbo].[Reviews] r
LEFT JOIN [dbo].[Users] u ON r.[user_id] = u.[id]
WHERE r.[status] = 'Pending'
    AND DATEDIFF(HOUR, r.[created_at], GETUTCDATE()) > @HoursThreshold
ORDER BY r.[created_at] ASC;

-- ============================================================================
-- 7. GET ADMIN MODERATION ACTIVITY LOG
-- ============================================================================
SELECT TOP 100
    r.[id] AS [review_id],
    reviewer.[full_name] AS [admin_name],
    r.[status],
    r.[reviewed_at],
    r.[rejection_reason],
    CASE 
        WHEN r.[status] = 'Approved' THEN 'Approved review'
        WHEN r.[status] = 'Rejected' THEN 'Rejected review: ' + ISNULL(r.[rejection_reason], 'N/A')
        ELSE 'Pending'
    END AS [action]
FROM [dbo].[Reviews] r
LEFT JOIN [dbo].[Users] reviewer ON r.[reviewed_by] = reviewer.[id]
WHERE r.[reviewed_at] IS NOT NULL
ORDER BY r.[reviewed_at] DESC;

-- ============================================================================
-- 8. BACKFILL: Migrate from old is_approved column (if exists)
-- ============================================================================
-- Uncomment if migrating from old schema with is_approved boolean column
/*
UPDATE [dbo].[Reviews]
SET [status] = CASE 
    WHEN [is_approved] = 1 THEN 'Approved'
    WHEN [is_approved] = 0 THEN 'Pending'
    ELSE 'Pending'
END,
[reviewed_at] = CASE 
    WHEN [is_approved] = 1 THEN [created_at]
    ELSE NULL
END;
*/
