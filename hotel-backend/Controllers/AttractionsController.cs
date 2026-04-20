using HotelBackend.Data;
using HotelBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBackend.Controllers
{
    [ApiController]
    [Route("api/attractions")]
    [Authorize]
    public class AttractionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttractionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAttractions()
        {
            var attractions = await _context.Attractions.Where(a => a.IsActive).ToListAsync();
            return Ok(attractions);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAttraction(int id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound(new { message = "Attraction not found" });
            }
            return Ok(attraction);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateAttraction([FromBody] Attraction attraction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            attraction.IsActive = true;
            _context.Attractions.Add(attraction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAttraction), new { id = attraction.Id }, attraction);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateAttraction(int id, [FromBody] Attraction attraction)
        {
            if (id != attraction.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            var existing = await _context.Attractions.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Attraction not found" });
            }

            existing.Name = attraction.Name;
            existing.Description = attraction.Description;
            existing.Location = attraction.Location;
            existing.Address = attraction.Address;
            existing.Latitude = attraction.Latitude;
            existing.Longitude = attraction.Longitude;
            existing.Category = attraction.Category;
            existing.ImageUrl = attraction.ImageUrl;
            existing.DistanceFromHotel = attraction.DistanceFromHotel;
            existing.IsActive = attraction.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAttraction(int id)
        {
            var attraction = await _context.Attractions.FindAsync(id);
            if (attraction == null)
            {
                return NotFound(new { message = "Attraction not found" });
            }

            attraction.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Attraction deactivated" });
        }
    }
}