import { describe, it, expect } from 'vitest'
import { calculateTotalItems, filterItemsBySeason, isValidClothingItem } from '../utils/wardrobe'

describe('Digital Wardrobe - Basic Logic', () => {
  it('should calculate total items correctly', () => {
    const items = ['shirt', 'pants', 'jacket', 'shoes']
    expect(calculateTotalItems(items)).toBe(4)
  })

  it('should filter items by season', () => {
    const items = [
      { name: 'T-shirt', season: 'summer' },
      { name: 'Jacket', season: 'autumn' },
      { name: 'Shorts', season: 'summer' },
    ]
    
    const summerItems = filterItemsBySeason(items, 'summer')
    expect(summerItems).toHaveLength(2)
    expect(summerItems[0].name).toBe('T-shirt')
  })

  it('should validate clothing item structure', () => {
    const item = {
      id: 1,
      name: 'Blue Denim Jacket',
      category: 'outerwear',
      season: 'autumn',
      color: 'blue',
      material: 'cotton',
    }
    
    expect(isValidClothingItem(item)).toBe(true)
    expect(item.name).toBe('Blue Denim Jacket')
    expect(item.season).toBe('autumn')
  })
})
