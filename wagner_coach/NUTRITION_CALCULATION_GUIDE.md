# Nutrition Calculation Guide - Wagner Coach

**This is the official source of truth for all nutrition calculations in the Wagner Coach application.**

All code that calculates nutrition values MUST follow this logic. Any deviation is a bug.

---

## Core Principles

### 1. Base Nutrition Storage
- Base nutrition is stored in the `foods` table per `serving_size` (typically 100g)
- Example: Chicken breast has 165 calories per 100g serving_size

### 2. User Input Flexibility
Users can input quantities in TWO ways:
- **Servings**: "1.5 breasts" (using household_serving_unit)
- **Grams**: "210g" (direct weight)

### 3. Conversion Between Servings ↔ Grams
The backend converts between servings and grams using `household_serving_grams` when available:
- If `household_serving_grams` exists: `grams = servings × household_serving_grams`
- Otherwise: `grams = servings × serving_size`

Example:
```
Food: Chicken Breast
- serving_size: 100 (base nutrition is per 100g)
- serving_unit: 'g'
- household_serving_unit: 'breast'
- household_serving_grams: 140 (one breast weighs 140g)

User enters: "1.5 breasts"
Conversion: 1.5 × 140g = 210g
```

### 4. Nutrition Calculation Formula

**CRITICAL**: `gram_quantity` is the SOURCE OF TRUTH for all nutrition calculations.

```
multiplier = gram_quantity / serving_size
```

Then for each macronutrient:
```
actual_value = base_value × multiplier
```

Example:
```
Food: Chicken Breast (100g serving)
- calories: 165
- protein_g: 31
- serving_size: 100

User quantity: 210g
multiplier = 210 / 100 = 2.1

Calculated nutrition:
- calories: 165 × 2.1 = 346.5
- protein_g: 31 × 2.1 = 65.1
```

### 5. Storage in meal_foods
Nutrition is pre-calculated and stored in `meal_foods` table:
- `serving_quantity`: Number of servings (e.g., 1.5)
- `serving_unit`: Household unit (e.g., 'breast')
- `gram_quantity`: Weight in grams (e.g., 210)
- `last_edited_field`: Which field user last edited ('serving' or 'grams')
- `calories`, `protein_g`, `carbs_g`, etc.: Pre-calculated nutrition values

---

## Critical Fields Reference

### Required Fields
- **serving_size** (number): Base amount for nutrition (e.g., 100)
- **serving_unit** (string): Unit for serving_size (e.g., 'g')

### Optional But Important
- **household_serving_unit** (string): User-friendly name (e.g., 'breast', 'banana', 'scoop')
- **household_serving_grams** (number): Grams per household serving (e.g., 140g for breast)

### All Macronutrients
- calories
- protein_g
- total_carbs_g
- total_fat_g
- dietary_fiber_g
- total_sugars_g
- sodium_mg

---

## Implementation Reference

### Backend (Python)
**Official Implementation**: `app/services/quantity_converter.py`

```python
class FoodQuantityConverter:
    @staticmethod
    def calculate_quantities(
        food_data: Dict[str, Any],
        input_quantity: Decimal,
        input_field: str  # 'serving' or 'grams'
    ) -> Dict[str, Any]:
        """
        Calculate both serving and gram quantities from user input.
        Returns: {serving_quantity, serving_unit, gram_quantity, last_edited_field}
        """
        # Implementation in quantity_converter.py

    @staticmethod
    def calculate_nutrition(
        food_data: Dict[str, Any],
        gram_quantity: Decimal
    ) -> Dict[str, float]:
        """
        Calculate nutrition values based on gram quantity.
        Formula: multiplier = gram_quantity / serving_size
        """
        # Implementation in quantity_converter.py
```

### Frontend (TypeScript)
**Official Implementation**: `lib/utils/food-quantity-converter.ts`

```typescript
class FoodQuantityConverter {
  static calculateQuantities(
    food: FoodEnhanced,
    inputQuantity: number,
    inputField: 'serving' | 'grams'
  ): FoodQuantity {
    // Mirrors backend logic exactly
    // Returns: {servingQuantity, servingUnit, gramQuantity, lastEditedField}
  }

  static calculateNutrition(
    food: FoodEnhanced,
    gramQuantity: number
  ): NutritionValues {
    // CRITICAL: Nutrition ALWAYS calculated from grams
    // Formula: multiplier = gramQuantity / servingSize
  }
}
```

