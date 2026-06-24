
export interface ClothingItem {
  id: number
  name: string
  category: string
  season: string
  color: string
  material: string
}
export function calculateTotalItems(items: any[]): number {
  return items.length
}

export function filterItemsBySeason(items: any[], season: string) {
  return items.filter(item => item.season === season)
}

export function isValidClothingItem(item: any): boolean {
  const requiredProperties = ['id', 'name', 'category']
  return requiredProperties.every(prop => prop in item)
}
