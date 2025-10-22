'use client'

interface FoodItem {
  food_name: string
  serving_size: number
  serving_unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

interface Meal {
  id: string
  meal_type: string
  meal_name: string
  notes?: string
  completed_at?: string | null
  totals: {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  items: FoodItem[]
}

interface MealCardProps {
  meal: Meal
  onComplete: () => void
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '🍽️',
  dinner: '🌙',
  snack: '🍪',
}

export default function MealCard({ meal, onComplete }: MealCardProps) {
  const isCompleted = !!meal.completed_at
  const icon = MEAL_ICONS[meal.meal_type.toLowerCase()] || '🍽️'

  return (
    <div className="bg-iron-dark-gray border border-iron-gray rounded-lg p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h3 className="text-base font-semibold text-iron-white capitalize">
                {meal.meal_type}
              </h3>
              {meal.meal_name && (
                <p className="text-sm text-iron-gray">{meal.meal_name}</p>
              )}
            </div>
          </div>
        </div>

        {isCompleted && (
          <span className="px-2 py-1 rounded text-xs bg-green-900/30 border border-green-700 text-green-300">
            ✓ Complete
          </span>
        )}
      </div>

      {/* Totals Summary */}
      <div className="mb-3 p-3 rounded bg-iron-black border border-iron-gray/30">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-iron-white">
              {meal.totals.calories}
            </div>
            <div className="text-xs text-iron-gray">cal</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {meal.totals.protein_g}g
            </div>
            <div className="text-xs text-iron-gray">protein</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {meal.totals.carbs_g}g
            </div>
            <div className="text-xs text-iron-gray">carbs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-iron-white">
              {meal.totals.fat_g}g
            </div>
            <div className="text-xs text-iron-gray">fat</div>
          </div>
        </div>
      </div>

      {/* Food Items */}
      <div className="space-y-2">
        {meal.items.map((item, idx) => (
          <div
            key={idx}
            className="p-2 rounded bg-iron-black/50 border border-iron-gray/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-iron-white">
                  {item.food_name}
                </p>
                <p className="text-xs text-iron-gray mt-0.5">
                  {item.serving_size} {item.serving_unit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-iron-white">
                  {item.calories} cal
                </p>
                <p className="text-xs text-iron-gray">
                  P: {item.protein_g}g • C: {item.carbs_g}g • F: {item.fat_g}g
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {meal.notes && (
        <div className="mt-3 p-2 rounded bg-iron-black/50 border border-iron-gray/30">
          <p className="text-sm text-iron-gray">{meal.notes}</p>
        </div>
      )}

      {/* Complete Button */}
      {!isCompleted && (
        <button
          onClick={onComplete}
          className="w-full mt-4 py-3 rounded bg-iron-orange text-iron-black font-semibold hover:bg-iron-orange/90 active:scale-95 transition-all"
        >
          Mark Complete
        </button>
      )}

      {isCompleted && (
        <div className="mt-4 text-center text-sm text-green-400">
          Completed {new Date(meal.completed_at!).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
