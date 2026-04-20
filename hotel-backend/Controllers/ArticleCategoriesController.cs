using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/article-categories")]
    [Authorize]
    public class ArticleCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ArticleCategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticleCategories()
        {
            var categories = await _context.ArticleCategories.Where(c => c.IsActive == true).ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetArticleCategory(int id)
        {
            var category = await _context.ArticleCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateArticleCategory([FromBody] ArticleCategory category)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            category.IsActive = true;
            _context.ArticleCategories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetArticleCategory), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateArticleCategory(int id, [FromBody] ArticleCategory category)
        {
            if (id != category.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            var existing = await _context.ArticleCategories.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            existing.Name = category.Name;
            existing.IsActive = category.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteArticleCategory(int id)
        {
            var category = await _context.ArticleCategories.FindAsync(id);
            if (category == null)
            {
                return NotFound(new { message = "Category not found" });
            }

            category.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Category deactivated" });
        }
    }
}