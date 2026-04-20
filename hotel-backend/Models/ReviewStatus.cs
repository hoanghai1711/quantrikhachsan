namespace HotelBackend.Models
{
    /// <summary>
    /// Represents the approval status of a review
    /// </summary>
    public enum ReviewStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    /// <summary>
    /// Constants for review status strings
    /// </summary>
    public static class ReviewStatusConstants
    {
        public const string Pending = "Pending";
        public const string Approved = "Approved";
        public const string Rejected = "Rejected";

        public static string FromEnum(ReviewStatus status) => status switch
        {
            ReviewStatus.Pending => Pending,
            ReviewStatus.Approved => Approved,
            ReviewStatus.Rejected => Rejected,
            _ => Pending
        };

        public static ReviewStatus ToEnum(string status) => status?.ToLower() switch
        {
            "pending" => ReviewStatus.Pending,
            "approved" => ReviewStatus.Approved,
            "rejected" => ReviewStatus.Rejected,
            _ => ReviewStatus.Pending
        };
    }
}