---

## Usage Examples

### Example 1: User enters servings
```typescript
// User enters "1.5 breasts"
const food = {
  serving_size: 100,
  household_serving_grams: 140,
  household_serving_unit: 'breast',
  calories: 165,
  protein_g: 31
}

const quantities = FoodQuantityConverter.calculateQuantities(
  food,
  1.5,
  'serving'
)
// Result: {servingQuantity: 1.5, gramQuantity: 210, ...}

const nutrition = FoodQuantityConverter.calculateNutrition(
  food,
  quantities.gramQuantity
)
// Result: {calories: 346.5, protein_g: 65.1, ...}
```

### Example 2: User enters grams
```typescript
// User enters "210g"
const quantities = FoodQuantityConverter.calculateQuantities(
  food,
  210,
  'grams'
)
// Result: {servingQuantity: 1.5, gramQuantity: 210, ...}

const nutrition = FoodQuantityConverter.calculateNutrition(
  food,
  quantities.gramQuantity
)
// Result: {calories: 346.5, protein_g: 65.1, ...}
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Using serving quantity directly
```typescript
// BAD - doesn't account for household_serving_grams
const multiplier = servingQuantity / serving_size
```

### ❌ WRONG: Hardcoding unit conversions
```typescript
// BAD - database has actual values
const unitToGrams = {
  'slice': 120,  // This might not match the actual food!
  'medium': 118
}
```

### ❌ WRONG: Calculating nutrition from servings
```typescript
// BAD - must use gram_quantity
const calories = baseCalories * servingQuantity
```

### ✅ CORRECT: Always use FoodQuantityConverter
```typescript
// GOOD - Official method
const quantities = FoodQuantityConverter.calculateQuantities(food, input, field)
const nutrition = FoodQuantityConverter.calculateNutrition(food, quantities.gramQuantity)
```

---

## Migration Guide

If you find code that doesn't use `FoodQuantityConverter`, migrate it:

### Frontend
| Old Code | New Code |
|----------|----------|
| `calculateMultiplier()` | `FoodQuantityConverter.calculateQuantities()` |
| `servingsToGrams()` | `FoodQuantityConverter.calculateQuantities(food, servings, 'serving')` |
| `gramsToServings()` | `FoodQuantityConverter.calculateQuantities(food, grams, 'grams')` |
| Manual nutrition calc | `FoodQuantityConverter.calculateNutrition()` |

### Backend
All calculations should use:
- `quantity_converter.py::FoodQuantityConverter.calculate_quantities()`
- `quantity_converter.py::FoodQuantityConverter.calculate_nutrition()`

---

## Testing Checklist

When implementing nutrition calculations, verify:

- [ ] Uses `FoodQuantityConverter` (not custom calculation)
- [ ] Handles both serving and gram inputs
- [ ] Uses `household_serving_grams` when available
- [ ] Calculates nutrition from `gram_quantity` only
- [ ] Formula: `multiplier = gram_quantity / serving_size`
- [ ] Stores both `serving_quantity` and `gram_quantity`
- [ ] Tracks `last_edited_field`

---

## Files Using This Logic

### ✅ Correct Implementations
- `wagner-coach-backend/app/services/quantity_converter.py` ✅
- `wagner-coach-backend/app/services/meal_logging_service_v2.py` ✅
- `wagner-coach-clean/lib/utils/food-quantity-converter.ts` ✅
- `wagner-coach-clean/components/nutrition/DualQuantityEditor.tsx` ✅
- `wagner-coach-clean/components/nutrition/MealBuilder.tsx` ✅ (FIXED)
- `wagner-coach-clean/app/api/nutrition/meals/route.ts` ✅ (FIXED)

### ⚠️ Deprecated Files (Do NOT Use)
- `wagner-coach-clean/lib/utils/serving-conversions.ts` ⚠️ (Deprecated - use FoodQuantityConverter)

---

## Questions?

If you're unsure about a nutrition calculation:
1. Refer to this guide first
2. Check `quantity_converter.py` (backend) or `food-quantity-converter.ts` (frontend)
3. Ask the team - don't guess!

**Remember**: Nutrition calculations affect user health decisions. Get it right. ✨
