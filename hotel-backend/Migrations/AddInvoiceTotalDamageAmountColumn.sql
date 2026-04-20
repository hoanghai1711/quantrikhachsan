IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[Invoices]')
      AND name = 'total_damage_amount'
)
BEGIN
    ALTER TABLE [dbo].[Invoices]
    ADD [total_damage_amount] decimal(18,2) NOT NULL CONSTRAINT DF_Invoices_TotalDamageAmount DEFAULT 0;
END

GO

IF OBJECT_ID(N'[dbo].[sp_AddLossAndDamage]', 'P') IS NOT NULL
    DROP PROCEDURE [dbo].[sp_AddLossAndDamage];
GO

CREATE PROCEDURE [dbo].[sp_AddLossAndDamage]
    @BookingDetailId int,
    @RoomInventoryId int = NULL,
    @Quantity int,
    @PenaltyAmount decimal(18,2),
    @Description nvarchar(max) = NULL,
    @ImageUrl nvarchar(2048) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @InvoiceId int;
    DECLARE @BookingId int;

    SELECT @BookingId = booking_id FROM [dbo].[Booking_Details] WHERE id = @BookingDetailId;
    IF @BookingId IS NULL
    BEGIN
        RAISERROR('Booking detail không tồn tại.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    INSERT INTO [dbo].[Loss_And_Damages] ([booking_detail_id], [room_inventory_id], [quantity], [penalty_amount], [description], [image_url], [created_at])
    VALUES (@BookingDetailId, @RoomInventoryId, @Quantity, @PenaltyAmount, @Description, @ImageUrl, GETUTCDATE());

    SELECT @InvoiceId = i.id
    FROM [dbo].[Invoices] i
    WHERE i.booking_id = @BookingId;

    IF @InvoiceId IS NULL
    BEGIN
        INSERT INTO [dbo].[Invoices] ([booking_id], [total_room_amount], [total_service_amount], [total_damage_amount], [discount_amount], [tax_amount], [final_total], [status], [created_at])
        VALUES (@BookingId, 0, 0, @PenaltyAmount, 0, 0, @PenaltyAmount, 'Unpaid', GETUTCDATE());

        SELECT @InvoiceId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        UPDATE [dbo].[Invoices]
        SET total_damage_amount = total_damage_amount + @PenaltyAmount,
            final_total = final_total + @PenaltyAmount
        WHERE id = @InvoiceId;
    END

    COMMIT TRANSACTION;
END
GO
