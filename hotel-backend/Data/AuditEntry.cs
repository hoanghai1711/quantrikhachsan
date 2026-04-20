using System;
using System.Collections.Generic;
using System.Linq;
using HotelBackend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

public class AuditEntry
{
    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public EntityEntry Entry { get; }
    public string TableName { get; set; } = "";
    public Dictionary<string, object?> KeyValues { get; } = new Dictionary<string, object?>();
    public Dictionary<string, object?> OldValues { get; } = new Dictionary<string, object?>();
    public Dictionary<string, object?> NewValues { get; } = new Dictionary<string, object?>();
    public List<PropertyEntry> TemporaryProperties { get; } = new List<PropertyEntry>();
    public bool HasTemporaryProperties => TemporaryProperties.Any();
    public int UserId { get; set; }
    public string? IpAddress { get; set; }

    public AuditLog ToAudit()
    {
        var action = Entry.State switch
        {
            EntityState.Added => "CREATE",
            EntityState.Modified => "UPDATE",
            EntityState.Deleted => "DELETE",
            _ => Entry.State.ToString()
        };

        var recordId = KeyValues.Count switch
        {
            0 => null,
            1 => KeyValues.Values.FirstOrDefault()?.ToString(),
            _ => System.Text.Json.JsonSerializer.Serialize(KeyValues)
        };

        var audit = new AuditLog
        {
            UserId = UserId,
            Action = action,
            TableName = TableName,
            RecordId = recordId,
            OldValues = OldValues.Count == 0 ? null : System.Text.Json.JsonSerializer.Serialize(OldValues),
            NewValues = NewValues.Count == 0 ? null : System.Text.Json.JsonSerializer.Serialize(NewValues),
            Timestamp = DateTime.UtcNow,
            IpAddress = IpAddress
        };
        return audit;
    }
}