using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/articles")]
    [Authorize]
    public class ArticlesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArticlesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticles()
        {
            var articles = await _context.Articles
                .Include(a => a.Category)
                .Where(a => a.IsActive == true)
                .ToListAsync();
            return Ok(articles);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticle(int id)
        {
            var article = await _context.Articles
                .Include(a => a.Category)
                .FirstOrDefaultAsync(a => a.Id == id);
            if (article == null)
            {
                return NotFound(new { message = "Article not found" });
            }
            return Ok(article);
        }

        [HttpGet("slug/{slug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticleBySlug(string slug)
        {
            var article = await _context.Articles
                .Include(a => a.Category)
                .FirstOrDefaultAsync(a => a.Slug == slug && a.IsActive == true);
            if (article == null)
            {
                return NotFound(new { message = "Article not found" });
            }
            return Ok(article);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateArticle([FromBody] Article article)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (article.IsActive == null)
            {
                article.IsActive = false;
            }

            _context.Articles.Add(article);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateArticle(int id, [FromBody] Article article)
        {
            if (id != article.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            var existing = await _context.Articles.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Article not found" });
            }

            existing.Title = article.Title;
            existing.Content = article.Content;
            existing.AuthorId = article.AuthorId;
            existing.PublishedAt = article.PublishedAt;
            existing.IsActive = article.IsActive;
            existing.Slug = article.Slug;
            existing.ImageUrl = article.ImageUrl;
            existing.CategoryId = article.CategoryId;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article == null)
            {
                return NotFound(new { message = "Article not found" });
            }

            _context.Articles.Remove(article);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Article deleted" });
        }
    }
}