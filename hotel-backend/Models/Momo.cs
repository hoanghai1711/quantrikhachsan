namespace HotelBackend.Models
{
    public class MomoOptions
    {
        public string MomoApiUrl { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string ReturnUrl { get; set; } = string.Empty;
        public string NotifyUrl { get; set; } = string.Empty;
        public string PartnerCode { get; set; } = string.Empty;
        public string RequestType { get; set; } = "captureMoMoWallet";
    }

    public class CreateMomoPaymentRequest
    {
        public decimal? Amount { get; set; }
        public string? OrderInfo { get; set; }
    }

    public class MomoCreatePaymentResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? PayUrl { get; set; }
        public string? OrderId { get; set; }
        public decimal Amount { get; set; }
        public int InvoiceId { get; set; }
        public string? RawResponse { get; set; }
    }

    public class MomoPaymentResultRequest
    {
        public string? PartnerCode { get; set; }
        public string? AccessKey { get; set; }
        public string? RequestId { get; set; }
        public string? Amount { get; set; }
        public string? OrderId { get; set; }
        public string? OrderInfo { get; set; }
        public string? OrderType { get; set; }
        public string? TransId { get; set; }
        public string? Message { get; set; }
        public string? LocalMessage { get; set; }
        public string? ResponseTime { get; set; }
        public string? ErrorCode { get; set; }
        public string? ResultCode { get; set; }
        public string? PayType { get; set; }
        public string? ExtraData { get; set; }
        public string? Signature { get; set; }
    }

    public class MomoPaymentCallbackResult
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int? InvoiceId { get; set; }
        public string? OrderId { get; set; }
        public string? TransactionId { get; set; }
        public decimal Amount { get; set; }
        public string? ErrorCode { get; set; }
    }
}
