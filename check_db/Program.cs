using System;
using Npgsql;

var connString = "Host=ep-royal-wind-ahn6fero-pooler.c-3.us-east-1.aws.neon.tech; Database=test; Username=neondb_owner; Password=npg_AMO4r3GcfyzY; SSL Mode=VerifyFull;";
using var conn = new NpgsqlConnection(connString);
conn.Open();

Console.WriteLine("--- Rooms Summary ---");
using var cmdRooms = new NpgsqlCommand("SELECT room_type_id, status, COUNT(*) FROM \"Rooms\" GROUP BY room_type_id, status", conn);
using var readerRooms = cmdRooms.ExecuteReader();
while (readerRooms.Read())
{
    Console.WriteLine($"RoomType: {readerRooms[0]}, Status: {readerRooms[1]}, Count: {readerRooms[2]}");
}
readerRooms.Close();

Console.WriteLine("\n--- Booking Details ---");
using var cmd1 = new NpgsqlCommand("SELECT id, room_type_id, room_id, check_in_date, check_out_date FROM \"Booking_Details\"", conn);
using var reader1 = cmd1.ExecuteReader();
while (reader1.Read())
{
    Console.WriteLine($"ID: {reader1[0]}, RoomType: {reader1[1]}, RoomID: {reader1[2]}, In: {reader1[3]}, Out: {reader1[4]}");
}
reader1.Close();

Console.WriteLine("\n--- Room Holds ---");
using var cmd2 = new NpgsqlCommand("SELECT id, room_type_id, check_in, check_out, hold_expiry FROM \"Room_Holds\"", conn);
using var reader2 = cmd2.ExecuteReader();
while (reader2.Read())
{
    Console.WriteLine($"ID: {reader2[0]}, RoomType: {reader2[1]}, In: {reader2[2]}, Out: {reader2[3]}, Expiry: {reader2[4]}");
}
reader2.Close();

Console.WriteLine("\n--- Current UtcNow ---");
Console.WriteLine(DateTimeOffset.UtcNow);
