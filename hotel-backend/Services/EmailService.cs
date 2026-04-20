using System.Threading.Channels;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task QueueEmailAsync(string to, string subject, string body);
}

public class EmailService : BackgroundService, IEmailService
{
    private readonly Channel<EmailMessage> _emailChannel = Channel.CreateUnbounded<EmailMessage>();

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Implement actual email sending, e.g., using SmtpClient or SendGrid
        Console.WriteLine($"Sending email to {to}: {subject}");
        // For demo, just log
    }

    public async Task QueueEmailAsync(string to, string subject, string body)
    {
        var message = new EmailMessage { To = to, Subject = subject, Body = body };
        await _emailChannel.Writer.WriteAsync(message);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var message = await _emailChannel.Reader.ReadAsync(stoppingToken);
            await SendEmailAsync(message.To, message.Subject, message.Body);
        }
    }
}

public class EmailMessage
{
    public string To { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Body { get; set; } = "";
}